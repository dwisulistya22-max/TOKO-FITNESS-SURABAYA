// GET /api/tokopedia/status — status koneksi Tokopedia & TikTok Shop (hanya bendera, tanpa rahasia).
import { envStatus, checkAdminKey } from './_lib.js';

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  res.setHeader('Access-Control-Allow-Origin', '*');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'GET') return res.status(405).json({ error: 'Gunakan GET.' });

  const gate = checkAdminKey(req, null);
  if (!gate.ok) return res.status(gate.code).json({ ok: false, error: gate.error });

  const s = envStatus();
  return res.status(200).json({
    ok: true,
    checkedAt: new Date().toISOString(),
    ...s,
    message: s.connected
      ? `Terhubung. Token kedaluwarsa ${s.daysLeft !== null ? `±${s.daysLeft} hari lagi` : '(tanggal tidak diisi)'}.`
      : s.credentialsComplete
        ? 'Kredensial App lengkap — jalankan otorisasi dari panel.'
        : 'Lengkapi TOKOPEDIA_APP_KEY + TOKOPEDIA_APP_SECRET di Vercel (Partner Center → App & Service).',
  });
}
