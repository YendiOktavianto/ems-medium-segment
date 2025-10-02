"use client";
import { useState } from "react";
import Image from "next/image";
import Cropper from "react-easy-crop";
import getCroppedImg from "../utils/cropImage";

export default function UserInfoContent() {
  const [info, setInfo] = useState({
    username: "John Doe",
    password: "123456",
    phone: "081234567890",
    email: "JohnDoe@gmail.com",
    avatar: "/profile.svg",
  });

  const [editing, setEditing] = useState<
    null | "avatar" | "phone" | "password" | "device"
  >(null);
  const [form, setForm] = useState<any>({});
  const [errors, setErrors] = useState<any>({});

  // state cropper
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<any>(null);

  // state devices
  const [devices, setDevices] = useState<
    { id: string; location: string; detail: string }[]
  >([]);

  // open modal
  const handleEdit = (type: "avatar" | "phone" | "password" | "device") => {
    setEditing(type);
    setErrors({});
    if (type === "phone") {
      setForm({ phone: info.phone });
    } else if (type === "password") {
      setForm({ oldPassword: "", newPassword: "", confirmPassword: "" });
    } else if (type === "avatar") {
      setForm({ file: null });
    } else if (type === "device") {
      setForm({ id: "", location: "", detail: "" });
    }
  };

  // validate input
  const validate = () => {
    const newErrors: any = {};

    if (editing === "phone") {
      if (!form.phone) {
        newErrors.phone = "Phone number cannot be empty";
      } else if (!/^\d+$/.test(form.phone)) {
        newErrors.phone = "Phone number must contain only digits";
      } else if (!/^08/.test(form.phone)) {
        newErrors.phone = "Phone number must start with 08";
      } else if (form.phone.length < 12) {
        newErrors.phone = "Phone number must be at least 12 digits";
      }
    }

    if (editing === "password") {
      if (form.oldPassword !== info.password) {
        newErrors.oldPassword = "Old password is incorrect";
      }
      if (!form.newPassword) {
        newErrors.newPassword = "New password cannot be empty";
      } else if (form.newPassword.length < 6) {
        newErrors.newPassword = "New password must be at least 6 characters";
      }
      if (form.newPassword !== form.confirmPassword) {
        newErrors.confirmPassword = "Passwords do not match";
      }
    }

    if (editing === "device") {
      if (!form.id) newErrors.id = "Device ID required";
      if (!form.location) newErrors.location = "Location required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // save changes
  const handleSave = async () => {
    if (!validate()) return;

    if (editing === "phone") {
      setInfo({ ...info, phone: form.phone });
    } else if (editing === "password") {
      setInfo({ ...info, password: form.newPassword });
    } else if (editing === "avatar" && form.file) {
      try {
        const croppedImage = await getCroppedImg(
          URL.createObjectURL(form.file),
          croppedAreaPixels
        );
        setInfo({ ...info, avatar: croppedImage });
      } catch (err) {
        console.error("Crop failed:", err);
      }
    } else if (editing === "device") {
      setDevices([...devices, { ...form }]);
    }

    setEditing(null);
  };

  const userInfoList = [
    { label: "USERNAME", value: info.username },
    { label: "PASSWORD", value: "********" },
    { label: "PHONE NUMBER", value: info.phone },
    { label: "EMAIL", value: info.email },
  ];

  return (
    <div
      className="rounded-2xl p-8 mx-auto mr-8"
      style={{
        background:
          "linear-gradient(90deg, rgba(6,11,40,0.74) 0%, rgba(10,14,35,0.71) 100%)",
      }}
    >
      <h2 className="text-2xl font-semibold mb-4">User Info</h2>
      <div className="flex flex-col md:flex-row items-center md:items-start gap-4">
        {/* Avatar */}
        <div
          className="flex-shrink-0 mx-15 my-4 cursor-pointer relative group"
          onClick={() => handleEdit("avatar")}
        >
          <Image
            src={info.avatar}
            alt="Avatar"
            width={140}
            height={140}
            className="rounded-full object-cover border-2 border-blue-500 shadow-lg"
          />
          <div className="absolute inset-0 bg-black/40 rounded-full opacity-0 group-hover:opacity-100 flex items-center justify-center text-white text-xs">
            Edit
          </div>
        </div>

        {/* Info */}
        <div className="w-full space-y-3 my-4">
          {userInfoList.map((item) => (
            <div
              key={item.label}
              className="min-h-[60px] flex flex-col justify-center rounded-2xl px-4 py-2 relative group cursor-pointer"
              style={{
                background:
                  "linear-gradient(180deg, rgba(6,12,41,1) 0%, rgba(4,12,48,0.5) 100%)",
              }}
              onClick={() =>
                item.label === "PASSWORD"
                  ? handleEdit("password")
                  : item.label === "PHONE NUMBER"
                  ? handleEdit("phone")
                  : null
              }
            >
              <p className="text-gray-400 text-[10px]">{item.label}</p>
              <p className="text-sm font-medium text-white">{item.value}</p>
              {(item.label === "PASSWORD" || item.label === "PHONE NUMBER") && (
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-blue-400 text-xs opacity-0 group-hover:opacity-100">
                  Edit
                </span>
              )}
            </div>
          ))}

          {/* Add device button */}
          <button
            onClick={() => window.location.href = "/dashboard/user-info/add-device"}
            className="mt-4 w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-xl shadow-md text-sm"
          >
            + Add Device
          </button>

          {/* List devices */}
          {devices.length > 0 && (
            <div className="mt-4 space-y-2">
              <h4 className="text-sm font-semibold text-white">Devices</h4>
              {devices.map((d, idx) => (
                <div
                  key={idx}
                  className="p-3 rounded-xl bg-[#0f1430] border border-blue-600"
                >
                  <p className="text-xs text-gray-400">Device ID: {d.id}</p>
                  <p className="text-xs text-gray-400">Location: {d.location}</p>
                  {d.detail && (
                    <p className="text-xs text-gray-400">
                      Detail: {d.detail}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Modal */}
      {editing && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/80 z-50">
          <div className="rounded-2xl shadow-2xl p-6 max-w-md w-full text-white"
            style={{
              background:
                "linear-gradient(180deg, rgba(0,60,140,1) 0%, rgba(0,30,70,1) 300%)",
            }}
          >
            <h3 className="text-lg font-bold mb-4 text-center">
              {editing === "avatar"
                ? "Edit Profile Picture"
                : editing === "phone"
                ? "Edit Phone Number"
                : editing === "password"
                ? "Change Password"
                : "Add Device"}
            </h3>

            {/* avatar */}
            {editing === "avatar" && (
              <div className="space-y-4 flex flex-col items-center mt-10 mb-15">
                {form.file ? (
                  <div className="relative w-[250px] h-[250px] bg-black">
                    <Cropper
                      image={URL.createObjectURL(form.file)}
                      crop={crop}
                      zoom={zoom}
                      aspect={1}
                      onCropChange={setCrop}
                      onZoomChange={setZoom}
                      onCropComplete={(_, croppedAreaPixels) =>
                        setCroppedAreaPixels(croppedAreaPixels)
                      }
                    />
                  </div>
                ) : (
                  <Image
                    src={info.avatar}
                    alt="Preview"
                    width={120}
                    height={120}
                    className="rounded-full object-cover border-2 border-blue-500 shadow-lg"
                  />
                )}

                <label className="cursor-pointer px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-md text-sm shadow-md">
                  Upload New Picture
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) =>
                      setForm({ ...form, file: e.target.files?.[0] || null })
                    }
                  />
                </label>
                <p className="text-gray-400 text-xs text-center">
                  Supported: JPG, PNG, SVG. Max 5MB.
                </p>
              </div>
            )}

            {/* phone */}
            {editing === "phone" && (
              <div className="text-sm">
                <label className="block mb-1">Phone Number</label>
                <input
                  type="text"
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  className="w-full p-2 rounded bg-[#123060] text-white"
                />
                {errors.phone && (
                  <p className="text-red-500 text-xs mt-1">{errors.phone}</p>
                )}
              </div>
            )}

            {/* password */}
            {editing === "password" && (
              <div className="space-y-3 text-sm">
                <div>
                  <label className="block mb-1">Old Password</label>
                  <input
                    type="password"
                    placeholder="Old Password"
                    value={form.oldPassword}
                    onChange={(e) =>
                      setForm({ ...form, oldPassword: e.target.value })
                    }
                    className="w-full p-2 rounded bg-[#123060] text-white"
                  />
                  {errors.oldPassword && (
                    <p className="text-red-500 text-xs mt-1">
                      {errors.oldPassword}
                    </p>
                  )}
                </div>
                <div>
                  <label className="block mb-1">New Password</label>
                  <input
                    type="password"
                    placeholder="New Password"
                    value={form.newPassword}
                    onChange={(e) =>
                      setForm({ ...form, newPassword: e.target.value })
                    }
                    className="w-full p-2 rounded bg-[#123060] text-white"
                  />
                  {errors.newPassword && (
                    <p className="text-red-500 text-xs mt-1">
                      {errors.newPassword}
                    </p>
                  )}
                </div>
                <div>
                  <label className="block mb-1">Confirm Password</label>
                  <input
                    type="password"
                    placeholder="Confirm Password"
                    value={form.confirmPassword}
                    onChange={(e) =>
                      setForm({ ...form, confirmPassword: e.target.value })
                    }
                    className="w-full p-2 rounded bg-[#123060] text-white"
                  />
                  {errors.confirmPassword && (
                    <p className="text-red-500 text-xs mt-1">
                      {errors.confirmPassword}
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* device */}
            {editing === "device" && (
              <div className="space-y-3">
                <div>
                  <input
                    type="text"
                    placeholder="Device ID"
                    value={form.id}
                    onChange={(e) => setForm({ ...form, id: e.target.value })}
                    className="w-full p-2 rounded-md bg-[#0f1430] border border-blue-600"
                  />
                  {errors.id && (
                    <p className="text-red-500 text-xs mt-1">{errors.id}</p>
                  )}
                </div>
                <div>
                  <input
                    type="text"
                    placeholder="Location"
                    value={form.location}
                    onChange={(e) =>
                      setForm({ ...form, location: e.target.value })
                    }
                    className="w-full p-2 rounded-md bg-[#0f1430] border border-blue-600"
                  />
                  {errors.location && (
                    <p className="text-red-500 text-xs mt-1">
                      {errors.location}
                    </p>
                  )}
                </div>
                <div>
                  <input
                    type="text"
                    placeholder="Detail (optional)"
                    value={form.detail}
                    onChange={(e) =>
                      setForm({ ...form, detail: e.target.value })
                    }
                    className="w-full p-2 rounded-md bg-[#0f1430] border border-blue-600"
                  />
                </div>
              </div>
            )}

            {/* buttons */}
            <div className="flex justify-end gap-2 mt-12">
              <button
                onClick={() => setEditing(null)}
                className="px-4 py-1 rounded-full bg-gray-500 hover:bg-gray-600 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
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
