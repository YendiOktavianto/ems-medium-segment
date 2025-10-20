import { useState, useEffect } from "react";
import { Device, EnergyUsageData } from "./types";
import { API_URL } from "./constants";
import { isValidDevice } from "./validation";

export const useEnergyUsage = (token: string) => {
  const [devices, setDevices] = useState<Device[]>([]);
  const [selectedDevice, setSelectedDevice] = useState(0);
  const [currentDevice, setCurrentDevice] = useState<Device | undefined>();
  const [allData, setAllData] = useState<EnergyUsageData[]>([]);
  const [currentValue, setCurrentValue] = useState(0);

  // fetch device milik user
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

  // simulasi update EnergyUsage tiap 2 detik
  useEffect(() => {
    const interval = setInterval(() => {
      if (!currentDevice) return;
      const now = new Date().toLocaleTimeString("id-ID", { hour12: false });
      const newVal = Math.floor(Math.random() * 50);
      setCurrentValue(newVal);
      setAllData(prev => [...prev, { time: now, EnergyUsage: newVal }].slice(-15));
    }, 2000);

    return () => clearInterval(interval);
  }, [currentDevice]);

  return { devices, selectedDevice, setSelectedDevice, currentDevice, allData, currentValue };
};
