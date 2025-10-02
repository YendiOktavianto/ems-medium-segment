// types.ts
export interface Device {
  userId?: string;
  serial_number: string;
  location: string;
  detail_location: string;
  wattage: string;
  segment: string;
  active: boolean;
}
