import numpy as np
import pandas as pd
import geopandas as gpd
import movingpandas as mpd
import json

from ..utils import gdf_to_geo_file

from shapely.geometry import Point, LineString, Polygon
from datetime import datetime, timedelta

def traj_to_timestamped_features(trajectory_collection):
  features = []

  for trajectory in trajectory_collection.trajectories:
    # trajectory.add_speed
    # trajectory.add_direction

    df = trajectory.df.copy()
    df["previous_geometry"] = df["geometry"].shift()
    df["time"] = df.index
    df["previous_time"] = df["time"].shift()
    df["previous_ais_sog"] = df["ais_sog"].shift()
    # df["previous_ais_heading"] = df["ais_heading"].shift()

    for _, row in df.iloc[1:].iterrows():
      coordinates = [
        [
          row["previous_geometry"].xy[0][0],
          row["previous_geometry"].xy[1][0]
        ],
        [
          row["geometry"].xy[0][0],
          row["geometry"].xy[1][0]
        ]
      ]
      times = [row["previous_time"].isoformat(), row["time"].isoformat()]
      sogs = [row["previous_ais_sog"], row["ais_sog"]]
      # headings = [row["previous_ais_heading"], row["ais_heading"]]
      data = row.to_dict()
      data.pop('geometry', None)
      features.append(
          {
            "type": "Feature",
            "geometry": {
              "type": "LineString",
              "coordinates": coordinates,
            },
            "properties": {
              "times": times,
              "ais_sog": sogs,
              # "headings": headings,
            },
          }
      )
  return features

def traj_collection_to_geojson(trajectory_collection, traj_out_geojson):

  geojson = {
    "type": "FeatureCollection",
    "crs": {
      "type": "name",
      "properties": {
        #             "name": "urn:ogc:def:crs:EPSG::3857"
        "name": "urn:ogc:def:crs:EPSG::4326"
      }
    },
    "features": traj_to_timestamped_features(trajectory_collection)
  }

  with open(traj_out_geojson, 'w') as json_file:
    json.dump(geojson, json_file)

  # return json.dumps(geojson)


def build_all_trajectories(
    ais_gpkg_location,
    # trajectory_location_out_gpkg,
    trajectory_location_out_geojson,
):

  gdf_ais = gpd.read_file(ais_gpkg_location)
  wgs84 = gdf_ais.crs
  print("Finished reading {}".format(len(gdf_ais)))

  gdf_ais['t'] = pd.to_datetime(gdf_ais['ais_time'], format='%Y-%m-%d %H:%M:%S')
  gdf_ais = gdf_ais.set_index('t')

  print("Original size: {} rows".format(len(gdf_ais)))
  gdf_ais = gdf_ais[gdf_ais.ais_sog > 0]
  print("Reduced to {} rows after removing 0 speed records".format(len(gdf_ais)))

  MIN_LENGTH = 5  # meters
  traj_collection = mpd.TrajectoryCollection(
      data = gdf_ais,
      traj_id_col = 'vessel_mmsi',
      min_length=MIN_LENGTH
  )
  print("Finished creating {} trajectories".format(len(traj_collection)))

  traj_collection = mpd.MinTimeDeltaGeneralizer(
      traj_collection
  ).generalize(
    tolerance=timedelta(minutes=1)
  )

  traj_collection_to_geojson(traj_collection, trajectory_location_out_geojson)

  # geojson_traj_collection = traj_collection_to_geojson(traj_collection)

  # gdf_traj_collection = gpd.read_file(geojson_traj_collection)
  # wgs84 = gdf_traj_collection.crs

  # gdf_to_geo_file(
  #     gdf_traj_collection,
  #     # trajectory_location_out_gpkg,
  #     trajectory_location_out_geojson,
  # )