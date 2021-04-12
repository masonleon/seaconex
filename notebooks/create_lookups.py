# api = [
#   {
#     'carrier' : 'ICL',
#     'lookup' : {
#       'terminal': ['PSAP', 'NCSPA', 'ACOT', 'DPWS', 'RDT'],
#       'port_unlocode': ['SPHL', 'USILM', 'BEANR', 'GBSOU', 'IEORK'],
#       'service': ['TAC1'],
#       'trade' : ['Trans-Atlantic'],
#       'vessel_mmsi' : [211256150, 255805987, 255806481, 636091480],
#       'transport_edge_no' : ['TAC1_E_1', 'TAC1_E_2', 'TAC1_E_3', 'TAC1_E_4', 'TAC1_W_1', 'TAC1_W_2', 'TAC1_W_3', 'TAC1_W_4'],
#       'vessel_type': ['Container']
#     }
#   },
#   'carrier': X,
#   'lookup' : { ... }
# ]
#
#
# services/trades:
# https://raw.githubusercontent.com/NEU-CS-7250-S21/project-group-09-seaconex/d3_callback_api/data/interim/master_schedules_edges.geojson?token=AFY3X7SM3GNEHWH2UQ5BO73APTPUQ
#
#
# vessels:
# https://raw.githubusercontent.com/NEU-CS-7250-S21/project-group-09-seaconex/d3_callback_api/data/processed/vessels.json?token=AFY3X7VGXWZD2NETRDLF2FLAPTRFE
#
#
#

import json


def load_terminals(filename):
    with open(filename) as f:
        data = json.load(f)

    terminals = {}
    for feature in data['features']:
        terminal_name = feature['properties']['terminal']
        terminal_info = {"port_name": feature['properties']['port_name'],
                         "port_unlocode": feature['properties']['port_unlocode'],
                         }
        terminals[terminal_name] = terminal_info

    return terminals


def load_edges(filename):
    with open(filename) as f:
        data = json.load(f)

    edges = {}
    for feature in data['features']:
        edge = feature['properties']['transport_edge_no']
        edge_info = {
            'service': feature['properties']['service'],
            'trade': feature['properties']['trade'],
            'carrier': feature['properties']['carrier'],
            'transport_type': feature['properties']['transport_type'],
            'terminal_call_facility_1': feature['properties']['terminal_call_facility_1'],
            'terminal_call_facility_2': feature['properties']['terminal_call_facility_2'],
            'port_call_unlocode_1': feature['properties']['port_call_unlocode_1'],
            'port_call_unlocode_2': feature['properties']['port_call_unlocode_2']
        }
        edges[edge] = edge_info
    return edges


def load_carriers(filename):
    with open(filename) as f:
        data = json.load(f)
    return data


def load_vessels(filename):
    with open(filename) as f:
        data = json.load(f)
    return data


def find_vessel_info_by_service(service, vessels):
    mmsi_list = []
    type_list = []
    for vessel in vessels:
        if vessel["service"] == service:
            mmsi_list.append(vessel["vessel_mmsi"])
            type_list.append(vessel["vessel_type"])

    return [mmsi_list, type_list]

def build_geojson(terminals, carriers, edges, vessels):

    lookups = {}
    # Initialize carriers
    for carrier_info in carriers:
        carrier_id = carrier_info['carrier_id']
        lookup = {'carrier': carrier_id,
                  'lookup': {
                    'terminal': [],
                    'port_unlocode': [],
                    'service': [],
                    'trade': [],
                    'vessel_mmsi': [],
                    'transport_edge_no': [],
                    'vessel_type': []}
                  }
        lookups[carrier_id] = lookup



    # Go through each edge and add info
    for edge_id, edge_info in edges.items():
        carrier_id = edge_info['carrier']
        port_call_unlocode_1 = edge_info['port_call_unlocode_1']
        port_call_unlocode_2 = edge_info['port_call_unlocode_2']
        terminal_call_facility_1 = edge_info['terminal_call_facility_1']
        terminal_call_facility_2 = edge_info['terminal_call_facility_2']
        service = edge_info['service']
        trade = edge_info['trade']
        [vessel_mmsi_list, vessel_type_list] = find_vessel_info_by_service(service, vessels)
        transport_edge_no = edge_id


        if terminal_call_facility_1 not in lookups[carrier_id]['lookup']['terminal']:
            lookups[carrier_id]['lookup']['terminal'].append(terminal_call_facility_1)
        if terminal_call_facility_2 not in lookups[carrier_id]['lookup']['terminal']:
            lookups[carrier_id]['lookup']['terminal'].append(terminal_call_facility_2)
        if port_call_unlocode_1 not in lookups[carrier_id]['lookup']['port_unlocode']:
            lookups[carrier_id]['lookup']['port_unlocode'].append(port_call_unlocode_1)
        if port_call_unlocode_2 not in lookups[carrier_id]['lookup']['port_unlocode']:
            lookups[carrier_id]['lookup']['port_unlocode'].append(port_call_unlocode_2)

        if service not in lookups[carrier_id]['lookup']['service']:
            lookups[carrier_id]['lookup']['service'].append(service)

        if trade not in lookups[carrier_id]['lookup']['trade']:
            lookups[carrier_id]['lookup']['trade'].append(trade)

        for vessel_mmsi in vessel_mmsi_list:

            if vessel_mmsi not in lookups[carrier_id]['lookup']['vessel_mmsi']:
                lookups[carrier_id]['lookup']['vessel_mmsi'].append(vessel_mmsi)

        for vessel_type in vessel_type_list:
            if vessel_type not in lookups[carrier_id]['lookup']['vessel_type']:
                lookups[carrier_id]['lookup']['vessel_type'].append(vessel_type)

        if transport_edge_no not in lookups[carrier_id]['lookup']['transport_edge_no']:
            lookups[carrier_id]['lookup']['transport_edge_no'].append(transport_edge_no)


    # format into list
    return list(lookups.values())


def dump_to_file(output_location, lookups):
    file = open(output_location, "w")
    json.dump(lookups, file)




terminal_location = "../data/interim/terminals.geojson"
carrier_location = "../data/processed/carriers.json"
edge_location = "../data/interim/master_schedules_edges.geojson"
vessel_location = "../data/processed/vessels.json"
output_location = "../data/processed/lookups.json"

terminals = load_terminals(terminal_location)
carriers = load_carriers(carrier_location)
edges = load_edges(edge_location)
vessels = load_vessels(vessel_location)
lookups = build_geojson(terminals, carriers, edges, vessels)
dump_to_file(output_location, lookups)