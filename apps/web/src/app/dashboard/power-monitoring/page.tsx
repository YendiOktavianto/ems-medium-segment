"use client";
import { usePowerMonitoring } from "./usePowerMonitoring";
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from "recharts";

export default function Dashboard() {
  const userId = "123"; // ambil dari context login
  const token = "user-jwt-token"; // optional JWT

  const { devices, selectedDevice, setSelectedDevice, currentDevice, allData } = usePowerMonitoring(userId, token);

  return (
    <div className="flex flex-col rounded-2xl p-8 mx-auto mr-8" style={{ background: "linear-gradient(90deg, rgba(6,11,40,0.74) 0%, rgba(10,14,35,0.71) 100%)" }}>
      <h1 className="text-center text-2xl font-semibold text-white">Power Monitoring</h1>

      {/* Device Info */}
      <div className="flex flex-col sm:flex-row justify-between text-[9px] text-white gap-4 mt-4">
        <div>
          <p className="uppercase tracking-wide opacity-70">Serial Number</p>
          <p className="font-lg">{currentDevice?.serial_number ?? "-"}</p>

          <p className="mt-2 uppercase tracking-wide opacity-70">Location</p>
          {devices.length > 1 ? (
            <select className="bg-[#0C1F3C] border border-gray-600 text-white px-2 py-1 rounded w-full sm:w-auto"
              value={selectedDevice}
              onChange={(e) => setSelectedDevice(Number(e.target.value))}>
              {devices.map((d, idx) => (
                <option key={idx} value={idx}>
                  {d.serial_number} | {d.address_name} | {d.detail_location}
                </option>
              ))}
            </select>
          ) : (
            <p>{currentDevice ? `${currentDevice.address_name} | ${currentDevice.detail_location}` : "-"}</p>
          )}
        </div>

        <div className="text-left sm:text-right">
          <p className="uppercase tracking-wide opacity-70">Wattage / Phase</p>
          <p className="font-lg">{currentDevice?.watt_phase ?? "-"}</p>

          <p className="mt-2 uppercase tracking-wide opacity-70">Segment</p>
          <p className="font-lg">{currentDevice?.segment ?? "-"}</p>
        </div>
      </div>

      {/* Chart */}
      <div className="w-full bg-[#032d7a] rounded-xl p-2 mt-5">
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={allData} margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
            <CartesianGrid stroke="#444" strokeDasharray="3 3" />
            <XAxis dataKey="time" tick={{ fill: "#fff", fontSize: 10 }} />
            <YAxis tick={{ fill: "#fff", fontSize: 10 }} />
            <Tooltip contentStyle={{ backgroundColor: "#05245C", border: "1px solid #1E2A50", color: "#fff" }} />
            <Legend />
            <Area type="monotone" dataKey="Current" stroke="#9bff5b" fill="rgba(155,255,91,0.2)" strokeWidth={2} />
            <Area type="monotone" dataKey="EnergyUsage" stroke="#5bd3ff" fill="rgba(91,211,255,0.2)" strokeWidth={2} />
            <Area type="monotone" dataKey="Frequency" stroke="#ffd75b" fill="rgba(255,215,91,0.2)" strokeWidth={2} />
            <Area type="monotone" dataKey="Power" stroke="#ff7b5b" fill="rgba(255,123,91,0.2)" strokeWidth={2} />
            <Area type="monotone" dataKey="PowerFactor" stroke="#FF00FF" fill="rgba(255,0,255,0.2)" strokeWidth={2} />
            <Area type="monotone" dataKey="Voltage" stroke="#1E90FF" fill="rgba(30,144,255,0.2)" strokeWidth={2} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
