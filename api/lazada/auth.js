// GET/POST /api/lazada/auth — Menukar authorization code Lazada menjadi Access Token + Refresh Token.
//
// Cara pakai (paling mudah, lewat browser):
//   https://<domain>/api/lazada/auth?code=KODE_DARI_LAZADA
// Boleh juga POST JSON: { "code": "KODE_DARI_LAZADA", "adminKey": "..." }
//
// Catatan keamanan:
// - Butuh LAZADA_APP_KEY + LAZADA_APP_SECRET di server (Vercel), tidak pernah dikirim ke browser.
// - Kode otorisasi Lazada hanya berlaku 30 menit dan hanya bisa dipakai SEKALI.
// - Bila LAZADA_ADMIN_KEY diisi di server, adminKey wajib cocok.
// - Token yang dihasilkan HANYA ditampilkan di layar kamu sendiri; tidak disimpan di server.

import crypto from 'node:crypto';
import { lazadaEnvStatus, readJsonBody } from '../_lib/lazada.js';

// Endpoint /auth Lazada memakai host global. Beberapa akun memerlukan host negara.
const TOKEN_BASES = [
  'https://auth.lazada.com/rest',
  'https://api.lazada.com/rest',
  'https://api.lazada.co.id/rest',
];

function signParams(params, appSecret) {
  const sorted = Object.keys(params)
    .filter((k) => k !== 'sign')
    .sort()
    .map((k) => `${k}${params[k]}`)
    .join('');
  return crypto.createHmac('sha256', appSecret).update(sorted).digest('hex');
}

