"use client";

import { useMemo, useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";

function slugify(s: string) {
  return s
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "")
    .substring(0, 48);
}

function toIDPhone(raw: unknown) {
  const digits = String(raw ?? "").replace(/\D/g, "");
  if (!digits) return "";
  let d = digits;
  if (d.startsWith("0")) d = "62" + d.slice(1);
  if (!d.startsWith("62")) d = "62" + d;
  return "+" + d;
}

export default function RegisterCompanyPage() {
  const router = useRouter();
  const qs = useSearchParams();

  const [companyName, setCompanyName] = useState("");
  const [slug, setSlug] = useState("");
  const [adminName, setAdminName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // prefill from query (optional)
  useEffect(() => {
    const pre = qs?.get("name");
    if (pre) setCompanyName(pre);
  }, [qs]);

  const autoSlug = useMemo(() => slugify(companyName), [companyName]);
  const effectiveSlug = slug || autoSlug;

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!companyName || !effectiveSlug || !adminName || !email || !password) {
      setError("Lengkapi semua field wajib.");
      return;
    }
    setBusy(true);
    try {
      const res = await fetch("/api/orgs/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          org_name: companyName,
          slug: effectiveSlug,
          admin: {
            username: adminName,
            email,
            phone: toIDPhone(phone),
            password,
          },
        }),
      });
      const json = (await res.json().catch(() => ({}))) as any;
      if (!res.ok) {
        setError(json?.message || json?.error || "Gagal mendaftar perusahaan.");
        setBusy(false);
        return;
      }

      // Expect { status, next, dev?: { verify_token } }
      const next = json?.next || `/t/${effectiveSlug}`;
      router.push(next);
    } catch (err: any) {
      setError(err?.message || "Terjadi kesalahan jaringan.");
      setBusy(false);
    }
  }

  return (
    <div className="min-h-[calc(100vh-64px)] flex items-center justify-center p-6">
      <form
        onSubmit={submit}
        className="w-full max-w-xl rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur"
      >
        <h1 className="text-2xl font-semibold mb-1">Daftar Perusahaan</h1>
        <p className="text-sm text-white/70 mb-6">
          Buat tenant baru dan admin pertama untuk mengelola perangkat.
        </p>

        {/* Company */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <label className="flex flex-col gap-1">
            <span className="text-sm">Nama Perusahaan *</span>
            <input
              className="rounded-lg bg-white/10 px-3 py-2 outline-none focus:ring-2 ring-sky-500"
              placeholder="Contoh: PT Sinar Jaya"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
            />
          </label>
          <label className="flex flex-col gap-1">
            <span className="text-sm">Slug (URL) *</span>
            <input
              className="rounded-lg bg-white/10 px-3 py-2 outline-none focus:ring-2 ring-sky-500"
              placeholder="otomatis dari nama"
              value={slug}
              onChange={(e) => setSlug(slugify(e.target.value))}
            />
            <span className="text-xs text-white/60">
              Akan digunakan: <code className="px-1 bg-white/10 rounded">{effectiveSlug || "-"}</code> → <code>/t/{effectiveSlug || "slug"}</code>
            </span>
          </label>
        </div>

        {/* Admin */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
          <label className="flex flex-col gap-1">
            <span className="text-sm">Nama Admin *</span>
            <input
              className="rounded-lg bg-white/10 px-3 py-2 outline-none focus:ring-2 ring-sky-500"
              placeholder="Nama lengkap admin"
              value={adminName}
              onChange={(e) => setAdminName(e.target.value)}
            />
          </label>
          <label className="flex flex-col gap-1">
            <span className="text-sm">Email Admin *</span>
            <input
              type="email"
              className="rounded-lg bg-white/10 px-3 py-2 outline-none focus:ring-2 ring-sky-500"
              placeholder="admin@perusahaan.co.id"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </label>
          <label className="flex flex-col gap-1">
            <span className="text-sm">Telepon Admin</span>
            <input
              className="rounded-lg bg-white/10 px-3 py-2 outline-none focus:ring-2 ring-sky-500"
              placeholder="+62xxxxxxxxxx"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
          </label>
          <label className="flex flex-col gap-1">
            <span className="text-sm">Password *</span>
            <input
              type="password"
              className="rounded-lg bg-white/10 px-3 py-2 outline-none focus:ring-2 ring-sky-500"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </label>
        </div>

        {error && (
          <div className="mt-4 text-sm text-red-300 rounded bg-red-900/30 px-3 py-2">
            {error}
          </div>
        )}

        <div className="mt-6 flex items-center gap-3">
          <button
            disabled={busy}
            className="rounded-full px-5 py-2 bg-sky-600 hover:bg-sky-700 disabled:opacity-50"
            type="submit"
          >
            {busy ? "Memproses..." : "Daftarkan Perusahaan"}
          </button>
          <a href="/" className="text-sm opacity-80 hover:opacity-100">
            Batal
          </a>
        </div>
      </form>
    </div>
  );
}
