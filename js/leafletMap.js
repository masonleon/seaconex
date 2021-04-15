function leafletMap() {

  let margin = {
    top: 100,
    left: 40,
    right: 20,
    bottom: 35
  };

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

    // Use Leaflets projection API for drawing svg path (creates a stream of projected points)
    let projectPoint = function(x, y) {
      let point = map
        .latLngToLayerPoint(new L.LatLng(y, x));
      this.stream.point(point.x, point.y);
    }

    // Use d3's custom geo transform method to implement the above
    let projection = d3
      .geoTransform({
        point: projectPoint
      });

    // creates geopath from projected points (SVG)
    let pathCreator = d3
      .geoPath()
      .projection(projection);


    let terminals = g.selectAll("circle")
      .data(data['terminals'].features)
      .enter()
          .append('circle')
            .attr('class', 'point-terminal-facility')
            .attr('id', d => `${d.properties.terminal}`)
            .attr("cx", d => map.latLngToLayerPoint([d.geometry.coordinates[1],d.geometry.coordinates[0]]).x)
            .attr("cy", d => map.latLngToLayerPoint([d.geometry.coordinates[1],d.geometry.coordinates[0]]).y) 
            .attr("r", 5)

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

    console.log(color(vesselNames))


    let trajectories = g.selectAll('path')
      .data(data['timestamped_trajectory'].features)
      .enter()
      .append("path")
      .attr("d", pathCreator)
      .style("fill", "none")
      .style("stroke", d => color(d.properties.vessel_name))
      .style("stroke-width", 2);

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

    // Function to place svg based on zoom
    // let onZoom = () => terminals.attr('d', pathCreator)
    function onZoom () {
      terminals
      .attr("cx", d => map.latLngToLayerPoint([d.geometry.coordinates[1],d.geometry.coordinates[0]]).x)
      .attr("cy", d => map.latLngToLayerPoint([d.geometry.coordinates[1],d.geometry.coordinates[0]]).y);

      trajectories.attr('d', pathCreator);

      searouteEdges.attr('d', pathCreator);
    }

    // reset whenever svgMap is moved
    map.on('zoomend', onZoom)

    let legend = L
      .control({position: 'bottomright'});

    legend.onAdd = () => {
      let div = d3
        .select(document.createElement("div"))
        .classed('legend', true)
        .text('ICL Vessels Trajectories between ' + dateRange.min + ' - ' + dateRange.max)

      let p = div.selectAll('p')
       .data(vesselNames)
       .enter()
       .append('p')

      p.append('span')
        .classed('legend-item', true)
        .style('background-color', d => color(d));

      p.append('span')
        .text(d => d);

      return div.node();
    };

    legend.addTo(map);
    return chart
  }

  return chart
}