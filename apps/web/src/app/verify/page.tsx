/* eslint-disable react/no-unescaped-entities */
"use client";

import { useSearchParams } from "next/navigation";
import { useState, useRef } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";

export default function Verify() {
  const router = useRouter(); 
  const searchParams = useSearchParams();
  const email = searchParams.get("email") || "example@gmail.com";

  const [code, setCode] = useState(["", "", "", ""]);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
    const val = e.target.value;
    if (/^[0-9]?$/.test(val)) {
      const newCode = [...code];
      newCode[index] = val;
      setCode(newCode);
      if (val && index < 3 && inputRefs.current[index + 1]) {
        inputRefs.current[index + 1]?.focus();
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
    if (e.key === "Backspace" && !code[index] && index > 0 && inputRefs.current[index - 1]) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const finalCode = code.join("");
    console.log("Kode verifikasi:", finalCode, "untuk email:", email);
    // TODO: submit ke backend
  };

  const handleResend = () => {
    alert(`Verification code resent to ${email}`);
    // TODO: panggil API resend
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-cover bg-center" style={{ backgroundImage: "url('/bg1.png')" }}>
      <div className="px-10 py-10 bg-gray-800/60 rounded-2xl shadow-lg w-full max-w-[440px] flex flex-col items-center">
        <button onClick={() => router.back()} className="self-start mb-1">
          <Image src="/back.svg" alt="Back" width={30} height={30} />
        </button>
        <Image src="/mail.svg" alt="Logo" width={90} height={90} className="mb-5" />

        <h1 className="text-2xl font-bold text-center text-white leading-relaxed mb-3">
          Verify Your Mail
        </h1>
        <p className="font-light text-center text-white mb-8">
          Please enter the 4 digit code sent to <span className="block font-medium">{email}</span>
        </p>

        <form className="flex flex-col items-center gap-6 w-full" onSubmit={handleSubmit}>
          <div className="flex justify-center gap-4 w-full">
            {code.map((num, idx) => (
              <input
                key={idx}
                type="text"
                maxLength={1}
                value={num}
                autoFocus={idx === 0}
                ref={(el) => { inputRefs.current[idx] = el; }}
                onChange={(e) => handleChange(e, idx)}
                onKeyDown={(e) => handleKeyDown(e, idx)}
                className="w-12 h-12 text-center text-white bg-[#3A3A3A]/40 rounded-lg outline-none focus:ring-2 focus:ring-[#2196F3] transition-all"
                inputMode="numeric"
                pattern="[0-9]*"
              />
            ))}
          </div>

          <button type="submit" className="shadow-xl bg-[#2196F3] hover:bg-[#1A78C2] text-white font-semibold rounded-full w-full h-12 transition-all duration-200">
            Verify
          </button>
        </form>

        <p className="mt-6 text-white text-sm">
          Didn't receive the code?{" "}
          <span onClick={handleResend} className="text-[#2196F3] cursor-pointer select-none">
            Resend
          </span>
        </p>
      </div>
    </div>
  );
}
