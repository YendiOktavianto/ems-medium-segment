"use client";

import { useState, useEffect, useMemo } from "react";
import ExcelJS from "exceljs";
import { saveAs } from "file-saver";
import { FaFileExcel, FaSearch, FaEdit, FaTrash, FaPlus } from "react-icons/fa";
import { GoogleMap, Marker, useLoadScript } from "@react-google-maps/api";

type DataRow = {
  id: string;
  serial_number: string;
  username: string;
  wattage: string;
  phase: string;
  address_name: string;
  detail_address_name: string;
  long: number;
  lat: number;
  segment: string;
  active: string; // YES | NO
};




// dummy data
const initialData: DataRow[] = Array.from({ length: 50 }, (_, i) => ({
  id: `${i + 1}`,
  serial_number: `PQ-10000${(i % 10) + 1}.A`,
  username: `User ${i + 1}`,
  wattage: "2200VA",
  phase: ["1-phase", "2-phase", "3-phase"][i % 3],
  address_name: "Building A",
  detail_address_name: ["Lantai 1", "Lantai 2", "Dapur", "Ladang"][i % 4],
  long: 110.5 + i * 0.01,
  lat: -7.3 + i * 0.01,
  segment: ["School", "SOHO", "Residence"][i % 3],
  active: i % 2 === 0 ? "YES" : "NO",
}));

// helper ambil token (optional)
const getAuthHeaders = (): Record<string, string> => {
  try {
    const token =
      (typeof window !== "undefined" &&
        localStorage.getItem("access_token")) ||
      "";
    return token ? { Authorization: `Bearer ${token}` } : {};
  } catch {
    return {};
  }
};

