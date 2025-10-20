"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import { FaSearch } from "react-icons/fa";

type Request = {
  id: number;
  username: string;
  address: string;
  segmen: string;
  detail_address: string;
  lat: number;
  lng: number;
  status: string; // "pending" | "approved" | "rejected"
};

const API_REQ = "/api/device-request"; // lewat proxy Next.js

export default function AdminDeviceRequests(): React.JSX.Element {
  const [tableData, setTableData] = useState<Request[]>([]);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [show, setShow] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [errMsg, setErrMsg] = useState<string | null>(null);

  const pollTimerRef = useRef<number | null>(null);
  const inflightRef = useRef<AbortController | null>(null);

  async function fetchRequestsOnce(signal?: AbortSignal) {
    setErrMsg(null);
    try {
      const res = await fetch(API_REQ, { cache: "no-store", signal });
      if (!res.ok) {
        const text = await res.text().catch(() => "");
        throw new Error(`GET ${API_REQ} -> ${res.status} ${text}`);
      }
      const text = await res.text();
      const data: Request[] = text ? JSON.parse(text) : [];
      const sorted = (Array.isArray(data) ? data : []).sort((a, b) => b.id - a.id);
      setTableData(sorted);
    } catch (e: any) {
      if (e?.name === "AbortError") return;
      console.error("fetchRequests error:", e);
      setErrMsg("Gagal memuat data request. Cek server /api/device-request.");
    }
  }

  const startPolling = () => {
    if (pollTimerRef.current) window.clearInterval(pollTimerRef.current);
    pollTimerRef.current = window.setInterval(() => {
      if (document.visibilityState === "visible") {
        inflightRef.current?.abort();
        const c = new AbortController();
        inflightRef.current = c;
        fetchRequestsOnce(c.signal);
      }
    }, 5000);
  };

  useEffect(() => {
    const c = new AbortController();
    inflightRef.current = c;
    fetchRequestsOnce(c.signal);
    startPolling();

    const onVis = () => {
      if (document.visibilityState === "visible") {
        inflightRef.current?.abort();
        const c2 = new AbortController();
        inflightRef.current = c2;
        fetchRequestsOnce(c2.signal);
      }
    };
    document.addEventListener("visibilitychange", onVis);

    return () => {
      document.removeEventListener("visibilitychange", onVis);
      if (pollTimerRef.current) window.clearInterval(pollTimerRef.current);
      inflightRef.current?.abort();
    };
  }, []);

  const handleAction = async (id: number, status: string, device_id?: string) => {
    setLoading(true);
    setErrMsg(null);
    try {
      const res = await fetch(API_REQ, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status, device_id }),
      });
      if (!res.ok) {
        const text = await res.text().catch(() => "");
        throw new Error(`PATCH ${API_REQ} -> ${res.status} ${text}`);
      }
      await fetchRequestsOnce();
    } catch (e: any) {
      console.error("handleAction error:", e);
      setErrMsg("Aksi gagal. Cek route PATCH di backend.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = window.setTimeout(() => setDebouncedSearch(search), 300);
    return () => window.clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearch, show]);

  const filteredData = useMemo(() => {
    const lower = debouncedSearch.toLowerCase();
    return tableData.filter((d) => {
      const combined = [
        d.id,
        d.username,
        d.address,
        d.segmen,
        d.detail_address,
        d.lat,
        d.lng,
        d.status,
      ]
        .join(" ")
        .toLowerCase();
      return combined.includes(lower);
    });
  }, [tableData, debouncedSearch]);

  const paginatedData = useMemo(() => {
    if (show === -1) return filteredData;
    return filteredData.slice((currentPage - 1) * show, currentPage * show);
  }, [filteredData, show, currentPage]);

  const totalPages = show === -1 ? 1 : Math.max(1, Math.ceil(filteredData.length / show));
  const rowNumber = (indexInPage: number) =>
    show === -1 ? indexInPage + 1 : (currentPage - 1) * show + indexInPage + 1;

  return (
    <div
      className="
        flex flex-col mx-auto sm:mr-8 rounded-2xl
        box-border
        h-[84dvh] max-h-[100dvh]
        overflow-hidden
        p-5 sm:p-4
        pb-[max(env(safe-area-inset-bottom),12px)]
      "
      style={{
        background: "linear-gradient(180deg, rgba(0,60,140,1) 0%, rgba(0,30,70,1) 100%)",
      }}
    >
      <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-4 gap-2">
        <h1 className="text-xl md:text-2xl font-bold text-white">Admin Device Requests</h1>
        {errMsg && (
          <div className="text-xs px-3 py-1 rounded bg-red-600/80 text-white border border-red-300/40">
            {errMsg}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 mb-4 text-white text-xs">
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

      <div className="flex-1 min-h-0 overflow-auto rounded-lg shadow-lg custom-scroll">
        <table className="min-w-full text-white text-xs">
          <thead className="bg-[#0C1F3C] border-b border-gray-700 sticky top-0 z-10">
            <tr>
              {["NO", "Username", "Address", "Segmen", "Detail Loc", "Coordinate", "Status", "Action"].map(
                (header) => (
                  <th key={header} className="px-4 py-4 text-left font-semibold uppercase tracking-wider">
                    {header}
                  </th>
                )
              )}
            </tr>
          </thead>
          <tbody>
            {paginatedData.length === 0 ? (
              <tr>
                <td colSpan={8} className="text-center py-6">
                  No data found
                </td>
              </tr>
            ) : (
              paginatedData.map((r, index) => (
                <tr
                  key={r.id}
                  className={`${index % 2 === 0 ? "bg-[#0C1F3C]" : "bg-[#1C345C]"} hover:bg-blue-800 transition`}
                >
                  <td className="px-2 py-2">{rowNumber(index)}</td>
                  <td className="px-2 py-2">{r.username || "-"}</td>
                  <td className="px-2 py-2">{r.address}</td>
                  <td className="px-2 py-2">{r.segmen || "-"}</td>
                  <td className="px-2 py-2">{r.detail_address || "-"}</td>
                  <td className="px-2 py-2">
                    {r.lat?.toFixed ? r.lat.toFixed(5) : r.lat}, {r.lng?.toFixed ? r.lng.toFixed(5) : r.lng}
                  </td>
                  <td className="px-2 py-2">
                    <span
                      className={
                        r.status === "pending"
                          ? "text-yellow-300"
                          : r.status === "approved"
                          ? "text-green-300 font-semibold"
                          : "text-red-300 font-semibold"
                      }
                    >
                      {r.status?.toUpperCase?.() || "PENDING"}
                    </span>
                  </td>
                  <td className="px-2 py-1">
                    {r.status === "pending" ? (
                      <div className="flex gap-2">
                        <button
                          disabled={loading}
                          onClick={() => {
                            localStorage.setItem("prefillDeviceData", JSON.stringify(r));
                            window.location.href = "/admin/device-management";
                          }}
                          className="bg-green-500 hover:bg-green-600 px-3 py-1 rounded text-xs text-white disabled:opacity-50"
                        >
                          Approve
                        </button>
                        <button
                          disabled={loading}
                          onClick={() => handleAction(r.id, "rejected")}
                          className="bg-red-500 hover:bg-red-600 px-3 py-1 rounded text-xs text-white disabled:opacity-50"
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

      {show !== -1 && (
        <div className="flex justify-center mt-4 gap-1 flex-wrap text-xs">
          <button
            disabled={currentPage === 1}
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            className={`px-3 py-1.5 rounded-full ${
              currentPage === 1 ? "bg-gray-400" : "bg-gray-600 hover:bg-gray-700 text-white"
            }`}
          >
            Previous
          </button>

          {Array.from({ length: totalPages }, (_, i) => (
            <button
              key={i + 1}
              onClick={() => setCurrentPage(i + 1)}
              className={`px-3 py-1.5 rounded-full ${
                currentPage === i + 1 ? "bg-blue-600 text-white" : "bg-gray-600 text-white hover:bg-gray-700"
              }`}
            >
              {i + 1}
            </button>
          ))}

          <button
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
            className={`px-3 py-1.5 rounded-full ${
              currentPage === totalPages ? "bg-gray-400" : "bg-gray-600 hover:bg-gray-700 text-white"
            }`}
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
