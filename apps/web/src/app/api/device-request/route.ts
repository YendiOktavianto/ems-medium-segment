import { NextResponse } from "next/server";

// simpan request di memori server
let requests: {
  id: number;
  address: string;
  detail: string;
  status: string;
  time: number;
}[] = [];

export async function POST(req: Request) {
  const body = await req.json();
  const { address, detail } = body;
  const id = requests.length + 1;
  requests.push({ id, address, detail, status: "pending", time: Date.now() });
  return NextResponse.json({ id, status: "pending" });
}

// GET semua request (untuk admin)
export async function GET() {
  return NextResponse.json(requests);
}

// PATCH: update status request (approve / reject)
export async function PATCH(req: Request) {
  const body = await req.json();
  const { id, status } = body; // status = approved atau rejected
  const idx = requests.findIndex((r) => r.id === id);
  if (idx === -1) return NextResponse.json({ error: "Not found" }, { status: 404 });
  requests[idx].status = status;
  return NextResponse.json(requests[idx]);
}

// supaya route lain bisa akses
export function getRequests() {
  return requests;
}
export function updateRequests(newRequests: typeof requests) {
  requests = newRequests;
}
