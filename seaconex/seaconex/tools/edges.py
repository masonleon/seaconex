import geopandas as gpd
import pandas as pd
from ..utils import gdf_to_geo_file
from shapely.geometry import Point, LineString

def transport_calls_gdf_to_master_schedules_edges_gdf(transport_calls_gdf):
  # gdf = gpd.GeoDataFrame(
  #     transport_calls_df,
  #     crs='EPSG:3857',
  #     geometry = gpd.points_from_xy(
  #         transport_calls_df.Longitude,
  #         transport_calls_df.Latitude
  #     )
  # ).drop(
  #     columns=['Latitude', 'Longitude']
  # )

  gdf = transport_calls_gdf

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
    # 'port_call_wpi_1',
    # 'port_call_wpi_2',
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
                # 'port_call_wpi_1': prev_row['wpi'],
                # 'port_call_wpi_2': curr_row['wpi'],
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
            # 'port_call_wpi_1': prev_row['wpi'],
            # 'port_call_wpi_2': curr_row['wpi'],
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

def build_all_master_schedules_edges(
    terminal_location,
    # wpi_location,
    master_schedules_service_proforma_location,
    master_schedules_service_proforma_location_out_gpkg,
    master_schedules_service_proforma_location_out_geojson,
    master_schedules_edge_location_out_gpkg,
    master_schedules_edge_location_out_geojson,
    searoute_out=None
):

  gdf_terminals = gpd.read_file(terminal_location)

  df_msched_svc_pro_forma = pd.read_csv(master_schedules_service_proforma_location)

  df_terminal_calls = pd.merge(
      left=df_msched_svc_pro_forma,
      right=gdf_terminals[['terminal', 'port_unlocode', 'geometry']],
      how='left',
      on='terminal',
      #     right_on=
  ).fillna(
      ""
  ).assign(
      obj_type='master_schedules_terminal_call_svc_proforma'
  )

  gdf_terminal_calls = gpd.GeoDataFrame(
      df_terminal_calls,
      crs='EPSG:3857',
      geometry=df_terminal_calls.geometry
  )

  gdf_edges = transport_calls_gdf_to_master_schedules_edges_gdf(gdf_terminal_calls)

  build_searoute_edges(gdf_edges, gdf_terminals, searoute_out)

  gdf_to_geo_file(
      gdf_terminal_calls,
      master_schedules_service_proforma_location_out_gpkg,
      master_schedules_service_proforma_location_out_geojson
  )

  gdf_to_geo_file(
      gdf_edges,
      master_schedules_edge_location_out_gpkg,
      master_schedules_edge_location_out_geojson
  )

def build_searoute_edges(master_schedules_edges_gdf_in, terminals_gdf, searoute_out=None):

    terminals_gdf = terminals_gdf
    terminals_gdf['longitude'] = terminals_gdf.geometry.apply(lambda p: p.x)
    terminals_gdf['latitude'] = terminals_gdf.geometry.apply(lambda p: p.y)

    terminals_gdf.drop(
        columns=['geometry'],
        inplace=True
    )

    routes_gdf = master_schedules_edges_gdf_in[['transport_edge_no', 'terminal_call_facility_1', 'terminal_call_facility_2']]

    routes_gdf = routes_gdf.merge(
        #     left=routes_2,
        right=terminals_gdf[['terminal', 'latitude', 'longitude']].add_suffix(
          '_1'),
        how='left',
        left_on=['terminal_call_facility_1'],
        right_on=['terminal_1']
    ).merge(
        #     left=routes_2,
        right=terminals_gdf[['terminal', 'latitude', 'longitude']].add_suffix(
          '_2'),
        how='left',
        left_on=['terminal_call_facility_2'],
        right_on=['terminal_2']
    ).drop(
        columns=['terminal_1', 'terminal_2', 'terminal_call_facility_1',
                 'terminal_call_facility_2'],
    ).rename(
        columns={
          'latitude_1': 'olat',
          'longitude_1': 'olon',
          'latitude_2': 'dlat',
          'longitude_2': 'dlon',
        }
    )

    if searoute_out:
      routes_gdf[['transport_edge_no','olon','olat','dlon','dlat']].to_csv(
          path_or_buf=searoute_out,
          index=False
      )
    else:
      return routes_gdf