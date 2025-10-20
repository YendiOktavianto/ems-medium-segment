import { useState, useEffect } from "react";
import { Device } from "./types";
import { API_ENDPOINT } from "./constants";

export function useGeneralInfo(userId?: string, token?: string) {
  const [devices, setDevices] = useState<Device[]>([]);
  const [selectedDeviceIndex, setSelectedDeviceIndex] = useState(0);

  useEffect(() => {
    if (!userId) return;

    const fetchDevices = async () => {
      try {
        const res = await fetch(`${API_ENDPOINT}?userId=${userId}`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
        const data: Device[] = await res.json();
        setDevices(data);
        setSelectedDeviceIndex(0); // default pilih device pertama
      } catch (err) {
        console.error("Error fetching devices:", err);
      }
    };

    fetchDevices();
  }, [userId, token]);

  const currentDevice = devices[selectedDeviceIndex] || null;

  return { devices, selectedDeviceIndex, setSelectedDeviceIndex, currentDevice };
}
