// GET /api/tiktok/products — Daftar produk Sanity ternormalisasi (sisi server).
// Dipakai panel admin untuk memilih SATU produk. Tanpa secret.

import { fetchSanityProducts } from '../_lib/tiktok.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Cache-Control', 'no-store');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'GET') return res.status(405).json({ error: 'Gunakan GET.' });

  const { projectId, products, error } = await fetchSanityProducts();
  if (!products.length) {
    return res.status(502).json({ ok: false, sanityReachable: false, projectId, products: [], error });
  }
  const slim = products.map((p) => ({
    id: p.id,
    name: p.name,
    price: Number.isFinite(p.price) ? p.price : null,
    stock: Number.isFinite(p.stock) ? p.stock : null,
    category: p.category,
    imageCount: p.images.length,
    thumbnail: p.images[0] || '',
  }));
  return res.status(200).json({ ok: true, sanityReachable: true, projectId, count: slim.length, products: slim });
}
