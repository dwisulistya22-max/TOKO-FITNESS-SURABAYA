// POST /api/lazada/bulk — Kirim SEMUA produk Sanity ke Lazada sekaligus.
//
// Body:
//   { action: "plan",  overrides? }                          -> hanya menghitung (read-only)
//   { action: "send",  confirm: true, adminKey, overrides? } -> mengirim produk VALID
//
// Pengaman (semua wajib terpenuhi untuk benar-benar mengirim):
//   1. LAZADA_SYNC_ENABLED=true
//   2. App Key + App Secret + Access Token lengkap
//   3. adminKey di body == LAZADA_ADMIN_KEY di server
//   4. confirm: true eksplisit
//   5. Hanya produk yang lolos validasi (yang tidak valid DILEWATI dan dilaporkan)
//   6. Maksimal BULK_MAX_IDS_PER_CALL (5) produk per permintaan, dengan jeda antar panggilan

import {
  fetchSanityProducts, validateProduct, buildLazadaPayload, splitValidInvalid,
  lazadaEnvStatus, readJsonBody, callLazadaCreate, delay,
  BULK_MAX_IDS_PER_CALL, BULK_MAX_TOTAL,
} from '../_lib/lazada.js';
import { buildBulkOverrides, listSanityCategories, normalizeConfig } from '../_lib/lazada-defaults.js';

