"use client";

import Image from "next/image";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import useResetPassword from "./useResetPassword";
import { useState } from "react";

export default function ResetPassword() {
  const {
    form,
    errorPassword,
    errorConfirm,
    globalError,
    success,
    loading,
    passwordStrength,
    handleChange,
    handleSubmit,
  } = useResetPassword();

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  return (
    <div
      className="h-screen w-screen flex items-center justify-center bg-cover bg-center"
      style={{ backgroundImage: "url('/bg1.png')" }}
    >
      <div className="px-12 py-8 bg-gray-800/60 backdrop-blur-sm rounded-2xl shadow-xl w-full max-w-[440px] text-sm flex flex-col items-center h-auto">
        <button onClick={() => history.back()} className="self-start mb-[-10]">
          <Image src="/back.svg" alt="Back" width={30} height={30} />
        </button>

        <Image src="/key.svg" alt="Lock" width={150} height={150} className="mb-2" />
        <h1 className="text-2xl font-bold text-center text-white leading-relaxed mb-3">
          Reset Password
        </h1>
        <p className="font-light text-center text-white mb-4">Enter your new password below</p>

        <form className="flex flex-col w-full gap-4" onSubmit={handleSubmit}>
          {/* password */}
          <div>
            <div className="relative w-full flex items-center px-4 h-12 bg-gray-800 rounded-full text-white focus-within:ring-2 focus-within:ring-blue-500 transition">
              <Image src="/pw.svg" alt="password" width={19} height={20} className="mr-3 opacity-70" />
              <input
                type={showPassword ? "text" : "password"}
                placeholder="New Password"
                value={form.password}
                onChange={e => handleChange("password", e.target.value)}
                className="bg-transparent outline-none w-full placeholder-gray-400 text-[14px]"
              />
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 opacity-70 hover:opacity-100">
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
            {errorPassword ? (
              <p className="text-red-400 text-[11px] mt-1 ml-4">{errorPassword}</p>
            ) : (
              form.password && (
                <p
                  className={`text-[11px] mt-1 ml-4 ${
                    passwordStrength === "strong"
                      ? "text-green-400"
                      : passwordStrength === "medium"
                      ? "text-yellow-400"
                      : "text-red-400"
                  }`}
                >
                  Password strength: {passwordStrength}
                </p>
              )
            )}
          </div>

          {/* confirm password */}
          <div>
            <div className="relative w-full flex items-center px-4 h-12 bg-gray-800 rounded-full text-white focus-within:ring-2 focus-within:ring-blue-500 transition">
              <Image src="/pw.svg" alt="password" width={19} height={20} className="mr-3 opacity-70" />
              <input
                type={showConfirm ? "text" : "password"}
                placeholder="Confirm Password"
                value={form.confirm}
                onChange={e => handleChange("confirm", e.target.value)}
                className="bg-transparent outline-none w-full placeholder-gray-400 text-[14px]"
              />
              <button type="button" onClick={() => setShowConfirm(!showConfirm)} className="absolute right-4 opacity-70 hover:opacity-100">
                {showConfirm ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
            {errorConfirm && <p className="text-red-400 text-[11px] mt-1 ml-4">{errorConfirm}</p>}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="shadow-xl bg-[#2196F3] hover:bg-[#1A78C2] text-white font-semibold rounded-full w-full h-12 text-[14px] transition-all duration-200 disabled:opacity-60"
          >
            {loading ? "Processing..." : "Reset Password"}
          </button>
          {globalError && <p className="text-red-400 text-[12px] mb-2 text-center">{globalError}</p>}
          {success && <p className="text-green-400 text-[12px] mb-2 text-center">{success}</p>}
        </form>
      </div>
    </div>
  );
}
