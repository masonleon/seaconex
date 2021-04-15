// Immediately Invoked Function Expression to limit access to our 
// variables and prevent 
((() => {

  const topology = 'data/countries-110m.json';
  const terminals = './data/processed/terminals.geojson';
  const vessels = './data/processed/vessels.json';
  const carriers = './data/processed/carriers.json';
  const searouteEdges = 'data/processed/searoutes.geojson';
  const masterSchedulesEdges = 'data/processed/master-schedules-terminal-call-edge.geojson'
  const masterSchedulesTerminalCallInfo = 'data/processed/master-schedules-terminal-call-svc-proforma.geojson'
  const trajectory = './data/interim/timestamped-trajectory-icl-tac1.geojson'
  const lookups = './data/processed/lookups.json'

  Promise.all([
    d3.json(terminals),
    d3.json(masterSchedulesEdges),
    d3.json(masterSchedulesTerminalCallInfo),
    d3.json(vessels),
    d3.json(searouteEdges),
    d3.json(topology),
    d3.json(carriers),
    d3.json(trajectory),
    d3.json(lookups)
  ]).then(function(data) {

    return {
      'terminals': data[0],
      'master_schedules_edges': data[1],
      'master_schedules_terminal_call_info': data[2],
      'vessels': data[3],
      'searoute_edges': data[4],
      'topology_countries-110m': data[5],
      'carriers': data[6],
      'timestamped_trajectory': data[7],
      'network': dataNetworkVis(data[1].features, data[0].features),
      'api_callback_lookup': data[8],

    }

  }).then(data => {

    // console.log(data.api);
    console.log(data);

    // General event type for selections, used by d3-dispatch
    // https://github.com/d3/d3-dispatch
    const dispatchString = 'selectionUpdated';

    let visControls = carrierFilter()
      .selectionDispatcher(d3.dispatch(dispatchString))
      ('#filters-carriers-component', data)

    let nodeViz = network()
      .selectionDispatcher(d3.dispatch(dispatchString))
      ('#vis-network', data);

    let visMap1 = svgMap()
      .selectionDispatcher(d3.dispatch(dispatchString))
      ('#vis-map-1', data);

    let visMap2 = leafletMap()
      ('#vis-map-2', data);

    let visTerminalTable = terminalTable()
      .selectionDispatcher(d3.dispatch(dispatchString))
      ('#table-terminals', data);

    // let visDetails = detailPane()
    //   ('#detail-pane', data);

    let charts = [
      visControls,
      nodeViz,
      visMap1,
    // visMap2,
      visTerminalTable
    // visDetails
    ];

    // https://neu-cs-7250-s21-staff.github.io/Assignment--Brushing_and_Linking--Solution/
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
  })
})());

/**
* For network vis
*
* Maps graph nodes and links for force-directed visualization
* @returns {Map<>}
*/
const dataNetworkVis = (masterSchedulesEdgesFeatures, terminalsFeatures) => {
  let hashMap = new Map();

  let links = masterSchedulesEdgesFeatures
    .map(edge => edge.properties)
    .map((
        {
          transport_edge_no: transport_edge_no,
          terminal_call_facility_1: source,
          terminal_call_facility_2: target,
          carrier: carrier,
          lane: lane,
          trade: trade,
          service: service,
          transport_connection: transport_connection,
          transport_type: transport_type
          // ...rest
        }
    ) => (
        {
          transport_edge_no,
          source,
          target,
          carrier,
          lane,
          trade,
          service,
          transport_connection,
          transport_type
          // ...rest
        }
    ));
  hashMap.set('links', links);

  let nodes = terminalsFeatures
    .map(node => node.properties)
    .map((
        {
          terminal: terminal,
          ...rest
        }
    ) => (
        {
          terminal,
          ...rest
        }
    ));
  hashMap.set('nodes', nodes);


  return hashMap;
}


