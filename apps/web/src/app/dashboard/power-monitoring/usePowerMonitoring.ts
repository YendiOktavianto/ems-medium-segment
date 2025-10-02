import { useState, useEffect } from "react";

export interface Device {
  serial_number: string;
  address_name: string;
  detail_location: string;
  watt_phase: string;
  segment: string;
  voltage?: number;
  current?: number;
  frequency?: number;
  power?: number;
  powerFactor?: number;
  energyUsage?: number;
}

export function usePowerMonitoring(userId: string, token?: string) {
  const [devices, setDevices] = useState<Device[]>([]);
  const [selectedDevice, setSelectedDevice] = useState<number>(0);
  const [allData, setAllData] = useState<any[]>([]);
  const currentDevice = devices[selectedDevice] ?? null;

  useEffect(() => {
    const fetchDevices = async () => {
      try {
        const res = await fetch(`http://localhost:5000/devices?userId=${userId}`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
        const data: Device[] = await res.json();
        setDevices(data);
        setSelectedDevice(0);
      } catch (err) {
        console.error("Failed to fetch devices:", err);
      }
    };

    fetchDevices();
  }, [userId, token]);

  useEffect(() => {
    // simulasi update chart realtime
    const interval = setInterval(() => {
      const now = new Date();
      const time = now.toLocaleTimeString("id-ID", { hour12: false });

      if (!currentDevice) return;

      const voltage = 200 + Math.floor(Math.random() * 100);
      const current = Math.floor(Math.random() * 50);
      const frequency = parseFloat((49 + Math.random() * 2).toFixed(2));
      const power = 500 + Math.floor(Math.random() * 4000);
      const powerFactor = parseFloat((0.5 + Math.random() * 0.5).toFixed(2));
      const energyUsage = parseFloat((5 + Math.random() * 45).toFixed(2));

      setAllData(prev =>
        [...prev, { time, Voltage: voltage, Current: current, Frequency: frequency, Power: power, PowerFactor: powerFactor, EnergyUsage: energyUsage }].slice(-15)
      );
    }, 2000);

    return () => clearInterval(interval);
  }, [currentDevice]);

  return { devices, selectedDevice, setSelectedDevice, currentDevice, allData };
}
