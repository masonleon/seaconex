/* global D3 */
// adapted from https://neu-cs-7250-s21-staff.github.io/Assignment--Brushing_and_Linking--Solution/

// Initialize a carrier filter. Modeled after Mike Bostock's
// Reusable Chart framework https://bost.ocks.org/mike/chart/
function vesselTable() {

  let margin = {
        top: 60,
        left: 50,
        right: 30,
        bottom: 35
      },
      // width = 500 - margin.left - margin.right,
      width = 400,
      height = 500 - margin.top - margin.bottom,
      selectableElements = d3.select(null),
      dispatcher;

  function chart(selector, data) {

    // let carrierHdgParent = document
    //   .getElementById(selector.slice(1))
    //   .parentElement
    //
    // let carrierTitle = document
    //   .createElement('div')
    //
    // carrierTitle
    //   .innerHTML =
    //   `
    //   <h3>Vessels<h3>
    //   <hr>
    //   `
    //
    // carrierHdgParent
    //   .insertBefore(carrierTitle, carrierHdgParent.childNodes[0])

    let svg = d3.select(selector)
      .append('table')
      .attr('preserveAspectRatio', 'xMidYMid meet')
      .attr('viewBox', [0, 0, width + margin.left + margin.right,
        height + margin.top + margin.bottom].join(' '))
      .classed('svg-content', true)
      .style("cursor", "crosshair");

    // Add table head and body elements
    let thead = svg.append('thead');
    let tbody = svg.append('tbody');

    // let columns = Object.keys(data['vessels'][0])
    // console.log(columns)
    let columns = [
      // "vessel_imo",
      "vessel_name",
      // "vessel_mmsi",
      // "vessel_call_sign",
      // "vessel_build_year",
      // "vessel_gross_tonnage",
      "vessel_type",
      "vessel_flag_country",
      // "vessel_capacity_teu",
      // "vessel_capacity_vehicle_units",
      // "vessel_stern_ramp_capacity_tons",
      "carrier",
      "service"
    ]


    thead
    // svg.select('thead')
      .append('tr')
      .selectAll('th')
      .data(columns)
      .enter()
      .append('th')
      .text(d => `${d}`);

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
      .html(d => `${d.value}`);

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


    // Adds an invisible svg over the 'clear selections' button, and then clears selected elements when clicked
    d3.select("clear-selection-button-div")
      .append("svg")

    d3.select("#clear-all-selections").on("click.vtable", clearSelections)
    
    function clearSelections() {
      console.log("Clearing table selections....");
      selectableElements.classed('selected', false);
      selectElements([])
    }

    function mouseDown(event, d) {
      startIndex = getElementIndex(this);
      currentlyBrushing = true;

      // Deselect everything
      selectableElements.classed('selected', false);

      selectElements([this]);
    }

    function mouseOver(event, d) {
      if (currentlyBrushing) {
        endIndex = getElementIndex(this);
        let e = getElementsInRange(startIndex, endIndex);
        selectElements(e);
      }

      selectableElements.classed('mouseover', false);
      d3.select(this).classed('mouseover', true);
    }

    function mouseOut(event, d) {
      d3.select(this).classed('mouseover', false);
    }

    function mouseUp(event, d) {
      if (currentlyBrushing) {
        endIndex = getElementIndex(this);
        let e = getElementsInRange(startIndex, endIndex);
        selectElements(e);
      }

      selectableElements.classed('mouseover', false);
      d3.select(this).classed('mouseover', true);

      currentlyBrushing = false;
      startIndex = null;
      endIndex = null;
    }

    function getElementIndex(element){
      const e = selectableElements.nodes(),
            i = e.indexOf(element);
      return i;
    }

     // Inclusive range [start, stop]
    function getElementsInRange(start, stop){
      // If we brushed up instead of down swap them for slice
      if (start > stop){
        let tmp = start;
        start = stop;
        stop = tmp;
      }

      return selectableElements.nodes().slice(start, stop + 1);
    }

    function selectElements(elements){
       // console.log(selectableElements
       //          .selectAll('.selected').data())
      selectableElements.classed('selected', function(d){
        return elements.includes(this);
      });

      // Get the name of our dispatcher's event
      let dispatchString = Object.getOwnPropertyNames(dispatcher._)[0];

      // console.log(svg.data());

      // if (elements.length > 0){
      //   let selectedVesselArr = Array.from(
      //       new Set(
      //           svg
      //             // .selectAll('.selected')
      //             .data()
      //             .map(d => d.vessel_mmsi)
      //       )
      //   )
      //   console.log(selectedVesselArr)

      // }
      // else {
      //   let selectedVesselArr = []
      //   selectableElements
      //     .classed('visible', false)
      //     .classed('hidden', true);
      //   }

      // console.log(selectableElements
      //           .selectAll('.selected'))

      // Let other charts know about our selection
      dispatcher.call(
          dispatchString,
          this,
          tbody.selectAll('.selected').data()
      );
      // dispatcher.call(dispatchString, this, tbody.selectAll('.selected').data().map(x => x.properties).map(r => r.terminal));
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

    // hide all vessels
     selectableElements
      .classed('visible', false)
      .classed('hidden', true);

     // unhide a vessel if its carrier was selected
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

      // Select an element if its datum was selected
      // selectableElements
      //   .classed('selected', d => {
      //     // console.log(d.properties)
      //     // console.log(d.properties)
      //
      //     selectedData.includes(d)
      //   });
  };

   // Deselect everything
  chart.clearSelection = function (_) {

    // hide all vessels
     selectableElements
      .classed('visible', false)
      .classed('hidden', true);

  }

  return chart;
}