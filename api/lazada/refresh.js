// GET/POST /api/lazada/refresh — Perbarui Access Token Lazada memakai Refresh Token.
//
// Cara pakai: buka https://<domain>/api/lazada/refresh di browser.
// Tidak perlu kode otorisasi baru selama LAZADA_REFRESH_TOKEN masih berlaku (±30 hari).
//
// Butuh di server: LAZADA_APP_KEY, LAZADA_APP_SECRET, LAZADA_REFRESH_TOKEN.
// Hasilnya ditampilkan di layar Anda sendiri; server tidak menyimpannya.

import { lazadaEnvStatus, lazadaSignVariants } from '../_lib/lazada.js';
import { TOKEN_BASES, renderPage, secretFingerprint } from './auth.js';

const API_PATH = '/auth/token/refresh';

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'GET' && req.method !== 'POST') {
    return res.status(405).json({ error: 'Gunakan GET atau POST.' });
  }

  const env = process.env;
  const status = lazadaEnvStatus(env);
  const wantsHtml = String(req.headers.accept || '').includes('text/html');

  const serverRows = [
    { label: 'App Key', value: env.LAZADA_APP_KEY ? String(env.LAZADA_APP_KEY) : '(kosong)' },
    { label: 'App Secret', value: secretFingerprint(env.LAZADA_APP_SECRET) },
    { label: 'Refresh Token', value: env.LAZADA_REFRESH_TOKEN ? `ada (${String(env.LAZADA_REFRESH_TOKEN).length} karakter)` : '(kosong)' },
  ];

  const fail = (code, message, extra = {}) => {
    if (wantsHtml) {
      res.setHeader('Content-Type', 'text/html; charset=utf-8');
      return res.status(code).send(renderPage({
        ok: false, title: message, rows: extra.rows || [], note: extra.note || '', serverRows,
      }));
    }
    return res.status(code).json({ ok: false, error: message, ...extra });
  };

  if (!status.hasAppKey || !status.hasAppSecret || !status.hasRefreshToken) {
    return fail(409, 'Kunci belum lengkap di server.', {
      note: 'Butuh <b>LAZADA_APP_KEY</b>, <b>LAZADA_APP_SECRET</b>, dan <b>LAZADA_REFRESH_TOKEN</b> di Vercel. ' +
        'Kalau Refresh Token juga sudah habis (±30 hari), ulangi otorisasi di <code>/api/lazada/auth?code=...</code>.',
    });
  }

  const attempts = [];
  for (const base of TOKEN_BASES) {
    const timestamp = String(Date.now());
    const params = {
      app_key: env.LAZADA_APP_KEY,
      timestamp,
      sign_method: 'sha256',
      refresh_token: env.LAZADA_REFRESH_TOKEN,
    };
    for (const variant of lazadaSignVariants(API_PATH, params, env.LAZADA_APP_SECRET)) {
      try {
        const r = await fetch(`${base}${API_PATH}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: new URLSearchParams({ ...params, sign: variant.sign }).toString(),
        });
        const text = await r.text();
        let data = {};
        try {
          data = JSON.parse(text);
        } catch {
          data = { raw: text.slice(0, 300) };
        }

        if (data && data.access_token) {
          const note =
            'Buka <b>Vercel → Settings → Environment Variables</b>, perbarui <b>LAZADA_ACCESS_TOKEN</b>' +
            (data.refresh_token ? ' dan <b>LAZADA_REFRESH_TOKEN</b>' : '') +
            ', lalu <b>Redeploy</b>. Kode ini hanya ditampilkan di layar Anda.';
          if (wantsHtml) {
            res.setHeader('Content-Type', 'text/html; charset=utf-8');
            return res.status(200).send(renderPage({
              ok: true,
              title: 'Berhasil! Access Token Lazada diperbarui.',
              rows: [
                { label: 'LAZADA_ACCESS_TOKEN', value: data.access_token, big: true },
                ...(data.refresh_token ? [{ label: 'LAZADA_REFRESH_TOKEN (baru)', value: data.refresh_token, big: true }] : []),
                { label: 'Berlaku (detik)', value: String(data.expires_in ?? '') },
                { label: 'Refresh berlaku (detik)', value: String(data.refresh_expires_in ?? '') },
              ],
              note,
              serverRows,
            }));
          }
          return res.status(200).json({
            ok: true,
            access_token: data.access_token,
            refresh_token: data.refresh_token || '',
            expires_in: data.expires_in ?? null,
            note: 'Perbarui LAZADA_ACCESS_TOKEN (dan REFRESH_TOKEN bila ada) di Vercel, lalu redeploy.',
          });
        }

        attempts.push({
          base,
          variant: variant.name,
          httpStatus: r.status,
          message: data?.error_message || data?.errorMessage || data?.message || data?.error?.message || data?.error || text.slice(0, 200),
        });
      } catch (e) {
        attempts.push({ base, variant: variant.name, error: `${e?.message || e}` });
      }
    }
  }

  const unique = [];
  const seen = new Set();
  for (const a of attempts) {
    const text = a.error ? `GAGAL KONEKSI: ${a.error}` : `HTTP ${a.httpStatus} · ${a.message || '(tanpa pesan)'}`;
    if (seen.has(text)) continue;
    seen.add(text);
    unique.push({ label: `Lazada menjawab (${String(a.base || '').replace('https://', '')})`, value: text, big: true });
  }

  return fail(502, 'Gagal memperbarui token.', {
    attempts,
    rows: unique,
    note: 'Kalau pesannya menyebut <b>refresh token</b> tidak valid, berarti masa berlakunya (±30 hari) sudah habis — ' +
      'lakukan otorisasi ulang di <code>/api/lazada/auth?code=KODE</code>.',
  });
}
