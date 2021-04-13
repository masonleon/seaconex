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

def transport_calls_to_edges(transport_calls_df):
  gdf = gpd.GeoDataFrame(
      transport_calls_df,
      crs='EPSG:3857',
      geometry = gpd.points_from_xy(
          transport_calls_df.Longitude,
          transport_calls_df.Latitude
      )
  ).drop(
      columns=['Latitude', 'Longitude']
  )

  edge_columns = [
    'lane',
    'service',
    'trade',
    'carrier',
    'transport_edge_no',
    'transport_type',
    'transport_connection',
    'terminal_call_facility_1',
    'terminal_call_facility_2',
    'port_call_unlocode_1',
    'port_call_unlocode_2',
    'port_call_wpi_1',
    'port_call_wpi_2',
    'port_call_seq_no_1',
    'port_call_seq_no_2',
    'terminal_call_seq_no_1',
    'terminal_call_seq_no_2',
    'obj_type',
    'geometry'
  ]

  edges_df = gpd.GeoDataFrame(
      columns=edge_columns,
      crs='EPSG:3857'
  )

  grouped = gdf.groupby(['lane', 'service', 'trade', 'carrier'])
  keys = list(grouped.groups.keys())

  for k in keys:

    curr_df = grouped.get_group(k)

    curr_row = None
    prev_row = None
    num = -1

    for index, row in curr_df.iterrows():

      if all(v is not None for v in [curr_row, prev_row]):
        if curr_row['lane'] == prev_row['lane']:
          edges_df = edges_df.append(
              {
                'lane': prev_row['lane'],
                'service': prev_row['service'],
                'trade': prev_row['trade'],
                'carrier': prev_row['carrier'],
                'transport_edge_no': prev_row['service'] + '_' + prev_row[
                  'lane'] + '_' + str(num),
                'transport_type': prev_row['transport_type'],
                'transport_connection': prev_row['transport_connection'],
                'terminal_call_facility_1': prev_row['terminal'],
                'terminal_call_facility_2': curr_row['terminal'],
                'port_call_unlocode_1': prev_row['port_unlocode'],
                'port_call_unlocode_2': curr_row['port_unlocode'],
                'port_call_wpi_1': prev_row['wpi'],
                'port_call_wpi_2': curr_row['wpi'],
                'port_call_seq_no_1': prev_row['port_call_seq_no'],
                'port_call_seq_no_2': curr_row['port_call_seq_no'],
                'terminal_call_seq_no_1': prev_row['terminal_call_seq_no'],
                'terminal_call_seq_no_2': curr_row['terminal_call_seq_no'],
                'obj_type': 'master_schedules_terminal_call_edge',
                'geometry': LineString(
                    [prev_row['geometry'], curr_row['geometry']])
              },
              ignore_index=True
          )
        prev_row = curr_row;

      if prev_row is None and curr_row is not None:
        prev_row = curr_row
      curr_row = row;
      num += 1

    if curr_row['lane'] == prev_row['lane']:
      edges_df = edges_df.append(
          {
            'lane': prev_row['lane'],
            'service': prev_row['service'],
            'trade': prev_row['trade'],
            'carrier': prev_row['carrier'],
            'transport_edge_no': prev_row['service'] + '_' + prev_row[
              'lane'] + '_' + str(num),
            'transport_type': prev_row['transport_type'],
            'transport_connection': prev_row['transport_connection'],
            'terminal_call_facility_1': prev_row['terminal'],
            'terminal_call_facility_2': curr_row['terminal'],
            'port_call_unlocode_1': prev_row['port_unlocode'],
            'port_call_unlocode_2': curr_row['port_unlocode'],
            'port_call_wpi_1': prev_row['wpi'],
            'port_call_wpi_2': curr_row['wpi'],
            'port_call_seq_no_1': prev_row['port_call_seq_no'],
            'port_call_seq_no_2': curr_row['port_call_seq_no'],
            'terminal_call_seq_no_1': prev_row['terminal_call_seq_no'],
            'terminal_call_seq_no_2': curr_row['terminal_call_seq_no'],
            'obj_type': 'master_schedules_terminal_call_edge',
            'geometry': LineString(
                [prev_row['geometry'], curr_row['geometry']])
          },
          ignore_index=True
      )
  return edges_df