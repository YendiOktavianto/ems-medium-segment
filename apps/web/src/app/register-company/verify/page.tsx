
// FILE: src/app/register-company/verify/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export default function VerifyPage() {
  const qs = useSearchParams();
  const token = qs?.get("token") || "";
  const router = useRouter();
  const [msg, setMsg] = useState("Memverifikasi...");

  useEffect(() => {
    if (!token) {
      setMsg("Token tidak ditemukan.");
      return;
    }
    (async () => {
      const res = await fetch(`/api/orgs/verify?token=${encodeURIComponent(token)}`);
      const json = await res.json().catch(() => ({}));
      if (res.ok) {
        setMsg("Verifikasi berhasil. Mengarahkan...");
        const slug = json?.slug || "";
        setTimeout(() => router.push(slug ? `/t/${slug}` : "/"), 800);
      } else {
        setMsg(json?.message || json?.error || "Verifikasi gagal.");
      }
    })();
  }, [token, router]);

  return (
    <div className="min-h-[calc(100vh-64px)] flex items-center justify-center p-8">
      <div className="w-full max-w-md rounded-2xl border border-white/10 bg-white/5 p-6">
        <h1 className="text-xl font-semibold mb-2">Verifikasi Email</h1>
        <p className="text-white/80">{msg}</p>
      </div>
    </div>
  );
}
