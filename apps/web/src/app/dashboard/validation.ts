import { Location } from "./types";

export function validateLocations(data: Location[]): boolean {
  if (!Array.isArray(data)) return false;
  return data.every(
    (loc) =>
      typeof loc.id === "number" &&
      typeof loc.lat === "number" &&
      typeof loc.lng === "number" &&
      typeof loc.address_name === "string" &&
      typeof loc.isActive === "boolean"
  );
}
