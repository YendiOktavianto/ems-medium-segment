"use client";

import React from "react";
import { useHome } from "../home/useHome";
import { formatValue, formatCurrency } from "../home/validation";
import { DEFAULT_BG, CARD_BG, VALUE_COLOR, ENERGY_COLOR } from "./constants";

export default function Dashboard() {
  const userId = "123"; // ambil dari context / login
  const token = "user-jwt-token"; // optional

  const { devices, selectedDeviceId, setSelectedDeviceId, currentDevice } =
    useHome(userId, token);

  return (
    <div
      className="flex flex-col rounded-2xl p-8 mx-auto mr-8"
      style={{ background: DEFAULT_BG }}
    >
      {/* Judul */}
      <h1 className="text-center text-2xl font-semibold mb-6 text-white">
        Dashboard Monitoring
      </h1>

      {/* Device Info */}
      <div className="flex flex-col sm:flex-row justify-between text-[9px] mb-5 text-white gap-4">
        <div>
          <p className="uppercase tracking-wide opacity-70">Serial Number</p>
          <p className="font-lg">{currentDevice?.device_id || "-"}</p>

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
              {currentDevice?.address_name || "-"} /{" "}
              {currentDevice?.detail_location || "-"}
            </p>
          )}
        </div>
        <div className="text-left sm:text-right">
          <p className="uppercase tracking-wide opacity-70">Wattage / Phase</p>
          <p className="font-lg">{currentDevice?.watt_phase || "-"}</p>

          <p className="mt-2 uppercase tracking-wide opacity-70">Segment</p>
          <p className="font-lg">{currentDevice?.segment || "-"}</p>
        </div>
      </div>

      {/* === 3 kolom horizontal === */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center text-white items-stretch flex-1">
        {/* Kolom 1 */}
        <div className="flex flex-col gap-4 justify-between">
          <div style={{ backgroundColor: CARD_BG }} className="p-4 rounded-2xl shadow-lg flex-1">
            <p className="mb-1 uppercase text-[11px] opacity-70">Voltage (Volt)</p>
            <h2 style={{ color: VALUE_COLOR }} className="text-7xl font-bold">
              {formatValue(currentDevice?.voltage, "V")}
            </h2>
          </div>
          <div style={{ backgroundColor: CARD_BG }} className="p-4 rounded-2xl shadow-lg flex-1">
            <p className="mb-1 uppercase text-[11px] opacity-70">Current (Ampere)</p>
            <h2 style={{ color: VALUE_COLOR }} className="text-7xl font-bold">
              {formatValue(currentDevice?.current, "A")}
            </h2>
          </div>
        </div>

        {/* Kolom 2 */}
        <div className="flex flex-col gap-4 justify-between text-xs">
          <div style={{ backgroundColor: CARD_BG }} className="p-4 rounded-2xl shadow-lg flex-1">
            <p className="mb-1 uppercase text-[11px] opacity-70">Frequency (Hz)</p>
            <h2 className="text-3xl font-bold">{formatValue(currentDevice?.frequency, "Hz")}</h2>
          </div>
          <div style={{ backgroundColor: CARD_BG }} className="p-4 rounded-2xl shadow-lg flex-1">
            <p className="mb-1 uppercase text-[11px] opacity-70">Power (Watt)</p>
            <h2 className="text-3xl font-bold">{formatValue(currentDevice?.power, "W")}</h2>
          </div>
          <div style={{ backgroundColor: CARD_BG }} className="p-4 rounded-2xl shadow-lg flex-1">
            <p className="mb-1 uppercase text-[11px] opacity-70">Power Factor (Cos φ)</p>
            <h2 className="text-3xl font-bold">{formatValue(currentDevice?.power_Factor)}</h2>
          </div>
        </div>

        {/* Kolom 3 */}
        <div className="flex flex-col gap-4 justify-between">
          <div style={{ backgroundColor: CARD_BG }} className="p-4 rounded-2xl shadow-lg flex-1">
            <p className="mb-1 uppercase text-[11px] opacity-70">Total Energy Usage (kWh)</p>
            <p style={{ color: ENERGY_COLOR }} className="text-3xl font-bold">
              Today: {formatValue(currentDevice?.total_energy_usage_today)}
            </p>
            <p style={{ color: ENERGY_COLOR }} className="text-3xl font-bold">
              MTD: {formatValue(currentDevice?.total_energy_usage_Mtd)}
            </p>
          </div>
          <div style={{ backgroundColor: CARD_BG }} className="p-4 rounded-2xl shadow-lg flex-1">
            <p className="mb-1 uppercase text-[11px] opacity-70">Total Energy Cost (IDR)</p>
            <p style={{ color: ENERGY_COLOR }} className="text-3xl font-bold">
              Today: {formatCurrency(currentDevice?.total_energy_cost_today)}
            </p>
            <p style={{ color: ENERGY_COLOR }} className="text-3xl font-bold">
              MTD: {formatCurrency(currentDevice?.total_energy_cost_mtd)}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
