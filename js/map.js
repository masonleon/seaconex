function map(topology, terminals, edges) {

  let margin = {
        top: 100,
        left: 40,
        right: 20,
        bottom: 35
      },
      width = 960 - margin.left - margin.right,
      height = 600 - margin.top - margin.bottom;

  function createMap(selector) {

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

    let path = d3.geoPath()
      .projection(projection);

    let g = svg.append("g");

    // load and display the World
    d3.json(topology)
      .then(function (topology) {

      // load and display the cities
      d3.json(terminals)
        .then(function (data) {

        const ports = g.selectAll("circle")
          .data(data)
          .enter()
          .append("circle")
          .attr("cx", function (d) {
            return projection([d.terminal_lon, d.terminal_lat])[0];
          })
          .attr("cy", function (d) {
            return projection([d.terminal_lon, d.terminal_lat])[1];
          })
          .attr("r", 3)
          // .append("title")
          // .text((d) => d.terminal_port)
          .style("fill", "red")
          .classed('bubble', true);

        // console.log("Is anything else executing?");

        // g.append('line')
        // .style("stroke", "lightgreen")
        // .style("stroke-width", 3)
        // .attr("x1", 71.8257)
        // .attr("y1", 59.2836)
        // .attr("x2", 472.37)
        // .attr("y2", -60.6659);

        g.selectAll("text")
          .data(data)
          .enter()
          .append("text")
          .text(function (d) {
            return d.terminal_port;
          })
          .attr("x", function (d) {
            return projection([d.terminal_lon, d.terminal_lat])[0] + 10;
          })
          .attr("y", function (d) {
            return projection([d.terminal_lon, d.terminal_lat])[1] + 5;
          })
          .classed('port-names', true);
      });

      d3.json(edges)
        .then(function (data) {

          let link = [];

          // Draw paths between ports along the given route
          data.forEach(function (obj) {
            topush = {
              type: "LineString",
              coordinates: obj.coordinates
            }
            link.push(topush)
          });

          g.selectAll("tradeRoutes")
            .data(link)
            .enter()
            .append("path")
            .attr("d", function (d) {
              return path(d)
            })
            .style("fill", "none")
            .style("stroke", "#69b3a2")
            .style("stroke-width", 2);
        });

      g.selectAll("path")
        .data(topojson.feature(topology, topology.objects.countries).features)
        .enter().append("path")
        .attr("d", path);

    });

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

    return map;
  }

  createMap.width = function (value) {
    if (!arguments.length) {
      return width;
    }
    width = value;
    return createMap;
  };

  createMap.height = function (value) {
    if (!arguments.length) {
      return height;
    }
    height = value;
    return createMap;
  };

  return createMap;

};