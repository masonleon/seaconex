function table() {

    let margin = {
        top: 60,
        left: 50,
        right: 30,
        bottom: 35
    },
    width = 500 - margin.left - margin.right,
    height = 500 - margin.top - margin.bottom,
    selectableElements = d3.select(null),
    dispatcher;
  
    function table(selector, data) {
        console.log("Building table...")

        let svg = d3.select(selector)
            .append('table')
            .attr('preserveAspectRatio', 'xMidYMid meet')
            .attr('viewBox', [0, 0, width + margin.left + margin.right, height + margin.top + margin.bottom].join(' '))
            .classed('svg-content', true)
            .style("cursor", "crosshair");

        // Add table head and body elements
        svg.append('thead');
        svg.append('tbody');
        thead = svg.select('thead');
        tbody = svg.select('tbody');


        let columns = Object.keys(data['terminals'].features[0].properties)
        svg.select('thead').append('tr')
            .selectAll('th')
            .data(columns)
            .enter()
            .append('th')
            .text(function (column) { return column; });

        // Keeps track of if the user is holding down the mouse or not (used for brushing effect)
        var mouseDown = 0;
            document.body.onmousedown = function() { 
            ++mouseDown;
        }
        document.body.onmouseup = function() {
            --mouseDown;
        }

        // Make one row (tr) for each line in data
        let rows = tbody.selectAll('tr')
            .data(data['terminals']['features'])
            .enter()
            .append('tr')

            // While mousing over the table,
            .on("mouseover", function(d){

                // While the user is holding the mouse down, the selection/not selection is activated
                // (Emulates click and drag)
                if (mouseDown == true){
                    console.log("holding mouse down..");

                    // If this row wasn't selected, then make it selected, and send dispatch to other charts so they select it too.
                    if (d3.select(this).classed("selected") == false){
                        console.log("not selected");
                        d3.select(this).classed('selected', true);
                        console.log("selected");


                        // // Get the name of our dispatcher's event
                        // let dispatchString = Object.getOwnPropertyNames(dispatcher._)[0];

                        // // Let other charts know
                        // dispatcher.call(dispatchString, this, svg.selectAll('.selected').data());
                    }

                    // If this row WAS previously selected, remove it from our selected elements and let everyone know
                    else {
                        d3.select(this)
                            .classed('selected', false);

                    //     // Get the name of our dispatcher's event & send selected data to other charts
                    //     let dispatchString = Object.getOwnPropertyNames(dispatcher._)[0];
                    //     dispatcher.call(dispatchString, this, svg.selectAll('.selected').data());
                    }
                }
            });

        selectableElements = rows;

        // Cells code: http://bl.ocks.org/ndobie/336055eed95f62350ec3
        // Create the cells for the data
        let cells = rows.selectAll('tr')
            .data(function (row) {
                return columns.map(function (column) {
                    return { 
                        column: column, 
                        value: row['properties'][column] };
                });
            })
            .enter()
            .append('td')
            .html(function (d) {
                    return d.value;
            });

        return table;
    }

    // Gets or sets the dispatcher we use for selection events
    table.selectionDispatcher = function (_) {
        if (!arguments.length) return dispatcher;
        console.log("in selection dispatch section");
        dispatcher = _;
        return table;
    };

    // Given selected data from another visualization 
    // select the relevant elements here (linking)
    table.updateSelection = function (selectedData) {

        if (!arguments.length) return;
        // Select an element if its datum was selected
        selectableElements.classed('selected', d =>
            selectedData.includes(d)
        );

    };


    return table;

}