// Immediately Invoked Function Expression to limit access to our 
// variables and prevent 
((() => {

  const topology = 'data/countries-110m.json';

  const terminals = './data/interim/terminals.geojson';

  const vessels = './data/raw/vessels.csv';
  const carriers = './data/processed/carrier.json';


  const searouteEdges = 'data/processed/searoutes.geojson';

  const masterSchedulesEdges = './data/interim/master_schedules_edges.geojson'
  const masterSchedulesTerminalCallInfo = './data/interim/master_schedules_terminal_call_info.geojson'
  const trajectory = './data/interim/timestamped-trajectory-icl-tac1.geojson'

  Promise.all([
    d3.json(terminals),
    d3.json(masterSchedulesEdges),
    d3.json(masterSchedulesTerminalCallInfo),
    d3.csv(vessels),
    d3.json(searouteEdges),
    d3.json(topology),
    d3.json(carriers),
    // d3.json(trajectory)
  ]).then(function(data) {

    return {
      'terminals': data[0],
      'master_schedules_edges': data[1],
      'master_schedules_terminal_call_info': data[2],
      'vessels': data[3],
      'searoute_edges': data[4],
      'topology_countries-110m': data[5],
      'carriers': data[6]
      // 'timestamped_trajectory': data[6]
    }

  }).then(data => {
    console.log(data)

    // General event type for selections, used by d3-dispatch
    // https://github.com/d3/d3-dispatch
    const dispatchString = 'selectionUpdated';

    let visControls = carrierFilter()
      .selectionDispatcher(d3.dispatch(dispatchString))
      ('#filters-component', data)

    let nodeViz = network()
      ('#vis-network', data);

    let visMap1 = svgMap()
      ('#vis-map-1', data);

    let visMap2 = leafletMap()
      ('#vis-map-2', data);

    // let visDetails = detailPane()
    //   ('#detail-pane', data);

    let charts = [
      visControls,
      // nodeViz,
      // visMap1
    ];

    // When any chart selection is updated via brushing,
    // have all other charts to update their selections (linking)
    for (let i = 0; i < charts.length; i++) {
      for (let j = 0; j < charts.length; j++) {
        if (i === j) continue;

        // We can't just use the same string for them all. In order to register
        // multiple event handlers (e.g., multiple charts listening for your selection
        // change) we need to have 'prefix.suffix' format where the suffix is arbitrary
        // but unique.
        let pairUniqueString = dispatchString + '.' + i + '.' + j;

        // Where we actually tell one chart to listen to the other.
        charts[i]
          .selectionDispatcher()
          .on(pairUniqueString, charts[j].updateSelection);
      }
    }
  });







  function getMasterSchedule(data) {

    // console.log("data.features:", data.features);
    // let originTerminals = data.features
    //   .filter(feature => feature.id === 'master_schedule')
    //   .map((feature, i) => feature.properties.source_terminal)
    //   .filter ((item, i, ar) => ar.indexOf(item) === i)

    // console.log("Filtered:", originTerminals)

  }


  // d3.json(trajectory).then(data => {
  //

  //
  //   // getMasterSchedule(data)
  //
  // })

})());