// POST /api/lazada/export — Unduh CSV.
//   • body { id }        → CSV 1 produk (mode lama export.js)
//   • body { config? }   → CSV SEMUA produk (mode lama export-all.js, disatukan demi
//                          limit 12 Serverless Functions plan Hobby)
// GET  juga → CSV semua produk (mode lama export-all.js).
// Tidak memakai kredensial Lazada dan tidak mengirim apa pun ke mana pun.

import {
  fetchSanityProducts,
  validateProduct,
  buildLazadaCsv,
  buildLazadaCsvAll,
  readJsonBody,
} from '../_lib/lazada.js';
import { buildBulkOverrides } from '../_lib/lazada-defaults.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Cache-Control', 'no-store');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'GET' && req.method !== 'POST') return res.status(405).json({ error: 'Gunakan GET atau POST.' });

  const body = req.method === 'POST' ? await readJsonBody(req) : {};
  const id = String(body.id || '').trim();

  const { products, error } = await fetchSanityProducts();
  if (!products.length) return res.status(502).json({ error: `Sanity tidak menjawab: ${error}` });

  // ── Mode 1: satu produk (butuh id) ──────────────────────────────────
  if (id) {
    const product = products.find((p) => p.id === id);
    if (!product) return res.status(404).json({ error: `Produk id "${id}" tidak ditemukan di Sanity.` });

    const validation = validateProduct(product, body.overrides || {});
    const csv = buildLazadaCsv(product, validation);
    const safeId = id.replace(/[^a-zA-Z0-9_-]/g, '').slice(0, 40) || 'produk';
    res.statusCode = 200;
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="lazada-1produk-${safeId}.csv"`);
    return res.end(csv);
  }

  // ── Mode 2: semua produk (POST tanpa id, atau GET) ──────────────────
  // POST boleh membawa { config } (isi cepat massal) supaya CSV mencerminkan data yang akan dikirim.
  const { overridesById } = buildBulkOverrides(products, body.config || {});
  const entries = products.map((p) => ({
    product: p,
    validation: validateProduct(p, overridesById[p.id] || {}),
  }));
  const csv = buildLazadaCsvAll(entries);
  const validCount = entries.filter((e) => e.validation.valid).length;
  const stamp = new Date().toISOString().slice(0, 10);

  res.statusCode = 200;
  res.setHeader('Content-Type', 'text/csv; charset=utf-8');
  res.setHeader('Content-Disposition', `attachment; filename="lazada-semua-produk-${stamp}.csv"`);
  res.setHeader('X-Total-Products', String(products.length));
  res.setHeader('X-Valid-Products', String(validCount));
  return res.end(csv);
}
