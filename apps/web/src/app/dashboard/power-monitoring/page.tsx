// app/(dashboard)/dashboard/power-monitoring/page.tsx
"use client";

import React, {
  useEffect,
  useMemo,
  useRef,
  useState,
  type ComponentType,
} from "react";
import { createPortal } from "react-dom";
import { CARD_BG, POWER_SECTIONS, slugify, type PowerKey } from "./constants";

// Import langsung ke file Section (tanpa barrel/index.ts)
import VoltageSection from "./voltage/Section";
import CurrentSection from "./current/Section";
import FrequencySection from "./frequency/Section";
import PowerFactorSection from "./power-factor/Section";
import PowerSection from "./power/Section";
import EnergyUsageSection from "./energy-usage/Section";

/* ================= Types & Helpers ================= */
export type Location = {
  device_id: string;
  address_name: string;
  detail_location: string;
  watt_phase: string;
  segment: string;
};

function safeLower(v?: string) {
  return (v ?? "").toLowerCase();
}
function getLocationLabel(d?: Partial<Location>) {
  if (!d) return "-";
  const name = d.address_name ?? "";
  const detail = d.detail_location ?? "";
  const left = String(name).trim();
  const right = String(detail).trim();
  if (!left && !right) return "-";
  if (left && !right) return left;
  if (!left && right) return right;
  return `${left} | ${right}`;
}

/* =============== Mock (dipakai kalau locations kosong) =============== */
const LOCATIONS_MOCK: Location[] = [
  {
    device_id: "EMS-101-ALFA-01",
    address_name: "Rumah Utama",
    detail_location: "Jl. Merdeka No. 10, Salatiga",
    watt_phase: "2200VA / 1-Phase",
    segment: "Residential",
  },
  {
    device_id: "EMS-202-BETA-01",
    address_name: "Kantor Cabang",
    detail_location: "Jl. Diponegoro No. 2, Semarang",
    watt_phase: "6600VA / 3-Phase",
    segment: "Commercial",
  },
  {
    device_id: "EMS-303-GAMMA-01",
    address_name: "Gudang Barat",
    detail_location: "Kawasan Industri, Blok C7",
    watt_phase: "3500VA / 1-Phase",
    segment: "Industrial",
  },
];

/* ================= Sections Map ================= */
type SectionProps = { device?: Location };
const SectionMap: Record<PowerKey, ComponentType<SectionProps>> = {
  Voltage: VoltageSection,
  Current: CurrentSection,
  Frequency: FrequencySection,
  "Power Factor": PowerFactorSection,
  Power: PowerSection,
  "Energy Usage": EnergyUsageSection,
};

const TOP_OFFSET = 0;

