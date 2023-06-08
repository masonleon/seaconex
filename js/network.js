/* global D3 */

// Initialize a force directed network vis. Modeled after Mike Bostock's
// Reusable Chart framework https://bost.ocks.org/mike/chart/
function network() {
    // Based on Mike Bostock's margin convention
  // https://bl.ocks.org/mbostock/3019563
  let margin = {
      // top: 40,
      // left: 40,
      // right: 20,
      // bottom: 30
      top: 50,
      left: 50,
      right: 50,
      bottom: 50
    },
    // height = 550 - margin.top - margin.bottom,
    // height = 450 - margin.top - margin.bottom,
    height = 600,

    // height = 100,
    // width = 960 - margin.left - margin.right,
    width = 600,
    // width = 100,
    selectableElements = d3.select(null),
    dispatcher;

  // Create the chart by adding an svg to the div with the id
  // specified by the selector using the given data
  function chart(selector, data) {
    let svg = d3.select(selector)
      .append("svg")
        .attr('preserveAspectRatio', 'xMidYMid meet') // this will scale your visualization according to the size of its parent element and the page.
        // .attr("height", height)
        .attr("height", '100%')
        .attr('width', '100%') // this is now required by Chrome to ensure the SVG shows up at all
        .attr('viewBox', [
            0,
            0,
            width + margin.left + margin.right, //960
            height + margin.top + margin.bottom //600
          ].join(' '))
        .style("cursor", "crosshair")
        .style('background-color', '#ccc'); // change the background color to light gray

    let links = data['network'].get('links')
    let nodes = data['network'].get('nodes')

    let graph = ({
      nodes: nodes,
      links: links
    });

    let lanes = Array.from(new Set(links.map(d => d.lane)))
    let color = d3.scaleOrdinal(lanes, d3.schemeCategory10)

    let force = d3.forceSimulation(graph.nodes)
      .force("charge",
        d3.forceManyBody()
          .strength(-650)
      )
      .force("link",
        d3.forceLink(graph.links)
          .id(d => 
            d.terminal)
          .distance(100)
          .strength(1)
          .iterations(50)
      )
      .force('center',
        d3.forceCenter(
          //  (width / 2)
          (width + margin.left + margin.right) / 2,
          (height + margin.top + margin.bottom) / 2
          // (height + margin.top + margin.bottom + 50) / 2
        )
        )
      .force("x", d3.forceX())
      .force("y", d3.forceY())
      .alphaTarget(0.3);

    force.on('tick', ticked);

    // Arrowheads for directional links
    svg.append("defs")
      .selectAll("marker")
      .data(lanes)
      .join("marker")
        .attr("id", d =>
          `arrow-${d}`)
        .attr("viewBox", "0 -5 10 10")
        .attr("refX", 15)
        .attr("refY", -0.5)
        .attr("markerWidth", 7)
        .attr("markerHeight", 7)
        .attr("orient", "auto")
      .append("path")
        .attr("fill", color)
        .attr("d", "M0,-5L10,0L0,5");

    let link = svg.append("g")
      .attr("fill", "none")
      .attr("stroke-width", 2)
      .selectAll("path")
      .data(graph.links)
      .join("path")
        .attr('class', 'link-edge-network')
        .attr("d", d => {
          // console.log([[d.source.x, d.source.y],[d.target.x, d.target.y]])
          // return d3.line().curve(d3.curveBasis)([[d.source.x, d.source.y],[d.target.x, d.target.y]])
          return linkArc(d)
        })
        .attr('id', d =>
          `${d.transport_edge_no}`)
        .attr('lane', d =>
          `${d.lane}`)
        .attr('carrier', d =>
          `${d.carrier}`)
        .attr("stroke", d =>
          color(d.lane))
        .attr("marker-end", d =>
          `url(${new URL(`#arrow-${d.lane}`, location)})`)

    let node = svg.append("g")
      .selectAll("circle")
      .data(graph.nodes)
      .join("circle")
        .attr('class', 'node-terminal-facility')
        .attr('terminal', d =>
          `${d.terminal}`)
        .attr("r", 8)
        .call(
          d3.drag()
            .on("start", dragstarted)
            .on("drag", dragged)
            .on("end", dragended)
        );

    selectableElements = node;

    selectableElements
      .on("mouseover", mouseOver)
      .on("mouseout", mouseOut);

    let labels = svg.selectAll("text")
      .data(graph.nodes)
      .enter()
      .append("text")
        .attr("class", "node-terminal-facility-label")
        .text(d =>
          `${d.terminal}`
        );

    let tooltip = d3.select(selector)
      .append("div")
        .attr("class", "node-terminal-facility-tooltip")

    function mouseOver(event, d) {
      d3.select(this)
        .classed('mouseover', true)
        .transition()
        .duration(300)
          .attr("r", 15)

      selectElement(d3.select(this));

      tooltip
        .html(
          "Terminal: " + d.terminal_name + "<br/>" +
          "Address: " + d.terminal_address
        )
        .style("left", (event.pageX + 10) + "px")
        .style("top",  (event.pageY - 10) + "px" )
        .style("display", "block")
      // .style("display", "inline");
    }

    function mouseOut(event, d) {
      d3.select(this)
        .classed('mouseover', false)
        .transition()
        .duration(300)
          .attr("r", 8)

      tooltip
        .style("display", "none")
    }

    svg.append("text")
      // .attr("class", "vis-network-legend")
      .attr("x", width - 10)
      .attr("y", 50)
      .attr("text-anchor", "left")
      .text("Trade Lanes")
      .style("alignment-baseline", "middle");

    // Add a legend
    let size = 20

    svg.selectAll("legend-squares")
      .data(lanes)
      .enter()
      .append("rect")
        .attr("x", width)
        .attr("y", function(d,i){ 
          return 75 + i * (size + 5)
        })
        .attr("width", size)
        .attr("height", size)
        .style("fill", function(d){ 
          return color(d)
        })

    // Add one square in the legend for each lane.
    svg.selectAll("legend-text")
      .data(lanes)
      .enter()
      .append("text")
        .attr("x", width + size * 1.2)
        .attr("y", function(d,i){
          return 75 + i * (size + 5) + size / 2
        })
        .text(function(d){
          if ( d === 'E' ) return 'East';
          else return 'West';
        })
        .attr("text-anchor", "left")
        .style("fill", function(d){
          return color(d)
        })
        .style("alignment-baseline", "middle")

    

      // Highlight the selected circles
      function highlight(event, d) {
        // if (event.selection === null) {
        //   return;
        // }

        // const [
        //   [x0, y0],
        //   [x1, y1]
        // ] = event.selection;

        // If within the bounds of the brush, select it
        // node.classed('selected', d =>
        //     x0 <= brushX.invert(d.x) && brushX.invert(d.x) <= x1 &&
        //     y0 <= brushY.invert(d.y) && brushY.invert(d.y) <= y1
        // );

        // Get the name of our dispatcher's event
        let dispatchString = Object.getOwnPropertyNames(dispatcher._)[0];

        // Let other charts know about our selection
        // dispatcher.call(
        //     dispatchString,
        //     this,
        //     svg.selectAll('.selected').data()
        // );
      }

      function selectElement(element) {
  
        // Get the name of our dispatcher's event
        let dispatchString = Object.getOwnPropertyNames(dispatcher._)[0];

        let selectedTerminalArr = Array.from(
          new Set(
            element
              .data()
                .map(d =>
                  d.terminal)
          )
        )
        // console.log(selectedTerminalArr)
  
        let result = [];
  
        selectedTerminalArr
          .map(terminal => {
            let lookup_record = data
              .api_callback_lookup
              .terminal
                .find(record =>
                    record.terminal === terminal)
  
            result.push(lookup_record)
          })

        // console.log(result)
  
        // Let other charts know about our selection
        dispatcher.call(
          dispatchString,
          this,
          result
        );
      }

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
      link
        .attr("d", linkArc)

      node
        .attr("cx", d =>
          d.x = Math.max(10, Math.min(width - 10, d.x))) // Bounded force layout example from blocks
        .attr("cy", d =>
          d.y = Math.max(10, Math.min(height - 10, d.y)));

      labels
        .attr("transform", function (d) {
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
        force.alphaTarget(0.1).restart();
      }
      d.subject.fx = d.x;
      d.subject.fy = d.y;
    }

    function dragged(d) {
      d.subject.fx = d.x;
      d.subject.fy = d.y;
    }

    function dragended(d) {
      if (!d.active) {
        force.alphaTarget(0);
      }
      d.subject.fx = d.x;
      d.subject.fy = d.y;
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
        .classed('selected', true);
      }
    };

  // Deselect all nodes and edges
  chart.clearSelection = function (_) {
    selectableElements
      // clear all selected nodes
      .classed('selected', false);

    // hide all edges
    d3.selectAll('.link-edge-network')
      .classed('selected', false);
  }

  return chart
}