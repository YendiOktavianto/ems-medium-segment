"use client";

import React from "react";
import { createPortal } from "react-dom";
import { useHome } from "./useHome";
import { formatCurrency } from "./validation";
import {
  DEFAULT_BG,
  INFO_CARD_BG,
  CARD_BG,
  VALUE_COLOR,
  ENERGY_COLOR,
} from "./constants";
import type { Device } from "./types";

/** --- Mock data (ID unik & tanpa duplikasi) --- */
const DEV_MOCK_DEVICES: Device[] = [
  {
    device_id: "EMS-101-ALFA-01",
    address_name: "Rumah Utama",
    detail_location: "Jl. Merdeka No. 10, Salatiga",
    watt_phase: "2200VA / 1-Phase",
    segment: "Residential",
    voltage: 221,
    current: 4.8,
    frequency: 50.02,
    power: 1025,
    power_Factor: 0.96,
    total_energy_usage_today: 3.25,
    total_energy_usage_Mtd: 68.4,
    total_energy_cost_today: 6200,
    total_energy_cost_mtd: 128400,
  },
  {
    device_id: "EMS-101-ALFA-02",
    address_name: "Rumah Utama 2",
    detail_location: "Jl. Pahlawan No. 5, Salatiga",
    watt_phase: "2200VA / 1-Phase",
    segment: "Residential",
    voltage: 222,
    current: 4.6,
    frequency: 50.0,
    power: 1010,
    power_Factor: 0.97,
    total_energy_usage_today: 2.95,
    total_energy_usage_Mtd: 61.4,
    total_energy_cost_today: 5800,
    total_energy_cost_mtd: 118000,
  },
  {
    device_id: "EMS-202-BETA-01",
    address_name: "Kantor Cabang",
    detail_location: "Jl. Diponegoro No. 2, Semarang",
    watt_phase: "6600VA / 3-Phase",
    segment: "Commercial",
    voltage: 230,
    current: 7.2,
    frequency: 49.98,
    power: 1620,
    power_Factor: 0.93,
    total_energy_usage_today: 5.9,
    total_energy_usage_Mtd: 121.7,
    total_energy_cost_today: 10950,
    total_energy_cost_mtd: 238900,
  },
  {
    device_id: "EMS-202-BETA-02",
    address_name: "Kantor Timur",
    detail_location: "Jl. Gajah Mada No. 11, Semarang",
    watt_phase: "6600VA / 3-Phase",
    segment: "Commercial",
    voltage: 231,
    current: 7.0,
    frequency: 49.99,
    power: 1600,
    power_Factor: 0.92,
    total_energy_usage_today: 5.4,
    total_energy_usage_Mtd: 118.2,
    total_energy_cost_today: 10250,
    total_energy_cost_mtd: 229400,
  },
  {
    device_id: "EMS-303-GAMMA-01",
    address_name: "Gudang Barat",
    detail_location: "Kawasan Industri, Blok C7",
    watt_phase: "3500VA / 1-Phase",
    segment: "Industrial",
    voltage: 219,
    current: 6.1,
    frequency: 50.01,
    power: 1275,
    power_Factor: 0.95,
    total_energy_usage_today: 4.4,
    total_energy_usage_Mtd: 95.3,
    total_energy_cost_today: 8300,
    total_energy_cost_mtd: 188600,
  },
  {
    device_id: "EMS-303-GAMMA-02",
    address_name: "Gudang Timur",
    detail_location: "Kawasan Industri, Blok D9",
    watt_phase: "3500VA / 1-Phase",
    segment: "Industrial",
    voltage: 220,
    current: 5.7,
    frequency: 50.03,
    power: 1225,
    power_Factor: 0.94,
    total_energy_usage_today: 4.0,
    total_energy_usage_Mtd: 90.1,
    total_energy_cost_today: 7800,
    total_energy_cost_mtd: 179900,
  },
];

