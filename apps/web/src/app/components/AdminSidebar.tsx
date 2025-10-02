"use client";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { ChevronDown, ChevronUp, Circle } from "lucide-react"; // Circle jadi bullet dot

export default function Sidebar({
  selectedPage,
  setSelectedPage,
  setShowLogoutOverlay,
}: any) {
  const router = useRouter();
  const [isReportOpen, setIsReportOpen] = useState(false);

  const handleClick = (key: string, path?: string) => {
    setSelectedPage(key);
    if (key === "Logout") {
      setShowLogoutOverlay(true);
    } else if (path) {
      router.push(path);
    }
  };

  const menus = [
    {
      key: "Dashboard",
      label: "Dashboard",
      icon: "/dashboard.svg",
      activeIcon: "/dashboard_active.svg",
      path: "/admin",
    },
    {
      key: "Site Monitoring",
      label: "Site Monitoring",
      icon: "/site-monitoring.svg",
      activeIcon: "/site_monitoring_active.svg",
      path: "/admin/site-monitoring",
    },
    {
      key: "User Management",
      label: "User Management",
      icon: "/user-info.svg",
      activeIcon: "/profile_active.svg",
      path: "/admin/user-management",
    },
    {
      key: "Device Management",
      label: "Device Management",
      icon: "/general-info.svg",
      activeIcon: "/general_info_active.svg",
      path: "/admin/device-management",
    },
    {
      key: "Device Request",
      label: "Device Request",
      icon: "/request.svg",
      activeIcon: "/request_active.svg",
      path: "/admin/device-request",
    },
    {
      key: "List Cost Energy",
      label: "List Cost Energy",
      icon: "/cost.svg",
      activeIcon: "/cost_active.svg",
      path: "/admin/list-cost-energy",
    },
  ];

  const reportMenus = [
    {
      key: "Summary Report",
      label: "Summary Report",
      path: "/admin/report/summary-report",
    },
    {
      key: "Energy Usage Report",
      label: "Energy Usage Report",
      path: "/admin/report/energy-usage-report",
    },
  ];

  const isReportActive =
    selectedPage === "Report" ||
    selectedPage === "Summary Report" ||
    selectedPage === "Energy Usage Report";

  useEffect(() => {
    if (
      selectedPage === "Summary Report" ||
      selectedPage === "Energy Usage Report"
    ) {
      setIsReportOpen(true);
    }
  }, [selectedPage]);

  return (
    <aside
      className="w-65 flex flex-col p-4 rounded-t-2xl mt-4 ml-4 h-screen fixed"
      style={{
        background:
          "linear-gradient(100deg, rgba(6,11,40,1) 50%, rgba(26,31,55,0) 100%)",
      }}
    >
      {/* Logo */}
      <div className="flex items-center gap-2 mb-1">
        <img src="/logo2.svg" alt="logo" className="w-100" />
      </div>
      <img src="/line.svg" alt="line" className="w-67 h-5 mb-2" />

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto flex flex-col text-xs custom-scroll">
        {menus.map((item) => {
          const isActive = selectedPage === item.key;
          return (
            <a
              key={item.key}
              onClick={() => {
                handleClick(item.key, item.path);
                setIsReportOpen(false);
              }}
              className={`flex items-center gap-4 px-3 py-2 rounded-lg cursor-pointer transition-colors duration-200 ${
                isActive
                  ? "bg-[#1A1F37] text-white font-medium"
                  : "text-gray-300 hover:text-white hover:bg-[#1A1F37]"
              }`}
            >
              <img
                src={isActive ? item.activeIcon : item.icon}
                alt={item.label}
                className="w-6 h-6"
              />
              <span>{item.label}</span>
            </a>
          );
        })}

        {/* Report */}
        <div className="flex flex-col">
          <div
            className={`flex items-center justify-between px-3 py-2 rounded-lg cursor-pointer transition-colors duration-200 text-xs ${
              isReportActive
                ? "bg-[#1A1F37] text-white font-medium"
                : "text-gray-300 hover:text-white hover:bg-[#1A1F37]"
            }`}
            onClick={() => {
              setSelectedPage("Report");
              setIsReportOpen(!isReportOpen);
            }}
          >
            <div className="flex items-center gap-4">
              <img
                src={isReportActive ? "/report_active.svg" : "/report.svg"}
                alt="Report"
                className="w-6 h-6"
              />
              <span>Report</span>
            </div>
            {isReportOpen ? (
              <ChevronUp size={14} className="text-gray-300" />
            ) : (
              <ChevronDown size={14} className="text-gray-300" />
            )}
          </div>

          {/* Submenu Report */}
          {isReportOpen && (
            <div className=" bg-[#0d1225]/70 rounded-md border border-gray-700/50 py-2">
              <div className="flex flex-col space-y-1">
                {reportMenus.map((rep) => {
                  const activeSub = selectedPage === rep.key;
                  return (
                    <a
                      key={rep.key}
                      onClick={() => {
                        handleClick(rep.key, rep.path);
                        setIsReportOpen(true);
                      }}
                      className={`relative flex items-center gap-2 pl-12 pr-3 py-2 rounded-md transition-colors duration-150 group ${
                        activeSub
                          ? "text-blue-400 font-medium bg-[#1A1F37]"
                          : "text-gray-400 hover:text-blue-400 hover:bg-[#1A1F37]/70"
                      }`}
                    >
                      {/* bullet dot */}
                      <Circle
                        size={6}
                        className={`absolute left-8 ${
                          activeSub
                            ? "text-blue-400"
                            : "text-gray-500 group-hover:text-blue-400"
                        }`}
                        fill={activeSub ? "#60a5fa" : "none"}
                      />
                      <span>{rep.label}</span>
                      {/* indikator strip di sisi kiri */}
                      {activeSub && (
                        <span className="absolute left-0 top-0 h-full w-1 bg-blue-400 rounded-r"></span>
                      )}
                    </a>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Logout */}
        <a
          onClick={() => {
            handleClick("Logout");
            setIsReportOpen(false);
          }}
          className={`flex items-center gap-4 px-3 py-2 rounded-lg cursor-pointer transition-colors duration-200 text-xs ${
            selectedPage === "Logout"
              ? "bg-[#1A1F37] text-white font-medium"
              : "text-gray-300 hover:text-white hover:bg-[#1A1F37]"
          }`}
        >
          <img
            src={selectedPage === "Logout" ? "/exit_active.svg" : "/exit.svg"}
            alt="Logout"
            className="w-5 h-5"
          />
          <span>Logout</span>
        </a>
      </nav>
    </aside>
  );
}
