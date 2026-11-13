// POST /api/lazada/bulk — Kirim SEMUA produk Sanity ke Lazada sekaligus.
// GET  /api/lazada/bulk — Pratinjau rencana dalam bentuk halaman HTML (READ-ONLY).
//      Contoh: /api/lazada/bulk?brand=No%20Brand&skuPrefix=TFS-&weight=80000&l=190&w=85&h=40
//      Tambahkan &json=1 untuk data mentah, &limit=50 untuk jumlah contoh.
//      Catatan: SENGAJA digabung ke file ini karena paket Vercel Hobby hanya
//      mengizinkan 12 fungsi per deployment (menambah file baru membuat deploy gagal).
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
  BULK_MAX_IDS_PER_CALL, BULK_MAX_TOTAL, migrateLazadaImages,
} from '../_lib/lazada.js';
import { buildBulkOverrides, listSanityCategories, normalizeConfig } from '../_lib/lazada-defaults.js';
import { applyPresetsToConfig } from '../_lib/lazada-presets.js';

const BULK_DELAY_MS = 350;

// ---------------------------------------------------------------------------
// GET: pratinjau rencana (read-only). Tidak memanggil Lazada, tidak mengirim apa pun.
// ---------------------------------------------------------------------------
const esc = (v) => String(v ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

const htmlPage = ({ title, body, note }) => `<!doctype html><html lang="id"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1"><title>${esc(title)}</title>
<style>
 body{font-family:system-ui,-apple-system,Segoe UI,Roboto,sans-serif;background:#0f172a;padding:24px;margin:0}
 .card{max-width:900px;margin:0 auto;background:#fff;border-radius:18px;padding:24px;color:#0f172a}
 h1{font-size:20px;margin:0 0 4px}.sub{color:#64748b;font-size:13px;margin-bottom:16px}
 .grid{display:flex;gap:12px;flex-wrap:wrap;margin:16px 0}
 .box{flex:1;min-width:140px;border-radius:14px;padding:14px 16px;border:1px solid #e2e8f0}
 .ok{background:#ecfdf5;border-color:#a7f3d0}.bad{background:#fef2f2;border-color:#fecaca}
 .n{font-size:28px;font-weight:800;line-height:1}.lbl{font-size:11px;text-transform:uppercase;color:#475569;margin-top:6px}
 table{width:100%;border-collapse:collapse;font-size:12px}
 th,td{text-align:left;padding:6px 8px;border-bottom:1px solid #e2e8f0;vertical-align:top}
 th{background:#f8fafc;font-size:11px;text-transform:uppercase;color:#64748b}
 code{background:#f1f5f9;border-radius:4px;padding:1px 4px;word-break:break-word}
 .hint{background:#fffbeb;border:1px solid #fde68a;border-radius:12px;padding:12px;font-size:13px;margin-top:16px}
 .tag{display:inline-block;background:#f1f5f9;border-radius:999px;padding:1px 8px;font-size:11px;margin:0 4px 4px 0}
</style></head><body><div class="card">${body}${note ? `<div class="hint">${note}</div>` : ''}</div></body></html>`;

async function renderPreview(req, res) {
  const q = req.query || {};
  const wantsJson = String(q.json || '') === '1';
  const sampleLimit = Math.min(Math.max(Number(q.limit) || 25, 1), 100);
  const env = process.env;
  const status = lazadaEnvStatus(env);

  let cfg = normalizeConfig({
    brand: q.brand || '',
    brandId: q.brandId || '',
    skuPrefix: q.skuPrefix || '',
    weightGrams: q.weight || '',
    lengthCm: q.l || '',
    widthCm: q.w || '',
    heightCm: q.h || '',
    stock: q.stock || '',
  });
  // Secara bawaan pakai saran kategori+dimensi yang sama dengan tombol di panel,
  // supaya angka siap/belum siap mencerminkan keadaan setelah saran diisi.
  const usePresets = String(q.presets ?? '1') !== '0';
  // (nama kategori Sanity dipakai setelah produk dibaca, lihat di bawah)

  const { products, error, projectId } = await fetchSanityProducts();
  if (!products.length) {
    if (wantsJson) return res.status(502).json({ ok: false, error: `Sanity tidak menjawab: ${error}` });
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    return res.status(502).send(htmlPage({ title: 'Gagal membaca Sanity', body: `<h1>Gagal membaca Sanity</h1><p class="sub">${esc(error || '')}</p>` }));
  }

  if (usePresets) {
    const sanityNames = [...new Set(products.map((p) => p.category).filter(Boolean))];
    cfg = normalizeConfig(applyPresetsToConfig(cfg, sanityNames));
  }
  const bulk = buildBulkOverrides(products, cfg);
  const { ready, invalid } = splitValidInvalid(products, bulk.overridesById);
  const cats = listSanityCategories(products);

  // Sumber alasan: field `reason` dari splitValidInvalid (mis. "[brand] Brand kosong ...").
  const reasons = {};
  for (const item of invalid) {
    for (const part of String(item.reason || '').split(' | ')) {
      const m = part.match(/^\[([^\]]+)\]/);
      if (m) reasons[m[1]] = (reasons[m[1]] || 0) + 1;
    }
  }

  const payload = {
    ok: true,
    action: 'preview',
    readOnly: true,
    nothingSent: true,
    projectId,
    total: products.length,
    ready: ready.length,
    notReady: invalid.length,
    presetsApplied: usePresets,
    configUsed: cfg,
    categories: cats,
    reasons,
    sample: invalid.slice(0, sampleLimit).map((p) => ({
      name: p.name,
      errors: String(p.reason || '').split(' | ').filter(Boolean),
    })),
    syncEnabled: status.syncEnabled,
    credentialsComplete: status.credentialsComplete,
  };
  if (wantsJson) return res.status(200).json(payload);

  const rows = payload.sample
    .map((p) => `<tr><td>${esc(p.name)}</td><td>${p.errors.map((e) => `<code>${esc(e)}</code>`).join('<br>')}</td></tr>`)
    .join('');
  const catTags = cats.map((c) => `<span class="tag">${esc(c.name)} · ${c.count}</span>`).join('');
  const reasonTags = Object.entries(reasons).sort((a, b) => b[1] - a[1]).map(([k, v]) => `<span class="tag">${esc(k)} · ${v} produk</span>`).join('');

  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  return res.status(200).send(htmlPage({
    title: 'Pratinjau rencana Lazada',
    body: `
      <h1>Pratinjau rencana kirim ke Lazada</h1>
      <div class="sub">Hanya membaca Sanity dan menghitung. Tidak ada yang dikirim ke Lazada.</div>
      <div class="grid">
        <div class="box ok"><div class="n">${payload.ready}</div><div class="lbl">siap dikirim</div></div>
        <div class="box bad"><div class="n">${payload.notReady}</div><div class="lbl">perlu diperbaiki</div></div>
        <div class="box"><div class="n">${payload.total}</div><div class="lbl">total produk</div></div>
      </div>
      <p style="font-size:13px"><b>Isian cepat yang dipakai:</b> brand <code>${esc(cfg.brand || '-')}</code>,
      awalan SKU <code>${esc(cfg.skuPrefix || '-')}</code>, berat <code>${esc(cfg.weightGrams ?? '-')}</code> g,
      P/L/T <code>${esc(cfg.lengthCm ?? '-')}/${esc(cfg.widthCm ?? '-')}/${esc(cfg.heightCm ?? '-')}</code> cm.</p>
      <p style="font-size:13px"><b>Saran kategori &amp; dimensi:</b> ${payload.presetsApplied ? 'dipakai (perkiraan, sama dengan tombol "Isi saran")' : 'tidak dipakai'}</p>
      <p style="font-size:13px"><b>Jenis produk:</b><br>${catTags || '-'}</p>
      <p style="font-size:13px"><b>Alasan belum siap:</b><br>${reasonTags || 'tidak ada'}</p>
      <table><thead><tr><th>Produk</th><th>Kendala</th></tr></thead><tbody>${rows || '<tr><td colspan="2">Semua produk siap.</td></tr>'}</tbody></table>`,
    note: `Ubah isian lewat alamat, contoh <code>?brand=No%20Brand&skuPrefix=TFS-&weight=80000&l=190&w=85&h=40</code>.
      Tambahkan <code>&json=1</code> untuk data mentah. Sync Lazada ${status.syncEnabled ? 'AKTIF' : 'tetap terkunci (LAZADA_SYNC_ENABLED belum diisi)'}.`,
  }));
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Cache-Control', 'no-store');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method === 'GET') return renderPreview(req, res);
  if (req.method !== 'POST') return res.status(405).json({ error: 'Gunakan GET (pratinjau) atau POST (rencana/kirim).' });

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
      // Gambar luar Lazada ditolak; migrasikan dulu.
      const migrasi = await migrateLazadaImages(env, validation.usableImages);
      const gambarLazada = migrasi.filter((m) => m.ok).map((m) => m.url);
      if (!gambarLazada.length) {
        results.push({
          id: item.id,
          name: item.name,
          ok: false,
          message: 'Gambar gagal dimigrasikan ke Lazada, produk dilewati.',
          lazadaDetail: migrasi.map((m) => `${m.src} -> ${m.message || 'gagal'}`).join(' | ').slice(0, 400),
        });
        if (i < batch.length - 1) await delay(BULK_DELAY_MS);
        continue;
      }
      const payload = buildLazadaPayload(product, { ...validation, usableImages: gambarLazada });
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
