export const DEFAULT_BG =
  'linear-gradient(180deg, rgba(0,60,140,1) 0%, rgba(0,30,70,1) 100%)';
export const INFO_CARD_BG =
  'linear-gradient(180deg, rgba(255,255,255,0.06) 0%, rgba(255,255,255,0.03) 100%)';

// Base URL backend (tanpa slash akhir)
const BASE = (process.env.BACKEND_API || process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:4000')
  .replace(/\/+$/, '');
const PREFIX = (process.env.BACKEND_PREFIX || '').replace(/^\/|\/$/g, ''); // default: ''

const BASE_WITH_PREFIX = PREFIX ? `${BASE}/${PREFIX}` : BASE;

// dipakai halaman: fetch('/api/device-request') atau gunakan yang bawah:
export const API_REQ = `${BASE_WITH_PREFIX}/device-request`;
