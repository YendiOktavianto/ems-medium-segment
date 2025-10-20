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
  voltage: 220,
  current: 4.5,
  frequency: 50,
  cos: 1,
  power: 900,
}));

export default function DataTable() {
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [show, setShow] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [filterDate, setFilterDate] = useState("");
  const [timeFrom, setTimeFrom] = useState("00:00:00");
  const [timeTo, setTimeTo] = useState("23:59:59");

  // debounce search
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(timer);
  }, [search]);

  // reset page saat filter berubah
  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearch, filterDate, timeFrom, timeTo, show]);

  const [selectedLocation, setSelectedLocation] = useState("");

  // filter data
  const filteredData = useMemo(() => {
    return data.filter(
      (d) =>
        (!selectedLocation || d.location_id === selectedLocation) &&
        (!filterDate || d.date === filterDate) &&
        (!timeFrom || d.time >= timeFrom) &&
        (!timeTo || d.time <= timeTo)
    );
  }, [selectedLocation, filterDate, timeFrom, timeTo]);

  // pagination pakai useMemo
  const paginatedData = useMemo(() => {
    if (show === -1) return filteredData; // -1 untuk "All"
    return filteredData.slice((currentPage - 1) * show, currentPage * show);
  }, [filteredData, show, currentPage]);

  const totalPages = show === -1 ? 1 : Math.ceil(filteredData.length / show);

  // export excel
  const exportXLS = async () => {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("PQ Report");

    worksheet.columns = [
      { header: "Data ID", key: "id", width: 12 },
      { header: "Date", key: "date", width: 12 },
      { header: "Time", key: "time", width: 12 },
      { header: "Voltage (V)", key: "voltage", width: 14 },
      { header: "Current (A)", key: "current", width: 14 },
      { header: "Frequency (Hz)", key: "frequency", width: 16 },
      { header: "Cos (φ)", key: "cos", width: 10 },
      { header: "Power (W)", key: "power", width: 12 },
    ];

    filteredData.forEach((item) => worksheet.addRow(item));

    worksheet.getRow(1).eachCell((cell) => {
      cell.font = { color: { argb: "FFFFFFFF" }, bold: true };
      cell.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "FF1E2A4A" },
      };
      cell.alignment = { vertical: "middle", horizontal: "center" };
    });

    worksheet.autoFilter = { from: "A1", to: "H1" };

    const buffer = await workbook.xlsx.writeBuffer();
    saveAs(
      new Blob([buffer], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      }),
      "PQ_Report.xlsx"
    );
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
          PQ Summary Report
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
      <div className="grid grid-cols-1 md:grid-cols-6 gap-4 mb-4 text-white text-xs">
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

        {/* Location */}
        <div className="flex flex-col col-span-2">
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


        {/* Date */}
        <div className="flex flex-col">
          <label className="mb-1 font-semibold">Date</label>
          <input
            type="date"
            className="p-2 rounded-lg bg-[#123060] text-white text-xs w-full"
            value={filterDate}
            onChange={(e) => setFilterDate(e.target.value)}
          />
        </div>

        {/* Time From */}
        <div className="flex flex-col">
          <label className="mb-1 font-semibold">Time From</label>
          <input
            type="time"
            step={1}
            className="p-2 rounded-lg bg-[#123060] text-white text-xs w-full"
            value={timeFrom}
            onChange={(e) => setTimeFrom(e.target.value)}
          />
        </div>

        {/* Time To */}
        <div className="flex flex-col">
          <label className="mb-1 font-semibold">Time To</label>
          <input
            type="time"
            step={1}
            className="p-2 rounded-lg bg-[#123060] text-white text-xs w-full"
            value={timeTo}
            onChange={(e) => setTimeTo(e.target.value)}
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
                "Voltage (V)",
                "Current (A)",
                "Frequency (Hz)",
                "Cos (φ)",
                "Power (W)",
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
                <td colSpan={8} className="text-center py-3">
                  No data found
                </td>
              </tr>
            ) : (
              paginatedData.map((row, index) => (
                <tr
                  key={`${row.id}-${index}`}
                  className={`transition ${
                    index % 2 === 0 ? "bg-[#0C1F3C]" : "bg-[#1C345C]"
                  } hover:bg-blue-800`}
                >
                  <td className="px-2 py-2">{row.id}</td>
                  <td className="px-2 py-2">{row.date}</td>
                  <td className="px-2 py-2">{row.time}</td>
                  <td className="px-2 py-2">{row.voltage}</td>
                  <td className="px-2 py-2">{row.current}</td>
                  <td className="px-2 py-2">{row.frequency}</td>
                  <td className="px-2 py-2">{row.cos}</td>
                  <td className="px-2 py-2">{row.power}</td>
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
