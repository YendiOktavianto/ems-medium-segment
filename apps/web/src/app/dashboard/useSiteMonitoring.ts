import { useState, useEffect } from "react";
import { Location } from "./types";
import { LOCATIONS_API } from "./constants";
import { validateLocations } from "./validation";

export function useSiteMonitoring(userId?: string, token?: string) {
  const [locations, setLocations] = useState<Location[]>([]);
  const [center, setCenter] = useState<{ lat: number; lng: number }>({ lat: 0, lng: 0 });

  useEffect(() => {
    if (!userId) return;

    fetch(`${LOCATIONS_API}?userId=${userId}`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    })
      .then((res) => res.json())
      .then((data: Location[]) => {
        if (!validateLocations(data)) throw new Error("Invalid data format");

        setLocations(data);
        if (data.length > 0) {
          const lats = data.map((l) => l.lat);
          const lngs = data.map((l) => l.lng);
          setCenter({
            lat: (Math.min(...lats) + Math.max(...lats)) / 2,
            lng: (Math.min(...lngs) + Math.max(...lngs)) / 2,
          });
        }
      })
      .catch((err) => console.error(err));
  }, [userId, token]);

  return { locations, center };
}
