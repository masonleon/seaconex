/* global D3 */

// Initialize a carrier filter. Modeled after Mike Bostock's
// Reusable Chart framework https://bost.ocks.org/mike/chart/
function resetBtn() {
  // let selectableElements = d3.select(null),
  //     dispatcher;

  function button(selector, data) {

    console.log(data)

    let resetBtnParent = document
      .getElementById(selector.slice(1))
      // .parentElement

    let buttonEl = document.createElement('button');
    buttonEl.setAttribute("type", "button");
    buttonEl.setAttribute("id", "clear-all-selections");
    buttonEl.addEventListener('click', function(e) {
      data.forEach(element => element.clearSelection())
      // data.clearSelection();
    })

    let buttonTextEl = document.createElement('span');
    buttonTextEl.innerHTML = "Clear Selected";
    buttonEl.appendChild(buttonTextEl)

    resetBtnParent.appendChild(buttonEl)

    // selectableElements = d3.selectAll('.carrier-selector')

    // Adds an invisible svg over the 'clear selections' button, and then clears selected elements when clicked
    // d3.select("clear-selection-button-div")
    //   .append("svg")
    // d3.select("#clear-all-selections")
    //   .on("click.cfilter", clearSelections)

    // function clearSelections() {
    //   console.log("Clearing selected carriers...");
    //   selectableElements
    //     .classed('selected', false);
    //   selectElements([])
    // }

    // function selectElements(elements){
    //   selectableElements.classed('selected', function(d){
    //     return elements.includes(this);
    //   });

    // Get the name of our dispatcher's event
    //   let dispatchString = Object.getOwnPropertyNames(dispatcher._)[0];

    // Let other charts know about our selection
    //   dispatcher.call(
    //       dispatchString,
    //       this,
    //       result
    //   );
    // }

    return button;
  }

  // // Gets or sets the dispatcher we use for selection events
  // chart.selectionDispatcher = function (_) {
  //   if (!arguments.length) return dispatcher;
  //   dispatcher = _;
  //
  //   return chart;
  // };

  // // Given selected data from another visualization
  // // select the relevant elements here (linking)
  // chart.updateSelection = function (selectedData) {
  //   console.log(arguments)
  //   if (!arguments.length) return;
  //
  //   // Select an element if its datum was selected
  //   // selectableElements
  //   //   .classed('selected', d => selectedData.includes(d)
  //   // );
  //   // console.log(selectedData)
  // };

  return button;
}