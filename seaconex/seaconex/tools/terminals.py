import io
import os
import requests
import pandas as pd
import geopandas as gpd
from fiona.io import ZipMemoryFile

from ..utils import gdf_to_geo_file


def get_all_smdg_tcl(
    smdg_tcl_in_path=None,
    smdg_tcl_geojson_out_path=None,
    smdg_tcl_gpkg_out_path=None
):
  if smdg_tcl_in_path==None:
    smdg_tcl_in_path = '../data/raw/smdg-tcl-v20210401.csv'
  if smdg_tcl_geojson_out_path==None:
    smdg_tcl_geojson_out_path = '../data/processed/smdg-tcl.geojson'
  if smdg_tcl_gpkg_out_path==None:
    smdg_tcl_gpkg_out_path = '../data/gpkg/smdg-tcl.gpkg'

  if not os.path.exists(smdg_tcl_in_path):
    url = 'https://raw.githubusercontent.com/smdg-org/Terminal-Code-List/8886d86445d0a53e5495a4aeb11beedc92bd20cb/SMDG%20Terminal%20Code%20List.csv'
    # alt url in .xlsx
    # https://smdg.org/wp-content/uploads/Codelists/Terminals/SMDG-Terminal-Code-List-v20210401.xlsx
    r = requests.get(url)

    with open(smdg_tcl_in_path, 'wb') as f:
      f.write(r.content)

  # df_smdg = pd.read_csv(
  #     smdg_tcl_in_path,
  #     sep=','
  # ).drop(
  #     # columns=[
  #     #   'Latitude (DMS)',
  #     #   'Longitude (DMS)',
  #     #   'Last change',
  #     #   'Valid from',
  #     #   'Valid until',
  #     # ]
  # ).rename(
  #     # columns={
  #     #   'UNLOCODE': 'port_unlocode',
  #     #   'Alternative UNLOCODEs': 'port_unlocode_alt',
  #     #   'Terminal Code': 'terminal',
  #     #   'Latitude': 'latitude',
  #     #   'Longitude': 'longitude',
  #     #   'Terminal Facility Name': 'terminal_name',
  #     #   'Terminal Company Name': 'terminal_operator',
  #     #   'Terminal Website': 'terminal_website',
  #     #   'Terminal Address': 'terminal_address',
  #     #   'Remarks': 'remarks'
  #     # }
  # ).fillna("")

  # gdf_smdg = gpd.GeoDataFrame(
  #     df_smdg,
  #     # crs='EPSG:3857',
  #     epsg=4326,
  #     geometry=gpd.points_from_xy(
  #         # df_smdg.longitude,
  #         # df_smdg.latitude
  #         df_smdg.Longitude,
  #         df_smdg.Latitude
  #     )
  # ).drop(
  #     # columns=[
  #     #   'latitude',
  #     #   'longitude'
  #     # ]
  #     columns=[
  #       'Latitude',
  #       'Longitude'
  #     ]
  # )

  gdf_smdg_tcl = smdg_tcl_to_gpd(smdg_tcl_in_path)

  gdf_to_geo_file(
      gdf_smdg_tcl,
      smdg_tcl_geojson_out_path,
      smdg_tcl_gpkg_out_path
  )

def smdg_tcl_to_gpd(smdg_tcl_in_path):
  df_smdg_tcl = pd.read_csv(
      smdg_tcl_in_path,
      sep=','
  ).fillna("")

  gdf_smdg_tcl = gpd.GeoDataFrame(
      df_smdg_tcl,
      crs='EPSG:3857',
      # crs=3857,
      geometry=gpd.points_from_xy(
          df_smdg_tcl.Longitude,
          df_smdg_tcl.Latitude
      )
  ).drop(
      columns=[
        'Latitude',
        'Longitude'
      ]
  )

  return gdf_smdg_tcl

def get_all_nga_wpi(
    nga_wpi_in_path=None,
    nga_wpi_geojson_out_path=None,
    nga_wpi_gpkg_out_path=None
):
  if nga_wpi_in_path == None:
    nga_wpi_in_path = '../data/raw/nga-wpi-v2019-ed27.zip'
  if nga_wpi_geojson_out_path == None:
    nga_wpi_geojson_out_path = '../data/processed/nga-wpi.geojson'
  if nga_wpi_gpkg_out_path == None:
    nga_wpi_gpkg_out_path = '../data/gpkg/nga-wpi.gpkg'

  #     if not os.path.exists(nga_wpi_in_path) and not os.path.exists('../data/raw/WPI_Shapefile.zip'):
  url = 'https://msi.nga.mil/api/publications/download?key=16694622/SFH00000/WPI_Shapefile.zip'
  r = requests.get(url)

  with open(nga_wpi_in_path, 'wb') as f:
    f.write(r.content)

  gdf_nga_wpi = nga_wpi_to_gpd(nga_wpi_in_path)

  gdf_to_geo_file(
      gdf_nga_wpi,
      nga_wpi_geojson_out_path,
      nga_wpi_gpkg_out_path
  )

def nga_wpi_to_gpd(nga_wpi_in_path):

  # Just to create a BytesIO object for the demo,
  # similar to your request.FILES['file'].file
  zipshp = io.BytesIO(open(nga_wpi_in_path, 'rb').read())

  with (ZipMemoryFile(zipshp)) as memfile:
    with memfile.open() as src:
      crs = src.crs
      gdf_nga_wpi = gpd.GeoDataFrame.from_features(src, crs=crs).fillna("")
      return gdf_nga_wpi


  # df_nga_wpi = pd.read_csv(
  #     nga_wpi_in_path,
  #     sep=','
  # ).fillna("")
  #
  # gdf_nga_wpi = gpd.GeoDataFrame(
  #     df_nga_wpi,
  #     crs='EPSG:3857',
  #     # crs=3857,
  #     geometry=gpd.points_from_xy(
  #         df_nga_wpi.Longitude,
  #         df_nga_wpi.Latitude
  #     )
  # ).drop(
  #     columns=[
  #       'Latitude',
  #       'Longitude'
  #     ]
  # )

