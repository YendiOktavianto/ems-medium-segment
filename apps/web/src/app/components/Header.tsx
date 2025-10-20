"use client";
import Image from "next/image";

export default function Header({ time, selectedPage }: any) {
  return (
    <div className="flex justify-between items-center mb-6 mr-8">
      {/* Breadcrumb */}
      <div className="text-[10px] font-normal text-gray-300">
        Pages / <span className="text-white">{selectedPage}</span>
      </div>

      {/* Right (Clock + Profile) */}
      <div className="flex items-center">
        <div
          className="text-xs text-white px-6 py-2 rounded-full"
          style={{
            background:
              "linear-gradient(90deg, rgba(6,11,40,0.74) 0%, rgba(10,14,35,0.71) 100%)",
          }}
        >
          {time}
        </div>
        <div className="ml-3">
          <Image
            src="/profile.svg"
            alt="Profile"
            width={30}
            height={30}
            className="rounded-full border-2 border-blue-500"
          />
        </div>
      </div>
    </div>
  );
}
