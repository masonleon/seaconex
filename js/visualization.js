// Immediately Invoked Function Expression to limit access to our 
// variables and prevent 
((() => {

  console.log('Hello, world!');

  let myMap = map()
  myMap('#vis-map-1');  
  
  let nodeViz = network()
  nodeViz('#vis-map-1');
})());


