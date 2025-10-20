"use client";

import Image from "next/image";
import React from "react";
import { motion, useReducedMotion } from "framer-motion";
import { Search } from "lucide-react";
import {
  QrCode,
  MapPin,
  Zap,
  Tags,
  Cpu,
  CheckCircle2,
  XCircle,
  HelpCircle,
  ClipboardCopy,
} from "lucide-react";
import { createPortal } from "react-dom";
import { useGeneralInfo } from "./useGeneralInfo";
import { DEFAULT_BG, INFO_CARD_BG, CARD_BG } from "./constants";

/* --------------------------------- Utils --------------------------------- */
function safe<T>(v: T | null | undefined, fallback = "-"): T | string {
  return v === null || v === undefined || v === "" ? fallback : v;
}

function copy(text: string) {
  if (typeof navigator !== "undefined" && navigator.clipboard) {
    navigator.clipboard.writeText(text).catch(() => {});
  }
}

/* --------------------------- Main page component -------------------------- */
export default function GeneralInfoContent() {
  const reduce = useReducedMotion();

  const userId = "123"; // TODO: get from auth context
  const token = "user-jwt-token"; // optional

  const { devices = [], selectedDeviceIndex, setSelectedDeviceIndex, currentDevice } =
    useGeneralInfo(userId, token);

  const serialText = String(safe(currentDevice?.serial_number ?? currentDevice?.device_id));

  /* -------- Overlay state & helpers (by INDEX, sinkron dgn useGeneralInfo) -------- */
  const [pickerOpen, setPickerOpen] = React.useState(false);
  const [query, setQuery] = React.useState("");
  const [activeIdx, setActiveIdx] = React.useState(0);

  const idOf = (d: any) => d?.device_id ?? d?.serial_number ?? "";
  const nameOf = (d: any) => d?.address_name ?? d?.location ?? "-";
  const detailOf = (d: any) => d?.detail_location ?? "-";
  const labelOf = (d: any) => `${nameOf(d)}${d?.detail_location ? " — " + d.detail_location : ""}`;

  const list = React.useMemo(
    () => (devices || []).map((d: any, idx: number) => ({ d, idx })),
    [devices]
  );

  const filtered = React.useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return list;
    return list.filter(({ d }) =>
      (`${idOf(d)} ${nameOf(d)} ${detailOf(d)}`.toLowerCase()).includes(q)
    );
  }, [query, list]);

  // Sync pointer saat overlay dibuka
  React.useEffect(() => {
    if (!pickerOpen) return;
    const pos = filtered.findIndex(({ idx }) => idx === selectedDeviceIndex);
    setActiveIdx(pos >= 0 ? pos : 0);
  }, [pickerOpen, filtered, selectedDeviceIndex]);

  // ESC, ↑/↓, Enter
  React.useEffect(() => {
    if (!pickerOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") return setPickerOpen(false);
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setActiveIdx((p) => (filtered.length ? (p + 1) % filtered.length : 0));
      }
      if (e.key === "ArrowUp") {
        e.preventDefault();
        setActiveIdx((p) => (filtered.length ? (p - 1 + filtered.length) % filtered.length : 0));
      }
      if (e.key === "Enter") {
        e.preventDefault();
        const pick = filtered[activeIdx];
        if (pick) {
          setSelectedDeviceIndex(pick.idx);
          setPickerOpen(false);
          setQuery("");
        }
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [pickerOpen, filtered, activeIdx, setSelectedDeviceIndex]);

  return (
    <div
      className={[
        "relative isolate",
        "flex flex-col mx-auto sm:mr-8 rounded-2xl",
        `box-border h-[84dvh] max-h-[100dvh] ${pickerOpen ? "overflow-visible" : "overflow-hidden"}`,
        "p-4 sm:p-6",
        "pb-[max(env(safe-area-inset-bottom),10px)]",
      ].join(" ")}
      style={{ background: DEFAULT_BG }}
    >
      {/* glows (tidak mempengaruhi layout) */}
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute left-[-10%] top-[-15%] h-72 w-72 rounded-full bg-indigo-500/25 blur-3xl" />
        <div className="absolute right-[-10%] bottom-[-20%] h-80 w-80 rounded-full bg-sky-500/25 blur-3xl" />
      </div>

      {/* header */}
      <div className="mb-3">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 className="text-white font-semibold leading-tight text-[clamp(16px,2vw,26px)]">
              General Info
            </h2>
            <p className="text-white/60 text-[11px] sm:text-xs mt-0.5">
              Ringkasan identitas dan status perangkat
            </p>
          </div>

          {/* ✅ Keterangan jumlah device (pill) */}
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] bg-white/5 border border-white/10 text-white/80 backdrop-blur-md">
              <Cpu className="h-3.5 w-3.5" />
              {list.length} device
            </span>
          </div>
        </div>
      </div>

      {/* layout utama */}
      <div className="grid grid-cols-12 gap-3 sm:gap-4 items-start max-w-7xl w-full flex-1">
        {/* Left */}
        <motion.aside
          initial={reduce ? false : { x: -10, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={reduce ? { duration: 0 } : { type: "spring", stiffness: 240, damping: 22 }}
          className="col-span-12 md:col-span-4"
        >
          <SectionCard
            title="Device"
            right={
              <button
                onClick={() => copy(serialText)}
                className="inline-flex items-center gap-1.5 text-[10px] text-white/70 hover:text-white transition"
                aria-label="Copy serial"
              >
                <ClipboardCopy className="h-3.5 w-3.5" />
                Copy
              </button>
            }
          >
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 rounded-xl bg-white/5 border border-white/10">
                <QrCode className="h-5 w-5 text-white/80" />
              </div>
              <p className="text-white text-sm font-medium truncate break-words">{serialText}</p>
            </div>

            {/* QR */}
            <div className="relative">
              <div className="relative mx-auto aspect-square w-[42vw] max-w-[160px] sm:max-w-[180px] md:w-[180px] rounded-xl border border-white/10 overflow-hidden bg-white/5">
                <Image
                  src="/qr.png"
                  alt={`QR code untuk ${serialText}`}
                  fill
                  sizes="(max-width: 640px) 42vw, (max-width: 768px) 180px, 180px"
                  className="object-contain p-2"
                  priority
                />
              </div>
            </div>

            {/* Trigger overlay (selalu muncul jika ada device) */}
            {devices.length > 0 && (
              <div className="mt-3">
                <button
                  type="button"
                  onClick={() => setPickerOpen(true)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      setPickerOpen(true);
                    }
                  }}
                  className={[
                    "w-full text-left rounded-xl bg-white/5 text-white border border-white/10",
                    "px-1 py-1 text-sm outline-none hover:border-white/20",
                    "focus:ring-2 focus:ring-sky-400/40 transition",
                  ].join(" ")}
                  aria-haspopup="dialog"
                  aria-expanded={pickerOpen}
                >
                  <span className="inline-flex w-full items-center justify-center gap-1.5 truncate text-center">
                    <Search className="h-4 w-4 -mt-px opacity-80" aria-hidden="true" />
                    <span>Search device here…</span>
                  </span>
                </button>
              </div>
            )}
          </SectionCard>
        </motion.aside>

        {/* Right */}
        <section className="col-span-12 md:col-span-8 space-y-3">
          <SectionCard title="Overview">
            <div className="divide-y divide-white/5">
              <Row
                icon={<QrCode className="h-4 w-4 text-white/80" />}
                label="Serial Number"
                value={safe(currentDevice?.serial_number ?? currentDevice?.device_id)}
              />
              <Row
                icon={<MapPin className="h-4 w-4" />}
                label="Location"
                value={
                  <>
                    {safe(currentDevice?.location ?? currentDevice?.address_name, "-")}
                    {currentDevice?.detail_location ? (
                      <span className="text-white/60"> | {currentDevice.detail_location}</span>
                    ) : null}
                  </>
                }
              />
              <Row
                icon={<Zap className="h-4 w-4" />}
                label="Wattage / Phase"
                value={safe(currentDevice?.wattage ?? currentDevice?.watt_phase)}
              />
              <Row icon={<Tags className="h-4 w-4" />} label="Segment" value={safe(currentDevice?.segment)} />
              <Row
                icon={<Cpu className="h-4 w-4" />}
                label="Serial / Device ID"
                value={String(safe(currentDevice?.serial_number ?? currentDevice?.device_id))}
                mono
              />
            </div>
          </SectionCard>

          <SectionCard
            title="Power State"
            right={<span className="text-white/60 text-[11px]">Last update • realtime</span>}
          >
            <div className="flex items-center gap-3">
              <StatusBadge active={currentDevice?.active} />
              <p className="text-white/60 text-xs">Status perangkat saat ini</p>
            </div>
          </SectionCard>
        </section>
      </div>

      {/* ======================= OVERLAY ======================= */}
      {pickerOpen &&
        typeof document !== "undefined" &&
        createPortal(
          <div
            role="dialog"
            aria-modal="true"
            className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
            onClick={() => setPickerOpen(false)}
          >
            {/* backdrop */}
            <div className="absolute inset-0 bg-black/80" />

            {/* panel */}
            <div
              className="relative w-full max-w-2xl rounded-2xl shadow-2xl ring-1 ring-white/10 p-4 overflow-hidden"
              style={{ background: CARD_BG }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="sticky top-0 sm:py-5 border-white/10 backdrop-blur-sm flex items-center gap-2">
                <input
                  autoFocus
                  placeholder="Cari device / lokasi…"
                  className="w-full bg-[#0C1F3C]/80 border border-white/15 text-white px-3 py-2 rounded-lg
                             focus:outline-none focus:ring-2 focus:ring-blue-400/60 text-[12px]"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                />
                <button
                  className="px-3 py-2 rounded-lg bg-white/5 border border-white/15 text-white hover:bg-white/10 text-[12px]"
                  onClick={() => setPickerOpen(false)}
                  aria-label="Close"
                >
                  Close
                </button>
              </div>

              {/* ✅ Keterangan jumlah hasil vs total */}
              <p className="text-xs text-white/70 mb-3">
                Hasil: <span className="text-white">{filtered.length}</span> / {list.length} device
              </p>

              <ul className="max-h-[50vh] overflow-auto divide-y divide-white/10 overlay-scroll">
                {filtered.map(({ d, idx }, i) => {
                  const isActive = i === activeIdx;
                  return (
                    <li key={idOf(d) || idx}>
                      <button
                        className={`w-full text-left px-4 sm:px-5 py-3 transition ${isActive ? "bg-white/10" : "hover:bg-white/5"}`}
                        onMouseEnter={() => setActiveIdx(i)}
                        onClick={() => {
                          setSelectedDeviceIndex(idx);
                          setPickerOpen(false);
                          setQuery("");
                        }}
                        aria-selected={isActive}
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
                          <div className="min-w-0">
                            <p className="font-medium truncate text-[11px]">{nameOf(d)}</p>
                            <p className="text-white/70 text-[11px] truncate">{detailOf(d)}</p>                       
                          </div>
                          <div className="flex items-center flex-wrap gap-2 sm:pl-4">
                            <span className="text-white/70 text-[11px] truncate">{idOf(d)}</span>
                          </div>
                        </div>
                      </button>
                    </li>
                  );
                })}
                {filtered.length === 0 && <li className="p-3 opacity-70">Tidak ada hasil.</li>}
              </ul>
            </div>
          </div>,
          document.body
        )}
      {/* ==================================================================== */}
    </div>
  );
}

/* ------------------------------- UI atoms ------------------------------- */
const StatusBadge = ({ active }: { active: boolean | undefined }) => {
  const state = active === true ? "active" : active === false ? "inactive" : "unknown";
  const color =
    state === "active"
      ? "bg-emerald-500/15 text-emerald-300"
      : "bg-rose-500/15 text-rose-300";
  const neutral = "bg-zinc-500/15 text-zinc-300";
  const Icon = state === "active" ? CheckCircle2 : state === "inactive" ? XCircle : HelpCircle;
  const label = state === "active" ? "Active" : state === "inactive" ? "Inactive" : "Unknown";
  return (
    <span
      className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full ${
        state === "unknown" ? neutral : color
      }`}
    >
      <Icon className="h-3.5 w-3.5" />
      {label}
    </span>
  );
};

const SectionCard = ({
  title,
  children,
  right,
  className = "",
}: {
  title: string;
  children: React.ReactNode;
  right?: React.ReactNode;
  className?: string;
}) => (
  <div
    className={[
      "rounded-2xl border border-white/10 backdrop-blur-md",
      "p-3 sm:p-3",
      "bg-gradient-to-b from-white/3 to-white/[0.02]",
      className,
    ].join(" ")}
    style={{ background: INFO_CARD_BG }}
  >
    <div className="mb-1.5 flex items-center justify-between gap-3">
      <p className="text-[10px] tracking-widest text-white/60 uppercase">{title}</p>
      {right}
    </div>
    {children}
  </div>
);

const Row = ({
  icon,
  label,
  value,
  mono,
}: {
  icon?: React.ReactNode;
  label: string;
  value: React.ReactNode;
  mono?: boolean;
}) => (
  <div className="flex items-start gap-3 py-1.5 first:pt-0 last:pb-0">
    {icon && <span className="mt-0.5 h-4 w-4 text-white/70">{icon}</span>}
    <div className="min-w-0 flex-1">
      <p className="text-[10px] uppercase tracking-widest text-white/50">{label}</p>
      <div
        className={[
          "text-[13px] sm:text-sm text-white",
          mono ? "font-mono break-all" : "font-medium break-words",
        ].join(" ")}
      >
        {value}
      </div>
    </div>
  </div>
);
