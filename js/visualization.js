// Immediately Invoked Function Expression to limit access to our 
// variables and prevent 
((() => {

  const topology = 'data/countries-110m.json';
  const terminals = './data/processed/terminal.json';
  const edges = './data/processed/edges.json';
  const vessels = './data/raw/vessels.csv';


  const masterSchedulesEdges = './data/interim/master_schedules_edges.geojson'
  const masterSchedulesTerminalCallInfo = './data/interim/master_schedules_terminal_call_info.geojson'
  const trajectory = './data/interim/timestamped-trajectory-icl-tac1.geojson'

  // let geoData = d3.merge([
  //     []
  // ])
  Promise.all([
    d3.json(masterSchedulesEdges),
    d3.json(masterSchedulesTerminalCallInfo),
    d3.csv(vessels),
    // d3.json(trajectory),
    d3.json(topology),
  ]).then(function(data) {

    return {
      'master_schedules_edges': data[0],
      'master_schedules_terminal_call_info': data[1],
      'vessels': data[2],
      // 'timestamped_trajectory': data[2]
      'topology_countries-110m': data[3],
    }


    // console.log(data[0])  // first row of cities
    // console.log(d)  // first row of animals
    // d3.merge([data]).then(value => console.log(value));
    // console.log();
  }).then(data => {
    console.log(data)
     let visMap1 = svgMap()
     // //  ('#vis-map-1', topology, terminals, dataset);
      ('#vis-map-1', data);
  });

  // let nodeViz = network()
  // nodeViz('#vis-network');





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
  //   let visMap2 = leafletMap()
  //   ('#vis-map-2', data);
  //
  //   // getMasterSchedule(data)
  //
  // })

})());