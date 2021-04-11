/* global D3 */

// Initialize a force directed network vis. Modeled after Mike Bostock's
// Reusable Chart framework https://bost.ocks.org/mike/chart/
function network() {
    // Based on Mike Bostock's margin convention
  // https://bl.ocks.org/mbostock/3019563
  let margin = {
      top: 100,
      left: 40,
      right: 20,
      bottom: 35
    },
    width = 960 - margin.left - margin.right,
    height = 600 - margin.top - margin.bottom,
    ourBrush = null,
    selectableElements = d3.select(null),
    dispatcher;

  // Create the chart by adding an svg to the div with the id
  // specified by the selector using the given data
  function chart(selector, data) {
    let svg = d3.select(selector)
      .append("svg")
        .attr("height", height)
        .attr('preserveAspectRatio',
            'xMidYMid meet') // this will scale your visualization according to the size of its parent element and the page.
        .attr('width',
            width) // this is now required by Chrome to ensure the SVG shows up at all
        .style('background-color',
            '#ccc') // change the background color to light gray
        .attr('viewBox', [0, 0, width + margin.left + margin.right,
          height + margin.top + margin.bottom].join(' '))
        .style("cursor", "crosshair");

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
            .strength(-300))
      .force("link",
          d3.forceLink(graph.links)
            .id(d => d.terminal)
            .distance(100))
      .force('center',
          d3.forceCenter(width / 2, height / 2))
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
      .attr('id', d => `${d.transport_edge_no}`)
      .attr('lane', d => `${d.lane}`)
      .attr('carrier', d => `${d.carrier}`)
      .attr("stroke", d => color(d.lane))
      .attr("marker-end", d => `url(${new URL(`#arrow-${d.lane}`, location)})`)
      .style("opacity", 0);

    let node = svg.append("g")
      .attr("stroke", "#fff")
      .attr("stroke-width", 1.5)
      .selectAll("circle")
      .data(graph.nodes)
      .join("circle")
      .attr('class', 'node-terminal-facility')
      .attr('terminal', d => `${d.terminal}`)
      .attr("r", 4)
      .attr("fill", '#0000FF')
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

    // node.append("title")
    //   .text(function (d) {
    //     return d.terminal;
    //   });

    svg.call(brush);

    // Highlight points when brushed
    function brush(g) {
      const brush = d3.brush() // Create a 2D interactive brush
      .on('start brush', highlight) // When the brush starts/continues do...
      .on('end', brushEnd) // When the brush ends do...
      .extent([
        [-margin.left, -margin.bottom],
        [width + margin.right, height + margin.top]
      ]);

      ourBrush = brush;

      //set brush constraints to full width
      const brushX = d3.scaleLinear()
              .domain([0, width])
              .rangeRound([0, width]),
            brushY = d3.scaleLinear()
              .domain([0, height])
              .rangeRound([0, height]);

      g.call(brush); // Adds the brush to this element

      // Highlight the selected circles
      function highlight(event, d) {
        if (event.selection === null) {
          return;
        }
        const [
          [x0, y0],
          [x1, y1]
        ] = event.selection;

        // console.log('selected', node)

        // If within the bounds of the brush, select it
        node.classed('selected', d =>
            x0 <= brushX.invert(d.x) && brushX.invert(d.x) <= x1 &&
            y0 <= brushY.invert(d.y) && brushY.invert(d.y) <= y1
        );

        // Get the name of our dispatcher's event
        let dispatchString = Object.getOwnPropertyNames(dispatcher._)[0];

        // Let other charts know about our selection
        dispatcher.call(
            dispatchString,
            this,
            svg.selectAll('.selected').data()
        );
      }

      function brushEnd(event, d) {
        // We don't want infinite recursion
        if (event.sourceEvent !== undefined &&
            event.sourceEvent.type !== 'end') {
          d3.select(this)
            .call(brush.move, null);
        }
      }
    }

    function ticked() {
      link.attr("d", linkArc);

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
      if (d.lane === "E") {
        return "M" + d.source.x + "," + d.source.y + "A" + dr + "," + dr
            + " 0 0,1 " + d.target.x + "," + d.target.y;
      } else {
        return "M" + d.source.x + "," + d.source.y + "A" + (dr * 0.3) + ","
            + (dr * 0.3) + " 0 0,1 " + d.target.x + "," + d.target.y;
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
    if (!arguments.length) {
      return dispatcher;
    }
    dispatcher = _;
    return chart;
  };

  // Given selected data from another visualization
  // select the relevant elements here (linking)
  chart.updateSelection = function (selectedData) {
    if (!arguments.length) return;

    console.log(selectableElements.data())

    selectableElements
      .filter(item => selectedData
        .map(t => t.terminal)
        .includes(item.terminal)
      )
      .classed('selected', d => d);
// )
    // // Select an element if its datum was selected
    // selectableElements
    //   // .filter(item => selectedData
    //   //   .map(t => t.terminal)
    //   //   .includes(item.terminal))
    //   .classed('selected', d => {
    //     console.log(selected.includes(d.terminal))
    //   });


  };

  return chart
}