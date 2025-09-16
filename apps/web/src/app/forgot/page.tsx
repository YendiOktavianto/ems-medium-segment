"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const router = useRouter();

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (email) {
      router.push(`/verify?email=${encodeURIComponent(email)}`);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-cover bg-center" style={{ backgroundImage: "url('/bg1.png')" }}>
      <div className="px-10 py-10 bg-gray-800/60 rounded-2xl shadow-lg w-full max-w-[440px] flex flex-col items-center">
        <button onClick={() => router.back()} className="self-start mb-1">
          <Image src="/back.svg" alt="Back" width={30} height={30} />
        </button>
        <Image src="/icon.svg" alt="Logo" width={150} height={150} className="mb-5" />

        <h1 className="text-2xl font-bold text-center text-white leading-relaxed mb-3">
          Forgot Password?
        </h1>
        <p className="font-light text-center text-white mb-8">
          Enter your email to receive a verification code
        </p>

        <form className="flex flex-col items-center gap-6 w-full" onSubmit={handleSubmit}>
          <div className="h-12 flex items-center bg-[#3A3A3A]/40 rounded-full px-4 text-white w-full">
            <Image src="/email.svg" alt="email" width={20} height={20} className="mr-3 opacity-70" />
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="bg-transparent outline-none w-full placeholder-gray-400"
            />
          </div>

          <button type="submit" className="shadow-xl bg-[#2196F3] hover:bg-[#1A78C2] text-white font-semibold rounded-full w-full h-12 transition-all duration-200">
            Send
          </button>
        </form>
      </div>
    </div>
  );
}
