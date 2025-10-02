export interface Device {
  userId?: string;
  device_id: string;
  address_name: string;
  detail_location: string;
  watt_phase?: string;
  segment?: string;
  voltage?: number;
  current?: number;
  frequency?: number;
  power?: number;
  power_Factor?: number;
  total_energy_usage_today?: number;
  total_energy_usage_Mtd?: number;
  total_energy_cost_today?: number;
  total_energy_cost_mtd?: number;
}
