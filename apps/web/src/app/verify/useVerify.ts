"use client";
import { useState, useRef, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { VerifyState, MessageType } from "./type";
import { validateOTP } from "./validation";
import { MESSAGES, OTP_LENGTH } from "./constants"; 
import { jsonFetch } from "../lib/api";
import { errorMessage } from "../lib/error";

export const useVerify = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams?.get("email") || "";

  const [state, setState] = useState<VerifyState>({ code: Array(OTP_LENGTH).fill("") });
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState<MessageType>("");
  const [timer, setTimer] = useState(0);

  // Countdown timer untuk resend
  useEffect(() => {
    inputRefs.current[0]?.focus();
    if (timer <= 0) return;
    const t = setTimeout(() => setTimer((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [timer]);

  // otomatis hilangkan pesan sukses/error setelah 5 detik
  useEffect(() => {
    if (!messageType) return;
    const timeout = setTimeout(() => {
      setMessage("");
      setMessageType("");
    }, 5000);
    return () => clearTimeout(timeout);
  }, [messageType]);

  const handleChange = (idx: number, val: string) => {
    setMessage("");
    if (!/^\d?$/.test(val)) return; // hanya digit
    setState((s) => {
      const next = [...s.code];
      next[idx] = val;
      return { code: next };
    });
    if (val && idx < OTP_LENGTH - 1) inputRefs.current[idx + 1]?.focus();
  };

  const handleKeyDown = (idx: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !state.code[idx] && idx > 0) {
      inputRefs.current[idx - 1]?.focus();
    }
  };

  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const err = validateOTP(state.code);
    if (err) {
      setMessage(err);
      setMessageType("error");
      return;
    }
    
    const code = state.code.join("");

    try {
      const res = await jsonFetch<{ ok: boolean }>("/auth/verify-reset-code", {
        method: "POST",
        body: JSON.stringify({ email, code }),
      });
      if (!res.ok) {
        setMessage(MESSAGES.invalidCode);
        setMessageType("error");
        return;
      }
      setMessage(MESSAGES.success);
      setMessageType("success");
      // arahkan ke resetpassword sambil bawa email & code
      router.push(`/resetpassword?email=${encodeURIComponent(email)}&code=${encodeURIComponent(code)}`);
    } catch (e: unknown) {
      setMessage(errorMessage(e, MESSAGES.invalidCode));
      setMessageType("error");
    }
  };

  const handleResend = async () => {
    if (timer > 0) return;
    try {
      await jsonFetch<{ ok: boolean }>("/auth/forgot-password", {
        method: "POST",
        body: JSON.stringify({ email }),
      });
      setMessage(MESSAGES.resendSuccess(email));
      setMessageType("success");
      setTimer(60);
    } catch (e: unknown) {
      setMessage(errorMessage(e, "Failed to resend code"));
      setMessageType("error");
    }
  };

  return {
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
  };
};
