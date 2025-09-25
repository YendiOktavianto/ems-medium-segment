"use client";
import { useEffect, useState } from "react";

export default function AdminDeviceRequests() {
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  // load semua request
  const fetchRequests = async () => {
    const res = await fetch("/api/device-request");
    const data = await res.json();
    setRequests(data);
  };

  useEffect(() => {
    fetchRequests();
    const interval = setInterval(fetchRequests, 5000); // refresh setiap 5 detik
    return () => clearInterval(interval);
  }, []);

  // handle approve/reject
  const handleAction = async (id: number, status: string) => {
    setLoading(true);
    await fetch("/api/device-request", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, status }),
    });
    await fetchRequests();
    setLoading(false);
  };

  return (
    <div
      className="flex flex-col rounded-2xl p-8 mx-auto mr-8"
      style={{
        background:
          "linear-gradient(90deg, rgba(6,11,40,0.74) 0%, rgba(10,14,35,0.71) 100%)",
      }}
    >
      <h2 className="text-xl font-bold mb-4">Admin Device Requests</h2>
      {requests.length === 0 ? (
        <p className="text-gray-400">Belum ada request</p>
      ) : (
        <div className="space-y-4">
          {requests.map((r) => (
            <div
              key={r.id}
              className="p-4 rounded-xl bg-[#1c2140] border border-blue-600 flex justify-between items-center"
            >
              <div>
                <p className="text-sm">ID: {r.id}</p>
                <p className="text-sm">Alamat: {r.address}</p>
                {r.detail && <p className="text-sm">Detail: {r.detail}</p>}
                <p className="text-xs text-gray-400">Status: {r.status}</p>
              </div>
              <div className="flex gap-2">
                {r.status === "pending" ? (
                  <>
                    <button
                      disabled={loading}
                      onClick={() => handleAction(r.id, "approved")}
                      className="bg-green-500 hover:bg-green-600 px-3 py-1 rounded text-xs"
                    >
                      Approve
                    </button>
                    <button
                      disabled={loading}
                      onClick={() => handleAction(r.id, "rejected")}
                      className="bg-red-500 hover:bg-red-600 px-3 py-1 rounded text-xs"
                    >
                      Reject
                    </button>
                  </>
                ) : (
                  <span
                    className={
                      r.status === "approved"
                        ? "text-green-400 text-xs"
                        : "text-red-400 text-xs"
                    }
                  >
                    {r.status.toUpperCase()}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
