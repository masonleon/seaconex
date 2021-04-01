function network(){
    let margin = {
        top: 100,
        left: 40,
        right: 20,
        bottom: 35
      },
      width = 960 - margin.left - margin.right,
      height = 600 - margin.top - margin.bottom;

    function node_link(selector){
        var svg = d3.select(selector).append("svg")
                .attr("height", height)
                .attr('preserveAspectRatio', 'xMidYMid meet') // this will scale your visualization according to the size of its parent element and the page.
                .attr('width', width) // this is now required by Chrome to ensure the SVG shows up at all
                .style('background-color', '#ccc') // change the background color to light gray
                .attr('viewBox', [0, 0, width + margin.left + margin.right, height + margin.top + margin.bottom].join(' '));

        var g = svg.append("g");

        d3.json('./data/processed/edges.json').then(function(data) {
            const nodes = {};
            data.forEach(function(link){
                link.source = nodes[link.source] || (nodes[link.source] = {name: link.source});
                link.target = nodes[link.target] || (nodes[link.target] = {name: link.target});
            });

            var force = d3.forceSimulation(nodes)
                        .force("charge", d3.forceManyBody().strength(-1000))
                        .force("link", d3.forceLink(data).distance(200))
                    .force('center', d3.forceCenter(width / 2, height / 2))
                        //.force('collide', d3.forceCollide(25))
                        .force("x", d3.forceX())
                        .force("y", d3.forceY())
                        .alphaTarget(1)
                    .on('tick', ticked);
            
            var link = g.selectAll(".link")
                            .data(force.links())
                          .enter().append("line")
                            .attr("class", "link");

            var node = g.selectAll(".node")
                            .data(force.nodes())
                          .enter()
                            .attr("class", "node")
                            .on("mouseover", mouseover)
                            .on("mouseout", mouseout)
                            .call(force.drag);

            node.append("circle")
                    .attr("r", 8);
            
        });

        function tick() {
            link
                .attr("x1", function(d) { return d.source.x; })
                .attr("y1", function(d) { return d.source.y; })
                .attr("x2", function(d) { return d.target.x; })
                .attr("y2", function(d) { return d.target.y; });
          
            node
                .attr("transform", function(d) { return "translate(" + d.x + "," + d.y + ")"; });
          }
        
        return node_link;
        
    }

    return node_link
}