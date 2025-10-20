// ./useGeneralInfo.ts
"use client";

import { useEffect, useMemo, useState } from "react";

export type DeviceGeneralInfo = {
  device_id: string;
  serial_number: string;
  location?: string;        // alias: address_name
  address_name?: string;    // alias: location
  detail_location?: string;
  wattage?: string;         // alias: watt_phase
  watt_phase?: string;      // alias: wattage
  segment?: string;
  active?: boolean;
};

export function useGeneralInfo(userId?: string, token?: string) {
  const [devices, setDevices] = useState<DeviceGeneralInfo[]>([]);
  const [selectedDeviceIndex, setSelectedDeviceIndex] = useState<number>(0);

  useEffect(() => {
    // --- MOCK DATA (ganti dengan fetch ke API kamu nanti) ---
    const MOCK: DeviceGeneralInfo[] = [
      {
        device_id: "EMS-ALFA-001",
        serial_number: "SN-ALFA-001",
        location: "Rumah Utama",
        detail_location: "Jl. Merdeka No. 10, Salatiga",
        wattage: "2200VA / 1-Phase",
        segment: "Residential",
        active: true,
      },
      {
        device_id: "EMS-ALFA-002",
        serial_number: "SN-ALFA-002",
        address_name: "Toko Alfamart Salatiga 1",
        detail_location: "Jl. Diponegoro No. 21, Salatiga",
        watt_phase: "3500VA / 1-Phase",
        segment: "Retail",
        active: true,
      },
      {
        device_id: "EMS-ALFA-003",
        serial_number: "SN-ALFA-003",
        location: "Kantor Pusat Cabang",
        detail_location: "Jl. Malioboro No. 1, Yogyakarta",
        wattage: "6600VA / 3-Phase",
        segment: "Office",
        active: false,
      },
    ];

    setDevices(MOCK);
    setSelectedDeviceIndex(0);
  }, [userId]);

  // jaga-jaga kalau index keluar range saat devices berubah
  useEffect(() => {
    if (devices.length && selectedDeviceIndex > devices.length - 1) {
      setSelectedDeviceIndex(0);
    }
  }, [devices.length, selectedDeviceIndex]);

  const currentDevice = useMemo(
    () => (devices.length ? devices[selectedDeviceIndex] : undefined),
    [devices, selectedDeviceIndex]
  );

  return { devices, selectedDeviceIndex, setSelectedDeviceIndex, currentDevice };
}
