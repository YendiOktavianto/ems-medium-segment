"use client";

import { useRouter, usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { ChevronDown, ChevronUp, Circle } from "lucide-react";
import { flushSync } from "react-dom";

const LAST_POWER_KEY = "lastPowerSub";
const LAST_REPORT_KEY = "lastReportSub";
const slugify = (s: string) => s.toLowerCase().replace(/ /g, "-");
const unslug = (s: string) =>
  s.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());

export default function Sidebar({
  selectedPage,
  setLoading,
  setSelectedPage,
  setShowLogoutOverlay,
}: {
  selectedPage: string;
  setLoading: (v: boolean) => void;
  setSelectedPage: (v: string) => void;
  setShowLogoutOverlay: (v: boolean) => void;
}) {
  const router = useRouter();
  const pathname = usePathname() || "";

  const [isPowerOpen, setIsPowerOpen] = useState(false);
  const [isReportOpen, setIsReportOpen] = useState(false);

  const menus = [
    { key: "Home", label: "Home", icon: "/home.svg", activeIcon: "/home_active.svg", path: "/dashboard/home" },
    { key: "Site Monitoring", label: "Site Monitoring", icon: "/site-monitoring.svg", activeIcon: "/site_monitoring_active.svg", path: "/dashboard" },
    { key: "User Info", label: "User Info", icon: "/user-info.svg", activeIcon: "/profile_active.svg", path: "/dashboard/user-info" },
    { key: "General Info", label: "General Info", icon: "/general-info.svg", activeIcon: "/general_info_active.svg", path: "/dashboard/general-info" },
  ] as const;

  const powerMenus = ["Voltage", "Current", "Frequency", "Power Factor", "Power", "Energy Usage"] as const;

  const reportMenus = [
    { key: "Summary Report", label: "Summary Report", path: "/dashboard/report/summary-report" },
    { key: "Energy Usage Report", label: "Energy Usage Report", path: "/dashboard/report/energy-usage-report" },
  ] as const;

  const isOnPowerPage = pathname.startsWith("/dashboard/power-monitoring");

  // Auto-open submenu jika selectedPage adalah anaknya
  useEffect(() => {
    if (powerMenus.includes(selectedPage as any)) setIsPowerOpen(true);
    if (selectedPage === "Summary Report" || selectedPage === "Energy Usage Report") setIsReportOpen(true);
  }, [selectedPage]);

  // Deeplink berbasis PATH lama (/power-monitoring/xxx) & halaman lain
  useEffect(() => {
    if (!pathname) return;

    // REPORT children
    if (pathname.startsWith("/dashboard/report/")) {
      if (pathname.includes("summary-report")) setSelectedPage("Summary Report");
      else if (pathname.includes("energy-usage-report")) setSelectedPage("Energy Usage Report");
      setIsReportOpen(true);
      setIsPowerOpen(false);
      return;
    }

    // POWER parent (tanpa hash)
    if (pathname === "/dashboard/power-monitoring" && !window.location.hash) {
      setSelectedPage("Power Monitoring");
      setIsPowerOpen(true);
      setIsReportOpen(false);
      return;
    }

    // TOP LEVEL
    const top = [
      { key: "Home", path: "/dashboard/home" },
      { key: "Site Monitoring", path: "/dashboard" },
      { key: "User Info", path: "/dashboard/user-info" },
      { key: "General Info", path: "/dashboard/general-info" },
    ].find((m) => m.path === pathname);

    if (top) {
      setSelectedPage(top.key);
      setIsPowerOpen(false);
      setIsReportOpen(false);
      return;
    }
  }, [pathname, setSelectedPage]);

  // ===== NEW: Hash detection (reload & scroll fallback) =====
  useEffect(() => {
    if (!isOnPowerPage) return;

    const applyHash = () => {
      const h = (typeof window !== "undefined" ? window.location.hash : "").replace("#", "");
      if (h) {
        const name = unslug(h);
        if (powerMenus.includes(name as any)) {
          setSelectedPage(name);
          setIsPowerOpen(true);
          setIsReportOpen(false);
          try { localStorage.setItem(LAST_POWER_KEY, name); } catch {}
          return;
        }
      }
      // tanpa hash → highlight parent
      setSelectedPage("Power Monitoring");
      setIsPowerOpen(true);
      setIsReportOpen(false);
    };

    applyHash(); // on mount (reload/deeplink)
    window.addEventListener("hashchange", applyHash);
    return () => window.removeEventListener("hashchange", applyHash);
  }, [isOnPowerPage, setSelectedPage]);

  // Event dari page.tsx (IntersectionObserver)
  useEffect(() => {
    const onSection = (e: any) => {
      const key = e?.detail as string | undefined;
      if (!key) return;
      setSelectedPage(key);
      try { localStorage.setItem(LAST_POWER_KEY, key); } catch {}
      setIsPowerOpen(true);
      setIsReportOpen(false);
    };
    window.addEventListener("pm-section-change", onSection);
    return () => window.removeEventListener("pm-section-change", onSection);
  }, [setSelectedPage]);

  // Klik umum
  const handleClick = async (key: string, path?: string) => {
    setSelectedPage(key);

    if (powerMenus.includes(key as any)) {
      try { localStorage.setItem(LAST_POWER_KEY, key); } catch {}
    }
    if (key === "Summary Report" || key === "Energy Usage Report") {
      try { localStorage.setItem(LAST_REPORT_KEY, key); } catch {}
    }

    if (key === "Logout") {
      setShowLogoutOverlay(true);
      return;
    }

    // Submenu Power → pakai HASH
    if (powerMenus.includes(key as any)) {
      const hash = `#${slugify(key)}`;
      setIsPowerOpen(true);
      setIsReportOpen(false);

      if (isOnPowerPage) {
        const target = `/dashboard/power-monitoring${hash}`;
        if (pathname + (window.location.hash || "") !== target) {
          router.replace(target);
        }
        return;
      }
      router.push(`/dashboard/power-monitoring${hash}`);
      return;
    }

    // Lainnya → route normal
    if (path) {
      if (path === pathname) return;
      if (path.startsWith("/dashboard/report/")) {
        setIsReportOpen(true);
        setIsPowerOpen(false);
      } else if (path.startsWith("/dashboard/power-monitoring")) {
        setIsPowerOpen(true);
        setIsReportOpen(false);
      } else {
        setIsPowerOpen(false);
        setIsReportOpen(false);
      }
      flushSync(() => setLoading(true));
      router.push(path);
    }
  };

  return (
    <aside
      className="w-64 flex flex-col p-3 rounded-t-2xl mt-4 ml-4 h-screen fixed select-none"
      style={{ background: "linear-gradient(100deg, rgba(6,11,40,1) 0%, rgba(26,31,55,0) 100%)" }}
    >
      {/* Logo */}
      <h1 className="flex items-center gap-2 text-base font-bold text-white mb-1">
        <img src="/logo2.svg" alt="logo" className="w-80" />
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
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  (e.currentTarget as HTMLAnchorElement).click();
                }
              }}
              role="button"
              tabIndex={0}
              aria-current={isActive ? "page" : undefined}
              className={`flex items-center gap-3 px-3 py-1.5 rounded-lg cursor-pointer transition-colors duration-200 ${
                isActive ? "bg-[#1A1F37] text-white font-medium" : "text-gray-300 hover:text-white hover:bg-[#1A1F37]"
              }`}
            >
              <img src={isActive ? item.activeIcon : item.icon} alt={item.label} className="w-5 h-5" />
              <span>{item.label}</span>
            </a>
          );
        })}

        {/* POWER MONITORING */}
        <div
          className={`rounded-lg mt-1 ${
            isPowerOpen || selectedPage === "Power Monitoring" || powerMenus.includes(selectedPage as any)
              ? "bg-[#141830]"
              : "bg-transparent"
          }`}
        >
          <div className="flex w-full items-center justify-between px-3 py-1.5 cursor-pointer hover:bg-[#1A1F37] rounded-lg">
            {/* Klik kiri = buka Power & scroll ke TOP (tanpa hash) */}
            <div
              className="flex items-center gap-3 flex-1"
              onClick={() => {
                if (isPowerOpen && (powerMenus.includes(selectedPage as any) || selectedPage === "Power Monitoring")) {
                  setIsPowerOpen(false);
                  return;
                }
                setIsReportOpen(false);
                setIsPowerOpen(true);
                setSelectedPage("Power Monitoring");

                const targetPath = "/dashboard/power-monitoring";
                if (isOnPowerPage) {
                  try { history.replaceState(null, "", targetPath); } catch {}
                  const root = document.getElementById("pm-scroll");
                  if (root) root.scrollTo({ top: 0, behavior: "smooth" });
                  return;
                }
                flushSync(() => setLoading(true));
                router.push(targetPath);
              }}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  (e.currentTarget as HTMLDivElement).click();
                }
              }}
            >
              <img
                src={selectedPage === "Power Monitoring" || isPowerOpen ? "/power_monitoring_active.svg" : "/power-monitoring.svg"}
                alt="Power Monitoring"
                className="w-5 h-5"
              />
              <span
                className={
                  selectedPage === "Power Monitoring" || powerMenus.includes(selectedPage as any)
                    ? "text-white font-medium"
                    : "text-gray-300"
                }
              >
                Power Monitoring
              </span>
            </div>

            {/* Chevron = toggle submenu saja */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                setIsPowerOpen((prev) => {
                  const next = !prev;
                  if (next) setIsReportOpen(false);
                  return next;
                });
              }}
              aria-expanded={isPowerOpen}
              aria-controls="power-submenu"
            >
              {isPowerOpen ? <ChevronUp size={12} className="text-gray-300" /> : <ChevronDown size={12} className="text-gray-300" />}
            </button>
          </div>

          {isPowerOpen && (
            <div id="power-submenu" className="bg-[#0d1225]/70 rounded-md border border-gray-700/50 py-1.5">
              <div className="flex flex-col space-y-0.5">
                {powerMenus.map((sub) => {
                  const activeSub = selectedPage === sub;
                  return (
                    <a
                      key={sub}
                      onClick={() => handleClick(sub)} // akan push/replace hash
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          e.preventDefault();
                          (e.currentTarget as HTMLAnchorElement).click();
                        }
                      }}
                      role="button"
                      tabIndex={0}
                      className={`relative flex items-center gap-2 pl-10 pr-2 py-1.5 rounded-md transition-colors duration-150 group ${
                        activeSub ? "text-blue-400 font-medium bg-[#1A1F37]" : "text-gray-400 hover:text-blue-400 hover:bg-[#1A1F37]/70"
                      }`}
                    >
                      <Circle
                        size={5}
                        className={`absolute left-7 ${activeSub ? "text-blue-400" : "text-gray-500 group-hover:text-blue-400"}`}
                        fill={activeSub ? "#60a5fa" : "none"}
                      />
                      <span>{sub}</span>
                      {activeSub && <span className="absolute left-0 top-0 h-full w-0.5 bg-blue-400 rounded-r" />}
                    </a>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* REPORT */}
        <div className={`rounded-lg mt-1 ${isReportOpen ? "bg-[#141830]" : "bg-transparent"}`}>
          <button
            onClick={() =>
              setIsReportOpen((prev) => {
                const next = !prev;
                if (next) {
                  setIsPowerOpen(false);
                  try {
                    const last = localStorage.getItem(LAST_REPORT_KEY);
                    const target =
                      last === "Energy Usage Report" ? "/dashboard/report/energy-usage-report" : "/dashboard/report/summary-report";
                    if (!pathname.startsWith("/dashboard/report/")) {
                      handleClick(last || "Summary Report", target);
                    }
                  } catch {}
                }
                return next;
              })
            }
            aria-expanded={isReportOpen}
            aria-controls="report-submenu"
            className="flex w-full items-center justify-between px-3 py-1.5 cursor-pointer hover:bg-[#1A1F37] rounded-lg"
          >
            <div className="flex items-center gap-3">
              <img src={selectedPage === "Report" || isReportOpen ? "/report_active.svg" : "/report.svg"} alt="Report" className="w-5 h-5" />
              <span
                className={
                  selectedPage === "Report" || selectedPage === "Summary Report" || selectedPage === "Energy Usage Report"
                    ? "text-white font-medium"
                    : "text-gray-300"
                }
              >
                Report
              </span>
            </div>
            {isReportOpen ? <ChevronUp size={12} className="text-gray-300" /> : <ChevronDown size={12} className="text-gray-300" />}
          </button>

          {isReportOpen && (
            <div id="report-submenu" className="bg-[#0d1225]/70 rounded-md border border-gray-700/50 py-1.5">
              <div className="flex flex-col space-y-0.5">
                {reportMenus.map((rep) => {
                  const activeSub = selectedPage === rep.key;
                  return (
                    <a
                      key={rep.key}
                      onClick={() => handleClick(rep.key, rep.path)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          e.preventDefault();
                          (e.currentTarget as HTMLAnchorElement).click();
                        }
                      }}
                      role="button"
                      tabIndex={0}
                      className={`relative flex items-center gap-2 pl-10 pr-2 py-1.5 rounded-md transition-colors duration-150 group ${
                        activeSub ? "text-blue-400 font-medium bg-[#1A1F37]" : "text-gray-400 hover:text-blue-400 hover:bg-[#1A1F37]/70"
                      }`}
                    >
                      <Circle
                        size={5}
                        className={`absolute left-7 ${activeSub ? "text-blue-400" : "text-gray-500 group-hover:text-blue-400"}`}
                        fill={activeSub ? "#60a5fa" : "none"}
                      />
                      <span>{rep.label}</span>
                      {activeSub && <span className="absolute left-0 top-0 h-full w-0.5 bg-blue-400 rounded-r" />}
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
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              (e.currentTarget as HTMLAnchorElement).click();
            }
          }}
          role="button"
          tabIndex={0}
          className={`flex items-center gap-3 px-3 py-1.5 rounded-lg cursor-pointer hover:bg-[#1A1F37] transition-colors duration-200 ${
            selectedPage === "Logout" ? "bg-[#1A1F37] text-white font-medium" : "text-gray-300 hover:text-white"
          }`}
        >
          <img src={selectedPage === "Logout" ? "/exit_active.svg" : "/exit.svg"} alt="Logout" className="w-4 h-4" />
          <span>Logout</span>
        </a>
      </nav>
    </aside>
  );
}
