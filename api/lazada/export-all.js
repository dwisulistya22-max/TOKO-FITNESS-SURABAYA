// GET /api/lazada/export-all — Unduh CSV SEMUA produk Sanity (termasuk yang belum valid).
// Tidak memakai kredensial Lazada dan tidak mengirim apa pun. Aman dibuka kapan saja.

import { fetchSanityProducts, validateProduct, buildLazadaCsvAll } from '../_lib/lazada.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Cache-Control', 'no-store');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'GET') return res.status(405).json({ error: 'Gunakan GET.' });

  const { products, error } = await fetchSanityProducts();
  if (!products.length) return res.status(502).json({ error: `Sanity tidak menjawab: ${error}` });

  const entries = products.map((p) => ({ product: p, validation: validateProduct(p, {}) }));
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
