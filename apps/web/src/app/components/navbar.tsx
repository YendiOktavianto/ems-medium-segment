"use client";

import Link from "next/link";

export default function Navbar() {
  return (
    <header className="fixed top-0 left-0 w-full z-50 bg-gradient-to-r from-[#041225]/90 to-[#021026]/90 backdrop-blur-md border-b border-[#0f2a4d]/50">
      <div className="max-w-7xl mx-auto flex justify-between items-center px-6 py-4">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <img src="logo2.svg" alt="logo" width={240} />
        </Link>

        {/* Nav Links */}
        <nav className="hidden md:flex gap-8 text-sm">
          <Link href="/#about" className="hover:text-[#6fb6ff] transition">About</Link>
          <Link href="/#features" className="hover:text-[#6fb6ff] transition">Features</Link>
          <Link href="/#team" className="hover:text-[#6fb6ff] transition">Team</Link>
          <Link href="/#contact" className="hover:text-[#6fb6ff] transition">Contact</Link>
        </nav>

        {/* Buttons */}
        <div className="flex items-center gap-5 text-sm">
          <Link href="/login" className="py-2 rounded-xl hover:text-[#6fb6ff] transition font-medium">
            Login
          </Link>
          <Link href="/register" className="px-4 py-2 rounded-xl bg-[#1d9bf0] hover:bg-[#1277c9] transition font-medium">
            Sign Up
          </Link>
        </div>
      </div>
    </header>
  );
}
