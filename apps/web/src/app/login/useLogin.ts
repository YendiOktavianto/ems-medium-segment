"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { FormState, ErrorsState, Role } from "./type";
import { validateField } from "./validation";
import { ERROR_MESSAGES, ROLE_REDIRECT } from "./constants";

export const useLogin = () => {
  const router = useRouter();

  const [form, setForm] = useState<FormState>({ identifier: "", password_hash: "" });
  const [errors, setErrors] = useState<ErrorsState>({ identifier: "", password_hash: "" });
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
          setErrors({ identifier: "", password_hash: ERROR_MESSAGES.unknownError });
        }
        setLoading(false);
        return;
      }

      const role: Role = data.role;
      router.push(ROLE_REDIRECT[role]);
    } catch (err) {
      setErrors({ identifier: ERROR_MESSAGES.serverError, password_hash: "" });
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
