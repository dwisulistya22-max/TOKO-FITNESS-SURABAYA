// GET /api/lazada/categories — Ambil daftar kategori ASLI dari Lazada (GetCategoryTree).
// Dipakai untuk memilih category_id dengan benar, tanpa menebak.
//
// Query:
//   ?q=treadmill   -> saring nama kategori
//   ?leaf=1        -> hanya kategori daun (yang boleh dipakai jual produk)
//   ?refresh=1     -> abaikan cache 1 jam di server
//
// Butuh App Key + App Secret + Access Token. Kalau token kedaluwarsa, jalankan
// ulang proses otorisasi di /api/lazada/auth.

import { lazadaEnvStatus, callLazadaApi } from '../_lib/lazada.js';

let cache = { at: 0, payload: null };

const flatten = (nodes, path = [], out = []) => {
  for (const n of Array.isArray(nodes) ? nodes : []) {
    const name = String(n?.name ?? '').trim();
    const id = String(n?.category_id ?? n?.id ?? '').trim();
    const here = [...path, name].filter(Boolean);
    const children = n?.children || [];
    if (id) out.push({ id, name, path: here.join(' › '), leaf: !children.length });
    if (children.length) flatten(children, here, out);
  }
  return out;
};

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Cache-Control', 'no-store');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'GET') return res.status(405).json({ error: 'Gunakan GET.' });

  const env = process.env;
  const status = lazadaEnvStatus(env);
  if (status.syncBlocked) {
    return res.status(409).json({
      error: 'Belum tersambung ke Lazada.',
      detail: 'Butuh App Key + App Secret + Access Token.',
      status,
    });
  }

  const q = req.query || {};
  const onlyLeaf = String(q.leaf || '') === '1';
  const needRefresh = String(q.refresh || '') === '1';
  const keyword = String(q.q || '').trim().toLowerCase();

  let payload = cache.payload;
  if (!payload || needRefresh || Date.now() - cache.at > 60 * 60 * 1000) {
    const out = await callLazadaApi(env, '/category/tree/get', { language: 'id' });
    if (!out.ok) {
      return res.status(502).json({
        error: 'Lazada menolak permintaan daftar kategori.',
        lazadaMessage: out.message,
        lazadaCode: out.data?.code,
        hint: 'Kalau pesannya soal access token, ulangi otorisasi di /api/lazada/auth.',
      });
    }
    const root = out.data?.data || out.data || [];
    const list = flatten(Array.isArray(root) ? root : [root]);
    payload = { total: list.length, categories: list };
    cache = { at: Date.now(), payload };
  }

  let categories = payload.categories;
  if (onlyLeaf) categories = categories.filter((c) => c.leaf);
  if (keyword) categories = categories.filter((c) => c.path.toLowerCase().includes(keyword));

  return res.status(200).json({
    ok: true,
    fetchedAt: new Date(cache.at).toISOString(),
    total: payload.total,
    shown: categories.length,
    categories: categories.slice(0, 500),
  });
}
