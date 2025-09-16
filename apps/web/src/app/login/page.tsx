"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter(); 
  
  const handleRegisterRedirect = () => {
    router.push("/register"); 
  };

  const handleForgotPasswordRedirect = () => {
    router.push("/forgot"); 
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center bg-cover bg-center"
      style={{ backgroundImage: "url('/bg1.png')" }}
    >
      <div className="px-10 py-8 bg-gray-800/60 rounded-2xl shadow-lg w-full max-w-[440px] flex flex-col items-center">
        {/* Logo */}
        <Image src="/logo.svg" alt="Logo" width={100} height={100} className="mb-2" />

        {/* Heading */}
        <h1 className="text-2xl font-bold text-center text-white leading-relaxed mb-6">
          Welcome to <br /> Power Management System
        </h1>

        {/* Form */}
        <form className="flex flex-col w-full gap-4">
          {/* Input Username */}
          <div className="h-12 flex items-center bg-[#3A3A3A]/40 rounded-full px-4 text-white">
            <Image
              src="/user.svg"
              alt="user"
              width={20}
              height={20}
              className="mr-3 opacity-70"
            />
            <input
              type="text"
              placeholder="Username"
              className="bg-transparent outline-none w-full placeholder-gray-400"
            />
          </div>

          {/* Input Password */}
          <div className="h-12 flex items-center bg-[#3A3A3A]/40 rounded-full px-4 text-white">
            <Image
              src="/pw.svg"
              alt="password"
              width={20}
              height={20}
              className="mr-3 opacity-70"
            />
            <input
              type="password"
              placeholder="Password"
              className="bg-transparent outline-none w-full placeholder-gray-400"
            />
          </div>

          {/* Remember Me + Forgot Password */}
          <div className="flex items-center justify-between text-sm text-gray-300 mt-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                className="w-3.5 h-3.5 rounded-3xl border-[#414141] accent-[#2196F3]"
              />
              Remember me
            </label>
            <button
              type="button"
              onClick={handleForgotPasswordRedirect}
              className="text-white hover:underline"
            >
              Forgot password?
            </button>
          </div>

          {/* Button */}
          <button
            type="submit"
            className="shadow-xl bg-[#2196F3] hover:bg-[#1A78C2] text-white font-semibold rounded-full w-full h-12 transition-all duration-200 mt-4"
          >
            Login
          </button>
        </form>

        {/* Register */}
        <div className="text-sm text-gray-300 mt-5">
          Don't have an account?{" "}
          <button type="button" onClick={handleRegisterRedirect} className="text-white hover:underline">
            Register
          </button>
        </div>
      </div>
    </div>
  );
}
