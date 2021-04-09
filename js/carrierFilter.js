/* global D3 */

// Initialize a carrier filter. Modeled after Mike Bostock's
// Reusable Chart framework https://bost.ocks.org/mike/chart/
function carrierFilter() {

  let selectableElements = d3.select(null),
      dispatcher;

  function chart(selector, data) {

    let filterEl = d3.selectAll(selector)

    filterEl.append('div')
      .attr('id', '#filter-carrier')
      .html(
        `
          <h5>Carriers<h5>
          <br>
        `
      );

    let carrierSelector = filterEl;

    carrierSelector.append('div')
      .selectAll('div')
      .data(data['carriers'])
      .enter()
      .append('div')
        .attr('id', d => `${d.carrier_id}`)
        .attr('class', 'carrier-selector')
        .text(d => `${d.carrier_name}`)
      .append('div')
        .html(d =>
          `
            <img src="/img/logo-${d.carrier_nmfta_code}.png"
                 alt="${d.carrier_nmfta_code}Logo"
                 width="50px"
                 height="auto">
          `
        );

    selectableElements = d3.selectAll('.carrier-selector')

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
      selectableElements.classed('selected', function(d){
        return elements.includes(this);
      });

      // Get the name of our dispatcher's event
      let dispatchString = Object.getOwnPropertyNames(dispatcher._)[0];

      // Let other charts know about our selection
      dispatcher.call(
          dispatchString,
          this,
          carrierSelector.selectAll('.selected').data()
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
    selectableElements
      .classed('selected', d => selectedData.includes(d)
    );

  };

  return chart;
}