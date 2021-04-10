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

  // // General event type for selections, used by d3-dispatch https://github.com/d3/d3-dispatch
  // const dispatchString = 'selectionUpdated';

  Promise.all([
    d3.json(terminals),
    d3.json(masterSchedulesEdges),
    d3.json(masterSchedulesTerminalCallInfo),
    d3.csv(vessels),
    d3.json(searouteEdges),
    d3.json(topology),
    d3.json(carriers),
    d3.json(trajectory)
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
      'api_callback_lookup': {
        'carrierToTerminals' : mapCarrierTerminalsFromMasterSchedulesEdges(data[1].features),
        'terminalToCarriers' : mapTerminalCarriersFromMasterSchedulesEdges(data[1].features)
      },
      'network': dataNetworkVis(data[1].features, data[0].features)
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
 * For callback API
 *
 * Maps unique carrier to an array of the unique terminal id's it services
 * @returns {Map<carrier, [terminals]>}
*/
const mapCarrierTerminalsFromMasterSchedulesEdges = (masterSchedulesEdgesFeatures) => {
  let res =[];
  let hashMap = new Map();

  masterSchedulesEdgesFeatures
    .map(edge => edge.properties)
    .forEach(e => {

      let t1 = {
        carrier: e.carrier,
        terminal: e.terminal_call_facility_1
      };
      let t2 = {
        carrier: e.carrier,
        terminal: e.terminal_call_facility_2
      };
      if (res.some(carrier => carrier.terminal === t1.terminal) === false){
        res.push(t1);
      }
      if (res.some(carrier => carrier.terminal === t2.terminal) === false){
        res.push(t2);
      }
    });

  let carriersArr = [...new Set(res.map(item => item.carrier))];

  carriersArr.forEach(carrierKey => {

    let terminalsArr = res
      .filter(terminalCall => terminalCall.carrier === carrierKey)
      .map((item, i) => item.terminal)
      .filter((item, i, ar) => ar.indexOf(item) === i)

    hashMap.set(carrierKey, terminalsArr)
  })

  return hashMap;
}

/**
 * For callback API
 *
 * Maps unique terminal to an array of the unique carrier id's that service it
 * @returns {Map<carrier, [terminals]>}
*/
const mapTerminalCarriersFromMasterSchedulesEdges = (masterSchedulesEdgesFeatures) => {
  let res =[];
  let hashMap = new Map();

  masterSchedulesEdgesFeatures
    .map(edge => edge.properties)
    .forEach(e => {

      let t1 = {
        carrier: e.carrier,
        terminal: e.terminal_call_facility_1
      };
      let t2 = {
        carrier: e.carrier,
        terminal: e.terminal_call_facility_2
      };
      if (res.some(carrier => carrier.terminal === t1.terminal) === false){
        res.push(t1);
      }
      if (res.some(carrier => carrier.terminal === t2.terminal) === false){
        res.push(t2);
      }
    });

  let terminalsArr = [...new Set(res.map(item => item.terminal))];

  terminalsArr.forEach(terminalKey => {

    let carriersArr = res
      .filter(terminalCall => terminalCall.terminal === terminalKey)
      .map((item, i) => item.carrier)
      .filter((item, i, ar) => ar.indexOf(item) === i)

    hashMap.set(terminalKey, carriersArr)
  })

  return hashMap;
}


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
          terminal_call_facility_1: source,
          terminal_call_facility_2: target,
          ...rest
        }
    ) => (
        {
          source,
          target,
          ...rest
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


