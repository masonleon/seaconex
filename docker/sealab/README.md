# sealab
### dockerized environment for pre-processing the data and exploratory analysis
Docker JupyterLab environment based on the jupyter/scipy-notebook image and adapted from the work of
[Anita Graser](https://anitagraser.com/category/gis/movement-data-in-gis/).

The containerized environment helps simplify the complex installation of GIS and python libraries used to retrieve and
reformat our datasets. Additionally, we use Python to pre-process vessel and carrier service data, generate 
trajectories, cluster AIS messages, and generate graph networks into formats for visualization with D3.

#### Raw Data
    
    ./project-group-09-seaconex/data/raw/

#### Processed Data

    ./project-group-09-seaconex/data/processed

####Run
Run from parent directory:  
`docker-compose up sealab`  
or   
`docker-compose up --build sealab`  

####Additional Reading
- https://github.com/jupyter/docker-stacks
- https://github.com/jupyter/docker-stacks/tree/master/scipy-notebook
- https://github.com/anitagraser/EDA-protocol-movement-data
- https://github.com/anitagraser/movingpandas
- https://github.com/anitagraser/movingpandas-examples