"use client";

import React, { useState } from 'react';
import Image from "next/image";
import { useRouter } from "next/navigation";

const Page = () => {
  const router = useRouter();
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // Tambahkan tipe pada parameter e
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      alert("Passwords do not match!");
      return;
    }
    console.log("New Password:", newPassword);
    // tambahkan logic submit ke backend disini
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center bg-cover bg-center"
      style={{ backgroundImage: "url('/bg1.png')" }}
    >
      <div className="px-10 py-10 bg-gray-800/60 rounded-2xl shadow-lg w-full max-w-[440px] flex flex-col items-center">
        <button onClick={() => router.back()} className="self-start mb-[-10]">
          <Image src="/back.svg" alt="Back" width={30} height={30} />
        </button>
        
        {/* Logo */}
        <Image src="/key.svg" alt="Logo" width={170} height={170} className="mb-4" />

        {/* Heading */}
        <h1 className="text-2xl font-bold text-center text-white leading-relaxed mb-3">
          Change Password
        </h1>
        <p className="font-light text-center text-white mb-8">
          Enter your new password and confirm it
        </p>

        {/* Form */}
        <form className="flex flex-col items-center gap-6 w-full" onSubmit={handleSubmit}>
          {/* New Password */}
          <div className="h-12 flex items-center bg-[#3A3A3A]/40 rounded-full px-4 text-white w-full">
            <Image
              src="/pw.svg"
              alt="pw"
              width={20}
              height={20}
              className="mr-3 opacity-70"
            />
            <input
              type="password"
              placeholder="New Password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="bg-transparent outline-none w-full placeholder-gray-400"
            />
          </div>

          {/* Confirm Password */}
          <div className="h-12 flex items-center bg-[#3A3A3A]/40 rounded-full px-4 text-white w-full">
            <Image
              src="/pw.svg"
              alt="pw"
              width={20}
              height={20}
              className="mr-3 opacity-70"
            />
            <input
              type="password"
              placeholder="Confirm Password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="bg-transparent outline-none w-full placeholder-gray-400"
            />
          </div>

          {/* Button */}
          <button
            type="submit"
            className="shadow-xl bg-[#2196F3] hover:bg-[#1A78C2] text-white font-semibold rounded-full w-full h-12 transition-all duration-200"
          >
            Reset Password
          </button>
        </form>
      </div>
    </div>
  );
};

export default Page;
