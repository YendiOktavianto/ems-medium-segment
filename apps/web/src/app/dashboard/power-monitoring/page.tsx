"use client";

import React, { useState, useEffect } from "react";
import {
  LineChart,
  Line,
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

  const locations: Location[] = [
    { device_id: "PQ-1000001A", address_name: "Jl. Kp Pamehan No 63 Jatiasih", detail_location: "Lantai 1", watt_phase: "2200VA / 1-Phase", segment: "Residential" },
    { device_id: "PQ-1000001B", address_name: "Jl. Kp Pamehan No 63 Jatiasih", detail_location: "Lantai 2", watt_phase: "3300VA / 1-Phase", segment: "Commercial" },
    { device_id: "PQ-1000002A", address_name: "Jl. Raya Bogor KM 20", detail_location: "Gudang A", watt_phase: "6600VA / 3-Phase", segment: "Industrial" },
  ];

  const [selectedLocation, setSelectedLocation] = useState(0);
  const activeLoc = locations[selectedLocation] || undefined;

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
              backgroundColor: "rgba(15, 45, 90, 0.95)", // lebih terang
              border: "1px solid rgba(255,255,255,0.3)",
              borderRadius: "12px",
              boxShadow: "0 4px 20px rgba(255,255,255,0.5)", // shadow lebih terang
              padding: "14px 18px",
              color: "#fff",
              fontFamily: "Inter, sans-serif",
              fontSize: "14px",
              minWidth: "180px",
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

  const Chart = ({ data, domain, label, unit }: { data: { time: string; value: number }[]; domain: [number, number]; label: string; unit: string }) => (
    <div className="w-full bg-[#0C1F3C] rounded-xl p-4">
      <ResponsiveContainer width="100%" height={250}>
        <LineChart data={data} margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
          <CartesianGrid stroke="#333" strokeDasharray="3 3" />
          <XAxis dataKey="time" tick={{ fill: "#fff", fontSize: 10 }} />
          <YAxis domain={domain} tick={{ fill: "#fff", fontSize: 10 }} label={{ value: label, angle: -90, position: "insideLeft", fill: "#fff" }} />
          <Tooltip contentStyle={{ backgroundColor: "#1E1E1E", border: "1px solid #555", color: "white" }} formatter={(v: number) => [`${v} ${unit}`, label]} />
          <Legend />
          <Line type="monotone" dataKey="value" stroke="#1E90FF" strokeWidth={2} dot={{ r: 3 }} isAnimationActive={false} name={`${label} (${unit})`} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );

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
      <h1 className="text-center text-2xl font-semibold text-white">Power Monitoring</h1>

      {/* Device Info */}
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
      <div className="w-full bg-[#0C1F3C] rounded-xl p-4">
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={allData} margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
            <CartesianGrid stroke="#333" strokeDasharray="3 3" />
            <XAxis dataKey="time" tick={{ fill: "#fff", fontSize: 10 }} />
            <YAxis tick={{ fill: "#fff", fontSize: 10 }} />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            <Line type="monotone" dataKey="Voltage" stroke="#1E90FF" strokeWidth={2} dot={false} />
            <Line type="monotone" dataKey="Current" stroke="#00FF00" strokeWidth={2} dot={false} />
            <Line type="monotone" dataKey="Frequency" stroke="#FFFF00" strokeWidth={2} dot={false} />
            <Line type="monotone" dataKey="PowerFactor" stroke="#FF00FF" strokeWidth={2} dot={false} />
            <Line type="monotone" dataKey="Power" stroke="#FF4500" strokeWidth={2} dot={false} />
            <Line type="monotone" dataKey="EnergyUsage" stroke="#00CED1" strokeWidth={2} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Gauges + Charts */}
      <div className="flex flex-col md:flex-row gap-6">
        <Gauge label="Voltage" value={voltage} min={0} max={300} unit="V" colorStops={[0.6,0.85,1]} />
        <Chart data={voltageData} domain={[0,300]} label="Voltage" unit="V" />
      </div>
      <div className="flex flex-col md:flex-row gap-6">
        <Gauge label="Current" value={current} min={0} max={50} unit="A" colorStops={[0.5,0.8,1]} />
        <Chart data={currentData} domain={[0,50]} label="Current" unit="A" />
      </div>
      <div className="flex flex-col md:flex-row gap-6">
        <Gauge label="Frequency" value={frequency} min={49} max={51} unit="Hz" colorStops={[0.4,0.7,1]} />
        <Chart data={freqData} domain={[49,51]} label="Frequency" unit="Hz" />
      </div>
      <div className="flex flex-col md:flex-row gap-6">
        <Gauge label="Power Factor" value={powerFactor} min={0} max={1} unit="" colorStops={[0.5,0.8,1]} />
        <Chart data={pfData} domain={[0,1]} label="Power Factor" unit="" />
      </div>
      <div className="flex flex-col md:flex-row gap-6">
        <Gauge label="Power" value={power} min={0} max={4000} unit="W" colorStops={[0.6,0.85,1]} />
        <Chart data={powerData} domain={[0,4000]} label="Power" unit="W" />
      </div>
      <div className="flex flex-col md:flex-row gap-6">
        <Gauge label="Energy Usage" value={energyUsage} min={0} max={50} unit="kWh" colorStops={[0.5,0.8,1]} />
        <Chart data={energyData} domain={[0,50]} label="Energy Usage" unit="kWh" />
      </div>
    </div>
  );
}
