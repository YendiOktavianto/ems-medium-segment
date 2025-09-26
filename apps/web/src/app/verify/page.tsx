/* eslint-disable react/no-unescaped-entities */
"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useState, useRef, useEffect } from "react";
import Image from "next/image";

export default function Verify() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // pastikan typescript mengenal email sebagai string
  const email: string = searchParams?.get("email") || "example@gmail.com";

  const [code, setCode] = useState(["", "", "", ""]);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // message + type
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState<"success" | "error" | "">("");
  const [timer, setTimer] = useState(0);

  // Countdown timer untuk resend
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [timer]);

  // otomatis hilangkan pesan sukses/error setelah 5 detik
  useEffect(() => {
    if (!messageType) return;

    const timeout = setTimeout(() => {
      setMessage("");
      setMessageType("");
    }, 5000);

    return () => clearTimeout(timeout);
  }, [messageType]);

  // handle input kode OTP
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

  // Submit kode OTP
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const finalCode = code.join("");

    // Validasi kosong
    if (finalCode.length < 4) {
      setMessageType("error");
      setMessage("Please enter the complete 4-digit code");
      return;
    }

    // TODO: cek ke backend
    const isValid = finalCode === "1234"; // dummy
    if (!isValid) {
      setMessageType("error");
      setMessage("Invalid verification code");
      return;
    }

    // jika valid
    setMessageType("success");
    setMessage("Verification successful! Redirecting...");
    setTimeout(() => {
      router.push("/resetpassword");
    }, 1500);
  };

  // Resend kode OTP
  const handleResend = () => {
    // TODO: panggil API resend ke backend
    setMessageType("success");
    setMessage(`Verification code has been resent to ${email}`);
    setTimer(60); // mulai countdown 60 detik
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center bg-cover bg-center"
      style={{ backgroundImage: "url('/bg1.png')" }}
    >
      <div className="px-10 py-10 bg-gray-800/60 rounded-2xl shadow-lg w-full max-w-[440px] flex flex-col items-center">
        {/* Tombol back */}
        <button onClick={() => router.back()} className="self-start mb-1">
          <Image src="/back.svg" alt="Back" width={30} height={30} />
        </button>

        {/* Icon mail */}
        <Image src="/mail.svg" alt="Logo" width={100} height={100} className="mb-5" />

        {/* Judul */}
        <h1 className="text-2xl font-bold text-center text-white leading-relaxed mb-3">
          Verify Your Mail
        </h1>
        <p className="font-light text-center text-white mb-6">
          Please enter the 4 digit code sent to <span className="block font-medium">{email}</span>
        </p>

        {/* Form */}
        <form className="flex flex-col items-center gap-4 w-full" onSubmit={handleSubmit}>
          <div className="flex justify-center gap-4 w-full">
            {code.map((num, idx) => (
              <input
                key={idx}
                type="text"
                maxLength={1}
                value={num}
                autoFocus={idx === 0}
                ref={(el) => {
                  inputRefs.current[idx] = el;
                }}
                onChange={(e) => handleChange(e, idx)}
                onKeyDown={(e) => handleKeyDown(e, idx)}
                className="w-12 h-12 text-center text-white bg-gray-800/60 rounded-lg outline-none focus:ring-2 focus:ring-[#2196F3] transition-all"
                inputMode="numeric"
                pattern="[0-9]*"
              />
            ))}
          </div>

          {/* Error kecil tepat di bawah input */}
          {messageType === "error" && (
            <p className="text-red-400 text-sm">{message}</p>
          )}

          {/* Tombol Verify */}
          <button
            type="submit"
            className="shadow-xl bg-[#2196F3] hover:bg-[#1A78C2] text-white font-semibold rounded-full w-full h-12 transition-all duration-200"
          >
            Verify
          </button>

          {/* Alert hijau profesional */}
          {messageType === "success" && (
            <div className="w-full text-center text-sm text-green-400 bg-green-900/30 py-2 px-3 rounded-lg">
              {message}
            </div>
          )}
        </form>

        {/* Resend */}
        <p className="text-xs text-gray-300 mt-4">
          Didn't receive the code?{" "}
          <span
            onClick={timer === 0 ? handleResend : undefined}
            className={`${
              timer === 0
                ? "text-[#2196F3] cursor-pointer"
                : "text-gray-400 cursor-not-allowed"
            } select-none`}
          >
            {timer > 0 ? `Resend in ${timer}s` : "Resend"}
          </span>
        </p>
      </div>
    </div>
  );
}
