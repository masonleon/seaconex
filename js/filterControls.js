/* global D3 */

// Initialize a table. Modeled after Mike Bostock's
// Reusable Chart framework https://bost.ocks.org/mike/chart/
function filterControls() {
  let selectableElements = d3.select(null),
      dispatcher;

  // Create the table by adding an table to the div with the id
  // specified by the selector using the given data
  function chart(selector, data) {

    let filterEl = d3.selectAll(selector)

    filterEl.append('div')
      .attr('id', '#filter-carrier')
      .html('<h5>Carriers<h5>'+
            '<br>'
      )
      .append('form')

    let carrierCheckBoxForm = filterEl
    // .selectAll("form")
      .append('form')

    let carrierCheckBox = carrierCheckBoxForm
      .selectAll("label")
        .data(data['carriers'])
        .enter()
          .append("label")
          .attr('for', d => `${d.carrier_id}`)
          .text(d => `${d.carrier_id}`)

    carrierCheckBox
      .append("input")
      .attr("type", "checkbox")
      .attr("id", d => `filter-carrier-${d.carrier_id}`)
      .attr("value", d => `filter-carrier-${d.carrier_id}`)
      .attr("class", "checkboxes");

      // .append('table')
      //   .classed('table-content', true)
      //   .classed('text-unselectable', true);
    //
    // let thead = tableSel.append('thead'),
    //     tbody = tableSel.append('tbody');

    // Get all the possible columns in case there is a
    // variable number of attributes per row.
    // let columns = [];
    // data.forEach(d =>
    //   Object.keys(d).forEach(k => {
    //     if (!(columns.includes(k))) {
    //       columns.push(k);
    //     };
    //   })
    // );

    // let header = thead.append('tr')
    //   .selectAll('th')
    //     .data(columns)
    //   .enter()
    //   .append('th')
    //     .text(d => d);

    // let rows = tbody.selectAll('tr')
    //     .data(data)
    //   .enter()
    //   .append('tr')
    //     .attr('class', 'dataRow');

    // let cells = rows.selectAll('td')
    //     .data(row => {
    //       return columns.map((d, i) => {
    //         return {
    //           i: d,
    //           value: row[d]
    //         };
    //       });
    //     })
    //   .enter()
    //   .append('td')
    //     .html(d => d.value);

    // selectableElements = rows;

    // Figure out brushing-like behavior using mousedown,
    // mouseover, mouseout, and mouseup events
    // let currentlyBrushing = false,
    //     startIndex = null,
    //     endIndex = null;

    // selectableElements
    //     .on('mousedown', mouseDown)
    //     .on('mouseover', mouseOver)
    //     .on('mouseout', mouseOut)
    //     .on('mouseup', mouseUp);

    // function mouseDown(event, d) {
    //   startIndex = getElementIndex(this);
    //   currentlyBrushing = true;
    //
    //   // Deselect everything
    //   selectableElements.classed('selected', false);
    //
    //   selectElements([this]);
    // }

    // function mouseOver(event, d) {
    //   if (currentlyBrushing) {
    //     endIndex = getElementIndex(this);
    //     let e = getElementsInRange(startIndex, endIndex);
    //     selectElements(e);
    //   }
    //
    //   selectableElements.classed('mouseover', false);
    //   d3.select(this).classed('mouseover', true);
    // }

    // function mouseOut(event, d) {
    //   d3.select(this).classed('mouseover', false);
    // }

    // function mouseUp(event, d) {
    //   if (currentlyBrushing) {
    //     endIndex = getElementIndex(this);
    //     let e = getElementsInRange(startIndex, endIndex);
    //     selectElements(e);
    //   }
    //
    //   selectableElements.classed('mouseover', false);
    //   d3.select(this).classed('mouseover', true);
    //
    //   currentlyBrushing = false;
    //   startIndex = null;
    //   endIndex = null;
    // }

    // function getElementIndex(element){
    //   const e = selectableElements.nodes(),
    //         i = e.indexOf(element);
    //   return i;
    // }

    // Inclusive range [start, stop]
    // function getElementsInRange(start, stop){
    //   // If we brushed up instead of down swap them for slice
    //   if (start > stop){
    //     let tmp = start;
    //     start = stop;
    //     stop = tmp;
    //   }
    //
    //   return selectableElements.nodes().slice(start, stop + 1);
    // }

    // function selectElements(elements){
    //   selectableElements.classed('selected', function(d){
    //     return elements.includes(this);
    //   });
    //
    //   // Get the name of our dispatcher's event
    //   // let dispatchString = Object.getOwnPropertyNames(dispatcher._)[0];
    //
    //   // Let other charts know about our selection
    //   // dispatcher.call(dispatchString, this, tbody.selectAll('.selected').data());
    // }

    return chart;
  };

  // // Gets or sets the dispatcher we use for selection events
  // chart.selectionDispatcher = function (_) {
  //   if (!arguments.length) return dispatcher;
  //   dispatcher = _;
  //   return chart;
  // };

  // // Given selected data from another visualization
  // // select the relevant elements here (linking)
  // chart.updateSelection = function (selectedData) {
  //   if (!arguments.length) return;
  //
  //   // Select an element if its datum was selected
  //   selectableElements.classed('selected', d =>
  //     selectedData.includes(d)
  //   );
  //
  // };

  return chart;
}