const escapeHtml = (s) =>
  String(s ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');

// Sidik jari rahasia: cukup untuk memastikan nilainya benar, tanpa membocorkan isinya.
function secretFingerprint(value) {
  const v = String(value || '');
  const flags = [];
  if (!v) flags.push('KOSONG');
  if (v !== v.trim()) flags.push('ADA SPASI DI UJUNG');
  if (/^["']/.test(v) || /["']$/.test(v)) flags.push('ADA TANDA KUTIP');
  if (v.startsWith('LAZADA_')) flags.push('IKUT TERSALIN NAMA VARIABEL');
  if (v.startsWith('sk_live') || v.startsWith('sk_test')) flags.push('INI KUNCI PEMBAYARAN (Stripe), BUKAN LAZADA');
  if (v && v.length !== 32) flags.push(`PANJANG ${v.length} (Lazada biasanya 32)`);
  const head = v.slice(0, 4);
  const tail = v.slice(-2);
  return `${head}…${tail} | panjang ${v.length} | ${flags.length ? '⚠ ' + flags.join(' ; ') : '✔ bentuk wajar'}`;
}

function renderPage({ ok, title, rows = [], note = '', serverRows = [] }) {
  const body = rows
    .map(
      (r) => `
      <div class="row">
        <div class="label">${escapeHtml(r.label)}</div>
        <textarea readonly rows="${r.big ? 2 : 1}" onclick="this.select()">${escapeHtml(r.value)}</textarea>
      </div>`,
    )
    .join('');
  const serverBlock = serverRows.length
    ? `<div class="server"><div class="serverTitle">Pemeriksaan kunci di server (rahasia disamarkan)</div>${serverRows
        .map(
          (r) => `<div class="srv"><span class="srvLabel">${escapeHtml(r.label)}</span><code>${escapeHtml(
            r.value,
          )}</code></div>`,
        )
        .join('')}</div>`
    : '';
  return `<!doctype html><html lang="id"><head><meta charset="utf-8" />
<meta name="viewport" content="width=device-width,initial-scale=1" />
<title>${escapeHtml(title)}</title>
<style>
  body{font-family:system-ui,-apple-system,Segoe UI,Roboto,sans-serif;background:#f6f7f9;margin:0;padding:28px;color:#111}
  .card{max-width:760px;margin:0 auto;background:#fff;border-radius:16px;padding:26px;box-shadow:0 10px 30px rgba(0,0,0,.08)}
  h1{font-size:20px;margin:0 0 6px}
  .ok{color:#0a7d33}.bad{color:#b00020}
  .row{margin:16px 0}
  .label{font-size:11px;font-weight:700;letter-spacing:.06em;text-transform:uppercase;color:#6b7280;margin-bottom:6px}
  textarea{width:100%;box-sizing:border-box;font-family:ui-monospace,Menlo,Consolas,monospace;font-size:12px;
    padding:10px;border:1px solid #dfe3e8;border-radius:10px;background:#fbfcfd;resize:vertical;word-break:break-all}
  .note{margin-top:18px;font-size:13px;line-height:1.6;background:#fff8e6;border:1px solid #f2d38b;border-radius:10px;padding:12px}
  ul{font-size:13px;line-height:1.7;padding-left:18px}
  .server{margin-top:22px;border-top:1px dashed #dfe3e8;padding-top:14px}
  .serverTitle{font-size:11px;font-weight:700;letter-spacing:.06em;text-transform:uppercase;color:#6b7280;margin-bottom:10px}
  .srv{display:flex;flex-wrap:wrap;gap:8px;align-items:baseline;margin:8px 0;font-size:13px}
  .srvLabel{color:#374151}
  code{font-family:ui-monospace,Menlo,Consolas,monospace;background:#f3f4f6;border-radius:6px;padding:3px 7px;word-break:break-all}
</style></head><body><div class="card">
<h1 class="${ok ? 'ok' : 'bad'}">${escapeHtml(title)}</h1>
${body}
${note ? `<div class="note">${note}</div>` : ''}
${serverBlock}
</div></body></html>`;
}

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'GET' && req.method !== 'POST') {
    return res.status(405).json({ error: 'Gunakan GET atau POST.' });
  }

  const env = process.env;
  const status = lazadaEnvStatus(env);
  const wantsHtml = String(req.headers.accept || '').includes('text/html');
  const q = req.query || {};

  let body = {};
  if (req.method === 'POST') body = await readJsonBody(req);
  const code = String(body.code || q.code || '').trim();
  const adminKey = String(body.adminKey || q.adminKey || '').trim();

  const serverRows = [
    {
      label: 'App Key',
      value: env.LAZADA_APP_KEY ? String(env.LAZADA_APP_KEY) : '(kosong)',
    },
    {
      label: 'App Secret',
      value: secretFingerprint(env.LAZADA_APP_SECRET),
    },
  ];

  const fail = (statusCode, message, extra = {}) => {
    if (wantsHtml) {
      res.setHeader('Content-Type', 'text/html; charset=utf-8');
      return res.status(statusCode).send(
        renderPage({
          ok: false,
          title: message,
          note: extra.note || '',
          rows: extra.rows || [],
          serverRows,
        }),
      );
    }
    return res.status(statusCode).json({ ok: false, error: message, ...extra });
  };

  if (!status.hasAppKey || !status.hasAppSecret) {
    return fail(
      409,
      'App Key / App Secret belum ada di server.',
      {
        note: 'Tambahkan <b>LAZADA_APP_KEY</b> dan <b>LAZADA_APP_SECRET</b> di Vercel → Settings → Environment Variables, lalu Redeploy. Setelah itu buka halaman ini lagi.',
      },
    );
  }

  if (env.LAZADA_ADMIN_KEY && adminKey !== env.LAZADA_ADMIN_KEY) {
    return fail(401, 'adminKey salah atau belum diisi.', {
      note: 'Tambahkan <code>&amp;adminKey=KUNCI_ADMIN_KAMU</code> di belakang alamat halaman ini.',
    });
  }

  if (!code) {
    return fail(400, 'Kode otorisasi (code) belum ada.', {
      note:
        'Buka alamat ini setelah Lazada mengembalikan kode, contoh:<br/>' +
        '<code>/api/lazada/auth?code=KODE_DARI_LAZADA</code><br/>' +
        'Kode hanya berlaku <b>30 menit</b> dan hanya bisa dipakai <b>sekali</b>.',
    });
  }

  const attempts = [];
  for (const base of TOKEN_BASES) {
    try {
      const timestamp = String(Date.now());
      const params = {
        app_key: env.LAZADA_APP_KEY,
        timestamp,
        sign_method: 'sha256',
        code,
      };
      params.sign = signParams(params, env.LAZADA_APP_SECRET);

      const r = await fetch(`${base}/auth/token/create`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams(params).toString(),
      });

      const text = await r.text();
      let data = {};
      try {
        data = JSON.parse(text);
      } catch {
        data = { raw: text.slice(0, 500) };
      }

      if (data && data.access_token) {
        const note =
          'Simpan tiga nilai di atas ke <b>Notepad</b>, lalu masukkan ke Vercel → Settings → ' +
          'Environment Variables sebagai <b>LAZADA_APP_KEY</b>, <b>LAZADA_ACCESS_TOKEN</b>, dan ' +
          '<b>LAZADA_REFRESH_TOKEN</b>, kemudian <b>Redeploy</b>. ' +
          'Access Token berlaku ±7 hari, Refresh Token ±30 hari. Jangan bagikan nilai ini ke siapa pun.';

        if (wantsHtml) {
          res.setHeader('Content-Type', 'text/html; charset=utf-8');
          return res.status(200).send(
            renderPage({
              ok: true,
              title: 'Berhasil! Token Lazada sudah didapat.',
              rows: [
                { label: 'LAZADA_ACCESS_TOKEN', value: data.access_token, big: true },
                { label: 'LAZADA_REFRESH_TOKEN', value: data.refresh_token || '', big: true },
                { label: 'Akun toko', value: data.account || '-' },
                { label: 'Negara', value: data.country || '-' },
                { label: 'Access token berlaku (detik)', value: String(data.expires_in ?? '') },
                { label: 'Refresh token berlaku (detik)', value: String(data.refresh_expires_in ?? '') },
              ],
              note,
              serverRows,
            }),
          );
        }
        return res.status(200).json({
          ok: true,
          access_token: data.access_token,
          refresh_token: data.refresh_token || '',
          account: data.account || '',
          country: data.country || '',
          expires_in: data.expires_in ?? null,
          refresh_expires_in: data.refresh_expires_in ?? null,
          note: 'Simpan ke Notepad, masukkan ke Vercel sebagai LAZADA_ACCESS_TOKEN dan LAZADA_REFRESH_TOKEN, lalu redeploy.',
        });
      }

      attempts.push({
        base,
        httpStatus: r.status,
        lazadaMessage: data?.error_message || data?.errorMessage || data?.message || data?.error || text.slice(0, 300),
      });
    } catch (e) {
      attempts.push({ base, error: `${e?.message || e}` });
    }
  }

  const attemptRows = attempts.map((a) => ({
    label: `Lazada menjawab (${String(a.base || '').replace('https://', '')})`,
    value: a.error
      ? `GAGAL KONEKSI: ${a.error}`
      : `HTTP ${a.httpStatus} · ${a.lazadaMessage || '(tanpa pesan)'}`,
    big: true,
  }));

  return fail(502, 'Lazada menolak kode otorisasi ini.', {
    attempts,
    rows: attemptRows,
    note:
      'Kemungkinan penyebab: kode sudah kedaluwarsa (lebih dari 30 menit), kode sudah pernah dipakai, ' +
      'atau App Key/App Secret tidak cocok. Ulangi proses otorisasi untuk mendapatkan kode baru.',
  });
}
