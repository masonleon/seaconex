function leafletMap() {

  let map;

  //http://bl.ocks.org/nitaku/047a77e256de17f25e72
  //https://codepen.io/tforward/pen/ZPeZxd?editors=1010
  function chart(selector, data) {

    let container = d3.select('#center-component'),
        width = container.node().getBoundingClientRect().width,
        height = container.node().getBoundingClientRect().height

    console.log('center-component width: ' + width, 'center-component height: ' + height)

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
      zoom: 2,
      layers: [esriWorldImageryLayer, noaaEncLayer]
    });

    //  console.log(data.features.slice(0,100));
    //
    L.svg({clickable:true}).addTo(map);

    let overlay = d3.select(map.getPanes().overlayPane);

    console.log(overlay)
    let svg = overlay
      .select('svg')
      .attr("pointer-events", "auto");

    let g = svg
      .append('g')
      .attr('class', 'leaflet-zoom-hide');

    // // Use Leaflets projection API for drawing svg path (creates a stream of projected points)
    let projectPoint = function(x, y) {
        const point = map.latLngToLayerPoint(new L.LatLng(y, x));
        this.stream.point(point.x, point.y);
    }
    //
    // // Use d3's custom geo transform method to implement the above
    let projection = d3.geoTransform({point: projectPoint});

    // let projection = d3.geoMercator()
    //   .center([-40, 42])
    //   .scale(470)
    //   .rotate([0, 0]);



    // creates geopath from projected points (SVG)
    let path = d3.geoPath().projection(projection) ;

    // g.selectAll('path')
    //   .data(data.features)
    //   .join('path')
    //   .attr('class', 'trajectory')
    //   .attr('d', path)
    //   .style("stroke", "#69b3a2")
    //   .style("stroke-width", 2);

    //
    //  let svg = d3.select(selector)
    // let svg = overlay.select('svg').attr("pointer-events", "auto");
    //  let g = svg.append("g");

     g.selectAll("trajectory")
        .data(data.features)
        .enter()
        .append("path")
        .attr("d", path)
        // .attr("d", function (d) {
        //   return path(d)
        // })
        .style("fill", "none")
        .style("stroke", "#69b3a2")
        .style("stroke-width", 2);


    return chart
  }

  return chart
}









