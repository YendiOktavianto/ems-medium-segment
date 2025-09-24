"use client";

import React, { useState, useEffect } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
} from "recharts";

type Location = {
  device_id: string;
  address_name: string;
  detail_location: string;
  watt_phase: string;
  segment: string;
};

interface DashboardProps {
  locations?: Location[]; // optional
}

export default function Dashboard({ locations = [] }: DashboardProps) {
  const [selectedLocation, setSelectedLocation] = useState(0);

  const [EnergyUsage, setEnergyUsage] = useState(0);
  const [data, setData] = useState<{ time: string; EnergyUsage: number }[]>([]);

  // simulasi update data tiap 2 detik
  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      const time = now.toLocaleTimeString("id-ID", { hour12: false });
      const newEnergyUsage = Math.floor(Math.random() * 50);
      setEnergyUsage(newEnergyUsage);
      setData((prev) => [...prev, { time, EnergyUsage: newEnergyUsage }].slice(-15));
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  // hitung energy usage (contoh sederhana)
  const energyUsage = (EnergyUsage * 230) / 1000;

  // gauge config
  const minVal = 0;
  const maxVal = 50;
  const startAngle = -238;
  const endAngle = 58;
  const angleRange = endAngle - startAngle;
  const percentage = (EnergyUsage - minVal) / (maxVal - minVal);
  const needleAngle = startAngle + percentage * angleRange;

  const polarToCartesian = (cx: number, cy: number, r: number, angleDeg: number) => {
    const rad = (angleDeg * Math.PI) / 180;
    return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
  };

  const describeArc = (cx: number, cy: number, r: number, start: number, end: number) => {
    const startPt = polarToCartesian(cx, cy, r, end);
    const endPt = polarToCartesian(cx, cy, r, start);
    const largeArc = end - start <= 180 ? "0" : "1";
    return ["M", startPt.x, startPt.y, "A", r, r, 0, largeArc, 0, endPt.x, endPt.y].join(" ");
  };

  // helper buat akses lokasi aktif
  const activeLoc = locations[selectedLocation] || undefined;

    // CustomTooltip di luar komponen utama
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div
          style={{
            backgroundColor: "#05245C",
            border: "1px solid #1E2A50",
            borderRadius: "12px",
            boxShadow: "0 8px 20px rgba(0,0,0,0.6)",
            padding: "12px 16px",
            color: "#fff",
            fontFamily: "Inter, sans-serif",
            fontSize: "13px",
            animation: "fadeIn 0.2s ease-in-out",
            minWidth: "160px",
          }}
        >
          <div style={{ color: "#00CED1", fontWeight: 600, marginBottom: 6 }}>
            Time: {label}
          </div>
          {payload.map((p: any) => {
            const colorMap: { [key: string]: string } = {
              Voltage: "#1E90FF",
              Current: "#00FF00",
              Frequency: "#FFFF00",
              PowerFactor: "#FF00FF",
              Power: "#FF4500",
              EnergyUsage: "#00CED1",
            };
            return (
              <div
                key={p.dataKey}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                  marginBottom: 4,
                }}
              >
                <span
                  style={{
                    display: "inline-block",
                    width: "10px",
                    height: "10px",
                    borderRadius: "50%",
                    backgroundColor: colorMap[p.dataKey] || "#fff",
                  }}
                ></span>
                <span style={{ fontWeight: 500 }}>
                  {p.dataKey}: {p.value}
                </span>
              </div>
            );
          })}
        </div>
      );
    }
    return null;
  };

  return (
    <div
      className="flex flex-col gap-8 rounded-2xl p-8 mx-auto mr-8 mb-8"
      style={{
        background:
          "linear-gradient(90deg, rgba(6,11,40,0.74) 0%, rgba(10,14,35,0.71) 100%)",
      }}
    >
      {/* TITLE */}
      <h1 className="text-center text-2xl font-semibold text-white">
        Energy Usage Monitoring
      </h1>

      {/* DEVICE INFO */}
      <div className="flex flex-col sm:flex-row justify-between text-[9px] text-white gap-4">
        <div>
          <p className="uppercase tracking-wide opacity-70">Serial Number</p>
          <p className="font-lg">{activeLoc?.device_id ?? "-"}</p>

          <p className="mt-2 uppercase tracking-wide opacity-70">Location</p>
          {locations.length > 1 ? (
            <select
              className="bg-[#0C1F3C] border border-gray-600 text-white px-2 py-1 rounded w-full sm:w-auto"
              value={selectedLocation}
              onChange={(e) => setSelectedLocation(Number(e.target.value))}
            >
              {locations.map((loc, idx) => (
                <option key={idx} value={idx}>
                  {loc.address_name} | {loc.detail_location}
                </option>
              ))}
            </select>
          ) : (
            <p className="font-lg">
              {activeLoc
                ? `${activeLoc.address_name} | ${activeLoc.detail_location}`
                : "-"}
            </p>
          )}
        </div>

        <div className="text-left sm:text-right">
          <p className="uppercase tracking-wide opacity-70">Wattage / Phase</p>
          <p className="font-lg">{activeLoc?.watt_phase ?? "-"}</p>

          <p className="mt-2 uppercase tracking-wide opacity-70">Segment</p>
          <p className="font-lg">{activeLoc?.segment ?? "-"}</p>
        </div>
      </div>

      {/* GAUGE + LINE CHART */}
      <div className="flex flex-col md:flex-row gap-6">
        {/* GAUGE */}
        <div className="flex flex-col items-center w-full md:w-1/2 bg-[#032d7a] rounded-2xl p-6">
          <svg viewBox="0 0 200 200" className="w-56 h-56">
            <path
              d={describeArc(100, 100, 80, startAngle, endAngle)}
              stroke="lime"
              strokeWidth="7"
              fill="none"
            />
            {Array.from({ length: 6 }).map((_, i) => {
              const val = Math.round((i * maxVal) / 5);
              const angle = startAngle + (i / 5) * angleRange;
              const pt = polarToCartesian(100, 100, 65, angle);
              return (
                <text
                  key={i}
                  x={pt.x}
                  y={pt.y}
                  textAnchor="middle"
                  alignmentBaseline="middle"
                  fontSize="8"
                  fill="white"
                >
                  {val}
                </text>
              );
            })}
            {[0, 10, 20, 30, 40, 50].map((val, i) => {
              const angle = startAngle + (val / maxVal) * angleRange;
              const outer = polarToCartesian(100, 100, 76, angle);
              const inner = polarToCartesian(100, 100, 74, angle);
              return (
                <line
                  key={i}
                  x1={inner.x}
                  y1={inner.y}
                  x2={outer.x}
                  y2={outer.y}
                  stroke="white"
                  strokeWidth={1}
                />
              );
            })}
            <polygon
              points={`
              ${100 + 4 * Math.cos(((needleAngle + 90) * Math.PI) / 180)},${
                100 + 4 * Math.sin(((needleAngle + 90) * Math.PI) / 180)
              }
              ${100 + 50 * Math.cos((needleAngle * Math.PI) / 180)},${
                100 + 50 * Math.sin((needleAngle * Math.PI) / 180)
              }
              ${100 + 4 * Math.cos(((needleAngle - 90) * Math.PI) / 180)},${
                100 + 4 * Math.sin(((needleAngle - 90) * Math.PI) / 180)
              }
            `}
              fill="dodgerblue"
            />
            <circle cx="100" cy="100" r="8" fill="dodgerblue" />
          </svg>

          <div className="text-white px-3 py-1 rounded mt-[-81px] text-sm font-light">
            Energy Usage
          </div>
          <div className="bg-gray-200 text-black px-3 py-1 rounded mt-2 font-bold">
            {EnergyUsage} A
          </div>
        </div>

        {/* LINE CHART */}
        <div className="w-full bg-[#032d7a] rounded-xl p-4">
          <ResponsiveContainer width="100%" height={250}>
            <AreaChart
              data={data}
              margin={{ top: 20, right: 20, bottom: 20, left: 20 }}
            >
              <CartesianGrid stroke="#444" strokeDasharray="3 3" />
              <XAxis dataKey="time" tick={{ fill: "#fff", fontSize: 10 }} />
              <YAxis
                domain={[0, 50]}
                ticks={[0, 10, 20, 30, 40, 50]}
                tick={{ fill: "#fff", fontSize: 10 }}
                label={{
                  value: "Energy Usage",
                  angle: -90,
                  position: "insideLeft",
                  fill: "#fff",
                  dy: 50,
                }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#0C1F3C',
                  borderRadius: '8px',
                  border: '1px solid #333',
                  color: '#fff',
                }}
              />
              <Legend />
              <Area
                type="monotone"
                dataKey="EnergyUsage"
                stroke="#9bff5b"
                fill="rgba(155,255,91,0.4)"
                dot={{ r: 3 }}
                isAnimationActive={false}
                 name="Energy Usage"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
