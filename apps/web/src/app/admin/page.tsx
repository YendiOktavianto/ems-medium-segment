'use client';
import React, { useEffect, useState } from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { Users, Cpu, Bell } from 'lucide-react'; // import icons

export default function AdminDashboard() {
  const [chartData, setChartData] = useState<any[]>([]);

  useEffect(() => {
    // dummy data simulasi (time series power usage global)
    const interval = setInterval(() => {
      setChartData((prev) => [
        ...prev.slice(-19),
        {
          time: new Date().toLocaleTimeString('id-ID', {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
          }),
          usage: Math.floor(1000 + Math.random() * 2000),
        },
      ]);
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div
      className="flex flex-col rounded-2xl p-8 mx-auto mr-8"
      style={{
        background:
          'linear-gradient(90deg, rgba(6,11,40,0.74) 0%, rgba(10,14,35,0.71) 100%)',
      }}
    >
      {/* Kartu ringkasan */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div
          className="flex flex-col p-3 rounded-lg w-full text-xs justify-center"
          style={{
            background:
              'linear-gradient(180deg, rgba(0,60,140,1) 0%, rgba(0,30,70,1) 100%)',
          }}
        >
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-green-300" />
            <h3 className="text-1xl font-light">Total Users</h3>
          </div>
          <p className="text-4xl font-semibold mt-1">132</p>
        </div>

        <div
          className="flex flex-col p-3 rounded-lg w-full text-xs justify-center"
          style={{
            background:
              'linear-gradient(180deg, rgba(0,60,140,1) 0%, rgba(0,30,70,1) 100%)',
          }}
        >
          <div className="flex items-center gap-2">
            <Cpu className="w-5 h-5 text-blue-300" />
            <h3 className="text-1xl font-light">Total Devices</h3>
          </div>
          <p className="text-4xl font-semibold mt-1">298</p>
        </div>

        <div
          className="flex flex-col p-3 rounded-lg w-full text-xs justify-center"
          style={{
            background:
              'linear-gradient(180deg, rgba(0,60,140,1) 0%, rgba(0,30,70,1) 100%)',
          }}
        >
          <div className="flex items-center gap-2">
            <Bell className="w-5 h-5 text-yellow-300" />
            <h3 className="text-1xl font-light">Pending Requests</h3>
          </div>
          <p className="text-4xl font-semibold mt-1">12</p>
        </div>
      </section>

      {/* Grafik ringkasan */}
      <section className="bg-[#032d7a] mt-3 p-4 rounded-lg w-full text-xs">
        <h3 className="text-xl font-semibold mb-4 text-white">
          Global Power Usage
        </h3>
        <ResponsiveContainer width="100%" height={270}>
          <AreaChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#444" />
            <XAxis dataKey="time" stroke="#fff" />
            <YAxis stroke="#fff" />
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
              dataKey="usage"
              stroke="#9bff5b"
              fill="rgba(155,255,91,0.4)"
              strokeWidth={2}
            />
          </AreaChart>
        </ResponsiveContainer>
      </section>
    </div>
  );
}
