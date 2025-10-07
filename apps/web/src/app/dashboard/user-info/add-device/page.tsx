"use client";

import { useEffect, useState } from "react";
import { GoogleMap, Marker, useLoadScript } from "@react-google-maps/api";

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

export default function AddDevicePage() {
  const { isLoaded } = useLoadScript({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "",
  });

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

  // overlay states
  const [showOverlayConfirm, setShowOverlayConfirm] = useState(false);
  const [showOverlayWarning, setShowOverlayWarning] = useState(false);

  const [zoom, setZoom] = useState(9);

  // 🔹 Helper: cari titik tengah provinsi
  function getProvinceBoundingCenter(allData: DataItem[], provinceName: string) {
    const items = allData.filter((d) => d.province === provinceName);
    if (items.length === 0) return null;

    const minLat = Math.min(...items.map((d) => d.latitude));
    const maxLat = Math.max(...items.map((d) => d.latitude));
    const minLng = Math.min(...items.map((d) => d.longitude));
    const maxLng = Math.max(...items.map((d) => d.longitude));

    return {
      lat: (minLat + maxLat) / 2,
      lng: (minLng + maxLng) / 2,
    };
  }

  useEffect(() => {
    fetch("/data/data.json")
      .then((res) => res.json())
      .then((json) => setAllData(json))
      .catch(console.error);
  }, []);

  // Province list
  const provinces = Array.from(
    new Map(allData.map((d) => [d.province, d])).values()
  ).map((d) => ({
    name: d.province,
  }));

  // City list (tergantung province)
  const cities = form.province_id
    ? Array.from(
        new Map(
          allData
            .filter((d) => d.province === form.province_id)
            .map((d) => [d.city, d])
        ).values()
      ).map((d) => ({
        name: d.city,
        lat: d.latitude,
        lng: d.longitude,
        postal: d.postal,
      }))
    : [];

  // District list (tergantung city)
  const districts = form.city_id
    ? Array.from(
        new Map(
          allData
            .filter((d) => d.city === form.city_id)
            .map((d) => [d.district, d])
        ).values()
      ).map((d) => ({
        name: d.district,
        lat: d.latitude,
        lng: d.longitude,
        postal: d.postal,
      }))
    : [];

  // Subdistrict list (tergantung district)
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

  // 🔹 Handle Change
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "" }));

    if (name === "province_id") {
      const center = getProvinceBoundingCenter(allData, value);
      if (center) {
        setForm((prev) => ({
          ...prev,
          province_id: value,
          city_id: "",
          district_id: "",
          subdistrict_id: "",
          lat: center.lat,
          lng: center.lng,
          postal_code: "",
        }));
        setZoom(7);
        setMarkerEdited(false);
      }
    }

    if (name === "city_id") {
      const v = cities.find((k) => k.name === value);
      if (v) {
        setForm((prev) => ({
          ...prev,
          city_id: v.name,
          district_id: "",
          subdistrict_id: "",
          lat: v.lat,
          lng: v.lng,
          postal_code: String(v.postal),
        }));
        setZoom(12);
        setMarkerEdited(false);
      }
    }

    if (name === "district_id") {
      const v = districts.find((k) => k.name === value);
      if (v) {
        setForm((prev) => ({
          ...prev,
          district_id: v.name,
          subdistrict_id: "",
          lat: v.lat,
          lng: v.lng,
          postal_code: String(v.postal),
        }));
        setZoom(14);
        setMarkerEdited(false);
      }
    }

    if (name === "subdistrict_id") {
      const v = subdistricts.find((k) => k.name === value);
      if (v) {
        setForm((prev) => ({
          ...prev,
          subdistrict_id: v.name,
          lat: v.lat,
          lng: v.lng,
          postal_code: String(v.postal),
        }));
        setZoom(15);
        setMarkerEdited(false);
      }
    }
  };

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};
    if (!form.street_name) newErrors.street_name = "Street name is required";
    if (!form.province_id) newErrors.province_id = "Province is required";
    if (!form.city_id) newErrors.city_id = "City/Regency is required";
    if (!form.district_id) newErrors.district_id = "District is required";
    if (!form.subdistrict_id) newErrors.subdistrict_id = "Sub-district is required";
    if (!form.postal_code) newErrors.postal_code = "Postal code is required";
    if (!form.segmen) newErrors.segmen = "Segment is required";
    if (!form.detail_address) newErrors.detail_address = "Detail address is required";
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

  const doSubmit = async () => {
    setLoading(true);
    try {
      const address = `${form.street_name}, ${form.subdistrict_id}, ${form.district_id}, ${form.city_id}, ${form.province_id}, ${form.postal_code}`;
      const payload = {
        address,
        segmen: form.segmen,
        detail_address: form.detail_address,
        lat: form.lat,
        lng: form.lng,
      };

      const res = await fetch("/api/device-request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error("Failed to submit request");
      const saved: Request = await res.json();
      setHistory((prev) => [...prev, saved]);

      setForm({
        street_name: "",
        province_id: "",
        city_id: "",
        district_id: "",
        subdistrict_id: "",
        postal_code: "",
        segmen: "",
        detail_address: "",
        lat: form.lat,
        lng: form.lng,
      });
      setMarkerEdited(false);
    } catch (err) {
      console.error(err);
      alert("Failed to submit request");
    } finally {
      setLoading(false);
      setShowOverlayConfirm(false);
    }
  };

  if (!isLoaded) return <div className="text-white text-xs">Loading Map...</div>;

  const inputClass =
    "w-full h-7 px-3 bg-[#0a0e23] border border-[#2d3a70] rounded-lg text-white text-xs placeholder-gray-400 focus:ring-1 focus:ring-blue-400 focus:border-blue-400 outline-none";

  const errorClass = "text-red-400 text-[10px] mt-1";

  return (
    <div
      className="rounded-2xl p-8 mx-auto mr-8 mb-8"
      style={{
        background:
          "linear-gradient(90deg, rgba(6,11,40,0.74) 0%, rgba(10,14,35,0.71) 100%)",
      }}
    >
      <h2 className="text-2xl font-semibold text-white">Request New Device</h2>
      <p className="text-sm text-gray-300 mb-4">This is location for your device monitoring</p>
      <div className="flex flex-col md:flex-row gap-15">
        {/* Form */}
        <div className="flex-1 space-y-2">
          <div>
            <label className="text-white text-[10px]">Street</label>
            <input
              name="street_name"
              value={form.street_name}
              onChange={handleChange}
              className={inputClass}
              placeholder="Street name, house number"
            />
            {errors.street_name && <p className={errorClass}>{errors.street_name}</p>}
          </div>

          {/* Province / City / District / Sub */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            <div>
              <label className="text-[10px] text-white">Province</label>
              <select name="province_id" value={form.province_id} onChange={handleChange} className={inputClass}>
                <option value="">Select Province</option>
                {provinces.map((p) => (
                  <option key={p.name} value={p.name}>
                    {p.name}
                  </option>
                ))}
              </select>
              {errors.province_id && <p className={errorClass}>{errors.province_id}</p>}
            </div>
            <div>
              <label className="text-[10px] text-white">City/Regency</label>
              <select name="city_id" value={form.city_id} onChange={handleChange} className={inputClass}>
                <option value="">Select City</option>
                {cities.map((k) => (
                  <option key={k.name} value={k.name}>
                    {k.name}
                  </option>
                ))}
              </select>
              {errors.city_id && <p className={errorClass}>{errors.city_id}</p>}
            </div>
            <div>
              <label className="text-[10px] text-white">District</label>
              <select name="district_id" value={form.district_id} onChange={handleChange} className={inputClass}>
                <option value="">Select District</option>
                {districts.map((k) => (
                  <option key={k.name} value={k.name}>
                    {k.name}
                  </option>
                ))}
              </select>
              {errors.district_id && <p className={errorClass}>{errors.district_id}</p>}
            </div>
            <div>
              <label className="text-[10px] text-white">Sub-district / Village</label>
              <select name="subdistrict_id" value={form.subdistrict_id} onChange={handleChange} className={inputClass}>
                <option value="">Select Sub-district</option>
                {subdistricts.map((k) => (
                  <option key={k.code} value={k.name}>
                    {k.name}
                  </option>
                ))}
              </select>
              {errors.subdistrict_id && <p className={errorClass}>{errors.subdistrict_id}</p>}
            </div>
          </div>

          <div>
            <label className="text-[10px] text-white">Postal Code</label>
            <input value={form.postal_code} readOnly className={inputClass} />
          </div>

          <div>
            <label className="text-[10px] text-white">Segment</label>
            <input name="segmen" value={form.segmen} onChange={handleChange} className={inputClass} />
            {errors.segmen && <p className={errorClass}>{errors.segmen}</p>}
          </div>

          <div>
            <label className="text-[10px] text-white">Detail Address</label>
            <input name="detail_address" value={form.detail_address} onChange={handleChange} className={inputClass} />
            {errors.detail_address && <p className={errorClass}>{errors.detail_address}</p>}
          </div>

          <button
            onClick={handleSubmit}
            disabled={loading}
            className="mt-4 w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-xl shadow-md text-sm"
          >
            {loading ? "Submitting..." : "Submit Request"}
          </button>
        </div>

        {/* Map */}
        <div className="flex-1 h-64 md:h-auto rounded-xl overflow-hidden border border-blue-500">
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
          <p className="text-[8px] text-yellow-400 mt-1 text-center font-bold">
            ⚠️ Please make sure the marker is set to the exact location before submitting.
          </p>
        </div>
      </div>

      {/* Overlay: Warning */}
      {showOverlayWarning && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/80 z-50">
          <div className="rounded-2xl shadow-2xl p-6 max-w-md w-full text-white"
            style={{
              background: "linear-gradient(180deg, rgba(0,60,140,1) 0%, rgba(0,30,70,1) 300%)",
            }}
          >
            <h3 className="text-white text-lg font-bold mb-4 text-center">Marker Required</h3>
            <p className="text-gray-300 text-sm mb-4 text-center">
              You must adjust the map marker before you can submit the request.
            </p>
            <button
              onClick={() => setShowOverlayWarning(false)}
              className="px-4 py-1 rounded-lg bg-blue-500 hover:bg-blue-600 transition mt-12 block mx-auto"
            >
              OK, I’ll set the marker
            </button>
          </div>
        </div>
      )}

      {/* Overlay: Confirm */}
      {showOverlayConfirm && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/80 z-50">
          <div className="rounded-2xl shadow-2xl p-6 max-w-md w-full text-white" 
            style={{
              background: "linear-gradient(180deg, rgba(0,60,140,1) 0%, rgba(0,30,70,1) 300%)",
            }}
          >
            <h3 className="text-white text-lg font-bold mb-4 text-center">Final Confirmation</h3>
            <p className="text-gray-300 text-sm mb-4">
              Location chosen:
              <br />
              <span className="font-bold text-yellow-300">
                {form.lat.toFixed(5)}, {form.lng.toFixed(5)}
              </span>
              <br /><br />
              Is this correct? <br /> Once submitted, only administrators can make changes.
            </p>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowOverlayConfirm(false)}
                className=" bg-gray-400 hover:bg-gray-500 text-white px-4 py-1 rounded-lg transition mt-12 block"
              >
                Check Again
              </button>
              <button
                onClick={doSubmit}
                className="px-4 py-1 rounded-lg bg-blue-500 hover:bg-blue-600 transition mt-12 block"
              >
                Confirm & Submit
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
