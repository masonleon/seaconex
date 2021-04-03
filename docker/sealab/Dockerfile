ARG BASE_CONTAINER=jupyter/scipy-notebook
FROM $BASE_CONTAINER
LABEL author="Mason Leon"

# Installations
USER root
RUN apt update && \
    apt-get update
    # sudo apt install --assume-yes \

RUN conda install \
        -c conda-forge \
#        nb_conda_kernels \
        python=3.7 \
        geopandas \
        rasterio \
        hvplot \
        proj \
        cartopy \
        geoviews \
        geopy \
        panel \
        networkx \
        osmnx \
        spaghetti \
        esda \
        splot \
        folium && \
    conda clean --all -f -y && \
    rm -rf /home/$NB_USER/.cache/yarn

# https://github.com/anitagraser/movingpandas/commit/f6e1aa7e708dc026b88b7b6bc466136ac07a3485
# includes support for get_stop_points
COPY lib/movingpandas/ .
RUN pip install .

# Switch back to jovyan to avoid accidental container runs as root
USER $NB_UID
WORKDIR $HOME/work

COPY seaconex/ .
RUN pip install .