export default function DataTable(): React.JSX.Element {
  const { isLoaded } = useLoadScript({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "",
  });
  // konfirmasi ubah posisi marker
  const [confirmMove, setConfirmMove] = useState<{
    lat: number;
    lng: number;
    type: "click" | "drag";
  } | null>(null);

  // konfirmasi hasil geocode
  const [confirmGeocode, setConfirmGeocode] = useState<{ lat: number; lng: number } | null>(null);

  // tambahkan di bawah const [confirmGeocode, ...]
  const [confirmEditMove, setConfirmEditMove] = useState<{ lat: number; lng: number; type: "click" | "drag" } | null>(null);



  const [tableData, setTableData] = useState<DataRow[]>(initialData);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [show, setShow] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [addDeviceModal, setAddDeviceModal] = useState(false);

  const [newDevice, setNewDevice] = useState<DataRow>({
    id: "",
    serial_number: "",
    username: "",
    wattage: "",
    phase: "",
    address_name: "",
    detail_address_name: "",
    long: NaN,
    lat: NaN,
    segment: "",
    active: "YES",
  });

  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [errors, setErrors] = useState<Partial<Record<keyof DataRow, string>>>({});

  
  const geocodeAddress = async () => {
    const address = `${newDevice.address_name}, Indonesia`.trim();
    if (!newDevice.address_name) {
      setToastMessage("⚠️ Please fill in Address Name first!");
      return;
    }

    try {
      console.log("📍 Searching for address:", address);

      const res = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(
          address
        )}&key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}`
      );
      const data = await res.json();

      console.log("🧭 Geocode result:", data);

      if (data.status === "OK" && data.results.length > 0) {
        const { lat, lng } = data.results[0].geometry.location;

        // jika sudah ada lat long sebelumnya, konfirmasi dulu
        if (!Number.isNaN(newDevice.lat) && !Number.isNaN(newDevice.long)) {
          setConfirmGeocode({ lat, lng });
        } else {
          // kalau pertama kali isi → langsung set
          setNewDevice((prev) => ({ ...prev, lat, long: lng }));
          setToastMessage("✅ Location found and set for the first time!");
        }
      } else {
        setToastMessage("❌ Address not found. Try refining the address text (e.g., add city).");
      }
    } catch (error) {
      console.error("Geocoding failed:", error);
      setToastMessage("❌ Failed to fetch geolocation.");
    }
  };

  useEffect(() => {
    if (
      newDevice.address_name &&
      newDevice.detail_address_name &&
      (Number.isNaN(newDevice.lat) || Number.isNaN(newDevice.long))
    ) {
      const timer = setTimeout(() => {
        geocodeAddress();
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [newDevice.address_name, newDevice.detail_address_name]);

  useEffect(() => {
    // kalau lat long valid dan sudah ada peta
    if (!isLoaded) return;
    if (Number.isNaN(newDevice.lat) || Number.isNaN(newDevice.long)) return;

    // temukan elemen map dari API instance
    const mapContainer = document.querySelector('[aria-label="Map"]');
    if (!mapContainer) return;

    // trigger event agar GoogleMap update center
    const event = new Event("resize");
    window.dispatchEvent(event);
  }, [newDevice.lat, newDevice.long, isLoaded]);

  // confirm delete
  const [confirmDelete, setConfirmDelete] = useState<DataRow | null>(null);

  // edit overlay
  const [editRow, setEditRow] = useState<DataRow | null>(null);

  // debounce search
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(timer);
  }, [search]);

  // reset page saat filter berubah
  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearch, show]);

  // filter data
  const filteredData = useMemo(() => {
    const lowerSearch = debouncedSearch.toLowerCase();

    return tableData.filter((d) => {
      const combined = [
        d.id,
        d.serial_number,
        d.username,
        d.wattage,
        d.phase,
        d.address_name,
        d.detail_address_name,
        d.long,
        d.lat,
        d.segment,
        d.active,
      ]
        .join(" ")
        .toLowerCase();

      return combined.includes(lowerSearch);
    });
  }, [tableData, debouncedSearch]);

  // pagination
  const paginatedData = useMemo(() => {
    if (show === -1) return filteredData; // -1 untuk "All"
    return filteredData.slice((currentPage - 1) * show, currentPage * show);
  }, [filteredData, show, currentPage]);

  const totalPages = show === -1 ? 1 : Math.ceil(filteredData.length / show);

  const exportXLS = async () => {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Device Management");

    worksheet.columns = [
      { header: "Serial Number", key: "serial_number", width: 15 },
      { header: "Owner", key: "username", width: 20 },
      { header: "Wattage", key: "wattage", width: 12 },
      { header: "Phase", key: "phase", width: 12 },
      { header: "Address Name", key: "address_name", width: 20 },
      { header: "Detail Address", key: "detail_address_name", width: 20 },
      { header: "Lat", key: "lat", width: 12 },
      { header: "Long", key: "long", width: 12 },
      { header: "Segment", key: "segment", width: 15 },
      { header: "Active", key: "active", width: 10 },
    ];

    filteredData.forEach((item) => worksheet.addRow(item));

    worksheet.getRow(1).eachCell((cell) => {
      cell.font = { bold: true, color: { argb: "FFFFFFFF" } };
      cell.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "FF1E2A4A" },
      };
      cell.alignment = { vertical: "middle", horizontal: "center" };
    });

    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });

    saveAs(blob, "Device_Management.xlsx");
  };

  // hapus
  const handleDelete = (row: DataRow) => {
    setTableData((prev) => prev.filter((item) => item.id !== row.id));
    setConfirmDelete(null);
  };

  // HANDLE EDIT DEVICE
  const handleSaveEdit = async () => {
    if (!editRow) return;

    const newErrors: Partial<Record<keyof DataRow, string>> = {};

    // --- Address Name ---
    if (!editRow.address_name)
      newErrors.address_name = "Address name is required!";
    else if (editRow.address_name.length < 3)
      newErrors.address_name = "Address name must be at least 3 characters!";
    else if (editRow.address_name.length > 50)
      newErrors.address_name = "Address name cannot exceed 50 characters!";

    // --- Detail Address Name ---
    if (!editRow.detail_address_name)
      newErrors.detail_address_name = "Detail address is required!";
    else if (editRow.detail_address_name.length < 3)
      newErrors.detail_address_name = "Detail address must be at least 3 characters!";
    else if (editRow.detail_address_name.length > 50)
      newErrors.detail_address_name = "Detail address cannot exceed 50 characters!";

    // --- Latitude ---
    if (Number.isNaN(editRow.lat))
      newErrors.lat = "Latitude is required!";
    else if (editRow.lat < -90 || editRow.lat > 90)
      newErrors.lat = "Latitude must be between -90 and 90!";

    // --- Longitude ---
    if (Number.isNaN(editRow.long))
      newErrors.long = "Longitude is required!";
    else if (editRow.long < -180 || editRow.long > 180)
      newErrors.long = "Longitude must be between -180 and 180!";

    // --- Segment ---
    if (!editRow.segment)
      newErrors.segment = "Segment is required!";
    else if (editRow.segment.length < 3)
      newErrors.segment = "Segment must be at least 3 characters!";
    else if (editRow.segment.length > 30)
      newErrors.segment = "Segment cannot exceed 30 characters!";
    else if (!/^[A-Za-z\s]+$/.test(editRow.segment))
      newErrors.segment = "Segment can only contain letters and spaces.";

    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;

    try {
      const payload = {
        address_name: editRow.address_name,
        detail_address_name: editRow.detail_address_name,
        lat: Number(editRow.lat),
        long: Number(editRow.long),
        segment: editRow.segment,
      };

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/devices/${editRow.id}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            ...getAuthHeaders(),
          },
          body: JSON.stringify(payload),
        }
      );

      if (!res.ok) throw new Error("Failed to update device");

      // Update data di tabel lokal
      setTableData((prev) =>
        prev.map((item) =>
          item.id === editRow.id ? { ...item, ...payload } : item
        )
      );

      setToastMessage("✅ Device updated successfully!");
      setEditRow(null);
      setErrors({});
    } catch (err) {
      console.error(err);
      setToastMessage("❌ Failed to update device!");
    }
  };

  //HANDLE ADD DEVICE
  const handleAddDevice = async () => {
    const newErrors: Partial<Record<keyof DataRow, string>> = {};

    // --- Serial Number ---
    if (!newDevice.serial_number)
      newErrors.serial_number = "Serial number is required!";
    else if (newDevice.serial_number.length < 5)
      newErrors.serial_number = "Serial number must be at least 5 characters long!";
    else if (newDevice.serial_number.length > 30)
      newErrors.serial_number = "Serial number cannot exceed 30 characters!";
    else if (!/^[A-Za-z0-9.\-_]+$/.test(newDevice.serial_number))
      newErrors.serial_number = "Serial number can only contain letters, numbers, dots, hyphens, and underscores.";

    // --- Username (Owner) ---
    if (!newDevice.username)
      newErrors.username = "Owner (Username) is required!";
    else if (newDevice.username.length < 8) {
      newErrors.username = "username must be at least 8 characters";
    } else if (newDevice.username.length > 30) {
      newErrors.username = "username must be at most 30 characters";
    } else if (/\s/.test(newDevice.username)) {
      newErrors.username = "username cannot contain spaces";
    } else if (!/^[A-Z]/.test(newDevice.username)) {
      newErrors.username = "username must start with an uppercase letter";
    } else if (!/^[A-Z][A-Za-z0-9_.\-@!#$%^&*]+$/.test(newDevice.username)) {
      newErrors.username =
        "username can only contain letters, numbers, and special characters . _ - @ ! # $ % ^ & *";
    }

    // --- Address Name ---
    if (!newDevice.address_name)
      newErrors.address_name = "Address name is required!";
    else if (newDevice.address_name.length < 3)
      newErrors.address_name = "Address name must be at least 3 characters!";
    else if (newDevice.address_name.length > 50)
      newErrors.address_name = "Address name cannot exceed 50 characters!";

    // --- Detail Address Name ---
    if (!newDevice.detail_address_name)
      newErrors.detail_address_name = "Detail address is required!";
    else if (newDevice.detail_address_name.length < 3)
      newErrors.detail_address_name = "Detail address must be at least 3 characters!";
    else if (newDevice.detail_address_name.length > 50)
      newErrors.detail_address_name = "Detail address cannot exceed 50 characters!";

    // --- Latitude ---
    if (Number.isNaN(newDevice.lat))
      newErrors.lat = "Latitude is required!";
    else if (newDevice.lat < -90 || newDevice.lat > 90)
      newErrors.lat = "Latitude must be between -90 and 90!";

    // --- Longitude ---
    if (Number.isNaN(newDevice.long))
      newErrors.long = "Longitude is required!";
    else if (newDevice.long < -180 || newDevice.long > 180)
      newErrors.long = "Longitude must be between -180 and 180!";

    // --- Segment ---
    if (!newDevice.segment)
      newErrors.segment = "Segment is required!";
    else if (newDevice.segment.length < 3)
      newErrors.segment = "Segment must be at least 3 characters!";
    else if (newDevice.segment.length > 30)
      newErrors.segment = "Segment cannot exceed 30 characters!";
    else if (!/^[A-Za-z\s]+$/.test(newDevice.segment))
      newErrors.segment = "Segment can only contain letters and spaces.";

    // validasi angka (lat & long)
    if (Number.isNaN(newDevice.lat)) {
      newErrors.lat = "Latitude is required!";
    } else if (newDevice.lat < -90 || newDevice.lat > 90) {
      newErrors.lat = "Latitude must be between -90 and 90!";
    }

    if (Number.isNaN(newDevice.long)) {
      newErrors.long = "Longitude is required!";
    } else if (newDevice.long < -180 || newDevice.long > 180) {
      newErrors.long = "Latitude must be between -180 and 180!";
    }

    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;

    // payload aman untuk backend decimal
    const payload: Record<string, any> = {
      serial_number: newDevice.serial_number,
      username: newDevice.username,
      address_name: newDevice.address_name,
      detail_address_name: newDevice.detail_address_name,
      lat: Number(newDevice.lat),
      long: Number(newDevice.long),
      segment: newDevice.segment,
    };


    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/devices`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...getAuthHeaders(),
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error("Failed to add device");

      const data = await res.json();
      setTableData([...tableData, data]);
      setToastMessage("✅ Device add successfully!");
      setAddDeviceModal(false);
      setErrors({});
    } catch (err) {
      console.error(err);
      setToastMessage("❌ Failed to add device!");
    }
  };

  useEffect(() => {
    const fetchDevices = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/devices`, {
          headers: {
            "Content-Type": "application/json",
            ...getAuthHeaders(),
          },
        });

        if (!res.ok) throw new Error("Failed to fetch devices");
        const data = await res.json();

        // Kalau API mengembalikan array devices
        setTableData(data);
      } catch (err) {
        console.error("Error fetching devices:", err);
      }
    };

    fetchDevices();
  }, []);

  useEffect(() => {
    const storedData = localStorage.getItem("prefillDeviceData");
    if (storedData) {
      const request = JSON.parse(storedData);

      // Prefill data form
      setNewDevice((prev) => ({
        ...prev,
        username: request.username || "",
        address_name: request.address || "",
        detail_address_name: request.detail_address || "",
        lat: request.lat ?? NaN,
        long: request.lng ?? NaN,
        segment: request.segmen || "",
        active: "YES",
      }));

      // Buka modal Add Device
      setAddDeviceModal(true);

      // Tampilkan toast sukses
      setToastMessage("✅ Prefilled request data loaded successfully!");

      // Hapus localStorage agar tidak berulang
      localStorage.removeItem("prefillDeviceData");
    }
  }, []);

  useEffect(() => {
    if (toastMessage) {
      const timer = setTimeout(() => setToastMessage(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [toastMessage]);

  const DEFAULT_LOCATION = { lat: -6.200000, lng: 106.816666 }; // Jakarta

  return (
    <div
      className="
        flex flex-col mx-auto sm:mr-8 rounded-2xl
        box-border                 /* padding tidak menambah tinggi total */
        h-[84dvh] max-h-[100dvh]  /* kunci: tinggi layar tanpa scroll */
        overflow-hidden
        p-5 sm:p-4
        pb-[max(env(safe-area-inset-bottom),12px)]  /* aman di bawah */
      "
      style={{
        background:
          "linear-gradient(180deg, rgba(0,60,140,1) 0%, rgba(0,30,70,1) 100%)",
      }}
    >
      {/* Header */}
      <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-4 gap-2">
        <h1 className="text-xl md:text-2xl font-bold text-white">
          Device Management
        </h1>
        <div className="flex gap-2">
          <button
            onClick={() => setAddDeviceModal(true)}
            className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 px-3 py-1.5 rounded-full text-white text-xs transition"
          >
            <FaPlus /> Add Device
          </button>
          <button
            onClick={exportXLS}
            className="flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 px-3 py-1.5 rounded-full text-white text-xs transition"
          >
            <FaFileExcel className="text-white text-sm" />
            Export XLS
          </button>
        </div>
      </div>

      {/* Controls */}
      <div className="grid grid-cols-1 md:grid-cols-2 mb-4 text-white text-xs">
        {/* Show */}
        <div className="flex flex-col">
          <label className="mb-1 font-semibold">Show</label>
          <select
            className="bg-[#123060] p-2 rounded-lg w-13 text-xs"
            value={show}
            onChange={(e) => setShow(Number(e.target.value))}
          >
            <option value={10}>10</option>
            <option value={25}>25</option>
            <option value={50}>50</option>
            <option value={-1}>All</option>
          </select>
        </div>

        {/* Search */}
        <div className="flex flex-col">
          <label className="mb-1 font-semibold">Search</label>
          <div className="relative">
            <FaSearch className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-300 text-xs" />
            <input
              type="text"
              placeholder="Search"
              className="p-2 pl-8 rounded-lg bg-[#123060] text-white w-full text-xs"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="flex-1 min-h-0 overflow-auto rounded-lg shadow-lg custom-scroll">
        <table className="min-w-full text-white text-[10px]">
          <thead className="bg-[#0C1F3C] border-b border-gray-700 sticky top-0 z-10">
            <tr>
              {[
                "Serial Number",
                "Owner",
                "Wattage/Phase",
                "Location",
                "Lat",
                "Long",
                "Segment",
                "Active",
                "Action",
              ].map((header) => (
                <th
                  key={header}
                  scope="col"
                  className="px-4 py-4 text-left font-semibold uppercase tracking-wider"
                >
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {paginatedData.length === 0 ? (
              <tr>
                <td colSpan={9} className="text-center py-6">
                  No data found
                </td>
              </tr>
            ) : (
              paginatedData.map((row, index) => (
                <tr
                  key={`${row.serial_number}-${index}`}
                  className={`transition ${
                    index % 2 === 0 ? "bg-[#0C1F3C]" : "bg-[#1C345C]"
                  } hover:bg-blue-800`}
                >
                  <td className="px-2 py-2">{row.serial_number}</td>
                  <td className="px-2 py-2">{row.username}</td>
                  <td className="px-2 py-2">
                    {row.wattage} / {row.phase}
                  </td>
                  <td className="px-2 py-2">
                    {row.address_name} | {row.detail_address_name}
                  </td>
                  <td className="px-2 py-2">{row.lat}</td>
                  <td className="px-2 py-2">{row.long}</td>
                  <td className="px-2 py-2">{row.segment}</td>
                  <td className="px-2 py-2">{row.active}</td>
                  <td className="flex gap-2 py-2 px-5">
                    <button
                      className="p-1 bg-blue-600 hover:bg-blue-700 rounded-sm text-white"
                      onClick={() => setEditRow(row)}
                    >
                      <FaEdit size={12} />
                    </button>
                    <button
                      className="p-1 bg-red-600 hover:bg-red-700 rounded-sm text-white"
                      onClick={() => setConfirmDelete(row)}
                    >
                      <FaTrash size={10} />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {show !== -1 && (
        <div className="flex justify-center mt-4 gap-1 flex-wrap text-xs">
          <button
            disabled={currentPage === 1}
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            className={`px-3 py-1.5 rounded-full ${
              currentPage === 1
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-gray-600 hover:bg-gray-700 text-white"
            }`}
          >
            Previous
          </button>

          {Array.from({ length: totalPages }, (_, i) => (
            <button
              key={i + 1}
              className={`px-3 py-1.5 rounded-full ${
                currentPage === i + 1
                  ? "bg-blue-600 text-white"
                  : "bg-gray-600 text-white hover:bg-gray-700"
              }`}
              onClick={() => setCurrentPage(i + 1)}
            >
              {i + 1}
            </button>
          ))}

          <button
            disabled={currentPage === totalPages}
            onClick={() =>
              setCurrentPage((prev) => Math.min(prev + 1, totalPages))
            }
            className={`px-3 py-1.5 rounded-full ${
              currentPage === totalPages
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-gray-600 hover:bg-gray-700 text-white"
            }`}
          >
            Next
          </button>
        </div>
      )}

      {/* Modal Konfirmasi Hapus */}
      {confirmDelete && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/60 z-50">
          <div
            className="rounded-xl p-5 max-w-sm w-full text-white"
            style={{
              background:
                "linear-gradient(180deg, rgba(0,60,140,1) 0%, rgba(0,30,70,1) 300%)",
            }}
          >
            <h2 className="text-lg font-bold mb-2">Delete Confirmation</h2>
            <p className="text-sm mb-8">
              Are you sure want to delete <b>{confirmDelete.serial_number} DEVICE</b> with owner <b>{confirmDelete.username}</b>?
            </p>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setConfirmDelete(null)}
               className="px-3 py-1 rounded-full bg-gray-500 hover:bg-gray-600"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(confirmDelete)}
                className="px-3 py-1 rounded-full bg-red-600 hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Edit */}
      {editRow && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/80 z-50">
          <div
            className="rounded-2xl shadow-2xl p-6 max-w-md w-full text-white overflow-y-auto max-h-[94vh] custom-scroll"
            style={{
              background:
                "linear-gradient(180deg, rgba(0,60,140,1) 0%, rgba(0,30,70,1) 300%)",
            }}
        >
            <h2 className="text-lg font-bold mb-4 text-center">Edit Device</h2>

            <div className="flex flex-col gap-2 text-sm">
              {/* Address Name */}
              <div>
                <label className="block mb-1">Address Name</label>
                <input
                  type="text"
                  value={editRow.address_name}
                  onChange={(e) =>
                    setEditRow({ ...editRow, address_name: e.target.value })
                  }
                  className={`w-full p-2 rounded bg-[#123060] text-white ${
                    errors.address_name ? "" : ""
                  }`}
                />
                {errors.address_name && (
                  <p className="text-red-400 text-xs mt-1">{errors.address_name}</p>
                )}
              </div>

              {/* Detail Address */}
              <div>
                <label className="block mb-1">Detail Address Name</label>
                <input
                  type="text"
                  value={editRow.detail_address_name}
                  onChange={(e) =>
                    setEditRow({ ...editRow, detail_address_name: e.target.value })
                  }
                  className={`w-full p-2 rounded bg-[#123060] text-white ${
                    errors.detail_address_name ? "" : ""
                  }`}
                />
                {errors.detail_address_name && (
                  <p className="text-red-400 text-xs mt-1">
                    {errors.detail_address_name}
                  </p>
                )}
              </div>

              {/* Latitude */}
              <div>
                <label className="block mb-1">Latitude</label>
                <input
                  type="number"
                  step="any"
                  value={editRow.lat}
                  onChange={(e) =>
                    setEditRow({
                      ...editRow,
                      lat: parseFloat(e.target.value),
                    })
                  }
                  className={`w-full p-2 rounded bg-[#123060] text-white ${
                    errors.lat ? "" : ""
                  }`}
                />
                {errors.lat && (
                  <p className="text-red-400 text-xs mt-1">{errors.lat}</p>
                )}
              </div>

              {/* Longitude */}
              <div>
                <label className="block mb-1">Longitude</label>
                <input
                  type="number"
                  step="any"
                  value={editRow.long}
                  onChange={(e) =>
                    setEditRow({
                      ...editRow,
                      long: parseFloat(e.target.value),
                    })
                  }
                  className={`w-full p-2 rounded bg-[#123060] text-white ${
                    errors.long ? "" : ""
                  }`}
                />
                {errors.long && (
                  <p className="text-red-400 text-xs mt-1">{errors.long}</p>
                )}
              </div>

              {/* Segment */}
              <div>
                <label className="block mb-1">Segment</label>
                <input
                  type="text"
                  value={editRow.segment}
                  onChange={(e) =>
                    setEditRow({ ...editRow, segment: e.target.value })
                  }
                  className={`w-full p-2 rounded bg-[#123060] text-white ${
                    errors.segment ? "" : ""
                  }`}
                />
                {errors.segment && (
                  <p className="text-red-400 text-xs mt-1">{errors.segment}</p>
                )}
              </div>

              {/* Map Preview for Edit */}
              {isLoaded && (
                <div className="mt-4">
                  <label className="block mb-1 text-sm font-semibold">Map Preview</label>
                  <div className="w-full h-60 rounded-lg overflow-hidden border border-gray-500">
                    <GoogleMap
                mapContainerStyle={{ width: "100%", height: "100%" }}
                zoom={!Number.isNaN(editRow.lat) && !Number.isNaN(editRow.long) ? 14 : 9}
                center={
                  !Number.isNaN(editRow.lat) && !Number.isNaN(editRow.long)
                    ? { lat: editRow.lat, lng: editRow.long }
                    : { lat: -6.200000, lng: 106.816666 }
                }
                onClick={(e) => {
                  if (!e.latLng) return;
                  const lat = e.latLng.lat();
                  const lng = e.latLng.lng();

                  if (Number.isNaN(editRow.lat) || Number.isNaN(editRow.long)) {
                    setEditRow((prev) => ({ ...prev!, lat, long: lng }));
                    setToastMessage("📍 Location set for the first time.");
                    return;
                  }

                  // tampilkan modal konfirmasi
                  setConfirmEditMove({ lat, lng, type: "click" });
                }}
                options={{
                  disableDefaultUI: false,
                  zoomControl: true,
                  fullscreenControl: true,
                  gestureHandling: "greedy",
                  streetViewControl: false,
                  mapTypeId: "roadmap",
                }}
              >
                {!Number.isNaN(editRow.lat) && !Number.isNaN(editRow.long) && (
                  <Marker
                    position={{ lat: editRow.lat, lng: editRow.long }}
                    title="Device Location"
                    draggable={true}
                    onDragEnd={(e) => {
                      const lat = e.latLng?.lat();
                      const lng = e.latLng?.lng();
                      if (!lat || !lng) return;

                      setConfirmEditMove({ lat, lng, type: "drag" });
                    }}
                  />
                )}
              </GoogleMap>

                  </div>
                  <p className="text-xs text-gray-300 mt-1">
                    Click or drag marker to update device location visually.
                  </p>
                </div>
              )}

            </div>

            <div className="flex justify-end gap-2 mt-10">
              <button
                onClick={() => setEditRow(null)}
                className="px-4 py-1 rounded-full bg-gray-500 hover:bg-gray-600 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveEdit}
                className="px-4 py-1 rounded-full bg-blue-500 hover:bg-blue-600 transition"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}


      {/*============== ADD DEVICE MODAL ==============*/}
      {addDeviceModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/80 z-50">
          <div
            className="rounded-2xl shadow-2xl p-6 max-w-md w-full text-white overflow-y-auto max-h-[94vh] custom-scroll"
            style={{
              background:
                "linear-gradient(180deg, rgba(0,60,140,1) 0%, rgba(0,30,70,1) 300%)",
            }}
        >
            <h2 className="text-lg font-bold mb-4 text-center">Add Device</h2>

            <div className="flex flex-col gap-2 text-sm">
              <div>
                <label className="block mb-1">Serial Number</label>
                <input
                  type="text"
                  value={newDevice.serial_number}
                  onChange={(e) =>
                    setNewDevice({ ...newDevice, serial_number: e.target.value })
                  }
                  className={`w-full p-2 rounded bg-[#123060] text-white ${
                    errors.serial_number ? "" : ""
                  }`}
                />
                {errors.serial_number && (
                  <p className="text-red-400 text-xs mt-1">{errors.serial_number}</p>
                )}
              </div>

              <div>
                <label className="block mb-1">Username (Owner)</label>
                <input
                  type="text"
                  value={newDevice.username}
                  onChange={(e) =>
                    setNewDevice({ ...newDevice, username: e.target.value })
                  }
                  className={`w-full p-2 rounded bg-[#123060] text-white ${
                    errors.username ? "" : ""
                  }`}
                />
                {errors.username && (
                  <p className="text-red-400 text-xs mt-1">{errors.username}</p>
                )}
              </div>

              <div>
                <label className="block mb-1">Address Name</label>
                <input
                  type="text"
                  value={newDevice.address_name}
                  onChange={(e) =>
                    setNewDevice({ ...newDevice, address_name: e.target.value })
                  }
                  className={`w-full p-2 rounded bg-[#123060] text-white ${
                    errors.address_name ? "" : ""
                  }`}
                />
                {errors.address_name && (
                  <p className="text-red-400 text-xs mt-1">{errors.address_name}</p>
                )}
              </div>

              <div>
                <label className="block mb-1">Detail Address Name</label>
                <input
                  type="text"
                  value={newDevice.detail_address_name}
                  onChange={(e) =>
                    setNewDevice({
                      ...newDevice,
                      detail_address_name: e.target.value,
                    })
                  }
                  className={`w-full p-2 rounded bg-[#123060] text-white ${
                    errors.detail_address_name ? "" : ""
                  }`}
                />
                {errors.detail_address_name && (
                  <p className="text-red-400 text-xs mt-1">{errors.detail_address_name}</p>
                )}
              </div>
              <div>
                <label className="block mb-1">Latitude</label>
                <input
                  type="number"
                  step="any"
                  placeholder="-6.2221431"
                  value={Number.isNaN(newDevice.lat) ? "" : newDevice.lat}
                  onChange={(e) =>
                    setNewDevice({
                      ...newDevice,
                      lat: parseFloat(e.target.value),
                    })
                  }
                  className={`w-full p-2 rounded bg-[#123060] text-white ${
                    errors.lat ? "" : ""
                  }`}
                />
                {errors.lat && <p className="text-red-400 text-xs mt-1 ">{errors.lat}</p>}
              </div>
              <div>
                <label className="block mb-1">Longitude</label>
                <input
                  type="number"
                  step="any"
                  placeholder="106.9179941"
                  value={Number.isNaN(newDevice.long) ? "" : newDevice.long}
                  onChange={(e) =>
                    setNewDevice({
                      ...newDevice,
                      long: e.target.value === "" ? NaN : parseFloat(e.target.value),
                    })
                  }
                  className={`w-full p-2 rounded bg-[#123060] text-white ${
                    errors.long ? "" : ""
                  }`}
                />
                {errors.long && (
                  <p className="text-red-400 text-xs mt-1">{errors.long}</p>
                )}
              </div>
              <div>
                <label className="block mb-1">Segment</label>
                <input
                  type="text"
                  value={newDevice.segment}
                  onChange={(e) =>
                    setNewDevice({ ...newDevice, segment: e.target.value })
                  }
                  className={`w-full p-2 rounded bg-[#123060] text-white ${
                    errors.segment ? "" : ""
                  }`}
                />
                {errors.segment && (
                  <p className="text-red-400 text-xs mt-1">{errors.segment}</p>
                )}
              </div>
              
              {isLoaded && (
                <div className="mt-4">
                  <label className="block mb-1 text-sm font-semibold">Map Preview</label>
                  <div className="w-full h-60 rounded-lg overflow-hidden border border-gray-500">
                    <GoogleMap
                      mapContainerStyle={{ width: "100%", height: "100%" }}
                      zoom={!Number.isNaN(newDevice.lat) && !Number.isNaN(newDevice.long) ? 14 : 9}
                      center={
                        !Number.isNaN(newDevice.lat) && !Number.isNaN(newDevice.long)
                          ? { lat: newDevice.lat, lng: newDevice.long }
                          : DEFAULT_LOCATION
                      }
                      onClick={(e) => {
                        if (!e.latLng) return;
                        const lat = e.latLng.lat();
                        const lng = e.latLng.lng();

                        // kalau user belum pernah isi lat long → langsung set tanpa konfirmasi
                        if (Number.isNaN(newDevice.lat) || Number.isNaN(newDevice.long)) {
                          setNewDevice((prev) => ({ ...prev, lat, long: lng }));
                          setToastMessage("📍 Location set for the first time.");
                          return;
                        }

                        // kalau sudah ada lat long sebelumnya → konfirmasi dulu
                        setConfirmMove({ lat, lng, type: "click" });
                      }}
                      options={{
                        disableDefaultUI: true,
                        zoomControl: true,
                        mapTypeId: "roadmap",
                      }}
                    >
                      {!Number.isNaN(newDevice.lat) && !Number.isNaN(newDevice.long) && (
                        <Marker
                          position={{ lat: newDevice.lat, lng: newDevice.long }}
                          title="Device Location"
                          draggable={true}
                          onDragEnd={(e) => {
                            const lat = e.latLng?.lat();
                            const lng = e.latLng?.lng();
                            if (!lat || !lng) return;

                            // sama logika: kalau pertama kali → langsung update, kalau sudah ada → konfirmasi
                            if (Number.isNaN(newDevice.lat) || Number.isNaN(newDevice.long)) {
                              setNewDevice((prev) => ({ ...prev, lat, long: lng }));
                              setToastMessage("📍 Marker set for the first time.");
                            } else {
                              setConfirmMove({ lat, lng, type: "drag" });
                            }
                          }}
                        />
                      )}
                    </GoogleMap>
              </div>
              <p className="text-xs text-gray-300 mt-1">
                Click on the map to select a new location or drag the marker to move its position.
              </p>

                <div>
                  <button
                    type="button"
                    onClick={geocodeAddress}
                    className="mt-1 px-3 py-1 rounded bg-yellow-600 hover:bg-yellow-700 text-xs transition"
                  >
                    🔍 Find Location from Address
                  </button>
                </div>
              </div>
            )}
            </div>

            <div className="flex justify-end gap-2 mt-10">
              <button
                onClick={() => {
                  setAddDeviceModal(false);
                  setNewDevice({
                    id: "",
                    serial_number: "",
                    username: "",
                    wattage: "",
                    phase: "",
                    address_name: "",
                    detail_address_name: "",
                    long: NaN,
                    lat: NaN,
                    segment: "",
                    active: "YES",
                  });
                  setErrors({});
                }}
                className="px-4 py-1 rounded-full bg-gray-500 hover:bg-gray-600 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleAddDevice}
                className="px-4 py-1 rounded-full bg-blue-500 hover:bg-blue-600 transition"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Modal Konfirmasi Pindah Marker */}
      {confirmMove && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/80 z-50">
          <div
            className="rounded-2xl shadow-2xl p-6 max-w-md w-full text-white overflow-y-auto max-h-[94vh] custom-scroll"
            style={{
              background:
                "linear-gradient(180deg, rgba(0,60,140,1) 0%, rgba(0,30,70,1) 300%)",
            }}
        >
            <h2 className="text-lg font-bold mb-2 text-center">
              Confirm {confirmMove.type === "drag" ? "Marker Move" : "Map Click"}
            </h2>
            <p className="text-sm text-center mb-6">
              Do you want to update device location to:
              <br />
              <span className="text-yellow-300">
                Lat: {confirmMove.lat.toFixed(6)}, Lng: {confirmMove.lng.toFixed(6)}
              </span>
            </p>
            <div className="flex justify-center gap-3 mt-6">
              <button
                onClick={() => setConfirmMove(null)}
                className="px-5 py-1 rounded bg-gray-500 hover:bg-gray-600 transition"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  setNewDevice((prev) => ({
                    ...prev,
                    lat: confirmMove.lat,
                    long: confirmMove.lng,
                  }));
                  setConfirmMove(null);
                  setToastMessage("✅ Device location updated successfully!");
                }}
                className="px-5 py-1 rounded bg-blue-600 hover:bg-blue-700 transition"
              >
                Yes, Update
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Konfirmasi Hasil Geocoding */}
      {confirmGeocode && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/80 z-50">
          <div
            className="rounded-2xl shadow-2xl p-6 max-w-md w-full text-white overflow-y-auto max-h-[94vh] custom-scroll"
            style={{
              background:
                "linear-gradient(180deg, rgba(0,60,140,1) 0%, rgba(0,30,70,1) 300%)",
            }}
        >
            <h2 className="text-lg font-bold mb-2">Confirm Geocoded Location</h2>
            <p className="text-sm mb-6">
              System found this location for the entered address:
              <br />
              <span className="text-yellow-300">
                Lat: {confirmGeocode.lat.toFixed(6)}, Lng: {confirmGeocode.lng.toFixed(6)}
              </span>
              <br />
              Do you want to replace your current coordinates with this location?
            </p>
            <div className="flex justify-center gap-3">
              <button
                onClick={() => setConfirmGeocode(null)}
                className="px-5 py-1 rounded bg-gray-500 hover:bg-gray-600 transition"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  setNewDevice((prev) => ({
                    ...prev,
                    lat: confirmGeocode.lat,
                    long: confirmGeocode.lng,
                  }));
                  setConfirmGeocode(null);
                  setToastMessage("✅ Device location updated from address!");
                }}
                className="px-5 py-1 rounded bg-blue-600 hover:bg-blue-700 transition"
              >
                Yes, Update
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Konfirmasi Pindah Marker di Edit */}
      {confirmEditMove && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/80 z-50">
          <div
            className="rounded-2xl shadow-2xl p-6 max-w-md w-full text-white overflow-y-auto max-h-[94vh] custom-scroll"
            style={{
              background:
                "linear-gradient(180deg, rgba(0,60,140,1) 0%, rgba(0,30,70,1) 300%)",
            }}
          >
            <h2 className="text-lg font-bold mb-2 text-center">
              Confirm {confirmEditMove.type === "drag" ? "Marker Move" : "Map Click"}
            </h2>
            <p className="text-sm text-center mb-6">
              Do you want to update <b>device location</b> to:
              <br />
              <span className="text-yellow-300">
                Lat: {confirmEditMove.lat.toFixed(6)}, Lng:{" "}
                {confirmEditMove.lng.toFixed(6)}
              </span>
            </p>
            <div className="flex justify-center gap-3 mt-6">
              <button
                onClick={() => setConfirmEditMove(null)}
                className="px-5 py-1 rounded bg-gray-500 hover:bg-gray-600 transition"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  setEditRow((prev) => ({
                    ...prev!,
                    lat: confirmEditMove.lat,
                    long: confirmEditMove.lng,
                  }));
                  setConfirmEditMove(null);
                  setToastMessage("✅ Device location updated successfully!");
                }}
                className="px-5 py-1 rounded bg-blue-600 hover:bg-blue-700 transition"
              >
                Yes, Update
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast Notification */}
      {toastMessage && (
        <div
          className={`fixed top-6 left-1/2 -translate-x-1/2 px-5 py-2 rounded-lg shadow-lg text-sm animate-fade-in-out z-[9999] ${
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
