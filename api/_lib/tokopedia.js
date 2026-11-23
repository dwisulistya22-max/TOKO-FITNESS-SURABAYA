// Lib bersama integrasi Tokopedia & TikTok Shop (Partner Center).
// Docs: https://partner.tiktokshop.com/docv2/page/authorization-overview-202407
import { isPlaceholderImage } from './lazada.js';
//
// Aturan keamanan (WAJIB):
// - App Secret & token HANYA di server (env Vercel), tidak pernah dirender ke browser
//   selain halaman hasil milik admin yang sudah lolos adminKey.
// - Semua endpoint wajib adminKey (TOKOPEDIA_ADMIN_KEY, fallback LAZADA_ADMIN_KEY).
// - auth_code hanya berlaku 30 menit, sekali pakai.

import crypto from 'node:crypto';

export const AUTH_BASE = 'https://services.tiktokshop.com/open/authorize'; // market ROW (ID)
export const TOKEN_GET = 'https://auth.tiktok-shops.com/api/v2/token/get';
export const TOKEN_REFRESH = 'https://auth.tiktok-shops.com/api/v2/token/refresh';

export const escapeHtml = (s) =>
  String(s ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');

export function envStatus() {
  const env = process.env;
  const appKey = (env.TOKOPEDIA_APP_KEY || '').trim();
  const appSecret = (env.TOKOPEDIA_APP_SECRET || '').trim();
  const serviceId = (env.TOKOPEDIA_SERVICE_ID || '').trim();
  const accessToken = (env.TOKOPEDIA_ACCESS_TOKEN || '').trim();
  const refreshToken = (env.TOKOPEDIA_REFRESH_TOKEN || '').trim();
  const expireIn = Number(env.TOKOPEDIA_ACCESS_TOKEN_EXPIRE_IN || 0);
  const adminKey = (env.TOKOPEDIA_ADMIN_KEY || env.LAZADA_ADMIN_KEY || '').trim();
  const now = Math.floor(Date.now() / 1000);
  return {
    hasAppKey: !!appKey,
    hasAppSecret: !!appSecret,
    hasExplicitServiceId: !!serviceId,
    effectiveServiceId: serviceId || appKey || null,
    hasAccessToken: !!accessToken,
    hasRefreshToken: !!refreshToken,
    adminKeyConfigured: !!adminKey,
    adminKeySource: env.TOKOPEDIA_ADMIN_KEY ? 'TOKOPEDIA_ADMIN_KEY' : (adminKey ? 'LAZADA_ADMIN_KEY' : 'none'),
    tokenExpiresAt: expireIn > 0 ? new Date(expireIn * 1000).toISOString() : null,
    daysLeft: expireIn > 0 ? Math.ceil((expireIn - now) / 86400) : null,
    credentialsComplete: !!(appKey && appSecret),
    connected: !!(appKey && appSecret && accessToken && refreshToken),
    shopCode: (env.TOKOPEDIA_SHOP_CODE || '').trim() || null,
  };
}

// adminKey: body.adminKey | header x-admin-key | query.adminKey (hash dulu → timing-safe)
export function checkAdminKey(req, body) {
  const expected = (process.env.TOKOPEDIA_ADMIN_KEY || process.env.LAZADA_ADMIN_KEY || '').trim();
  if (!expected) {
    return { ok: false, code: 503, error: 'TOKOPEDIA_ADMIN_KEY (atau LAZADA_ADMIN_KEY) belum diatur di Vercel.' };
  }
  const given = String(
    (body && body.adminKey) || req.headers['x-admin-key'] || (req.query && req.query.adminKey) || '',
  ).trim();
  if (!given) return { ok: false, code: 401, error: 'adminKey wajib (body, header x-admin-key, atau query).' };
  const a = crypto.createHash('sha256').update(given).digest();
  const b = crypto.createHash('sha256').update(expected).digest();
  if (!crypto.timingSafeEqual(a, b)) return { ok: false, code: 401, error: 'adminKey salah.' };
  return { ok: true };
}

// state = "<ts>.<hmac>" — divalidasi callback/auth tanpa penyimpanan server (stateless).
const stateKey = () => String(process.env.TOKOPEDIA_APP_SECRET || '').trim();

export function makeState() {
  const ts = Date.now();
  const sig = crypto.createHmac('sha256', stateKey()).update(`tokopedia:${ts}`).digest('base64url');
  return `${ts}.${sig}`;
}

export function verifyState(state) {
  const raw = String(state || '');
  const dot = raw.indexOf('.');
  if (dot < 1) return false;
  const ts = Number(raw.slice(0, dot));
  if (!Number.isFinite(ts)) return false;
  if (Math.abs(Date.now() - ts) > 30 * 60 * 1000) return false; // jendela 30 menit
  const expect = crypto.createHmac('sha256', stateKey()).update(`tokopedia:${ts}`).digest('base64url');
  const a = crypto.createHash('sha256').update(raw.slice(dot + 1)).digest();
  const b = crypto.createHash('sha256').update(expect).digest();
  return crypto.timingSafeEqual(a, b);
}

function readBody(req) {
  if (req.body && typeof req.body === 'object') return req.body;
  return {};
}

// Tukar auth_code → access_token + refresh_token (grant_type WAJIB "authorized_code").
export async function exchangeAuthCode(code) {
  const env = process.env;
  const u = new URL(TOKEN_GET);
  u.searchParams.set('app_key', String(env.TOKOPEDIA_APP_KEY || '').trim());
  u.searchParams.set('app_secret', String(env.TOKOPEDIA_APP_SECRET || '').trim());
  u.searchParams.set('auth_code', String(code || ''));
  u.searchParams.set('grant_type', 'authorized_code');
  const r = await fetch(u, { headers: { accept: 'application/json' } });
  const j = await r.json().catch(() => null);
  if (!j || j.code !== 0) {
    throw new Error(`Gagal menukar auth_code: ${j ? `${j.code} ${j.message}` : `HTTP ${r.status}`}`);
  }
  return j.data;
}

// Perpanjang access_token memakai refresh_token dari env.
export async function refreshAccessToken() {
  const env = process.env;
  const u = new URL(TOKEN_REFRESH);
  u.searchParams.set('app_key', String(env.TOKOPEDIA_APP_KEY || '').trim());
  u.searchParams.set('app_secret', String(env.TOKOPEDIA_APP_SECRET || '').trim());
  u.searchParams.set('refresh_token', String(env.TOKOPEDIA_REFRESH_TOKEN || '').trim());
  u.searchParams.set('grant_type', 'refresh_token');
  const r = await fetch(u, { headers: { accept: 'application/json' } });
  const j = await r.json().catch(() => null);
  if (!j || j.code !== 0) {
    throw new Error(`Gagal refresh token: ${j ? `${j.code} ${j.message}` : `HTTP ${r.status}`}`);
  }
  return j.data;
}

// Halaman hasil untuk admin (token disalin ke env Vercel, lalu Redeploy).
export function renderTokensPage({ ok, title, data, note, error }) {
  const rows = [];
  if (data) {
    if (data.access_token) rows.push(['TOKOPEDIA_ACCESS_TOKEN', data.access_token]);
    if (data.refresh_token) rows.push(['TOKOPEDIA_REFRESH_TOKEN', data.refresh_token]);
    if (data.access_token_expire_in) {
      rows.push(['TOKOPEDIA_ACCESS_TOKEN_EXPIRE_IN', String(data.access_token_expire_in)]);
    }
  }
  const body = rows
    .map(
      ([label, value]) => `
      <div class="row">
        <div class="label">${escapeHtml(label)}</div>
        <textarea readonly rows="2" onclick="this.select()">${escapeHtml(value)}</textarea>
      </div>`,
    )
    .join('');
  const info = data
    ? `<ul>
        <li><b>Nama seller:</b> ${escapeHtml(data.seller_name || '-')}</li>
        <li><b>Berlaku s/d:</b> ${escapeHtml(data.access_token_expire_in ? new Date(Number(data.access_token_expire_in) * 1000).toLocaleString('id-ID') : '-')}</li>
        <li><b>Scope:</b> ${escapeHtml(Array.isArray(data.granted_scopes) ? data.granted_scopes.join(', ') : '-')}</li>
      </ul>`
    : '';
  return `<!doctype html><html lang="id"><head><meta charset="utf-8" />
<meta name="viewport" content="width=device-width,initial-scale=1" />
<meta name="robots" content="noindex,nofollow" />
<title>${escapeHtml(title)}</title>
<style>
  body{font-family:system-ui,-apple-system,Segoe UI,Roboto,sans-serif;background:#f6f7f9;margin:0;padding:28px;color:#111}
  .card{max-width:760px;margin:0 auto;background:#fff;border-radius:16px;padding:26px;box-shadow:0 10px 30px rgba(0,0,0,.08)}
  h1{font-size:20px;margin:0 0 6px}
  .ok{color:#0a7d33}.bad{color:#b00020}
  .row{margin:16px 0}
  .label{font-size:11px;font-weight:700;letter-spacing:.06em;text-transform:uppercase;color:#6b7280;margin-bottom:6px}
  textarea{width:100%;box-sizing:border-box;font-family:ui-monospace,Menlo,Consolas,monospace;font-size:12px;padding:10px;border:1px solid #dfe3e8;border-radius:10px;background:#fbfcfd;resize:vertical;word-break:break-all}
  .note{margin-top:18px;font-size:13px;line-height:1.7;background:#fff8e6;border:1px solid #f2d38b;border-radius:10px;padding:12px}
  ul{font-size:13px;line-height:1.8;padding-left:18px}
  .steps{font-size:13px;line-height:1.8;background:#eef4ff;border:1px solid #c7d7fe;border-radius:10px;padding:12px 12px 12px 30px}
  a{color:#1d4ed8}
</style></head><body><div class="card">
  <h1 class="${ok ? 'ok' : 'bad'}">${ok ? '✅' : '❌'} ${escapeHtml(title)}</h1>
  ${error ? `<p class="bad">${escapeHtml(error)}</p>` : ''}
  ${info}
  ${body}
  ${note ? `<div class="note">${note}</div>` : ''}
  <div class="steps"><b>Cara pakai:</b> salin nilai di atas → buka Vercel → Project <b>toko-fitness-surabaya</b> → Settings → Environment Variables → tempel (buat bila belum ada) → <b>Redeploy</b>.<br />
  Kembali ke panel: <a href="/">&gt;&gt; Toko Fitness Surabaya</a></div>
</div></body></html>`;
}

export { readBody };

/* ================================================================
   PHASE 2 — TikTok Shop Products API (create + stok)
   ---------------------------------------------------------------
   Endpoint (semua dari Partner Center docs, divalidasi 19/11/2026):
     GET  /authorization/202309/shops     -> shops[].cipher (shop_cipher)
     GET  /product/202309/categories      -> daftar kategori v2 per platform
     GET  /logistics/202309/warehouses    -> daftar gudang toko
     POST /product/202309/images/upload   -> multipart, data + use_case -> data.uri
     POST /product/202309/products        -> create product (save_mode)
     POST /product/202309/products/inventory -> update stok sempit (tanpa review ulang)

   Sign (divalidasi terhadap contoh resmi docs — reproduksi PERSIS):
     1. ambil query params KECUALI sign & access_token, sort key asc
     2. concat key+value mentah
     3. prepend pathname (contoh "/authorization/202309/shops")
     4. append body JSON mentah (SKIP jika multipart)
     5. HMAC-SHA256(secret, secret + str + secret) -> hex

   Base URL: https://open-api.tiktokglobalshop.com
   Header auth: x-tts-access-token
   ================================================================ */

export const TTS_BASE = 'https://open-api.tiktokglobalshop.com';
export const TTS_IMAGE_MAX_COUNT = 9; // main_images maks 9
const IMAGE_MAX_BYTES = 10 * 1024 * 1024; // 10MB
const TITLE_MIN_ID = 25; // ID: [25,255]
const TITLE_MAX_ID = 255;

/** Sign algoritme TikTok Shop — lihat header modul ini. */
export function ttsSign(pathname, params, bodyStr, appSecret) {
  const keys = Object.keys(params)
    .filter((k) => k !== 'sign' && k !== 'access_token')
    .sort();
  let str = pathname + keys.map((k) => k + String(params[k])).join('');
  if (bodyStr) str += bodyStr;
  return crypto.createHmac('sha256', appSecret).update(appSecret + str + appSecret).digest('hex');
}

/**
 * Panggil TikTok Open API dengan sign otomatis.
 * `formData` (FormData multipart) mengirim tanpa content-type manual & tanpa body di sign.
 * Melempar Error dengan .code / .data / .httpStatus saat API membalas code != 0.
 */
export async function ttsFetch(pathname, { method = 'GET', params = {}, body = null, formData = null, accessToken } = {}) {
  const env = process.env;
  const appKey = String(env.TOKOPEDIA_APP_KEY || '').trim();
  const appSecret = String(env.TOKOPEDIA_APP_SECRET || '').trim();
  const token = accessToken || String(env.TOKOPEDIA_ACCESS_TOKEN || '').trim();
  if (!appKey || !appSecret) throw new Error('TOKOPEDIA_APP_KEY/SECRET belum diisi di Vercel.');
  if (!token) throw new Error('TOKOPEDIA_ACCESS_TOKEN belum ada — otorisasi dulu dari panel.');

  const timestamp = Math.floor(Date.now() / 1000);
  const allParams = { ...params, app_key: appKey, timestamp };
  const bodyStr = formData ? '' : body != null ? JSON.stringify(body) : '';
  const sign = ttsSign(pathname, allParams, bodyStr, appSecret);

  const url = new URL(TTS_BASE + pathname);
  for (const [k, v] of Object.entries({ ...allParams, sign })) url.searchParams.set(k, String(v));

  const headers = { 'x-tts-access-token': token };
  if (bodyStr) headers['content-type'] = 'application/json';
  const res = await fetch(url, { method, headers, body: formData || bodyStr || undefined });
  const text = await res.text();
  let json = null;
  try { json = JSON.parse(text); } catch { /* bukan JSON */ }
  if (!json) throw new Error(`Respons TikTok bukan JSON (HTTP ${res.status}): ${text.slice(0, 300)}`);
  if (Number(json.code) !== 0) {
    let msg = json.message || `TikTok API error code ${json.code}`;
    if (Number(json.code) === 105005) {
      msg += ' — Scope minim belum aktif: buka Partner Center → App & Service → Manage API, '
        + 'aktifkan Product Basic, Product Modify (write), lalu Logistics basic; '
        + 'setelah itu otorisasi ULANG dari panel (token refresh tidak menambah scope).';
    }
    const err = new Error(msg);
    err.code = json.code;
    err.data = json.data;
    err.httpStatus = res.status;
    throw err;
  }
  return json;
}

/* ── shop_cipher (cache per container, 10 menit) ───────────────── */

let cipherCache = { value: '', at: 0 };

export async function getTtsShopCipher(force = false) {
  const now = Date.now();
  if (!force && cipherCache.value && now - cipherCache.at < 10 * 60 * 1000) return cipherCache.value;
  const json = await ttsFetch('/authorization/202309/shops');
  const shops = (json.data && json.data.shops) || [];
  if (!shops.length) throw new Error('Token ini tidak terhubung ke toko mana pun.');
  const wantCode = String(process.env.TOKOPEDIA_SHOP_CODE || '').trim();
  const shop = (wantCode && shops.find((s) => s.code === wantCode)) || shops[0];
  cipherCache = { value: shop.cipher, at: Date.now() };
  return shop.cipher;
}

/* ── Kategori v2: intersect TIKTOK_SHOP & TOKOPEDIA ────────────── */

export async function fetchTtsCategories({ keyword = '' } = {}) {
  const shopCipher = await getTtsShopCipher();
  const base = { shop_cipher: shopCipher, category_version: 'v2' };
  if (keyword) base.keyword = keyword;
  const get = (platform) => ttsFetch('/product/202309/categories', { params: { ...base, listing_platform: platform } });

  let list = [];
  let dualOk = false;
  try {
    const [a, b] = await Promise.all([get('TIKTOK_SHOP'), get('TOKOPEDIA')]);
    const setB = new Set((b.data && b.data.categories || []).map((c) => String(c.id)));
    list = (a.data && a.data.categories || []).filter((c) => setB.has(String(c.id)));
    dualOk = true;
  } catch {
    const a = await get('TIKTOK_SHOP');
    list = (a.data && a.data.categories) || [];
  }

  const byId = new Map(list.map((c) => [String(c.id), c]));
  const pathOf = (c) => {
    const parts = [c.local_name || String(c.id)];
    let p = byId.get(String(c.parent_id));
    let guard = 0;
    while (p && guard++ < 12) {
      parts.unshift(p.local_name || String(p.id));
      p = byId.get(String(p.parent_id));
    }
    return parts.join(' › ');
  };
  const leaves = list
    .filter((c) => c.is_leaf)
    .map((c) => ({ id: String(c.id), name: c.local_name || String(c.id), path: pathOf(c) }))
    .sort((a, b) => a.path.localeCompare(b.path));
  return { categories: leaves, dualPlatform: dualOk, total: list.length };
}

/* ── Gudang ────────────────────────────────────────────────────── */

export async function fetchTtsWarehouses() {
  const shopCipher = await getTtsShopCipher();
  const json = await ttsFetch('/logistics/202309/warehouses', { params: { shop_cipher: shopCipher } });
  const all = (json.data && json.data.warehouses) || [];
  const active = all.filter((w) => String(w.effect_status || '').toUpperCase() === 'ENABLED');
  const pick = active.find((w) => w.is_default) || active[0] || all[0] || null;
  return { warehouses: all, defaultId: pick ? String(pick.id) : '', defaultName: pick ? pick.name : '' };
}

/* ── Upload gambar (multipart → data.uri) ──────────────────────── */

export async function uploadTtsImage(imageUrl, useCase = 'MAIN_IMAGE') {
  const res = await fetch(imageUrl);
  if (!res.ok) throw new Error(`Unduh gambar gagal (HTTP ${res.status}): ${imageUrl}`);
  const buf = Buffer.from(await res.arrayBuffer());
  if (buf.length > IMAGE_MAX_BYTES) throw new Error(`Gambar >10MB — kompres dulu di Sanity: ${imageUrl}`);
  const ctype = (res.headers.get('content-type') || 'image/jpeg').split(';')[0];
  const ext = ctype.includes('png') ? 'png' : ctype.includes('webp') ? 'webp' : 'jpg';
  const fd = new FormData();
  fd.append('data', new Blob([buf], { type: ctype }), `img.${ext}`);
  fd.append('use_case', useCase);
  const json = await ttsFetch('/product/202309/images/upload', {
    method: 'POST',
    formData: fd,
    params: { shop_cipher: await getTtsShopCipher() },
  });
  const uri = json.data && json.data.uri;
  if (!uri) throw new Error('Upload gambar tidak mengembalikan data.uri.');
  return uri;
}

/* ── Validasi + payload create-product ─────────────────────────── */

/**
 * Validasi produk untuk TikTok Shop ID.
 * overrides = field panel (categoryId, warehouseId, saveMode, nama judul, dst).
 */
export function validateTtsProduct(p, overrides = {}) {
  const errors = [];
  const warnings = [];
  const o = overrides || {};

  // judul: ID minta [25,255] — pad otomatis kalau terlalu pendek
  let title = String(o.title || p.name || '').trim();
  if (!title) {
    errors.push({ field: 'name', message: 'Nama produk kosong.' });
  } else if (title.length < TITLE_MIN_ID) {
    title = `${title} - Toko Fitness Surabaya`;
    warnings.push({ field: 'name', message: `Judul dipendek jadi ${TITLE_MIN_ID}+ karakter: "${title}"` });
  }
  if (title.length > TITLE_MAX_ID) {
    errors.push({ field: 'name', message: `Nama ${title.length} karakter (maks ${TITLE_MAX_ID}).` });
  }

  // harga
  const price = Number(o.price ?? p.price);
  if (!Number.isFinite(price) || price <= 0) {
    errors.push({ field: 'price', message: 'Harga kosong atau tidak valid.' });
  }

  // stok: bilangan bulat >= 0
  const stockRaw = o.stock ?? p.stock;
  const stock = Number(stockRaw);
  if (!Number.isInteger(stock) || stock < 0) {
    errors.push({ field: 'stock', message: 'Stok harus bilangan bulat >= 0.' });
  }

  // gambar — pakai filter placeholder milik lib Lazada
  const usable = (p.images || []).filter((u) => u && !isPlaceholderImage(u));
  if (!usable.length) {
    errors.push({ field: 'images', message: 'Tidak ada gambar valid (semua placeholder/kosong).' });
  }

  // berat wajib untuk payload — default 1 kg
  const wRaw = Number(o.weightGrams ?? p.weightGrams);
  let weightGrams = Number.isFinite(wRaw) && wRaw > 0 ? Math.round(wRaw) : null;
  if (!weightGrams) {
    weightGrams = 1000;
    warnings.push({ field: 'weightGrams', message: 'Berat tidak ada — pakai default 1 kg.' });
  }

  // seller_sku: 1-50, tanpa spasi (ganti spasi jadi strip)
  let sellerSku = String(o.sku || p.sku || '').trim().replace(/\s+/g, '-');
  if (!sellerSku) {
    sellerSku = `TF-${String(p.id || p._id || 'X').slice(-8)}`;
    warnings.push({ field: 'sku', message: `SKU dibuat otomatis: ${sellerSku}` });
  }
  if (sellerSku.length > 50) sellerSku = sellerSku.slice(0, 50);

  return {
    valid: errors.length === 0,
    errors,
    warnings,
    title,
    sellerSku,
    price,
    stock,
    weightGrams,
    usableImages: usable,
    discountPrice: Number.isFinite(Number(o.discountPrice ?? p.discountPrice)) ? Number(o.discountPrice ?? p.discountPrice) : null,
  };
}

/**
 * Bangun request body POST /product/202309/products.
 * opts: { categoryId, warehouseId, imageUris, saveMode }
 */
export function buildTtsPayload(p, v, opts = {}) {
  const { categoryId, warehouseId, imageUris = [], saveMode = 'AS_DRAFT' } = opts;
  if (!categoryId) throw new Error('categoryId wajib — pilih kategori leaf TikTok dulu.');
  if (!warehouseId) throw new Error('warehouseId wajib — tidak ada gudang aktif di toko.');
  if (!imageUris.length) throw new Error('imageUris kosong — upload gambar dulu sebelum create.');

  const price = Number(v.price);
  const discount = v.discountPrice;
  const sale = Number.isFinite(discount) && discount > 0 && discount < price ? discount : price;
  const money = (n) => Number(n).toFixed(2);

  const descText = String(p.description || '').trim()
    || `${v.title} — produk original dari Toko Fitness Surabaya.`;
  const descHtml = '<p>' + escapeHtml(descText).replace(/\n{2,}/g, '</p><p>').replace(/\n/g, '<br />') + '</p>';

  return {
    save_mode: saveMode === 'LISTING' ? 'LISTING' : 'AS_DRAFT',
    description: descHtml.slice(0, 10000),
    category_id: String(categoryId),
    main_images: imageUris.slice(0, TTS_IMAGE_MAX_COUNT).map((uri) => ({ uri })),
    title: v.title,
    skus: [
      {
        seller_sku: v.sellerSku,
        price: { amount: money(price), currency: 'IDR', sale_price: money(sale) },
        inventory: [{ warehouse_id: String(warehouseId), quantity: Number(v.stock) || 0 }],
      },
    ],
    package_weight: { value: (v.weightGrams / 1000).toFixed(2), unit: 'KILOGRAM' },
    external_product_id: String(p.id || p._id || '').slice(0, 999),
    category_version: 'v2',
    listing_platforms: ['TIKTOK_SHOP', 'TOKOPEDIA'],
  };
}

/**
 * Status env untuk panel Phase 2: envStatus + lock sinkron.
 * Lock = TOKOPEDIA_SYNC_ENABLED=true DAN semua kredensial/token lengkap.
 */
export function ttsEnvStatus() {
  const env = process.env;
  const base = envStatus();
  const syncEnabled = String(env.TOKOPEDIA_SYNC_ENABLED || '').toLowerCase() === 'true';
  const ready = Boolean(
    syncEnabled && base.hasAppKey && base.hasAppSecret
    && base.hasAccessToken && base.hasRefreshToken,
  );
  return { ...base, syncEnabled, syncBlocked: !ready };
}

