"use client";
import { useState, useRef, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { VerifyState, MessageType } from "./type";
import { validateOTP } from "./validation";
import { MESSAGES, OTP_LENGTH } from "./constants";

export const useVerify = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams?.get("email") || "example@gmail.com";

  const [state, setState] = useState<VerifyState>({ code: Array(OTP_LENGTH).fill("") });
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState<MessageType>("");
  const [timer, setTimer] = useState(0);

  // Countdown timer untuk resend
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (timer > 0) {
      interval = setInterval(() => setTimer((prev) => prev - 1), 1000);
    }
    return () => clearInterval(interval);
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

  const handleChange = (value: string, index: number) => {
    if (/^[0-9]?$/.test(value)) {
      const newCode = [...state.code];
      newCode[index] = value;
      setState({ code: newCode });
      if (value && index < OTP_LENGTH - 1 && inputRefs.current[index + 1]) {
        inputRefs.current[index + 1]?.focus();
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
    if (e.key === "Backspace" && !state.code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const validationError = validateOTP(state.code);
    if (validationError) {
      setMessageType("error");
      setMessage(validationError);
      return;
    }

    // Dummy backend check
    const isValid = state.code.join("") === "1234";
    if (!isValid) {
      setMessageType("error");
      setMessage(MESSAGES.invalidCode);
      return;
    }

    setMessageType("success");
    setMessage(MESSAGES.success);
    setTimeout(() => router.push("/resetpassword"), 1500);
  };

  const handleResend = () => {
    // TODO: panggil API backend
    setMessageType("success");
    setMessage(MESSAGES.resendSuccess(email));
    setTimer(60);
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
