"use client";

import React, { useState, useEffect } from "react";
import Sidebar from "../components/UserSidebar";
import Header from "../components/Header";
import { usePathname } from "next/navigation";
import LogoutOverlay from "./logout/page"; 

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [time, setTime] = useState("");
  const [selectedPage, setSelectedPage] = useState("Home");
  const [showLogoutOverlay, setShowLogoutOverlay] = useState(false);

  const pathname = usePathname();

  // auto set selectedPage dari URL
  useEffect(() => {
    const currentPath = pathname ?? "";
    if (currentPath.includes("site-monitoring")) {
      setSelectedPage("Site Monitoring");
    } else if (currentPath.includes("user-info")) {
      setSelectedPage("User Info");
    } else if (currentPath.includes("general-info")) {
      setSelectedPage("General Info");
    } else if (currentPath.includes("power-monitoring/voltage")) {
      setSelectedPage("Voltage");
    } else if (currentPath.includes("power-monitoring/current")) {
      setSelectedPage("Current");
    } else if (currentPath.includes("power-monitoring/frequency")) {
      setSelectedPage("Frequency");
    } else if (currentPath.includes("power-monitoring/power-factor")) {
      setSelectedPage("Power Factor");
    } else if (currentPath.includes("power-monitoring/power")) {
      setSelectedPage("Power");
    } else if (currentPath.includes("power-monitoring/energy-usage")) {
      setSelectedPage("Energy Usage");
    } else if (currentPath.includes("summary-report")) {
      setSelectedPage("Summary Report");
    } else if (currentPath.includes("energy-usage-report")) {
      setSelectedPage("Energy Usage Report");
    } else if (currentPath.includes("logout")) {
      setSelectedPage("Logout");
    } else {
      setSelectedPage("Home");
    }
  }, [pathname]);

  // clock
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
      {/* sidebar kiri */}
      <div>
        <Sidebar
          selectedPage={selectedPage}
          setSelectedPage={setSelectedPage}
          setShowLogoutOverlay={setShowLogoutOverlay}
        />
      </div>

      {/* konten kanan */}
      <div className="flex-1 pl-[310px] pt-6">
        {/* header sticky */}
        <div className="sticky top-0 z-10">
          <Header time={time} selectedPage={selectedPage} />
        </div>

        {/* isi halaman */}
        <div>{children}</div>
      </div>

      {showLogoutOverlay && (
        <LogoutOverlay
            setSelectedPage={setSelectedPage}
            setShowLogoutOverlay={setShowLogoutOverlay}
        />
      )}
    </div>
  );
}
