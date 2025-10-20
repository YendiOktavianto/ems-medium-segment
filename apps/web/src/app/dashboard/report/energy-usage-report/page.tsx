"use client";

import { useState, useEffect, useMemo } from "react";
import ExcelJS from "exceljs";
import { saveAs } from "file-saver";
import { FaFileExcel, FaSearch } from "react-icons/fa";

const locations = [
  { id: "loc1", name: "Gedung A" },
  { id: "loc2", name: "Gedung B" },
  { id: "loc3", name: "Gedung C" },
];

const data = Array.from({ length: 50 }, (_, i) => ({
  id: `0000${(i % 10) + 1}`,
  location_id: locations[i % locations.length].id,
  date: "2025-08-20",
  time: `10:19:${String(i % 10).padStart(2, "0")}`,
  energy: 1220,
  cost: 25000,
  mtd_usage_cost: 250000,
}));

export default function DataTable() {
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [show, setShow] = useState(10);
  const [filterDate, setFilterDate] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  // debounce search
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(timer);
  }, [search]);

  // reset page saat filter berubah
  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearch, filterDate, dateFrom, dateTo, show]);

  const [selectedLocation, setSelectedLocation] = useState("");

  // filter data
  const filteredData = useMemo(() => {
    return data.filter(
      (d) =>
        (!selectedLocation || d.location_id === selectedLocation) &&
        (!filterDate || d.date === filterDate) &&
        (!dateFrom || d.time >= dateFrom) &&
        (!dateTo || d.time <= dateTo)
    );
  }, [selectedLocation, filterDate, dateFrom, dateTo]);

  // pagination pakai useMemo
  const paginatedData = useMemo(() => {
    if (show === -1) return filteredData; // -1 untuk "All"
    return filteredData.slice((currentPage - 1) * show, currentPage * show);
  }, [filteredData, show, currentPage]);

  const totalPages = show === -1 ? 1 : Math.ceil(filteredData.length / show);  

  // export to Excel
  const exportXLS = async () => {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Energy Report");

    worksheet.columns = [
      { header: "Data ID", key: "id", width: 12 },
      { header: "Date", key: "date", width: 15 },
      { header: "Time", key: "time", width: 12 },
      { header: "Energy Usage (kWh)", key: "energy", width: 20 },
      { header: "Usage Cost (IDR)", key: "cost", width: 20 },
      { header: "MTD Usage Cost (IDR)", key: "mtd_usage_cost", width: 20 },
    ];

    filteredData.forEach((item) => worksheet.addRow(item));

    worksheet.getRow(1).eachCell((cell) => {
      cell.font = { bold: true, color: { argb: "FFFFFFFF" } };
      cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF1E2A4A" } };
      cell.alignment = { vertical: "middle", horizontal: "center" };
    });

    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });

    saveAs(blob, "Energy_Report.xlsx");
  };

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
          Energy Usage Report
        </h1>
        <button
          onClick={exportXLS}
          className="flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 px-3 py-1.5 rounded-full text-white text-xs transition"
        >
          <FaFileExcel className="text-white text-sm" />
          Export XLS
        </button>
      </div>

      {/* Controls */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4 text-white text-xs">
        {/* Show */}
        <div className="flex flex-col">
          <label className="mb-1 font-semibold">Show</label>
          <select
            value={show}
            onChange={(e) => setShow(Number(e.target.value))}
            className="p-2 rounded-lg bg-[#123060] text-white text-xs w-13"
          >           
            <option value={10}>10</option>
            <option value={25}>25</option>
            <option value={50}>50</option>
            <option value={-1}>All</option>
          </select>
        </div>

        {/* Location */}
        <div className="flex flex-col col-span-1">
          <label className="mb-1 font-semibold">Location</label>
          <select
            className="p-2 rounded-lg bg-[#123060] text-white text-xs w-full"
            value={selectedLocation}
            onChange={(e) => setSelectedLocation(e.target.value)}
          >
            <option value="">All Locations</option>
            {locations.map((loc) => (
              <option key={loc.id} value={loc.id}>
                {loc.name}
              </option>
            ))}
          </select>
        </div>

        {/* Date From */}
        <div className="flex flex-col">
          <label className="mb-1 font-semibold">Date From</label>
          <input
            type="date"
            value={dateFrom}
            onChange={(e) => setDateFrom(e.target.value)}
            className="p-2 rounded-lg bg-[#123060] text-white text-xs w-full"
          />
        </div>

        {/* Date To */}
        <div className="flex flex-col">
          <label className="mb-1 font-semibold">Date To</label>
          <input
            type="date"
            value={dateTo}
            onChange={(e) => setDateTo(e.target.value)}
            className="p-2 rounded-lg bg-[#123060] text-white text-xs w-full"
          />
        </div>
      </div>

      {/* Table */}
      <div className="flex-1 min-h-0 overflow-auto rounded-lg shadow-lg custom-scroll">
        <table className="min-w-full text-white text-xs">
          <thead className="bg-[#0C1F3C] border-b border-gray-700 sticky top-0 z-10">
            <tr>
              {[
                "Data ID",
                "Date",
                "Time",
                "Energy Usage (kWh)",
                "Usage Cost (IDR)",
                "MTD Usage Cost (IDR)",
              ].map((h) => (
                <th
                  key={h}
                  scope="col"
                  className="px-4 py-4 text-left font-semibold uppercase tracking-wider"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {paginatedData.length === 0 ? (
              <tr>
                <td colSpan={6} className="text-center py-6">
                  No data found
                </td>
              </tr>
            ) : (
              paginatedData.map((row, index) => (
                <tr
                  key={row.id}
                  className={
                    index % 2 === 0 ? "bg-[#0C1F3C]" : "bg-[#1C345C]"
                  }
                >
                  <td className="px-2 py-2">{row.id}</td>
                  <td className="px-2 py-2">
                    {new Date(row.date).toLocaleDateString("en-GB")}
                  </td>
                  <td className="px-2 py-2">{row.time}</td>
                  <td className="px-2 py-2">{row.energy}</td>
                  <td className="px-2 py-2">
                    {row.cost.toLocaleString("id-ID")}
                  </td>
                  <td className="px-2 py-2">
                    {row.mtd_usage_cost.toLocaleString("id-ID")}
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
    </div>
  );
}
