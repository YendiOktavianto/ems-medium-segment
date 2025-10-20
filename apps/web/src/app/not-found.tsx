// app/not-found.tsx
"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import Image from "next/image";

export default function NotFound() {
  const router = useRouter();

  return (
    <main className="relative min-h-screen w-full overflow-hidden">
      <div className="absolute inset-0 -z-10">
        <img
          src="/sky.png"
          alt=""
          className="h-FULL w-full object-cover select-none pointer-events-none"
        />
        {/* overlay tipis supaya teks kebaca */}
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(0,30,70,0.35)_0%,rgba(0,20,50,0.65)_100%)]" />
      </div>

      {/* konten tengah */}
      <section className="relative mx-auto flex min-h-screen max-w-3xl flex-col items-center justify-center px-6 text-center text-white">
        <p className="mb-2 text-sm tracking-widest text-blue-200/90">ERROR</p>
        <img
          src="/404-blue-glow.svg"
          alt="svg"
          width={300}
          height={300}
          className="object-cover select-none pointer-events-none"
        />

        <h2 className="mt-2 text-2xl font-bold md:text-3xl">Page not found</h2>
        <p className="mt-3 max-w-xl text-blue-100/90">
          The page you're looking for isn't available or has been moved.
          Try returning to the homepage or returning to the previous page.
        </p>

        <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
          <button
            onClick={() => router.back()}
            className="rounded-full px-5 py-2 text-sm font-medium bg-white/10 hover:bg-white/20 backdrop-blur transition"
          >
            ← Back
          </button>
          <Link
            href="/"
            className="rounded-full px-5 py-2 text-sm font-medium bg-[#0B5BD3] hover:bg-[#0a56c9] shadow-lg shadow-blue-900/30 transition"
          >
            Go Home
          </Link>
        </div>

        {/* credit kecil opsional */}
        <div className="mt-10 text-[11px] text-blue-100/60">
          <span>Powered by Power Monitoring System</span>
        </div>
      </section>
    </main>
  );
}
