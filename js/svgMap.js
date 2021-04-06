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
      .data(data['master_schedules_terminal_call_info'].features)
      .enter()
        .append("path")
          .attr( "d", pathCreator )
          .attr( "fill", '#ff0000' )
          .style("stroke", "blue")
          .attr('class', 'point-terminal-facility')
          // .attr('class', (d) => {'.'+d.properties.terminal_name})

    let terminal_labels = g.selectAll("text")
      .data(data['master_schedules_terminal_call_info'].features)
      .enter()
        .append("path")
        .append('text')
         .text(function (d) {
              console.log(d.properties.terminal_name)
              return d.properties.terminal_name;
            })
          // .attr( "d", pathCreator )
          // .attr( "fill", '#ff0000' )
          // .style("stroke", "blue")


     // .on("mouseover",function(d) {
     //        console.log("just had a mouseover", d3.select(d));
     //        d3.select(this)
     //          .classed("active",true)
     //      })
     //      .on("mouseout",function(d){
     //        d3.select(this)
     //          .classed("active",false)
     //      })
      // .style("opacity", .3)
      // .append("text")
      //   .text(function (d) {
      //     console.log(d)
      //     return d.properties.terminal_name;
      //   })
      //   // .attr("x", function (d) {
      //   //   return projection([d.terminal_lon, d.terminal_lat])[0] + 10;
      //   // })
      //   // .attr("y", function (d) {
      //   //   return projection([d.terminal_lon, d.terminal_lat])[1] + 5;
      //   // })
      //   .classed('port-names', true);

    // //   // .append("title")
    // //   // .text((d) => d.terminal_port)
    //   .style("fill", "red")
    //   .classed('bubble', true);
    // .append( "path" )
    // .attr( "fill", 'red' )
    // // .attr( "stroke", "#999" )


        // g.selectAll("text")
        //   .data(data['master_schedules_terminal_call_info'].features)
        //   .enter()
        //   .append("text")
        //   .text(function (d) {
        //     return d.properties.terminal_name;
        //   })
        //   // .attr("x", function (d) {
        //   //   return projection([d.terminal_lon, d.terminal_lat])[0] + 10;
        //   // })
        //   // .attr("y", function (d) {
        //   //   return projection([d.terminal_lon, d.terminal_lat])[1] + 5;
        //   // })
        //   .classed('port-names', true);
      // });


      //     let link = [];
      //
      //     // Draw paths between ports along the given route
      //     data.forEach(function (obj) {
      //       topush = {
      //         type: "LineString",
      //         coordinates: obj.coordinates
      //       }
      //       link.push(topush)
      //     });
      //
      //     g.selectAll("tradeRoutes")
      //       .data(link)
      //       .enter()
      //       .append("path")
      //       .attr("d", function (d) {
      //         return pathCreator(d)
      //       })
      //       .style("fill", "none")
      //       .style("stroke", "#69b3a2")
      //       .style("stroke-width", 2);




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