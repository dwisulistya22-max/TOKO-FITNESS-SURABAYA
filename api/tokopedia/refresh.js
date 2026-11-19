// GET/POST /api/tokopedia/refresh — perpanjang access_token (berlaku 7 hari) memakai
// refresh_token dari env. Wajib adminKey (pola yang benar — jangan ulangi celah refresh.js Lazada).
// Hasilnya ditampilkan ke layar admin untuk ditempel ulang ke env Vercel.
import {
  envStatus,
  checkAdminKey,
  refreshAccessToken,
  renderTokensPage,
} from './_lib.js';

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  res.setHeader('X-Robots-Tag', 'noindex, nofollow, noarchive');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'GET' && req.method !== 'POST') return res.status(405).json({ error: 'Gunakan GET atau POST.' });

  const gate = checkAdminKey(req, req.body);
  if (!gate.ok) {
    if (String(req.headers.accept || '').includes('text/html')) {
      return res.status(gate.code).send(renderTokensPage({ ok: false, title: 'adminKey salah', error: gate.error }));
    }
    return res.status(gate.code).json({ ok: false, error: gate.error });
  }

  const s = envStatus();
  if (!s.credentialsComplete || !s.hasRefreshToken) {
    const msg = 'Kredensial belum lengkap: butuh TOKOPEDIA_APP_KEY, TOKOPEDIA_APP_SECRET, dan TOKOPEDIA_REFRESH_TOKEN di Vercel.';
    if (String(req.headers.accept || '').includes('text/html')) {
      return res.status(409).send(renderTokensPage({ ok: false, title: 'Belum siap', error: msg }));
    }
    return res.status(409).json({ ok: false, error: msg });
  }

  try {
    const data = await refreshAccessToken();
    if (String(req.headers.accept || '').includes('text/html') || req.method === 'GET') {
      return res.status(200).send(
        renderTokensPage({
          ok: true,
          title: 'Token diperpanjang — salin yang baru',
          data,
          note: 'Perbarui env <b>TOKOPEDIA_ACCESS_TOKEN</b> (dan expire-in) di Vercel dengan nilai baru di atas, lalu <b>Redeploy</b>. Refresh token lama masih berlaku sampai masa otorisasi habis.',
        }),
      );
    }
    return res.status(200).json({
      ok: true,
      accessTokenExpiresAt: data.access_token_expire_in
        ? new Date(Number(data.access_token_expire_in) * 1000).toISOString()
        : null,
      note: 'Akses token baru dibuat. Simpan ke env TOKOPEDIA_ACCESS_TOKEN lalu Redeploy.',
      // Token TIDAK dikirim dalam JSON — hanya halaman HTML admin (di atas) yang menampilkannya,
      // agar tidak bocor ke log/riwayat respons API panel.
    });
  } catch (e) {
    const msg = String(e?.message || e);
    if (String(req.headers.accept || '').includes('text/html') || req.method === 'GET') {
      return res.status(502).send(renderTokensPage({ ok: false, title: 'Refresh gagal', error: msg }));
    }
    return res.status(502).json({ ok: false, error: msg });
  }
}
