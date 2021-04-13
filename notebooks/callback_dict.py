import numpy as np
import pandas as pd
import geopandas as gpd
import json

let api = [
    {
        'carrier' : '',
        'lookup' : {
            'terminal': [],
            'port_unlocode': [],
            'service': [],
            'trade' : [],
            'vessel_mmsi' : [],
            'transport_edge_no' :[],
            'vessel_type': []
        }
        .....
    }
    
    {
        'service' : '',
        'lookup' : {
            'terminal': [],
            'port_unlocode': [],
            'carrier': [],
            'trade' : [],
            'vessel_mmsi' : [],
            'transport_edge_no' :[],
            'vessel_type': []
        }
        .....
    }
    
    {
        'terminal' : '',
        'lookup' : {
            'service': [],
            'port_unlocode': [],
            'carrier': [],
            'trade' : [],
            'vessel_mmsi' : [],
            'transport_edge_no' :[],
            'vessel_type': []
        }
        .....
    }
    
    {
        'port_unlocode' : '',
        'lookup' : {
            'service': [],
            'terminal': [],
            'carrier': [],
            'trade' : [],
            'vessel_mmsi' : [],
            'transport_edge_no' :[],
            'vessel_type': []
        }
        .....
    }
    
    {
        'trade' : '',
        'lookup' : {
            'service': [],
            'terminal': [],
            'carrier': [],
            'port_unlocode' : [],
            'vessel_mmsi' : [],
            'transport_edge_no' :[],
            'vessel_type': []
        }
        .....
    }
    
    {
        'vessel_mmsi' : '',
        'lookup' : {
            'service': [],
            'terminal': [],
            'carrier': [],
            'port_unlocode' : [],
            'trade' : [],
            'transport_edge_no' :[],
            'vessel_type': []
        }
        .....
    }
    
     {
        'transport_edge_no' : '',
        'lookup' : {
            'service': [],
            'terminal': [],
            'carrier': [],
            'port_unlocode' : [],
            'vessel_mmsi' : [],
            'vessel_mmsi' :[],
            'vessel_type': []
        }
        .....
    }
    
    {
        'vessel_type' : '',
        'lookup' : {
            'service': [],
            'terminal': [],
            'carrier': [],
            'port_unlocode' : [],
            'trade' : [],
            'transport_edge_no' :[],
            'vessel_mmsi': []
        }
        .....
    }
]


df_terminals = gpd.read_file('../data/interim/terminals.geojson', orient='records')
df_terminals[['terminal', 'port_unlocode']]

df_vessels = pd.read_json('../data/processed/vessels.json', orient='records')
df_vessels[['vessel_mmsi', 'carrier', 'service']]

df_transport_edges = gpd.read_file('../data/interim/master_schedules_edges.geojson', orient='records')
df_transport_edges[['transport_edge_no', 'lane', 'service', 'trade', 'carrier', 'terminal_call_facility_1', 'terminal_call_facility_2', 'port_call_unlocode_1', 'port_call_unlocode_2']]

