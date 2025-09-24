"use client";
import { useState, useEffect, useRef } from "react";
import { GoogleMap, Marker, useLoadScript, Autocomplete } from "@react-google-maps/api";

type Option = {
  id: string;
  nama: string;
  parent_id?: string;
  lat?: number;
  lng?: number;
  kode_pos?: string;
};

export default function AddDevicePage() {
  const { isLoaded } = useLoadScript({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "",
    libraries: ["places"],
  });

  const [allData, setAllData] = useState<Option[]>([]);
  const [provinsi, setProvinsi] = useState<Option[]>([]);
  const [kabupaten, setKabupaten] = useState<Option[]>([]);
  const [kecamatan, setKecamatan] = useState<Option[]>([]);
  const [kelurahan, setKelurahan] = useState<Option[]>([]);

  const [marker, setMarker] = useState({ lat: -6.1751, lng: 106.865 });
  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);

  const initialForm = {
    nama_jalan: "",
    provinsi_id: "",
    kabupaten_id: "",
    kecamatan_id: "",
    kelurahan_id: "",
    kode_pos: "",
    segmen: "",
    detail_address: "",
    lat: -6.1751,
    lng: 106.865,
  };

  const [form, setForm] = useState(initialForm);
  const [loading, setLoading] = useState(false);
  const [requestId, setRequestId] = useState<number | null>(null);
  const [status, setStatus] = useState<string | null>(null);

  // Load data.json
  useEffect(() => {
    fetch("/data/data.json")
      .then((res) => res.json())
      .then((json) => {
        setAllData(json);
        setProvinsi(json.filter((d: Option) => !d.parent_id));
      })
      .catch((err) => console.error("Failed to load data.json:", err));
  }, []);

  // Cascade dropdowns
  useEffect(() => {
    if (form.provinsi_id) {
      setKabupaten(allData.filter((d) => d.parent_id === form.provinsi_id));
      setKecamatan([]);
      setKelurahan([]);
      setForm((prev) => ({ ...prev, kabupaten_id: "", kecamatan_id: "", kelurahan_id: "" }));
    } else setKabupaten([]), setKecamatan([]), setKelurahan([]);
  }, [form.provinsi_id, allData]);

  useEffect(() => {
    if (form.kabupaten_id) {
      setKecamatan(allData.filter((d) => d.parent_id === form.kabupaten_id));
      setKelurahan([]);
      setForm((prev) => ({ ...prev, kecamatan_id: "", kelurahan_id: "" }));
    } else setKecamatan([]), setKelurahan([]);
  }, [form.kabupaten_id, allData]);

  useEffect(() => {
    if (form.kecamatan_id) {
      setKelurahan(allData.filter((d) => d.parent_id === form.kecamatan_id));
      setForm((prev) => ({ ...prev, kelurahan_id: "" }));
    } else setKelurahan([]);
  }, [form.kecamatan_id, allData]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));

    if (["provinsi_id", "kabupaten_id", "kecamatan_id", "kelurahan_id"].includes(name)) {
      const opt = allData.find((d) => d.id === value || d.nama === value);
      if (opt) setForm((prev) => ({ ...prev, [name]: opt.id }));
    }

    if (name === "kelurahan_id") {
      const kel = allData.find((d) => d.id === value || d.nama === value);
      if (kel) {
        setForm((prev) => ({
          ...prev,
          kode_pos: kel.kode_pos || prev.kode_pos,
          lat: kel.lat || prev.lat,
          lng: kel.lng || prev.lng,
        }));
        if (kel.lat && kel.lng) setMarker({ lat: kel.lat, lng: kel.lng });
      }
    }
  };

  const onPlaceChanged = () => {
    if (autocompleteRef.current) {
      const place = autocompleteRef.current.getPlace();
      if (place?.geometry?.location) {
        const lat = place.geometry.location.lat();
        const lng = place.geometry.location.lng();
        setMarker({ lat, lng });
        setForm((prev) => ({ ...prev, lat, lng, nama_jalan: place.formatted_address || prev.nama_jalan }));
      }
    }
  };

  const handleSubmit = async () => {
    if (!form.nama_jalan) return alert("Alamat wajib diisi");
    setLoading(true);

    try {
      const prov = allData.find((d) => d.id === form.provinsi_id)?.nama || form.provinsi_id;
      const kab = allData.find((d) => d.id === form.kabupaten_id)?.nama || form.kabupaten_id;
      const kec = allData.find((d) => d.id === form.kecamatan_id)?.nama || form.kecamatan_id;
      const kel = allData.find((d) => d.id === form.kelurahan_id)?.nama || form.kelurahan_id;

      const address = `${form.nama_jalan}, ${kel}, ${kec}, ${kab}, ${prov}, ${form.kode_pos}`;

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

      const data = await res.json();
      setRequestId(data.id);
      setStatus(data.status);
    } catch (err) {
      console.error(err);
      alert("Gagal kirim request");
    }

    setLoading(false);
  };

  // Polling status
  useEffect(() => {
    if (!requestId) return;
    const interval = setInterval(() => {
      fetch(`/api/device-status?id=${requestId}`)
        .then((res) => res.json())
        .then((data) => {
          setStatus(data.status);
          if (["approved", "rejected"].includes(data.status)) clearInterval(interval);
        })
        .catch(console.error);
    }, 5000);
    return () => clearInterval(interval);
  }, [requestId]);

  const handleReset = () => {
    setForm(initialForm);
    setMarker({ lat: -6.1751, lng: 106.865 });
    setRequestId(null);
    setStatus(null);
  };

  if (!isLoaded) return <div className="text-white text-[10px]">Loading Map...</div>;

  const inputClass =
    "w-full h-7 px-2 bg-[#1E3A8A]/30 rounded-lg text-white text-[10px] placeholder-blue-200 " +
    "focus:ring-1 focus:ring-blue-400 outline-none transition duration-150 pointer-events-auto";

  return (
    <div className="rounded-xl p-2 mx-auto mr-8" style={{ background: "linear-gradient(90deg, rgba(6,11,40,0.74) 0%, rgba(10,14,35,0.71) 100%)" }}>
      <h2 className="text-sm font-bold text-white text-center mb-2 w-full md:w-auto">Request New Device</h2>
      <div className="flex flex-col md:flex-row w-full max-w-7xl bg-[#15204f]/90 backdrop-blur-md rounded-xl shadow-md p-3 border border-blue-500 gap-3">
        
        {/* Form selalu muncul */}
        <div className="flex flex-col md:w-1/2 gap-1 overflow-hidden pointer-events-auto">
          <div className="space-y-3">
            <label className="text-[9px] font-medium text-gray-300">Street</label>
            <Autocomplete onLoad={(ref) => (autocompleteRef.current = ref)} onPlaceChanged={onPlaceChanged}>
              <input name="nama_jalan" value={form.nama_jalan} onChange={handleChange} className={inputClass} placeholder="Street name, number" />
            </Autocomplete>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            {[
              { label: "Province", name: "provinsi_id", options: provinsi },
              { label: "Regency/City", name: "kabupaten_id", options: kabupaten },
              { label: "District", name: "kecamatan_id", options: kecamatan },
              { label: "Sub-district", name: "kelurahan_id", options: kelurahan },
            ].map(({ label, name, options }) => (
              <div key={name} className="space-y-3 relative">
                <label className="text-[9px] font-medium text-gray-300">{label}</label>
                <input
                  list={`${name}-list`}
                  name={name}
                  value={(form as any)[name]}
                  onChange={handleChange}
                  className={inputClass}
                  placeholder={`Type or select ${label}`}
                />
                <datalist id={`${name}-list`}>
                  {options.map((opt) => (
                    <option key={opt.id} value={opt.nama} />
                  ))}
                </datalist>
              </div>
            ))}
          </div>

          <div className="space-y-3">
            <label className="text-[9px] font-medium text-gray-300">Postal Code</label>
            <input name="kode_pos" value={form.kode_pos} onChange={handleChange} className={inputClass} placeholder="Postal Code" />
          </div>

          <div className="space-y-3">
            <label className="text-[9px] font-medium text-gray-300">Segment</label>
            <input name="segmen" value={form.segmen} onChange={handleChange} className={inputClass} placeholder="School, Residence, SOHO, etc" />
          </div>

          <div className="space-y-3">
            <label className="text-[9px] font-medium text-gray-300">Detail Address</label>
            <input name="detail_address" value={form.detail_address} onChange={handleChange} className={inputClass} placeholder="1st floor, 2nd floor, etc" />
          </div>

          <button
            onClick={handleSubmit}
            disabled={loading}
            className="mt-5 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white font-semibold text-xs rounded-xl shadow-sm hover:scale-[1.01] transition duration-150"
          >
            {loading ? "Mengirim..." : "Kirim Request"}
          </button>
          {requestId && (
            <button
              onClick={handleReset}
              className="mt-2 bg-blue-500 hover:bg-blue-600 text-white text-xs py-1 px-3 rounded-lg"
            >
              Buat Request Baru
            </button>
          )}
        </div>

        {/* Map & status */}
        <div className="md:w-1/2 h-64 md:h-auto rounded-xl overflow-hidden border border-blue-500 shadow pointer-events-auto">
          <GoogleMap
            mapContainerClassName="w-full h-full"
            center={marker}
            zoom={14}
            onClick={(e) => {
              if (e.latLng) {
                const lat = e.latLng.lat();
                const lng = e.latLng.lng();
                setMarker({ lat, lng });
                setForm((prev) => ({ ...prev, lat, lng }));
              }
            }}
          >
            <Marker
              position={marker}
              draggable
              onDragEnd={(e) => {
                if (e.latLng) {
                  const lat = e.latLng.lat();
                  const lng = e.latLng.lng();
                  setMarker({ lat, lng });
                  setForm((prev) => ({ ...prev, lat, lng }));
                }
              }}
            />
          </GoogleMap>
          <p className="text-[8px] text-gray-400 mt-1 text-center">
            {marker.lat.toFixed(5)}, {marker.lng.toFixed(5)}
          </p>

          {requestId && (
            <div className="text-center mt-2 space-y-1 text-[9px]">
              <p className="text-gray-300">ID Request: {requestId}</p>
              {status === "pending" && <p className="text-yellow-400">Menunggu persetujuan Admin ⏳</p>}
              {status === "approved" && <p className="text-green-400 font-bold">Request Anda diterima Admin ✅</p>}
              {status === "rejected" && <p className="text-red-400 font-bold">Request Anda ditolak Admin ❌</p>}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
