"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import Cropper from "react-easy-crop";
import getCroppedImg from "../utils/cropImage";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import PhoneInput from "react-phone-input-2";
import { createPortal } from "react-dom";
import { DEFAULT_BG, INFO_CARD_BG, CARD_BG } from "./constants";

/* -------------------------- Button Variants -------------------------- */
const BTN = {
  primary:
    "px-4 py-1.5 rounded-full bg-sky-500 hover:bg-sky-600 text-white border border-white/10 shadow focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-400/60 transition",
  secondary:
    "px-4 py-1.5 rounded-full bg-white/5 hover:bg-white/10 text-white border border-white/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-400/40 transition",
};

/* --------------------------- Modal (Portal) -------------------------- */
function ModalPortal({
  open,
  onClose,
  children,
}: {
  open: boolean;
  onClose?: () => void;
  children: React.ReactNode;
}) {
  // Lock body scroll ketika modal terbuka
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  if (!open || typeof window === "undefined") return null;

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-[100000] flex items-center justify-center"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/80"
        onClick={onClose}
        aria-hidden
      />
      {/* Modal content */}
      <div
        className="relative z-[100001] w-full max-w-md rounded-2xl border border-white/10 backdrop-blur-md p-6 text-white"
        style={{ background: CARD_BG }}
      >
        {children}
      </div>
    </div>,
    document.body
  );
}

/* ---------------------------- Toast (Portal) ---------------------------- */
function ToastPortal({
  message,
  onClose,
}: {
  message: string;
  onClose: () => void;
}) {
  useEffect(() => {
    const t = setTimeout(onClose, 3000);
    return () => clearTimeout(t);
  }, [onClose]);

  if (!message || typeof window === "undefined") return null;

  const base =
    "px-5 py-2 rounded-lg shadow-lg text-sm text-white pointer-events-auto";
  const color = message.includes("❌")
    ? "bg-red-600"
    : message.includes("✅")
    ? "bg-green-600"
    : "bg-white/10 border border-white/10";

  return createPortal(
    <div className="fixed top-6 left-1/2 -translate-x-1/2 z-[100002]">
      <div className={`${base} ${color}`}>{message}</div>
    </div>,
    document.body
  );
}

