// GET /api/tiktok/status — Kesiapan integrasi (boolean saja, aman untuk browser).
// Tidak pernah mengembalikan nilai secret/token.

import { tiktokEnvStatus } from '../_lib/tiktok.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Cache-Control', 'no-store');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'GET') return res.status(405).json({ error: 'Gunakan GET.' });

  const env = tiktokEnvStatus();
  return res.status(200).json({
    ok: true,
    checkedAt: new Date().toISOString(),
    ...env,
    // Catatan: sanityReachable dicek oleh /api/tiktok/products (dipisah agar status tetap ringan).
    message: env.syncBlocked
      ? 'Mode DRY-RUN / EKSPOR: sinkron TikTok terkunci. Lihat docs/TIKTOK_AKSES_ID.md.'
      : 'Sinkron TERBUKA (flag + kredensial lengkap). Tetap wajib konfirmasi per 1 produk.',
  });
}
