// GET /api/tokopedia/auth-link — bangun link otorisasi seller (state HMAC, tahan CSRF).
import { envStatus, checkAdminKey, makeState, AUTH_BASE } from './_lib.js';

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'GET') return res.status(405).json({ error: 'Gunakan GET.' });

  const gate = checkAdminKey(req, null);
  if (!gate.ok) return res.status(gate.code).json({ ok: false, error: gate.error });

  const s = envStatus();
  if (!s.credentialsComplete) {
    return res.status(409).json({
      ok: false,
      error: 'App Key/Secret belum lengkap di Vercel. Isi TOKOPEDIA_APP_KEY dan TOKOPEDIA_APP_SECRET dulu.',
    });
  }

  const state = makeState();
  const url = `${AUTH_BASE}?service_id=${encodeURIComponent(s.effectiveServiceId)}&state=${encodeURIComponent(state)}`;
  return res.status(200).json({
    ok: true,
    url,
    serviceIdUsed: s.hasExplicitServiceId ? 'TOKOPEDIA_SERVICE_ID' : 'TOKOPEDIA_APP_KEY (fallback)',
    note: 'Buka link ini di browser yang login ke Seller Center toko. Setelah menyetujui, Anda diarahkan ke callback dan diminta adminKey.',
  });
}
