FROM openjdk:11-jdk-slim
LABEL author="Mason Leon"

ARG version=2.1

# Installations
RUN apt-get update && \
    apt-get install -y \
        wget \
        unzip

# Download latest searoute jar release
RUN wget https://github.com/eurostat/searoute/raw/dev/releases/searoute-${version}.zip -O tmp.zip && \
    unzip tmp.zip && \
    rm -f tmp.zip

COPY data/searoute/data/ /data

COPY docker/searoute/run.sh run.sh
RUN chmod +x run.sh

WORKDIR /searoute-${version}

ENTRYPOINT /run.sh
