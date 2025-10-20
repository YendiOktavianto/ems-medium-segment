"use client";
import Image from "next/image";
import { useVerify } from "./useVerify";

export default function VerifyUI() {
  const {
    email,
    state,
    inputRefs,
    message,
    messageType,
    timer,
    handleChange,
    handleKeyDown,
    handleSubmit,
    handleResend,
  } = useVerify();

  return (
    <div
      className="min-h-screen flex items-center justify-center bg-cover bg-center"
      style={{ backgroundImage: "url('/bg1.png')" }}
    >
      <div className="px-10 py-10 bg-gray-800/60 rounded-2xl shadow-lg w-full max-w-[440px] flex flex-col items-center">
        <button onClick={() => history.back()} className="self-start mb-1">
          <Image src="/back.svg" alt="Back" width={30} height={30} />
        </button>

        <Image src="/mail.svg" alt="Logo" width={100} height={100} className="mb-5" />

        <h1 className="text-2xl font-bold text-center text-white leading-relaxed mb-3">
          Verify Your Mail
        </h1>
        <p className="font-light text-center text-white mb-6">
          Please enter the 4 digit code sent to <span className="block font-medium">{email}</span>
        </p>

        <form className="flex flex-col items-center gap-4 w-full" onSubmit={handleSubmit}>
          <div className="flex justify-center gap-4 w-full">
            {state.code.map((num, idx) => (
              <input
                key={idx}
                type="text"
                maxLength={1}
                value={num}
                autoFocus={idx === 0}
                ref={(el: HTMLInputElement | null) => {
                  inputRefs.current[idx] = el;
                }}
                onChange={(e) => handleChange(e.target.value, idx)}
                onKeyDown={(e) => handleKeyDown(e, idx)}
                className="w-12 h-12 text-center text-white bg-gray-800/60 rounded-lg outline-none focus:ring-2 focus:ring-[#2196F3] transition-all"
                inputMode="numeric"
                pattern="[0-9]*"
              />
            ))}
          </div>

          {messageType === "error" && (
            <p className="text-red-400 text-sm">{message}</p>
          )}

          <button
            type="submit"
            className="shadow-xl bg-[#2196F3] hover:bg-[#1A78C2] text-white font-semibold rounded-full w-full h-12 transition-all duration-200"
          >
            Verify
          </button>

          {messageType === "success" && (
            <div className="w-full text-center text-sm text-green-400 bg-green-900/30 py-2 px-3 rounded-lg">
              {message}
            </div>
          )}
        </form>

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
