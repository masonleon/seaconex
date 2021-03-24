ARG BASE_CONTAINER=jupyter/scipy-notebook
FROM $BASE_CONTAINER
LABEL author="Mason Leon"

# Installations
USER root
RUN apt update && \
    apt-get update
    # sudo apt install --assume-yes \
RUN conda install -c conda-forge movingpandas && \
    conda clean --all -f -y && \
    rm -rf /home/$NB_USER/.cache/yarn 

# Switch back to jovyan to avoid accidental container runs as root
USER $NB_UID