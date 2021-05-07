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

  layerControl,
  map,
  // vesselTrajectoriesLayer,
  traj,
  // vesselTrajectoryColor,
  // vesselColor;
  trajectoryLayerGroup,
  trajectoryState;

  // http://bl.ocks.org/nitaku/047a77e256de17f25e72
  // https://codepen.io/tforward/pen/ZPeZxd?editors=1010
  function chart(selector, data) {

    // deep copy trajectories so they are accessible in chart.updateSelection()
    // https://medium.com/@gamshan001/javascript-deep-copy-for-array-and-object-97e3d4bc401a
    traj = JSON.parse(
      JSON.stringify(data['timestamped_trajectory']));

    //TODO remove colors
    // let carrierColors = [
    //   {
    //     carrier: "ACL",
    //     brand_color: "#2C0D82"
    //   },
    //   {
    //     carrier: "BCL",
    //     brand_color: "#054087"
    //   },
    //   {
    //     carrier: "BISL",
    //     brand_color: "#F12A00"
    //   },
    //   {
    //     carrier: "HLUS",
    //     brand_color: "#F27300"
    //   },
    //   {
    //     carrier: "ICL",
    //     brand_color: "#FDAF00"
    //   },
    //   {
    //     carrier: "SISL",
    //     brand_color: "#108F41"
    //   }
    // ]

    let container = d3.select(selector)
      .style("width", width + '%')
      .style("height", height + "px")

    let initL = initLeaflet(selector);

    map = initL.map;
    layerControl = initL.layerControl;
    trajectoryLayerGroup = initL.trajectoryLayerGroup;

    // trajectoryState = []

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
      let point = map
        .latLngToLayerPoint(new L.LatLng(y, x));
      this.stream.point(point.x, point.y);
    }

    let projection = d3
      .geoTransform(
    {
          point: projectPoint
        }
      );

    let pathCreator = d3.geoPath()
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
            <strong>Terminal: </strong>
            ${d.properties.terminal_name}
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


    initCanvasOverlayTrajectory(data, map, layerControl, trajectoryLayerGroup);

    let legend = L
      .control(
      {
          position: 'bottomright'
        }
      );

    // TODO legend
    // legend.onAdd = () => {
    //   let div = d3.select(document.createElement("div"))
    //     .classed('legend', true)
    //     .text(
    //       `
    //         <u>
    //           Vessel Trajectories between <strong>${dateRange.min} - ${dateRange.max}</strong>
    //         </u>
    //       `
    //     )
    //
    //   let p = div.selectAll('p')
    //    .data(vesselNames)
    //    .enter()
    //     .append('p')
    //
    //   p.append('span')
    //     .classed('legend-item', true)
    //     .style('background-color', d =>
    //       color(d));
    //
    //   p.append('span')
    //     .text(d => d);
    //
    //   return div.node();
    // };
    // legend.addTo(map);
    // legend.style("display", "none");

    function onZoom () {
      terminals
        .attr("cx", d =>
          map
          .latLngToLayerPoint(
            [
              d.geometry.coordinates[1],
              d.geometry.coordinates[0]
            ])
          .x
        )
        .attr("cy", d =>
          map
          .latLngToLayerPoint(
            [
              d.geometry.coordinates[1],
              d.geometry.coordinates[0]
            ])
          .y
        );

      searouteEdges
        .attr('d', pathCreator);
    }

    // reset whenever svgMap is moved
    map.on('zoomend', onZoom)

    return chart;
  }

  const initLeaflet = (selector) => {
    let esriWorldImageryLayer = L
      .tileLayer(
        'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
          {
          attribution: 'Esri, Maxar, GeoEye, Earthstar Geographics, CNES/Airbus DS, USDA, USGS, AeroGRID, IGN, and the GIS User Community '
        }
      );

    let noaaEncLayer = L
      .tileLayer(
        'https://tileservice.charts.noaa.gov/tiles/50000_1/{z}/{x}/{y}.png',
          {
          attribution: 'NOAA'
        }
      );

    let map = L
      .map(
        selector.slice(1),
        {
          center: [30, 0],
          preferCanvas: true,
          // preferCanvas: false,
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
    let layerControl = L
      .control
      .layers(
        baseMaps,
        overlayMaps,
        controlOptions = {
          collapsed: false
        }
      )
      .addTo(
        map
      );

    L
    .svg(
      {
        clickable: true
      }
    )
    .addTo(
      map
    );

   let trajectoryLayerGroup = L
    .layerGroup()
    .addTo(
      map
    );

    return {
      map: map,
      layerControl: layerControl,
      trajectoryLayerGroup: trajectoryLayerGroup
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

  const initCanvasOverlayTrajectory = (data, map, layerControl, trajectoryLayerGroup) => {

    // let carrierColors = [
    //   {
    //     carrier: "ACL",
    //     brand_color: "#2C0D82"
    //   },
    //   {
    //     carrier: "BCL",
    //     brand_color: "#054087"
    //   },
    //   {
    //     carrier: "BISL",
    //     brand_color: "#F12A00"
    //   },
    //   {
    //     carrier: "HLUS",
    //     brand_color: "#F27300"
    //   },
    //   {
    //     carrier: "ICL",
    //     brand_color: "#FDAF00"
    //   },
    //   {
    //     carrier: "SISL",
    //     brand_color: "#108F41"
    //   }
    // ]

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
      // .map(vessel =>
      //   (
      //     {
      //       ...vessel,
      //       ...carrierColors
      //       .find(color =>
      //         color.carrier === vessel.carrier
      //       )
      //     }
      //   )
      // )

    // function trajectoryColor(vessel_mmsi){
    //   let trajectoryColor = vesselColor
    //     .find(record =>
    //       record.vessel_mmsi === vessel_mmsi
    //     )
    //
    //   return trajectoryColor.brand_color;
    // }

    trajectoryColor = d3
      .scaleOrdinal(d3.schemeSet3)
      .domain(
        vesselColor
          .map(vessel =>
            vessel.vessel_mmsi
          )
      )

    // function getStyleSheet(sheetName) {
    //   for (let i=0; i<document.styleSheets.length; i++) {
    //     let sheet = document.styleSheets[i];
    //
    //     if (sheet.ownerNode.attributes.href.value === sheetName) return sheet;
    //   }
    // }

    // function getStyle(className) {
    //   let sheet = getStyleSheet("style.leafletMap.css");
    //   let classes = sheet.rules || sheet.cssRules;
    //   let cssText = "";
    //   for (let i=0; i<classes.length; i++) {
    //     if (classes[i].selectorText === className) {
    //       cssText += classes[i].cssText || classes[i].style.cssText;
    //     }
    //   }
    //   return cssText;
    // }

    // function getStyle2(className) {
    //   let sheet = getStyleSheet("style.leafletMap.css");
    //   let classes = sheet.cssRules;
    //
    //
    //
    //   for (let i=0; i<classes.length; i++) {
    //
    //     if (classes[i].selectorText === className) return classes[i].style.cssText;
    // }

    function trajectoryStyle(feature) {
        return {
          stroke: trajectoryColor(feature.properties.vessel_mmsi),
          color: trajectoryColor(feature.properties.vessel_mmsi),
          opacity: 0,
          // className: 'vessel-trajectory'
        };
      }

    // function onEachFeature(feature, layer) {
    //   layer
    //     .setStyle(
    //       {
    //         className: 'vessel-trajectory'
    //       }
    //     );
    // }

    let trajectoryHashMap = new Map();

    vesselColor
      .forEach(vessel =>
        {
          let tr = data
            .timestamped_trajectory
            .features
              .filter(item =>
                item.properties.vessel_mmsi === vessel.vessel_mmsi
              )

          trajectoryHashMap
            .set(vessel, tr)
        }
      );

    // let trajectoryLayerGroup = L.layerGroup();
    // trajectoryLayerGroup = L.layerGroup();
    // trajectoryLayerGroup = L.layerGroup().addTo(map);

    trajectoryHashMap
      .forEach((value, key) =>
        {
          let layer = L
            .geoJSON(
              value,
              {
                style: trajectoryStyle,
                // onEachFeature: onEachFeature
              }
            )

          layer.id = key.vessel_mmsi
          // layer
          //   // ._path
          //   .classList
          //   .add('vessel-trajectory')
            // .setStyle(
            //   {
            //     className: 'vessel-trajectory'
            //   }
            // );
          // layer
          //   ._layers

          // layer
          //   .addTo(
          //     trajectoryLayerGroup
          //   );
          trajectoryLayerGroup.addLayer(layer);
        }
      )

    // map.addLayer(trajectoryLayerGroup);

    // layerControl
    //   .addOverlay(trajectoryLayerGroup, "Vessel Trajectories", true);
    // trajectoryLayerGroup
    //   .addTo(
    //     map
    //   );
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
      // chart.clearSelection();
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

      //TODO selectableElements
      // selectableElements
      d3.selectAll('.point-terminal-facility')
        // clear all selected nodes
        .classed('selected', false);

      //TODO selectableElements
      // show a node if it is serviced by a selected carrier
      // selectableElements
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

    // // only update vessel trajectories if data was for a vessel_mmsi
    if (selectedData.some(e => e.hasOwnProperty('vessel_mmsi'))) {
    //TODO clear trajectories from map
    //  chart.clearSelection();
    //   vesselTrajectoriesLayer.clearLayers();

      let selectedMmsi = selectedData
        .map(e =>
          e.vessel_mmsi
        )



      // trajectoryLayerGroup.getLayers()

      // trajectoryLayerGroup.getLayer(selectedMmsi[0])

      // console.log(trajectoryLayerGroup.getLayers()[0])

      // console.log(
      trajectoryLayerGroup
        .getLayers()
        .filter(item => selectedData
          .map(e =>
            e.vessel_mmsi
          )
          .reduce((prev, curr) =>
            prev.concat(curr), []
          )
          .filter((item, i, arr) =>
            arr.indexOf(item) === i
          )
          .includes(item.id)
        )
        .forEach(layer => {

          if(
            trajectoryState.includes())

          layer
            .setStyle(
              {
                opacity: 1,
                // className: "vessel-trajectory.selected"
                // className: "selected"
              }
            )}
          )
      // )

      // Object
      //   .values(
      //     layerControl
      //       ._layers
      //         .find(layer =>
      //           layer.name === "Vessel Trajectories"
      //         )
      //         .layer
      //         ._layers
      //   )
      //   .filter(item =>
      //     {
      //       if(
      //         selectedMmsi
      //           .includes(item.id)
      //       ){
      //         return item;
      //       }
      //     }
      //   )
        // .forEach(layer => {
        //   // layer
        //   //   .setStyle(
        //   //     {
        //   //       // opacity: 1,
        //   //       // className: "vessel-trajectory.selected"
        //   //       className: "selected"
        //   //     }
        //   //   );
        //   // Object
        //   //   .values(
        //   //     layer
        //   //       ._layers
        //   //       // .setStyle(
        //   //       //   {
        //   //       //     // opacity: 1,
        //   //       //     // className: "vessel-trajectory.selected"
        //   //       //     className: "selected"
        //   //       //   }
        //   //       );
        //     // console.log(
        //     console.log(layer);
        //
        //       Object
        //         .values(
        //           layer
        //             ._layers
        //         )
        //         .map(l =>
        //           // l._path
        //           l.options
        //         )
        //         // .forEach(path =>
        //         //   path.classList.add('selected')
        //         // );
        //   .forEach(path =>
        //           path.className = 'vessel-trajectory selected'
        //         );
        //     // )
        //   }
        // );

      // console.log(map.getLayers())
      // console.log(map.hasLayer(trajectoryLayerGroup));
      // console.log(trajectoryLayerGroup.getLayers());


    // TODO get vessel names from vessels/api lookup for the legend

    // let vesselNames = data['timestamped_trajectory'].features
    //   .map((feature, i) =>
    //       feature.properties.vessel_name
    //   )
    //   .filter ((item, i, ar) =>
    //       ar.indexOf(item) === i
    //   );

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
    // vesselTrajectoriesLayer.clearLayers();


  }

  return chart;
}