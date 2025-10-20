"use client";

import React from "react";
import { motion } from "framer-motion";

type LoadingOverlayProps = {
  show: boolean;
  text?: string;
};

export default function LoadingOverlay({ show, text }: LoadingOverlayProps) {
  if (!show) return null; // langsung tidak render kalau show=false

  return (
    <motion.div
      role="alert"
      aria-busy="true"
      className="fixed inset-0 z-[9999] flex flex-col items-center justify-center backdrop-blur-md bg-black/60"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.05 }} // overlay muncul instan
    >
      {/* Layered Spinner */}
      <div className="relative w-24 h-24 mb-6">
        <motion.div
          className="absolute inset-0 border-4 border-blue-500 border-t-transparent rounded-full"
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1.2, ease: "linear" }}
        />
        <motion.div
          className="absolute inset-3 border-4 border-blue-400 border-b-transparent rounded-full"
          animate={{ rotate: -360 }}
          transition={{ repeat: Infinity, duration: 0.8, ease: "linear" }}
        />
        <div className="absolute inset-6 w-12 h-12 bg-blue-500/20 rounded-full" />
      </div>

      {/* Loading Text */}
      <motion.p
        className="text-white text-xs font-medium"
        initial={{ opacity: 0, y: 5 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0, duration: 0.25 }} // teks muncul cepat
      >
        {text || "Loading..."}
      </motion.p>
    </motion.div>
  );
}
