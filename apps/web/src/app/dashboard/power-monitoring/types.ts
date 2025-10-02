export interface DeviceData {
  serial_number: string;
  address_name: string;
  detail_location: string;
  watt_phase: string;
  segment: string;
  voltage: number;
  current: number;
  frequency: number;
  power: number;
  powerFactor: number;
  energyUsage: number;
  timestamp: string; // optional, untuk chart
}
