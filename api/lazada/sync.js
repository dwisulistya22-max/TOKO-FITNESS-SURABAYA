// POST /api/lazada/sync — Sinkron SATU produk ke Lazada Open Platform.
// Body: { id, confirm: true, overrides?, adminKey }
// KUNCI GANDA: LAZADA_SYNC_ENABLED=true + kredensial lengkap + adminKey cocok + confirm:true + validasi VALID.

import crypto from 'node:crypto';
import {
  fetchSanityProducts, validateProduct, buildLazadaPayload, lazadaEnvStatus, readJsonBody,
} from '../_lib/lazada.js';

const DEFAULT_API_BASE = 'https://api.lazada.co.id/rest';

function signParams(params, appSecret) {
  // Lazada: HMAC-SHA256 atas parameter terurut (key+value), tanpa 'sign'.
  const sorted = Object.keys(params)
    .filter((k) => k !== 'sign')
    .sort()
    .map((k) => `${k}${params[k]}`)
    .join('');
  return crypto.createHmac('sha256', appSecret).update(sorted).digest('hex');
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Cache-Control', 'no-store');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Gunakan POST.' });

  const env = process.env;
  const status = lazadaEnvStatus(env);
  if (status.syncBlocked) {
    return res.status(409).json({
      error: 'SINKRON TERKUNCI.',
      detail: 'Belum memenuhi syarat: LAZADA_SYNC_ENABLED=true + App Key/Secret + Access Token.',
      status,
      next: 'Lengkapi checklist docs/LAZADA_AKSES_ID.md, lalu gunakan dry-run dulu.',
    });
  }

  const body = await readJsonBody(req);
  if (!env.LAZADA_ADMIN_KEY || body.adminKey !== env.LAZADA_ADMIN_KEY) {
    return res.status(401).json({ error: 'adminKey salah atau belum disiapkan di server.' });
  }

  const id = String(body.id || '').trim();
  if (!id) return res.status(400).json({ error: 'Wajib menyertakan satu "id" produk.' });
  if (body.confirm !== true) {
    return res.status(400).json({ error: 'Wajib confirm:true eksplisit untuk mengirim 1 produk.' });
  }

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
  const payload = buildLazadaPayload(product, validation);

  // Bungkus payload menjadi format Lazada { Request: { Product: ... } } (sudah ada di payload)
  const lazadaRequest = { Request: payload.Request };

  try {
    const base = (env.LAZADA_API_BASE || DEFAULT_API_BASE).replace(/\/$/, '');
    const timestamp = String(Date.now());
    const params = {
      app_key: env.LAZADA_APP_KEY,
      timestamp,
      sign_method: 'sha256',
      access_token: env.LAZADA_ACCESS_TOKEN,
      payload: JSON.stringify(lazadaRequest),
    };
    params.sign = signParams(params, env.LAZADA_APP_SECRET);

    const r = await fetch(`${base}/product/create`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams(params).toString(),
    });
    const data = await r.json().catch(() => ({}));
    if (!r.ok) {
      return res.status(502).json({
        error: 'Lazada menolak / gagal memproses produk.',
        lazadaMessage: data?.errorMessage || data?.message || `HTTP ${r.status}`,
        lazadaDetail: JSON.stringify(data).slice(0, 1000),
        sentPayload: lazadaRequest,
        note: 'Periksa produk di Seller Center. Jangan ulangi massal tanpa persetujuan.',
      });
    }
    return res.status(200).json({
      ok: true,
      message: `1 produk "${product.name}" terkirim ke Lazada. Verifikasi di Seller Center.`,
      lazadaResponse: data,
      sentPayload: lazadaRequest,
      validation,
    });
  } catch (e) {
    return res.status(500).json({ error: `Gagal memanggil Lazada API: ${e?.message || e}` });
  }
}
