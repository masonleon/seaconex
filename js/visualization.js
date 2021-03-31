// Immediately Invoked Function Expression to limit access to our 
// variables and prevent 
((() => {

  const topology = "data/countries-110m.json";
  const terminals =  './data/processed/terminal.json';
  const edges = './data/processed/edges.json';

  let myMap = map(topology, terminals, edges)
  myMap('#vis-map-1');  
  
})());


