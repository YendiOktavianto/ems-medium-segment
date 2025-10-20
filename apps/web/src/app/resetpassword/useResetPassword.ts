import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ResetPasswordForm, PasswordStrength } from "./type";
import { validatePassword, validateConfirm, evaluatePasswordStrength } from "./validation";
import { jsonFetch } from "../lib/api";
import { errorMessage } from "../lib/error";

export default function useResetPassword() {
  const router = useRouter();
  const params = useSearchParams();
  const email = params?.get("email") ?? "";
  const code = params?.get("code") ?? "";

  const [form, setForm] = useState<ResetPasswordForm>({ password: "", confirm: "" });
  const [errorPassword, setErrorPassword] = useState("");
  const [errorConfirm, setErrorConfirm] = useState("");
  const [globalError, setGlobalError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState<PasswordStrength>("");

 const handleChange = (field: keyof ResetPasswordForm, value: string) => {
    setGlobalError("");
    setSuccess("");
    setForm((s) => ({ ...s, [field]: value }));

    if (field === "password") {
      setErrorPassword(validatePassword(value));
      setPasswordStrength(evaluatePasswordStrength(value));
      // sinkronisasi confirm bila sudah diisi
      if (form.confirm) setErrorConfirm(validateConfirm(value, form.confirm));
    }
    if (field === "confirm") {
      setErrorConfirm(validateConfirm(form.password, value));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const pErr = validatePassword(form.password);
    const cErr = validateConfirm(form.password, form.confirm);
    setErrorPassword(pErr);
    setErrorConfirm(cErr);
    if (pErr || cErr) return;

    setLoading(true);
    try {
      const res = await jsonFetch<{ ok: boolean }>("/auth/reset-password", {
        method: "POST",
        body: JSON.stringify({
          email,
          code,
          newPassword: form.password,
        }),
      });
      if (!res.ok) {
        setGlobalError("Reset password gagal. Periksa kembali kode Anda.");
        return;
      }
      setSuccess("Password berhasil diubah. Mengalihkan ke halaman login...");
      setTimeout(() => router.replace("/login"), 1200);
    } catch (e: unknown) {
      setGlobalError(errorMessage(e, "Terjadi kesalahan server"));
    } finally {
      setLoading(false);
    }
  };

  return {
    form,
    errorPassword,
    errorConfirm,
    globalError,
    success,
    loading,
    passwordStrength,
    handleChange,
    handleSubmit,
    setForm,
  };
}
