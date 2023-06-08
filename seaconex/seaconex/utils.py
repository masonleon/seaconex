# seaconex/utils.py

import re
import requests
import json
import geopandas as gpd
from shapely.geometry import Point, LineString

"""
https://www.javaer101.com/en/article/18832510.html
https://stackoverflow.com/questions/33997361

Converting Degrees, Minutes, Seconds formatted coordinate strings to decimal.

Formula:
DEC = (DEG + (MIN * 1/60) + (SEC * 1/60 * 1/60))

Assumes S/W are negative.
"""


def dms_to_dd(s):
  # example: s = """0°51'56.29"S"""
  degrees, minutes, seconds, direction = re.split('[°\'"]+', s)
  dd = float(degrees) + float(minutes) / 60 + float(seconds) / (60 * 60)
  if direction in ('S', 'W'):
    dd *= -1
  return dd


def piped_txt_to_arr(file):
  data = []

  with open(file, 'rt') as in_file:
    for line in in_file:
      if line[0] == '|':
        cells = [x.strip() for x in line[1:len(line) - 2].split('|')]
        data.append(cells)
  return data


# /api/publications/world-port-index
# World Port Index Database Queries
def nga_msi_wpi_api_get_world_port_index(port_codes):
  url = 'https://msi.nga.mil/api/publications/world-port-index?'

  ports = []

  for port in port_codes:
    params = {
      "indexNumber": port,
      "output": "json"
    }

    try:
      r = requests.get(url, params=params)

      if r.status_code == 200:
        ports.append(r.json()['ports'][0])
    except:
      print('error portNumber: {}'.format(port))

  data = {'ports': ports}
  return data


# /api/publications/world-port-index/wpi-prc-names
# List Port, Region, and Country Names for World Port Indexes
def nga_msi_wpi_api_get_prc_names():
  url = 'https://msi.nga.mil/api/publications/world-port-index/wpi-prc-names'

  data = {}

  params = {
    "output": "json"
  }

  try:
    r = requests.get(url, params=params)

    if r.status_code == 200:
      data = r.json()
  except:
    print('error')

  return data


def gdf_to_geo_file(
    gdf,
    geojson_out_path=None,
    gpkg_out_path=None,
    layer_name=None
):

  if geojson_out_path:
    gdf.to_file(
        geojson_out_path,
        driver='GeoJSON'
    )

  if gpkg_out_path:
    gdf.to_file(
        gpkg_out_path,
        driver='GPKG'
    )