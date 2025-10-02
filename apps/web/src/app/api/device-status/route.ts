import { NextResponse } from "next/server";
import * as deviceRequestModule from "../device-request/route";

// @ts-ignore
let getRequests = deviceRequestModule.getRequests;
// @ts-ignore
let updateRequests = deviceRequestModule.updateRequests;

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const id = parseInt(searchParams.get("id") || "0");

  let requests = getRequests();
  const found = requests.find((r) => r.id === id);

  if (!found) {
    return NextResponse.json({ status: "not-found" });
  }

  // auto approve setelah 15 detik
  if (found.status === "pending" && Date.now() - found.time > 15000) {
    found.status = "approved";
    updateRequests([...requests]);
  }

  return NextResponse.json({
    status: found.status,
    lat: found.lat,
    lng: found.lng,
    segmen: found.segmen,
    detail_address: found.detail_address,
  });
}
