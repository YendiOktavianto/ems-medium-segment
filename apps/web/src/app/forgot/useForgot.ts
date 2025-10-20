"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { ForgotForm } from "./type";
import { validateEmail } from "./validation";
import { ERROR_MESSAGES } from "./constants";
import { jsonFetch } from "../lib/api";
import { errorMessage } from "../lib/error";

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
      await jsonFetch<{ ok: boolean }>("/auth/forgot-password", {
        method: "POST",
        body: JSON.stringify({ email: form.email }),
      });
      // Selalu redirect ke verify, security-wise backend tidak bocorkan status email
      router.push(`/verify?email=${encodeURIComponent(form.email)}`);
    } catch (e: unknown) {
       setError(errorMessage(e, ERROR_MESSAGES.serverError));
    } finally {
      setLoading(false);
    }
  };

  return { form, error, loading, handleChange, handleSubmit, router };
};
