// POST /api/tiktok/validate — Validasi SATU produk. Body: { id, overrides? }
// Tidak memanggil TikTok. Tidak menebak data kosong.

import { fetchSanityProducts, validateProduct, readJsonBody } from '../_lib/tiktok.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Cache-Control', 'no-store');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Gunakan POST.' });

  const body = await readJsonBody(req);
  const id = String(body.id || '').trim();
  if (!id) return res.status(400).json({ error: 'Wajib menyertakan satu "id" produk.' });
  if (Array.isArray(body.ids) || Array.isArray(body.id)) {
    return res.status(400).json({ error: 'Validasi hanya 1 produk per aksi. Kirim satu "id".' });
  }

  const { products, error } = await fetchSanityProducts();
  if (!products.length) return res.status(502).json({ error: `Sanity tidak menjawab: ${error}` });
  const product = products.find((p) => p.id === id);
  if (!product) return res.status(404).json({ error: `Produk id "${id}" tidak ditemukan di Sanity.` });

  const validation = validateProduct(product, body.overrides || {});
  return res.status(200).json({
    ok: true,
    product: { ...product, raw: undefined },
    validation,
  });
}
