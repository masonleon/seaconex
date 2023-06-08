import json


def load_terminals(filename):
  with open(filename) as f:
    data = json.load(f)

  terminals = {}

  for feature in data['features']:
    terminal_name = feature['properties']['terminal']
    terminal_info = {
      # "port_name": feature['properties']['port_name'],
      "port_unlocode": feature['properties']['port_unlocode'],
    }
    terminals[terminal_name] = terminal_info

  return terminals


def load_master_schedules_edges(filename):
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
      'terminal_call_facility_1': feature['properties'][
        'terminal_call_facility_1'],
      'terminal_call_facility_2': feature['properties'][
        'terminal_call_facility_2'],
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


def dump_to_file(output_location, lookups):
  with open(output_location, "w") as file:
    json.dump(lookups, file)


def find_vessel_info_by_service(service, vessels):
  mmsi_list = []
  type_list = []

  for vessel in vessels:
    if vessel["service"] == service:
      mmsi_list.append(vessel["vessel_mmsi"])
      type_list.append(vessel["vessel_type"])

  return [mmsi_list, type_list]


def build_json_carriers(carriers, edges, vessels):
  # print("terminals:", terminals)
  # print("edges:", edges)

  lookups = {}

  # Initialize carriers
  for carrier_info in carriers:
    carrier_id = carrier_info['carrier_id']
    lookup = {
      'carrier': carrier_id,
      'lookup': {
        'terminal': [],
        'port_unlocode': [],
        'service': [],
        'trade': [],
        'vessel_mmsi': [],
        'transport_edge_no': [],
        'vessel_type': []
      }
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
    [vessel_mmsi_list, vessel_type_list] = find_vessel_info_by_service(service,
                                                                       vessels)
    transport_edge_no = edge_id

    if terminal_call_facility_1 not in lookups[carrier_id]['lookup'][
      'terminal']:
      lookups[carrier_id]['lookup']['terminal'].append(terminal_call_facility_1)
    if terminal_call_facility_2 not in lookups[carrier_id]['lookup'][
      'terminal']:
      lookups[carrier_id]['lookup']['terminal'].append(terminal_call_facility_2)
    if port_call_unlocode_1 not in lookups[carrier_id]['lookup'][
      'port_unlocode']:
      lookups[carrier_id]['lookup']['port_unlocode'].append(
          port_call_unlocode_1)
    if port_call_unlocode_2 not in lookups[carrier_id]['lookup'][
      'port_unlocode']:
      lookups[carrier_id]['lookup']['port_unlocode'].append(
          port_call_unlocode_2)

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

    if transport_edge_no not in lookups[carrier_id]['lookup'][
      'transport_edge_no']:
      lookups[carrier_id]['lookup']['transport_edge_no'].append(
          transport_edge_no)

  # format into list
  return list(lookups.values())


# 'service' : '',
#        'lookup' : {
#            'terminal': [],
#            'port_unlocode': [],
#            'carrier': [],
#            'trade' : [],
#            'vessel_mmsi' : [],
#            'transport_edge_no' :[],
#            'vessel_type': []
#        }
def build_json_services(carriers, services, vessels, terminals):
  # Initialize services
  lookups = {}

  for service_edge_id, service_info in services.items():
    service_id = service_info['service']
    lookup = {
      'service': service_id,
      'lookup': {
        'terminal': [],
        'port_unlocode': [],
        'carrier': [],
        'trade': [],
        'vessel_mmsi': [],
        'transport_edge_no': [],
        'vessel_type': []
      }
    }
    lookups[service_id] = lookup

  # Go through each edge and add info
  for edge_id, edge_info in services.items():
    service_id = edge_info['service']
    carrier_id = edge_info['carrier']
    port_call_unlocode_1 = edge_info['port_call_unlocode_1']
    port_call_unlocode_2 = edge_info['port_call_unlocode_2']
    terminal_call_facility_1 = edge_info['terminal_call_facility_1']
    terminal_call_facility_2 = edge_info['terminal_call_facility_2']
    service = edge_info['service']
    trade = edge_info['trade']
    [vessel_mmsi_list, vessel_type_list] = find_vessel_info_by_service(service,
                                                                       vessels)
    transport_edge_no = edge_id

    if terminal_call_facility_1 not in lookups[service_id]['lookup'][
      'terminal']:
      lookups[service_id]['lookup']['terminal'].append(terminal_call_facility_1)
    if terminal_call_facility_2 not in lookups[service_id]['lookup'][
      'terminal']:
      lookups[service_id]['lookup']['terminal'].append(terminal_call_facility_2)
    if port_call_unlocode_1 not in lookups[service_id]['lookup'][
      'port_unlocode']:
      lookups[service_id]['lookup']['port_unlocode'].append(
          port_call_unlocode_1)
    if port_call_unlocode_2 not in lookups[service_id]['lookup'][
      'port_unlocode']:
      lookups[service_id]['lookup']['port_unlocode'].append(
          port_call_unlocode_2)

    if carrier_id not in lookups[service_id]['lookup']['carrier']:
      lookups[service_id]['lookup']['carrier'].append(carrier_id)

    if trade not in lookups[service_id]['lookup']['trade']:
      lookups[service_id]['lookup']['trade'].append(trade)

    for vessel_mmsi in vessel_mmsi_list:
      if vessel_mmsi not in lookups[service_id]['lookup']['vessel_mmsi']:
        lookups[service_id]['lookup']['vessel_mmsi'].append(vessel_mmsi)

    for vessel_type in vessel_type_list:
      if vessel_type not in lookups[service_id]['lookup']['vessel_type']:
        lookups[service_id]['lookup']['vessel_type'].append(vessel_type)

    if transport_edge_no not in lookups[service_id]['lookup'][
      'transport_edge_no']:
      lookups[service_id]['lookup']['transport_edge_no'].append(
          transport_edge_no)

  # format into list
  return list(lookups.values())


"""
LOOKUP:
            'service': [],
            'port_unlocode': [],
            'carrier': [],
            'trade' : [],
            'vessel_mmsi' : [],
            'transport_edge_no' :[],
            'vessel_type': []
"""


def build_json_terminals(carriers, services, vessels, terminals):
  # Initialize terminals
  lookups = {}

  for terminal_id, terminal_info in terminals.items():
    lookup = {
      'terminal': terminal_id,
      'lookup': {
        'service': [],
        'port_unlocode': [],
        'carrier': [],
        'trade': [],
        'vessel_mmsi': [],
        'transport_edge_no': [],
        'vessel_type': []
      }
    }
    lookups[terminal_id] = lookup

  # Go through each edge and add info
  for edge_id, edge_info in services.items():
    service_id = edge_info['service']
    carrier_id = edge_info['carrier']
    port_call_unlocode_1 = edge_info['port_call_unlocode_1']
    port_call_unlocode_2 = edge_info['port_call_unlocode_2']
    terminal_id_a = edge_info['terminal_call_facility_1']
    terminal_id_b = edge_info['terminal_call_facility_2']
    service = edge_info['service']
    trade = edge_info['trade']
    [vessel_mmsi_list, vessel_type_list] = find_vessel_info_by_service(service,
                                                                       vessels)
    transport_edge_no = edge_id

    if port_call_unlocode_1 not in lookups[terminal_id_a]['lookup'][
      'port_unlocode']:
      lookups[terminal_id_a]['lookup']['port_unlocode'].append(
          port_call_unlocode_1)
    if port_call_unlocode_2 not in lookups[terminal_id_a]['lookup'][
      'port_unlocode']:
      lookups[terminal_id_a]['lookup']['port_unlocode'].append(
          port_call_unlocode_2)

    if carrier_id not in lookups[terminal_id_a]['lookup']['carrier']:
      lookups[terminal_id_a]['lookup']['carrier'].append(carrier_id)

    if trade not in lookups[terminal_id_a]['lookup']['trade']:
      lookups[terminal_id_a]['lookup']['trade'].append(trade)

    if service_id not in lookups[terminal_id_a]['lookup']['service']:
      lookups[terminal_id_a]['lookup']['service'].append(service_id)

    for vessel_mmsi in vessel_mmsi_list:
      if vessel_mmsi not in lookups[terminal_id_a]['lookup']['vessel_mmsi']:
        lookups[terminal_id_a]['lookup']['vessel_mmsi'].append(vessel_mmsi)

    for vessel_type in vessel_type_list:
      if vessel_type not in lookups[terminal_id_a]['lookup']['vessel_type']:
        lookups[terminal_id_a]['lookup']['vessel_type'].append(vessel_type)

    if transport_edge_no not in lookups[terminal_id_a]['lookup'][
      'transport_edge_no']:
      lookups[terminal_id_a]['lookup']['transport_edge_no'].append(
          transport_edge_no)

    # Now do second terminal
    if port_call_unlocode_1 not in lookups[terminal_id_b]['lookup'][
      'port_unlocode']:
      lookups[terminal_id_b]['lookup']['port_unlocode'].append(
          port_call_unlocode_1)
    if port_call_unlocode_2 not in lookups[terminal_id_b]['lookup'][
      'port_unlocode']:
      lookups[terminal_id_b]['lookup']['port_unlocode'].append(
          port_call_unlocode_2)

    if carrier_id not in lookups[terminal_id_b]['lookup']['carrier']:
      lookups[terminal_id_b]['lookup']['carrier'].append(carrier_id)

    if trade not in lookups[terminal_id_b]['lookup']['trade']:
      lookups[terminal_id_b]['lookup']['trade'].append(trade)

    for vessel_mmsi in vessel_mmsi_list:
      if vessel_mmsi not in lookups[terminal_id_b]['lookup']['vessel_mmsi']:
        lookups[terminal_id_b]['lookup']['vessel_mmsi'].append(vessel_mmsi)

    for vessel_type in vessel_type_list:
      if vessel_type not in lookups[terminal_id_b]['lookup']['vessel_type']:
        lookups[terminal_id_b]['lookup']['vessel_type'].append(vessel_type)

    if transport_edge_no not in lookups[terminal_id_b]['lookup'][
      'transport_edge_no']:
      lookups[terminal_id_b]['lookup']['transport_edge_no'].append(
          transport_edge_no)

  # format into list
  return list(lookups.values())


"""
            'service': [],
            'terminal': [],
            'carrier': [],
            'trade' : [],
            'vessel_mmsi' : [],
            'transport_edge_no' :[],
            'vessel_type': []
"""


def build_json_port_unlocode(carriers, services, vessels, terminals):
  # Initialize ports
  lookups = {}

  for _, terminal_info in terminals.items():
    port_unlocode = terminal_info['port_unlocode']
    lookup = {
      'port_unlocode': port_unlocode,
      'lookup': {
        'service': [],
        'terminal': [],
        'carrier': [],
        'trade': [],
        'vessel_mmsi': [],
        'transport_edge_no': [],
        'vessel_type': []
      }
    }
    lookups[port_unlocode] = lookup

  # Go through each edge and add info
  for edge_id, edge_info in services.items():
    service_id = edge_info['service']
    carrier_id = edge_info['carrier']
    port_call_unlocode_1 = edge_info['port_call_unlocode_1']
    port_call_unlocode_2 = edge_info['port_call_unlocode_2']
    terminal_id_a = edge_info['terminal_call_facility_1']
    terminal_id_b = edge_info['terminal_call_facility_2']
    service = edge_info['service']
    trade = edge_info['trade']
    [vessel_mmsi_list, vessel_type_list] = find_vessel_info_by_service(service,
                                                                       vessels)
    transport_edge_no = edge_id

    if terminal_id_a not in lookups[port_call_unlocode_1]['lookup']['terminal']:
      lookups[port_call_unlocode_1]['lookup']['terminal'].append(terminal_id_a)
    if terminal_id_b not in lookups[port_call_unlocode_1]['lookup']['terminal']:
      lookups[port_call_unlocode_1]['lookup']['terminal'].append(terminal_id_b)

    if carrier_id not in lookups[port_call_unlocode_1]['lookup']['carrier']:
      lookups[port_call_unlocode_1]['lookup']['carrier'].append(carrier_id)

    if trade not in lookups[port_call_unlocode_1]['lookup']['trade']:
      lookups[port_call_unlocode_1]['lookup']['trade'].append(trade)

    if service_id not in lookups[port_call_unlocode_1]['lookup']['service']:
      lookups[port_call_unlocode_1]['lookup']['service'].append(service_id)

    for vessel_mmsi in vessel_mmsi_list:
      if vessel_mmsi not in lookups[port_call_unlocode_1]['lookup'][
        'vessel_mmsi']:
        lookups[port_call_unlocode_1]['lookup']['vessel_mmsi'].append(
            vessel_mmsi)

    for vessel_type in vessel_type_list:
      if vessel_type not in lookups[port_call_unlocode_1]['lookup'][
        'vessel_type']:
        lookups[port_call_unlocode_1]['lookup']['vessel_type'].append(
            vessel_type)

    if transport_edge_no not in lookups[port_call_unlocode_1]['lookup'][
      'transport_edge_no']:
      lookups[port_call_unlocode_1]['lookup']['transport_edge_no'].append(
          transport_edge_no)

    # Now do second terminal
    if terminal_id_a not in lookups[port_call_unlocode_2]['lookup']['terminal']:
      lookups[port_call_unlocode_2]['lookup']['terminal'].append(terminal_id_a)
    if terminal_id_b not in lookups[port_call_unlocode_2]['lookup']['terminal']:
      lookups[port_call_unlocode_2]['lookup']['terminal'].append(terminal_id_b)
    if carrier_id not in lookups[port_call_unlocode_2]['lookup']['carrier']:
      lookups[port_call_unlocode_2]['lookup']['carrier'].append(carrier_id)
    if trade not in lookups[port_call_unlocode_2]['lookup']['trade']:
      lookups[port_call_unlocode_2]['lookup']['trade'].append(trade)

    for vessel_mmsi in vessel_mmsi_list:
      if vessel_mmsi not in lookups[port_call_unlocode_2]['lookup'][
        'vessel_mmsi']:
        lookups[port_call_unlocode_2]['lookup']['vessel_mmsi'].append(
            vessel_mmsi)

    for vessel_type in vessel_type_list:
      if vessel_type not in lookups[port_call_unlocode_2]['lookup'][
        'vessel_type']:
        lookups[port_call_unlocode_2]['lookup']['vessel_type'].append(
            vessel_type)

    if transport_edge_no not in lookups[port_call_unlocode_2]['lookup'][
      'transport_edge_no']:
      lookups[port_call_unlocode_2]['lookup']['transport_edge_no'].append(
          transport_edge_no)

  # format into list
  # print("\n\n\nResulting list:", list(lookups.values()))
  return list(lookups.values())


"""
            'service': [],
            'terminal': [],
            'carrier': [],
            'trade' : [],
            'vessel_mmsi' : [],
            'transport_edge_no' :[],
            'vessel_type': []
"""


def build_json_port_unlocode(carriers, services, vessels, terminals):
  # Initialize ports
  lookups = {}

  for _, terminal_info in terminals.items():
    port_unlocode = terminal_info['port_unlocode']
    lookup = {
      'port_unlocode': port_unlocode,
      'lookup': {
        'service': [],
        'terminal': [],
        'carrier': [],
        'trade': [],
        'vessel_mmsi': [],
        'transport_edge_no': [],
        'vessel_type': []
      }
    }
    lookups[port_unlocode] = lookup

  # Go through each edge and add info
  for edge_id, edge_info in services.items():
    service_id = edge_info['service']
    carrier_id = edge_info['carrier']
    port_call_unlocode_1 = edge_info['port_call_unlocode_1']
    port_call_unlocode_2 = edge_info['port_call_unlocode_2']
    terminal_id_a = edge_info['terminal_call_facility_1']
    terminal_id_b = edge_info['terminal_call_facility_2']
    service = edge_info['service']
    trade = edge_info['trade']
    [vessel_mmsi_list, vessel_type_list] = find_vessel_info_by_service(service,
                                                                       vessels)
    transport_edge_no = edge_id

    if terminal_id_a not in lookups[port_call_unlocode_1]['lookup']['terminal']:
      lookups[port_call_unlocode_1]['lookup']['terminal'].append(terminal_id_a)
    if terminal_id_b not in lookups[port_call_unlocode_1]['lookup']['terminal']:
      lookups[port_call_unlocode_1]['lookup']['terminal'].append(terminal_id_b)

    if carrier_id not in lookups[port_call_unlocode_1]['lookup']['carrier']:
      lookups[port_call_unlocode_1]['lookup']['carrier'].append(carrier_id)

    if trade not in lookups[port_call_unlocode_1]['lookup']['trade']:
      lookups[port_call_unlocode_1]['lookup']['trade'].append(trade)

    if service_id not in lookups[port_call_unlocode_1]['lookup']['service']:
      lookups[port_call_unlocode_1]['lookup']['service'].append(service_id)

    for vessel_mmsi in vessel_mmsi_list:
      if vessel_mmsi not in lookups[port_call_unlocode_1]['lookup'][
        'vessel_mmsi']:
        lookups[port_call_unlocode_1]['lookup']['vessel_mmsi'].append(
            vessel_mmsi)

    for vessel_type in vessel_type_list:
      if vessel_type not in lookups[port_call_unlocode_1]['lookup'][
        'vessel_type']:
        lookups[port_call_unlocode_1]['lookup']['vessel_type'].append(
            vessel_type)

    if transport_edge_no not in lookups[port_call_unlocode_1]['lookup'][
      'transport_edge_no']:
      lookups[port_call_unlocode_1]['lookup']['transport_edge_no'].append(
          transport_edge_no)

    # Now do second terminal
    if terminal_id_a not in lookups[port_call_unlocode_2]['lookup']['terminal']:
      lookups[port_call_unlocode_2]['lookup']['terminal'].append(terminal_id_a)
    if terminal_id_b not in lookups[port_call_unlocode_2]['lookup']['terminal']:
      lookups[port_call_unlocode_2]['lookup']['terminal'].append(terminal_id_b)
    if carrier_id not in lookups[port_call_unlocode_2]['lookup']['carrier']:
      lookups[port_call_unlocode_2]['lookup']['carrier'].append(carrier_id)
    if trade not in lookups[port_call_unlocode_2]['lookup']['trade']:
      lookups[port_call_unlocode_2]['lookup']['trade'].append(trade)

    for vessel_mmsi in vessel_mmsi_list:
      if vessel_mmsi not in lookups[port_call_unlocode_2]['lookup'][
        'vessel_mmsi']:
        lookups[port_call_unlocode_2]['lookup']['vessel_mmsi'].append(
            vessel_mmsi)

    for vessel_type in vessel_type_list:
      if vessel_type not in lookups[port_call_unlocode_2]['lookup'][
        'vessel_type']:
        lookups[port_call_unlocode_2]['lookup']['vessel_type'].append(
            vessel_type)

    if transport_edge_no not in lookups[port_call_unlocode_2]['lookup'][
      'transport_edge_no']:
      lookups[port_call_unlocode_2]['lookup']['transport_edge_no'].append(
          transport_edge_no)

  # format into list
  # print("\n\n\nResulting list:", list(lookups.values()))
  return list(lookups.values())


"""
            'service': [],
            'terminal': [],
            'carrier': [],
            'port_unlocode' : [],
            'vessel_mmsi' : [],
            'transport_edge_no' :[],
            'vessel_type': []
"""


def build_json_trade(carriers, services, vessels, terminals):
  # Initialize ports
  lookups = {}

  for _, service_info in services.items():
    trade = service_info['trade']
    lookup = {
      'trade': trade,
      'lookup': {
        'service': [],
        'terminal': [],
        'carrier': [],
        'port_unlocode': [],
        'vessel_mmsi': [],
        'transport_edge_no': [],
        'vessel_type': []
      }
    }
    lookups[trade] = lookup

  # Go through each edge and add info
  for edge_id, edge_info in services.items():
    service_id = edge_info['service']
    carrier_id = edge_info['carrier']
    port_call_unlocode_1 = edge_info['port_call_unlocode_1']
    port_call_unlocode_2 = edge_info['port_call_unlocode_2']
    terminal_id_a = edge_info['terminal_call_facility_1']
    terminal_id_b = edge_info['terminal_call_facility_2']
    service = edge_info['service']
    trade = edge_info['trade']
    [vessel_mmsi_list, vessel_type_list] = find_vessel_info_by_service(service,
                                                                       vessels)
    transport_edge_no = edge_id

    if terminal_id_a not in lookups[trade]['lookup']['terminal']:
      lookups[trade]['lookup']['terminal'].append(terminal_id_a)
    if terminal_id_b not in lookups[trade]['lookup']['terminal']:
      lookups[trade]['lookup']['terminal'].append(terminal_id_b)

    if port_call_unlocode_1 not in lookups[trade]['lookup']['port_unlocode']:
      lookups[trade]['lookup']['port_unlocode'].append(port_call_unlocode_1)
    if port_call_unlocode_2 not in lookups[trade]['lookup']['port_unlocode']:
      lookups[trade]['lookup']['port_unlocode'].append(port_call_unlocode_2)

    if carrier_id not in lookups[trade]['lookup']['carrier']:
      lookups[trade]['lookup']['carrier'].append(carrier_id)

    # if trade not in lookups[trade]['lookup']['trade']:
    #     lookups[trade]['lookup']['trade'].append(trade)

    if service_id not in lookups[trade]['lookup']['service']:
      lookups[trade]['lookup']['service'].append(service_id)

    for vessel_mmsi in vessel_mmsi_list:
      if vessel_mmsi not in lookups[trade]['lookup']['vessel_mmsi']:
        lookups[trade]['lookup']['vessel_mmsi'].append(vessel_mmsi)

    for vessel_type in vessel_type_list:
      if vessel_type not in lookups[trade]['lookup']['vessel_type']:
        lookups[trade]['lookup']['vessel_type'].append(vessel_type)

    if transport_edge_no not in lookups[trade]['lookup']['transport_edge_no']:
      lookups[trade]['lookup']['transport_edge_no'].append(transport_edge_no)

  # format into list
  # print("\n\n\nResulting list:", list(lookups.values()))
  return list(lookups.values())


"""
            'service': [],
            'terminal': [],
            'carrier': [],
            'port_unlocode' : [],
            'trade' : [],
            'transport_edge_no' :[],
            'vessel_type': []
"""


def build_json_vessel_mmsi(carriers, services, vessels, terminals):
  # Initialize ports
  lookups = {}

  for vessel in vessels:
    vessel_mmsi = vessel['vessel_mmsi']
    lookup = {
      'vessel_mmsi': vessel_mmsi,
      'lookup': {
        'service': [],
        'terminal': [],
        'carrier': [],
        'port_unlocode': [],
        'trade': [],
        'transport_edge_no': [],
        'vessel_type': []
      }
    }
    lookups[vessel_mmsi] = lookup

  # Go through each edge and add info
  for edge_id, edge_info in services.items():
    service_id = edge_info['service']
    carrier_id = edge_info['carrier']
    port_call_unlocode_1 = edge_info['port_call_unlocode_1']
    port_call_unlocode_2 = edge_info['port_call_unlocode_2']
    terminal_id_a = edge_info['terminal_call_facility_1']
    terminal_id_b = edge_info['terminal_call_facility_2']
    service = edge_info['service']
    trade = edge_info['trade']
    [vessel_mmsi_list, vessel_type_list] = find_vessel_info_by_service(service,
                                                                       vessels)
    transport_edge_no = edge_id

    for vessel_mmsi in vessel_mmsi_list:
      if terminal_id_a not in lookups[vessel_mmsi]['lookup']['terminal']:
        lookups[vessel_mmsi]['lookup']['terminal'].append(terminal_id_a)
      if terminal_id_b not in lookups[vessel_mmsi]['lookup']['terminal']:
        lookups[vessel_mmsi]['lookup']['terminal'].append(terminal_id_b)

      if port_call_unlocode_1 not in lookups[vessel_mmsi]['lookup'][
        'port_unlocode']:
        lookups[vessel_mmsi]['lookup']['port_unlocode'].append(
            port_call_unlocode_1)
      if port_call_unlocode_2 not in lookups[vessel_mmsi]['lookup'][
        'port_unlocode']:
        lookups[vessel_mmsi]['lookup']['port_unlocode'].append(
            port_call_unlocode_2)

      if carrier_id not in lookups[vessel_mmsi]['lookup']['carrier']:
        lookups[vessel_mmsi]['lookup']['carrier'].append(carrier_id)

      if trade not in lookups[vessel_mmsi]['lookup']['trade']:
        lookups[vessel_mmsi]['lookup']['trade'].append(trade)

      if service_id not in lookups[vessel_mmsi]['lookup']['service']:
        lookups[vessel_mmsi]['lookup']['service'].append(service_id)

      # for vessel_mmsi in vessel_mmsi_list:
      #
      #     if vessel_mmsi not in lookups[trade]['lookup']['vessel_mmsi']:
      #         lookups[trade]['lookup']['vessel_mmsi'].append(vessel_mmsi)

      for vessel_type in vessel_type_list:
        if vessel_type not in lookups[vessel_mmsi]['lookup']['vessel_type']:
          lookups[vessel_mmsi]['lookup']['vessel_type'].append(vessel_type)

      if transport_edge_no not in lookups[vessel_mmsi]['lookup'][
        'transport_edge_no']:
        lookups[vessel_mmsi]['lookup']['transport_edge_no'].append(
            transport_edge_no)

  # format into list
  # print("\n\n\nResulting list:", list(lookups.values()))
  return list(lookups.values())


"""
            'service': [],
            'terminal': [],
            'carrier': [],
            'port_unlocode' : [],
            'trade' : [],
            'vessel_mmsi' :[],
            'vessel_type': []
"""


def build_json_transport_edge_no(carriers, services, vessels, terminals):
  # Initialize
  lookups = {}

  for transport_edge_no, _ in services.items():
    lookup = {
      'transport_edge_no': transport_edge_no,
      'lookup': {
        'service': [],
        'terminal': [],
        'carrier': [],
        'port_unlocode': [],
        'trade': [],
        'vessel_mmsi': [],
        'vessel_type': []
      }
    }
    lookups[transport_edge_no] = lookup

  # Go through each edge and add info
  for edge_id, edge_info in services.items():
    service_id = edge_info['service']
    carrier_id = edge_info['carrier']
    port_call_unlocode_1 = edge_info['port_call_unlocode_1']
    port_call_unlocode_2 = edge_info['port_call_unlocode_2']
    terminal_id_a = edge_info['terminal_call_facility_1']
    terminal_id_b = edge_info['terminal_call_facility_2']
    service = edge_info['service']
    trade = edge_info['trade']
    [vessel_mmsi_list, vessel_type_list] = find_vessel_info_by_service(service,
                                                                       vessels)
    transport_edge_no = edge_id

    if terminal_id_a not in lookups[transport_edge_no]['lookup']['terminal']:
      lookups[transport_edge_no]['lookup']['terminal'].append(terminal_id_a)
    if terminal_id_b not in lookups[transport_edge_no]['lookup']['terminal']:
      lookups[transport_edge_no]['lookup']['terminal'].append(terminal_id_b)

    if port_call_unlocode_1 not in lookups[transport_edge_no]['lookup'][
      'port_unlocode']:
      lookups[transport_edge_no]['lookup']['port_unlocode'].append(
          port_call_unlocode_1)
    if port_call_unlocode_2 not in lookups[transport_edge_no]['lookup'][
      'port_unlocode']:
      lookups[transport_edge_no]['lookup']['port_unlocode'].append(
          port_call_unlocode_2)

    if carrier_id not in lookups[transport_edge_no]['lookup']['carrier']:
      lookups[transport_edge_no]['lookup']['carrier'].append(carrier_id)

    if trade not in lookups[transport_edge_no]['lookup']['trade']:
      lookups[transport_edge_no]['lookup']['trade'].append(trade)

    if service_id not in lookups[transport_edge_no]['lookup']['service']:
      lookups[transport_edge_no]['lookup']['service'].append(service_id)

    for vessel_mmsi in vessel_mmsi_list:
      if vessel_mmsi not in lookups[transport_edge_no]['lookup']['vessel_mmsi']:
        lookups[transport_edge_no]['lookup']['vessel_mmsi'].append(vessel_mmsi)

    for vessel_type in vessel_type_list:
      if vessel_type not in lookups[transport_edge_no]['lookup']['vessel_type']:
        lookups[transport_edge_no]['lookup']['vessel_type'].append(vessel_type)

    # if transport_edge_no not in lookups[vessel_mmsi]['lookup']['transport_edge_no']:
    #     lookups[vessel_mmsi]['lookup']['transport_edge_no'].append(transport_edge_no)

  # format into list
  # print("\n\n\nResulting list:", list(lookups.values()))
  return list(lookups.values())


"""
            'service': [],
            'terminal': [],
            'carrier': [],
            'port_unlocode' : [],
            'trade' : [],
            'transport_edge_no' :[],
            'vessel_mmsi': []
"""


def build_json_vessel_type(carriers, services, vessels, terminals):
  # Initialize
  lookups = {}

  for vessel in vessels:
    vessel_type = vessel['vessel_type']

    lookup = {
      'vessel_type': vessel_type,
      'lookup': {
        'service': [],
        'terminal': [],
        'carrier': [],
        'port_unlocode': [],
        'trade': [],
        'vessel_mmsi': [],
        'transport_edge_no': []
      }
    }
    lookups[vessel_type] = lookup

  # Go through each edge and add info
  for edge_id, edge_info in services.items():
    service_id = edge_info['service']
    carrier_id = edge_info['carrier']
    port_call_unlocode_1 = edge_info['port_call_unlocode_1']
    port_call_unlocode_2 = edge_info['port_call_unlocode_2']
    terminal_id_a = edge_info['terminal_call_facility_1']
    terminal_id_b = edge_info['terminal_call_facility_2']
    service = edge_info['service']
    trade = edge_info['trade']
    [vessel_mmsi_list, vessel_type_list] = find_vessel_info_by_service(service,
                                                                       vessels)
    transport_edge_no = edge_id

    for vessel_type in vessel_type_list:
      if terminal_id_a not in lookups[vessel_type]['lookup']['terminal']:
        lookups[vessel_type]['lookup']['terminal'].append(terminal_id_a)
      if terminal_id_b not in lookups[vessel_type]['lookup']['terminal']:
        lookups[vessel_type]['lookup']['terminal'].append(terminal_id_b)

      if port_call_unlocode_1 not in lookups[vessel_type]['lookup'][
        'port_unlocode']:
        lookups[vessel_type]['lookup']['port_unlocode'].append(
            port_call_unlocode_1)
      if port_call_unlocode_2 not in lookups[vessel_type]['lookup'][
        'port_unlocode']:
        lookups[vessel_type]['lookup']['port_unlocode'].append(
            port_call_unlocode_2)

      if carrier_id not in lookups[vessel_type]['lookup']['carrier']:
        lookups[vessel_type]['lookup']['carrier'].append(carrier_id)

      if trade not in lookups[vessel_type]['lookup']['trade']:
        lookups[vessel_type]['lookup']['trade'].append(trade)

      if service_id not in lookups[vessel_type]['lookup']['service']:
        lookups[vessel_type]['lookup']['service'].append(service_id)

      for vessel_mmsi in vessel_mmsi_list:
        if vessel_mmsi not in lookups[vessel_type]['lookup']['vessel_mmsi']:
          lookups[vessel_type]['lookup']['vessel_mmsi'].append(vessel_mmsi)
      #
      # for vessel_type in vessel_type_list:
      #     if vessel_type not in lookups[transport_edge_no]['lookup']['vessel_type']:
      #         lookups[transport_edge_no]['lookup']['vessel_type'].append(vessel_type)

      if transport_edge_no not in lookups[vessel_type]['lookup'][
        'transport_edge_no']:
        lookups[vessel_type]['lookup']['transport_edge_no'].append(
            transport_edge_no)

  # format into list
  # print("\n\n\nResulting list:", list(lookups.values()))
  return list(lookups.values())


def build_all_lookups(
    terminal_location,
    carrier_location,
    master_schedules_edges_location,
    vessel_location,
    output_location=None):

  terminals = load_terminals(terminal_location)
  carriers = load_carriers(carrier_location)
  edges = load_master_schedules_edges(master_schedules_edges_location)
  vessels = load_vessels(vessel_location)

  carrier_lookups = build_json_carriers(carriers, edges, vessels)
  service_lookups = build_json_services(carriers, edges, vessels, terminals)
  terminals_lookups = build_json_terminals(carriers, edges, vessels, terminals)
  port_unlocode_lookups = build_json_port_unlocode(carriers, edges, vessels, terminals)
  trade_lookups = build_json_trade(carriers, edges, vessels, terminals)
  vessel_mmsi_lookups = build_json_vessel_mmsi(carriers, edges, vessels, terminals)
  transport_edge_no_lookups = build_json_transport_edge_no(carriers, edges, vessels, terminals)
  vessel_type_lookups = build_json_vessel_type(carriers, edges, vessels, terminals)

  lookups = {
    "carrier": carrier_lookups,
    "service": service_lookups,
    "terminal": terminals_lookups,
    "port_unlocode": port_unlocode_lookups,
    "trade": trade_lookups,
    "vessel_mmsi": vessel_mmsi_lookups,
    "transport_edge_no": transport_edge_no_lookups,
    "vessel_type": vessel_type_lookups
  }

  if output_location:
    return dump_to_file(output_location, lookups)

  else:
    return json.dumps(lookups)
