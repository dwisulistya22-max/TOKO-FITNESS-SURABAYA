// GET /api/tokopedia/callback — Redirect URL otorisasi (didaftarkan di Partner Center).
// Menerima ?code=<auth_code>&state=<hmac> dari TikTok/Tokopedia, lalu menukarnya
// menjadi access_token + refresh_token dan MENAMPILKANNYA ke layar admin (satu halaman,
// noindex). Tidak ada penyimpanan server — pola sama dengan /api/lazada/auth.
//
// Perlindungan: state HMAC (dibuat auth-link.js, jendela 30 menit, tanpa penyimpanan)
// + auth_code sendiri hanya berlaku 30 menit & sekali pakai.
import { verifyState, exchangeAuthCode, renderTokensPage, envStatus } from './_lib.js';

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  res.setHeader('X-Robots-Tag', 'noindex, nofollow, noarchive');
  if (req.method !== 'GET') return res.status(405).send('Gunakan GET.');

  const q = req.query || {};
  const s = envStatus();

  if (!s.credentialsComplete) {
    return res.status(409).send(
      renderTokensPage({
        ok: false,
        title: 'Konfigurasi belum lengkap',
        error: 'TOKOPEDIA_APP_KEY / TOKOPEDIA_APP_SECRET belum diatur di Vercel.',
      }),
    );
  }

  if (q.error) {
    return res.status(200).send(
      renderTokensPage({
        ok: false,
        title: 'Otorisasi dibatalkan',
        error: `Anda menolak/membatalkan otorisasi (${String(q.error)}). Buka lagi link otorisasi dari panel bila ingin mencoba.`,
      }),
    );
  }

  const code = String(q.code || '').trim();
  const state = String(q.state || '').trim();
  if (!code) {
    return res.status(400).send(
      renderTokensPage({ ok: false, title: 'Code tidak ditemukan', error: 'Parameter code kosong. Mulailah dari panel admin.' }),
    );
  }
  if (!verifyState(state)) {
    return res.status(400).send(
      renderTokensPage({
        ok: false,
        title: 'State tidak valid',
        error: 'Link kedaluwarsa (>30 menit) atau tidak dibuat dari panel. Buka lagi link otorisasi dari panel admin.',
      }),
    );
  }

  try {
    const data = await exchangeAuthCode(code);
    return res.status(200).send(
      renderTokensPage({
        ok: true,
        title: 'Otorisasi berhasil — salin token ini',
        data,
        note: 'Token ini <b>tidak disimpan server</b> — <b>wajib</b> Anda tempel ke env Vercel (lihat langkah di bawah), lalu <b>Redeploy</b>, agar koneksi awet. Auth code sudah terpakai (sekali pakai).',
      }),
    );
  } catch (e) {
    return res.status(502).send(
      renderTokensPage({ ok: false, title: 'Penukaran token gagal', error: String(e?.message || e) }),
    );
  }
}
