"use client";

import React, { useState, useEffect, useMemo } from "react";
import ExcelJS from "exceljs";
import { saveAs } from "file-saver";
import { FaFileExcel, FaSearch, FaEdit, FaTrash } from "react-icons/fa";

type DataRow = {
  id: string;
  username: string;
  email: string;
  number_phone: string;
  role: string;
  total_device: number;
  created_at: string;
};

const initialData: DataRow[] = Array.from({ length: 50 }, (_, i) => ({
  id: `${i + 1}`,
  username: `user${i + 1}`,
  email: `user${i + 1}@example.com`,
  number_phone: `08${String(i).padStart(9, "0")}`,
  role: `user`,
  total_device: Math.floor(Math.random() * 10),
  created_at: `2025-08-20 10:${String(i % 60).padStart(2, "0")}:00`,
}));

export default function DataTable(): React.JSX.Element {
  const [tableData, setTableData] = useState<DataRow[]>(initialData);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [show, setShow] = useState<number>(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [filterDate, setFilterDate] = useState("");
  const [timeFrom, setTimeFrom] = useState("00:00:00");
  const [timeTo, setTimeTo] = useState("23:59:59");

  const [confirmDelete, setConfirmDelete] = useState<DataRow | null>(null);
  const [editRow, setEditRow] = useState<DataRow | null>(null);

  // debounce search
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(timer);
  }, [search]);

  // reset page kalau filter berubah
  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearch, filterDate, timeFrom, timeTo, show]);

  // filter data
  const filteredData = useMemo(() => {
    const lowerSearch = debouncedSearch.toLowerCase();

    return tableData.filter((d) => {
      const combined = [
        d.id,
        d.username,
        d.email,
        d.number_phone,
        d.role,
        d.total_device,
        d.created_at,
      ]
        .join(" ")
        .toLowerCase();

      const [createdDate, createdTime] = d.created_at.split(" ");

      return (
        combined.includes(lowerSearch) &&
        (!filterDate || createdDate === filterDate) &&
        (!timeFrom || createdTime >= timeFrom) &&
        (!timeTo || createdTime <= timeTo)
      );
    });
  }, [tableData, debouncedSearch, filterDate, timeFrom, timeTo]);

  // pagination
  const paginatedData = useMemo(() => {
    if (show === -1) return filteredData;
    const start = (currentPage - 1) * show;
    return filteredData.slice(start, start + show);
  }, [filteredData, show, currentPage]);

  const totalPages = show === -1 ? 1 : Math.ceil(filteredData.length / show);

  // export excel
  const exportXLS = async () => {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("User Management");

    worksheet.columns = [
      { header: "ID", key: "id", width: 8 },
      { header: "Username", key: "username", width: 20 },
      { header: "Email", key: "email", width: 25 },
      { header: "Phone Number", key: "number_phone", width: 15 },
      { header: "Role", key: "role", width: 10 },
      { header: "Total Devices", key: "total_device", width: 15 },
      { header: "Created At", key: "created_at", width: 20 },
    ];

    filteredData.forEach((item) =>
      worksheet.addRow({ ...item, number_phone: item.number_phone.toString() })
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

    saveAs(blob, "User_Management.xlsx");
  };

  const handleDelete = (row: DataRow) => {
    setTableData((prev) => prev.filter((item) => item.id !== row.id));
    setConfirmDelete(null);
  };

  const handleSaveEdit = () => {
    if (editRow) {
      setTableData((prev) =>
        prev.map((item) => (item.id === editRow.id ? editRow : item))
      );
      setEditRow(null);
    }
  };

  return (
    <div
      className="rounded-2xl p-4 mx-auto max-w-full mr-8"
      style={{
        background:
          "linear-gradient(180deg, rgba(0,60,140,1) 0%, rgba(0,30,70,1) 100%)",
      }}
    >
      {/* Header */}
      <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-4 gap-2">
        <h1 className="text-xl md:text-2xl font-bold text-white">
          User Management
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
        <div className="flex flex-col">
          <label className="mb-1 font-semibold">Show</label>
          <select
            className="bg-[#123060] p-2 rounded-lg w-13 text-xs"
            value={show}
            onChange={(e) => {
              const value = Number(e.target.value);
              setShow(value === -1 ? -1 : value);
            }}
          >
            <option value={10}>10</option>
            <option value={25}>25</option>
            <option value={50}>50</option>
            <option value={-1}>All</option>
          </select>
        </div>

        <div className="flex flex-col col-span-2">
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

        <div className="flex flex-col">
          <label className="mb-1 font-semibold">Date</label>
          <input
            type="date"
            className="p-2 rounded-lg bg-[#123060] text-white text-xs w-full"
            value={filterDate}
            onChange={(e) => setFilterDate(e.target.value)}
          />
        </div>

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
      <div className="overflow-x-auto overflow-y-auto max-h-[310px] rounded-lg shadow-lg custom-scroll">
        <table className="min-w-full text-white text-xs">
          <thead className="bg-[#0C1F3C] border-b border-gray-700 sticky top-0 z-10">
            <tr>
              {[
                "ID",
                "Username",
                "Email",
                "Number Phone",
                "Role",
                "Total devices",
                "Created At",
                "Actions",
              ].map((header) => (
                <th
                  key={header}
                  scope="col"
                  className="px-4 py-3 text-left font-semibold uppercase tracking-wider"
                >
                  {header}
                </th>
              ))}
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
              paginatedData.map((row, index) => (
                <tr
                  key={`${row.id}-${index}`}
                  className={`transition-colors duration-200 ${
                    index % 2 === 0 ? "bg-[#0C1F3C]" : "bg-[#1C345C]"
                  } hover:bg-blue-800`}
                >
                  <td className="px-2 py-1">{row.id}</td>
                  <td className="px-2 py-1">{row.username}</td>
                  <td className="px-2 py-1">{row.email}</td>
                  <td className="px-2 py-1">{row.number_phone}</td>
                  <td className="px-2 py-1">{row.role}</td>
                  <td className="px-2 py-1">{row.total_device}</td>
                  <td className="px-2 py-1">{row.created_at}</td>
                  <td className="flex gap-2 py-1 px-5">
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

      {/* Modal Delete */}
      {confirmDelete && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/80 z-50">
          <div className="bg-gray-800 rounded-xl shadow-2xl p-6 max-w-sm w-full text-white">
            <h2 className="text-lg font-bold mb-2">Delete Confirmation</h2>
            <p className="text-sm mb-8">
              Are you sure to delete <b>{confirmDelete.username}</b>?
            </p>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setConfirmDelete(null)}
                className="px-6 py-1 rounded bg-gray-500 hover:bg-gray-600 transition"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(confirmDelete)}
                className="px-5 py-1 rounded bg-red-600 hover:bg-red-700 transition"
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
          <div className="rounded-2xl shadow-2xl p-6 max-w-md w-full text-white"            
            style={{
              background:
                "linear-gradient(180deg, rgba(0,60,140,1) 0%, rgba(0,30,70,1) 300%)",
            }}
          >
            <h2 className="text-lg font-bold mb-4 text-center">Edit User</h2>

            <div className="flex flex-col gap-3 text-sm">
              <div>
                <label className="block mb-1">Username</label>
                <input
                  type="text"
                  value={editRow.username}
                  onChange={(e) =>
                    setEditRow({ ...editRow, username: e.target.value })
                  }
                  className="w-full p-2 rounded bg-[#123060] text-white"
                />
              </div>

              <div>
                <label className="block mb-1">Email</label>
                <input
                  type="email"
                  value={editRow.email}
                  onChange={(e) =>
                    setEditRow({ ...editRow, email: e.target.value })
                  }
                  className="w-full p-2 rounded bg-[#123060] text-white"
                />
              </div>

              <div>
                <label className="block mb-1">Phone Number</label>
                <input
                  type="text"
                  value={editRow.number_phone}
                  onChange={(e) =>
                    setEditRow({ ...editRow, number_phone: e.target.value })
                  }
                  className="w-full p-2 rounded bg-[#123060] text-white"
                />
              </div>
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
    </div>
  );
}
