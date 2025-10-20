// app/(dashboard)/dashboard/power-monitoring/voltage/Section.tsx
"use client";

import React, { useEffect, useState } from "react";
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
import type { Location } from "../page";

export default function VoltageSection({ device }: { device?: Location }) {
  const [voltage, setVoltage] = useState(0);
  const [data, setData] = useState<{ time: string; voltage: number }[]>([]);

  // reset data saat device berubah
  useEffect(() => {
    setData([]);
  }, [device?.device_id]);

  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      const time = now.toLocaleTimeString("id-ID", { hour12: false });
      const newVoltage = 200 + Math.floor(Math.random() * 100); // 200–300
      setVoltage(newVoltage);
      setData((prev) => [...prev, { time, voltage: newVoltage }].slice(-15));
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  const minVal = 0;
  const maxVal = 300;
  const startAngle = -238;
  const endAngle = 58;
  const angleRange = endAngle - startAngle;
  const percentage = (voltage - minVal) / (maxVal - minVal);
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

  return (
    <div
      className="flex flex-col gap-8 rounded-2xl p-8 mx-auto mb-8"
      style={{
        background:
          "linear-gradient(90deg, rgba(6,11,40,0.74) 0%, rgba(10,14,35,0.71) 100%)",
      }}
    >
      {/* DEVICE INFO 
      <div className="flex flex-col sm:flex-row justify-between text-[9px] text-white gap-4">
        <div>
          <p className="uppercase tracking-wide opacity-70">Serial Number</p>
          <p className="font-lg break-all">{device?.device_id ?? "-"}</p>

          <p className="mt-2 uppercase tracking-wide opacity-70">Location</p>
          <p className="font-lg">
            {device ? `${device.address_name} | ${device.detail_location}` : "-"}
          </p>
        </div>
        <div className="text-left sm:text-right">
          <p className="uppercase tracking-wide opacity-70">Wattage / Phase</p>
          <p className="font-lg">{device?.watt_phase ?? "-"}</p>

          <p className="mt-2 uppercase tracking-wide opacity-70">Segment</p>
          <p className="font-lg">{device?.segment ?? "-"}</p>
        </div>
      </div>

      {/* VOLTAGE GAUGE + LINE CHART */}
      <div className="flex flex-col md:flex-row gap-6">
        {/* GAUGE */}
        <div className="flex flex-col items-center w-full md:w-1/2 bg-[#032d7a] rounded-2xl p-6">
          <svg viewBox="0 0 200 200" className="w-56 h-56">
            <path d={describeArc(100, 100, 80, startAngle, endAngle)} stroke="red" strokeWidth="7" fill="none" />
            <path d={describeArc(100, 100, 80, 310, 30)} stroke="yellow" strokeWidth="7" fill="none" />
            <path d={describeArc(100, 100, 80, 326, 13)} stroke="lime" strokeWidth="7" fill="none" />

            {/* angka skala */}
            {Array.from({ length: 6 }).map((_, i) => {
              const val = (i * maxVal) / 5;
              const angle = startAngle + (i / 5) * angleRange;
              const pt = polarToCartesian(100, 100, 65, angle);
              return (
                <text key={i} x={pt.x} y={pt.y} textAnchor="middle" alignmentBaseline="middle" fontSize="8" fill="white">
                  {val}
                </text>
              );
            })}

            {/* garis skala */}
            {[0, 60, 120, 180, 240, 300].map((val, i) => {
              const angle = startAngle + (val / maxVal) * angleRange;
              const outer = polarToCartesian(100, 100, 76, angle);
              const inner = polarToCartesian(100, 100, 74, angle);
              return <line key={i} x1={inner.x} y1={inner.y} x2={outer.x} y2={outer.y} stroke="white" strokeWidth={1} />;
            })}

            {/* jarum */}
            <polygon
              points={`
                ${100 + 4 * Math.cos(((needleAngle + 90) * Math.PI) / 180)},${100 + 4 * Math.sin(((needleAngle + 90) * Math.PI) / 180)}
                ${100 + 50 * Math.cos((needleAngle * Math.PI) / 180)},${100 + 50 * Math.sin((needleAngle * Math.PI) / 180)}
                ${100 + 4 * Math.cos(((needleAngle - 90) * Math.PI) / 180)},${100 + 4 * Math.sin(((needleAngle - 90) * Math.PI) / 180)}
              `}
              fill="dodgerblue"
            />
            <circle cx="100" cy="100" r="8" fill="dodgerblue" />
          </svg>

          <div className="text-white px-3 py-1 rounded mt-[-81px] text-sm font-light">Voltage</div>
          <div className="bg-gray-200 text-black px-3 py-1 rounded mt-2 font-bold">{voltage} V</div>
        </div>

        {/* AREA CHART */}
        <div className="w-full bg-[#032d7a] rounded-xl p-4">
          <ResponsiveContainer width="100%" height={250}>
            <AreaChart data={data} margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
              <CartesianGrid stroke="#444" strokeDasharray="3 3" />
              <XAxis dataKey="time" tick={{ fill: "#fff", fontSize: 10 }} />
              <YAxis domain={[0, 300]} ticks={[0, 60, 120, 180, 240, 300]} tick={{ fill: "#fff", fontSize: 10 }} label={{ value: "Voltage", angle: -90, position: "insideLeft", fill: "#fff", dy:20 }} />
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
                dataKey="voltage"
                stroke="#9bff5b"
                fill="rgba(155,255,91,0.4)"
                strokeWidth={2}
                dot={{ r: 3 }}
                isAnimationActive={false}
                name="Voltage (Volt)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
