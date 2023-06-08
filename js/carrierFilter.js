/* global D3 */
// adapted from https://neu-cs-7250-s21-staff.github.io/Assignment--Brushing_and_Linking--Solution/

// Initialize a carrier filter. Modeled after Mike Bostock's
// Reusable Chart framework https://bost.ocks.org/mike/chart/
function carrierFilter() {

  let selectableElements = d3.select(null),
      dispatcher,
      tooltip;

  function chart(selector, data) {
    let carrierSelector = d3.selectAll(selector);

    carrierSelector
      .selectAll('div')
      .data(data['carriers'])
      .enter()
        .append('div')
          .attr('class', 'carrier-selector')
          .attr('carrier', d =>
            `${d.carrier_id}`)
          .attr('alt', d =>
            `${d.carrier_nmfta_code}Logo`)
          .attr('style', d =>
            `background-image: url('./img/logo-${d.carrier_nmfta_code}.svg')`)

    selectableElements = d3.selectAll('.carrier-selector')

     // create a tooltip
    tooltip = d3.select('body')
      .append('div')
        .attr('class', 'carrier-selector-tooltip')

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
      .on('mouseup', mouseUp)
      .on('touchstart', touchStart)
      .on('touchmove', touchMove)
      .on('touchend', touchEnd)

    function mouseDown(event, d) {
      // event.preventDefault();
      startIndex = getElementIndex(this);
      currentlyBrushing = true;

      // Deselect everything
      selectableElements
        .classed('selected', false);

      selectElements([this]);
    }

    function mouseOver(event, d) {
      if (currentlyBrushing) {
        console.log(event)
        endIndex = getElementIndex(this);
        let e = getElementsInRange(startIndex, endIndex);
        selectElements(e);
      }

      selectableElements
        .classed('mouseover', false);

      d3.select(this)
        .classed('mouseover', true);

      tooltip
        .style('left', event.pageX + 18 + 'px')
        .style('top', event.pageY + 18 + 'px')
        .style('display', 'block')
        .html(
          `
            <strong>Carrier: </strong>
            ${d.carrier_name}
            </br>
            <strong>ID: </strong>
            ${d.carrier_id}
            </br>
            <strong>SMDG Code: </strong>
            ${d.carrier_smdg_code !== null ? d.carrier_smdg_code : "N/A"}
            </br>
            <strong>NMFTA Code: </strong>
            ${d.carrier_nmfta_code}
            </br>
            <strong>Website: </strong>
            ${d.carrier_website}
            </br>
            <br>
            <strong>"In-Network" Trade(s): </strong>
            ${
              data
                .api_callback_lookup
                .carrier
                  .find(record => 
                    record.carrier === d.carrier_id)
                  .lookup
                  .trade
                  .join(", ")
            }
            </br>
            <strong>"In-Network" Service(s): </strong>
            ${
              data
                .api_callback_lookup
                .carrier
                  .find(record => 
                    record.carrier === d.carrier_id)
                  .lookup
                  .service
                  .join(", ")
            }
            </br>
          `
        );

      // Optional cursor change on target
      d3.select(event.target)
        .style('cursor', 'pointer');
    }

    function mouseOut(event, d) {
      d3.select(this)
        .classed('mouseover', false);

      // Hide tooltip on mouse out
      tooltip
        .style('display', 'none'); // Hide toolTip

      // Optional cursor change removed
      d3.select(event.target)
        .style('cursor', 'default');
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

    function touchStart(event, d){
      event.preventDefault();

      startIndex = getElementIndex(this);
      currentlyBrushing = true;

      // Deselect everything
      selectableElements
        .classed('mouseover', false);

      selectElements([this]);

      let targetData = d3.select(this)
        .datum()

      tooltip
        .style('left', event.touches[0].pageX + 18 + 'px')
        .style('top', event.touches[0].pageY + 18 + 'px')
        .style('display', 'block')
        .html(
          `
            <strong>Carrier: </strong>
            ${targetData.carrier_name}
            </br>
            <strong>ID: </strong>
            ${targetData.carrier_id}
            </br>
            <strong>SMDG Code: </strong>
            ${targetData.carrier_smdg_code !== null ? targetData.carrier_smdg_code : "N/A"}
            </br>
            <strong>NMFTA Code: </strong>
            ${targetData.carrier_nmfta_code}
            </br>
            <strong>Website: </strong>
            ${targetData.carrier_website}
            </br>
            <br>
            <strong>"In-Network" Trade(s): </strong>
            ${
              data
                .api_callback_lookup
                .carrier
                  .find(record =>
                    record.carrier === targetData.carrier_id)
                  .lookup
                  .trade
                  .join(", ")
            }
            </br>
            <strong>"In-Network" Service(s): </strong>
            ${
              data
                .api_callback_lookup
                .carrier
                  .find(record =>
                    record.carrier === targetData.carrier_id)
                  .lookup
                  .service
                  .join(", ")
            }
            </br>
          `
        );
    }

    function touchMove(event, d) {

      let targetElement = document
        .elementFromPoint(
          event.touches[0].clientX,
          event.touches[0].clientY);

      if (currentlyBrushing) {
        // endIndex = getElementIndex(this);
        endIndex = getElementIndex(targetElement);
        let e = getElementsInRange(startIndex, endIndex);
        // console.log(e)
        selectElements(e);
      }

      selectableElements
        .classed('mouseover', false);

      d3.select(this)
        .classed('mouseover', true);

      let targetData = d3.select(targetElement)
        .datum();

      tooltip
        .style('left', event.touches[0].pageX + 18 + 'px')
        .style('top', event.touches[0].pageY + 18 + 'px')
        .style('display', 'block')
        .html(
          `
            <strong>Carrier: </strong>
            ${targetData.carrier_name}
            </br>
            <strong>ID: </strong>
            ${targetData.carrier_id}
            </br>
            <strong>SMDG Code: </strong>
            ${targetData.carrier_smdg_code !== null ? targetData.carrier_smdg_code : "N/A"}
            </br>
            <strong>NMFTA Code: </strong>
            ${targetData.carrier_nmfta_code}
            </br>
            <strong>Website: </strong>
            ${targetData.carrier_website}
            </br>
            <br>
            <strong>"In-Network" Trade(s): </strong>
            ${
              data
                .api_callback_lookup
                .carrier
                  .find(record =>
                    record.carrier === targetData.carrier_id)
                  .lookup
                  .trade
                  .join(", ")
            }
            </br>
            <strong>"In-Network" Service(s): </strong>
            ${
              data
                .api_callback_lookup
                .carrier
                  .find(record =>
                    record.carrier === targetData.carrier_id)
                  .lookup
                  .service
                  .join(", ")
            }
            </br>
          `
        );

      // Optional cursor change on target
      d3.select(event.target)
        .style('cursor', 'pointer');
    }

    function touchEnd(event, d) {

      // let targetElement = document
      //   .elementFromPoint(
      //     event.touches[0].clientX,
      //     event.touches[0].clientY);

      // if (currentlyBrushing) {
      //   endIndex = getElementIndex(this);
      //   console.log(endIndex)
      //   // endIndex = getElementIndex(targetElement);
      //   let e = getElementsInRange(startIndex, endIndex);
      //   selectElements(e);
      // }

      selectableElements
        .classed('mouseover', false);

      // d3.select(this)
      //   .classed('mouseover', true);

      // d3.select(this)
      //   .classed('mouseover', false);

      // Hide tooltip on mouse out
      tooltip
        .style('display', 'none'); // Hide toolTip
      //
      // // Optional cursor change removed
      // d3.select(event.target)
      //   .style('cursor', 'default');

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

      return selectableElements
              .nodes()
              .slice(start, stop + 1);
    }

    function selectElements(elements){
      selectableElements
        .classed('selected', function(d){
          return elements.includes(this);
        });

      // Get the name of our dispatcher's event
      let dispatchString = Object.getOwnPropertyNames(dispatcher._)[0];

      let selectedCarrierArr = Array.from(
        new Set(
          carrierSelector
            .selectAll('.selected')
            .data()
              .map(d =>
                d.carrier_id)
        )
      )

      let result = [];

      selectedCarrierArr
        .map(carrier => {
          let lookup_record = data
            .api_callback_lookup
            .carrier
              .find(record =>
                  record.carrier === carrier)

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

    // Select an element if its datum was selected
    // selectableElements
    //   .classed('selected', d => selectedData.includes(d));
  };

  // Deselect all carriers
  chart.clearSelection = function (_) {
    selectableElements
      //clear all selected carriers
      .classed('selected', false);

    selectableElements
      .classed('mouseover', false);
  }

  return chart;
}