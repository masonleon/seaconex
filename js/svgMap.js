function svgMap() {

  let margin = {
        top: 100,
        left: 40,
        right: 20,
        bottom: 35
      },
      width = 960 - margin.left - margin.right,
      height = 600 - margin.top - margin.bottom;

  function chart(selector, data) {

    let projection = d3.geoMercator()
      .center([-40, 42])
      .scale(470)
      .rotate([0, 0]);

    let svg = d3.select(selector)
      .append("svg")
      .attr("height", height)
      // this will scale your visualization according to the size of its parent element and the page.
      .attr('preserveAspectRatio', 'xMidYMid meet')
      // this is now required by Chrome to ensure the SVG shows up at all
      .attr('width', '100%')
      // change the background color to light gray
      .style('background-color', '#ccc')
      .attr('viewBox',
          [0, 0, width + margin.left + margin.right,
            height + margin.top + margin.bottom].join(' '))

    let pathCreator = d3.geoPath()
      .projection(projection);

    let g = svg.append("g");

    let baseMap = g.selectAll("path")
      .data(
          topojson.feature(
            data['topology_countries-110m'],
            data['topology_countries-110m'].objects.countries
          ).features
      )
      .enter()
        .append("path")
          .attr("d", pathCreator)

    let terminals = g.selectAll("circle")
      .data(data['terminals'].features)
      .enter()
        .append("path")
          .attr( "d", pathCreator)
          .attr('class', 'point-terminal-facility')
          .attr('id', d => `${d.properties.terminal}`)

    // let terminal_labels = g.selectAll("text")
    //   .data(data['master_schedules_terminal_call_info'].features)
    //   .enter()
    //     .append("path")
    //     .append('text')
    //      .text(function (d) {
    //           console.log(d.properties.terminal_name)
    //           return d.properties.terminal_name;
    //         })
          // .attr( "d", pathCreator )
          // .attr( "fill", '#ff0000' )
          // .style("stroke", "blue")

    // // build the arrow.
    // svg.append("svg:defs").selectAll("marker")
    //     .data(["end"])      // Different link/path types can be defined here
    //   .enter().append("svg:marker")    // This section adds in the arrows
    //     .attr("id", String)
    //     .attr("viewBox", "0 -5 10 10")
    //     .attr("refX", 15)
    //     .attr("refY", -1.5)
    //     .attr("markerWidth", 6)
    //     .attr("markerHeight", 6)
    //     .attr("orient", "auto")
    //     .attr('fill', 'green')
    //   .append("svg:path")
    //     .attr("d", "M0,-5L10,0L0,5");

    // paths for idea shortest nautical path from EuroStat searoute
    let searouteEdges = g.selectAll('link')
      .data(data['searoute_edges'].features)
      .enter()
        .append("path")
        .attr("d", pathCreator)
        .attr('class', 'link-edge-searoute')
        .attr('id', d => `${d.properties.route_name}`)
        .attr('stroke', 'red')
        // .attr('marker-end', 'url(#end)')
        .attr('fill', 'none');

    let zoom = d3.zoom()
      .scaleExtent([1, 20])
      .translateExtent([[-500, -700], [1500, 1000]])
      .on('zoom', function (event) {
        g.selectAll('path')
          .attr('transform', event.transform);
        g.selectAll("circle")
          .attr('transform', event.transform);
        g.selectAll("text")
          .attr('transform', event.transform);
        g.selectAll("line")
          .attr('transform', event.transform);
      });

    svg.call(zoom);

    return chart;
  }

  // nodeColor = (d) => {
  //   let nodeTypes = [...new Set(data['searoute_edges'].features.map( d => d.type))];
  //   const scale = d3.scaleOrdinal()
  //     .range(nodeTypes.length==1? ['#616161']:d3.schemeCategory10);
  //   return d => scale(d.type);
  // }

  chart.width = function (value) {
    if (!arguments.length) {
      return width;
    }
    width = value;
    return chart;
  };

  chart.height = function (value) {
    if (!arguments.length) {
      return height;
    }
    height = value;
    return chart;
  };

  return chart;

}