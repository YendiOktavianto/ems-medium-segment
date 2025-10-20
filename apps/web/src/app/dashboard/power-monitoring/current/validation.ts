import { Device } from "./types";

export const isValidDevice = (device: any): device is Device => {
  return device &&
    typeof device.id === "string" &&
    typeof device.serial_number === "string" &&
    typeof device.address_name === "string" &&
    typeof device.detail_location === "string" &&
    typeof device.watt_phase === "string" &&
    typeof device.segment === "string";
};
