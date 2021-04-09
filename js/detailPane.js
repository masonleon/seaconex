/* global D3 */

// Initialize a line chart. Modeled after Mike Bostock's
// Reusable Chart framework https://bost.ocks.org/mike/chart/
function detailPane() {

  // Based on Mike Bostock's margin convention
  // https://bl.ocks.org/mbostock/3019563
  let margin = {
      top: 60,
      left: 50,
      right: 30,
      bottom: 35
    },
    width = 500 - margin.left - margin.right,
    height = 500 - margin.top - margin.bottom,
    // xValue = d => d[0],
    // yValue = d => d[1],
    xLabelText = '',
    yLabelText = '',
    yLabelOffsetPx = 0,
    // xScale = d3.scalePoint(),
    xScale = d3.scaleBand(),

    yScale = d3.scaleLinear(),
    ourBrush = null,
    // selectableElements = d3.select(null),
    dispatcher;

  // Create the chart by adding an svg to the div with the id
  // specified by the selector using the given data
  function chart(selector, data) {
    let svg = d3.select(selector)
      .append('svg')
        .attr('preserveAspectRatio', 'xMidYMid meet')
        .attr('viewBox', [0, 0, width + margin.left + margin.right, height + margin.top + margin.bottom].join(' '))
        .classed('svg-content', true);

    svg = svg.append('g')
        .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

    // console.log(d3.group(.vessel_type))


     // console.log("data.features:", data.features);
    // let originTerminals = data.features
    //   .filter(feature => feature.id === 'master_schedule')
    //   .map((feature, i) => feature.properties.source_terminal)
    //   .filter ((item, i, ar) => ar.indexOf(item) === i)
    let vesselTypes = data['vessels']
      // .filter(vessel_type => feature.id === 'master_schedule')
      .map((vessel, i) => vessel.vessel_type)
      .filter ((item, i, ar) => ar.indexOf(item) === i)

    console.log(vesselTypes)


    // Define scales
    xScale
      .domain(vesselTypes)
    //   .domain(d3.group(data, xValue).keys())
      .rangeRound([0, width]);

    let vesselsDeployed = d3.count(data['vessels'], d => d)
    console.log(vesselsDeployed)


    yScale
      .domain([
        d3.min(data, d => yValue(d)),
        d3.max(data, d => yValue(d))
      ])
      .rangeRound([height, 0]);

    // X axis
    let xAxis = svg.append('g')
        .attr('transform', 'translate(0,' + (height) + ')')
        .call(d3.axisBottom(xScale));

    // Put X axis tick labels at an angle
    xAxis.selectAll('text')
        .style('text-anchor', 'end')
        .attr('dx', '-.8em')
        .attr('dy', '.15em')
        .attr('transform', 'rotate(-65)');

    // X axis label
    xAxis.append('text')
        .attr('class', 'axisLabel')
        .attr('transform', 'translate(' + (width - 50) + ',-10)')
        .text(xLabelText);

    // Y axis and label
    let yAxis = svg.append('g')
        .call(d3.axisLeft(yScale))
      .append('text')
        .attr('class', 'axisLabel')
        .attr('transform', 'translate(' + yLabelOffsetPx + ', -12)')
        .text(yLabelText);

    // Add the line
    svg.append('path')
        .datum(data)
        .attr('class', 'linePath')
        .attr('d', d3.line()
          // Just add that to have a curve instead of segments
          .x(X)
          .y(Y)
        );

    // Add the points
    let points = svg.append('g')
      .selectAll('.linePoint')
        .data(data);

    points.exit().remove();

    points = points.enter()
      .append('circle')
        .attr('class', 'point linePoint')
      .merge(points)
        .attr('cx', X)
        .attr('cy', Y)
        .attr('r',5);

    selectableElements = points;

    svg.call(brush);

    // Highlight points when brushed
    // function brush(g) {
    //   const brush = d3.brush()
    //     .on('start brush', highlight)
    //     .on('end', brushEnd)
    //     .extent([
    //       [-margin.left, -margin.bottom],
    //       [width + margin.right, height + margin.top]
    //     ]);
    //
    //   ourBrush = brush;
    //
    //   g.call(brush); // Adds the brush to this element
    //
    //   // Highlight the selected circles.
    //   function highlight(event, d) {
    //     if (event.selection === null) return;
    //     const [
    //       [x0, y0],
    //       [x1, y1]
    //     ] = event.selection;
    //     points.classed('selected', d =>
    //       x0 <= X(d) && X(d) <= x1 && y0 <= Y(d) && Y(d) <= y1
    //     );
    //
    //     // Get the name of our dispatcher's event
    //     let dispatchString = Object.getOwnPropertyNames(dispatcher._)[0];
    //
    //     // Let other charts know
    //     dispatcher.call(dispatchString, this, svg.selectAll('.selected').data());
    //   }
    //
    //   function brushEnd(event, d) {
    //     // We don't want infinite recursion
    //     if(event.sourceEvent !== undefined && event.sourceEvent.type!='end'){
    //       d3.select(this).call(brush.move, null);
    //     }
    //   }
    // }

    return chart;
  }

  // The x-accessor from the datum
  // function X(d) {
  //   return xScale(xValue(d));
  // }

  // The y-accessor from the datum
  // function Y(d) {
  //   return yScale(yValue(d));
  // }

  // chart.margin = function (_) {
  //   if (!arguments.length) return margin;
  //   margin = _;
  //   return chart;
  // };

  // chart.width = function (_) {
  //   if (!arguments.length) return width;
  //   width = _;
  //   return chart;
  // };

  // chart.height = function (_) {
  //   if (!arguments.length) return height;
  //   height = _;
  //   return chart;
  // };

  // chart.x = function (_) {
  //   if (!arguments.length) return xValue;
  //   xValue = _;
  //   return chart;
  // };

  // chart.y = function (_) {
  //   if (!arguments.length) return yValue;
  //   yValue = _;
  //   return chart;
  // };

  // chart.xLabel = function (_) {
  //   if (!arguments.length) return xLabelText;
  //   xLabelText = _;
  //   return chart;
  // };

  // chart.yLabel = function (_) {
  //   if (!arguments.length) return yLabelText;
  //   yLabelText = _;
  //   return chart;
  // };

  // chart.yLabelOffset = function (_) {
  //   if (!arguments.length) return yLabelOffsetPx;
  //   yLabelOffsetPx = _;
  //   return chart;
  // };

  // Gets or sets the dispatcher we use for selection events
  // chart.selectionDispatcher = function (_) {
  //   if (!arguments.length) return dispatcher;
  //   dispatcher = _;
  //   return chart;
  // };

  // Given selected data from another visualization
  // select the relevant elements here (linking)
  // chart.updateSelection = function (selectedData) {
  //   if (!arguments.length) return;
  //
  //   // Select an element if its datum was selected
  //   selectableElements.classed('selected', d =>
  //     selectedData.includes(d)
  //   );
  // };

  return chart;
}