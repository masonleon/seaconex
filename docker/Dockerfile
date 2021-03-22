
ARG BASE_CONTAINER=jupyter/scipy-notebook
FROM $BASE_CONTAINER

LABEL author="Mason Leon"

# Installations
USER root

# name your environment and choose python 3.x version
# ARG conda_env=python37
# ARG py_ver=3.7

# you can add additional libraries you want conda to install by listing them below the first line and ending with "&& \"
# RUN conda create --quiet --yes -p $CONDA_DIR/envs/$conda_env python=$py_ver ipython ipykernel && \
#     conda clean --all -f -y

RUN apt update && \
    apt-get update
    # sudo apt install --assume-yes \

RUN conda install -c conda-forge movingpandas && \
    conda clean --all -f -y && \
    rm -rf /home/$NB_USER/.cache/yarn 

# Switch back to jovyan to avoid accidental container runs as root
USER $NB_UID

# ARG UID


# ENV PATH=$PATH:/home/docker/.local/bin




# # Assign docker user, with the same UID from host
# ARG HOST_UID
# RUN useradd docker -l -u $HOST_UID -s /bin/bash -m
# USER docker

# WORKDIR /work
# CMD ["/bin/bash"]

# COPY ./docker-entrypoint.sh /
# ENTRYPOINT ["./docker-entrypoint.sh"]