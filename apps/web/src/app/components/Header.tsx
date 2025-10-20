"use client";
import Image from "next/image";
import { usePathname } from "next/navigation";

const POWER_SUBS = new Set([
  "Voltage",
  "Current",
  "Frequency",
  "Power Factor",
  "Power",
  "Energy Usage",
]);
const REPORT_SUBS = new Set(["Summary Report", "Energy Usage Report"]);

export default function Header({ time, selectedPage }: any) {
  const pathname = usePathname() || "";

  // Build crumbs
  const crumbs: string[] = ["Pages"];
  if (pathname.startsWith("/dashboard/power-monitoring")) {
    crumbs.push("Power Monitoring");
    if (POWER_SUBS.has(selectedPage)) crumbs.push(selectedPage);
  } else if (pathname.startsWith("/dashboard/report")) {
    crumbs.push("Report");
    if (REPORT_SUBS.has(selectedPage)) crumbs.push(selectedPage);
  } else if (selectedPage) {
    crumbs.push(selectedPage);
  }

  return (
    <div className="flex justify-between items-center mb-6 mr-8">
      {/* Breadcrumb */}
      <div className="text-[10px] font-normal text-gray-300">
        {crumbs.map((c, i) => (
          <span key={i}>
            {i > 0 && " / "}
            <span className={i === crumbs.length - 1 ? "text-white" : ""}>{c}</span>
          </span>
        ))}
      </div>

      {/* Right (Clock + Profile) */}
      <div className="flex items-center">
        <div
          className="text-xs text-white px-6 py-2 rounded-full"
          style={{
            background:
              "linear-gradient(90deg, rgba(6,11,40,0.74) 0%, rgba(10,14,35,0.71) 100%)",
          }}
        >
          {time}
        </div>
        <div className="ml-3">
          <Image
            src="/profile.svg"
            alt="Profile"
            width={30}
            height={30}
            className="rounded-full border-2 border-blue-500"
          />
        </div>
      </div>
    </div>
  );
}
