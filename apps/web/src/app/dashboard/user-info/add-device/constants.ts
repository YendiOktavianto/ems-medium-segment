export const DEFAULT_BG =
  "linear-gradient(90deg, rgba(6,11,40,0.74) 0%, rgba(10,14,35,0.71) 100%)";
export const INFO_CARD_BG =
  "linear-gradient(180deg, rgba(6,12,41,1) 0%, rgba(4,12,48,0.5) 100%)";
export const CARD_BG = "#032d7a";

// Base URL backend (tanpa slash akhir)
const BASE = (process.env.BACKEND_API || process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:4000')
  .replace(/\/+$/, '');
const PREFIX = (process.env.BACKEND_PREFIX || '').replace(/^\/|\/$/g, ''); // default: ''

const BASE_WITH_PREFIX = PREFIX ? `${BASE}/${PREFIX}` : BASE;

// dipakai halaman: fetch('/api/device-request') atau gunakan yang bawah:
export const API_REQ = `${BASE_WITH_PREFIX}/device-request`;
