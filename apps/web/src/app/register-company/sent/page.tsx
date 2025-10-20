
// FILE: src/app/register-company/sent/page.tsx
"use client";

import { useSearchParams, useRouter } from "next/navigation";

export default function SentPage() {
  const qs = useSearchParams();
  const mode = qs?.get("mode");
  const router = useRouter();

  return (
    <div className="min-h-[calc(100vh-64px)] flex items-center justify-center p-8">
      <div className="w-full max-w-xl rounded-2xl border border-white/10 bg-white/5 p-6">
        <h1 className="text-2xl font-semibold mb-2">Pendaftaran Dikirim</h1>
        {mode === "email" && (
          <p className="text-white/80">
            Kami telah mengirim email verifikasi ke admin. Silakan cek inbox dan klik tautan untuk mengaktifkan perusahaan.
          </p>
        )}
        {mode === "approval" && (
          <p className="text-white/80">
            Permintaan kamu sudah diterima. Mohon tunggu persetujuan admin platform.
          </p>
        )}
        {!mode && (
          <p className="text-white/80">Permintaan pendaftaran telah diproses.</p>
        )}

        <div className="mt-6 flex gap-3">
          <button onClick={() => router.push("/")} className="rounded-full px-5 py-2 bg-white/10 hover:bg-white/20">
            Kembali ke Beranda
          </button>
        </div>
      </div>
    </div>
  );
}
