/* eslint-disable react/no-unescaped-entities */
"use client";
import Image from "next/image";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { useLogin } from "./useLogin";
export default function LoginUI() {
  const {
    form,
    errors,
    rememberMe,
    loading,
    showPassword,
    setShowPassword,
    setRememberMe,
    handleChange,
    handleSubmit,
    router,
  } = useLogin();

  const handleRegisterRedirect = () => router.push("/register");
  const handleForgotPasswordRedirect = () => router.push("/forgot");

  return (
    <div
      className="h-screen w-screen flex items-center justify-center bg-cover bg-center overflow-hidden"
      style={{ backgroundImage: "url('/bg1.png')" }}
    >
      <div className="px-12 py-8 bg-gray-800/60 backdrop-blur-sm rounded-2xl shadow-xl w-full max-w-[440px] text-sm flex flex-col items-center max-h-[96vh] overflow-y-auto custom-scroll">
        <Image src="/logo.svg" alt="Logo" width={100} height={100} className="mb-2" />
        <h1 className="text-2xl font-bold text-center text-white leading-relaxed mb-6">
          Welcome to <br /> Power Management System
        </h1>

        <form className="flex flex-col w-full gap-4" onSubmit={handleSubmit}>
          {/* username/email */}
          <div>
            <div className="w-full flex items-center px-4 h-12 bg-gray-800 rounded-full text-white focus-within:ring-2 focus-within:ring-blue-500 transition">
              <Image src="/user.svg" alt="user" width={17} height={19} className="mr-3 opacity-70" />
              <input
                type="text"
                name="identifier"
                placeholder="Username or Email"
                value={form.identifier}
                onChange={handleChange}
                className="bg-transparent outline-none w-full placeholder-gray-400 text-[14px]"
              />
            </div>
            {errors.identifier && <p className="text-red-400 text-[11px] mt-1 ml-4">{errors.identifier}</p>}
          </div>

          {/* password */}
          <div className="relative">
            <div className="flex items-center h-12 bg-gray-800 rounded-full px-4 text-white">
              <Image src="/pw.svg" alt="password" width={19} height={20} className="mr-3 opacity-70" />
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                placeholder="Password"
                value={form.password}
                onChange={handleChange}
                className="bg-transparent outline-none w-full placeholder-gray-400 text-[14px]"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-5 text-gray-300 hover:text-white"
              >
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
            {errors.password && <p className="text-red-400 text-[11px] mt-1 ml-4">{errors.password}</p>}
          </div>

          {/* remember me & forgot password */}
          <div className="flex items-center justify-between text-xs text-gray-300 mt-1 mb-5">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="w-3 h-3 rounded-3xl border-[#414141] accent-[#2196F3]"
              />
              remember me
            </label>
            <button type="button" onClick={handleForgotPasswordRedirect} className="text-xs text-blue-400 hover:underline">
              forgot password?
            </button>
          </div>

          {/* login button */}
          <button
            type="submit"
            disabled={loading}
            className="shadow-xl bg-[#2196F3] hover:bg-[#1A78C2] text-white font-semibold rounded-full w-full h-12 text-[14px] transition-all duration-200 mt-1 disabled:opacity-60"
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>

        <div className="text-xs text-gray-300 mt-4">
          don't have an account?{" "}
          <button type="button" onClick={handleRegisterRedirect} className="text-blue-400 hover:underline">
            register
          </button>
        </div>
      </div>
    </div>
  );
}
