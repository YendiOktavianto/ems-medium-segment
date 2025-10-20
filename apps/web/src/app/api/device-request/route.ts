import { NextRequest, NextResponse } from 'next/server';

const BASE = (process.env.BACKEND_API || process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:4000')
  .replace(/\/+$/, '');
const PREFIX = (process.env.BACKEND_PREFIX || '').replace(/^\/|\/$/g, '');
const TARGET = `${BASE}/${PREFIX ? PREFIX + '/' : ''}device-request`;

function passthroughHeaders(req: NextRequest) {
  const h = new Headers();
  const ct = req.headers.get('content-type');
  if (ct) h.set('content-type', ct);
  const auth = req.headers.get('authorization');
  if (auth) h.set('authorization', auth);
  return h;
}

export async function GET() {
  const r = await fetch(TARGET, { cache: 'no-store' });
  const text = await r.text();
  return new NextResponse(text || '[]', {
    status: r.status,
    headers: { 'content-type': r.headers.get('content-type') || 'application/json' },
  });
}

export async function POST(req: NextRequest) {
  const body = await req.text();
  const r = await fetch(TARGET, { method: 'POST', headers: passthroughHeaders(req), body });
  const text = await r.text();
  return new NextResponse(text, {
    status: r.status,
    headers: { 'content-type': r.headers.get('content-type') || 'application/json' },
  });
}

export async function PATCH(req: NextRequest) {
  const body = await req.text();
  const r = await fetch(TARGET, { method: 'PATCH', headers: passthroughHeaders(req), body });
  const text = await r.text();
  return new NextResponse(text, {
    status: r.status,
    headers: { 'content-type': r.headers.get('content-type') || 'application/json' },
  });
}

export async function DELETE(req: NextRequest) {
  const body = await req.text();
  const r = await fetch(TARGET, { method: 'DELETE', headers: passthroughHeaders(req), body });
  const text = await r.text();
  return new NextResponse(text, {
    status: r.status,
    headers: { 'content-type': r.headers.get('content-type') || 'application/json' },
  });
}