const BULK_DELAY_MS = 350;

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Cache-Control', 'no-store');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Gunakan POST.' });

  const env = process.env;
  const status = lazadaEnvStatus(env);
  const body = await readJsonBody(req);
  const action = String(body.action || 'plan').toLowerCase();
  const explicitOverrides = body.overrides && typeof body.overrides === 'object' ? body.overrides : {};

  const { products, error, projectId } = await fetchSanityProducts();
  if (!products.length) return res.status(502).json({ error: `Sanity tidak menjawab: ${error}` });

  // Nilai isi-cepat dari admin digabung dengan overrides eksplisit (overrides menang).
  const bulk = buildBulkOverrides(products, body.config || {});
  const overridesById = { ...bulk.overridesById };
  for (const [id, o] of Object.entries(explicitOverrides)) {
    overridesById[id] = { ...(overridesById[id] || {}), ...o };
  }
  const configInfo = {
    used: Object.keys(overridesById).length,
    notes: bulk.notes,
    effective: normalizeConfig(body.config || {}),
    sanityCategories: listSanityCategories(products),
  };

  // ---------- 1) PLAN: hanya membaca & menghitung, tidak mengirim apa pun ----------
  if (action === 'plan') {
    const { ready, invalid } = splitValidInvalid(products, overridesById);
    return res.status(200).json({
      ok: true,
      action: 'plan',
      dryRun: true,
      nothingSent: true,
      projectId,
      total: products.length,
      readyCount: ready.length,
      invalidCount: invalid.length,
      batchSize: BULK_MAX_IDS_PER_CALL,
      batchesNeeded: Math.ceil(ready.length / BULK_MAX_IDS_PER_CALL),
      maxTotalPerRequest: BULK_MAX_TOTAL,
      ready: ready.map((r) => ({ id: r.id, name: r.name, sku: r.sku })),
      invalid,
      config: configInfo,
      syncBlocked: status.syncBlocked,
      note: status.syncBlocked
        ? 'Rencana saja — sinkron masih TERKUNCI (flag/kredensial belum lengkap). Tidak ada yang dikirim.'
        : 'Rencana saja — belum ada yang dikirim. Untuk mengirim, gunakan action "send" dengan confirm:true + kunci admin.',
    });
  }

  if (action !== 'send') {
    return res.status(400).json({ error: `action "${action}" tidak dikenal. Gunakan "plan" atau "send".` });
  }

  // ---------- 2) SEND: pengaman berlapis ----------
  if (status.syncBlocked) {
    return res.status(409).json({
      error: 'KIRIM MASSAL TERKUNCI.',
      detail: 'Butuh LAZADA_SYNC_ENABLED=true + App Key/Secret + Access Token di server.',
      status,
    });
  }
  if (!env.LAZADA_ADMIN_KEY || String(body.adminKey || '') !== String(env.LAZADA_ADMIN_KEY)) {
    return res.status(401).json({ error: 'Kunci admin salah atau belum diisi di server.' });
  }
  if (body.confirm !== true) {
    return res.status(400).json({ error: 'Wajib confirm:true untuk mengirim produk secara massal.' });
  }

  const requestedIds = Array.isArray(body.ids) ? body.ids.map((x) => String(x)) : null;
  const pool = requestedIds ? products.filter((p) => requestedIds.includes(p.id)) : products;

  if (pool.length > BULK_MAX_TOTAL) {
    return res.status(413).json({
      error: `Terlalu banyak (${pool.length}). Maksimal ${BULK_MAX_TOTAL} produk per permintaan.`,
      hint: 'Kirim bertahap. Produk yang sudah terkirim akan dilewati pada putaran berikutnya.',
    });
  }

  // Hanya produk VALID yang dikirim — yang tidak valid dilewati & dilaporkan.
  const { ready, invalid } = splitValidInvalid(pool, overridesById);
  if (!ready.length) {
    return res.status(422).json({
      error: 'Tidak ada produk yang VALID. Tidak ada yang dikirim.',
      totalChecked: pool.length,
      invalidCount: invalid.length,
      invalid: invalid.slice(0, 30),
      hint: 'Lengkapi SKU, berat, dimensi, stok, kategori Lazada, dan foto asli di Sanity.',
    });
  }

  const batch = ready.slice(0, BULK_MAX_IDS_PER_CALL);
  const skippedByLimit = ready.length - batch.length;

  const results = [];
  for (let i = 0; i < batch.length; i += 1) {
    const item = batch[i];
    const product = pool.find((p) => p.id === item.id);
    try {
      const validation = validateProduct(product, overridesById[item.id] || {});
      const payload = buildLazadaPayload(product, validation);
      const out = await callLazadaCreate(env, { Request: payload.Request });
      results.push({
        id: item.id,
        name: item.name,
        ok: out.ok,
        httpStatus: out.httpStatus,
        message: out.ok ? 'Terkirim (DRAFT / menunggu review Lazada).' : out.message,
        lazadaDetail: out.ok ? undefined : JSON.stringify(out.data).slice(0, 400),
      });
    } catch (e) {
      results.push({ id: item.id, name: item.name, ok: false, message: `Gagal: ${e?.message || e}` });
    }
    if (i < batch.length - 1) await delay(BULK_DELAY_MS);
  }

  const sentOk = results.filter((r) => r.ok).length;
  const failed = results.filter((r) => !r.ok);

  return res.status(200).json({
    ok: failed.length === 0,
    action: 'send',
    sentOk,
    sentFailed: failed.length,
    results,
    skippedInvalid: invalid.length,
    invalid: invalid.slice(0, 30),
    config: configInfo,
    stayedInQueue: skippedByLimit,
    totalValid: ready.length,
    totalChecked: pool.length,
    next: stayedByLimitMessage(skippedByLimit, invalid.length),
  });
}

function stayedByLimitMessage(stayedInQueue, invalidCount) {
  const parts = [];
  if (stayedInQueue > 0) {
    parts.push(`${stayedInQueue} produk valid masih menunggu — klik "Kirim semua" lagi untuk putaran berikutnya (maks 5 per putaran).`);
  }
  if (invalidCount > 0) {
    parts.push(`${invalidCount} produk dilewati karena data belum lengkap — perbaiki di Sanity lalu ulangi.`);
  }
  if (!parts.length) parts.push('Semua produk valid sudah diproses.');
  return parts.join(' ');
}
