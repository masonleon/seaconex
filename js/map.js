function map() {


    var width = 960,
        height = 500;


    function createMap(selector) {

        var projection = d3.geoMercator()
                .center([0, 0])
                .scale(200)
                .rotate([0,0]);

            var svg = d3.select(selector).append("svg")
                .attr("width", width)
                .attr("height", height);

            var path = d3.geoPath()
                .projection(projection);

            var g = svg.append("g");

            // load and display the World
            d3.json("/data/countries-110m.json").then(function(topology) {

                // load and display the cities
                d3.json('./data/processed/terminal.json').then(function(data) {
                    g.selectAll("circle")
                    .data(data)
                    .enter()
                    .append("circle")
                    .attr("cx", function(d) {
                            return projection([d.terminal_lon, d.terminal_lat])[0];
                    })
                    .attr("cy", function(d) {
                            return projection([d.terminal_lon, d.terminal_lat])[1];
                    })
                    .attr("r", 5)
                    .style("fill", "red");
                });

                g.selectAll("path")
                    .data(topojson.feature(topology, topology.objects.countries).features)
                    .enter().append("path")
                    .attr("d", path);

            });

            var zoom = d3.zoom()
                .scaleExtent([1, 20])
                .on('zoom', function(event) {
                    g.selectAll('path')
                    .attr('transform', event.transform);
                    g.selectAll("circle")
                    .attr('transform', event.transform);
            });

            svg.call(zoom);

            return map;

    }

    createMap.width = function(value) {
        if (!arguments.length) return width;
        width = value;
        return createMap;
      };
    
      createMap.height = function(value) {
        if (!arguments.length) return height;
        height = value;
        return createMap;
      };

    return createMap;


};