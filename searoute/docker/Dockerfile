#FROM maven:3.6-openjdk-11-slim
FROM openjdk:11-jdk-slim

RUN apt-get update && \
    apt-get -y upgrade

COPY ../searoute-2.1 /searoute
COPY ../data /data

COPY ../docker/run.sh run.sh
RUN chmod +x run.sh

WORKDIR /searoute

ENTRYPOINT /run.sh