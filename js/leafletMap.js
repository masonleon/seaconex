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
  layerControl,
  leafletLegend,
  // traj,
  trajectoryLayerGroup,
  trajectoryHashMap = new Map();

  // http://bl.ocks.org/nitaku/047a77e256de17f25e72
  // https://codepen.io/tforward/pen/ZPeZxd?editors=1010
  function chart(selector, data) {
    // deep copy trajectories so they are accessible in chart.updateSelection()
    // https://medium.com/@gamshan001/javascript-deep-copy-for-array-and-object-97e3d4bc401a
    // traj = JSON.parse(
    //   JSON.stringify(data['timestamped_trajectory']));

    let container = d3.select(selector)
      .style("width", width + '%')
      .style("height", height + "px")

    let initL = initLeaflet(selector, data);

    map = initL.map;
    layerControl = initL.layerControl;
    trajectoryLayerGroup = initL.trajectoryLayerGroup;
    leafletLegend = initL.leafletLegend;

    let overlay = d3.select(
      map.getPanes()
        .overlayPane
    );

    let svg = overlay.select('svg')
      .attr("pointer-events", "auto")
      .style("cursor", "crosshair");

    let g = svg.append('g')
      .attr('class', 'leaflet-zoom-hide');

    //TODO add svg to layercontrol
    // layerControl
    //   .addOverlay(overlay, "D3");
    let tooltip = d3.select("body")
      .append("div")
        .attr("class", "point-terminal-selector-tooltip")

    // Use Leaflets projection API for drawing svg path (creates a stream of projected points)
    let projectPoint = function(x, y) {
      let point = map.latLngToLayerPoint(
        new L.LatLng(y, x)
      );

      this
      .stream
      .point(
        point.x,
        point.y
      );
    }

    let projection = d3.geoTransform(
  {
        point: projectPoint
      }
    );

    let pathCreator = d3.geoPath()
      .projection(projection);

    let terminals = initSvgOverlayTerminals(data, g, map);

    selectableElements = terminals;

    selectableElements
      .on("mouseover", mouseOver)
      .on("mouseout", mouseOut);

    let searouteEdges = initSvgOverlaySearouteEdges(data, g, map, pathCreator);

    function mouseOver(event, d){
       d3.select(this)
        .classed('mouseover', true)
        .transition()
        .duration(300)
          .attr("r", 15)

      tooltip
        .style("left", (event.pageX + 10) + "px")
        .style("top",  (event.pageY - 10) + "px")
        .style("display", "block")
        .html(
          `
            <strong>Terminal: </strong>${d.properties.terminal_name}
            </br>
            <strong>Address: </strong>${d.properties.terminal_address}
            </br>     
          `
        );
    }

    function mouseOut(event, d) {
      d3.select(this)
        .classed('mouseover', false)
        .transition()
        .duration(300)
          .attr("r", 8)

      tooltip
        .style("display", "none")
    }

    initCanvasOverlayTrajectory(data, trajectoryHashMap);

    function onZoom () {
      terminals
        .attr("cx", d =>
          map.latLngToLayerPoint(
            [
              d.geometry.coordinates[1],
              d.geometry.coordinates[0]
            ]
          )
          .x
        )
        .attr("cy", d =>
          map.latLngToLayerPoint(
            [
              d.geometry.coordinates[1],
              d.geometry.coordinates[0]
            ]
          )
          .y
        );

      searouteEdges
        .attr('d', pathCreator);
    }

    // reset whenever svgMap is moved
    map.on('zoomend', onZoom)

    return chart;
  }

  const initLeaflet = (selector, data) => {
    let esriWorldImageryLayer = L.tileLayer(
      'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
        {
        attribution: 'Esri, Maxar, GeoEye, Earthstar Geographics, CNES/Airbus DS, USDA, USGS, AeroGRID, IGN, and the GIS User Community '
      }
    );

    let noaaEncLayer = L.tileLayer(
      'https://tileservice.charts.noaa.gov/tiles/50000_1/{z}/{x}/{y}.png',
        {
        attribution: 'NOAA'
      }
    );

    let map = L.map(
      selector.slice(1),
      {
        center: [30, 0],
        preferCanvas: true,
        updateWhenZooming: false,
        updateWhenIdle: true,
        zoom: 3,
        layers: [
          esriWorldImageryLayer,
          // noaaEncLayer
        ],
      }
    );

    let baseMaps = {
      // 'Noaa_EncTileService': noaaEncLayer,
      'Esri_WorldImagery': esriWorldImageryLayer,
    };

    let overlayMaps = {
      'Noaa_EncTileService': noaaEncLayer,
      // 'Esri_WorldImagery': esriWorldImageryLayer,
    };

    //https://gis.stackexchange.com/questions/64385/making-leaflet-control-open-by-default
    let layerControl = L.control
      .layers(
        baseMaps,
        overlayMaps,
        controlOptions = {
          collapsed: false
        }
      )
      .addTo(map);

    L.svg(
      {
        clickable: true
      }
    )
    .addTo(map);

   let trajectoryLayerGroup = L.layerGroup()
    .addTo(map);

   let leafletLegend = L.control(
    {
        position: 'bottomright'
      }
    );

    leafletLegend.onAdd = () => {

      let dates = data['timestamped_trajectory'].features
        .flatMap((c) =>
          c
          .properties
          .times
          .map((x) =>
            new Date(x)
          )
        )

      let dateRange = {
        min : dates[0].toDateString(),
        max : dates[dates.length - 1].toDateString()
      }

      // let div = d3.select(document.createElement("div"))
      //   .classed('legend', true)
      //   // .text(
      //   //   `
      //   //     <u>
      //   //       Vessel Trajectories between <strong>${dateRange.min} - ${dateRange.max}</strong>
      //   //     </u>
      //   //   `
      //   // )
      //   .text(
      //     `
      //     <u>
      //       Vessel Trajectories between <strong>${dateRange.min} - ${dateRange.max}</strong>
      //     </u>
      //     `
      //   )

      // let p = div.selectAll('p')
      //  .data(vesselNames)
      //  .enter()
      //   .append('p')

      // p.append('span')
      //   .classed('legend-item', true)
      //   .style('background-color', d =>
      //     color(d));

      // p.append('span')
      //   .text(d => d);

      // return div.node();

      //https://codepen.io/haakseth/pen/KQbjdO
      let div = L.DomUtil.create("div", "legend");
      div.innerHTML += `
        <h4>Legend</h4>
        <hr>
      `;

      div.innerHTML += `
        <h5>Interactive Map Elements</h5>
        <br>
        <div class="legend-svg-elements" id="legend-svg-elements"></div>
        <hr>
      `;

      div.innerHTML += `
        <h5>
          Vessel Trajectories between <u><strong>${dateRange.min} - ${dateRange.max}</strong></u>
        </h5>
        <br>
        <div class="legend-vessel-trajectories" id="legend-vessel-trajectories"></div>
      `;

      return div
    };
    leafletLegend.addTo(map);
    // leafletLegend.style("display", "none");

    return {
      map: map,
      layerControl: layerControl,
      trajectoryLayerGroup: trajectoryLayerGroup,
      leafletLegend: leafletLegend
    }
  }

  const initSvgOverlayTerminals = (data, g, map) => {
    let terminals = g.selectAll("circle")
      .data(data['terminals'].features)
      .enter()
        .append('circle')
          .attr('class', 'point-terminal-facility')
          .attr('terminal', d =>
            `${d.properties.terminal}`
          )
          .attr("cx", d =>
            map
            .latLngToLayerPoint(
              [
                d.geometry.coordinates[1],
                d.geometry.coordinates[0]
              ]
            )
            .x
          )
          .attr("cy", d =>
            map
            .latLngToLayerPoint(
              [
                d.geometry.coordinates[1],
                d.geometry.coordinates[0]
              ]
            )
            .y
          )
          .attr("r", 8);

    return terminals;
  }

  const initSvgOverlaySearouteEdges = (data, g, map, pathCreator) => {
    let searouteEdges = g.selectAll('link')
      .data(data['searoute_edges'].features)
      .enter()
        .append("path")
          .attr("d", pathCreator)
          .attr('class', 'link-edge-searoute')
          .attr('id', d =>
            `${d.properties.transport_edge_no}`
          );
          // .attr('marker-end', 'url(#end)')

    return searouteEdges;
  }

  const initCanvasOverlayTrajectory = (data, trajectoryHashMap) => {

    let vesselColor = data
      .vessels
      .map(
        (
          {
            vessel_mmsi,
            vessel_name,
            carrier,
            service
          }
        ) => (
          {
            vessel_mmsi,
            vessel_name,
            carrier,
            service
          }
        )
      )

    trajectoryColor = d3.scaleOrdinal(d3.schemeSet3)
      .domain(
        vesselColor
          .map(vessel =>
            vessel.vessel_mmsi
          )
      )

    function trajectoryStyle(feature) {
      return {
        stroke: trajectoryColor(feature.properties.vessel_mmsi),
        strokeWidth: 0.2,
        color: trajectoryColor(feature.properties.vessel_mmsi),
        opacity: 0.8,
        className: 'vessel-trajectory'
        // className: "vessel-trajectory.selected"
        // className: "selected"
      };
    }

    vesselColor
      .forEach(vessel =>
        {
          let trajectory = data
            .timestamped_trajectory
            .features
              .filter(item =>
                item.properties.vessel_mmsi === vessel.vessel_mmsi
              )

          let layer = L.geoJSON(
            trajectory,
            {
              style: trajectoryStyle,
            }
          )

          layer.id = vessel.vessel_mmsi

          trajectoryHashMap
            .set(vessel, layer)
        }
      );
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

    // only update searoute edges if data was for a carrier
    if (selectedData.some(e => e.hasOwnProperty('carrier'))) {
      chart.clearSelection();

      d3.selectAll('.link-edge-searoute')
        .classed('selected', false);

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
        .classed('selected', true);

      d3.selectAll('.point-terminal-facility')
        // clear all selected nodes
        .classed('selected', false);

      d3.selectAll('.point-terminal-facility')
        .filter(item => selectedData
          .map(selected =>
            selected.lookup.terminal
          )
          .reduce((prev, curr) =>
            prev.concat(curr), []
          )
          .filter((item, i, arr) =>
            arr.indexOf(item) === i
          )
          .includes(item.properties.terminal)
        )
        .classed('selected', d => d)
    }

    if (selectedData.some(e => e.hasOwnProperty('vessel_mmsi'))) {
      let selectedMmsi = selectedData.map(e => e.vessel_mmsi)

      removeTrajectories(trajectoryLayerGroup, trajectoryHashMap, selectedMmsi)
      addTrajectories(trajectoryLayerGroup, trajectoryHashMap, selectedMmsi)

      // let dates = data['timestamped_trajectory'].features
      //   .flatMap((c) =>
      //       c.properties.times.map((x) =>
      //           new Date(x))
      //   )

      // let dateRange = {
      //   min : dates[0].toDateString(),
      //   max : dates[dates.length -1].toDateString()
      // }
    }

    if (selectedData.some(e => e.hasOwnProperty('terminal'))) {
      let selectedTerminal = selectedData.map(e => e.terminal)

      d3.selectAll('.point-terminal-facility')
        .data()
        .map(selected => selected.properties)
        .filter(record => record.terminal.includes("ACOT"))
        .classed('mouseover', d => d)

      let x = 
        d3.selectAll('.point-terminal-facility')
        .data()
        .map
        .filter(item => selectedTerminal
          .map(selected =>
            selected.lookup.terminal
          )
          .reduce((prev, curr) =>
            prev.concat(curr), []
          )
          .filter((item, i, arr) =>
            arr.indexOf(item) === i
          )
          .includes(item.properties.terminal)
        )
        // .classed('mouseover', d => d)

        console.log(x)


    }
  };

  // Deselect everything
  chart.clearSelection = function (_) {
    d3.selectAll('.point-terminal-facility')
      // clear all selected nodes
      .classed('selected', false);

    d3.selectAll('.link-edge-searoute')
      // hide all selected edges
      .classed('selected', false);

    // clear trajectories on leaflet canvas
    trajectoryLayerGroup.clearLayers();
  }

  return chart;
}

function addTrajectories(trajectoryLayerGroup, trajectoryHashMap, selectedMmsi){
  selectedMmsi.forEach(mmsi => {
    let record = Array.from(trajectoryHashMap.keys())
      .filter(i =>
        i.vessel_mmsi === mmsi
      );

    let trajLayer = trajectoryHashMap.get(record[0]);

    trajectoryLayerGroup.addLayer(trajLayer);
  })
}

function removeTrajectories(trajectoryLayerGroup, trajectoryHashMap, selectedMmsi){
  let layersToRemove = trajectoryLayerGroup
    .getLayers()
    .filter(i => !selectedMmsi.includes(i.id))

  layersToRemove.forEach(trajLayer => {
    trajectoryLayerGroup.removeLayer(trajLayer);
  })
}