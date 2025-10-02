export interface Device {
  id: string;
  serial_number: string;
  address_name: string;
  detail_location: string;
  watt_phase: string;
  segment: string;
}

export interface EnergyUsageData {
  time: string;
  EnergyUsage: number;
}
