// POST /api/tiktok/sync — Sinkron SATU produk ke TikTok Shop.
// Body: { id, confirm: true, overrides?, adminKey }
// KUNCI GANDA (semua wajib): TIKTOK_SYNC_ENABLED=true + kredensial lengkap +
// adminKey cocok + confirm:true + validasi VALID. Selain itu => DITOLAK, tidak ada panggilan ke TikTok.

import crypto from 'node:crypto';
import {
  fetchSanityProducts, validateProduct, buildTiktokPayload, tiktokEnvStatus, readJsonBody,
} from '../_lib/tiktok.js';

const DEFAULT_API_BASE = 'https://open-api.tiktokglobalshop.com';

function signParams(params, appSecret, path) {
  // Tanda tangan HMAC-SHA256 atas parameter terurut (konvensi TikTok Shop Open API).
  const sorted = Object.keys(params).filter((k) => k !== 'sign' && k !== 'access_token')
    .sort().map((k) => `${k}${params[k]}`).join('');
  const base = `${appSecret}${path}${sorted}${appSecret}`;
  return crypto.createHmac('sha256', appSecret).update(base).digest('hex');
}

async function refreshAccessToken(env) {
  const base = (env.TIKTOK_API_BASE || DEFAULT_API_BASE).replace(/\/$/, '');
  const r = await fetch(`${base}/api/token/refreshToken`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      app_key: env.TIKTOK_APP_KEY,
      app_secret: env.TIKTOK_APP_SECRET,
      refresh_token: env.TIKTOK_REFRESH_TOKEN,
      grant_type: 'refresh_token',
    }),
  });
  const data = await r.json().catch(() => ({}));
  if (!r.ok || !data?.data?.access_token) {
    throw new Error(`Refresh token gagal (HTTP ${r.status}): ${JSON.stringify(data).slice(0, 300)}`);
  }
  return data.data; // { access_token, refresh_token, ... } — hanya dipakai di server
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Cache-Control', 'no-store');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Gunakan POST.' });

  const env = process.env;

  // KUNCI 1: flag + kredensial
  const status = tiktokEnvStatus(env);
  if (status.syncBlocked) {
    return res.status(409).json({
      error: 'SINKRON TERKUNCI.',
      detail: 'Belum memenuhi syarat: TIKTOK_SYNC_ENABLED=true + App Key/Secret + Access/Refresh Token + Shop ID/Cipher.',
      status,
      next: 'Lengkapi checklist docs/TIKTOK_AKSES_ID.md, lalu gunakan dry-run dulu.',
    });
  }

  const body = await readJsonBody(req);

  // KUNCI 2: kunci admin (tidak pernah disimpan di browser — diketik per aksi)
  if (!env.TIKTOK_ADMIN_KEY || body.adminKey !== env.TIKTOK_ADMIN_KEY) {
    return res.status(401).json({ error: 'adminKey salah atau belum disiapkan di server.' });
  }

  // KUNCI 3: satu produk + konfirmasi eksplisit
  const id = String(body.id || '').trim();
  if (!id) return res.status(400).json({ error: 'Wajib menyertakan satu "id" produk.' });
  if (body.confirm !== true) {
    return res.status(400).json({ error: 'Wajib confirm:true eksplisit untuk mengirim 1 produk.' });
  }

  // Ambil + validasi produk
  const { products, error } = await fetchSanityProducts();
  if (!products.length) return res.status(502).json({ error: `Sanity tidak menjawab: ${error}` });
  const product = products.find((p) => p.id === id);
  if (!product) return res.status(404).json({ error: `Produk id "${id}" tidak ditemukan di Sanity.` });

  const validation = validateProduct(product, body.overrides || {});
  if (!validation.valid) {
    return res.status(422).json({
      error: `Produk belum VALID (${validation.errors.length} error). Tidak dikirim.`,
      validation,
    });
  }
  const payload = buildTiktokPayload(product, validation);

  // PANGGILAN API TIKTOK (hanya tercapai bila semua kunci lolos)
  try {
    const base = (env.TIKTOK_API_BASE || DEFAULT_API_BASE).replace(/\/$/, '');
    const refreshed = await refreshAccessToken(env);
    const accessToken = refreshed.access_token;
    const path = '/api/products';
    const params = {
      app_key: env.TIKTOK_APP_KEY,
      shop_id: env.TIKTOK_SHOP_ID,
      shop_cipher: env.TIKTOK_SHOP_CIPHER,
      timestamp: String(Math.floor(Date.now() / 1000)),
      version: '202309',
    };
    params.sign = signParams(params, env.TIKTOK_APP_SECRET, path);
    const url = `${base}${path}?${new URLSearchParams(params).toString()}`;

    const r = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-tts-access-token': accessToken },
      body: JSON.stringify(payload),
    });
    const data = await r.json().catch(() => ({}));
    if (!r.ok || data?.code !== 0) {
      return res.status(502).json({
        error: 'TikTok Shop menolak / gagal memproses produk.',
        tiktokCode: data?.code ?? null,
        tiktokMessage: data?.message ?? `HTTP ${r.status}`,
        tiktokDetail: JSON.stringify(data).slice(0, 1000),
        sentPayload: payload,
        note: 'Periksa produk di Seller Center sebagai DRAFT. Jangan ulangi massal tanpa persetujuan.',
      });
    }
    return res.status(200).json({
      ok: true,
      message: `1 produk "${product.name}" terkirim ke TikTok Shop. Verifikasi sebagai DRAFT di Seller Center.`,
      tiktokProductId: data?.data?.product_id ?? data?.data?.id ?? null,
      sentPayload: payload,
      validation,
    });
  } catch (e) {
    return res.status(500).json({ error: `Gagal memanggil TikTok API: ${e?.message || e}` });
  }
}
