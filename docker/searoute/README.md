# searoute
### dockerized environment for the Eurostat SeaRoute Java application

[Eurostat](https://ec.europa.eu/eurostat/), the statistical office of the European Union developed 
[SeaRoute](https://github.com/eurostat/searoute) to determine the shortest maritime route between two geographic points. 

[Dijkstra's Algorithm](https://en.wikipedia.org/wiki/Dijkstra%27s_algorithm) is used to compute the route from a network
adapted from the Global Shipping Lane Network dataset produced by the U.S. Department of Energy, [Oak Ridge National Labs
(ORNL), Center for Transportation Analysis (CTA) Transportation Network Group](http://www-cta.ornl.gov/transnet/Intermodal_Network.html).

The SeaRoute application is used in our project to generate GeoJSON files containing MultiLineStrings segments. These 
are then plotted in D3. We use this approach to avoid visualizing routes over land for ocean carrier services.

Note: The generated routes may not be accurate for actual navigation or real-world cargo routing and are only 
used for visualization purposes. 

#### Input
place searoutes.csv in:  
    
    ./project-group-09-seaconex/data/searoute/data/in/searoutes.csv

formatted with the following header:  
    
    route name,olon,olat,dlon,dlat

example:

    route name,olon,olat,dlon,dlat
    Marseille-Shanghai,5.3,43.3,121.8,31.2
    Marseille-Saint-Petersburg,5.3,43.3,30.2,59.9
    Marseille-Auckland,5.3,43.3,174.8,-36.8
    Marseille-New-York,5.3,43.3,-74.1,40.7
    Marseille-Los Angeles,5.3,43.3,-118.3,33.7
    Shanghai-Saint-Petersburg,121.8,31.2,30.2,59.9
    Shanghai-Auckland,121.8,31.2,174.8,-36.8
    Shanghai-New-York,121.8,31.2,-74.1,40.7
    Shanghai-Los Angeles,121.8,31.2,-118.3,33.7
    Saint-Petersburg-Auckland,30.2,59.9,174.8,-36.8
    Saint-Petersburg-New-York,30.2,59.9,-74.1,40.7
    Saint-Petersburg-Los Angeles,30.2,59.9,-118.3,33.7
    Auckland-New-York,174.8,-36.8,-74.1,40.7
    Auckland-Los Angeles,174.8,-36.8,-118.3,33.7
    New-York-Los Angeles,-74.1,40.7,-118.3,33.7

#### Output
output GeoJSON generated in searoutes.geojson in:

    ./project-group-09-seaconex/data/searoute/data/out/searoutes.geojson

#### Run
Run from parent directory:  
`docker-compose up searoute`  
or   
`docker-compose up --build searoute`  

#### Additional Reading
- https://github.com/carlossg/docker-maven/blob/master/openjdk-11-slim/Dockerfile
- https://github.com/eurostat/searoute
- https://github.com/hrishioa/searoute-irtc-docker