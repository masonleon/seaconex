// Immediately Invoked Function Expression to limit access to our 
// variables and prevent 
((() => {

  const topology = 'data/countries-110m.json';

  const terminals = './data/interim/terminals.geojson';

  const vessels = './data/raw/vessels.csv';
  const carriers = './data/processed/carrier.json';


  const searouteEdges = 'data/processed/searoutes.geojson';

  const masterSchedulesEdges = './data/interim/master_schedules_edges2.geojson'
  const masterSchedulesTerminalCallInfo = './data/interim/master_schedules_terminal_call_info.geojson'
  const trajectory = './data/interim/timestamped-trajectory-icl-tac1.geojson'

  // General event type for selections, used by d3-dispatch https://github.com/d3/d3-dispatch
  const dispatchString = 'selectionUpdated';

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
    .selectionDispatcher(d3.dispatch(dispatchString))
    ('#vis-network', data);

    let visMap1 = svgMap()
    // //  ('#vis-map-1', topology, terminals, dataset);
    ('#vis-map-1', data);
    //
    // let visMap2 = leafletMap()
    // ('#vis-map-2', data);

    // let visDetails = detailPane()
    // ('#detail-pane', data);
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