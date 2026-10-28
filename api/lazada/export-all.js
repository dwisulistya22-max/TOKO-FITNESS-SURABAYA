// GET /api/lazada/export-all — Unduh CSV SEMUA produk Sanity (termasuk yang belum valid).
// Tidak memakai kredensial Lazada dan tidak mengirim apa pun. Aman dibuka kapan saja.

import { fetchSanityProducts, validateProduct, buildLazadaCsvAll, readJsonBody } from '../_lib/lazada.js';
import { buildBulkOverrides } from '../_lib/lazada-defaults.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Cache-Control', 'no-store');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'GET' && req.method !== 'POST') return res.status(405).json({ error: 'Gunakan GET atau POST.' });

  const { products, error } = await fetchSanityProducts();
  if (!products.length) return res.status(502).json({ error: `Sanity tidak menjawab: ${error}` });

  // POST boleh membawa { config } (isi cepat massal) supaya CSV mencerminkan data yang akan dikirim.
  const body = req.method === 'POST' ? await readJsonBody(req) : {};
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
