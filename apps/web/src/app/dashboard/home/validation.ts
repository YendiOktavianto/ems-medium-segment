// validation.ts
import { Device } from "./types";

export function formatValue(value?: number | string, unit?: string) {
  if (value === null || value === undefined) return "-";
  return unit ? `${value} ${unit}` : value;
}

export function formatCurrency(value?: number) {
  if (value === null || value === undefined) return "-";
  return value.toLocaleString("id-ID");
}

export function validateDevice(device?: Device) {
  return device ? device : null;
}
