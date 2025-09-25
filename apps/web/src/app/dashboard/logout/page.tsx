"use client";

import Image from "next/image";
import { FC } from "react";

type LogoutOverlayProps = {
  setSelectedPage: (page: string) => void;
  setShowLogoutOverlay: (show: boolean) => void;
};

const LogoutOverlay: FC<LogoutOverlayProps> = ({ setSelectedPage, setShowLogoutOverlay }) => {
  return (
    <div
      className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 transition-opacity duration-200"
      role="dialog"
      aria-modal="true"
      onClick={() => setShowLogoutOverlay(false)} // klik background menutup overlay
    >
      <div
        className="bg-gray-800 rounded-xl p-6 w-[300px] text-center text-white shadow-lg"
        onClick={(e) => e.stopPropagation()} // klik di dalam modal tidak menutup
      >
        {/* Gambar Logo */}
        <Image src="/door.svg" alt="Logout Icon" width={100} height={100} className="mb-2 mx-auto" />

        {/* Judul */}
        <h2 className="text-lg font-semibold mb-4">Logout</h2>

        {/* Pesan */}
        <p className="mb-6 text-sm">
          Are you sure you want to log out from your account?
        </p>

        {/* Tombol */}
        <div className="flex justify-center gap-4">
          <button
            onClick={() => setShowLogoutOverlay(false)}
            className="bg-gray-500 hover:bg-gray-600 transition-colors duration-200 px-4 py-2 rounded-full text-sm"
          >
            Cancel
          </button>
          <button
            onClick={() => {
              setSelectedPage("Logout");
              setShowLogoutOverlay(false);
            }}
            className="bg-blue-500 hover:bg-blue-600 width:5 transition-colors duration-200 px-4 py-2 rounded-full text-sm"
          >
            Logout
          </button>
        </div>
      </div>
    </div>
  );
};

export default LogoutOverlay;
