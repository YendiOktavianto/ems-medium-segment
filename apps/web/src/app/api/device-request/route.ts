import { NextResponse } from "next/server";

type RequestItem = {
  id: number;
  address: string;
  segmen: string;
  detail_address: string;
  lat: number;
  lng: number;
  status: string;
  time: number;
};

let requests: RequestItem[] = [];

// POST: user kirim request
export async function POST(req: Request) {
  const body = await req.json();
  const { address, segmen, detail_address, lat, lng } = body;
  const id = requests.length + 1;

  const newReq: RequestItem = {
    id,
    address,
    segmen,
    detail_address,
    lat,
    lng,
    status: "pending",
    time: Date.now(),
  };

  requests.push(newReq);

  return NextResponse.json(newReq);
}

// GET semua request
export async function GET() {
  return NextResponse.json(requests);
}

// PATCH: update status request
export async function PATCH(req: Request) {
  const body = await req.json();
  const { id, status } = body;
  const idx = requests.findIndex((r) => r.id === id);
  if (idx === -1) return NextResponse.json({ error: "Not found" }, { status: 404 });

  requests[idx].status = status;
  return NextResponse.json(requests[idx]);
}

// supaya bisa diakses dari module lain
export function getRequests() {
  return requests;
}
export function updateRequests(newRequests: RequestItem[]) {
  requests = newRequests;
}
