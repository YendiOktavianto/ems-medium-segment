import { useState, useEffect } from "react";
import { Device, CurrentData } from "./types";
import { API_URL } from "./constants";
import { isValidDevice } from "./validation";

export const useCurrent = (token: string) => {
  const [devices, setDevices] = useState<Device[]>([]);
  const [selectedDevice, setSelectedDevice] = useState(0);
  const [currentDevice, setCurrentDevice] = useState<Device | undefined>();
  const [allData, setAllData] = useState<CurrentData[]>([]);

  // fetch devices milik user
  useEffect(() => {
    fetch(`${API_URL}/devices/my-devices`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(res => res.json())
      .then(data => {
        const validDevices = data.filter(isValidDevice);
        setDevices(validDevices);
        setCurrentDevice(validDevices[0]);
      })
      .catch(console.error);
  }, [token]);

  // update currentDevice saat ganti select
  useEffect(() => {
    setCurrentDevice(devices[selectedDevice]);
  }, [selectedDevice, devices]);

  // simulasi data realtime current
  useEffect(() => {
    const interval = setInterval(() => {
      if (!currentDevice) return;
      const now = new Date().toLocaleTimeString("id-ID", { hour12: false });
      const newVal = Math.floor(Math.random() * 50);
      setAllData(prev => [...prev, { time: now, current: newVal }].slice(-15));
    }, 2000);

    return () => clearInterval(interval);
  }, [currentDevice]);

  return { devices, selectedDevice, setSelectedDevice, currentDevice, allData };
};
