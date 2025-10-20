// useHome.ts
import { useState, useEffect } from "react";
import { Device } from "./types";
import { API_ENDPOINT } from "./constants";

export function useHome(userId?: string, token?: string) {
  const [devices, setDevices] = useState<Device[]>([]);
  const [selectedDeviceId, setSelectedDeviceId] = useState<string>("");

  useEffect(() => {
    if (!userId) return;

    const fetchDevices = async () => {
      try {
        const res = await fetch(`${API_ENDPOINT}?userId=${userId}`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
        const data: Device[] = await res.json();
        setDevices(data);

        if (data.length > 0) {
          setSelectedDeviceId(data[0].device_id);
        }
      } catch (error) {
        console.error("Error fetching devices:", error);
      }
    };

    fetchDevices();
  }, [userId, token]);

  const currentDevice: Device | null =
    devices.find((d) => d.device_id === selectedDeviceId) ?? null;

  return {
    devices,
    selectedDeviceId,
    setSelectedDeviceId,
    currentDevice,
  };
}
