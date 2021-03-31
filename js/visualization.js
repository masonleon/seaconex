// Immediately Invoked Function Expression to limit access to our 
// variables and prevent 
((() => {

  const topology = 'data/countries-110m.json';
  const terminals = './data/processed/terminal.json';
  const edges = './data/processed/edges.json';
  const trajectory = './data/interim/timestamped-trajectory-icl-tac1.geojson'

  let svgMap = map(topology, terminals, edges)
    svgMap('#vis-map-1');

  // d3.json('data/texas.json').then(data => {

  let interactiveMap = leafletMap()
    ('#vis-map-2', trajectory);

  // })

})());