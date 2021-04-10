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

    let api = {
      'carrierToTerminals' : mapCarrierTerminalsFromMasterSchedulesEdges(data[1].features)
    }

    return {
      'terminals': data[0],
      'master_schedules_edges': data[1],
      'master_schedules_terminal_call_info': data[2],
      'vessels': data[3],
      'searoute_edges': data[4],
      'topology_countries-110m': data[5],
      'carriers': data[6],
      'timestamped_trajectory': data[7],
      'api': api
    }

  }).then(data => {

    console.log(data.api);

    // let carrierTerms = {}
    //
    // k = data['master_schedules_edges'].features
    //   .map((feature, i) => feature.properties.carrier)
    //   .filter ((item, i, ar) => ar.indexOf(item) === i)
    //   // .forEach(k => {
    //   //   console.log(k)
    //   //   if( !carrierTerms.hasOwnProperty(k)) {
    //   //     carrierTerms[k].push({});
    //   //   }})
    //
    // console.log(carrierTerms)


    // k = data['master_schedules_edges'].features
    //   .filter(feature => feature.carrier)
    //   .map((feature, i) => feature.properties.carrier)
    //   .filter ((item, i, ar) => ar.indexOf(item) === i)


    // const terminalsForCarrier = (carrier) => {
    //
    //   let res = [];
    //   data['master_schedules_edges'].features
    //     .map(edge => edge.properties)
    //     .forEach(e => {
    //       let t1 = {
    //         carrier: e.carrier,
    //         terminal: e.terminal_call_facility_1
    //       };
    //       let t2 = {
    //         carrier: e.carrier,
    //         terminal: e.terminal_call_facility_2
    //       };
    //       if (res.some(carrier => carrier.terminal === t1.terminal) === false){
    //         res.push(t1);
    //       }
    //       if (res.some(carrier => carrier.terminal === t2.terminal) === false){
    //         res.push(t2);
    //       }
    //     });
    //
    //   return res.filter(terminalCall => terminalCall.carrier === carrier)
    //   .map((item, i) => item.terminal)
    //   .filter((item, i, ar) => ar.indexOf(item) === i)
    // }

    // console.log(terminalsForCarrier('ICL'));


    // console.log(mapCarrierTerminalsFromMasterSchedulesEdges());
    // console.log(mapCarrierTerminalsFromMasterSchedulesEdges()['ICL']);
    //
    // const mapTerminalTerminalsFromMasterSchedulesEdges = () => {
    //
    //   let res =[];
    //   let hashMap = new Map();
    //
    //   data['master_schedules_edges'].features
    //     .map(edge => edge.properties)
    //     .forEach(e => {
    //
    //       let t1 = {
    //         carrier: e.carrier,
    //         terminal: e.terminal_call_facility_1
    //       };
    //       let t2 = {
    //         carrier: e.carrier,
    //         terminal: e.terminal_call_facility_2
    //       };
    //       if (res.some(carrier => carrier.terminal === t1.terminal) === false){
    //         res.push(t1);
    //       }
    //       if (res.some(carrier => carrier.terminal === t2.terminal) === false){
    //         res.push(t2);
    //       }
    //     });
    //
    //   let carriersArr = [...new Set(res.map(item => item.carrier))];
    //
    //   carriersArr.forEach(carrierKey => {
    //
    //     let terminalsArr = res
    //       .filter(terminalCall => terminalCall.carrier === carrierKey)
    //       .map((item, i) => item.terminal)
    //       .filter((item, i, ar) => ar.indexOf(item) === i)
    //
    //     hashMap.set(carrierKey, terminalsArr)
    //   })
    //
    //   return hashMap
    // }
    // console.log(mapCarrierTerminalsFromMasterSchedulesEdges());
    // console.log(mapCarrierTerminalsFromMasterSchedulesEdges()['ICL']);


    const getCarriersForSelectedGraphNodes = (selected) => {

    }

    const getTerminalsForSelectedCarriers = (selected) => {

    }

    const getGraphEdgesForSelectedCarriers = (selected) => {

    }

     const getSearouteEdgesForSelectedCarriers = (selected) => {

    }




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
     * Maps unique carriers to an array of the unique terminal id's it services
     * @returns {Map<carrier, [terminals]>}
     */
 const mapCarrierTerminalsFromMasterSchedulesEdges = (masterSchedulesEdgesFeatures) => {

      let res =[];
      let hashMap = new Map();

      // data['master_schedules_edges'].features
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

      return hashMap
    }