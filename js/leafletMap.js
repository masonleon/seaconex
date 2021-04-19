function leafletMap() {

  let margin = {
    top: 100,
    left: 40,
    right: 20,
    bottom: 35
  },
  selectableElements = d3.select(null);

  let map;

  //http://bl.ocks.org/nitaku/047a77e256de17f25e72
  //https://codepen.io/tforward/pen/ZPeZxd?editors=1010
  function chart(selector, data) {

    // let container = d3.select('#center-component'),
    let container = d3.select('#vis-network'),
        width = 960 - margin.left - margin.right,
        height = 600 - margin.top - margin.bottom
        // width = 960,
        // height = 400

    // console.log('center-component width: ' + width, 'center-component height: ' + height)

    d3.select(selector)
      .style("width", '100%')
      // .style("height", height * 2 + "px")
      .style("height", height + "px")


    let esriWorldImageryLayer = L
      .tileLayer(
        'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
        attribution: 'Esri, Maxar, GeoEye, Earthstar Geographics, CNES/Airbus DS, USDA, USGS, AeroGRID, IGN, and the GIS User Community '
      });

    let noaaEncLayer = L
      .tileLayer(
        'https://tileservice.charts.noaa.gov/tiles/50000_1/{z}/{x}/{y}.png', {
        attribution: 'NOAA'
      });

    map = L
      .map(selector.slice(1), {
        center: [30, 0],
        preferCanvas: true,
        updateWhenZooming: false,
        updateWhenIdle: true,
        zoom: 3,
        layers: [
          esriWorldImageryLayer,
          // noaaEncLayer
        ],
      });

    let baseMaps = {
      // 'Noaa_EncTileService': noaaEncLayer,
      'Esri_WorldImagery': esriWorldImageryLayer,
    };

    let overlayMaps = {
      'Noaa_EncTileService': noaaEncLayer,
      // 'Esri_WorldImagery': esriWorldImageryLayer,
    };

    let controlOptions = {
      collapsed:false
    };

    //https://gis.stackexchange.com/questions/64385/making-leaflet-control-open-by-default
    L.control
      .layers(
        baseMaps,
        overlayMaps,
        controlOptions
      )
      .addTo(map);

    // L.svg({
    //     clickable: true
    //   })
    //   .addTo(map);

    let overlay = d3
      .select(map
        .getPanes()
        .overlayPane
      );

    var tooltip = d3.select(selector)
      .append("div")
      .attr("class", "tooltip")
      .style('font-size', '10px')
      .style("opacity", 0);

    var geojsonMarkerOptions = {
        radius: 6,
        fillColor: "red",
        color: "#000",
        weight: 1,
        opacity: 1,
        fillOpacity: 0.8
    };
    
    let terminals = L.geoJSON(data['terminals'].features, {
        pointToLayer: function (feature, latlng) {
          console.log(feature);
            circleMarker = L.circleMarker(latlng, geojsonMarkerOptions);
            circleMarker.bindTooltip(feature.properties.terminal_name);
            // circleMarker.on('mouseover', function (e) {
            //     this.openPopup();
            // });
            // circleMarker.on('mouseout', function (e) {
            //     this.closePopup();
            // });
            return circleMarker;
        }
    }).addTo(map);


    // let terminals = g.selectAll("circle")
    //   .data(data['terminals'].features)
    //   .enter()
    //       .append('circle')
    //         .style("stroke", '#000')
    //         .style("stroke-width", 1)
    //         .attr('class', 'point-terminal-facility')
    //         .attr('id', d => `${d.properties.terminal}`)
    //         .attr("cx", d => map.latLngToLayerPoint([d.geometry.coordinates[1],d.geometry.coordinates[0]]).x)
    //         .attr("cy", d => map.latLngToLayerPoint([d.geometry.coordinates[1],d.geometry.coordinates[0]]).y) 
    //         .attr("r", 5)
    //         .attr("fill", "red")
    //       .on("mouseover", onMouseOver)
    //       .on("mouseout", onMouseOut);

    selectableElements = terminals;

    let vesselNames = data['timestamped_trajectory'].features
      .map((feature, i) =>
          feature.properties.vessel_name
      )
      .filter ((item, i, ar) =>
          ar.indexOf(item) === i
      )

    console.log(vesselNames)

    let dates = data['timestamped_trajectory'].features
      .flatMap((c) =>
          c.properties.times.map((x) =>
              new Date(x))
      )

    let dateRange = {
      min : dates[0].toDateString(),
      max : dates[dates.length -1].toDateString()
    }

    let color = d3
      .scaleOrdinal(d3.schemeSet3)
      .domain(vesselNames)

    // let trajectories = g.selectAll('path')
    //   .data(data['timestamped_trajectory'].features)
    //   .enter()
    //   .append("path")
    //     .attr("class", "vessel-trajectories")
    //     .attr("d", pathCreator)
    //   .style("fill", "none")
    //   .style("stroke", d => color(d.properties.vessel_name))
    //   .style("stroke-width", 2)
    //   .style("opacity", 0);
    function trajectoryStyle(feature) {
      return {
          stroke: color(feature.properties.vessel_name),
          strokeWidth: 1,
          color: color(feature.properties.vessel_name)
      };
  }

    vesselTrajectoriesLayer = L.geoJSON(data['timestamped_trajectory'].features, {
      style: trajectoryStyle
    }).addTo(map);
    map.fitBounds(vesselTrajectoriesLayer.getBounds());

    var myStyle = {
      "color": "red",
      "opacity": 0.65,
      "stroke-width": 1
  };

  seaRouteEdgesLayer = L.geoJSON(data['searoute_edges'].features, {
      style: myStyle
    }).addTo(map);
    map.fitBounds(seaRouteEdgesLayer.getBounds());

    // let searouteEdges = g.selectAll('link')
    //   .data(data['searoute_edges'].features)
    //   .enter()
    //     .append("path")
    //     .attr("d", pathCreator)
    //     .attr('class', 'link-edge-searoute')
    //     .attr('id', d => `${d.properties.route_name}`)
    //     .attr('stroke', 'red')
    //     // .attr('marker-end', 'url(#end)')
    //     .attr('fill', 'none');

    // function onMouseOver(e, d){
    //   d3.select(this).transition()
    //     .duration(300)
    //     .attr("r", 12)
    //     .attr("fill", "pink");

    //     tooltip.transition()
    //     .duration(300)
    //     .style("opacity", 1);

    //     tooltip.html("Terminal: " + d.terminal_name)
    //     .style("left", (d3.pointer(this)[0] + 10) + "px")     
    //     .style("top",  (d3.pointer(this)[1]) + "px" );
    // }

    // function onMouseOut() {
    //   d3.select(this).transition()
    //   .duration(300)
    //   .attr("r", 5)
    //   .attr("fill", "red");

      // tooltip.transition()
      //   .duration(300)
      //   .style("opacity", 0);
    // }

    // let legend = L
    //   .control({position: 'bottomright'});

    // legend.onAdd = () => {
    //   let div = d3
    //     .select(document.createElement("div"))
    //     .classed('legend', true)
    //     .text('ICL Vessels Trajectories between ' + dateRange.min + ' - ' + dateRange.max)

    //   let p = div.selectAll('p')
    //    .data(vesselNames)
    //    .enter()
    //    .append('p')

    //   p.append('span')
    //     .classed('legend-item', true)
    //     .style('background-color', d => color(d));

    //   p.append('span')
    //     .text(d => d);

    //   return div.node();
    // };

    // legend.addTo(map);

    // legend.style("display", "none");

    return chart;
  }

   // Given selected data from another visualization
  // select the relevant elements here (linking)
  // chart.updateSelection = function (selectedData) {
  //   if (!arguments.length) return;

  //   // console.log(selectableElements.data())
  //   console.log(selectedData)

  //   // Deselect everything
  //   selectableElements
  //     .classed('selected', false);

    // d3.selectAll('.vessel-trajectories')
    //   .style("opacity", 0)


    // // Select a node if its datum was selected
    // selectableElements
    //   .filter(item => selectedData
    //     .map(selected =>
    //         selected.lookup.vessel_name
    //     )
    //     .reduce((prev, curr) =>
    //         prev.concat(curr), []
    //     )
    //     .filter((item, i, arr) =>
    //         arr.indexOf(item) === i
    //     )
    //     .includes(item.vessel_name)
    //   )
    //   .classed('selected', d => d)

    // Select the edges
    // d3.selectAll('.vessel-trajectories')
    //   .filter(item => selectedData
    //       .map(selected =>
    //           selected.lookup.vessel_name
    //       )
    //       .reduce((prev, curr) =>
    //           prev.concat(curr), []
    //       )
    //       .filter((item, i, arr) =>
    //           arr.indexOf(item) === i
    //       )
    //       .includes(item.vessel_name)
    //     )
    //   .style("opacity", 1)
  // };

  return chart;
}