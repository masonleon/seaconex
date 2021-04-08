function network() {
  let margin = {
        top: 100,
        left: 40,
        right: 20,
        bottom: 35
      },
      width = 960 - margin.left - margin.right,
      height = 600 - margin.top - margin.bottom;

  function node_link(selector, data) {
    let svg = d3.select(selector)
      .append("svg")
      .attr("height", height)
      .attr('preserveAspectRatio', 'xMidYMid meet') // this will scale your visualization according to the size of its parent element and the page.
      .attr('width', width) // this is now required by Chrome to ensure the SVG shows up at all
      .style('background-color', '#ccc') // change the background color to light gray
      .attr('viewBox', [0, 0, width + margin.left + margin.right, height + margin.top + margin.bottom].join(' '));

     let links = data['master_schedules_edges'].features
      .map(edge => edge.properties)
      .map((
        {
          terminal_call_facility_1: source,
          terminal_call_facility_2: target,
          ...rest
        }
        ) => (
        {
          source,
          target,
          ...rest
        }
      ));

      console.log('links', links)

      let curr_nodes = [];
      let curr_links = [];

      links.forEach(link => {
        // if( curr_nodes.some( node => node['id'] === link.source ) === false ){
        //   curr_nodes.push(
        //     {
        //       id: link.source
        //     }
        //   )
        // }
        curr_links.push(link)
      });

      let nodes = data['terminals'].features
        .map(node => node.properties)
        .map((
          {
            terminal: id,
            ...rest
          }
          ) => (
          {
            id,
            ...rest
          }
        ));


      let graph = ({
        // nodes: curr_nodes,
        nodes: nodes,
        links: curr_links
      });

      let lanes = Array.from(new Set(curr_links.map( d => d.lane)))
      let color = d3.scaleOrdinal(lanes, d3.schemeCategory10)

      console.log(graph.nodes);
      console.log(graph.links);

      let force = d3.forceSimulation(graph.nodes)
          .force("charge", d3.forceManyBody().strength(-400))
          .force("link", d3.forceLink(graph.links).id(d => d.id).distance(200))
          .force('center', d3.forceCenter(width / 2, height / 2))
          .force("x", d3.forceX())
          .force("y", d3.forceY())
          .alphaTarget(1);

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
          .attr("marker-end", d => `url(${new URL(`#arrow-${d.lane}`, location)})`);

      let node = svg.append("g")
        .attr("stroke", "#fff")
        .attr("stroke-width", 1.5)
        .selectAll("circle")
        .data(graph.nodes)
        .join("circle")
          .attr('class', 'node-terminal-facility')
          .attr('id', d => `${d.id}`)

          .attr("r", 4)
          .attr("fill", '#0000FF')
          .call(d3.drag()
          .on("start", dragstarted)
          .on("drag", dragged)
          .on("end", dragended));

        let labels = svg.selectAll("text.label")
          .data(graph.nodes)
          .enter()
            .append("text")
          .attr("class", "label")
          .attr("fill", "black")
          .text(d => {
            console.log(d)
            return d.id;
          });

        node.append("title")
          .text(function (d) {
            return d.id;
          });

       force.on('tick', ticked); 

        function ticked() {
          link.attr("d", linkArc);

          node
            .attr("cx", d => d.x)
            .attr("cy", d => d.y);

          labels.attr("transform", function (d) {
            return "translate(" + (d.x + 17) + "," + (d.y + 5) + ")";
          });
        }

// Function from Mike Bostock's Mobile patent suits and stackoverflowto generate arc paths for links so they don't collide with each other.
        function linkArc(d) {
          var dx = d.target.x - d.source.x,
          dy = d.target.y - d.source.y,
          dr = Math.sqrt(dx * dx + dy * dy);
          if(d.lane == "E") { 
            return "M" + d.source.x + "," + d.source.y + "A" + dr + "," + dr + " 0 0,1 " + d.target.x + "," + d.target.y;
          }
          else {
            return "M" + d.source.x + "," + d.source.y + "A" + (dr * 0.3) + "," + (dr * 0.3) + " 0 0,1 " + d.target.x + "," + d.target.y;
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

    return node_link;
  }

  return node_link
}