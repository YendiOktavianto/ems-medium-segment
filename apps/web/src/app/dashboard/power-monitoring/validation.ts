import { DeviceData } from "./types";

// Pastikan device valid
export function validateDevice(device?: DeviceData | null): DeviceData | null {
  if (!device) return null;

  return {
    serial_number: device.serial_number || "-",
    address_name: device.address_name || "-",
    detail_location: device.detail_location || "-",
    watt_phase: device.watt_phase || "-",
    segment: device.segment || "-",
    voltage: device.voltage ?? 0,
    current: device.current ?? 0,
    powerFactor: device.powerFactor ?? 0,
    frequency: device.frequency ?? 0,
    power: device.power ?? 0,
    energyUsage: device.energyUsage ?? 0,
    timestamp: device.timestamp || new Date().toISOString(),
  };
}

// Pastikan data chart valid
export function validateChartData(data: any[]): { time: string; value: number }[] {
  return data
    .filter(d => d && d.time && typeof d.value === "number")
    .map(d => ({ time: d.time, value: d.value }));
}
