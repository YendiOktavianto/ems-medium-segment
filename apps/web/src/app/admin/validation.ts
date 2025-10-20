import { Device } from "./types";

export function formatValue(value?: number | string, unit?: string) {
  if (value === null || value === undefined) return "-";
  return unit ? `${value} ${unit}` : String(value);
}

export function formatCurrency(value: number | null | undefined) {
  if (value == null || Number.isNaN(value)) return "-";
  return Number(value).toLocaleString("id-ID");
}

export function validateDevice(device?: Device) {
  return device ? device : null;
}
