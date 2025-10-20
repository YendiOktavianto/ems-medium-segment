"use client";

import React, { useState, useEffect, useMemo, type FormEvent } from "react";
import ExcelJS from "exceljs";
import { saveAs } from "file-saver";
import { FaFileExcel, FaSearch, FaPlus } from "react-icons/fa";

type DataRow = {
  id: string;
  date: string;
  time: string;
  voltage: number;
  current: number;
  frequency: number;
  cos: number;
  power: number;
  phase: string;
  cost: number;
  validFrom: string;
  validUntil: string;
};

const initialData: DataRow[] = Array.from({ length: 50 }, (_, i) => ({
  id: `0000${(i % 10) + 1}`,
  date: "2025-08-20",
  time: `10:19:${String(i % 10).padStart(2, "0")}`,
  voltage: 220,
  current: 4.5,
  frequency: 50,
  cos: 1,
  power: 900 + (i % 5) * 100,
  cost: 1200 + i * 10,
  validFrom: "2025-08-20 10:00:00",
  validUntil: "2025-08-20 18:00:00",
  phase: i % 2 === 0 ? "1 Phase" : "3 Phase",
}));

export default function DataTable(): React.JSX.Element {
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [show, setShow] = useState<number>(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [filterDate, setFilterDate] = useState("");
  const [timeFrom, setTimeFrom] = useState("00:00:00");
  const [timeTo, setTimeTo] = useState("23:59:59");
  const [showAddModal, setShowAddModal] = useState(false);
  const [tableData, setTableData] = useState<DataRow[]>(initialData);

  // form state
  const [newPower, setNewPower] = useState<string>("");
  const [newCost, setNewCost] = useState<string>("");
  const [newValidFrom, setNewValidFrom] = useState<string>("");
  const [newValidUntil, setNewValidUntil] = useState<string>("");

  // debounce search
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(timer);
  }, [search]);

  // reset page saat filter berubah
  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearch, filterDate, timeFrom, timeTo, show]);

  // filter data
  const filteredData = useMemo(() => {
    return tableData.filter(
      (d) =>
        `${d.power} / ${d.phase}`.includes(debouncedSearch) &&
        (!filterDate || d.date === filterDate) &&
        (!timeFrom || d.time >= timeFrom) &&
        (!timeTo || d.time <= timeTo)
    );
  }, [debouncedSearch, filterDate, timeFrom, timeTo, tableData]);

  // pagination
  const paginatedData = useMemo(() => {
    if (show === -1) return filteredData;
    return filteredData.slice((currentPage - 1) * show, currentPage * show);
  }, [filteredData, show, currentPage]);

  const totalPages =
    show === -1 ? 1 : Math.max(1, Math.ceil(filteredData.length / show));

  const exportXLS = async () => {
    try {
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet("List Cost Energy");

      worksheet.columns = [
        { header: "Wattage/Phase", key: "powerPhase", width: 20 },
        { header: "Cost (Rupiah)", key: "cost", width: 15 },
        { header: "valid from", key: "validFrom", width: 20 },
        { header: "valid until", key: "validUntil", width: 20 },
      ];

      filteredData.forEach((item) =>
        worksheet.addRow({
          powerPhase: `${item.power} / ${item.phase}`,
          cost: item.cost,
          validFrom: item.validFrom,
          validUntil: item.validUntil,
        })
      );

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

      saveAs(blob, "List_Cost_Energy.xlsx");
    } catch (err) {
      console.error("export error:", err);
      alert("gagal export: lihat console untuk detail");
    }
  };

  const handleAddNewData = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!newPower) {
      alert("pilih wattage/phase terlebih dahulu");
      return;
    }

    // pecah string "900 / 1 Phase"
    const [powerStr, phaseStr] = newPower.split(" / ");
    const powerNum = Number(powerStr.trim());
    const costNum = Number(newCost);

    if (isNaN(powerNum) || isNaN(costNum)) {
      alert("wattage atau cost tidak valid");
      return;
    }
    if (!newValidFrom || !newValidUntil) {
      alert("isi valid from dan valid until");
      return;
    }

    const newEntry: DataRow = {
      id: `NEW${tableData.length + 1}`,
      date: new Date().toISOString().split("T")[0],
      time: new Date().toLocaleTimeString("en-GB"),
      voltage: 220,
      current: 0,
      frequency: 50,
      cos: 1,
      power: powerNum,
      phase: phaseStr.trim(),
      cost: costNum,
      validFrom: newValidFrom,
      validUntil: newValidUntil,
    };

    setTableData([newEntry, ...tableData]);
    setShowAddModal(false);

    setNewPower("");
    setNewCost("");
    setNewValidFrom("");
    setNewValidUntil("");
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
          List Cost Energy
        </h1>
        <div className="flex flex-row gap-2">
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 px-3 py-0.5 rounded-full text-white text-xs transition"
          >
            <FaPlus className="text-sm" />
            Update Data
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
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-4 text-white text-xs">
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

        {/* Wattage/Phase search */}
        <div className="flex flex-col">
          <label className="mb-1 font-semibold">Wattage/Phase</label>
          <div className="relative">
            <FaSearch className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-300 text-xs" />
            <input
              type="text"
              placeholder="Search Wattage/Phase"
              className="p-2 pl-8 rounded-lg bg-[#123060] text-white w-full text-xs"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
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
                "Wattage/Phase",
                "Cost (Rupiah)",
                "valid from",
                "valid until",
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
                <td colSpan={4} className="text-center py-6">
                  No data found
                </td>
              </tr>
            ) : (
              paginatedData.map((row, index) => (
                <tr
                  key={`${row.id}-${index}`}
                  className={`transition ${
                    index % 2 === 0
                      ? "bg-[#0C1F3C]"
                      : "bg-[#1C345C]"
                  } hover:bg-blue-800`}
                >
                  <td className="px-2 py-2">{`${row.power} / ${row.phase}`}</td>
                  <td className="px-2 py-2">{row.cost}</td>
                  <td className="px-2 py-2">{row.validFrom}</td>
                  <td className="px-2 py-2">{row.validUntil}</td>
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
            onClick={() =>
              setCurrentPage((prev) => Math.max(prev - 1, 1))
            }
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

      {/* Modal Add New Data */}
      {showAddModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/80 z-50">
          <div
            className="rounded-2xl p-6 w-96 text-white"
            style={{
              background:
                "linear-gradient(180deg, rgba(0,60,140,1) 0%, rgba(0,30,70,1) 300%)",
            }}
          >
            <h2 className="text-lg font-bold mb-4 text-center">Add New Data</h2>
            <form
              className="flex flex-col gap-2 text-sm"
              onSubmit={handleAddNewData}
            >
              <div>
                {/* dropdown wattage */}
                <label className="block mb-1">Wattage/Phase</label>
                <select
                  className="w-full p-2 rounded bg-[#123060] text-white"
                  value={newPower}
                  onChange={(e) => setNewPower(e.target.value)}
                  required
                >
                  <option value="">-- Select Wattage/Phase --</option>
                  {[
                    ...new Set(
                      tableData.map((row) => `${row.power} / ${row.phase}`)
                    ),
                  ].map((wp) => (
                    <option key={wp} value={wp}>
                      {wp}
                    </option>
                  ))}
                </select>
              </div>  
              
              <div>
                <label className="block mb-1">Cost (Rupiah)</label>
                <input
                  type="number"
                  placeholder="Cost (Rupiah)"
                  className="w-full p-2 rounded bg-[#123060] text-white"
                  value={newCost}
                  onChange={(e) => setNewCost(e.target.value)}
                  required
                />
              </div>

              <div>
                <label className="block mb-1">Date from</label>
                <input
                  type="datetime-local"
                  className="w-full p-2 rounded bg-[#123060] text-white"
                  value={newValidFrom}
                  onChange={(e) => setNewValidFrom(e.target.value)}
                  required
                />
              </div>

              <div className="flex justify-end gap-2 mt-10">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-1 rounded-full bg-gray-500 hover:bg-gray-600 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1 rounded-full bg-blue-500 hover:bg-blue-600 transition"
                >
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
