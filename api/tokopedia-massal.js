// GET /api/tokopedia-massal — Download file CSV berisi SEMUA produk Sanity.
// File ini untuk di-copy-paste ke template resmi "Tambah Sekaligus" Tokopedia Seller.
// Aman: hanya membaca data & mengunduh file. Tidak mengubah apa pun, tidak upload ke mana pun.

import { fetchSanityProducts } from './_lib/tiktok.js';
import { buildTokopediaMasterCsv } from './_lib/tokopedia.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Cache-Control', 'no-store');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'GET') return res.status(405).json({ error: 'Gunakan GET.' });

  const { projectId, products, error } = await fetchSanityProducts();
  if (!products.length) {
    res.statusCode = 502;
    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    return res.end(`Gagal mengambil data produk dari Sanity: ${error}`);
  }
  const csv = buildTokopediaMasterCsv(products);
  const today = new Date().toISOString().slice(0, 10);
  res.statusCode = 200;
  res.setHeader('Content-Type', 'text/csv; charset=utf-8');
  res.setHeader('Content-Disposition', `attachment; filename="tokopedia-semua-produk-${today}.csv"`);
  res.setHeader('X-Product-Count', String(products.length));
  res.setHeader('X-Sanity-Project', projectId);
  return res.end(csv);
}
