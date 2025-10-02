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
    } else if (currentPath.includes("logout")) {
      setSelectedPage("Logout");
    } else {
      setSelectedPage("Dashboard");
    }

    // aktifkan loading setiap kali ganti path
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
      {/* 🔹 overlay loading full page */}
      <LoadingOverlay show={loading} />

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
        <Logout
          setSelectedPage={setSelectedPage}
          setShowLogoutOverlay={setShowLogoutOverlay}
        />
      )}
    </div>
  );
}
