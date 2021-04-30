/* global D3 */

// Initialize a force directed network vis. Modeled after Mike Bostock's
// Reusable Chart framework https://bost.ocks.org/mike/chart/
function network() {
    // Based on Mike Bostock's margin convention
  // https://bl.ocks.org/mbostock/3019563
  let margin = {
      top: 40,
      left: 40,
      right: 20,
      bottom: 30
    },
    width = 960 - margin.left - margin.right,
    height = 550 - margin.top - margin.bottom,
    // ourBrush = null,
    selectableElements = d3.select(null),
    dispatcher;

  // Create the chart by adding an svg to the div with the id
  // specified by the selector using the given data
  function chart(selector, data) {
    let svg = d3.select(selector)
      .append("svg")
        .attr("height", height)
        .attr('preserveAspectRatio', 'xMidYMid meet') // this will scale your visualization according to the size of its parent element and the page.
        .attr('width', '100%') // this is now required by Chrome to ensure the SVG shows up at all
        .style('background-color', '#ccc') // change the background color to light gray
        .attr('viewBox', [0, 0, width + margin.left + margin.right,
          height + margin.top + margin.bottom].join(' '))
        //  .attr('viewBox', [0, 0, 960, 600].join(' '))
        .style("cursor", "crosshair");

       // //http://www.d3noob.org/2013/01/adding-title-to-your-d3js-graph.html
       // svg.append("text")
       //    .attr("x", (width / 2))
       //    .attr("y", 0 - (margin.top / 2))
       //    .attr("text-anchor", "middle")
       //    .style("font-size", "40px")
       //    .style("text-decoration", "underline")
       //    .text("Ocean Carrier Service Network");
       //
       //  svg.append("text")
       //    .attr("x", (width / 2))
       //    .attr("y", 0 - (margin.top / 2) + 35)
       //    .attr("text-anchor", "middle")
       //    .style("font-size", "20px")
       //    // .style("text-decoration", "underline")
       //    .text("Explore the marine terminal connectivity of publicly posted carrier master service schedules")

    let links = data['network'].get('links')
    let nodes = data['network'].get('nodes')

    let graph = ({
      nodes: nodes,
      links: links
    });

    let lanes = Array.from(new Set(links.map(d => d.lane)))
    let color = d3.scaleOrdinal(lanes, d3.schemeCategory10)

    // console.log(lanes)
    // console.log(graph.nodes);
    // console.log(graph.links);

    let force = d3.forceSimulation(graph.nodes)
      .force("charge",
          d3.forceManyBody()
            .strength(-750))
      .force("link",
          d3.forceLink(graph.links)
            .id(d => d.terminal)
            .distance(100))
      .force('center',
          // d3.forceCenter(width / 2, (height + margin.top + margin.bottom) / 2))
          d3.forceCenter((width + margin.left + margin.right) / 2, (height + margin.top + margin.bottom + 50) / 2))
      .force("x", d3.forceX())
      .force("y", d3.forceY())
      .alphaTarget(1);

    force.on('tick', ticked);

    // Arrowheads for directional links
    svg.append("defs").selectAll("marker")
      .data(lanes)
      .join("marker")
      .attr("id", d => `arrow-${d}`)
      .attr("viewBox", "0 -5 10 10")
      .attr("refX", 15)
      .attr("refY", -0.5)
      .attr("markerWidth", 6)
      .attr("markerHeight", 6)
      .attr("orient", "auto")
      .append("path")
      .attr("fill", color)
      .attr("d", "M0,-5L10,0L0,5");

    let link = svg.append("g")
      .attr("fill", "none")
      .attr("stroke-width", 1.5)
      .selectAll("path")
      .data(graph.links)
      .join("path")
      .attr('class', 'link-edge-network')
      // .attr("d", d => {
      //   console.log([[d.source.x, d.source.y],[d.target.x, d.target.y]])
      //   return d3.line().curve(d3.curveBasis)([[d.source.x, d.source.y],[d.target.x, d.target.y]])
      // })
      .attr("d", d => {
        // console.log([[d.source.x, d.source.y],[d.target.x, d.target.y]])
        return linkArc(d)
      })
      .attr('id', d => `${d.transport_edge_no}`)
      .attr('lane', d => `${d.lane}`)
      .attr('carrier', d => `${d.carrier}`)
      .attr("stroke", d => color(d.lane))
      .attr("marker-end", d => `url(${new URL(`#arrow-${d.lane}`, location)})`)
      .style("opacity", 0.2);

    let node = svg.append("g")
      .selectAll("circle")
      .data(graph.nodes)
      .join("circle")
      .attr('class', 'node-terminal-facility')
      .attr('terminal', d => `${d.terminal}`)
      .attr("r", 5)
      .attr("fill", '#0000FF')
      .on("mouseover", onMouseOver)
      .on("mouseout", onMouseOut)
      .call(
        d3.drag()
          .on("start", dragstarted)
          .on("drag", dragged)
          .on("end", dragended)
      );

    selectableElements = node;

    // console.log(selectableElements.data())

    // console.log(selectableElements.nodes())

    let labels = svg.selectAll("text.label")
      .data(graph.nodes)
      .enter()
      .append("text")
      .attr("class", "label")
      .attr("fill", "black")
      .text(d => {
        return d.terminal;
      });

    let tooltip = d3.select(selector)
      .append("div")
      .attr("class", "tooltip")
      .style('font-size', '10px')
      .style("display", "none");

    function onMouseOver(e, d) {
      d3.select(this)
      .transition()
      .duration(300)
      .attr("r", 12)
      .attr("fill", "red");

      tooltip
        .transition()
        .duration(300)
        .style("display", "inline");

      tooltip
      .html(
          "Terminal: " + d.terminal_name + "<br/>" +
          "Address: " + d.terminal_address
      )
      .style("left", (e.pageX + 10) + "px")
      .style("top",  (e.pageY - 10) + "px" );
    }

    function onMouseOut() {
      d3.select(this)
      .transition()
      .duration(300)
      .attr("r", 4)
      .attr("fill", "blue");

      tooltip.transition()
      .duration(300)
      .style("display", "none");
    }

    svg
      .append("text")
        .attr("x", width-10)
        .attr("y", 50)
        .text("Trade Lanes")
        .attr("text-anchor", "left")
        .style("alignment-baseline", "middle");

    // Add a legend
    var size = 20
    svg.selectAll("legend-squares")
      .data(lanes)
      .enter()
      .append("rect")
        .attr("x", width)
        .attr("y", function(d,i){ return 75 + i*(size+5)})
        .attr("width", size)
        .attr("height", size)
        .style("fill", function(d){ return color(d)})

    // Add one square in the legend for each lane.
    svg.selectAll("legend-text")
      .data(lanes)
      .enter()
      .append("text")
        .attr("x", width + size*1.2)
        .attr("y", function(d,i){ return 75 + i*(size+5) + (size/2)})
        .style("fill", function(d){ return color(d)})
        .text(function(d){
           if(d==='E')
            return 'East';
           return 'West';
          })
        .attr("text-anchor", "left")
        .style("alignment-baseline", "middle")

    // svg.call(brush);

    // // Highlight points when brushed
    // function brush(g) {
    //   const brush = d3.brush() // Create a 2D interactive brush
    //   .on('start brush', highlight) // When the brush starts/continues do...
    //   .on('end', brushEnd) // When the brush ends do...
    //   .extent([
    //     [-margin.left, -margin.bottom],
    //     [width + margin.right, height + margin.top]
    //   ]);

    //   ourBrush = brush;

    //   //set brush constraints to full width
    //   const brushX = d3.scaleLinear()
    //           .domain([0, width])
    //           .rangeRound([0, width]),
    //         brushY = d3.scaleLinear()
    //           .domain([0, height])
    //           .rangeRound([0, height]);

    //   g.call(brush); // Adds the brush to this element

    //   // Highlight the selected circles
    //   function highlight(event, d) {
    //     if (event.selection === null) {
    //       return;
    //     }
    //     const [
    //       [x0, y0],
    //       [x1, y1]
    //     ] = event.selection;

    //     // If within the bounds of the brush, select it
    //     node.classed('selected', d =>
    //         x0 <= brushX.invert(d.x) && brushX.invert(d.x) <= x1 &&
    //         y0 <= brushY.invert(d.y) && brushY.invert(d.y) <= y1
    //     );

    //     // Get the name of our dispatcher's event
    //     let dispatchString = Object.getOwnPropertyNames(dispatcher._)[0];

    //     // Let other charts know about our selection
    //     dispatcher.call(
    //         dispatchString,
    //         this,
    //         svg.selectAll('.selected').data()
    //     );
    //   }

    //   function brushEnd(event, d) {
    //     // We don't want infinite recursion
    //     if (event.sourceEvent !== undefined &&
    //         event.sourceEvent.type !== 'end') {
    //       d3.select(this)
    //         .call(brush.move, null);
    //     }
    //   }
    // }

    function ticked() {
      link.attr("d", linkArc)

      node
        .attr("cx", d =>
            d.x = Math.max(10, Math.min(width - 10, d.x))) // Bounded force layout example from blocks
        .attr("cy", d =>
            d.y = Math.max(10, Math.min(height - 10, d.y)));

      labels.attr("transform", function (d) {
        return "translate(" + (d.x + 17) + "," + (d.y + 5) + ")";
      });
    }

    // Function from Mike Bostock's Mobile patent suits and stackoverflowto generate arc paths for links so they don't collide with each other.
    function linkArc(d) {
      let dx = d.target.x - d.source.x,
          dy = d.target.y - d.source.y,
          dr = Math.sqrt(dx * dx + dy * dy);
       // let dx = d.source.x - d.target.x,
       //     dy = d.source.y - d.target.y,
       //     dr = Math.sqrt(dx * dx + dy * dy);
      if (d.lane === "E") {
        return "M" + d.source.x + "," + d.source.y + "A" + dr + "," + dr + " 0 0,1 " + d.target.x + "," + d.target.y;
      }
      if (d.lane === "W") {
        return "M" + d.target.x + "," + d.target.y + "A" + dr + ","+ dr + " 0 0,1 " + d.source.x + "," + d.source.y;
      }
    }

    function dragstarted(d) {
      if (!d.active) {
        force.alphaTarget(0.3).restart();
      }
      d.subject.fx = d.subject.x;
      d.subject.fy = d.subject.y;
    }

    function dragged(d) {
      d.subject.fx = d.x;
      d.subject.fy = d.y;
    }

    function dragended(d) {
      if (!d.active) {
        force.alphaTarget(0);
      }
      d.subject.fx = null;
      d.subject.fy = null;
    }

    function releasenode(d) {
      d.fx = null;
      d.fy = null;
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

    // only update if data was for a carrier
    if (selectedData.some(e => e.hasOwnProperty('carrier'))){
      // clear all nodes and edges
      chart.clearSelection()

      // show a node if it is serviced by a selected carrier
      selectableElements
        .filter(item => selectedData
          .map(selected =>
              selected.lookup.terminal
          )
          .reduce((prev, curr) =>
              prev.concat(curr), []
          )
          .filter((item, i, arr) =>
              arr.indexOf(item) === i
          )
          .includes(item.terminal)
        )
        .classed('selected', d => d)

      // show an edge if it belongs to a selected carrier's service
      d3.selectAll('.link-edge-network')
        .filter(item => selectedData
            .map(selected =>
                selected.lookup.transport_edge_no
            )
            .reduce((prev, curr) =>
                prev.concat(curr), []
            )
            .filter((item, i, arr) =>
                arr.indexOf(item) === i
            )
            .includes(item.transport_edge_no)
          )
        .style("opacity", 1)
      }
    };

  // Deselect all nodes and edges
  chart.clearSelection = function (_) {
    selectableElements
      // clear all selected nodes
      .classed('selected', false);

    // hide all edges
    d3.selectAll('.link-edge-network')
      .style("opacity", 0.2)
  }

  return chart
}