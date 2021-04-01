// Immediately Invoked Function Expression to limit access to our 
// variables and prevent 
((() => {

  const topology = 'data/countries-110m.json';
  const terminals = './data/processed/terminal.json';
  const edges = './data/processed/edges.json';
  const trajectory = './data/interim/timestamped-trajectory-icl-tac1.geojson'

  let visMap1 = svgMap()
    ('#vis-map-1', topology, terminals, edges);

  d3.json(trajectory).then(data => {

    let visMap2 = leafletMap()
      ('#vis-map-2', data);

  })

})());