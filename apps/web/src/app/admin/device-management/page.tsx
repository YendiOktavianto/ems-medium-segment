"use client";

import { useState, useEffect, useMemo } from "react";
import ExcelJS from "exceljs";
import { saveAs } from "file-saver";
import { FaFileExcel, FaSearch, FaEdit, FaTrash } from "react-icons/fa";

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

export default function DataTable(): React.JSX.Element {
  const [tableData, setTableData] = useState<DataRow[]>(initialData);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [show, setShow] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);

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

  // simpan edit
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
          Device Management
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
      <div className="grid grid-cols-1 md:grid-cols-2 mb-4 text-white text-xs">
        {/* Show */}
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
      <div className="overflow-x-auto overflow-y-auto max-h-[310px] rounded-lg shadow-lg custom-scroll">
        <table className="min-w-full text-white text-xs">
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
                <td colSpan={9} className="text-center py-3">
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
                  <td className="px-2 py-1">{row.serial_number}</td>
                  <td className="px-2 py-1">{row.username}</td>
                  <td className="px-2 py-1">
                    {row.wattage} / {row.phase}
                  </td>
                  <td className="px-2 py-1">
                    {row.address_name} - {row.detail_address_name}
                  </td>
                  <td className="px-2 py-1">{row.lat}</td>
                  <td className="px-2 py-1">{row.long}</td>
                  <td className="px-2 py-1">{row.segment}</td>
                  <td className="px-2 py-1">{row.active}</td>
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

      {/* Modal Konfirmasi Hapus */}
      {confirmDelete && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/80 z-50">
          <div className="bg-gray-800 rounded-xl shadow-2xl p-6 max-w-sm w-full text-white">
            <h2 className="text-lg font-bold mb-2">Konfirmasi Hapus</h2>
            <p className="text-sm mb-8">
              Are you sure want to delete{" "}
              <b>{confirmDelete.serial_number} {" DEVICE"}</b>{" with owner "} <b>{confirmDelete.username}</b> {" ?"} 
            </p>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setConfirmDelete(null)}
                className="px-6 py-1 rounded bg-gray-500 hover:bg-gray-600 transition"
              >
                Batal
              </button>
              <button
                onClick={() => handleDelete(confirmDelete)}
                className="px-5 py-1 rounded bg-red-600 hover:bg-red-700 transition"
              >
                Hapus
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Edit */}
      {editRow && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/80 z-50">
          <div className="bg-gray-800 rounded-xl shadow-2xl p-6 max-w-md w-full text-white">
            <h2 className="text-lg font-bold mb-4">Edit Device</h2>

            <div className="flex flex-col gap-3 text-sm">
              <div>
                <label className="block mb-1">Address Name</label>
                <input
                  type="text"
                  value={editRow.address_name}
                  onChange={(e) =>
                    setEditRow({ ...editRow, address_name: e.target.value })
                  }
                  className="w-full p-2 rounded bg-[#123060] text-white"
                />
              </div>

              <div>
                <label className="block mb-1">Detail Address Name</label>
                <input
                  type="text"
                  value={editRow.detail_address_name}
                  onChange={(e) =>
                    setEditRow({ ...editRow, detail_address_name: e.target.value })
                  }
                  className="w-full p-2 rounded bg-[#123060] text-white"
                />
              </div>

              <div>
                <label className="block mb-1">Latitute</label>
                <input
                  type="number"
                  value={editRow.lat}
                  onChange={(e) =>
                    setEditRow({ ...editRow, lat:parseFloat(e.target.value) })
                  }
                  className="w-full p-2 rounded bg-[#123060] text-white"
                />
              </div>

              <div>
                <label className="block mb-1">Longtitute</label>
                <input
                  type="number"
                  value={editRow.long}
                  onChange={(e) =>
                    setEditRow({ ...editRow, long: parseFloat(e.target.value) })
                  }
                  className="w-full p-2 rounded bg-[#123060] text-white"
                />
              </div>

              <div>
                <label className="block mb-1">Segment</label>
                <input
                  type="text"
                  value={editRow.segment}
                  onChange={(e) =>
                    setEditRow({ ...editRow, segment: e.target.value })
                  }
                  className="w-full p-2 rounded bg-[#123060] text-white"
                />
              </div>
            </div>
           
            <div className="flex justify-end gap-2 mt-6">
              <button
                onClick={() => setEditRow(null)}
                className="px-6 py-1 rounded bg-gray-500 hover:bg-gray-600 transition"
              >
                Batal
              </button>
              <button
                onClick={handleSaveEdit}
                className="px-5 py-1 rounded bg-blue-600 hover:bg-blue-700 transition"
              >
                Simpan
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
