// app/admin/_components/DashboardLayout.tsx (atau path kamu sekarang)
"use client";

import React, { useState, useEffect } from "react";
import Sidebar from "../components/AdminSidebar";
import Header from "../components/Header";
import { usePathname } from "next/navigation";
import Logout from "./logout/page";
import LoadingOverlay from "../components/LoadingOverlay"; // 🔹 import overlay

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [time, setTime] = useState("");
  const [selectedPage, setSelectedPage] = useState("dashboard");
  const [showLogoutOverlay, setShowLogoutOverlay] = useState(false);

  // 🔹 state loading overlay
  const [loading, setLoading] = useState(false);

  const pathname = usePathname();

  // auto set selectedPage dari URL
  useEffect(() => {
    const currentPath = pathname ?? "";
    if (currentPath.includes("site-monitoring")) {
      setSelectedPage("Site Monitoring");
    } else if (currentPath.includes("user-management")) {
      setSelectedPage("User Management");
    } else if (currentPath.includes("device-management")) {
      setSelectedPage("Device Management");
    } else if (currentPath.includes("device-request")) {
      setSelectedPage("Device Request");
    } else if (currentPath.includes("summary-report")) {
      setSelectedPage("Summary Report");
    } else if (currentPath.includes("energy-usage-report")) {
      setSelectedPage("Energy Usage Report");
    } else if (currentPath.includes("list-cost-energy")) {
      setSelectedPage("List Cost Energy");
    } else if (currentPath.includes("edit-landing")) {
      setSelectedPage("Edit Landing Page");
    } else if (currentPath.includes("edit-company")) {
      setSelectedPage("Edit Company");
    } else if (currentPath.includes("product-edit")) {
      setSelectedPage("Edit Product");
    } else if (currentPath.includes("logout")) {
      setSelectedPage("Logout");
    } else {
      setSelectedPage("Dashboard");
    }

    setLoading(true);
    const timer = setTimeout(() => setLoading(false), 800);
    return () => clearTimeout(timer);
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
      <LoadingOverlay show={loading} />

      {/* Sidebar */}
      <Sidebar
        selectedPage={selectedPage}
        setLoading={setLoading}
        setSelectedPage={setSelectedPage}
        setShowLogoutOverlay={setShowLogoutOverlay}
      />

      {/* Konten kanan */}
      <div className="flex-1 pl-[310px] pt-6 flex flex-col h-screen min-h-0">
        {/* Header sticky */}
        <div className="sticky top-0 z-10">
          <Header time={time} selectedPage={selectedPage} />
        </div>

        {/* Konten scrollable hanya di bawah header */}
        <div id="pm-scroll" className="flex-1 min-h-0 overflow-y-auto shadow-lg custom-scroll scroll-smooth">
          {children}
        </div>
      </div>

      {/* Logout Overlay */}
      {showLogoutOverlay && (
        <Logout
          setSelectedPage={setSelectedPage}
          setShowLogoutOverlay={setShowLogoutOverlay}
        />
      )}
    </div>
  );
}
