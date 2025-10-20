"use client";

import React, { useEffect, useRef, useState } from "react";
import { GoogleMap, Marker, useLoadScript } from "@react-google-maps/api";
import { FaTrash } from "react-icons/fa";
import { createPortal } from "react-dom";
import { API_REQ, DEFAULT_BG, INFO_CARD_BG } from "./constants";

/* -------------------------- Button Variants -------------------------- */
const BTN = {
  primary:
    "px-4 py-1.5 rounded-full bg-sky-500 hover:bg-sky-600 text-white border border-white/10 shadow focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-400/60 transition",
  secondary:
    "px-4 py-1.5 rounded-full bg-white/5 hover:bg-white/10 text-white border border-white/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-400/40 transition",
  danger:
    "px-4 py-1.5 rounded-full bg-red-600 hover:bg-red-700 text-white border border-white/10 shadow focus:outline-none focus-visible:ring-2 focus-visible:ring-red-400/60 transition",
};

/* --------------------------- Modal (Portal) -------------------------- */
function ModalPortal({
  open,
  onClose,
  children,
}: {
  open: boolean;
  onClose?: () => void;
  children: React.ReactNode;
}) {
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  if (!open || typeof window === "undefined") return null;

  return createPortal(
    <div role="dialog" aria-modal="true" className="fixed inset-0 z-[100000]">
      <div className="absolute inset-0 bg-black/80" onClick={onClose} aria-hidden="true" />
      <div
        className="relative z-[100001] w-full max-w-md mx-auto mt-[10vh] rounded-2xl border border-white/10 backdrop-blur-md p-6 text-white shadow-[0_20px_60px_-20px_rgba(0,0,0,0.6)]"
        style={{ background: INFO_CARD_BG }}
      >
        {onClose && (
          <button
            aria-label="Close"
            onClick={onClose}
            className="absolute right-3 top-3 rounded-full w-7 h-7 grid place-items-center hover:bg-white/10 transition"
            type="button"
          >
            ×
          </button>
        )}
        {children}
      </div>
    </div>,
    document.body
  );
}

/* ---------------------------- Toast (Portal) ---------------------------- */
function ToastPortal({ message, onClose }: { message: string; onClose: () => void }) {
  useEffect(() => {
    const t = setTimeout(onClose, 3000);
    return () => clearTimeout(t);
  }, [onClose]);

  if (!message || typeof window === "undefined") return null;

  const base = "px-5 py-2 rounded-lg shadow-lg text-sm text-white pointer-events-auto border";
  const color = message.includes("❌")
    ? "bg-red-600/90 border-red-400/40"
    : message.includes("✅")
    ? "bg-green-600/90 border-green-400/40"
    : "bg-white/10 border-white/10";

  return createPortal(
    <div className="fixed top-6 left-1/2 -translate-x-1/2 z-[100002]" role="status" aria-live="polite">
      <div className={`${base} ${color} backdrop-blur`}>{message}</div>
    </div>,
    document.body
  );
}

/* ======================= Types ======================= */
type DataItem = {
  code: string;
  postal: number;
  province: string;
  city: string;
  district: string;
  village: string;
  latitude: number;
  longitude: number;
};

type Request = {
  id: number;
  address: string;
  segmen: string;
  detail_address: string;
  lat: number;
  lng: number;
  status: string;
  time: number;
};

type Option = {
  label: string;
  value: string;
  lat?: number;
  lng?: number;
  postal?: number;
  code?: string;
};

