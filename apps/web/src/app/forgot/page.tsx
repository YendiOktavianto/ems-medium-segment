"use client";
import Image from "next/image";
import { useForgot } from "./useForgot";

export default function ForgotUI() {
  const { form, error, loading, handleChange, handleSubmit, router } = useForgot();

  return (
    <div
      className="min-h-screen flex items-center justify-center bg-cover bg-center"
      style={{ backgroundImage: "url('/bg1.png')" }}
    >
      <div className="px-10 py-10 bg-gray-800/60 rounded-2xl shadow-lg w-full max-w-[440px] flex flex-col items-center">
        <button onClick={() => router.back()} className="self-start mb-[-10]">
          <Image src="/back.svg" alt="Back" width={30} height={30} />
        </button>

        <Image src="/icon.svg" alt="Mail" width={200} height={200} className="mb-4" />

        <h1 className="text-2xl font-bold text-center text-white mb-3">
          Forgot Password
        </h1>
        <p className="font-light text-center text-white mb-6">
          Enter your email and we’ll send you a verification code
        </p>

        <form className="flex flex-col gap-6 w-full" onSubmit={handleSubmit} noValidate>
          <div className="flex flex-col w-full">
            <div className="flex items-center h-12 bg-gray-800 rounded-full px-4 text-white">
              <Image
                src="/email.svg"
                alt="email"
                width={18}
                height={18}
                className="mr-3 opacity-70"
              />
              <input
                type="text"
                placeholder="Email"
                value={form.email}
                onChange={(e) => handleChange(e.target.value)}
                className="bg-transparent outline-none w-full placeholder-gray-400"
              />
            </div>
            {error && <p className="text-red-400 text-[12px] ml-3 mt-1">{error}</p>}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="shadow-xl bg-[#2196F3] hover:bg-[#1A78C2] text-white font-semibold rounded-full w-full h-12 transition-all duration-200 disabled:opacity-60"
          >
            {loading ? "Sending..." : "Send Code"}
          </button>
        </form>
      </div>
    </div>
  );
}
