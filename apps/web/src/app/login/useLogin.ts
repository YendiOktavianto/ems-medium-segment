"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { FormState, ErrorsState, Role } from "./type";
import { validateField } from "./validation";
import { ERROR_MESSAGES, ROLE_REDIRECT } from "./constants";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

export const useLogin = () => {
  const router = useRouter();

  const [form, setForm] = useState<FormState>({ identifier: "", password: "" });
  const [errors, setErrors] = useState<ErrorsState>({ identifier: "", password: "" });
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
    setErrors({ ...errors, [name]: validateField(name, value) });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const newErrors: ErrorsState = {
      identifier: validateField("identifier", form.identifier),
      password: validateField("password", form.password),
    };
    setErrors(newErrors);

    if (!Object.values(newErrors).every((err) => err === "")) return;

    setLoading(true);

    try {
      console.debug("[ENV] API_URL =", API_URL);
      console.debug("[LOGIN][REQ]", { url: `${API_URL}/auth/login`, body: { ...form, rememberMe } });
      const res = await fetch(`${API_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ ...form, rememberMe }),
      });

      const data = await res.json();

    if (!res.ok) {
      // 1) Backend baru: pakai payload per-field
      if (data?.errors && typeof data.errors === "object") {
        setErrors({
          identifier: data.errors.identifier ?? "",
          password:   data.errors.password   ?? "",
        });
      } else {
        // 2) Fallback backend lama: parse message tunggal
        const msg = String(data?.message ?? "").toLowerCase();
        if (msg.includes("username") || msg.includes("email") || msg.includes("identifier")) {
          setErrors({ identifier: "Incorrect Email or Username", password: "" });
        } else if (msg.includes("password")) {
          setErrors({ identifier: "", password: "Incorrect Password" });
        } else if (msg.includes("invalid credentials")) {
          // tampilkan dua-duanya jika pesan generik
          setErrors({ identifier: "Incorrect Email or Username", password: "Incorrect Password" });
        } else {
          setErrors({ identifier: "", password: ERROR_MESSAGES.unknownError });
        }
      }
      setLoading(false);
      return;
    }

      const role = (data?.role || data?.user?.role || "user") as Role;
      const target = ROLE_REDIRECT?.[role] || "/dashboard";
      console.debug("[LOGIN] redirect ->", target);
      router.push(target);
    } catch (err) {
      setErrors({ identifier: ERROR_MESSAGES.serverError, password: "" });
      setLoading(false);
    }
  };

  return {
    form,
    errors,
    rememberMe,
    loading,
    showPassword,
    setShowPassword,
    setRememberMe,
    handleChange,
    handleSubmit,
    router,
  };
};
