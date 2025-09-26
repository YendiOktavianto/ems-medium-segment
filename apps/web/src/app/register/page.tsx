/* eslint-disable @typescript-eslint/no-unused-expressions */
"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState, useRef } from "react";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import PhoneInput from "react-phone-input-2";

type FormState = {
  email: string;
  username: string;
  phone_number: string;
  password_hash: string;
  confirmPassword: string;
};

export default function Register() {
  const router = useRouter();

  const [form, setForm] = useState<FormState>({
    email: "",
    username: "",
    phone_number: "",
    password_hash: "",
    confirmPassword: "",
  });

  const [errors, setErrors] = useState<FormState>({
    email: "",
    username: "",
    phone_number: "",
    password_hash: "",
    confirmPassword: "",
  });

  // separate state for each password input
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const refs = {
    email: useRef<HTMLInputElement | null>(null),
    username: useRef<HTMLInputElement | null>(null),
    password: useRef<HTMLInputElement | null>(null),
    confirmPassword: useRef<HTMLInputElement | null>(null),
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: "" });
  };

  const validateForm = (form: FormState) => {
    let newErrors: FormState = {
      email: "",
      username: "",
      phone_number: "",
      password_hash: "",
      confirmPassword: "",
    };

    if (!form.email) newErrors.email = "email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
      newErrors.email = "please enter a valid email address";

    if (!form.username) newErrors.username = "username is required";
    else if (form.username.length < 3)
      newErrors.username = "username must be at least 3 characters";

    const numericPhone = form.phone_number.replace(/\D/g, "");
    if (!form.phone_number) newErrors.phone_number = "phone number is required";
    else if (form.phone_number.length < 9) newErrors.phone_number = "phone number is too short";
    else if (form.phone_number.length > 15) newErrors.phone_number = "phone number is too long";

    if (!form.password_hash) newErrors.password_hash = "password is required";
    else if (form.password_hash.length < 8)
      newErrors.password_hash = "password must be at least 8 characters";
    else if (
      !/(?=.*[A-Za-z])/.test(form.password_hash) ||
      !/(?=.*\d)/.test(form.password_hash) ||
      !/(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?])/g.test(form.password_hash)
    )
      newErrors.password_hash =
        "password must include letters, numbers, and special characters";

    if (!form.confirmPassword) newErrors.confirmPassword = "confirm password is required";
    else if (form.confirmPassword !== form.password_hash)
      newErrors.confirmPassword = "confirm password does not match";

    return newErrors;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors = validateForm(form);
    setErrors(newErrors);

    if (Object.values(newErrors).every((err) => err === "")) {
      try {
        const res = await fetch("http://localhost:3000/auth/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form),
        });

        const data = await res.json();

        if (!res.ok) {
          if (data.message?.toLowerCase().includes("username")) {
            setErrors({ ...errors, username: data.message });
          } else if (data.message?.toLowerCase().includes("email")) {
            setErrors({ ...errors, email: data.message });
          } else {
            setErrors({ ...errors, password_hash: "registration failed, please try again" });
          }
        } else {
          router.push("/login");
        }
      } catch {
        setErrors({
          ...errors,
          email: "server error, please try again later",
        });
      }
    }
  };

  const handleLoginRedirect = () => {
    router.push("/login");
  };

  return (
    <div
      className="h-screen w-screen flex items-center justify-center bg-cover bg-center overflow-hidden"
      style={{ backgroundImage: "url('/bg1.png')" }}
    >
      <div className="px-8 py-5 bg-gray-800/60 backdrop-blur-sm rounded-2xl shadow-xl
        w-full max-w-[440px] text-sm flex flex-col items-center
        max-h-[96vh] overflow-y-auto custom-scroll"
      >
        <div className="flex items-center w-full mb-6">
          <Image src="/logo.svg" alt="Logo" width={65} height={65} className="mr-4" />
          <div className="flex flex-col">
            <h1 className="text-xl font-bold text-white leading-tight">Create Your Account</h1>
            <p className="text-[12px] text-gray-300 leading-tight mt-1">
              Sign up to start managing your devices with ease.
            </p>
          </div>
        </div>

        <form className="flex flex-col w-full gap-4" onSubmit={handleSubmit}>
          {/* email */}
          <div>
            <div className="w-full flex items-center px-4 h-10 bg-gray-800 rounded-full text-white">
              <Image src="/email.svg" alt="email" width={17} height={19} className="mr-3 opacity-70" />
              <input
                type="text"
                name="email"
                placeholder="Email"
                value={form.email}
                onChange={handleChange}
                ref={refs.email}
                className="bg-transparent outline-none w-full placeholder-gray-400 text-[14px]"
              />
            </div>
            {errors.email && <p className="text-red-400 text-[11px] mt-1 ml-4">{errors.email}</p>}
          </div>

          {/* username */}
          <div>
            <div className="w-full flex items-center px-4 h-10 bg-gray-800 rounded-full text-white">
              <Image src="/user.svg" alt="user" width={17} height={19} className="mr-3 opacity-70" />
              <input
                type="text"
                name="username"
                placeholder="Username"
                value={form.username}
                onChange={handleChange}
                ref={refs.username}
                className="bg-transparent outline-none w-full placeholder-gray-400 text-[14px]"
              />
            </div>
            {errors.username && <p className="text-red-400 text-[11px] mt-1 ml-4">{errors.username}</p>}
          </div>

          {/* phone */}
          <div>
            <div className="w-full flex items-center px-3 h-10 bg-gray-800 rounded-full text-white">
              <PhoneInput
                country={"id"}
                value={form.phone_number}
                onChange={(phone) => setForm({ ...form, phone_number: phone })}
                inputClass="!bg-transparent !outline-none !w-full !placeholder-gray-400 !h-12 !pl-11 !text-sm !text-white"
                buttonClass="!bg-transparent !border-none !h-12 !ml-[-3px] !outline-none"
                dropdownClass="!bg-[#282C32] !text-white !hover:bg-black !rounded-sm"
                placeholder="Phone Number"
              />
            </div>
            {errors.phone_number && <p className="text-red-400 text-[11px] mt-1 ml-4">{errors.phone_number}</p>}
          </div>

          {/* password */}
          <div className="relative">
            <div className="flex items-center h-10 bg-gray-800 rounded-full px-4 text-white">
              <Image src="/pw.svg" alt="password" width={19} height={20} className="mr-3 opacity-70" />
              <input
                type={showPassword ? "text" : "password"}
                name="password_hash"
                placeholder="Password"
                value={form.password_hash}
                onChange={handleChange}
                ref={refs.password}
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
            {errors.password_hash && <p className="text-red-400 text-[11px] mt-1 ml-4">{errors.password_hash}</p>}
          </div>

          {/* confirm password */}
          <div className="relative">
            <div className="flex items-center h-10 bg-gray-800 rounded-full px-4 text-white">
              <Image src="/pw.svg" alt="confirm password" width={19} height={20} className="mr-3 opacity-70" />
              <input
                type={showConfirmPassword ? "text" : "password"}
                name="confirmPassword"
                placeholder="Confirm Password"
                value={form.confirmPassword}
                onChange={handleChange}
                ref={refs.confirmPassword}
                className="bg-transparent outline-none w-full placeholder-gray-400 text-[14px]"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-5 text-gray-300 hover:text-white"
              >
                {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
            {errors.confirmPassword && <p className="text-red-400 text-[11px] mt-1 ml-4">{errors.confirmPassword}</p>}
          </div>

          <button
            type="submit"
            className="shadow-xl bg-[#2196F3] hover:bg-[#1A78C2] text-white font-semibold rounded-full w-full h-10 text-[14px] transition-all duration-200 mt-1"
          >
            Register
          </button>
        </form>

        <div className="text-xs text-gray-300 mt-4">
          Already have an account?{" "}
          <button
            type="button"
            onClick={handleLoginRedirect}
            className="text-blue-400 hover:underline"
          >
            Login
          </button>
        </div>
      </div>
    </div>
  );
}
