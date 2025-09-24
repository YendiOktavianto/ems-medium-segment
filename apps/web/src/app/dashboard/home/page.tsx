"use client";

import React, { useState } from "react";

export default function Dashboard() {
  // data semua device (bisa kosong)
  const [devices, setDevices] = useState<any[]>([
    {
      device_id: "DVC-001",
      address_name: "Rumah Utama",
      detail_location: "Jl. Merdeka No. 10",
      watt_phase: "2200VA / 1-Phase",
      segment: "Residential",
      voltage: 220,
      current: 5,
      frequency: 50,
      power: 1100,
      power_Factor: 0.95,
      total_energy_usage_today: 3.2,
      total_energy_usage_Mtd: 65.5,
      total_energy_cost_today: 4800,
      total_energy_cost_mtd: 98000,
    },
  ]);

  const [selectedDeviceId, setSelectedDeviceId] = useState<string>(
    devices.length > 0 ? devices[0].device_id : ""
  );

  const currentDevice =
    devices.find((d) => d.device_id === selectedDeviceId) || {};

  return (
    <div
      className="flex flex-col rounded-2xl p-8 mx-auto mr-8"
      style={{
        background:
          "linear-gradient(90deg, rgba(6,11,40,0.74) 0%, rgba(10,14,35,0.71) 100%)",
      }}
    >
      {/* Judul */}
      <h1 className="text-center text-2xl font-semibold mb-6 text-white">
        Dashboard Monitoring
      </h1>

      {/* Device Info */}
      <div className="flex flex-col sm:flex-row justify-between text-[9px] mb-5 text-white gap-4">
        <div>
          <p className="uppercase tracking-wide opacity-70">Serial Number</p>
          <p className="font-lg">{currentDevice.device_id || "-"}</p>
          <p className="mt-1 uppercase tracking-wide opacity-70">Location</p>
          {devices.length > 1 ? (
            <select
              className="bg-[#0C1F3C] border border-gray-600 text-white px-2 py-1 rounded w-full sm:w-auto"
              value={selectedDeviceId}
              onChange={(e) => setSelectedDeviceId(e.target.value)}
            >
              {devices.map((device) => (
                <option key={device.device_id} value={device.device_id}>
                  {device.address_name} | {device.detail_location}
                </option>
              ))}
            </select>
          ) : (
            <p className="font-lg max-w-xs leading-snug">
              {currentDevice.address_name || "-"} /{" "}
              {currentDevice.detail_location || "-"}
            </p>
          )}
        </div>
        <div className="text-left sm:text-right">
          <p className="uppercase tracking-wide opacity-70">Wattage / Phase</p>
          <p className="font-lg">{currentDevice.watt_phase || "-"}</p>

          <p className="mt-2 uppercase tracking-wide opacity-70">Segment</p>
          <p className="font-lg">{currentDevice.segment || "-"}</p>
        </div>
      </div>

      {/* === 3 kolom horizontal === */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center text-white items-stretch flex-1">
        {/* Kolom 1 */}
        <div className="flex flex-col gap-4 justify-between">
          <div className="bg-[#032d7a] p-4 rounded-2xl shadow-lg flex-1">
            <p className="mb-1 uppercase text-[11px] opacity-70">
              Voltage (Volt)
            </p>
            <h2 className="text-7xl font-bold text-[#ffcc00]">
              {currentDevice.voltage ?? "-"} V
            </h2>
          </div>
          <div className="bg-[#032d7a] p-4 rounded-2xl shadow-lg flex-1">
            <p className="mb-1 uppercase text-[11px] opacity-70">
              Current (Ampere)
            </p>
            <h2 className="text-7xl font-bold text-[#ffcc00]">
              {currentDevice.current ?? "-"} A
            </h2>
          </div>
        </div>

        {/* Kolom 2 */}
        <div className="flex flex-col gap-4 justify-between text-xs">
          <div className="bg-[#032d7a] p-4 rounded-2xl shadow-lg flex-1">
            <p className="mb-1 uppercase text-[11px] opacity-70">
              Frequency (Hz)
            </p>
            <h2 className="text-3xl font-bold">
              {currentDevice.frequency ?? "-"} Hz
            </h2>
          </div>
          <div className="bg-[#032d7a] p-4 rounded-2xl shadow-lg flex-1">
            <p className="mb-1 uppercase text-[11px] opacity-70">Power (Watt)</p>
            <h2 className="text-3xl font-bold">
              {currentDevice.power ?? "-"} W
            </h2>
          </div>
          <div className="bg-[#032d7a] p-4 rounded-2xl shadow-lg flex-1">
            <p className="mb-1 uppercase text-[11px] opacity-70">
              Power Factor (Cos φ)
            </p>
            <h2 className="text-3xl font-bold">
              {currentDevice.power_Factor ?? "-"}
            </h2>
          </div>
        </div>

        {/* Kolom 3 */}
        <div className="flex flex-col gap-4 justify-between">
          <div className="bg-[#032d7a] p-4 rounded-2xl shadow-lg flex-1">
            <p className="mb-1 uppercase text-[11px] opacity-70">
              Total Energy Usage (kWh)
            </p>
            <p className="text-[#9bff5b] text-3xl font-bold">
              Today: {currentDevice.total_energy_usage_today ?? "-"}
            </p>
            <p className="text-[#9bff5b] text-3xl font-bold">
              MTD: {currentDevice.total_energy_usage_Mtd ?? "-"}
            </p>
          </div>
          <div className="bg-[#032d7a] p-4 rounded-2xl shadow-lg flex-1">
            <p className="mb-1 uppercase text-[11px] opacity-70">
              Total Energy Cost (IDR)
            </p>
            <p className="text-[#9bff5b] text-3xl font-bold">
              Today:{" "}
              {currentDevice.total_energy_cost_today?.toLocaleString("id-ID") ??
                "-"}
            </p>
            <p className="text-[#9bff5b] text-3xl font-bold">
              MTD:{" "}
              {currentDevice.total_energy_cost_mtd?.toLocaleString("id-ID") ??
                "-"}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
