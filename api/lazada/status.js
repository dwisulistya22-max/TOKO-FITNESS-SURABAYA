// GET /api/lazada/status
import { lazadaEnvStatus } from '../_lib/lazada.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Cache-Control', 'no-store');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'GET') return res.status(405).json({ error: 'Gunakan GET.' });

  const env = lazadaEnvStatus();
  return res.status(200).json({
    ok: true,
    checkedAt: new Date().toISOString(),
    ...env,
    message: env.syncBlocked
      ? 'Mode DRY-RUN / EKSPOR: sinkron Lazada terkunci. Lihat docs/LAZADA_AKSES_ID.md.'
      : 'Sinkron TERBUKA (flag + kredensial lengkap). Tetap wajib konfirmasi per 1 produk.',
  });
}