export default function UserInfoContent() {
  const [info, setInfo] = useState({
    username: "John Doe",
    password: "123456",
    phone_number: "+6281234567890",
    email: "JohnDoe@gmail.com",
    avatar: "/profile.svg",
  });

  const [editing, setEditing] = useState<null | "avatar" | "phone" | "password">(null);
  const [form, setForm] = useState<any>({});
  const [errors, setErrors] = useState<any>({});

  // state cropper
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<any>(null);
  const [fileUrl, setFileUrl] = useState<string | null>(null);

  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // open modal (phone/password/avatar via tombol)
  const handleEdit = (type: "avatar" | "phone" | "password") => {
    setEditing(type);
    setErrors({});
    if (type === "phone") {
      setForm({ phone_number: info.phone_number || "+628" });
    } else if (type === "password") {
      setForm({ oldPassword: "", newPassword: "", confirmPassword: "" });
    } else if (type === "avatar") {
      setForm({ file: null });
      if (fileUrl) {
        URL.revokeObjectURL(fileUrl);
        setFileUrl(null);
      }
    }
  };

  // validate input
  const validate = () => {
    const newErrors: any = {};

    if (editing === "phone") {
      if (!form.phone_number) {
        newErrors.phone_number = "phone number is required";
      } else if (!/^\+628\d{8,15}$/.test(form.phone_number)) {
        if (!form.phone_number.startsWith("+628")) {
          newErrors.phone_number = "phone number must start with +628";
        } else if (form.phone_number.length < 10) {
          newErrors.phone_number = "phone number is too short (min 10 chars)";
        } else if (form.phone_number.length > 16) {
          newErrors.phone_number = "phone number is too long (max 16 chars)";
        } else {
          newErrors.phone_number = "invalid Indonesian phone number format";
        }
      }
    }

    if (editing === "password") {
      if (form.oldPassword !== info.password) {
        newErrors.oldPassword = "old password is incorrect";
      }
      if (!form.newPassword) {
        newErrors.newPassword = "password is required";
      } else if (form.newPassword.length < 8) {
        newErrors.newPassword = "password must be at least 8 characters";
      } else if (form.newPassword.length > 20) {
        newErrors.newPassword = "password must be at most 20 characters";
      } else if (!/[A-Z]/.test(form.newPassword)) {
        newErrors.newPassword = "password must include at least one uppercase letter";
      } else if (!/[a-z]/.test(form.newPassword)) {
        newErrors.newPassword = "password must include at least one lowercase letter";
      } else if (!/\d/.test(form.newPassword)) {
        newErrors.newPassword = "password must include at least one number";
      } else if (!/[^A-Za-z0-9]/.test(form.newPassword)) {
        newErrors.newPassword = "password must include at least one special character";
      } else if (/(0123|1234|2345|3456|4567|5678|6789)/.test(form.newPassword)) {
        newErrors.newPassword = "password must not contain sequential numbers";
      } else {
        const lc = String(form.newPassword || "").toLowerCase();
        if (
          ["password", "qwerty", "12345", "123456", "abc123", "tanggal"].some((p) =>
            lc.includes(p)
          )
        ) {
          newErrors.newPassword = "password must not contain common patterns";
        }
        if (
          /\b(?:\d{2}[-\/]?\d{2}[-\/]?\d{4}|\d{4}[-\/]?\d{2}[-\/]?\d{2})\b/.test(form.newPassword)
        ) {
          newErrors.newPassword = "password must not contain dates";
        }
      }
      if (!form.confirmPassword) {
        newErrors.confirmPassword = "confirm password is required";
      } else if (form.newPassword !== form.confirmPassword) {
        newErrors.confirmPassword = "passwords do not match";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // save changes
  const handleSave = async () => {
    if (!validate()) return;

    if (editing === "phone") {
      setInfo({ ...info, phone_number: form.phone_number });
    } else if (editing === "password") {
      setInfo({ ...info, password: form.newPassword });
    } else if (editing === "avatar") {
      if (!form.file || !fileUrl) {
        setToastMessage("❌ Please select an image first");
        return; // biarkan modal tetap terbuka
      }
      try {
        const croppedImage = await getCroppedImg(fileUrl, croppedAreaPixels);
        URL.revokeObjectURL(fileUrl);
        setFileUrl(null);
        setInfo({ ...info, avatar: croppedImage });
      } catch (err) {
        console.error("Crop failed:", err);
        setToastMessage("❌ Failed to crop image");
        return; // biarkan modal tetap terbuka
      }
    }

    setEditing(null);
    setToastMessage("✅ Changes saved successfully!");
  };

  const [showPW, setShowPW] = useState({ old: false, new: false, confirm: false });

  const subtitle = `Kelola profil, kontak, dan keamanan`;

  return (
    <div
      className="
        relative isolate
        flex flex-col mx-auto sm:mr-8 rounded-2xl
        box-border min-h-[84dvh] md:h-[84dvh] md:max-h-[100dvh]
        overflow-auto md:overflow-hidden
        p-5 sm:p-8
        pb-[max(env(safe-area-inset-bottom),12px)]
        text-white
      "
      style={{ background: DEFAULT_BG }}
    >
      {/* background glows */}
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute left-[-10%] top-[-15%] h-72 w-72 rounded-full bg-indigo-500/25 blur-3xl" />
        <div className="absolute right-[-10%] bottom-[-20%] h-80 w-80 rounded-full bg-sky-500/25 blur-3xl" />
      </div>

      <div>
        <h2 className="text-white font-semibold leading-tight text-[clamp(16px,2vw,26px)]">
          User Info
        </h2>
        <p className="text-white/60 text-[11px] sm:text-xs mt-0.5">{subtitle}</p>
      </div>

      <div className="grid grid-cols-12 gap-3 sm:gap-4 items-start mt-4 max-w-6xl w-full mx-auto">
        {/* LEFT: Profile card */}
        <aside className="col-span-12 md:col-span-4">
          <section
            className="rounded-2xl border border-white/10 backdrop-blur-md p-4 text-center"
            style={{ background: INFO_CARD_BG }}
          >
            <div className="mb-1.5 flex items-center justify-between">
              <h3 className="text-[10px] tracking-widest text-white/60 uppercase">Profile</h3>
            </div>

            {/* Avatar clean: tanpa klik & tanpa hover overlay */}
            <div className="inline-flex rounded-full ring-1 ring-white/10 p-1">
              <Image
                src={info.avatar}
                alt="Avatar"
                width={130}
                height={130}
                className="rounded-full object-cover border border-white/10 shadow-lg"
                priority
              />
            </div>

            <p className="mt-3 text-sm font-medium">{info.username}</p>
            <p className="text-xs text-white/70">{info.email}</p>

            <div className="flex gap-2 my-3 justify-center">
              {/* Akses edit avatar lewat tombol saja */}
              <button
                onClick={() => handleEdit("avatar")}
                className={BTN.secondary}
              >
                Change Photo
              </button>
            </div>
          </section>
        </aside>

        {/* RIGHT: Account + Devices */}
        <main className="col-span-12 md:col-span-8 space-y-3">
          {/* Account */}
          <section
            className="rounded-2xl border border-white/10 backdrop-blur-md p-3 sm:p-4"
            style={{ background: INFO_CARD_BG }}
          >
            <div className="mb-1.5 flex items-center justify-between">
              <h3 className="text-[10px] tracking-widest text-white/60 uppercase">Account</h3>
            </div>

            <div className="divide-y divide-white/5">
              {/* Username */}
              <div className="grid grid-cols-12 items-center py-2">
                <div className="col-span-4 text-[10px] uppercase tracking-widest text-white/50">
                  Username
                </div>
                <div className="col-span-6 text-[13px] sm:text-sm font-medium break-words">
                  {info.username}
                </div>
                <div className="col-span-2" />
              </div>
              {/* Email */}
              <div className="grid grid-cols-12 items-center py-2">
                <div className="col-span-4 text-[10px] uppercase tracking-widest text-white/50">
                  Email
                </div>
                <div className="col-span-6 text-[13px] sm:text-sm font-medium break-words">
                  {info.email}
                </div>
                <div className="col-span-2" />
              </div>
              {/* Phone */}
              <div className="grid grid-cols-12 items-center py-2">
                <div className="col-span-4 text-[10px] uppercase tracking-widest text-white/50">
                  Phone Number
                </div>
                <div className="col-span-6 text-[13px] sm:text-sm font-medium break-words">
                  {info.phone_number}
                </div>
                <div className="col-span-2 flex justify-end">
                  <button
                    type="button"
                    onClick={() => handleEdit("phone")}
                    className="inline-flex items-center rounded-lg px-2.5 py-1 text-[11px] border border-white/10 bg-white/5 text-white/80 hover:bg-white/10 hover:text-white focus:outline-none focus:ring-2 focus:ring-sky-400/40"
                  >
                    Edit
                  </button>
                </div>
              </div>
              {/* Password */}
              <div className="grid grid-cols-12 items-center py-2">
                <div className="col-span-4 text-[10px] uppercase tracking-widest text-white/50">
                  Password
                </div>
                <div className="col-span-6 text-[13px] sm:text-sm font-medium">********</div>
                <div className="col-span-2 flex justify-end">
                  <button
                    type="button"
                    onClick={() => handleEdit("password")}
                    className="inline-flex items-center rounded-lg px-2.5 py-1 text-[11px] border border-white/10 bg-white/5 text-white/80 hover:bg-white/10 hover:text-white focus:outline-none focus:ring-2 focus:ring-sky-400/40"
                  >
                    Edit
                  </button>
                </div>
              </div>
            </div>
          </section>

          {/* Devices (hanya tombol Add Device) */}
          <section
            className="rounded-2xl border border-white/10 backdrop-blur-md p-3 sm:p-4"
            style={{ background: INFO_CARD_BG }}
          >
            <div className="mb-1.5 flex items-center justify-between">
              <h3 className="text-[10px] tracking-widest text-white/60 uppercase">Devices</h3>
            </div>

            <div className="mt-2">
              <button
                onClick={() => (window.location.href = "/dashboard/user-info/add-device")}
                className="w-full py-1.5 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 focus:ring-2 focus:ring-sky-400/40"
              >
                + Add Device
              </button>
            </div>
          </section>
        </main>
      </div>

      {/* Modal (overlay via Portal) */}
      <ModalPortal open={Boolean(editing)} onClose={() => setEditing(null)}>
        <h3 className="text-lg font-bold mb-4 text-center">
          {editing === "avatar"
            ? "Edit Profile Picture"
            : editing === "phone"
            ? "Edit Phone Number"
            : "Change Password"}
        </h3>

        {/* avatar */}
        {editing === "avatar" && (
          <div className="space-y-4 flex flex-col items-center mt-10 mb-6">
            {fileUrl ? (
              <div className="relative w-[250px] h-[250px] bg-black rounded-xl overflow-hidden">
                <Cropper
                  image={fileUrl}
                  crop={crop}
                  zoom={zoom}
                  aspect={1}
                  onCropChange={setCrop}
                  onZoomChange={setZoom}
                  onCropComplete={(_, area) => setCroppedAreaPixels(area)}
                />
              </div>
            ) : (
              <Image
                src={info.avatar}
                alt="Preview"
                width={120}
                height={120}
                className="rounded-full object-cover border border-white/10 shadow-lg"
              />
            )}

            <label className="cursor-pointer px-4 py-2 bg-white/10 border border-white/10 hover:bg-white/15 text-white rounded-md text-sm shadow-md focus:ring-2 focus:ring-sky-400/40">
              Upload New Picture
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const f = e.target.files?.[0] || null;
                  setForm({ ...form, file: f });
                  if (fileUrl) URL.revokeObjectURL(fileUrl);
                  setFileUrl(f ? URL.createObjectURL(f) : null);
                }}
              />
            </label>
            <p className="text-white/60 text-xs text-center">Supported: JPG, PNG, SVG. Max 5MB.</p>
          </div>
        )}

        {/* phone */}
        {editing === "phone" && (
          <div className="text-sm">
            <label className="block mb-1">Phone Number</label>
            <div className="w-full p-2 rounded-xl bg-white/5 border border-white/10 text-white">
              <PhoneInput
                country={"id"}
                onlyCountries={["id"]}
                disableDropdown
                value={form.phone_number}
                onChange={(phone) => {
                  let formatted = phone.startsWith("+62")
                    ? phone
                    : "+62" + phone.replace(/^(\+|0|62)+/, "");
                  setForm({ ...form, phone_number: formatted });
                }}
                onKeyDown={(e) => {
                  const input = e.currentTarget as HTMLInputElement;
                  if ((input.selectionStart ?? 0) <= 3 && (e.key === "Backspace" || e.key === "Delete")) {
                    e.preventDefault();
                  }
                }}
                inputClass="!bg-transparent !outline-none !w-full !placeholder-white/50 !h-4 !pl-11 !text-sm !text-white"
                buttonClass="!bg-transparent !border-none !h-5 !ml-[-3px] !outline-none"
                dropdownClass="!bg-[#0C1F3C] !text-white !rounded-sm"
                placeholder="Phone Number"
              />
            </div>
            {errors.phone_number && (
              <p className="text-red-400 text-xs mt-1">{errors.phone_number}</p>
            )}
          </div>
        )}

        {/* password */}
        {editing === "password" && (
          <div className="space-y-3 text-sm">
            {/* Old Password */}
            <div className="relative">
              <label className="block mb-1">Old Password</label>
              <input
                type={showPW.old ? "text" : "password"}
                placeholder="Old Password"
                value={form.oldPassword}
                onChange={(e) => setForm({ ...form, oldPassword: e.target.value })}
                className="w-full p-2 pr-10 rounded-xl bg-white/5 border border-white/10 text-white"
                autoComplete="current-password"
              />
              <button
                type="button"
                onClick={() => setShowPW((s) => ({ ...s, old: !s.old }))}
                className="absolute right-3 top-[36px] text-white/80 hover:text-white"
                aria-label={showPW.old ? "Hide old password" : "Show old password"}
              >
                <span>{showPW.old ? <FaEyeSlash /> : <FaEye />}</span>
              </button>
              {errors.oldPassword && (
                <p className="text-red-400 text-xs mt-1">{errors.oldPassword}</p>
              )}
            </div>

            {/* New Password */}
            <div className="relative">
              <label className="block mb-1">New Password</label>
              <input
                type={showPW.new ? "text" : "password"}
                placeholder="New Password"
                value={form.newPassword}
                onChange={(e) => setForm({ ...form, newPassword: e.target.value })}
                className="w-full p-2 pr-10 rounded-xl bg-white/5 border border-white/10 text-white"
                autoComplete="new-password"
              />
              <button
                type="button"
                onClick={() => setShowPW((s) => ({ ...s, new: !s.new }))}
                className="absolute right-3 top-[36px] text-white/80 hover:text-white"
                aria-label={showPW.new ? "Hide new password" : "Show new password"}
              >
                <span>{showPW.new ? <FaEyeSlash /> : <FaEye />}</span>
              </button>
              {errors.newPassword && (
                <p className="text-red-400 text-xs mt-1">{errors.newPassword}</p>
              )}
            </div>

            {/* Confirm Password */}
            <div className="relative">
              <label className="block mb-1">Confirm Password</label>
              <input
                type={showPW.confirm ? "text" : "password"}
                placeholder="Confirm Password"
                value={form.confirmPassword}
                onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
                className="w-full p-2 pr-10 rounded-xl bg-white/5 border border-white/10 text-white"
                autoComplete="new-password"
              />
              <button
                type="button"
                onClick={() => setShowPW((s) => ({ ...s, confirm: !s.confirm }))}
                className="absolute right-3 top-[36px] text-white/80 hover:text-white"
                aria-label={showPW.confirm ? "Hide confirm password" : "Show confirm password"}
              >
                <span>{showPW.confirm ? <FaEyeSlash /> : <FaEye />}</span>
              </button>
              {errors.confirmPassword && (
                <p className="text-red-400 text-xs mt-1">{errors.confirmPassword}</p>
              )}
            </div>
          </div>
        )}

        {/* buttons (primary vs secondary) */}
        <div className="flex justify-end gap-2 mt-8">
          <button onClick={() => setEditing(null)} className={BTN.secondary}>
            Cancel
          </button>
          <button onClick={handleSave} className={BTN.primary}>
            Save
          </button>
        </div>
      </ModalPortal>

      {/* Toast (via Portal, selalu di atas overlay/header) */}
      {toastMessage && (
        <ToastPortal message={toastMessage} onClose={() => setToastMessage(null)} />
      )}
    </div>
  );
}
