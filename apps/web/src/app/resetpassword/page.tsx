"use client";

import { useState } from "react";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { FaEye, FaEyeSlash } from "react-icons/fa";

export default function ResetPassword() {
  const router = useRouter();
  const params = useSearchParams();
  const token = params?.get("token") ?? "";

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [errorPassword, setErrorPassword] = useState("");
  const [errorConfirm, setErrorConfirm] = useState("");
  const [globalError, setGlobalError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState("");

  // state untuk show/hide
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  // cek strength password
  const evaluatePasswordStrength = (pwd: string) => {
    if (pwd.length < 8) return "weak";
    const hasUpper = /[A-Z]/.test(pwd);
    const hasLower = /[a-z]/.test(pwd);
    const hasNumber = /\d/.test(pwd);
    const hasSymbol = /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(pwd);

    const score = [hasUpper, hasLower, hasNumber, hasSymbol].filter(Boolean)
      .length;

    if (score === 4) return "strong";
    if (score >= 2) return "medium";
    return "weak";
  };

  // validasi field
  const validateFields = () => {
    let valid = true;
    setErrorPassword("");
    setErrorConfirm("");
    setGlobalError("");

    const passwordRegex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]).{8,}$/;

    if (!password) {
      setErrorPassword("New password is required");
      valid = false;
    } else if (password.length < 8) {
      setErrorPassword("Password must be at least 8 characters");
      valid = false;
    } else if (!passwordRegex.test(password)) {
      setErrorPassword(
        "Password must contain uppercase, lowercase, number, and symbol"
      );
      valid = false;
    }

    if (!confirm) {
      setErrorConfirm("Confirm password is required");
      valid = false;
    } else if (password && confirm && password !== confirm) {
      setErrorConfirm("Passwords do not match");
      valid = false;
    }

    if (!token) {
      setGlobalError("Invalid or missing token");
      valid = false;
    }

    return valid;
  };

  // submit ke backend
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccess("");
    setGlobalError("");

    if (!validateFields()) return;

    setLoading(true);
    try {
      const res = await fetch("http://localhost:3000/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, newPassword: password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setGlobalError(data.message || "Failed to reset password");
        setLoading(false);
        return;
      }

      setSuccess("Password has been reset, redirecting to login...");
      setTimeout(() => router.push("/login"), 2000);
    } catch (err) {
      console.error(err);
      setGlobalError("Server error, please try again later");
    }
    setLoading(false);
  };

  return (
    <div
      className="h-screen w-screen flex items-center justify-center bg-cover bg-center"
      style={{ backgroundImage: "url('/bg1.png')" }}
    >
      <div
        className="px-12 py-8 bg-gray-800/60 backdrop-blur-sm rounded-2xl shadow-xl
          w-full max-w-[440px] text-sm flex flex-col items-center
          h-auto"
      >
        <button onClick={() => router.back()} className="self-start mb-[-10]">
          <Image src="/back.svg" alt="Back" width={30} height={30} />
        </button>

        <Image
          src="/key.svg"
          alt="Lock"
          width={150}
          height={150}
          className="mb-2"
        />

        <h1 className="text-2xl font-bold text-center text-white leading-relaxed mb-3">
          Reset Password
        </h1>
        <p className="font-light text-center text-white mb-4">
          Enter your new password below
        </p>

        <form className="flex flex-col w-full gap-4" onSubmit={handleSubmit}>
          {/* password */}
          <div>
            <div className="relative w-full flex items-center px-4 h-12 bg-gray-800 rounded-full text-white focus-within:ring-2 focus-within:ring-blue-500 transition">
              <Image
                src="/pw.svg"
                alt="password"
                width={19}
                height={20}
                className="mr-3 opacity-70"
              />
              <input
                type={showPassword ? "text" : "password"}
                placeholder="New Password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setPasswordStrength(evaluatePasswordStrength(e.target.value));
                  if (errorPassword) setErrorPassword("");
                  if (globalError) setGlobalError("");
                }}
                className="bg-transparent outline-none w-full placeholder-gray-400 text-[14px]"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 opacity-70 hover:opacity-100"
              >
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
            {errorPassword ? (
              <p className="text-red-400 text-[11px] mt-1 ml-4">
                {errorPassword}
              </p>
            ) : (
              password && (
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
              <Image
                src="/pw.svg"
                alt="password"
                width={19}
                height={20}
                className="mr-3 opacity-70"
              />
              <input
                type={showConfirm ? "text" : "password"}
                placeholder="Confirm Password"
                value={confirm}
                onChange={(e) => {
                  setConfirm(e.target.value);
                  if (errorConfirm) setErrorConfirm("");
                  if (globalError) setGlobalError("");
                }}
                className="bg-transparent outline-none w-full placeholder-gray-400 text-[14px]"
              />
              <button
                type="button"
                onClick={() => setShowConfirm(!showConfirm)}
                className="absolute right-4 opacity-70 hover:opacity-100"
              >
                {showConfirm ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
            {errorConfirm && (
              <p className="text-red-400 text-[11px] mt-1 ml-4">
                {errorConfirm}
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="shadow-xl bg-[#2196F3] hover:bg-[#1A78C2] text-white font-semibold rounded-full w-full h-12 text-[14px] transition-all duration-200 disabled:opacity-60"
          >
            {loading ? "Processing..." : "Reset Password"}
          </button>
          {globalError && (
            <p className="text-red-400 text-[12px] mb-2 text-center">
              {globalError}
            </p>
          )}
          {success && (
            <p className="text-green-400 text-[12px] mb-2 text-center">
              {success}
            </p>
          )}
        </form>
      </div>
    </div>
  );
}
