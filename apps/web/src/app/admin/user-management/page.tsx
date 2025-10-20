"use client";

import React, { useState, useEffect, useMemo } from "react";
import ExcelJS from "exceljs";
import { saveAs } from "file-saver";
import { FaFileExcel, FaSearch, FaEdit, FaTrash, FaPlus } from "react-icons/fa";
import PhoneInput from "react-phone-input-2";

// ---------- TIPE DATA ----------
type DataRow = {
  id: string;
  username: string;
  email: string;
  phone_number: string;
  password: string;
  confirmPassword: string;
  role: string;
  total_device: number;
  created_at: string;
};

const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/+$/, "") ||
  "http://localhost:4000";

// helper ambil token (opsional)
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
  // ---------- STATE DASAR ----------
  const [tableData, setTableData] = useState<DataRow[]>(() =>
    Array.from({ length: 50 }, (_, i) => ({
      id: `${i + 1}`,
      username: `user${i + 1}`,
      email: `user${i + 1}@example.com`,
      phone_number: `08${String(i).padStart(9, "0")}`,
      password: "",
      confirmPassword: "",
      role: `user`,
      total_device: Math.floor(Math.random() * 10),
      created_at: `2025-08-20 10:${String(i % 60).padStart(2, "0")}:00`,
    }))
  );

  // ---------- STATE LAIN ----------
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [show, setShow] = useState<number>(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [filterDate, setFilterDate] = useState("");
  const [timeFrom, setTimeFrom] = useState("00:00:00");
  const [timeTo, setTimeTo] = useState("23:59:59");

  const [confirmDelete, setConfirmDelete] = useState<DataRow | null>(null);

  // Modal ADD
  const [addUserModal, setAddUserModal] = useState(false);
  const [newUser, setNewUser] = useState<Omit<DataRow, "id" | "created_at">>({
    username: "",
    email: "",
    phone_number: "",
    password: "",
    confirmPassword: "",
    role: "user",
    total_device: 0,
  });

  // Modal EDIT
  const [editRow, setEditRow] = useState<DataRow | null>(null);
  const [editModal, setEditModal] = useState(false);
  const [editDraft, setEditDraft] = useState<Omit<
    DataRow,
    "id" | "created_at" | "password" | "confirmPassword"
  > | null>(null);

  // status kecil (tanpa ubah desain utama)
  const [submittingAdd, setSubmittingAdd] = useState(false);
  const [submittingEdit, setSubmittingEdit] = useState(false);
  const [apiError, setApiError] = useState<string>("");

  // ---------- DEBOUNCE SEARCH ----------
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearch, filterDate, timeFrom, timeTo, show]);

  // ---------- FILTER DATA ----------
  const filteredData = useMemo(() => {
    const lowerSearch = debouncedSearch.toLowerCase();

    return tableData.filter((d) => {
      const combined = [
        d.id,
        d.username,
        d.email,
        d.phone_number,
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

  // ---------- PAGINATION ----------
  const paginatedData = useMemo(() => {
    if (show === -1) return filteredData;
    const start = (currentPage - 1) * show;
    return filteredData.slice(start, start + show);
  }, [filteredData, show, currentPage]);

  const totalPages = show === -1 ? 1 : Math.ceil(filteredData.length / show);

  // ---------- EXPORT KE EXCEL ----------
  const exportXLS = async () => {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("User Management");

    worksheet.columns = [
      { header: "ID", key: "id", width: 8 },
      { header: "Username", key: "username", width: 20 },
      { header: "Email", key: "email", width: 25 },
      { header: "Phone Number", key: "phone_number", width: 15 },
      { header: "Role", key: "role", width: 10 },
      { header: "Total Devices", key: "total_device", width: 15 },
      { header: "Created At", key: "created_at", width: 20 },
    ];

    filteredData.forEach((item) =>
      worksheet.addRow({ ...item, phone_number: item.phone_number.toString() })
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

  // =========================
  // ====== CALL API =========
  // =========================

  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  // ADD (POST /users)
  const addUserToAPI = async (payload: Omit<DataRow, "id" | "created_at">) => {
    const res = await fetch(`${API_BASE}/users`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...getAuthHeaders(),
      },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const msg = await safeErrorMessage(res);
      throw new Error(msg || `Failed to create user (${res.status})`);
    }
    // asumsi backend mengembalikan user baru lengkap (termasuk id & created_at)
    const data = (await res.json()) as DataRow | (Partial<DataRow> & { id: string });
    return data;
  };

  // UPDATE (PATCH /users/:id)
  const updateUserToAPI = async (
    id: string,
    payload: Partial<
      Omit<DataRow, "id" | "created_at" | "password" | "confirmPassword">
    > & { password?: string }
  ) => {
    const res = await fetch(`${API_BASE}/users/${id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        ...getAuthHeaders(),
      },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const msg = await safeErrorMessage(res);
      throw new Error(msg || `Failed to update user (${res.status})`);
    }
    const data = (await res.json()) as Partial<DataRow>;
    return data;
  };

  const safeErrorMessage = async (res: Response) => {
    try {
      const t = await res.text();
      try {
        const j = JSON.parse(t);
        return j?.message || j?.error || t;
      } catch {
        return t;
      }
    } catch {
      return "";
    }
  };

  // ---------- DELETE USER (LOCAL SAJA; kalau butuh API tinggal ganti di sini) ----------
  const handleDelete = (row: DataRow) => {
    setTableData((prev) => prev.filter((item) => item.id !== row.id));
    setConfirmDelete(null);
  };

  // ---------- ADD USER ----------
  const handleAddUser = async () => {
    const errors: Record<string, string> = {};
    
    if (!newUser.email) {
      errors.email = "email is required";
    } else if (newUser.email.length > 100) {
      errors.email = "email must not exceed 100 characters";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(newUser.email)) {
      errors.email = "please enter a valid email address";
    } else {
      // lebih detail sesuai backend
      const parts = newUser.email.split("@");
      if (parts.length !== 2) {
        errors.email = "email must contain one @ character";
      } else {
        const [local, domain] = parts;
        if (!/^[A-Za-z0-9._+~-]+$/.test(local)) {
          errors.email = "email local part contains invalid characters";
        }
        const domainRegex =
          /^(?!-)(?:[A-Za-z0-9](?:[A-Za-z0-9-]{0,61}[A-Za-z0-9])?)(?:\.(?!-)(?:[A-Za-z0-9](?:[A-Za-z0-9-]{0,61}[A-Za-z0-9])?))*\.[A-Za-z]{2,}$/;
        if (!domainRegex.test(domain)) {
          errors.email = "email domain is invalid";
        }
      }
    }

    // username (frontend samain rules backend tapi error message dipisah)
    if (!newUser.username.trim()) errors.username = "username is required";
    else if (newUser.username.length < 8) {
      errors.username = "username must be at least 8 characters";
    } else if (newUser.username.length > 30) {
      errors.username = "username must be at most 30 characters";
    } else if (/\s/.test(newUser.username)) {
      errors.username = "username cannot contain spaces";
    } else if (!/^[A-Z]/.test(newUser.username)) {
      errors.username = "username must start with an uppercase letter";
    } else if (!/^[A-Z][A-Za-z0-9_.\-@!#$%^&*]+$/.test(newUser.username)) {
      errors.username =
        "username can only contain letters, numbers, and special characters . _ - @ ! # $ % ^ & *";
    }

    if (!newUser.phone_number) {
      errors.phone_number = "phone number is required";
    } else if (!/^\+628\d{8,15}$/.test(newUser.phone_number)) {
      if (!newUser.phone_number.startsWith("+628")) {
        errors.phone_number = "phone number must start with +628";
      } else if (newUser.phone_number.length < 10) {
        errors.phone_number = "phone number is too short (min 10 chars)";
      } else if (newUser.phone_number.length > 16) {
        errors.phone_number = "phone number is too long (max 16 chars)";
      } else {
        errors.phone_number = "invalid Indonesian phone number format";
      }
    }

    // -------- PASSWORD ----------
    if (!newUser.password) {
      errors.password = "password is required";
    } else if (newUser.password.length < 8) {
      errors.password = "password must be at least 8 characters";
    } else if (newUser.password.length > 20) {
      errors.password = "password must be at most 20 characters";
    } else if (!/[A-Z]/.test(newUser.password)) {
      errors.password = "password must include at least one uppercase letter";
    } else if (!/[a-z]/.test(newUser.password)) {
      errors.password = "password must include at least one lowercase letter";
    } else if (!/\d/.test(newUser.password)) {
      errors.password = "password must include at least one number";
    } else if (!/[^A-Za-z0-9]/.test(newUser.password)) {
      errors.password = "password must include at least one special character";
    } else if (/(0123|1234|2345|3456|4567|5678|6789)/.test(newUser.password)) {
      errors.password = "password must not contain sequential numbers";
    } else {
      const lc = newUser.password.toLowerCase();
      if (["password", "qwerty", "12345", "123456", "abc123", "tanggal"].some((p) => lc.includes(p))) {
        errors.password = "password must not contain common patterns";
      }
      if (/\b(?:\d{2}[-/]?\d{2}[-/]?\d{4}|\d{4}[-/]?\d{2}[-/]?\d{2})\b/.test(newUser.password)) {
        errors.password = "password must not contain dates";
      }
    }

    if (!newUser.confirmPassword) errors.confirmPassword = "confirm password is required";
    else if (newUser.confirmPassword !== newUser.password)
      errors.confirmPassword = "confirm password does not match";

    setFormErrors(errors);
    if (Object.keys(errors).length > 0) return; 

    // lanjut kirim ke backend...
    setApiError("");
    setSubmittingAdd(true);
    try {
      const created = await addUserToAPI(newUser);
      if (created && created.id) {
        const normalized: DataRow = {
          id: String(created.id),
          username: created.username ?? newUser.username,
          email: created.email ?? newUser.email,
          phone_number: created.phone_number ?? newUser.phone_number,
          password: "",
          confirmPassword: "",
          role: created.role ?? newUser.role,
          total_device: (created as any).total_device ?? newUser.total_device,
          created_at:
            (created as any).created_at ??
            new Date().toISOString().replace("T", " ").slice(0, 19),
        };
        setTableData((prev) => [normalized, ...prev]);
      }
      setAddUserModal(false);
      setNewUser({
        username: "",
        email: "",
        phone_number: "",
        password: "",
        confirmPassword: "",
        role: "user",
        total_device: 0,
      });
      setFormErrors({});
    } catch (err: any) {
      const msg = err?.message || "Failed to update user";
      if (msg.includes("email")) setFormErrors({ email: msg });
      else if (msg.includes("username")) setFormErrors({ username: msg });
      else setApiError(msg);
    } finally {
      setSubmittingAdd(false);
    }
  };

  // ---------- OPEN EDIT MODAL ----------
  const openEdit = (row: DataRow) => {
    setEditRow(row);
    setEditDraft({
      username: row.username,
      email: row.email,
      phone_number: row.phone_number,
      role: row.role,
      total_device: row.total_device,
    });
    setApiError("");
    setEditModal(true);
  };

  // ---------- SAVE EDIT ----------
  const handleSaveEdit = async () => {
    if (!editRow || !editDraft) return;
    setSubmittingEdit(true);
    setApiError("");

    try {
      const payload = {
        username: editDraft.username,
        email: editDraft.email,
        phone_number: editDraft.phone_number,
        role: editDraft.role,
        total_device: editDraft.total_device,
      };

      const updated = await updateUserToAPI(editRow.id, payload);

      // merge ke tabel
      setTableData((prev) =>
        prev.map((item) =>
          item.id === editRow.id
            ? {
                ...item,
                ...payload,
                ...updated, // jika backend mengembalikan field tambahan
              }
            : item
        )
      );

      setEditModal(false);
      setEditRow(null);
      setEditDraft(null);
    } catch (err: any) {
      setApiError(err?.message || "Failed to update user");
    } finally {
      setSubmittingEdit(false);
    }
  };

  useEffect(() => {
    if (addUserModal && !newUser.phone_number) {
      setNewUser((prev) => ({ ...prev, phone_number: "+62" }));
    }
  }, [addUserModal]);


  // ---------- RENDER ----------
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
      {/* ---------- HEADER ---------- */}
      <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-4 gap-2">
        <h1 className="text-xl md:text-2xl font-bold text-white">
          User Management
        </h1>
        <div className="flex gap-2">
          <button
            onClick={() => setAddUserModal(true)}
            className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 px-3 py-1.5 rounded-full text-white text-xs transition"
          >
            <FaPlus /> Add User
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

      {/* ---------- FILTER DAN CONTROL (TIDAK DIUBAH) ---------- */}
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

      {/* ---------- TABLE ---------- */}
      <div className="flex-1 min-h-0 overflow-auto rounded-lg shadow-lg custom-scroll">
        <table className="min-w-full text-white text-xs">
          <thead className="bg-[#0C1F3C] border-b border-gray-700 sticky top-0 z-10">
            <tr>
              {[
                "ID",
                "Username",
                "Email",
                "Number Phone",
                "Role",
                "Total Devices",
                "Created At",
                "Actions",
              ].map((header) => (
                <th
                  key={header}
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
                <td colSpan={8} className="text-center py-6">
                  No data found
                </td>
              </tr>
            ) : (
              paginatedData.map((row, index) => (
                <tr
                  key={row.id}
                  className={`transition-colors ${
                    index % 2 === 0 ? "bg-[#0C1F3C]" : "bg-[#1C345C]"
                  } hover:bg-blue-800`}
                >
                  <td className="px-2 py-2">{row.id}</td>
                  <td className="px-2 py-2">{row.username}</td>
                  <td className="px-2 py-2">{row.email}</td>
                  <td className="px-2 py-2">{row.phone_number}</td>
                  <td className="px-2 py-2">{row.role}</td>
                  <td className="px-2 py-2">{row.total_device}</td>
                  <td className="px-2 py-2">{row.created_at}</td>
                  <td className="flex gap-2 py-2 px-5">
                    <button
                      className="p-1 bg-blue-600 hover:bg-blue-700 rounded-sm text-white"
                      onClick={() => openEdit(row)}
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

      {/* ---------- PAGINATION ---------- */}
      {show !== -1 && (
        <div className="flex justify-center mt-4 gap-1 flex-wrap text-xs">
          <button
            disabled={currentPage === 1}
            onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
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
            onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
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

      {/* ---------- MODAL ADD USER ---------- */}
      {addUserModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/80 z-50">
          <div
            className="rounded-2xl shadow-2xl p-6 max-w-md w-full text-white overflow-y-auto max-h-[94vh] custom-scroll"
            style={{
              background:
                "linear-gradient(180deg, rgba(0,60,140,1) 0%, rgba(0,30,70,1) 300%)",
            }}
          >
            <h2 className="text-lg font-bold mb-4 text-center">
              Add New User
            </h2>

            {/* error kecil dari API (tidak ubah layout utama) */}
            {apiError && (
              <p className="text-red-300 text-xs mb-2">{apiError}</p>
            )}

            <div className="flex flex-col gap-3 text-sm">
              <div>
                <label className="block mb-1">Username</label>
                <input
                  type="text"
                  value={newUser.username}
                  onChange={(e) =>
                    setNewUser({ ...newUser, username: e.target.value })
                  }
                  className="w-full p-2 rounded bg-[#123060] text-white"
                />
                 {formErrors.username && (
                    <p className="text-red-400 text-xs mt-1">{formErrors.username}</p>
                  )}
              </div>
              <div>
                <label className="block mb-1">Email</label>
                <input
                  type="email"
                  value={newUser.email}
                  onChange={(e) =>
                    setNewUser({ ...newUser, email: e.target.value })
                  }
                  className="w-full p-2 rounded bg-[#123060] text-white"
                />
                {formErrors.email && (
                  <p className="text-red-400 text-xs mt-1">{formErrors.email}</p>
                )}
              </div>
              {/* phone */}
              <div>
                <label className="block mb-1">Number Phone</label>
                <div className="w-full p-2 rounded bg-[#123060] text-white">
                  <PhoneInput
                    country={"id"}
                    value={newUser.phone_number}
                    onChange={(phone) => {
                      // Pastikan awalan "+62"
                      let formatted = phone.startsWith("+62")
                        ? phone
                        : "+62" + phone.replace(/^(\+|0|62)+/, "");
                      setNewUser({ ...newUser, phone_number: formatted }); 
                    }}
                    onKeyDown={(e) => {
                      // Blok user menghapus awalan +62
                      const input = e.currentTarget as HTMLInputElement;
                      if (
                        (input.selectionStart ?? 0) <= 3 &&
                        (e.key === "Backspace" || e.key === "Delete")
                      ) {
                        e.preventDefault();
                      }
                    }}
                    inputClass="!bg-transparent !outline-none !w-full !placeholder-gray-400 !h-4 !pl-11 !text-sm !text-white"
                    buttonClass="!bg-transparent !border-none !h-5 !ml-[-3px] !outline-none"
                    dropdownClass="!bg-[#282C32] !text-white !hover:bg-black !rounded-sm !h-35"
                    placeholder="Phone Number"
                  />
                </div>
                {formErrors.phone_number && <p className="text-red-400 text-[11px] mt-1 ml-4">{formErrors.phone_number}</p>}
              </div>
              <div>
                <label className="block mb-1">Password</label>
                <input
                  type="password"
                  value={newUser.password}
                  onChange={(e) =>
                    setNewUser({ ...newUser, password: e.target.value })
                  }
                  className="w-full p-2 rounded bg-[#123060] text-white"
                />
                {formErrors.password && (
                  <p className="text-red-400 text-xs mt-1">{formErrors.password}</p>
                )}
              </div>
              <div>
                <label className="block mb-1">Confirm Password</label>
                <input
                  type="password"
                  value={newUser.confirmPassword}
                  onChange={(e) =>
                    setNewUser({
                      ...newUser,
                      confirmPassword: e.target.value,
                    })
                  }
                  className="w-full p-2 rounded bg-[#123060] text-white"
                />
                {formErrors.confirmPassword && (
                  <p className="text-red-400 text-xs mt-1">{formErrors.confirmPassword}</p>
                )}
              </div>
              <div>
                <label className="block mb-1">Role</label>
                <select
                  value={newUser.role}
                  onChange={(e) =>
                    setNewUser({ ...newUser, role: e.target.value })
                  }
                  className="w-full p-2 rounded bg-[#123060] text-white"
                >
                  <option value="user">User</option>
                  <option value="admin" disabled>Admin</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end gap-2 mt-10">
              <button
                onClick={() => setAddUserModal(false)}
                disabled={submittingAdd}
                className="px-4 py-1 rounded-full bg-gray-500 hover:bg-gray-600 transition disabled:opacity-60"
              >
                Cancel
              </button>
              <button
                onClick={handleAddUser}
                disabled={
                  submittingAdd ||
                  !newUser.username ||
                  !newUser.email ||
                  !newUser.phone_number
                }
                className="px-4 py-1 rounded-full bg-blue-500 hover:bg-blue-600 transition disabled:opacity-60"
              >
                {submittingAdd ? "Saving..." : "Add"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ---------- MODAL EDIT USER (BARU, DESAIN SENADA) ---------- */}
      {editModal && editRow && editDraft && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/80 z-50">
          <div
            className="rounded-2xl shadow-2xl p-6 max-w-md w-full text-white"
            style={{
              background:
                "linear-gradient(180deg, rgba(0,60,140,1) 0%, rgba(0,30,70,1) 300%)",
            }}
        >
            <h2 className="text-lg font-bold mb-4 text-center">
              Edit User — #{editRow.id}
            </h2>

            {apiError && (
              <p className="text-red-300 text-xs mb-2">{apiError}</p>
            )}

            <div className="flex flex-col gap-3 text-sm">
              <div>
                <label className="block mb-1">Username</label>
                <input
                  type="text"
                  value={editDraft.username}
                  onChange={(e) =>
                    setEditDraft({ ...editDraft, username: e.target.value })
                  }
                  className="w-full p-2 rounded bg-[#123060] text-white"
                />
                {formErrors.username && (
                  <p className="text-red-400 text-xs mt-1">{formErrors.username}</p>
                )}
              </div>
              <div>
                <label className="block mb-1">Email</label>
                <input
                  type="email"
                  value={editDraft.email}
                  onChange={(e) =>
                    setEditDraft({ ...editDraft, email: e.target.value })
                  }
                  className="w-full p-2 rounded bg-[#123060] text-white"
                />
                {formErrors.email && (
                  <p className="text-red-400 text-xs mt-1">{formErrors.email}</p>
                )}
              </div>
              {/* phone */}
              <div>
                <label className="block mb-1">Number Phone</label>
                <div className="w-full p-2 rounded bg-[#123060] text-white">
                  <PhoneInput
                    country={"id"}
                    value={editDraft.phone_number}
                    onChange={(phone) => {
                      // Selalu pastikan awalan "+62"
                      let formatted = phone.startsWith("+62") ? phone : "+62" + phone.replace(/^(\+|0|62)+/, "");
                      setEditDraft({ ...editDraft, phone_number: formatted });
                    }}
                    onKeyDown={(e) => {
                      // Blok user menghapus awalan +62
                      const input = e.currentTarget as HTMLInputElement;
                      if (
                        (input.selectionStart ?? 0) <= 3 &&
                        (e.key === "Backspace" || e.key === "Delete")
                      ) {
                        e.preventDefault();
                      }
                    }}
                    inputClass="!bg-transparent !outline-none !w-full !placeholder-gray-400 !h-4 !pl-11 !text-sm !text-white"
                    buttonClass="!bg-transparent !border-none !h-5 !ml-[-3px] !outline-none"
                    dropdownClass="!bg-[#282C32] !text-white !hover:bg-black !rounded-sm !h-35"
                    placeholder="Phone Number"
                  />
                </div>
                {formErrors.phone_number && <p className="text-red-400 text-[11px] mt-1 ml-4">{formErrors.phone_number}</p>}
              </div>
            </div>

            <div className="flex justify-end gap-2 mt-10">
              <button
                onClick={() => {
                  setEditModal(false);
                  setEditRow(null);
                  setEditDraft(null);
                }}
                disabled={submittingEdit}
                className="px-4 py-1 rounded-full bg-gray-500 hover:bg-gray-600 transition disabled:opacity-60"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveEdit}
                disabled={submittingEdit}
                className="px-4 py-1 rounded-full bg-blue-500 hover:bg-blue-600 transition disabled:opacity-60"
              >
                {submittingEdit ? "Saving..." : "Save"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ---------- (OPSIONAL) CONFIRM DELETE MINI ---------- */}
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
              Are you sure want to delete user <b>{confirmDelete.username}</b>?
            </p>
            <div className="flex justify-end gap-2 mt-5">
              <button
                className="px-3 py-1 rounded-full bg-gray-500 hover:bg-gray-600"
                onClick={() => setConfirmDelete(null)}
              >
                Cancel
              </button>
              <button
                className="px-3 py-1 rounded-full bg-red-600 hover:bg-red-700"
                onClick={() => handleDelete(confirmDelete)}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}





