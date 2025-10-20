import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ResetPasswordForm, PasswordStrength } from "./type";
import { validatePassword, validateConfirm, evaluatePasswordStrength } from "./validation";

export default function useResetPassword() {
  const router = useRouter();
  const params = useSearchParams();
  const token = params?.get("token") ?? "";

  const [form, setForm] = useState<ResetPasswordForm>({ password: "", confirm: "" });
  const [errorPassword, setErrorPassword] = useState("");
  const [errorConfirm, setErrorConfirm] = useState("");
  const [globalError, setGlobalError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState<PasswordStrength>("");

  const handleChange = (field: keyof ResetPasswordForm, value: string) => {
    setForm(prev => ({ ...prev, [field]: value }));
    if (field === "password") setPasswordStrength(evaluatePasswordStrength(value));
    if (errorPassword) setErrorPassword("");
    if (errorConfirm) setErrorConfirm("");
    if (globalError) setGlobalError("");
  };

  const validateFields = () => {
    const passErr = validatePassword(form.password);
    const confirmErr = validateConfirm(form.password, form.confirm);

    setErrorPassword(passErr);
    setErrorConfirm(confirmErr);

    if (!token) setGlobalError("Invalid or missing token");

    return !passErr && !confirmErr && !!token;
  };

  const handleSubmit = async () => {
    if (!validateFields()) return;

    setLoading(true);
    try {
      const res = await fetch("http://localhost:3000/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, newPassword: form.password }),
      });

      const data = await res.json();
      if (!res.ok) {
        setGlobalError(data.message || "Failed to reset password");
        setLoading(false);
        return;
      }

      setSuccess("Password has been reset, redirecting to login...");
      setTimeout(() => router.push("/login"), 2000);
    } catch {
      setGlobalError("Server error, please try again later");
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
