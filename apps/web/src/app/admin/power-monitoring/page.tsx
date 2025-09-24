"use client";

import React, { useState, useEffect } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

type general_info = {
  serial_number: string;
  address_name: string;
  detail_location: string;
  watt_phase: string;
  segment: string;
};

export default function Dashboard() {
  const [voltage, setVoltage] = useState(230);
  const [current, setCurrent] = useState(10);
  const [frequency, setFrequency] = useState(50);
  const [powerFactor, setPowerFactor] = useState(0.85);
  const [power, setPower] = useState(1000);
  const [energyUsage, setEnergyUsage] = useState(10);

  const [voltageData, setVoltageData] = useState<{ time: string; value: number }[]>([]);
  const [currentData, setCurrentData] = useState<{ time: string; value: number }[]>([]);
  const [freqData, setFreqData] = useState<{ time: string; value: number }[]>([]);
  const [pfData, setPfData] = useState<{ time: string; value: number }[]>([]);
  const [powerData, setPowerData] = useState<{ time: string; value: number }[]>([]);
  const [energyData, setEnergyData] = useState<{ time: string; value: number }[]>([]);
  const [allData, setAllData] = useState<any[]>([]);

  const serial_number: general_info[] = [
    { serial_number: "PQ-1000001A", address_name: "Jl. Kp Pamahan No 63 Jatiasih", detail_location: "Lantai 1", watt_phase: "2200VA /1-Phase", segment: "Residential" },
    { serial_number: "PQ-1000001B", address_name: "Jl. Kp Pamahan No 63 Jatiasih", detail_location: "Lantai 2", watt_phase: "3300VA /1-Phase", segment: "Commercial" },
    { serial_number: "PQ-1000002A", address_name: "Jl. Raya Bogor KM 20", detail_location: "Gudang A", watt_phase: "6600VA/3-Phase", segment: "Industrial" },
  ];

  const [selectedGeneralInfo, setSelectedGeneralInfo] = useState(0);
  const activeLoc = serial_number[selectedGeneralInfo] || undefined;

  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      const time = now.toLocaleTimeString("id-ID", { hour12: false });

      const newVolt = 200 + Math.floor(Math.random() * 100);
      const newCurr = Math.floor(Math.random() * 50);
      const newFrequency = parseFloat((49 + Math.random() * 2).toFixed(2));
      const newPF = parseFloat((0.5 + Math.random() * 0.5).toFixed(2));
      const newPower = 500 + Math.floor(Math.random() * 4000);
      const newEnergy = parseFloat((5 + Math.random() * 45).toFixed(2));

      setVoltage(newVolt);
      setCurrent(newCurr);
      setFrequency(newFrequency);
      setPowerFactor(newPF);
      setPower(newPower);
      setEnergyUsage(newEnergy);

      setVoltageData((prev) => [...prev, { time, value: newVolt }].slice(-15));
      setCurrentData((prev) => [...prev, { time, value: newCurr }].slice(-15));
      setFreqData((prev) => [...prev, { time, value: newFrequency }].slice(-15));
      setPfData((prev) => [...prev, { time, value: newPF }].slice(-15));
      setPowerData((prev) => [...prev, { time, value: newPower }].slice(-15));
      setEnergyData((prev) => [...prev, { time, value: newEnergy }].slice(-15));

      setAllData((prev) => [
        ...prev,
        { time, Voltage: newVolt, Current: newCurr, Frequency: newFrequency, PowerFactor: newPF, Power: newPower, EnergyUsage: newEnergy },
      ].slice(-15));
    }, 2000);
    return () => clearInterval(interval);
  }, []);

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

  const Gauge = ({ label, value, min, max, unit, colorStops }: { label: string; value: number; min: number; max: number; unit: string; colorStops: [number, number, number] }) => {
    const startAngle = -238;
    const endAngle = 58;
    const angleRange = endAngle - startAngle;
    const percentage = (value - min) / (max - min);
    const needleAngle = startAngle + percentage * angleRange;
    const angleFromPercentage = (perc: number) => startAngle + perc * angleRange;
    const [greenStop, yellowStop, redStop] = colorStops;

    const CustomTooltip = ({ active, payload, label }: any) => {
      if (active && payload && payload.length) {
        return (
          <div
            style={{
                backgroundColor: '#0C1F3C',
                borderRadius: '8px',
                border: '1px solid #333',
                color: '#fff',
            }}
          >
            <div style={{ color: "#fff", fontWeight: 600, marginBottom: 6 }}>
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
      <div className="flex flex-col items-center w-full md:w-1/2 bg-[#001B3A] rounded-2xl p-6">
        <svg viewBox="0 0 200 200" className="w-56 h-56">
          <path d={describeArc(100, 100, 80, startAngle, angleFromPercentage(greenStop))} stroke="green" strokeWidth="7" fill="none"/>
          <path d={describeArc(100, 100, 80, angleFromPercentage(greenStop), angleFromPercentage(yellowStop))} stroke="yellow" strokeWidth="7" fill="none"/>
          <path d={describeArc(100, 100, 80, angleFromPercentage(yellowStop), angleFromPercentage(redStop))} stroke="red" strokeWidth="7" fill="none"/>
          <polygon
            points={`
              ${100 + 4 * Math.cos(((needleAngle + 90) * Math.PI)/180)},${100 + 4 * Math.sin(((needleAngle + 90) * Math.PI)/180)}
              ${100 + 50 * Math.cos((needleAngle * Math.PI)/180)},${100 + 50 * Math.sin((needleAngle * Math.PI)/180)}
              ${100 + 4 * Math.cos(((needleAngle - 90) * Math.PI)/180)},${100 + 4 * Math.sin(((needleAngle - 90) * Math.PI)/180)}
            `}
            fill="dodgerblue"
          />
          <circle cx="100" cy="100" r="8" fill="dodgerblue" />
        </svg>
        <div className="text-white mt-[-81px] text-sm font-light">{label}</div>
        <div className="bg-gray-200 text-black px-3 py-1 rounded mt-2 font-bold">{value} {unit}</div>
      </div>
    );
  };

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
      className="flex flex-col rounded-2xl p-8 mx-auto mr-8"
      style={{
        background:
          "linear-gradient(90deg, rgba(6,11,40,0.74) 0%, rgba(10,14,35,0.71) 100%)",
      }}
    >
      <h1 className="text-center text-2xl font-semibold text-white">Power Monitoring</h1>

      {/* Device Info */}
      <div className="flex flex-col sm:flex-row justify-between text-[9px] text-white gap-4">
        <div>
          <p className="uppercase tracking-wide opacity-70">Serial Number</p>
          <p className="font-lg">{activeLoc?.serial_number ?? "-"} </p>
          <p className="mt-2 uppercase tracking-wide opacity-70">Location</p>
          
          {serial_number.length > 1 ? (
            <select
              className="bg-[#0C1F3C] border border-gray-600 text-white px-2 py-1 rounded w-full sm:w-auto"
              value={selectedGeneralInfo}
              onChange={(e) => setSelectedGeneralInfo(Number(e.target.value))}
            >
              {serial_number.map((loc, idx) => (
                <option key={idx} value={idx}>
                    {loc.serial_number}
                    {activeLoc?.address_name} | {activeLoc?.detail_location} 
                </option>
              ))}
            </select>
          ) : (
            <p className="font-lg">{activeLoc ? `${activeLoc.address_name} | ${activeLoc.detail_location}` : "-"}</p>
          )}
        </div>
        <div className="text-left sm:text-right">
          <p className="uppercase tracking-wide opacity-70">Wattage / Phase</p>
          <p className="font-lg">{activeLoc?.watt_phase ?? "-"}</p>
          <p className="mt-2 uppercase tracking-wide opacity-70">Segment</p>
          <p className="font-lg">{activeLoc?.segment ?? "-"}</p>
        </div>
      </div>

      {/* All Data Chart */}
      <div className="w-full bg-[#032d7a] rounded-xl p-2 mt-5">
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={allData} margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
            <CartesianGrid stroke="#444" strokeDasharray="3 3" />
            <XAxis dataKey="time" tick={{ fill: "#fff", fontSize: 10 }} />
            <YAxis tick={{ fill: "#fff", fontSize: 10 }} />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            <Area
                type="monotone"
                dataKey="Current"
                stroke="#9bff5b"
                fill="rgba(155,255,91,0.2)"
                strokeWidth={2}
            />
            <Area
                type="monotone"
                dataKey="EnergyUsage"
                stroke="#5bd3ff"
                fill="rgba(91,211,255,0.2)"
                strokeWidth={2}
            />
            <Area
                type="monotone"
                dataKey="Frequency"
                stroke="#ffd75b"
                fill="rgba(255,215,91,0.2)"
                strokeWidth={2}
            />
            <Area
                type="monotone"
                dataKey="Power"
                stroke="#ff7b5b"
                fill="rgba(255,123,91,0.2)"
                strokeWidth={2}
            />
            <Area
                type="monotone"
                dataKey="PowerFactor"
                stroke="#FF00FF"
                fill="rgba(255,0,255,0.2)"
                strokeWidth={2}
            />
            <Area
                type="monotone"
                dataKey="Voltage"
                stroke="#1E90FF"
                fill="rgba(30,144,255,0.2)"
                strokeWidth={2}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
