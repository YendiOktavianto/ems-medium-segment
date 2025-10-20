"use client";
import { useRouter, usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { ChevronDown, ChevronUp, Circle } from "lucide-react";
import { flushSync } from "react-dom";

export default function Sidebar({
  selectedPage,
  setLoading,
  setSelectedPage,
  setShowLogoutOverlay,
}: any) {
  const router = useRouter();
  const pathname = usePathname() || "";

  const [isPowerOpen, setIsPowerOpen] = useState(false);
  const [isReportOpen, setIsReportOpen] = useState(false);

  // auto open submenu kalau route sekarang adalah anaknya
  useEffect(() => {
    if (
      [
        "Voltage",
        "Current",
        "Frequency",
        "Power Factor",
        "Power",
        "Energy Usage",
      ].includes(selectedPage)
    ) {
      setIsPowerOpen(true);
    }
    if (
      selectedPage === "Summary Report" ||
      selectedPage === "Energy Usage Report"
    ) {
      setIsReportOpen(true);
    }
  }, [selectedPage]);

  // auto selectedPage berdasarkan URL agar warna aktif benar
  useEffect(() => {
    if (!pathname) return;

    if (pathname.startsWith("/dashboard/power-monitoring/")) {
      const part = pathname.split("/").pop() || "";
      const name = part
        .replace(/-/g, " ")
        .replace(/\b\w/g, (c) => c.toUpperCase());
      setSelectedPage(name);
    } else if (pathname.startsWith("/dashboard/report/")) {
      if (pathname.includes("summary-report")) {
        setSelectedPage("Summary Report");
      } else if (pathname.includes("energy-usage-report")) {
        setSelectedPage("Energy Usage Report");
      }
    } else if (pathname === "/dashboard/power-monitoring") {
      setSelectedPage("Power Monitoring");
    }
  }, [pathname, setSelectedPage]);

  const menus = [
    {
      key: "Home",
      label: "Home",
      icon: "/home.svg",
      activeIcon: "/home_active.svg",
      path: "/dashboard/home",
    },
    {
      key: "Site Monitoring",
      label: "Site Monitoring",
      icon: "/site-monitoring.svg",
      activeIcon: "/site_monitoring_active.svg",
      path: "/dashboard",
    },
    {
      key: "User Info",
      label: "User Info",
      icon: "/user-info.svg",
      activeIcon: "/profile_active.svg",
      path: "/dashboard/user-info",
    },
    {
      key: "General Info",
      label: "General Info",
      icon: "/general-info.svg",
      activeIcon: "/general_info_active.svg",
      path: "/dashboard/general-info",
    },
  ];

  const powerMenus = [
    "Voltage",
    "Current",
    "Frequency",
    "Power Factor",
    "Power",
    "Energy Usage",
  ];

  const reportMenus = [
    {
      key: "Summary Report",
      label: "Summary Report",
      path: "/dashboard/report/summary-report",
    },
    {
      key: "Energy Usage Report",
      label: "Energy Usage Report",
      path: "/dashboard/report/energy-usage-report",
    },
  ];

  const handleClick = async (key: string, path?: string) => {
    setSelectedPage(key);
    if (key === "Logout") {
      setShowLogoutOverlay(true);
    } else if (path) {
      flushSync(() => {
        setLoading(true); // langsung render overlay tanpa delay React
      });
      router.push(path);
    }
  };

  return (
    <aside
      className="w-64 flex flex-col p-3 rounded-t-2xl mt-4 ml-4 h-screen fixed select-none"
      style={{
        background:
          "linear-gradient(100deg, rgba(6,11,40,1) 0%, rgba(26,31,55,0) 100%)",
      }}
    >
      {/* Logo */}
      <h1 className="flex items-center gap-2 text-base font-bold text-white mb-1">
        <img src="/logo2.svg" alt="logo" className="h-9" />
      </h1>
      <img src="/line.svg" alt="line" className="w-60 h-6 mb-2" />

      {/* Navigation */}
      <nav className="flex-1 overflow-hidden flex flex-col text-[11px] leading-tight">
        {/* MAIN MENU */}
        {menus.map((item) => {
          const isActive = selectedPage === item.key;
          return (
            <a
              key={item.key}
              onClick={() => {
                handleClick(item.key, item.path);
                setIsPowerOpen(false);
                setIsReportOpen(false);
              }}
              className={`flex items-center gap-3 px-3 py-1.5 rounded-lg cursor-pointer transition-colors duration-200 ${
                isActive
                  ? "bg-[#1A1F37] text-white font-medium"
                  : "text-gray-300 hover:text-white hover:bg-[#1A1F37]"
              }`}
            >
              <img
                src={isActive ? item.activeIcon : item.icon}
                alt={item.label}
                className="w-5 h-5"
              />
              <span>{item.label}</span>
            </a>
          );
        })}

        {/* POWER MONITORING */}
        <div
          className={`rounded-lg mt-1 ${
            isPowerOpen || selectedPage === "Power Monitoring" || powerMenus.includes(selectedPage)
            ? "bg-[#141830]" 
            : "bg-transparent"
          }`}
        >
          <div className="flex w-full items-center justify-between px-3 py-1.5 cursor-pointer hover:bg-[#1A1F37] rounded-lg">
            {/* Klik kiri = navigate */}
            <div
              className="flex items-center gap-3 flex-1"
              onClick={() => {
                setSelectedPage("Power Monitoring");
                router.push("/dashboard/power-monitoring");
              }}
            >
              <img
                src={
                  selectedPage === "Power Monitoring" || isPowerOpen
                    ? "/power_monitoring_active.svg"
                    : "/power-monitoring.svg"
                }
                alt="Power Monitoring"
                className="w-5 h-5"
              />
              <span
                className={
                  selectedPage === "Power Monitoring" ||
                  powerMenus.includes(selectedPage)
                    ? "text-white font-medium"
                    : "text-gray-300"
                }
              >
                Power Monitoring
              </span>
            </div>

            {/* Klik kanan (Chevron) = toggle submenu */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                setIsPowerOpen(!isPowerOpen);
              }}
            >
              {isPowerOpen ? (
                <ChevronUp size={12} className="text-gray-300" />
              ) : (
                <ChevronDown size={12} className="text-gray-300" />
              )}
            </button>
          </div>

          {isPowerOpen && (
            <div className=" bg-[#0d1225]/70 rounded-md border border-gray-700/50 py-1.5">
              <div className="flex flex-col space-y-0.5">
                {powerMenus.map((sub) => {
                  const activeSub = selectedPage === sub;
                  return (
                    <a
                      key={sub}
                      onClick={() =>
                        handleClick(
                          sub,
                          `/dashboard/power-monitoring/${sub
                            .toLowerCase()
                            .replace(/ /g, "-")}`
                        )
                      }
                      className={`relative flex items-center gap-2 pl-10 pr-2 py-1.5 rounded-md transition-colors duration-150 group ${
                        activeSub
                          ? "text-blue-400 font-medium bg-[#1A1F37]"
                          : "text-gray-400 hover:text-blue-400 hover:bg-[#1A1F37]/70"
                      }`}
                    >
                      <Circle
                        size={5}
                        className={`absolute left-7 ${
                          activeSub
                            ? "text-blue-400"
                            : "text-gray-500 group-hover:text-blue-400"
                        }`}
                        fill={activeSub ? "#60a5fa" : "none"}
                      />
                      <span>{sub}</span>
                      {activeSub && (
                        <span className="absolute left-0 top-0 h-full w-0.5 bg-blue-400 rounded-r"></span>
                      )}
                    </a>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* REPORT */}
        <div
          className={`rounded-lg mt-1 ${
            isReportOpen ? "bg-[#141830]" : "bg-transparent"
          }`}
        >
          <button
            onClick={() => setIsReportOpen(!isReportOpen)}
            className="flex w-full items-center justify-between px-3 py-1.5 cursor-pointer hover:bg-[#1A1F37] rounded-lg"
          >
            <div className="flex items-center gap-3">
              <img
                src={
                  selectedPage === "Report" || isReportOpen
                    ? "/report_active.svg"
                    : "/report.svg"
                }
                alt="Report"
                className="w-5 h-5"
              />
              <span
                className={
                  selectedPage === "Report" ||
                  selectedPage === "Summary Report" ||
                  selectedPage === "Energy Usage Report"
                    ? "text-white font-medium"
                    : "text-gray-300"
                }
              >
                Report
              </span>
            </div>
            {isReportOpen ? (
              <ChevronUp size={12} className="text-gray-300" />
            ) : (
              <ChevronDown size={12} className="text-gray-300" />
            )}
          </button>
          {isReportOpen && (
            <div className="bg-[#0d1225]/70 rounded-md border border-gray-700/50 py-1.5">
              <div className="flex flex-col space-y-0.5">
                {reportMenus.map((rep) => {
                  const activeSub = selectedPage === rep.key;
                  return (
                    <a
                      key={rep.key}
                      onClick={() => handleClick(rep.key, rep.path)}
                      className={`relative flex items-center gap-2 pl-10 pr-2 py-1.5 rounded-md transition-colors duration-150 group ${
                        activeSub
                          ? "text-blue-400 font-medium bg-[#1A1F37]"
                          : "text-gray-400 hover:text-blue-400 hover:bg-[#1A1F37]/70"
                      }`}
                    >
                      <Circle
                        size={5}
                        className={`absolute left-7 ${
                          activeSub
                            ? "text-blue-400"
                            : "text-gray-500 group-hover:text-blue-400"
                        }`}
                        fill={activeSub ? "#60a5fa" : "none"}
                      />
                      <span>{rep.label}</span>
                      {activeSub && (
                        <span className="absolute left-0 top-0 h-full w-0.5 bg-blue-400 rounded-r"></span>
                      )}
                    </a>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* LOGOUT */}
        <a
          onClick={() => {
            handleClick("Logout");
            setIsPowerOpen(false);
            setIsReportOpen(false);
          }}
          className={`flex items-center gap-3 px-3 py-1.5 rounded-lg cursor-pointer hover:bg-[#1A1F37] transition-colors duration-200 ${
            selectedPage === "Logout"
              ? "bg-[#1A1F37] text-white font-medium"
              : "text-gray-300 hover:text-white"
          }`}
        >
          <img
            src={selectedPage === "Logout" ? "/exit_active.svg" : "/exit.svg"}
            alt="Logout"
            className="w-4 h-4"
          />
          <span>Logout</span>
        </a>
      </nav>
    </aside>
  );
}
