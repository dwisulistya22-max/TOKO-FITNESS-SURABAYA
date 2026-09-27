// POST /api/tiktok/export — Ekspor CSV aman untuk SATU produk. Body: { id, overrides? }
// Alternatif saat API seller belum tersedia: file dibantu untuk pengisian/upload
// manual di Seller Center. Tidak memanggil TikTok, tidak mengubah data apa pun.

import { fetchSanityProducts, validateProduct, buildTiktokCsv, readJsonBody } from '../_lib/tiktok.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Cache-Control', 'no-store');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Gunakan POST.' });

  const body = await readJsonBody(req);
  const id = String(body.id || '').trim();
  if (!id) return res.status(400).json({ error: 'Wajib menyertakan satu "id" produk.' });

  const { products, error } = await fetchSanityProducts();
  if (!products.length) return res.status(502).json({ error: `Sanity tidak menjawab: ${error}` });
  const product = products.find((p) => p.id === id);
  if (!product) return res.status(404).json({ error: `Produk id "${id}" tidak ditemukan di Sanity.` });

  const validation = validateProduct(product, body.overrides || {});
  const csv = buildTiktokCsv(product, validation);
  const safeId = id.replace(/[^a-zA-Z0-9_-]/g, '').slice(0, 40) || 'produk';
  res.statusCode = 200;
  res.setHeader('Content-Type', 'text/csv; charset=utf-8');
  res.setHeader('Content-Disposition', `attachment; filename="tiktok-1produk-${safeId}.csv"`);
  return res.end(csv);
}
