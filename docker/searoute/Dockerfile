FROM openjdk:11-jdk-slim

RUN apt-get update && \
    apt-get install -y \
        wget \
        unzip && \
    wget https://github.com/eurostat/searoute/raw/dev/releases/searoute-2.1.zip -O tmp.zip && \
    unzip tmp.zip && \
    rm -f tmp.zip

COPY data /data

COPY run.sh run.sh
RUN chmod +x run.sh

WORKDIR /searoute-2.1

ENTRYPOINT /run.sh
