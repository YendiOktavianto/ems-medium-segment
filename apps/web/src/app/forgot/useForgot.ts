"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { ForgotForm } from "./type";
import { validateEmail } from "./validation";
import { ERROR_MESSAGES } from "./constants";

export const useForgot = () => {
  const router = useRouter();

  const [form, setForm] = useState<ForgotForm>({ email: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (value: string) => {
    setForm({ email: value });
    setError("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const emailError = validateEmail(form.email);
    if (emailError) {
      setError(emailError);
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("http://localhost:3000/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: form.email }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || ERROR_MESSAGES.sendFailed);
        setLoading(false);
        return;
      }

      router.push(`/verify?email=${encodeURIComponent(form.email)}`);
    } catch {
      setError(ERROR_MESSAGES.serverError);
    } finally {
      setLoading(false);
    }
  };

  return { form, error, loading, handleChange, handleSubmit, router };
};
