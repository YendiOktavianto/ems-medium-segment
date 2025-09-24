"use client";
import { useState } from "react";
import Image from "next/image";

type Device = {
  serial_number: string; 
  location: string;
  detail_location: string;
  wattage: string;
  segment: string;
  active: boolean;
};

const InfoCard = ({
  label,
  children,
  className = "",
}: {
  label: string;
  children: React.ReactNode;
  className?: string;
}) => (
  <div
    className={`min-h-[60px] flex flex-col justify-center rounded-2xl px-4 py-2 ${className}`}
    style={{
      background:
        "linear-gradient(180deg, rgba(6,12,41,1) 0%, rgba(4,12,48,0.5) 100%)",
    }}
  >
    <p className="text-gray-400 text-[10px]">{label}</p>
    {children}
  </div>
);

export default function GeneralInfoContent() {
  const devices: Device[] = [
    {
      serial_number: "PQ-1000001.A",
      location: "Jl. Kp Pamahan No 63, Jatiasih, Bekasi, Jawa Barat",
      detail_location: "Lantai 2",
      wattage: "2200VA/1-Phase",
      segment: "Residential",
      active: true,
    },
    {
      serial_number: "PQ-1000002.B",
      location: "Jl. Merdeka No 45, Salatiga, Jawa Tengah",
      detail_location: "Gudang Utama",
      wattage: "4500VA/3-Phase",
      segment: "Commercial",
      active: false,
    },
  ];

  const [selectedDevice, setSelectedDevice] = useState(0);
  const currentDevice = devices[selectedDevice] || {};

  return (
    <div
      className="rounded-2xl p-8 mx-auto mr-8"
      style={{
        background:
          "linear-gradient(90deg, rgba(6,11,40,0.74) 0%, rgba(10,14,35,0.71) 100%)",
      }}
    >
      <h2 className="text-2xl font-semibold mb-4">General Info</h2>
      <div className="flex flex-col md:flex-row items-center md:items-start gap-4">
        {/* QR */}
        <div className="flex-shrink-0 mx-15 my-4">
          <Image
            src="/qr.png"
            alt="Qr Code"
            width={140}
            height={140}
            className="rounded-lg"
          />
        </div>

        {/* Info */}
        <div className="w-full space-y-3 my-4">
          {/* DEVICE ID */}
          <InfoCard label="SERIAL NUMBER" className="w-full md:w-40">
            <div className="w-full">
              {devices.length > 1 ? (
                <select
                  className="bg-transparent text-sm font-medium text-white border border-gray-600 rounded-md p-1 mt-1 w-full"
                  value={selectedDevice}
                  onChange={(e) => setSelectedDevice(Number(e.target.value))}
                >
                  {devices.map((device, idx) => (
                    <option key={idx} value={idx} className="text-black">
                      {currentDevice.serial_number}
                    </option>
                  ))}
                </select>
              ) : (
                <p className="text-sm font-medium text-white">{currentDevice.serial_number || "-"}</p>
              )}
            </div>
          </InfoCard>

          {/* LOCATION */}
          <InfoCard label="LOCATION">
            <p className="text-sm font-medium text-white">
              {currentDevice.location || ""} ( {currentDevice.detail_location || "-"} )
            </p>
          </InfoCard>

          {/* WATTAGE/PHASE */}
          <InfoCard label="WATTAGE/PHASE">
            <p className="text-sm font-medium text-white">{currentDevice.wattage || "-"}</p>
          </InfoCard>

          {/* SEGMENT */}
          <InfoCard label="SEGMENT">
            <p className="text-sm font-medium text-white">{currentDevice.segment || "-"}</p>
          </InfoCard>

          {/* ACTIVE */}
          <InfoCard label="ACTIVE">
            <p className="text-sm font-medium text-white">
              {currentDevice.active === true ? "Yes" : currentDevice.active === false ? "No" : "-"}
            </p>
          </InfoCard>
        </div>
      </div>
    </div>
  );
}
