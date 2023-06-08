/* global D3 */
// adapted from https://neu-cs-7250-s21-staff.github.io/Assignment--Brushing_and_Linking--Solution/

// Initialize a vessel filter. Modeled after Mike Bostock's
// Reusable Chart framework https://bost.ocks.org/mike/chart/
function vesselTable() {

  let selectableElements = d3.select(null),
      dispatcher;

  function chart(selector, data) {

    let svg = d3.select(selector)

    // svg
      .append('table')

      // .attr('preserveAspectRatio', 'xMidYMid meet')
      // .attr('viewBox', [0, 0, width + margin.left + margin.right,
      //   height + margin.top + margin.bottom].join(' '))
      // .classed('svg-content', true)
      // .style("cursor", "crosshair");
      
      .classed('table', true)
      .classed('table-striped', true)

      .classed('text-unselectable', true);

    // Add table head and body elements
    let thead = svg.append('thead');
    let tbody = svg.append('tbody');

    // let columns = [
    //   "vessel_imo",
    //   "vessel_name",
    //   "vessel_mmsi",
    //   "vessel_call_sign",
    //   "vessel_build_year",
    //   "vessel_gross_tonnage",
    //   "vessel_type",
    //   "vessel_flag_country",
    //   "vessel_capacity_teu",
    //   "vessel_capacity_vehicle_units",
    //   "vessel_stern_ramp_capacity_tons",
    //   "carrier",
    //   "service"
    // ]
    let columns = Object.keys(data['vessels'][0])

    let headerFields = [
      "IMO",
      "Name",
      "MMSI",
      "Call Sign",
      "Build Yr.",
      "Gross Tonnage (GT)",
      "Type",
      "Flag",
      "Cargo Capacity (TEU)",
      "Cargo Capacity (CEU)",
      "Stern Ramp Capacity (Tons)",
      "Carrier Operator",
      "Carrier Service"
    ]

    thead
      .append('tr')
      .selectAll('th')
      .data(headerFields)
      .enter()
      .append('th')
      .text(d => 
        `${d}`);

    // Make one row (tr) for each line in data
    let rows = tbody.selectAll('tr')
      .data(data['vessels'])
      .enter()
      .append('tr')
      .attr('class', 'hidden')

    // Cells code: http://bl.ocks.org/ndobie/336055eed95f62350ec3
    // Create the cells for the data
    let cells = rows.selectAll('td')
      .data(row => {
        return columns.map((d, i) => {
          return {
            i: d,
            value: row[d]
          };
        });
      })
      .enter()
      .append('td')
      .html(d => 
        `${d.value}`);

    selectableElements = rows;

    // https://neu-cs-7250-s21-staff.github.io/Assignment--Brushing_and_Linking--Solution/
    // Figure out brushing-like behavior using mousedown,
    // mouseover, mouseout, and mouseup events
    let currentlyBrushing = false,
        startIndex = null,
        endIndex = null;

    selectableElements
      .on('mousedown', mouseDown)
      .on('mouseover', mouseOver)
      .on('mouseout', mouseOut)
      .on('mouseup', mouseUp);

    function mouseDown(event, d) {
      startIndex = getElementIndex(this);
      currentlyBrushing = true;

      // Deselect everything
      selectableElements
        .classed('selected', false);

      selectElements([this]);
    }

    function mouseOver(event, d) {
      if (currentlyBrushing) {
        endIndex = getElementIndex(this);
        let e = getElementsInRange(startIndex, endIndex);
        selectElements(e);

        // console.log(selectableElements.filter('.selected').data())
      }

      selectableElements
        .classed('mouseover', false);

      d3.select(this)
        .classed('mouseover', true);
    }

    function mouseOut(event, d) {
      d3.select(this)
        .classed('mouseover', false);
    }

    function mouseUp(event, d) {
      if (currentlyBrushing) {
        endIndex = getElementIndex(this);
        let e = getElementsInRange(startIndex, endIndex);
        selectElements(e);
      }

      selectableElements
        .classed('mouseover', false);

      d3.select(this)
        .classed('mouseover', true);

      currentlyBrushing = false;
      startIndex = null;
      endIndex = null;
    }

    function getElementIndex(element) {
      const e = selectableElements.nodes(),
            i = e.indexOf(element);
      return i;
    }

    // Inclusive range [start, stop]
    function getElementsInRange(start, stop) {
      // If we brushed up instead of down swap them for slice
      if (start > stop) {
        let tmp = start;
        start = stop;
        stop = tmp;
      }

      return selectableElements
              .nodes()
              .slice(start, stop + 1);
    }

    function selectElements(elements) {
      selectableElements
        .classed('selected', function (d) {
          return elements.includes(this);
        });

      // Get the name of our dispatcher's event
      let dispatchString = Object.getOwnPropertyNames(dispatcher._)[0];

      let selectedVesselArr = Array.from(
          new Set(
              svg
                .selectAll('.selected')
                .data()
                .map(d => 
                  d.vessel_mmsi)
          )
      )

      let result = []

      selectedVesselArr
        .map(vessel_mmsi => {
          let lookup_record = data
            .api_callback_lookup
            .vessel_mmsi
            .find(record =>
              record.vessel_mmsi === vessel_mmsi
            )

          result.push(lookup_record)
        })

      // Let other charts know about our selection
      dispatcher.call(
        dispatchString,
        this,
        result
      );
    }

    return chart;
  }

  // Gets or sets the dispatcher we use for selection events
  chart.selectionDispatcher = function (_) {
    if (!arguments.length) return dispatcher;
    dispatcher = _;
    return chart;
  };

  // Given selected data from another visualization
  // select the relevant elements here (linking)
  chart.updateSelection = function (selectedData) {
    if (!arguments.length) return;

    // console.log(selectedData)

    // only update if data was for a carrier
    if (selectedData.some(e => e.hasOwnProperty('carrier'))){
      // clear all vessels
      chart.clearSelection()

      // show a vessel if it is operated by a selected carrier
      selectableElements
        .filter(item => selectedData
          .map(selected =>
            selected.lookup.vessel_mmsi
          )
          .reduce((prev, curr) =>
            prev.concat(curr), []
          )
          .filter((item, i, arr) =>
            arr.indexOf(item) === i
          )
          .includes(item.vessel_mmsi)
        )
        .classed('visible', d => d);
    }
  };

  // Deselect all vessels
  chart.clearSelection = function (_) {
    selectableElements
      // clear all selected vessels
      .classed('selected', false)
      // hide all vessels
      .classed('visible', false)
      .classed('hidden', true);
  }

  return chart;
}