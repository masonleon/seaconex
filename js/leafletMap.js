function leafletMap() {

  // const mapLink = '<a href="http://openstreetmap.org">OpenStreetMap</a>';

  let base_layer,
      body,
      height,
      map,
      mbAttr,
      mbUrl,
      width;

  //http://bl.ocks.org/nitaku/047a77e256de17f25e72
  //https://codepen.io/tforward/pen/ZPeZxd?editors=1010
  function chart(selector, data) {
    mbAttr = 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community';
    mbUrl = 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}';

    let container = d3.select('#center-component'),
        width = container.node().getBoundingClientRect().width,
        height = container.node().getBoundingClientRect().height

    console.log(width, height)

    d3.select('#vis-map-2')
      .style("width", width + "px")
      .style("height", height * 2 + "px")

    base_layer = L.tileLayer(mbUrl, {
      id: 'mapbox.streets',
      attribution: mbAttr
    });

    map = L.map("vis-map-2", {
      center: [30, 0],
      zoom: 2,
      layers: [base_layer]
    });

    let svg = d3.select(map.getPanes().overlayPane).append("svg"),
    g = svg.append("g").attr("class", "leaflet-zoom-hide");

    return chart
  }

  return chart
}









