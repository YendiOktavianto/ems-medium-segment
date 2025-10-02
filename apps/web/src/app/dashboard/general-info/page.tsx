"use client";
import { useGeneralInfo } from "./useGeneralInfo";
import Image from "next/image";
import { DEFAULT_BG, INFO_CARD_BG } from "./constants";

type InfoCardProps = {
  label: string;
  children: React.ReactNode;
  className?: string;
};

const InfoCard = ({ label, children, className = "" }: InfoCardProps) => (
  <div
    className={`min-h-[60px] flex flex-col justify-center rounded-2xl px-4 py-2 ${className}`}
    style={{ background: INFO_CARD_BG }}
  >
    <p className="text-gray-400 text-[10px]">{label}</p>
    {children}
  </div>
);

export default function GeneralInfoContent() {
  const userId = "123"; // ambil dari context login
  const token = "user-jwt-token"; // optional, JWT dari login

  const { devices, selectedDeviceIndex, setSelectedDeviceIndex, currentDevice } =
    useGeneralInfo(userId, token);

  return (
    <div className="rounded-2xl p-8 mx-auto mr-8" style={{ background: DEFAULT_BG }}>
      <h2 className="text-2xl font-semibold mb-4 text-white">General Info</h2>
      <div className="flex flex-col md:flex-row items-center md:items-start gap-4">
        {/* QR */}
        <div className="flex-shrink-0 mx-15 my-4">
          <Image src="/qr.png" alt="Qr Code" width={140} height={140} className="rounded-lg" />
        </div>

        {/* Info */}
        <div className="w-full space-y-3 my-4">
          {/* SERIAL NUMBER */}
          <InfoCard label="SERIAL NUMBER" className="w-full md:w-40">
            {devices.length > 1 ? (
              <select
                className="bg-transparent text-sm font-medium text-white border border-gray-600 rounded-md p-1 mt-1 w-full"
                value={selectedDeviceIndex}
                onChange={(e) => setSelectedDeviceIndex(Number(e.target.value))}
              >
                {devices.map((device, idx) => (
                  <option key={idx} value={idx} className="text-black">
                    {device.serial_number}
                  </option>
                ))}
              </select>
            ) : (
              <p className="text-sm font-medium text-white">{currentDevice?.serial_number || "-"}</p>
            )}
          </InfoCard>

          {/* LOCATION */}
          <InfoCard label="LOCATION">
            <p className="text-sm font-medium text-white">
              {currentDevice?.location || ""} ( {currentDevice?.detail_location || "-"} )
            </p>
          </InfoCard>

          {/* WATTAGE/PHASE */}
          <InfoCard label="WATTAGE/PHASE">
            <p className="text-sm font-medium text-white">{currentDevice?.wattage || "-"}</p>
          </InfoCard>

          {/* SEGMENT */}
          <InfoCard label="SEGMENT">
            <p className="text-sm font-medium text-white">{currentDevice?.segment || "-"}</p>
          </InfoCard>

          {/* ACTIVE */}
          <InfoCard label="ACTIVE">
            <p className="text-sm font-medium text-white">
              {currentDevice?.active === true
                ? "Yes"
                : currentDevice?.active === false
                ? "No"
                : "-"}
            </p>
          </InfoCard>
        </div>
      </div>
    </div>
  );
}