/* ======================= Page ======================= */
export default function AddDevicePage() {
  const { isLoaded } = useLoadScript({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "",
  });

  const [showOverlayDelete, setShowOverlayDelete] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Request | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const [allData, setAllData] = useState<DataItem[]>([]);
  const [form, setForm] = useState({
    street_name: "",
    province_id: "",
    city_id: "",
    district_id: "",
    subdistrict_id: "",
    postal_code: "",
    segmen: "",
    detail_address: "",
    lat: -6.1751,
    lng: 106.865,
  });
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [markerEdited, setMarkerEdited] = useState(false);
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState<Request[]>([]);

  const [showOverlayConfirm, setShowOverlayConfirm] = useState(false);
  const [showOverlayWarning, setShowOverlayWarning] = useState(false);

  const [zoom, setZoom] = useState(9);

  const [loadingHistory, setLoadingHistory] = useState(false);

  function getProvinceBoundingCenter(allData: DataItem[], provinceName: string) {
    const items = allData.filter((d) => d.province === provinceName);
    if (items.length === 0) return null;

    const minLat = Math.min(...items.map((d) => d.latitude));
    const maxLat = Math.max(...items.map((d) => d.latitude));
    const minLng = Math.min(...items.map((d) => d.longitude));
    const maxLng = Math.max(...items.map((d) => d.longitude));

    return { lat: (minLat + maxLat) / 2, lng: (minLng + maxLng) / 2 };
  }

  const fmtTime = (ts: number) => {
    const ms = ts < 1e12 ? ts * 1000 : ts;
    const d = new Date(ms);
    return d.toLocaleString();
  };

  const shortText = (s: string, n = 80) => (s && s.length > n ? s.slice(0, n - 1) + "…" : s);

  const statusBadgeClass = (status: string) => {
    const s = (status || "").toUpperCase();
    if (s === "APPROVED") return "bg-green-600/30 text-green-300 border-green-600/50";
    if (s === "REJECTED") return "bg-red-600/30 text-red-300 border-red-600/50";
    return "bg-yellow-600/30 text-yellow-300 border-yellow-600/50";
  };

  useEffect(() => {
    fetch("/data/data.json")
      .then((res) => res.json())
      .then((json) => setAllData(json))
      .catch(console.error);
  }, []);

  const fetchHistory = async () => {
    try {
      setLoadingHistory(true);
      const res = await fetch(API_REQ, { method: "GET" });
      if (!res.ok) throw new Error(`failed (${res.status})`);
      const arr = await res.json();
      const list: Request[] = Array.isArray(arr) ? arr : [];
      list.sort((a, b) => b.time - a.time);
      setHistory(list);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingHistory(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const provinces = Array.from(new Map(allData.map((d) => [d.province, d])).values()).map((d) => ({
    name: d.province,
  }));

  const cities = form.province_id
    ? Array.from(
        new Map(allData.filter((d) => d.province === form.province_id).map((d) => [d.city, d])).values()
      ).map((d) => ({
        name: d.city,
        lat: d.latitude,
        lng: d.longitude,
        postal: d.postal,
      }))
    : [];

  const districts = form.city_id
    ? Array.from(
        new Map(allData.filter((d) => d.city === form.city_id).map((d) => [d.district, d])).values()
      ).map((d) => ({
        name: d.district,
        lat: d.latitude,
        lng: d.longitude,
        postal: d.postal,
      }))
    : [];

  const subdistricts = form.district_id
    ? allData
        .filter((d) => d.district === form.district_id)
        .map((v) => ({
          code: v.code,
          name: v.village,
          lat: v.latitude,
          lng: v.longitude,
          postal: v.postal,
        }))
    : [];

  const provinceOptions: Option[] = provinces.map((p) => ({ label: p.name, value: p.name }));

  const cityOptions: Option[] = form.province_id
    ? cities.map((k) => ({ label: k.name, value: k.name, lat: k.lat, lng: k.lng, postal: k.postal }))
    : [];

  const districtOptions: Option[] = form.city_id
    ? districts.map((k) => ({ label: k.name, value: k.name, lat: k.lat, lng: k.lng, postal: k.postal }))
    : [];

  const subdistrictOptions: Option[] = form.district_id
    ? subdistricts.map((k) => ({
        label: k.name,
        value: k.name,
        lat: k.lat,
        lng: k.lng,
        postal: k.postal,
        code: k.code,
      }))
    : [];

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const selectProvince = (opt: Option | null) => {
    const value = opt?.value ?? "";
    setForm((prev) => ({
      ...prev,
      province_id: value,
      city_id: "",
      district_id: "",
      subdistrict_id: "",
      postal_code: "",
    }));
    setErrors((prev) => ({ ...prev, province_id: "" }));

    if (value) {
      const center = getProvinceBoundingCenter(allData, value);
      if (center) {
        setForm((prev) => ({ ...prev, lat: center.lat, lng: center.lng }));
        setZoom(7);
        setMarkerEdited(false);
      }
    }
  };

  const selectCity = (opt: Option | null) => {
    const value = opt?.value ?? "";
    setForm((prev) => ({
      ...prev,
      city_id: value,
      district_id: "",
      subdistrict_id: "",
      postal_code: opt?.postal ? String(opt.postal) : "",
      lat: opt?.lat ?? prev.lat,
      lng: opt?.lng ?? prev.lng,
    }));
    setErrors((prev) => ({ ...prev, city_id: "" }));
    if (value) {
      setZoom(12);
      setMarkerEdited(false);
    }
  };

  const selectDistrict = (opt: Option | null) => {
    const value = opt?.value ?? "";
    setForm((prev) => ({
      ...prev,
      district_id: value,
      subdistrict_id: "",
      postal_code: opt?.postal ? String(opt.postal) : "",
      lat: opt?.lat ?? prev.lat,
      lng: opt?.lng ?? prev.lng,
    }));
    setErrors((prev) => ({ ...prev, district_id: "" }));
    if (value) {
      setZoom(14);
      setMarkerEdited(false);
    }
  };

  const selectSubdistrict = (opt: Option | null) => {
    const value = opt?.value ?? "";
    setForm((prev) => ({
      ...prev,
      subdistrict_id: value,
      postal_code: opt?.postal ? String(opt.postal) : prev.postal_code,
      lat: opt?.lat ?? prev.lat,
      lng: opt?.lng ?? prev.lng,
    }));
    setErrors((prev) => ({ ...prev, subdistrict_id: "" }));
    if (value) setZoom(15), setMarkerEdited(false);
  };

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};
    if (!form.street_name) newErrors.street_name = "street name is required";
    if (!form.province_id) newErrors.province_id = "province is required";
    if (!form.city_id) newErrors.city_id = "city/regency is required";
    if (!form.district_id) newErrors.district_id = "district is required";
    if (!form.subdistrict_id) newErrors.subdistrict_id = "sub-district is required";
    if (!form.postal_code) newErrors.postal_code = "postal code is required";
    if (!form.segmen) newErrors.segmen = "segment is required";
    if (!form.detail_address) newErrors.detail_address = "detail address is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (!validateForm()) return;
    if (!markerEdited) {
      setShowOverlayWarning(true);
      return;
    }
    setShowOverlayConfirm(true);
  };

  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const doSubmit = async () => {
    setLoading(true);
    try {
      const username =
        (typeof window !== "undefined" && localStorage.getItem("username")) || "unknown";

      const address = `${form.street_name}, ${form.subdistrict_id}, ${form.district_id}, ${form.city_id}, ${form.province_id}, ${form.postal_code}`;
      const payload = {
        username,
        address,
        segmen: form.segmen,
        detail_address: form.detail_address,
        lat: form.lat,
        lng: form.lng,
      };

      const res = await fetch(API_REQ, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const msg = await res.text().catch(() => "");
        throw new Error(`Failed to submit request (${res.status}) ${msg}`);
      }
      const saved: Request = await res.json();
      setHistory((prev) => [...prev, saved]);

      setForm((prev) => ({
        street_name: "",
        province_id: "",
        city_id: "",
        district_id: "",
        subdistrict_id: "",
        postal_code: "",
        segmen: "",
        detail_address: "",
        lat: prev.lat,
        lng: prev.lng,
      }));
      setMarkerEdited(false);

      setToastMessage("✅ Request submitted successfully!");
    } catch (err) {
      console.error(err);
      setToastMessage("❌ Failed to submit request");
    } finally {
      setLoading(false);
      setShowOverlayConfirm(false);
    }
  };

  const doDelete = async (req: Request) => {
    setDeletingId(req.id);
    try {
      let res = await fetch(`${API_REQ}/${req.id}`, { method: "DELETE" });
      if (!res.ok) {
        res = await fetch(API_REQ, {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: req.id }),
        });
      }
      if (!res.ok) throw new Error("Failed");

      setHistory((prev) => prev.filter((r) => r.id !== req.id));
      setToastMessage("✅ Success to deleted");
    } catch (e) {
      console.error(e);
      setToastMessage("❌ Failed to delete");
    } finally {
      setDeletingId(null);
      setShowOverlayDelete(false);
      setDeleteTarget(null);
    }
  };

  if (!isLoaded)
    return (
      <div className="text-white text-xs p-4 rounded-2xl border border-white/10" style={{ background: INFO_CARD_BG }}>
        Loading Map...
      </div>
    );

  const inputClass =
    "w-full p-2 rounded-xl bg-white/5 border border-white/10 text-white text-xs placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-sky-400/40";
  const errorClass = "text-red-400 text-[8px] mt-1 text-center";
  const errorClass2 = "text-red-400 text-[10px] mt-1";

  return (
    <div
      className="
        relative isolate
        flex flex-col mx-auto sm:mr-8 rounded-2xl
        box-border min-h:[84dvh] md:h-[84dvh] md:max-h-[100dvh]
        overflow-x-hidden overflow-y-auto md:overflow-y-auto
        p-5 sm:p-6
        pb-[max(env(safe-area-inset-bottom),12px)]
        text-white
      "
      style={{ background: DEFAULT_BG }}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-0.5">
          <h2 className="text-white font-semibold leading-tight text-[clamp(16px,2vw,26px)]">
            Request New Device
          </h2>
          <p className="text-white/60 text-[11px] sm:text-xs">This is location for your device monitoring</p>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-4 mt-4 max-w-6xl w-full mx-auto">
        <section
          className="col-span-12 md:col-span-6 rounded-2xl border border-white/10 backdrop-blur-md p-4 space-y-3 shadow-[0_10px_40px_-10px_rgba(0,0,0,0.5)] z-20"
          style={{ background: INFO_CARD_BG }}
        >
          <div className="flex items-center justify-between">
            <h3 className="text-[10px] tracking-[0.2em] text-white/60 uppercase">Location & Details</h3>
            <span className="text-[10px] text-white/50">
              Fields with <span className="text-red-300">*</span> are required
            </span>
          </div>

          <div>
            <label className="text-white text-[10px]" htmlFor="street_name">
              Street <span className="text-red-300">*</span>
            </label>
            <input
              id="street_name"
              name="street_name"
              value={form.street_name}
              onChange={handleChange}
              className={inputClass}
              placeholder="Street name, house number"
              aria-invalid={Boolean(errors.street_name)}
              aria-describedby={errors.street_name ? "err-street" : undefined}
            />
            {errors.street_name && <p id="err-street" className={errorClass2}>{errors.street_name}</p>}
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            <div>
              <label className="text-[10px] text-white">Province <span className="text-red-300">*</span></label>
              <SearchableSelect
                value={form.province_id}
                onChange={selectProvince}
                options={provinceOptions}
                placeholder="Select Province"
                disabled={provinceOptions.length === 0}
              />
              {errors.province_id && <p className={errorClass}>{errors.province_id}</p>}
            </div>

            <div>
              <label className="text-[10px] text-white">City/Regency <span className="text-red-300">*</span></label>
              <SearchableSelect
                value={form.city_id}
                onChange={selectCity}
                options={cityOptions}
                placeholder="Select City"
                disabled={!form.province_id || cityOptions.length === 0}
              />
              {errors.city_id && <p className={errorClass}>{errors.city_id}</p>}
            </div>

            <div>
              <label className="text-[10px] text-white">District <span className="text-red-300">*</span></label>
              <SearchableSelect
                value={form.district_id}
                onChange={selectDistrict}
                options={districtOptions}
                placeholder="Select District"
                disabled={!form.city_id || districtOptions.length === 0}
              />
              {errors.district_id && <p className={errorClass}>{errors.district_id}</p>}
            </div>

            <div>
              <label className="text-[10px] text-white">Sub-district <span className="text-red-300">*</span></label>
              <SearchableSelect
                value={form.subdistrict_id}
                onChange={selectSubdistrict}
                options={subdistrictOptions}
                placeholder="Select Sub-district"
                disabled={!form.district_id || subdistrictOptions.length === 0}
              />
              {errors.subdistrict_id && <p className={errorClass}>{errors.subdistrict_id}</p>}
            </div>
          </div>

          <div>
            <label className="text-[10px] text-white">Postal Code <span className="text-red-300">*</span></label>
            <input
              value={form.postal_code}
              readOnly
              className={`${inputClass} readonly:opacity-70`}
              placeholder="automatically filled input"
              aria-readonly="true"
              aria-invalid={Boolean(errors.postal_code)}
            />
            {errors.postal_code && <p className={errorClass2}>{errors.postal_code}</p>}
          </div>

          <div>
            <label className="text-[10px] text-white">Segment <span className="text-red-300">*</span></label>
            <input
              name="segmen"
              value={form.segmen}
              onChange={handleChange}
              className={inputClass}
              placeholder="e.g., Residential / Home / School"
              aria-invalid={Boolean(errors.segmen)}
            />
            {errors.segmen && <p className={errorClass2}>{errors.segmen}</p>}
          </div>

          <div>
            <label className="text-[10px] text-white">Detail Address <span className="text-red-300">*</span></label>
            <input
              name="detail_address"
              value={form.detail_address}
              onChange={handleChange}
              className={inputClass}
              placeholder="e.g., 1st Floor / 2nd Floor"
              aria-invalid={Boolean(errors.detail_address)}
            />
            {errors.detail_address && <p className={errorClass2}>{errors.detail_address}</p>}
          </div>

          <button onClick={handleSubmit} disabled={loading} className={`${BTN.primary} w-full mt-1 disabled:opacity-60`} aria-busy={loading}>
            {loading ? "Submitting..." : "Submit Request"}
          </button>
        </section>

        <section
          className="col-span-12 md:col-span-6 rounded-2xl border border-white/10 backdrop-blur-md p-2 shadow-[0_10px_40px_-10px_rgba(0,0,0,0.5)]"
          style={{ background: INFO_CARD_BG }}
        >
          <div className="h-64 md:h-[350px] rounded-xl overflow-hidden ring-1 ring-white/10">
            <GoogleMap
              mapContainerClassName="w-full h-full"
              center={{ lat: form.lat, lng: form.lng }}
              zoom={zoom}
              onClick={(e) => {
                if (e.latLng) {
                  const lat = e.latLng.lat();
                  const lng = e.latLng.lng();
                  setMarkerEdited(true);
                  setForm((prev) => ({ ...prev, lat, lng }));
                }
              }}
            >
              {form.province_id && form.city_id && form.district_id && form.subdistrict_id && (
                <Marker
                  position={{ lat: form.lat, lng: form.lng }}
                  draggable
                  onDragEnd={(e) => {
                    if (e.latLng) {
                      const lat = e.latLng.lat();
                      const lng = e.latLng.lng();
                      setMarkerEdited(true);
                      setForm((prev) => ({ ...prev, lat, lng }));
                    }
                  }}
                />
              )}
            </GoogleMap>
          </div>

          <div className="mt-2 flex items-center justify-between text-[10px] text-white/70">
            <p className="font-medium">⚠️ Ensure marker is accurate before submitting.</p>
            <code className="px-2 py-1 rounded-lg border border-white/10 bg-white/5">
              {form.lat.toFixed(5)}, {form.lng.toFixed(5)}
            </code>
          </div>
        </section>
      </div>

      <section
        className="mt-4 rounded-2xl border border-white/10 backdrop-blur-md p-4 max-w-6xl w-full mx-auto shadow-[0_10px_40px_-10px_rgba(0,0,0,0.5)]"
        style={{ background: INFO_CARD_BG }}
      >
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-[10px] tracking-[0.2em] text-white/60 uppercase">Request History</h3>
          <button onClick={fetchHistory} disabled={loadingHistory} className={BTN.secondary} aria-busy={loadingHistory}>
            {loadingHistory ? "Refreshing..." : "Refresh"}
          </button>
        </div>

        {history.length === 0 ? (
          <p className="text-sm text-white/70">Belum ada request.</p>
        ) : (
          <div className="overflow-x-auto max-h-[42vh] overflow-y-auto pr-1 rounded-xl ring-1 ring-white/10">
            <table className="min-w-full text-xs text-left">
              <thead className="sticky top-0 z-10" style={{ background: INFO_CARD_BG }}>
                <tr className="text-white/70 border-b border-white/10">
                  <th className="py-2 pr-3 font-medium">#</th>
                  <th className="py-2 pr-3 font-medium">Address</th>
                  <th className="py-2 pr-3 font-medium">Segment</th>
                  <th className="py-2 pr-3 font-medium">Status</th>
                  <th className="py-2 pr-3 font-medium">Time</th>
                  <th className="py-2 pr-3 text-right font-medium">Action</th>
                </tr>
              </thead>
              <tbody>
                {history.map((r, idx) => (
                  <tr key={r.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                    <td className="py-2 pr-3 text-white/70">{idx + 1}</td>
                    <td className="py-2 pr-3 text-white">{shortText(r.address, 80)}</td>
                    <td className="py-2 pr-3 text-white/80">{r.segmen || "-"}</td>
                    <td className="py-2 pr-3">
                      <span
                        className={`px-2 py-0.5 rounded-md border text-[10px] ${statusBadgeClass(r.status)}`}
                        aria-label={`status ${r.status || "PENDING"}`}
                      >
                        {r.status || "PENDING"}
                      </span>
                    </td>
                    <td className="py-2 pr-3 text-white/70">{fmtTime(r.time)}</td>
                    <td className="py-2 pr-3 text-right">
                      <button
                        onClick={() => {
                          setDeleteTarget(r);
                          setShowOverlayDelete(true);
                        }}
                        disabled={deletingId === r.id}
                        className={`${BTN.danger} inline-flex items-center gap-1 !px-3 !py-1 text-xs disabled:opacity-50`}
                        aria-busy={deletingId === r.id}
                      >
                        <FaTrash className="text-[10px]" />
                        {deletingId === r.id ? "Deleting..." : "Delete"}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {showOverlayDelete && deleteTarget && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/80 z-50">
          <div
            className="rounded-2xl shadow-2xl p-6 max-w-md w-full text-white"
            style={{ background: "linear-gradient(180deg, rgba(0,60,140,1) 0%, rgba(0,30,70,1) 300%)" }}
          >
            <h3 className="text-white text-lg font-bold mb-4 text-center">Delete Request</h3>
            <p className="text-gray-300 text-sm mb-4">
              Are you sure you want to delete this request?
              <br />
              <span className="block mt-2 text-yellow-300 text-xs">#{deleteTarget.id} — {shortText(deleteTarget.address, 80)}</span>
            </p>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => {
                  setShowOverlayDelete(false);
                  setDeleteTarget(null);
                }}
                className="bg-gray-400 hover:bg-gray-500 text-white px-4 py-1 rounded-lg transition mt-12"
              >
                Cancel
              </button>
              <button onClick={() => doDelete(deleteTarget)} className="bg-red-600 hover:bg-red-700 text-white px-4 py-1 rounded-lg transition mt-12">
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {showOverlayWarning && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/80 z-50">
          <div
            className="rounded-2xl shadow-2xl p-6 max-w-md w-full text-white"
            style={{ background: "linear-gradient(180deg, rgba(0,60,140,1) 0%, rgba(0,30,70,1) 300%)" }}
          >
            <h3 className="text-white text-lg font-bold mb-4 text-center">Marker Required</h3>
            <p className="text-gray-300 text-sm mb-4 text-center">You must adjust the map marker before you can submit the request.</p>
            <button onClick={() => setShowOverlayWarning(false)} className="px-4 py-1 rounded-lg bg-blue-500 hover:bg-blue-600 transition mt-12 block mx-auto">
              OK, I’ll set the marker
            </button>
          </div>
        </div>
      )}

      {showOverlayConfirm && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/80 z-50">
          <div
            className="rounded-2xl shadow-2xl p-6 max-w-md w-full text-white"
            style={{ background: "linear-gradient(180deg, rgba(0,60,140,1) 0%, rgba(0,30,70,1) 300%)" }}
          >
            <h3 className="text-white text-lg font-bold mb-4 text-center">Final Confirmation</h3>
            <p className="text-gray-300 text-sm mb-4">
              Location chosen:
              <br />
              <span className="font-bold text-yellow-300">
                {form.lat.toFixed(5)}, {form.lng.toFixed(5)}
              </span>
              <br />
              <br />
              Is this correct? <br /> Once submitted, only administrators can make changes.
            </p>
            <div className="flex justify-end gap-2">
              <button onClick={() => setShowOverlayConfirm(false)} className=" bg-gray-400 hover:bg-gray-500 text-white px-4 py-1 rounded-lg transition mt-12 block">
                Check Again
              </button>
              <button onClick={doSubmit} className="px-4 py-1 rounded-lg bg-blue-500 hover:bg-blue-600 transition mt-12 block">
                Confirm & Submit
              </button>
            </div>
          </div>
        </div>
      )}

      {toastMessage && (
        <div
          className={`fixed top-6 left-1/2 -translate-x-1/2 px-5 py-2 rounded-lg shadow-lg text-sm animate-fade-in-out z-[9999]
            ${
              toastMessage.includes("❌")
                ? "bg-red-600"
                : toastMessage.includes("✅")
                ? "bg-green-600"
                : "bg-blue-600"
            } text-white`}
        >
          {toastMessage}
        </div>
      )}
    </div>
  );
}

/* ======================= Searchable Select ======================= */
function SearchableSelect({
  value,
  onChange,
  options,
  placeholder = "Select…",
  disabled = false,
  allowClear = true,
}: {
  value: string;
  onChange: (opt: Option | null) => void;
  options: Option[];
  placeholder?: string;
  disabled?: boolean;
  allowClear?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const selected = options.find((o) => o.value === value) || null;

  const filtered = query.trim()
    ? options.filter((o) => o.label.toLowerCase().includes(query.trim().toLowerCase()))
    : options;

  useEffect(() => {
    function onDocClick(e: MouseEvent) {
      const target = e.target as Node;
      if (containerRef.current && target && !containerRef.current.contains(target)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, []);

  useEffect(() => {
    if (!open) setQuery("");
    setActive(0);
  }, [open]);

  const baseBox =
    "p-2 rounded-xl bg-white/5 border border-white/10 text-white w-full text-xs focus:outline-none focus:ring-2 focus:ring-sky-400/40 disabled:opacity-60 disabled:cursor-not-allowed";

  return (
    <div className="relative" ref={containerRef}>
      <button
        type="button"
        className={`${baseBox} flex items-center justify-between transition-colors hover:bg-white/10`}
        disabled={disabled}
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => setOpen((s) => !s)}
      >
        <span className="truncate">
          {selected ? selected.label : <span className="opacity-60">{placeholder}</span>}
        </span>

        <span className="ml-2 flex items-center gap-1">
          {allowClear && selected && !disabled && (
            <span
              role="button"
              aria-label="Clear"
              className="px-1 rounded hover:bg-white/10"
              onClick={(e) => {
                e.stopPropagation();
                onChange(null);
              }}
            >
              ×
            </span>
          )}
          <svg width="10" height="10" viewBox="0 0 20 20" aria-hidden className="opacity-80">
            <path d="M5 7l5 5 5-5" fill="currentColor" />
          </svg>
        </span>
      </button>

      {open && (
        <div
          className="absolute z-[999] mt-1 left-0 w-auto min-w-full max-w-[calc(100vw-2rem)] sm:max-w-[40rem] rounded-xl border border-white/10 backdrop-blur-md shadow-xl overflow-hidden"
          style={{ background: INFO_CARD_BG }}
          role="listbox"
        >
          <div className="p-2 border-b border-white/10">
            <input
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "ArrowDown") {
                  e.preventDefault();
                  setActive((i) => Math.min(i + 1, Math.max(filtered.length - 1, 0)));
                } else if (e.key === "ArrowUp") {
                  e.preventDefault();
                  setActive((i) => Math.max(i - 1, 0));
                } else if (e.key === "Enter") {
                  e.preventDefault();
                  const pick = filtered[active];
                  if (pick) {
                    onChange(pick);
                    setOpen(false);
                  }
                } else if (e.key === "Escape") {
                  setOpen(false);
                }
              }}
              placeholder="Type to filter…"
              className="w-full p-2 rounded-lg bg-white/5 border border-white/10 text-white text-xs placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-sky-400/40"
            />
          </div>

          <ul className="max-h-30 overflow-auto overflow-x-auto">
            {filtered.length === 0 && <li className="px-3 py-2 text-xs text-white/70">No results</li>}
            {filtered.map((opt, idx) => {
              const isActive = idx === active;
              const isSelected = value === opt.value;
              return (
                <li
                  key={opt.value}
                  role="option"
                  aria-selected={isSelected}
                  className={`px-3 py-2 text-xs cursor-pointer transition-colors ${
                    isActive ? "bg-white/10" : "hover:bg-white/5"
                  } ${isSelected ? "text-sky-300" : "text-white"} flex items-center justify-between`}
                  onMouseEnter={() => setActive(idx)}
                  onClick={() => {
                    onChange(opt);
                    setOpen(false);
                  }}
                >
                  <span className="whitespace-nowrap pr-4" title={opt.label}>
                    {opt.label}
                  </span>
                  {isSelected && <span className="opacity-80 shrink-0">✓</span>}
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
}
