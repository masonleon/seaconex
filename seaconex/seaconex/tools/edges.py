import geopandas as gpd
import pandas as pd
from shapely.geometry import Point, LineString

def transport_calls_df_to_master_schedules_edges_gdf(transport_calls_df):
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

# def master_schedules_edges_to_geojson(output_location):


  # def dump_to_file(, lookups):
  #   with open(output_location, "w") as file:
  #     json.dump(lookups, file)


def build_all_master_schedules_edges(
    terminal_location,
    # wpi_location,
    master_schedules_service_proforma_location,
    output_location=None):

  df_terminals = pd.read_json(
      terminal_location,
      orient='records'
  )

  df_msched_svc_pro_forma = pd.read_json(
      master_schedules_service_proforma_location,
      orient='records'
  )

  terminal_calls = pd.merge(
      left=df_msched_svc_pro_forma,
      right=df_terminals[['terminal', 'latitude', 'longitude']],
      how='left',
      left_on=['terminal'],
      right_on=['terminal']
  ).fillna(
      ""
  ).assign(
      obj_type='master_schedules_terminal_call_info'
  )









  # if output_location:
  #   return dump_to_file(output_location, lookups)
  #
  # else:
  #   return json.dumps(lookups)
