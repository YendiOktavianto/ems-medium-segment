"use client";

import React from 'react'
import Image from "next/image";
import { useRouter } from "next/navigation";

const Page = () => {
  const router = useRouter(); 

  const handleLoginRedirect = () => {
    router.push("/login"); 
  };
  
  return (
    <div
      className="min-h-screen flex justify-center bg-cover bg-center bg-fixed py-16"
      style={{ backgroundImage: "url('/bg1.png')" }}
    >
      <div className="px-10 py-5 bg-gray-800/60 rounded-2xl shadow-lg w-[440px] flex flex-col items-center">
        {/* Logo */}
        <Image src="/logo.svg" alt="Logo" width={80} height={80} className="mx-1" />

        {/* Heading */}
        <h2 className="text-2xl font-bold text-center text-white leading-relaxed mb-3">
          Register
        </h2>

        {/* Form */}
        <form className="flex flex-col w-80 gap-4">
          {/* Input Full Name */}
          <div className="h-12 flex items-center bg-[#3A3A3A]/40 rounded-full px-4 text-white">
            <Image src="/user.svg" alt="user" width={20} height={20} className="mr-3 opacity-70" />
            <input
              type="text"
              placeholder="Full Name"
              className="bg-transparent outline-none w-full placeholder-gray-400"
            />
          </div>

          {/* Input Email */}
          <div className="h-12 flex items-center bg-[#3A3A3A]/40 rounded-full px-4 text-white">
            <Image src="/email.svg" alt="user" width={20} height={20} className="mr-3 opacity-70" />
            <input
              type="email"
              placeholder="Email"
              className="bg-transparent outline-none w-full placeholder-gray-400"
            />
          </div>

          {/* Input Address */}
          <div className="h-12 flex items-center bg-[#3A3A3A]/40 rounded-full px-4 text-white">
            <Image src="/location.svg" alt="user" width={20} height={20} className="mr-3 opacity-70" />
            <input
              type="text"
              placeholder="Address"
              className="bg-transparent outline-none w-full placeholder-gray-400"
            />
          </div>

          {/* Input Number Phone */}
          <div className="h-12 flex items-center bg-[#3A3A3A]/40 rounded-full px-4 text-white">
            <Image src="/contact.svg" alt="user" width={20} height={20} className="mr-3 opacity-70" />
            <input
              type="text"
              placeholder="Number Phone"
              className="bg-transparent outline-none w-full placeholder-gray-400"
            />
          </div>

          {/* Input Password */}
          <div className="h-12 flex items-center bg-[#3A3A3A]/40 rounded-full px-4 text-white">
            <Image src="/pw.svg" alt="password" width={20} height={20} className="mr-3 opacity-70" />
            <input
              type="password"
              placeholder="Password"
              className="bg-transparent outline-none w-full placeholder-gray-400"
            />
          </div>

          {/* Input Confirm Password */}
          <div className="h-12 flex items-center bg-[#3A3A3A]/40 rounded-full px-4 text-white">
            <Image src="/pw.svg" alt="password" width={20} height={20} className="mr-3 opacity-70" />
            <input
              type="password"
              placeholder="Confirm Password"
              className="bg-transparent outline-none w-full placeholder-gray-400"
            />
          </div>

          {/* Button */}
          <button
            type="submit"
            className="shadow-xl bg-[#2196F3] hover:bg-[#1A78C2] text-white font-semibold py-2 rounded-full w-full h-10 transition-all duration-200 mt-5"
          >
            Register
          </button>
        </form>

        {/* Have account Register */}
        <div className="text-sm text-gray-300 mt-5 mb-1">
          Already have an account?{" "}
          <button type="button" onClick={handleLoginRedirect} className="text-white hover:underline">
            Login
          </button>
        </div>
      </div>
    </div>
  );
};

export default Page;