export default function PowerMonitoringPage() {
  // NOTE: isi dari backend nanti, sekarang kosong -> fallback ke mock
  const locations: Location[] = [];

  const devFallback = locations.length === 0;
  const LOCS = devFallback ? LOCATIONS_MOCK : locations;

  const [selectedLocation, setSelectedLocation] = useState(0);
  const activeLoc = LOCS[selectedLocation];

  // pulihkan pilihan device terakhir
  useEffect(() => {
    try {
      const saved = localStorage.getItem("pm-device-id");
      if (!saved) return;
      const i = LOCS.findIndex((d) => d.device_id === saved);
      if (i >= 0) setSelectedLocation(i);
    } catch {}
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [LOCS.length]);

  // clamp index kalau sumber data berubah
  useEffect(() => {
    if (selectedLocation >= LOCS.length) setSelectedLocation(0);
  }, [LOCS.length, selectedLocation]);

  // simpan pilihan device
  useEffect(() => {
    try {
      if (activeLoc?.device_id) localStorage.setItem("pm-device-id", activeLoc.device_id);
    } catch {}
  }, [activeLoc?.device_id]);

  // ================= Overlay Picker (ganti dropdown) =================
  const [pickerOpen, setPickerOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [hi, setHi] = useState(0);
  const pickBtnRef = useRef<HTMLButtonElement | null>(null);

  // Simpan posisi scroll & target scroller (window atau #pm-scroll)
  const savedScrollY = useRef(0);
  const savedScrollX = useRef(0);
  const savedScroller = useRef<HTMLElement | null>(null);
  function getScroller(): HTMLElement | null {
    return document.getElementById("pm-scroll");
  }

  const filtered = useMemo(() => {
    if (!query.trim()) return LOCS;
    const q = query.toLowerCase();
    return LOCS.filter(
      (d) =>
        safeLower(d.device_id).includes(q) ||
        safeLower(d.address_name).includes(q) ||
        safeLower(d.detail_location).includes(q)
    );
  }, [query, LOCS]);

  const closePicker = React.useCallback(() => {
    setPickerOpen(false);
    setTimeout(() => pickBtnRef.current?.focus({ preventScroll: true }), 0);
  }, []);

  // ESC to close
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && closePicker();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [closePicker]);

  // Lock scroll TANPA reset posisi, mendukung container #pm-scroll maupun body
  useEffect(() => {
    if (!pickerOpen) return;

    const scroller = getScroller();
    savedScroller.current = scroller;

    if (scroller) {
      // Mode container (#pm-scroll)
      savedScrollY.current = scroller.scrollTop;
      savedScrollX.current = scroller.scrollLeft;
      scroller.style.overflow = "hidden";
    } else {
      // Mode window/body
      savedScrollY.current = window.scrollY;
      savedScrollX.current = window.scrollX;

      // Teknik "fixed body" agar tidak loncat ke atas
      document.body.style.position = "fixed";
      document.body.style.top = `-${savedScrollY.current}px`;
      document.body.style.left = "0";
      document.body.style.right = "0";
      document.body.style.width = "100%";
    }

    // On close → kembalikan scroll persis
    return () => {
      if (savedScroller.current) {
        const s = savedScroller.current;
        s.style.overflow = "";
        s.scrollTo({
          top: savedScrollY.current,
          left: savedScrollX.current,
          behavior: "auto",
        });
      } else {
        const y = savedScrollY.current;
        document.body.style.position = "";
        document.body.style.top = "";
        document.body.style.left = "";
        document.body.style.right = "";
        document.body.style.width = "";
        window.scrollTo({
          top: y,
          left: savedScrollX.current,
          behavior: "auto",
        });
      }
    };
  }, [pickerOpen]);

  // Focus trap
  useEffect(() => {
    if (!pickerOpen) return;
    const dialog = document.getElementById("pm-device-picker");
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

  // reset highlight saat filter berubah
  useEffect(() => setHi(0), [query, filtered.length]);

  // =================== Scroll spy (opsional: dengan container) ===================
  const refs = useMemo(
    () =>
      Object.fromEntries(
        POWER_SECTIONS.map(({ key }) => [
          key as PowerKey,
          { el: null as HTMLElement | null },
        ])
      ) as Record<PowerKey, { el: HTMLElement | null }>,
    []
  );

  // scroll spy berbasis container
  useEffect(() => {
    const root = document.getElementById("pm-scroll") as HTMLElement | null;
    if (!root) return;

    let ticking = false;

    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        const r = root.getBoundingClientRect();
        const mid = r.top + r.height / 2;

        let bestKey: PowerKey | null = null;
        let bestDist = Infinity;

        for (const { key } of POWER_SECTIONS) {
          const el = refs[key as PowerKey].el;
          if (!el) continue;
          const rect = el.getBoundingClientRect();
          const center = rect.top + rect.height / 2;
          const d = Math.abs(center - mid);
          if (d < bestDist) {
            bestDist = d;
            bestKey = key as PowerKey;
          }
        }

        if (bestKey) {
          const newHash = `#${slugify(bestKey)}`;
          if (window.location.hash !== newHash) {
            history.replaceState(null, "", newHash);
          }
          window.dispatchEvent(
            new CustomEvent("pm-section-change", { detail: bestKey })
          );
          try {
            localStorage.setItem("lastPowerSub", bestKey);
          } catch {}
        }

        ticking = false;
      });
    };

    onScroll();
    root.addEventListener("scroll", onScroll, { passive: true });
    return () => root.removeEventListener("scroll", onScroll);
  }, [refs]);

  // dukung URL lama /power-monitoring/xxx -> hash
  useEffect(() => {
    const path = window.location.pathname;
    const m = path.match(/\/dashboard\/power-monitoring\/([^/]+)/);
    if (m) history.replaceState(null, "", `/dashboard/power-monitoring#${m[1]}`);
  }, []);

  // scroll padding top
  useEffect(() => {
    const root = document.getElementById("pm-scroll");
    if (root) (root as HTMLElement).style.scrollPaddingTop = `${TOP_OFFSET}px`;
  }, []);

  // helper relative top
  const getRelativeTop = (root: HTMLElement, target: HTMLElement) => {
    const rRect = root.getBoundingClientRect();
    const tRect = target.getBoundingClientRect();
    return tRect.top - rRect.top + root.scrollTop;
  };

  // Scroll ke hash (block: center)
  useEffect(() => {
    const scrollToHash = (hash?: string) => {
      const h = (hash ?? window.location.hash).replace("#", "");
      if (!h) return;
      const item = POWER_SECTIONS.find((s) => s.id === h);
      if (!item) return;

      const target = refs[item.key as PowerKey].el;
      if (!target) return;

      const root = document.getElementById("pm-scroll") as HTMLElement | null;

      if (root) {
        const relTop = getRelativeTop(root, target);
        const visibleHeight = root.clientHeight;
        const centerTop = relTop - (visibleHeight - target.offsetHeight) / 2;

        root.scrollTo({
          top: Math.max(0, centerTop),
          behavior: "smooth",
        });
      } else {
        target.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    };

    scrollToHash();
    const onHash = () => scrollToHash();
    window.addEventListener("hashchange", onHash);
    return () => window.removeEventListener("hashchange", onHash);
  }, [refs]);

  // IntersectionObserver (aktif kalau ada container pm-scroll)
  useEffect(() => {
    const root = document.getElementById("pm-scroll") as HTMLElement | null;
    if (!root) return;

    const visibleHeight = root.clientHeight;
    const topRM = -(visibleHeight / 2);
    const bottomRM = -(visibleHeight / 2);

    const io = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (!visible) return;

        const key = (visible.target as HTMLElement).dataset
          .key as PowerKey | undefined;
        if (!key) return;

        const newHash = `#${slugify(key)}`;
        if (window.location.hash !== newHash) {
          history.replaceState(null, "", newHash);
        }

        window.dispatchEvent(new CustomEvent("pm-section-change", { detail: key }));
        try {
          localStorage.setItem("lastPowerSub", key);
        } catch {}
      },
      {
        root,
        rootMargin: `${topRM}px 0px ${bottomRM}px 0px`,
        threshold: [0.25, 0.5, 0.75],
      }
    );

    POWER_SECTIONS.forEach(({ key }) => {
      const el = refs[key as PowerKey].el;
      if (el) io.observe(el);
    });

    return () => io.disconnect();
  }, [refs]);

  /* ====== HUD show/hide saat header terlihat / tidak terlihat ====== */
  const headRef = useRef<HTMLElement | null>(null);
  const [showHUD, setShowHUD] = useState(false);

  useEffect(() => {
    const root = document.getElementById("pm-scroll") as HTMLElement | null;
    const el = headRef.current;
    if (!el) return;

    // Inisialisasi status agar tidak flicker
    const initCheck = () => {
      const rect = el.getBoundingClientRect();
      const vh = root ? root.clientHeight : window.innerHeight;
      const visible = rect.bottom > 0 && rect.top < vh;
      setShowHUD(!visible);
    };
    initCheck();

    const io = new IntersectionObserver(
      ([entry]) => {
        setShowHUD(!entry.isIntersecting || entry.intersectionRatio < 0.05);
      },
      { root, threshold: [0, 0.05, 0.5, 1] }
    );

    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <main
      className="flex flex-col gap-8 rounded-2xl p-5 mr-8 mx-auto mb-8 relative"
      style={{
        background:
          "linear-gradient(90deg, rgba(6,11,40,0.74) 0%, rgba(10,14,35,0.71) 100%)",
      }}
    >
      <header ref={headRef}>
        <h1 className="text-3xl text-center font-semibold text-white">
          Power Monitoring
        </h1>

        {/* Device info (opsional di header) */}
        <div className="mt-6 flex flex-col sm:flex-row justify-between text-[9px] text-white">
          <div className="min-w-0">
            <p className="uppercase tracking-wide opacity-70">Serial Number</p>
            <p className="font-lg break-all">{activeLoc?.device_id ?? "-"}</p>

            <p className="mt-2 uppercase tracking-wide opacity-70">Location</p>
            <button
              ref={pickBtnRef}
              type="button"
              onClick={() => setPickerOpen(true)}
              className="bg-[#0C1F3C] border border-gray-600/80 text-white/90
                         px-2 py-1 rounded w-full sm:w-auto text-left
                         focus:outline-none focus:ring-2 focus:ring-sky-400/50"
              aria-haspopup="dialog"
              aria-expanded={pickerOpen}
            >
              <span className="block truncate">{getLocationLabel(activeLoc)}</span>
            </button>
          </div>

          <div className="text-left sm:text-right mt-4 sm:mt-0">
            <p className="uppercase tracking-wide opacity-70">Wattage / Phase</p>
            <p className="font-lg">{activeLoc?.watt_phase ?? "-"}</p>

            <p className="mt-2 uppercase tracking-wide opacity-70">Segment</p>
            <p className="font-lg">{activeLoc?.segment ?? "-"}</p>
          </div>
        </div>
      </header>

      <div className="space-y-[80px]">
        {POWER_SECTIONS.map(({ key, id }) => {
          const pKey = key as PowerKey;
          const Comp = SectionMap[pKey];
          return (
            <section
              key={`${id}-${activeLoc?.device_id ?? "none"}`} // remount saat ganti device
              id={id}
              data-key={pKey}
              ref={(el) => {
                refs[pKey].el = el;
              }}
              className="scroll-mt-21"
            >
              <Comp device={activeLoc} />
            </section>
          );
        })}
      </div>

      {/* === FLOATING DEVICE INFO (HUD) — compact top-center, muncul hanya saat header hilang === */}
      {showHUD && (
        <div className="fixed left-1/2 -translate-x-1/4 top-6 z-50 pointer-events-none">
          <div
            role="status"
            aria-live="polite"
            className="
              pointer-events-auto
              rounded-lg ring-1 ring-white/10 shadow-md
              px-2.5 py-1.5 text-[10px] sm:text-[11px] text-white
              max-w-[92vw] sm:max-w-[520px]
              supports-[backdrop-filter]:backdrop-blur-md
            "
            style={{ background: CARD_BG }}
          >
            <div className="flex items-center gap-2 min-w-0">
              <span className="hidden sm:inline-flex items-center justify-center h-5 px-1.5 rounded bg-white/10 border border-white/10 text-[9px]">
                SN
              </span>
              <span
                className="font-mono font-medium truncate break-all"
                title={activeLoc?.device_id ?? "-"}
              >
                {activeLoc?.device_id ?? "-"}
              </span>
              <span className="opacity-60">•</span>
              <span
                className="
                  min-w-0
                  whitespace-normal break-words
                  sm:whitespace-nowrap sm:overflow-hidden sm:text-ellipsis
                  font-medium
                "
                title={getLocationLabel(activeLoc)}
              >
                {getLocationLabel(activeLoc)}
              </span>
              <button
                type="button"
                onClick={() => setPickerOpen(true)}
                className="ml-auto shrink-0 rounded px-2 py-0.5 text-[9px] bg-white/8 hover:bg-white/12 border border-white/12"
                aria-label="Change location"
                title="Change location"
              >
                Ganti
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========= Overlay Location Picker via Portal ========= */}
      {pickerOpen &&
        typeof document !== "undefined" &&
        createPortal(
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="pm-device-picker-title"
            className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
            onClick={closePicker}
          >
            {/* backdrop */}
            <div className="absolute inset-0 bg-black/80" />

            {/* panel */}
            <div
              id="pm-device-picker"
              className="relative w-full max-w-2xl rounded-2xl shadow-2xl ring-1 ring-white/10 p-4 overflow-hidden"
              style={{ background: CARD_BG }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="sticky top-0 py-4 border-b border-white/10 backdrop-blur-sm flex items-center gap-2">
                <h2 id="pm-device-picker-title" className="sr-only">
                  Pilih Lokasi
                </h2>
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
                      const item = filtered[hi];
                      if (!item) return;
                      const idx = LOCS.findIndex((l) => l.device_id === item.device_id);
                      if (idx >= 0) setSelectedLocation(idx);
                      setQuery("");
                      closePicker();
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

              <ul
                role="listbox"
                className="max-h-[55vh] overflow-auto divide-y divide-white/10 overlay-scroll"
              >
                {filtered.map((d, idx) => {
                  const globalIdx = LOCS.findIndex((l) => l.device_id === d.device_id);
                  const isActive = selectedLocation === globalIdx;
                  const isHi = filtered[hi]?.device_id === d.device_id;
                  return (
                    <li key={d.device_id}>
                      <button
                        role="option"
                        aria-selected={isActive}
                        className={`w-full text-left px-4 sm:px-5 py-3 transition ${
                          isHi
                            ? "bg-white/15"
                            : isActive
                            ? "bg-white/10"
                            : "hover:bg-white/5"
                        }`}
                        onMouseEnter={() => setHi(idx)}
                        onClick={() => {
                          if (globalIdx >= 0) setSelectedLocation(globalIdx);
                          setQuery("");
                          closePicker();
                        }}
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
                          <div className="min-w-0">
                            <p className="font-medium truncate text-[11px]">
                              {d.address_name}
                            </p>
                            <p className="text-white/70 text-[11px] truncate">
                              {d.detail_location}
                            </p>
                          </div>
                          <div className="flex items-center flex-wrap gap-2 sm:pl-4">
                            <span className="text-[10px] text-white/70">
                              {d.device_id}
                            </span>
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
                  <li className="p-5 text-center text-white/70 text-[11px]">
                    Tidak ada hasil.
                  </li>
                )}
              </ul>
            </div>
          </div>,
          document.body
        )}
      {/* ================================================================ */}
    </main>
  );
}