export default function Dashboard() {
  const userId = "123";
  const token = "user-jwt-token";
  const { devices = [], selectedDeviceId, setSelectedDeviceId, currentDevice } =
    useHome(userId, token);

  const hasDevices = Array.isArray(devices) && devices.length > 0;

  // Fallback ke mock jika backend belum ada data
  const devFallback = !hasDevices;
  const [localSelectedDeviceId, setLocalSelectedDeviceId] = React.useState<string>(
    DEV_MOCK_DEVICES[0]?.device_id ?? ""
  );

  const [pickerOpen, setPickerOpen] = React.useState(false);
  const [query, setQuery] = React.useState("");
  const [hi, setHi] = React.useState(0); // highlighted index untuk keyboard nav
  const pickBtnRef = React.useRef<HTMLButtonElement | null>(null);

  const devicesView: Device[] = devFallback ? DEV_MOCK_DEVICES : (devices as Device[]);
  const selectedId = devFallback ? localSelectedDeviceId : selectedDeviceId;
  const setSelected = devFallback ? setLocalSelectedDeviceId : setSelectedDeviceId;

  const current: Partial<Device> =
    devFallback
      ? devicesView.find((d) => d.device_id === selectedId) ?? devicesView[0] ?? {}
      : (currentDevice as Partial<Device>);

  const filtered = React.useMemo(() => {
    if (!query.trim()) return devicesView;
    const q = query.toLowerCase();
    return devicesView.filter(
      (d) =>
        d.device_id.toLowerCase().includes(q) ||
        d.address_name.toLowerCase().includes(q) ||
        d.detail_location.toLowerCase().includes(q)
    );
  }, [query, devicesView]);

  // helper tutup + balikin fokus
  const closePicker = React.useCallback(() => {
    setPickerOpen(false);
    setTimeout(() => pickBtnRef.current?.focus(), 0);
  }, []);

  // Tutup overlay dengan ESC
  React.useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && closePicker();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [closePicker]);

  // Lock body scroll ketika overlay terbuka
  React.useEffect(() => {
    if (!pickerOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [pickerOpen]);

  // Focus trap sederhana saat dialog terbuka
  React.useEffect(() => {
    if (!pickerOpen) return;
    const dialog = document.getElementById("device-picker");
    if (!dialog) return;

    const focusables = dialog.querySelectorAll<HTMLElement>(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    const first = focusables[0];
    const last = focusables[focusables.length - 1];

    first?.focus();

    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Tab" || focusables.length === 0) return;
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        (last as HTMLElement)?.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        (first as HTMLElement)?.focus();
      }
    };

    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [pickerOpen]);

  // Reset highlighted item jika filter berubah
  React.useEffect(() => setHi(0), [query, filtered.length]);

  return (
    <div
      className="
        relative isolate
        flex flex-col mx-auto sm:mr-8 rounded-2xl
        box-border min-h-[84dvh] md:h-[84dvh] md:max-h-[100dvh]
        overflow-auto md:overflow-hidden
        p-5 sm:p-5
        pb-[max(env(safe-area-inset-bottom),12px)]
        text-white
      "
      style={{ background: DEFAULT_BG }}
    >
      {/* dekor tipis */}
      <div className="pointer-events-none absolute inset-0 opacity-[0.12]">
        <div className="absolute -top-24 -left-24 w-72 h-72 rounded-full blur-3xl bg-blue-400/40" />
        <div className="absolute -bottom-24 -right-24 w-72 h-72 rounded-full blur-3xl bg-indigo-400/40" />
      </div>

      {/* Header */}
      <header className="text-white">
        <div className="flex items-start justify-between gap-3">
          <div className="text-center sm:text-left w-full">
            <h1 className="text-[clamp(16px,2.2vw,22px)] text-center font-semibold">
              Dashboard Monitoring
            </h1>
          </div>
        </div>
      </header>

      {/* Device Info */}
      <section className="flex flex-col sm:flex-row justify-between gap-3 sm:gap-4 text-white mb-4 sm:mb-5 text-[11px] sm:text-[10px]">
        <div className="min-w-0">
          <Label>Serial Number</Label>
          <p className="leading-tight">
            <span className="inline-flex items-center rounded-full border border-white/15 bg-white/5
                              px-2 py-0.5 text-[12px] tracking-wide">
              {current?.device_id || "-"}
            </span>
          </p>

          <Label className="mt-1.5">Location</Label>
          {devicesView.length <= 3 ? (
            <select
              className="bg-[#0C1F3C]/80 border border-white/15 text-white/90
                         text-[12px] rounded
                         w-full sm:w-auto backdrop-blur focus:outline-none
                         focus:ring-2 focus:ring-sky-400/50 transition"
              value={selectedId}
              onChange={(e) => setSelected(e.target.value)}
            >
              {devicesView.map((device) => (
                <option key={device.device_id} value={device.device_id}>
                  {device.address_name} • {device.detail_location}
                </option>
              ))}
            </select>
          ) : (
            <button
              ref={pickBtnRef}
              type="button"
              onClick={() => setPickerOpen(true)}
              className="bg-[#0C1F3C]/80 border border-white/15 text-left
                         px-1.5 py-0.5 rounded w-full sm:w-full backdrop-blur
                         focus:outline-none focus:ring-2 focus:ring-sky-400/50
                         text-white/90 text-[10px] transition"
              aria-haspopup="dialog"
              aria-expanded={pickerOpen}
            >              
                <span className="">
                  {(current?.address_name || "-") + " | " + (current?.detail_location || "-")}
                </span>
            </button>
          )}
        </div>

        <div className="text-left sm:text-right">
          <Label>Wattage / Phase</Label>
          <p className="leading-tight">
            <span className="inline-flex items-center rounded-full border border-white/15 bg-white/5
                           px-2 py-0.5 text-[12px] tracking-wide">
              {current?.watt_phase || "-"}
            </span>
          </p>

          <Label className="mt-1.5">Segment</Label>
          <p className="leading-tight">
            <span className="inline-flex items-center rounded-full border border-white/15 bg-white/5
                           px-2 py-0.5 text-[12px] tracking-wide">
              {current?.segment || "-"}
            </span>
          </p>
        </div>
      </section>

      {/* Konten 3 kolom */}
      <div className="min-h-0 h-full grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-5 text-white">
        {/* Kolom 1 */}
        <div className="min-h-0 h-full grid grid-rows-2 gap-4 sm:gap-5">
          <Card>
            <CardTitle>Voltage (Volt)</CardTitle>
            <ValueDisplay value={current?.voltage} unit="V" size="big" decimals={0} color={VALUE_COLOR} />
          </Card>
          <Card>
            <CardTitle>Current (Ampere)</CardTitle>
            <ValueDisplay value={current?.current} unit="A" size="big" decimals={2} color={VALUE_COLOR} />
          </Card>
        </div>

        {/* Kolom 2 */}
        <div className="min-h-0 h-full grid grid-rows-3 gap-4 sm:gap-5">
          <Card>
            <CardTitle>Frequency (Hz)</CardTitle>
            <ValueDisplay value={current?.frequency} unit="Hz" size="mid" decimals={2} color="#98B5FC" />
          </Card>
          <Card>
            <CardTitle>Power (Watt)</CardTitle>
            <ValueDisplay value={current?.power} unit="W" size="mid" decimals={0} color="#98B5FC" />
          </Card>
          <Card>
            <CardTitle>Power Factor (Cos φ)</CardTitle>
            <ValueDisplay value={current?.power_Factor} unit="" size="mid" decimals={2} color="#98B5FC" />
          </Card>
        </div>

        {/* Kolom 3 */}
        <div className="min-h-0 h-full grid grid-rows-2 gap-4 sm:gap-5">
          <Card>
            <CardTitle>Total Energy Usage (kWh)</CardTitle>
            <div className="flex flex-col items-center justify-center h-full">
              <LabeledValue label="Today">
                <ValueDisplay value={current?.total_energy_usage_today} unit="kWh" size="mid" decimals={2} color={ENERGY_COLOR} />
              </LabeledValue>
              <div className="my-1 h-px w-16 mx-auto bg-white/10" aria-hidden />
              <LabeledValue label="MTD">
                <ValueDisplay value={current?.total_energy_usage_Mtd} unit="kWh" size="mid" decimals={2} color={ENERGY_COLOR} />
              </LabeledValue>
            </div>
          </Card>

          <Card>
            <CardTitle>Total Energy Cost (IDR)</CardTitle>
            <div className="flex flex-col items-center justify-center h-full">
              <LabeledValue label="Today">
                <CurrencyValue value={current?.total_energy_cost_today} size="mid" color={ENERGY_COLOR} />
              </LabeledValue>
              <div className="my-1 h-px w-16 mx-auto bg-white/10" aria-hidden />
              <LabeledValue label="MTD">
                <CurrencyValue value={current?.total_energy_cost_mtd} size="mid" color={ENERGY_COLOR} />
              </LabeledValue>
            </div>
          </Card>
        </div>
      </div>

      {/* ========= Overlay Device Picker via Portal ========= */}
      {pickerOpen &&
        typeof document !== "undefined" &&
        createPortal(
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="device-picker-title"
            className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
            onClick={closePicker}
          >
            {/* backdrop */}
            <div className="absolute inset-0 bg-black/80" />

            {/* panel */}
            <div
              id="device-picker"
              className="relative w-full max-w-2xl rounded-2xl shadow-2xl ring-1 ring-white/10 p-4 overflow-hidden"
              style={{ background: CARD_BG }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="sticky top-0 sm:py-5 border-b border-white/10 backdrop-blur-sm flex items-center gap-2">
                <h2 id="device-picker-title" className="sr-only">Pilih Device</h2>
                <input
                  autoFocus
                  placeholder="Cari device / lokasi…"
                  className="w-full bg-white/[0.06] border border-white/15 text-white px-3 py-2 rounded-lg
                             focus:outline-none focus:ring-2 focus:ring-blue-400/60 text-[12px]"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyDown={(e) => {
                    if (!filtered.length) return;
                    if (e.key === "ArrowDown") {
                      e.preventDefault();
                      setHi((v) => Math.min(v + 1, filtered.length - 1));
                    }
                    if (e.key === "ArrowUp") {
                      e.preventDefault();
                      setHi((v) => Math.max(v - 1, 0));
                    }
                    if (e.key === "Enter") {
                      const d = filtered[hi];
                      if (!d) return;
                      setSelected(d.device_id);
                      closePicker();
                      setQuery("");
                    }
                  }}
                />
                <button
                  className="px-3 py-2 rounded-lg bg-white/5 border border-white/15 text-white hover:bg-white/10 text-[12px]"
                  onClick={closePicker}
                  aria-label="Close"
                >
                  Close
                </button>
              </div>

              <ul role="listbox" className="max-h-[50vh] overflow-auto divide-y divide-white/10 overlay-scroll">
                {filtered.map((d, idx) => {
                  const isActive = (devFallback ? localSelectedDeviceId : selectedDeviceId) === d.device_id;
                  const isHi = filtered[hi]?.device_id === d.device_id;
                  return (
                    <li key={d.device_id}>
                      <button
                        role="option"
                        aria-selected={isActive}
                        className={`w-full text-left px-4 sm:px-5 py-3 transition ${
                          isHi ? "bg-white/15" : isActive ? "bg-white/10" : "hover:bg-white/5"
                        }`}
                        onMouseEnter={() => setHi(idx)}
                        onClick={() => {
                          setSelected(d.device_id);
                          closePicker();
                          setQuery("");
                        }}
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
                          <div className="min-w-0">
                            <p className="font-medium truncate text-[11px]">{d.address_name}</p>
                            <p className="text-white/70 text-[11px] truncate">{d.detail_location}</p>
                          </div>
                          <div className="flex items-center flex-wrap gap-2 sm:pl-4">
                            <span className="text-[10px] text-white/70">{d.device_id}</span>
                            <span className="text-[10px] rounded-full border border-white/15 bg-white/5 px-2 py-0.5">
                              {d.segment}
                            </span>
                            <span className="text-[10px] rounded-full border border-white/15 bg-white/5 px-2 py-0.5">
                              {d.watt_phase}
                            </span>
                          </div>
                        </div>
                      </button>
                    </li>
                  );
                })}
                {filtered.length === 0 && (
                  <li className="p-5 text-center text-white/70 text-[11px]">Tidak ada hasil.</li>
                )}
              </ul>
            </div>
          </div>,
          document.body
        )}
      {/* =================================================================== */}
    </div>
  );
}

