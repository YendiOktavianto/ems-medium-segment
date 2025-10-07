"use client";

import { useState, useEffect, useMemo } from "react";
import { FaSearch } from "react-icons/fa";

type Request = {
  id: number;
  username: String;
  address: string;
  segmen: string;
  detail_address: string;
  lat: number;
  lng: number;
  status: string;
};

export default function AdminDeviceRequests(): React.JSX.Element {
  const [tableData, setTableData] = useState<Request[]>([]);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [show, setShow] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(false);

  const fetchRequests = async () => {
    const res = await fetch("/api/device-request");
     const data = await res.json();
    
    const sorted = data.sort((a: Request, b: Request) => b.id - a.id);
    setTableData(sorted);
  };

  useEffect(() => {
    fetchRequests();
    const interval = setInterval(fetchRequests, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleAction = async (id: number, status: string, device_id?: string) => {
    setLoading(true);
    await fetch("/api/device-request", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, status, device_id }),
    });
    await fetchRequests();
    setLoading(false);
  };

  // debounce search
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(timer);
  }, [search]);

  // reset page kalau filter berubah
  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearch, show]);

  const filteredData = useMemo(() => {
    const lowerSearch = debouncedSearch.toLowerCase();
    return tableData.filter((d) => {
      const combined = [
        d.id,
        d.address,
        d.segmen,
        d.detail_address,
        d.lat,
        d.lng,
        d.status,
      ]
        .join(" ")
        .toLowerCase();
      return combined.includes(lowerSearch);
    });
  }, [tableData, debouncedSearch]);

  const paginatedData = useMemo(() => {
    if (show === -1) return filteredData;
    return filteredData.slice((currentPage - 1) * show, currentPage * show);
  }, [filteredData, show, currentPage]);

  const totalPages = show === -1 ? 1 : Math.ceil(filteredData.length / show);

  return (
    <div
      className="rounded-2xl p-4 mx-auto max-w-full mr-8"
      style={{
        background:
          "linear-gradient(180deg, rgba(0,60,140,1) 0%, rgba(0,30,70,1) 100%)",
      }}
    >
      <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-4 gap-2">
        <h1 className="text-xl md:text-2xl font-bold text-white">
          Admin Device Requests
        </h1>
      </div>

      {/* Controls */}
      <div className="grid grid-cols-1 md:grid-cols-2 mb-4 text-white text-xs">
        <div className="flex flex-col">
          <label className="mb-1 font-semibold">Show</label>
          <select
            className="bg-[#123060] p-2 rounded-lg w-20 text-xs"
            value={show}
            onChange={(e) => setShow(Number(e.target.value))}
          >
            <option value={10}>10</option>
            <option value={25}>25</option>
            <option value={50}>50</option>
            <option value={-1}>All</option>
          </select>
        </div>
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
      <div className="overflow-x-auto overflow-y-auto max-h-[310px] rounded-lg shadow-lg custom-scroll">
        <table className="min-w-full text-white text-xs">
          <thead className="bg-[#0C1F3C] border-b border-gray-700 sticky top-0 z-10">
            <tr>
              {["NO", "Username", "Address", "Segmen", "Detail Loc", "coordinate", "Status", "Action"].map(
                (header) => (
                  <th
                    key={header}
                    className="px-4 py-3 text-left font-semibold uppercase tracking-wider"
                  >
                    {header}
                  </th>
                )
              )}
            </tr>
          </thead>
          <tbody>
            {paginatedData.length === 0 ? (
              <tr>
                <td colSpan={7} className="text-center py-3">
                  No data found
                </td>
              </tr>
            ) : (
              paginatedData.map((r, index) => (
                <tr
                  key={r.id}
                  className={`${
                    index % 2 === 0 ? "bg-[#0C1F3C]" : "bg-[#1C345C]"
                  } hover:bg-blue-800 transition`}
                >
                  <td className="px-2 py-1">{r.id}</td>
                  <td className="px-2 py-1">{r.username}</td>
                  <td className="px-2 py-1">{r.address}</td>
                  <td className="px-2 py-1">{r.segmen || "-"}</td>
                  <td className="px-2 py-1">{r.detail_address || "-"}</td>
                  <td className="px-2 py-1">
                    {r.lat}, {r.lng}
                  </td>
                  <td className="px-2 py-1">
                    <span
                      className={
                        r.status === "pending"
                          ? "text-yellow-400"
                          : r.status === "approved"
                          ? "text-green-400 font-bold"
                          : "text-red-400 font-bold"
                      }
                    >
                      {r.status.toUpperCase()}
                    </span>
                  </td>
                  <td className="px-2 py-1">
                    {r.status === "pending" ? (
                      <div className="flex gap-2">
                        {/* ✅ ubah tombol Approve */}
                        <button
                          disabled={loading}
                          onClick={() => {
                            // 🔹 Simpan data request ke localStorage
                            localStorage.setItem("prefillDeviceData", JSON.stringify(r));

                            // 🔹 Redirect ke halaman Device Management
                            window.location.href = "/admin/device-management";
                          }}
                          className="bg-green-500 hover:bg-green-600 px-3 py-1 rounded text-xs text-white"
                        >
                          Approve
                        </button>
                        <button
                          disabled={loading}
                          onClick={() => handleAction(r.id, "rejected")}
                          className="bg-red-500 hover:bg-red-600 px-3 py-1 rounded text-xs text-white"
                        >
                          Reject
                        </button>
                      </div>
                    ) : (
                      "-"
                    )}
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
                ? "bg-gray-400"
                : "bg-gray-600 hover:bg-gray-700 text-white"
            }`}
          >
            Previous
          </button>

          {Array.from({ length: totalPages }, (_, i) => (
            <button
              key={i + 1}
              onClick={() => setCurrentPage(i + 1)}
              className={`px-3 py-1.5 rounded-full ${
                currentPage === i + 1
                  ? "bg-blue-600 text-white"
                  : "bg-gray-600 text-white hover:bg-gray-700"
              }`}
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
                ? "bg-gray-400"
                : "bg-gray-600 hover:bg-gray-700 text-white"
            }`}
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
