import { NextRequest, NextResponse } from 'next/server';

const BASE = (process.env.BACKEND_API || process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:4000')
  .replace(/\/+$/, '');
const PREFIX = (process.env.BACKEND_PREFIX || '').replace(/^\/|\/$/g, '');

export async function DELETE(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const target = `${BASE}/${PREFIX ? PREFIX + '/' : ''}device-request/${params.id}`;
  const r = await fetch(target, { method: 'DELETE' });
  const text = await r.text();
  return new NextResponse(text, {
    status: r.status,
    headers: { 'content-type': r.headers.get('content-type') || 'application/json' },
  });
}
