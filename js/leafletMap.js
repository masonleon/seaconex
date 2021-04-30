function leafletMap() {

  let margin = {
    top: 30,
    left: 40,
    right: 20,
    bottom: 20
  },
  height = 450 - margin.top - margin.bottom,
  width = 100,
  selectableElements = d3.select(null),
  dispatcher,
  map,
  traj;

  //http://bl.ocks.org/nitaku/047a77e256de17f25e72
  //https://codepen.io/tforward/pen/ZPeZxd?editors=1010
  function chart(selector, data) {

    traj = data['timestamped_trajectory'];

    let container = d3.select(selector)
      .style("width", width + '%')
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
      collapsed:true
    };

    //https://gis.stackexchange.com/questions/64385/making-leaflet-control-open-by-default
    let layerControl = L.control
      .layers(
        baseMaps,
        overlayMaps,
        controlOptions
      )
      .addTo(map);

    L.svg({
        clickable: true
      })
      .addTo(map);

    let overlay = d3
      .select(map
        .getPanes()
        .overlayPane
      );

    let svg = overlay.select('svg')
      .attr("pointer-events", "auto");

    let g = svg.append('g')
      .attr('class', 'leaflet-zoom-hide');

    let tooltip = d3.select(selector)
      .append("div")
      .attr("class", "tooltip")
      .style('font-size', '10px')
      .style("opacity", 0);

    // Use Leaflets projection API for drawing svg path (creates a stream of projected points)
    let projectPoint = function(x, y) {
      let point = map
        .latLngToLayerPoint(new L.LatLng(y, x));
      this.stream.point(point.x, point.y);
    }

    let projection = d3
      .geoTransform({
        point: projectPoint
    });

    let pathCreator = d3
      .geoPath()
      .projection(projection);    

    // let geojsonMarkerOptions = {
    //     radius: 6,
    //     fillColor: "red",
    //     color: "#000",
    //     weight: 1,
    //     opacity: 1,
    //     fillOpacity: 0.8
    // };
    
    // let terminals = L.geoJSON(data['terminals'].features, {
    //     pointToLayer: function (feature, latlng) {
    //       console.log(feature);
    //         circleMarker = L.circleMarker(latlng, geojsonMarkerOptions);
    //         circleMarker.bindTooltip(feature.properties.terminal_name);
    //         // circleMarker.on('mouseover', function (e) {
    //         //     this.openPopup();
    //         // });
    //         // circleMarker.on('mouseout', function (e) {
    //         //     this.closePopup();
    //         // });
    //         return circleMarker;
    //     }
    // }).addTo(map);

    let terminals = g.selectAll("circle")
      .data(data['terminals'].features)
      .enter()
        .append('circle')
          .style("stroke", '#000')
          .style("stroke-width", 1)
          .attr('class', 'point-terminal-facility')
          .attr('id', d => `${d.properties.terminal}`)
          .attr("cx", d => map.latLngToLayerPoint([d.geometry.coordinates[1],d.geometry.coordinates[0]]).x)
          .attr("cy", d => map.latLngToLayerPoint([d.geometry.coordinates[1],d.geometry.coordinates[0]]).y)
          .attr("r", 5)
          .attr("fill", "red");
        // .on("mouseover", onMouseOver)
        // .on("mouseout", onMouseOut);

    selectableElements = terminals;

  //   let myStyle = {
  //     "color": "red",
  //     "opacity": 0.65,
  //     "stroke-width": 1
  // };

    let searouteEdges = g.selectAll('link')
      .data(data['searoute_edges'].features)
      .enter()
        .append("path")
        .attr("d", pathCreator)
        .attr('class', 'link-edge-searoute')
        .attr('id', d => `${d.properties.route_name}`)
        .attr('stroke', 'red')
        // .attr('marker-end', 'url(#end)')
        .attr('fill', 'none')
        .style("opacity", 0);

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
    //     .text('Vessel Trajectories between ' + dateRange.min + ' - ' + dateRange.max)
    //
    //   let p = div.selectAll('p')
    //    .data(vesselNames)
    //    .enter()
    //    .append('p')
    //
    //   p.append('span')
    //     .classed('legend-item', true)
    //     .style('background-color', d => color(d));
    //
    //   p.append('span')
    //     .text(d => d);
    //
    //   return div.node();
    // };
    //
    // legend.addTo(map);

    // legend.style("display", "none");

    function onZoom () {
      terminals
        .attr("cx", d =>
            map.latLngToLayerPoint(
                [d.geometry.coordinates[1],d.geometry.coordinates[0]]
            ).x
        )
        .attr("cy", d =>
            map.latLngToLayerPoint(
                [d.geometry.coordinates[1],d.geometry.coordinates[0]]
            ).y
        );

      searouteEdges
        .attr('d', pathCreator);
    }

    // reset whenever svgMap is moved
    map.on('zoomend', onZoom)

    return chart;
  }

   // Gets or sets the dispatcher we use for selection events
  chart.selectionDispatcher = function (_) {
    if (!arguments.length) return dispatcher;
    dispatcher = _;
    return chart;
  };

  // Given selected data from another visualization
  // select the relevant elements here (linking)
  chart.updateSelection = function (selectedData) {
    if (!arguments.length) return;

    console.log(selectedData)

    // only update searoute edges if data was for a carrier
    if (selectedData.some(e => e.hasOwnProperty('carrier'))) {
      chart.clearSelection();

      // Select the edges
      d3.selectAll('.link-edge-searoute')
        .filter(item => selectedData
          .map(selected =>
            selected.lookup.transport_edge_no
          )
          .reduce((prev, curr) =>
            prev.concat(curr), []
          )
          .filter((item, i, arr) =>
            arr.indexOf(item) === i
          )
          .includes(item.properties.transport_edge_no)
        )
        .style("opacity", 1)
    }

    if (selectedData.some(e => e.hasOwnProperty('vessel_mmsi'))) {

      let v = selectedData.map(e => e.vessel_mmsi)

      console.log(v)

      let geojson = traj

      geojson.features = geojson.features.filter(item => {
        if(v.includes(item.properties.vessel_mmsi)){
          return item;
        }})


      // let vesselNames = data['timestamped_trajectory'].features
      //   .map((feature, i) =>
      //       feature.properties.vessel_name
      //   )
      //   .filter ((item, i, ar) =>
      //       ar.indexOf(item) === i
      //   );

      // console.log(vesselNames)

      // let dates = data['timestamped_trajectory'].features
      //   .flatMap((c) =>
      //       c.properties.times.map((x) =>
      //           new Date(x))
      //   )

      // let dateRange = {
      //   min : dates[0].toDateString(),
      //   max : dates[dates.length -1].toDateString()
      // }

      let color = d3
        .scaleOrdinal(d3.schemeSet3)
        .domain(v)

      function trajectoryStyle(feature) {
        return {
            stroke: color(feature.properties.vessel_mmsi),
            strokeWidth: 1,
            color: color(feature.properties.vessel_mmsi),
            opacity: 1
            // className:"vessel-trajectories"
        };
      }

      // function onEachFeature(feature){
      //     feature.bindTootlip(feature.properties.vessel_mmsi);
      // }

      let vesselTrajectoriesLayer = L
         .geoJSON(geojson.features, {
              style: trajectoryStyle,
              // onEachFeature: onEachFeature
            }
        ).addTo(map);

      map.fitBounds(vesselTrajectoriesLayer.getBounds());

      // layerControl.addOverlay(vesselTrajectoriesLayer, "Vessel Trajectories");
    }
  };

  // Deselect everything
  chart.clearSelection = function (_) {

    d3.selectAll('.link-edge-searoute')
      .style("opacity", 0);
  }

  return chart;
}