/* ================= Subcomponents ================= */

function Card({
  children,
  className = "",
  style,
}: React.PropsWithChildren<{ className?: string; style?: React.CSSProperties }>) {
  return (
    <div
      className={`
        rounded-2xl p-4 sm:p-6 h-full
        ring-1 ring-white/10 hover:ring-white/20 transition
        shadow-[0_10px_35px_rgba(0,0,0,0.25)]
        backdrop-blur-sm flex flex-col items-center justify-center gap-2
        ${className}
      `}
      style={{ background: INFO_CARD_BG, ...(style || {}) }}
    >
      {children}
    </div>
  );
}

function CardTitle({ children }: React.PropsWithChildren) {
  return (
    <p className="uppercase tracking-wider text-[10px] sm:text-[11px] text-white/80 text-center font-semibold">
      {children}
    </p>
  );
}

function Label({
  children,
  className = "",
}: React.PropsWithChildren<{ className?: string }>) {
  return (
    <p className={`uppercase tracking-widest text-white/70 text-[9px] ${className}`}>
      {children}
    </p>
  );
}

function LabeledValue({ label, children }: React.PropsWithChildren<{ label: string }>) {
  return (
    <div className="flex flex-col items-center gap-1">
      <span className="text-[10px] uppercase tracking-widest text-white/70">{label}</span>
      {children}
    </div>
  );
}

