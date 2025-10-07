"use client";

import React, { useState, useEffect } from "react";
import Sidebar from "../components/UserSidebar";
import Header from "../components/Header";
import { usePathname } from "next/navigation";
import LogoutOverlay from "./logout/page";
import LoadingOverlay from "../components/LoadingOverlay";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [time, setTime] = useState("");
  const [selectedPage, setSelectedPage] = useState("Site Monitoring");
  const [showLogoutOverlay, setShowLogoutOverlay] = useState(false);
  const [loading, setLoading] = useState(false);

  const pathname = usePathname();

  // set selectedPage berdasarkan URL
  useEffect(() => {
    const currentPath = (pathname ?? "").toLowerCase();

    if (currentPath.includes("home")) setSelectedPage("Home");
    else if (currentPath.includes("power-monitoring/voltage")) setSelectedPage("Voltage");
    else if (currentPath.includes("power-monitoring/current")) setSelectedPage("Current");
    else if (currentPath.includes("power-monitoring/frequency")) setSelectedPage("Frequency");
    else if (currentPath.includes("power-monitoring/power-factor")) setSelectedPage("Power Factor");
    else if (currentPath.includes("power-monitoring/power")) setSelectedPage("Power");
    else if (currentPath.includes("power-monitoring/energy-usage")) setSelectedPage("Energy Usage");
    else if (currentPath.includes("power-monitoring")) setSelectedPage("Power Monitoring");
    else if (currentPath.includes("user-info")) setSelectedPage("User Info");
    else if (currentPath.includes("general-info")) setSelectedPage("General Info");
    else if (currentPath.includes("summary-report")) setSelectedPage("Summary Report");
    else if (currentPath.includes("energy-usage-report")) setSelectedPage("Energy Usage Report");
    else if (currentPath.includes("logout")) setSelectedPage("Logout");
    else setSelectedPage("Site Monitoring");

    setLoading(true);
    const timer = setTimeout(() => setLoading(false), 800);
    return () => clearTimeout(timer);
  }, [pathname]);

  // realtime clock
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const options: Intl.DateTimeFormatOptions = {
        day: "2-digit",
        month: "short",
        year: "numeric",
      };
      const date = now.toLocaleDateString("en-GB", options).replace(/ /g, " ");
      const clock = now.toLocaleTimeString("en-GB", { hour12: false });
      setTime(`${date} | ${clock}`);
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div
      className="min-h-screen flex bg-cover bg-center bg-fixed"
      style={{ backgroundImage: "url('/bg2.png')" }}
    >
      <LoadingOverlay show={loading} />

      {/* Sidebar */}
      <Sidebar 
        selectedPage={selectedPage}
        setLoading={setLoading}
        setSelectedPage={setSelectedPage}
        setShowLogoutOverlay={setShowLogoutOverlay}
      />

      {/* Konten kanan */}
      <div className="flex-1 pl-[310px] pt-6 flex flex-col h-screen">
        {/* Header sticky */}
        <div className="sticky top-0 z-10">
          <Header time={time} selectedPage={selectedPage} />
        </div>

        {/* Konten scrollable hanya di bawah header */}
        <div className="overflow-y-auto shadow-lg custom-scroll">
          {children}
        </div>
      </div>

      {/* Logout Overlay */}
      {showLogoutOverlay && (
        <LogoutOverlay
          setSelectedPage={setSelectedPage}
          setShowLogoutOverlay={setShowLogoutOverlay}
        />
      )}
    </div>
  );
}
