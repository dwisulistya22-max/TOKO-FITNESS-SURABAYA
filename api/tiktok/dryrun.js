// POST /api/tiktok/dryrun — Pratinjau payload TikTok untuk SATU produk. Body: { id, overrides? }
// TIDAK PERNAH memanggil API TikTok. Hanya validasi + mapping + pratinjau.

import { fetchSanityProducts, validateProduct, buildTiktokPayload, tiktokEnvStatus, readJsonBody } from '../_lib/tiktok.js';

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
  const env = tiktokEnvStatus();
  if (!validation.valid) {
    return res.status(200).json({
      ok: false,
      dryRun: true,
      wouldSync: false,
      reason: `Belum VALID (${validation.errors.length} error, ${validation.warnings.length} warning). Perbaiki dulu.`,
      product: { ...product, raw: undefined },
      validation,
      payloadPreview: null,
      syncBlocked: env.syncBlocked,
    });
  }

  const payload = buildTiktokPayload(product, validation);
  return res.status(200).json({
    ok: true,
    dryRun: true,
    wouldSync: true,
    reason: env.syncBlocked
      ? 'Payload VALID. Sinkron masih terkunci (kredensial/flag belum lengkap) — tidak ada yang dikirim.'
      : 'Payload VALID dan sinkron terbuka. Pengiriman HANYA via /api/tiktok/sync dengan confirm:true.',
    product: { ...product, raw: undefined },
    validation,
    payloadPreview: payload,
    syncBlocked: env.syncBlocked,
  });
}