function ValueDisplay({
  value,
  unit = "",
  decimals = 0,
  size = "mid",
  color,
}: {
  value: number | null | undefined;
  unit?: string;
  decimals?: number;
  size?: "big" | "mid";
  color?: string;
}) {
  const isEmpty = value === null || value === undefined || Number.isNaN(value as any);
  const nf = new Intl.NumberFormat("id-ID", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });

  const num = isEmpty ? "-" : nf.format(Number(value));

  const numClass =
    size === "big"
      ? "text-[clamp(33px,6.5vw,85px)]"
      : "text-[clamp(20px,3.6vw,26px)]";
  const unitClass =
    size === "big"
      ? "text-[clamp(14px,2.6vw,35px)]"
      : "text-[clamp(13px,2.2vw,17px)]";

  return (
    <div
      className="flex items-baseline justify-center gap-2 leading-none whitespace-nowrap"
      aria-live="polite"
      style={{ color }}
    >
      <span className={`font-extrabold tabular-nums ${numClass}`}>{num}</span>
      {unit ? <span className={`font-semibold opacity-85 ${unitClass}`}>{unit}</span> : null}
    </div>
  );
}

function CurrencyValue({
  value,
  size = "mid",
  color,
}: {
  value: number | null | undefined;
  size?: "big" | "mid";
  color?: string;
}) {
  const numClass =
    size === "big"
      ? "text-[clamp(28px,6.5vw,52px)]"
      : "text-[clamp(16px,3.6vw,24px)]";
  return (
    <div className="flex items-baseline justify-center gap-2 leading-none" style={{ color }}>
      <span className={`font-extrabold tabular-nums ${numClass}`} aria-live="polite">
        {formatCurrency(value)}
      </span>
    </div>
  );
}
