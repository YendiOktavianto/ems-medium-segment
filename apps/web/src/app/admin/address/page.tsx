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

export default function AddressForm() {
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
  const autocompleteRef = useRef<any>(null);

  const [form, setForm] = useState({
    provinsi_id: "",
    kabupaten_id: "",
    kecamatan_id: "",
    kelurahan_id: "",
    nama_jalan: "",
    kode_pos: "",
    segmen: "",
    detail_address: "",
    lat: -6.1751,
    lng: 106.865,
  });

  // load dataset dari drizki
  useEffect(() => {
    fetch("/data/data.json")
      .then((res) => res.json())
      .then((json) => {
        setAllData(json);

        // filter provinsi (biasanya parent_id kosong/null)
        const prov = json.filter((d: Option) => !d.parent_id);
        setProvinsi(prov);
      });
  }, []);

  // update kabupaten berdasarkan provinsi
  useEffect(() => {
    if (form.provinsi_id) {
      const kab = allData.filter((d) => d.parent_id === form.provinsi_id);
      setKabupaten(kab);
      setKecamatan([]);
      setKelurahan([]);
    }
  }, [form.provinsi_id, allData]);

  // update kecamatan berdasarkan kabupaten
  useEffect(() => {
    if (form.kabupaten_id) {
      const kec = allData.filter((d) => d.parent_id === form.kabupaten_id);
      setKecamatan(kec);
      setKelurahan([]);
    }
  }, [form.kabupaten_id, allData]);

  // update kelurahan berdasarkan kecamatan
  useEffect(() => {
    if (form.kecamatan_id) {
      const kel = allData.filter((d) => d.parent_id === form.kecamatan_id);
      setKelurahan(kel);
    }
  }, [form.kecamatan_id, allData]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));

    // kalau pilih kelurahan, auto isi kode pos & lat/lng (jika ada di dataset)
    if (name === "kelurahan_id") {
      const kel = allData.find((d) => d.id === value);
      if (kel) {
        setForm((prev) => ({
          ...prev,
          kode_pos: kel.kode_pos || prev.kode_pos,
          lat: kel.lat || prev.lat,
          lng: kel.lng || prev.lng,
        }));
        if (kel.lat && kel.lng) {
          setMarker({ lat: kel.lat, lng: kel.lng });
        }
      }
    }
  };

  const onPlaceChanged = () => {
    if (autocompleteRef.current) {
      const place = autocompleteRef.current.getPlace();
      if (place?.geometry) {
        const lat = place.geometry.location.lat();
        const lng = place.geometry.location.lng();
        setMarker({ lat, lng });
        setForm((prev) => ({
          ...prev,
          lat,
          lng,
          nama_jalan: place.formatted_address || prev.nama_jalan,
        }));
      }
    }
  };

  const handleSubmit = () => {
    const alamatLengkap = `${form.nama_jalan}, ${
      kelurahan.find((k) => k.id === form.kelurahan_id)?.nama || ""
    }, ${kecamatan.find((k) => k.id === form.kecamatan_id)?.nama || ""}, ${
      kabupaten.find((k) => k.id === form.kabupaten_id)?.nama || ""
    }, ${provinsi.find((p) => p.id === form.provinsi_id)?.nama || ""}, ${
      form.kode_pos
    }`;

    const dataToSave = {
      ...form,
      alamat_lengkap: alamatLengkap,
      lat: marker.lat,
      lng: marker.lng,
    };

    console.log("Save this:", dataToSave);
    alert("Alamat tersimpan!");
  };

  if (!isLoaded) return <div className="text-white">Loading...</div>;

  const inputClass =
    "w-full h-9 flex items-center px-3 bg-[#3A3A3A]/40 rounded-lg text-white placeholder-gray-400 " +
    "focus:ring-2 focus:ring-blue-400 focus:border-blue-400 outline-none transition duration-200";

  const labelClass = "block text-xs font-medium text-gray-300 mb-1";

  return (
    <div
      className="h-screen w-screen overflow-hidden flex justify-center items-center bg-cover bg-center bg-fixed"
      style={{ backgroundImage: "url('/bg1.png')" }}
    >
      <div className="relative px-8 py-6 bg-gray-800/70 backdrop-blur-md rounded-2xl 
             shadow-2xl w-[400px] border border-gray-700 space-y-4 
             max-h-[90vh] overflow-y-auto custom-scroll my-3">
        <h2 className="text-xl font-bold text-center text-white tracking-wide">
          Address Form
        </h2>

        {/* Nama Jalan */}
        <div>
          <label className={labelClass}>Street / Full Address</label>
          <Autocomplete
            onLoad={(ref) => (autocompleteRef.current = ref)}
            onPlaceChanged={onPlaceChanged}
          >
            <input
              name="nama_jalan"
              value={form.nama_jalan}
              onChange={handleChange}
              className={inputClass}
              placeholder="Street name, number"
            />
          </Autocomplete>
        </div>

        {/* Provinsi */}
        <div>
          <label className={labelClass}>Province</label>
          <select
            name="provinsi_id"
            value={form.provinsi_id}
            onChange={handleChange}
            className={inputClass}
          >
            <option value="">Select Province</option>
            {provinsi.map((prov) => (
              <option key={prov.id} value={prov.id}>
                {prov.nama}
              </option>
            ))}
          </select>
        </div>

        {/* Kabupaten */}
        <div>
          <label className={labelClass}>Regency/City</label>
          <select
            name="kabupaten_id"
            value={form.kabupaten_id}
            onChange={handleChange}
            className={inputClass}
          >
            <option value="">Select Regency or City</option>
            {kabupaten.map((kab) => (
              <option key={kab.id} value={kab.id}>
                {kab.nama}
              </option>
            ))}
          </select>
        </div>

        {/* Kecamatan */}
        <div>
          <label className={labelClass}>District</label>
          <select
            name="kecamatan_id"
            value={form.kecamatan_id}
            onChange={handleChange}
            className={inputClass}
          >
            <option value="">Select District</option>
            {kecamatan.map((kec) => (
              <option key={kec.id} value={kec.id}>
                {kec.nama}
              </option>
            ))}
          </select>
        </div>

        {/* Kelurahan */}
        <div>
          <label className={labelClass}>Sub-district</label>
          <select
            name="kelurahan_id"
            value={form.kelurahan_id}
            onChange={handleChange}
            className={inputClass}
          >
            <option value="">Select Sub-district</option>
            {kelurahan.map((kel) => (
              <option key={kel.id} value={kel.id}>
                {kel.nama}
              </option>
            ))}
          </select>
        </div>

        {/* Kode Pos */}
        <div>
          <label className={labelClass}>Postal Code</label>
          <input
            name="kode_pos"
            value={form.kode_pos}
            onChange={handleChange}
            className={inputClass}
            placeholder="Postal Code"
          />
        </div>

        {/* Segmen */}
        <div>
          <label className={labelClass}>Segment</label>
          <input
            name="segmen"
            value={form.segmen}
            onChange={handleChange}
            className={inputClass}
            placeholder="School, Residence, SOHO, etc"
          />
        </div>

        {/* Detail Address */}
        <div>
          <label className={labelClass}>Detail Address</label>
          <input
            name="detail_address"
            value={form.detail_address}
            onChange={handleChange}
            className={inputClass}
            placeholder="1st floor, 2nd Floor, etc"
          />
        </div>

        {/* Map */}
        <div>
          <label className={labelClass}>Pick Location on Map</label>
          <div className="w-full h-40 rounded-lg overflow-hidden border border-gray-600 shadow-inner">
            <GoogleMap
              mapContainerClassName="w-full h-full"
              center={marker}
              zoom={14}
              onClick={(e) => {
                if (e.latLng) {
                  setMarker({ lat: e.latLng.lat(), lng: e.latLng.lng() });
                  setForm((prev) => ({
                    ...prev,
                    lat: e.latLng!.lat(),
                    lng: e.latLng!.lng(),
                  }));
                }
              }}
            >
              <Marker
                position={marker}
                draggable
                onDragEnd={(e) => {
                  if (e.latLng) {
                    setMarker({ lat: e.latLng.lat(), lng: e.latLng.lng() });
                    setForm((prev) => ({
                      ...prev,
                      lat: e.latLng!.lat(),
                      lng: e.latLng!.lng(),
                    }));
                  }
                }}
              />
            </GoogleMap>
          </div>
          <p className="text-[10px] text-gray-400 mt-1 tracking-wide">
            {marker.lat.toFixed(5)}, {marker.lng.toFixed(5)}
          </p>
        </div>

        {/* Simpan */}
        <button
          onClick={handleSubmit}
          className="shadow-lg bg-[#2196F3] hover:bg-[#1A78C2] text-white font-semibold py-2 rounded-lg w-full h-10 transition-all duration-200 transform hover:scale-[1.02]"
        >
          Save Address
        </button>
      </div>
    </div>
  );
}
