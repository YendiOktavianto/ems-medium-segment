"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";

type FormState = {
  identifier: string;
  password_hash: string;
};

export default function Login() {
  const router = useRouter();

  const [form, setForm] = useState<FormState>({ identifier: "", password_hash: "" });
  const [errors, setErrors] = useState<FormState>({ identifier: "", password_hash: "" });
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleRegisterRedirect = () => router.push("/register");
  const handleForgotPasswordRedirect = () => router.push("/forgot");

  // validasi realtime & submit
  const validateField = (name: string, value: string) => {
    let error = "";
    if (name === "identifier") {
      if (!value) error = "username or email is required";
    } else if (name === "password_hash") {
      if (!value) error = "password is required";
      else if (value.length < 8) error = "password must be at least 8 characters";
    }
    return error;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });

    // validasi realtime
    const fieldError = validateField(name, value);
    setErrors({ ...errors, [name]: fieldError });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // validasi semua field sebelum submit
    const newErrors: FormState = {
      identifier: validateField("identifier", form.identifier),
      password_hash: validateField("password_hash", form.password_hash),
    };
    setErrors(newErrors);

    if (!Object.values(newErrors).every((err) => err === "")) return;

    setLoading(true);

    try {
      const res = await fetch("http://localhost:3000/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ ...form, rememberMe }),
      });

      const data = await res.json();

      if (!res.ok) {
        const msg = (data.message || "").toLowerCase();
        if (msg.includes("username") || msg.includes("identifier")) {
          setErrors({ identifier: "we couldn't find an account with this username or email", password_hash: "" });
        } else if (msg.includes("password")) {
          setErrors({ identifier: "", password_hash: "the password you entered is incorrect" });
        } else {
          setErrors({ identifier: "", password_hash: "something went wrong, please try again later" });
        }
        setLoading(false);
        return;
      }

      // redirect berdasarkan role
      if (data.role === "admin") router.push("/admin");
      else router.push("/dashboard");
    } catch (err) {
      setErrors({ identifier: "server error, please try again later", password_hash: "" });
      setLoading(false);
    }
  };

  return (
    <div
      className="h-screen w-screen flex items-center justify-center bg-cover bg-center overflow-hidden"
      style={{ backgroundImage: "url('/bg1.png')" }}
    >
      <div
        className="px-12 py-8 bg-gray-800/60 backdrop-blur-sm rounded-2xl shadow-xl
        w-full max-w-[440px] text-sm flex flex-col items-center
        max-h-[96vh] overflow-y-auto custom-scroll"
      >
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
          <div>
            <div className="w-full flex items-center px-4 h-12 bg-gray-800 rounded-full text-white focus-within:ring-2 focus-within:ring-blue-500 transition">
              <Image src="/pw.svg" alt="password" width={19} height={20} className="mr-3 opacity-70" />
              <input
                type="password"
                name="password_hash"
                placeholder="Password"
                value={form.password_hash}
                onChange={handleChange}
                className="bg-transparent outline-none w-full placeholder-gray-400 text-[14px]"
              />
            </div>
            {errors.password_hash && <p className="text-red-400 text-[11px] mt-1 ml-4">{errors.password_hash}</p>}
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
