function network() {
  let margin = {
        top: 100,
        left: 40,
        right: 20,
        bottom: 35
      },
      width = 960 - margin.left - margin.right,
      height = 600 - margin.top - margin.bottom;

  function node_link(selector) {
    var svg = d3.select(selector).append("svg")
    .attr("height", height)
    .attr('preserveAspectRatio',
        'xMidYMid meet') // this will scale your visualization according to the size of its parent element and the page.
    .attr('width',
        width) // this is now required by Chrome to ensure the SVG shows up at all
    .style('background-color',
        '#ccc') // change the background color to light gray
    .attr('viewBox', [0, 0, width + margin.left + margin.right,
      height + margin.top + margin.bottom].join(' '));

    d3.json('./data/processed/edges.json').then(function (data) {

      const curr_nodes = [{id: "PSAP"}, {id: "NCSPA"}, {id: "RDT"},
        {id: "ACOT"}, {id: "DPWS"}];

      graph = ({
        nodes: curr_nodes,
        links: data
      });

      console.log(graph.nodes);
      console.log(graph.links);

      var force = d3.forceSimulation(graph.nodes)
      .force("charge", d3.forceManyBody().strength(-300))
      .force("link", d3.forceLink(graph.links).id(d => d.id).distance(200))
      .force('center', d3.forceCenter(width / 2, height / 2))
      .force("x", d3.forceX())
      .force("y", d3.forceY())
      .alphaTarget(1)
      .on('tick', ticked);

      var link = svg.append("g")
      .attr("stroke", "#999")
      .attr("stroke-opacity", 0.6)
      .selectAll("line")
      .data(graph.links)
      .join("line")
      .attr("stroke-width", d => 3);

      var node = svg.append("g")
      .attr("stroke", "#fff")
      .attr("stroke-width", 1.5)
      .selectAll("circle")
      .data(graph.nodes)
      .join("circle")
      .attr("r", 15)
      .attr("fill", '#0000FF')
      .call(d3.drag()
      .on("start", dragstarted)
      .on("drag", dragged)
      .on("end", dragended));

      var labels = svg.selectAll("text.label")
      .data(graph.nodes)
      .enter().append("text")
      .attr("class", "label")
      .attr("fill", "black")
      .text(function (d) {
        return d.id;
      });

      node.append("title")
      .text(function (d) {
        return d.id;
      });

      function ticked() {
        link
        .attr("x1", function (d) {
          return d.source.x;
        })
        .attr("y1", function (d) {
          return d.source.y;
        })
        .attr("x2", function (d) {
          return d.target.x;
        })
        .attr("y2", function (d) {
          return d.target.y;
        });

        node
        .attr("cx", d => d.x)
        .attr("cy", d => d.y);

        labels.attr("transform", function (d) {
          return "translate(" + (d.x + 17) + "," + (d.y + 5) + ")";
        });
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

      // force.nodes(nodes);
      // force.force("link").links(data);
    });

    return node_link;

  }

  return node_link
}