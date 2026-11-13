// GET /api/lazada/preview — Ringkasan rencana massal dalam bentuk HTML (atau JSON).
//
// Tujuan: admin bisa melihat "berapa siap / berapa belum + alasannya" langsung di browser,
// tanpa perlu buka panel. Endpoint ini HANYA MEMBACA Sanity dan menghitung; tidak pernah
// mengirim apa pun ke Lazada (tidak butuh LAZADA_SYNC_ENABLED, tidak butuh admin key).
//
// Query:
//   ?brand=No%20Brand&skuPrefix=TFS-&weight=80000&l=190&w=85&h=40   -> pakai isian cepat
//   ?json=1                                                        -> respons JSON
//   ?limit=50                                                      -> jumlah contoh produk belum siap

import { fetchSanityProducts, splitValidInvalid, lazadaEnvStatus } from '../_lib/lazada.js';
import { buildBulkOverrides, listSanityCategories, normalizeConfig } from '../_lib/lazada-defaults.js';

const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

const page = ({ title, body, note }) => `<!doctype html><html lang="id"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>${esc(title)}</title>
<style>
 body{font-family:system-ui,-apple-system,Segoe UI,Roboto,sans-serif;background:#0f172a;color:#e2e8f0;margin:0;padding:24px}
 .card{max-width:900px;margin:0 auto;background:#fff;color:#0f172a;border-radius:18px;padding:24px}
 h1{font-size:20px;margin:0 0 4px}
 .sub{color:#64748b;font-size:13px;margin-bottom:16px}
 .grid{display:flex;gap:12px;flex-wrap:wrap;margin:16px 0}
 .box{flex:1;min-width:150px;border-radius:14px;padding:14px 16px}
 .ok{background:#ecfdf5;border:1px solid #a7f3d0}
 .bad{background:#fef2f2;border:1px solid #fecaca}
 .n{font-size:28px;font-weight:800;line-height:1}
 .lbl{font-size:11px;text-transform:uppercase;letter-spacing:.04em;color:#475569;margin-top:6px}
 table{width:100%;border-collapse:collapse;font-size:12px}
 th,td{text-align:left;padding:6px 8px;border-bottom:1px solid #e2e8f0;vertical-align:top}
 th{background:#f8fafc;font-size:11px;text-transform:uppercase;color:#64748b}
 code{background:#f1f5f9;border-radius:4px;padding:1px 4px}
 .hint{background:#fffbeb;border:1px solid #fde68a;border-radius:12px;padding:12px;font-size:13px;margin-top:16px}
 .tag{display:inline-block;background:#f1f5f9;border-radius:999px;padding:1px 8px;font-size:11px;margin:0 4px 4px 0}
 a{color:#1d4ed8}
</style></head><body><div class="card">${body}${note ? `<div class="hint">${note}</div>` : ''}</div></body></html>`;

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'GET') return res.status(405).json({ error: 'Gunakan GET.' });

  const q = req.query || {};
  const wantsJson = String(q.json || '') === '1';
  const sampleLimit = Math.min(Math.max(Number(q.limit) || 25, 1), 100);

  const cfg = normalizeConfig({
    brand: q.brand || '',
    brandId: q.brandId || '',
    skuPrefix: q.skuPrefix || '',
    weightGrams: q.weight || '',
    lengthCm: q.l || '',
    widthCm: q.w || '',
    heightCm: q.h || '',
    stock: q.stock || '',
  });

  const { products, error, projectId } = await fetchSanityProducts();
  if (!products.length) {
    const payload = { ok: false, error: `Sanity tidak menjawab: ${error}` };
    if (wantsJson) return res.status(502).json(payload);
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    return res.status(502).send(page({ title: 'Gagal membaca Sanity', body: `<h1>Gagal membaca Sanity</h1><p class="sub">${esc(error || '')}</p>` }));
  }

  const bulk = buildBulkOverrides(products, cfg);
  const { ready, invalid } = splitValidInvalid(products, bulk.overridesById);
  const status = lazadaEnvStatus(process.env);
  const cats = listSanityCategories(products);

  const reasonCount = {};
  for (const item of invalid) {
    for (const e of item.validation?.errors || []) {
      const key = `${e.field}`;
      reasonCount[key] = (reasonCount[key] || 0) + 1;
    }
  }

  const payload = {
    ok: true,
    readOnly: true,
    nothingSent: true,
    projectId,
    total: products.length,
    ready: ready.length,
    notReady: invalid.length,
    configUsed: cfg,
    categories: cats,
    reasons: reasonCount,
    sample: invalid.slice(0, sampleLimit).map((p) => ({
      name: p.name,
      category: p.category,
      errors: (p.validation?.errors || []).map((e) => `${e.field}: ${e.message}`),
    })),
    syncEnabled: status.syncEnabled,
    credentialsComplete: status.credentialsComplete,
  };

  if (wantsJson) return res.status(200).json(payload);

  const rows = payload.sample.map((p) => `<tr><td>${esc(p.name)}</td><td>${esc(p.category)}</td><td>${p.errors.map((e) => `<code>${esc(e)}</code>`).join('<br>')}</td></tr>`).join('');
  const catTags = cats.map((c) => `<span class="tag">${esc(c.name)} · ${c.count}</span>`).join('');
  const reasonTags = Object.entries(reasonCount).sort((a, b) => b[1] - a[1]).map(([k, v]) => `<span class="tag">${esc(k)} · ${v} produk</span>`).join('');

  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  return res.status(200).send(page({
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
      awalan SKU <code>${esc(cfg.skuPrefix || '-')}</code>,
      berat <code>${esc(cfg.weightGrams ?? '-')}</code> g,
      P/L/T <code>${esc(cfg.lengthCm ?? '-')}/${esc(cfg.widthCm ?? '-')}/${esc(cfg.heightCm ?? '-')}</code> cm.</p>
      <p style="font-size:13px"><b>Jenis produk:</b><br>${catTags || '-'}</p>
      <p style="font-size:13px"><b>Alasan belum siap:</b><br>${reasonTags || 'tidak ada'}</p>
      <table><thead><tr><th>Produk</th><th>Jenis</th><th>Kendala</th></tr></thead><tbody>${rows || '<tr><td colspan="3">Semua produk siap.</td></tr>'}</tbody></table>`,
    note: `Mau lihat dengan isian cepat lain? Tambahkan ke alamat, contoh:
      <code>?brand=No%20Brand&skuPrefix=TFS-&weight=80000&l=190&w=85&h=40</code>.
      Tambahkan <code>&json=1</code> untuk data mentah. Sync Lazada tetap terkunci
      (LAZADA_SYNC_ENABLED ${status.syncEnabled ? 'AKTIF' : 'belum diisi'}).`,
  }));
}
