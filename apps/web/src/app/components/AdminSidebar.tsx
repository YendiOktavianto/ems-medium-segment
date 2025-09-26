import { useRouter } from "next/navigation";

export default function Sidebar({ selectedPage, setSelectedPage, setShowLogoutOverlay }: any) {
  const router = useRouter();

  const handleClick = (key: string, path?: string) => {
    setSelectedPage(key);
    if (key === "Logout") {
      setShowLogoutOverlay(true);
    } else if (path) {
      router.push(path);
    }
  };

  return (
    <aside
      className="w-65 flex flex-col p-4 rounded-t-2xl mt-4 ml-4 h-screen fixed"
      style={{
        background:
          "linear-gradient(100deg, rgba(6,11,40,1) 0%, rgba(26,31,55,0) 100%)",
      }}
    >
      {/* Logo */}
      <h1 className="flex items-center gap-2 text-lg font-bold text-white">
        <img src="/logo2.svg" alt="logo" className="w-200 h-10" />
      </h1>
      <img src="/line.svg" alt="logo" className="w-67 h-8" />

      {/* Navigation Scrollable */}
      <nav className="flex-1 overflow-y-auto flex flex-col text-xs custom-scroll">
        {/* main menu */}
        {[
          { key: "Dashboard", label: "Dashboard", icon: "/home.svg", path: "/admin" },
          { key: "Site Monitoring", label: "Site Monitoring", icon: "/site-monitoring.svg", path: "/admin/site-monitoring" },
          { key: "User Management", label: "User Management", icon: "/user-info.svg", path: "/admin/user-management" },
          { key: "Device Management", label: "Device Management", icon: "/general-info.svg", path: "/admin/device-management" },
          { key: "Device Request", label: "Device Request", icon: "/general-info.svg", path: "/admin/device-request" },
          { key: "List Cost Energy", label: "List Cost Energy", icon: "/general-info.svg", path: "/admin/list-cost-energy" },
        ].map((item) => (
          <a
            key={item.key}
            onClick={() => handleClick(item.key, item.path)}
            className={`flex items-center gap-4 px-3 py-2 rounded-lg cursor-pointer hover:bg-[#1A1F37] transition-colors duration-200 ${
              selectedPage === item.key
                ? "text-white font-medium"
                : "text-gray-300 hover:text-white"
            }`}
          >
            <img src={item.icon} alt={item.label} className="w-6 h-6" />
            <span>{item.label}</span>
          </a>
        ))}

        {/* Report */}
        <details className="group">
          <summary className="flex items-center gap-4 px-3 py-2 rounded-lg cursor-pointer hover:bg-[#1A1F37] text-gray-300 hover:text-white transition-colors duration-200 list-none text-xs">
            <img src="/report.svg" alt="Report" className="w-6 h-6" />
            <span>Report</span>
          </summary>
          <div className="ml-13 flex flex-col gap-5 mt-3 mb-4 text-gray-400 text-xxs">
            {[
              { label: "Summary Report", path: "/admin/report/summary-report" },
              { label: "Energy Usage Report", path: "/admin/report/energy-usage-report" },
            ].map((rep) => (
              <a
                key={rep.label}
                onClick={() => handleClick(rep.label, rep.path)}
                className="hover:text-blue-400 cursor-pointer"
              >
                {rep.label}
              </a>
            ))}
          </div>
        </details>

        {/* Logout */}
        <a
          onClick={() => handleClick("Logout")}
          className={`flex items-center gap-4 px-3 py-2 rounded-lg cursor-pointer hover:bg-[#1A1F37] transition-colors duration-200 text-xs ${
            selectedPage === "Logout"
              ? "text-white font-medium"
              : "text-gray-300 hover:text-white"
          }`}
        >
          <img src="/exit.svg" alt="Logout" className="w-5 h-5" />
          <span>Logout</span>
        </a>
      </nav>
    </aside>
  );
}
