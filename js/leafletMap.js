function leafletMap() {

  let map;

  //http://bl.ocks.org/nitaku/047a77e256de17f25e72
  //https://codepen.io/tforward/pen/ZPeZxd?editors=1010
  function chart(selector, data) {

    let container = d3.select('#center-component'),
        width = container.node()
          .getBoundingClientRect()
            .width,
        height = container.node()
          .getBoundingClientRect()
            .height

    // console.log('center-component width: ' + width, 'center-component height: ' + height)

    d3.select(selector)
      .style("width", width + "px")
      .style("height", height * 2 + "px")

    let esriWorldImageryLayer = L.tileLayer(
        'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
        attribution: 'Esri, Maxar, GeoEye, Earthstar Geographics, CNES/Airbus DS, USDA, USGS, AeroGRID, IGN, and the GIS User Community '
      });

    let noaaEncLayer = L.tileLayer(
        'https://tileservice.charts.noaa.gov/tiles/50000_1/{z}/{x}/{y}.png', {
        attribution: 'NOAA'
      });

    map = L.map(selector.slice(1), {
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

    L.control
      .layers(baseMaps, overlayMaps)
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
        let point = map.latLngToLayerPoint(new L.LatLng(y, x));
        this.stream.point(point.x, point.y);
    }

    // Use d3's custom geo transform method to implement the above
    let projection = d3.geoTransform({
        point: projectPoint
      });

    // creates geopath from projected points (SVG)
    let pathCreator = d3.geoPath()
      .projection(projection);

    let vesselNames = data.features
      .map((feature, i) => feature.properties.vessel_name)
      .filter ((item, i, ar) => ar.indexOf(item) === i)

    console.log(vesselNames)

    let dates = data.features
      .flatMap((c) => c.properties.times.map((x) => new Date(x)))

    let dateRange = {
      min : dates[0].toDateString(),
      max : dates[dates.length -1].toDateString()
    }

    let color = d3.scaleOrdinal(d3.schemeCategory10)
      .domain(vesselNames)

    console.log(color(vesselNames))

    let trajectories = g.selectAll('path')
      .data(data.features)
      .enter()
      .append("path")
      .attr("d", pathCreator)
      .style("fill", "none")
      .style("stroke", d => color(d.properties.vessel_name))
      .style("stroke-width", 2);

    // Function to place svg based on zoom
    let onZoom = () => trajectories.attr('d', pathCreator)
    // initialize positioning
    onZoom()
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