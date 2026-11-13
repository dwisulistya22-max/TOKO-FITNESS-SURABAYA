// POST /api/lazada/sync — Sinkron SATU produk ke Lazada Open Platform.
// Body: { id, confirm: true, overrides?, adminKey }
// KUNCI GANDA: LAZADA_SYNC_ENABLED=true + kredensial lengkap + adminKey cocok + confirm:true + validasi VALID.

import {
  fetchSanityProducts, validateProduct, buildLazadaPayload, lazadaEnvStatus, readJsonBody, callLazadaCreate,
  migrateLazadaImages,
} from '../_lib/lazada.js';

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
  // Lazada menolak gambar dari luar Lazada -> migrasikan dulu ke server Lazada.
  const migrasi = await migrateLazadaImages(env, validation.usableImages);
  const gambarLazada = migrasi.filter((m) => m.ok).map((m) => m.url);
  if (!gambarLazada.length) {
    return res.status(502).json({
      error: 'Semua gambar gagal dimigrasikan ke Lazada, jadi produk tidak dikirim.',
      detail: migrasi.map((m) => `${m.src} -> ${m.message || 'gagal'}`),
      hint: 'Pastikan gambar JPG/PNG dan ukurannya di bawah 1 MB.',
    });
  }
  const validationFinal = { ...validation, usableImages: gambarLazada };
  const payload = buildLazadaPayload(product, validationFinal);

  // Bungkus payload menjadi format Lazada { Request: { Product: ... } } (sudah ada di payload)
  const lazadaRequest = { Request: payload.Request };

  try {
    const out = await callLazadaCreate(env, lazadaRequest);
    if (!out.ok) {
      return res.status(502).json({
        error: 'Lazada menolak / gagal memproses produk.',
        lazadaMessage: out.message || `HTTP ${out.httpStatus}`,
        lazadaDetail: JSON.stringify(out.data).slice(0, 1000),
        sentPayload: lazadaRequest,
        note: 'Periksa produk di Seller Center. Jangan ulangi massal tanpa persetujuan.',
      });
    }
    return res.status(200).json({
      ok: true,
      message: `1 produk "${product.name}" terkirim ke Lazada. Verifikasi di Seller Center.`,
      lazadaResponse: out.data,
      sentPayload: lazadaRequest,
      imagesMigrated: gambarLazada.length,
      imagesFailed: migrasi.filter((m) => !m.ok).map((m) => ({ src: m.src, message: m.message })),
      validation: validationFinal,
    });
  } catch (e) {
    return res.status(500).json({ error: `Gagal memanggil Lazada API: ${e?.message || e}` });
  }
}
