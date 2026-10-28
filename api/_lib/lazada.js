// api/_lib/lazada.js
// Inti integrasi Sanity -> Lazada Open Platform. Tanpa dependensi (Node 18+ / Vercel).
// Prinsip: TIDAK MENEBAK data kosong. Field kosong => error validasi.

import crypto from 'node:crypto';
import { lookupLazadaCategoryId } from './lazada-category-map.js';

export const SANITY_PROJECT_IDS = ['qi4rocc0', '856jrik3'];
export const SANITY_DATASET = 'production';
export const SANITY_API_VERSION = 'v2024-01-01';

const GROQ_PRODUCT = `*[_type == "product"] | order(_createdAt desc) {
  _id, name, title, nama, price, discountPrice, description, specs,
  stock, sku, weightGrams, lengthCm, widthCm, heightCm,
  condition, brand, brandId, lazadaCategoryId, tag, rating, reviews,
  order, sortOrder, urutan, isFeatured, featured, isUnggulan, showOnHome,
  shopeeUrl, shopee,
  "mainImage": coalesce(image.asset->url, foto.asset->url, photo.asset->url, gambar.asset->url, ""),
  "galleryImages": coalesce(images[].asset->url, gallery[].asset->url, photos[].asset->url, [])
}`;

const PLACEHOLDER_PATTERNS = ['unsplash', 'placeholder', 'dummyimage', 'placehold', 'picsum', 'loremflickr'];

const asText = (v) => {
  if (typeof v === 'string' || typeof v === 'number') return String(v).trim();
  if (v && typeof v === 'object') return String(v.title || v.name || v.nama || '').trim();
  return '';
};

const asNumber = (v) => {
  if (v === null || v === undefined || v === '') return NaN;
  const n = Number(v);
  return Number.isFinite(n) ? n : NaN;
};

export function isPlaceholderImage(url) {
  const u = String(url || '').toLowerCase();
  return PLACEHOLDER_PATTERNS.some((p) => u.includes(p));
}

export async function fetchSanityProducts() {
  const query = encodeURIComponent(GROQ_PRODUCT);
  let lastError = '';
  for (const projectId of SANITY_PROJECT_IDS) {
    try {
      const r = await fetch(
        `https://${projectId}.api.sanity.io/${SANITY_API_VERSION}/data/query/${SANITY_DATASET}?query=${query}`,
        { cache: 'no-store' },
      );
      if (!r.ok) {
        lastError = `HTTP ${r.status} dari project ${projectId}`;
        continue;
      }
      const data = await r.json();
      if (Array.isArray(data?.result)) {
        return { projectId, products: data.result.map(normalizeProduct), error: '' };
      }
    } catch (e) {
      lastError = `${e?.message || e} (project ${projectId})`;
    }
  }
  return { projectId: '', products: [], error: lastError || 'Sanity tidak menjawab' };
}

export function normalizeProduct(item = {}) {
  const images = [];
  const push = (u) => {
    if (typeof u === 'string' && u.trim() && !images.includes(u.trim())) images.push(u.trim());
  };
  push(item.mainImage);
  push(item.image);
  if (Array.isArray(item.galleryImages)) item.galleryImages.forEach(push);
  if (Array.isArray(item.images)) item.images.forEach(push);

  return {
    id: String(item._id || item.id || ''),
    name: asText(item.name) || asText(item.title) || asText(item.nama),
    price: asNumber(item.price),
    discountPrice: item.discountPrice === null || item.discountPrice === undefined || item.discountPrice === '' ? NaN : asNumber(item.discountPrice),
    description: asText(item.description),
    specs: asText(item.specs),
    stock: asNumber(item.stock),
    sku: asText(item.sku),
    weightGrams: asNumber(item.weightGrams),
    lengthCm: asNumber(item.lengthCm),
    widthCm: asNumber(item.widthCm),
    heightCm: asNumber(item.heightCm),
    condition: asText(item.condition).toUpperCase(),
    brand: asText(item.brand),
    brandId: asText(item.brandId),
    lazadaCategoryId: asText(item.lazadaCategoryId),
    category: asText(item.category),
    tag: asText(item.tag),
    rating: asNumber(item.rating),
    images,
    raw: undefined,
  };
}

export function validateProduct(p, overrides = {}) {
  const errors = [];
  const warnings = [];
  const err = (field, message, fix) => errors.push({ field, message, fix });
  const warn = (field, message, fix) => warnings.push({ field, message, fix });

  const o = overrides || {};
  const merged = {
    ...p,
    name: o.name ?? p.name,
    price: o.price ?? p.price,
    discountPrice: o.discountPrice ?? p.discountPrice,
    description: o.description ?? p.description,
    stock: o.stock ?? p.stock,
    sku: o.sku ?? p.sku,
    weightGrams: o.weightGrams ?? p.weightGrams,
    lengthCm: o.lengthCm ?? p.lengthCm,
    widthCm: o.widthCm ?? p.widthCm,
    heightCm: o.heightCm ?? p.heightCm,
    condition: (o.condition ?? p.condition ?? '').toString().toUpperCase(),
    brand: o.brand ?? p.brand,
    brandId: o.brandId ?? p.brandId,
  };
  const overrideFields = Object.keys(o).filter((k) => o[k] !== undefined && o[k] !== '');

  // Nama
  if (!merged.name) err('name', 'Nama produk kosong.', 'Isi field name/title di Sanity.');
  else if (merged.name.length > 255) err('name', `Nama ${merged.name.length} karakter (maks 255).`, 'Persingkat nama produk.');

  // Harga
  if (!Number.isFinite(merged.price)) err('price', 'Harga kosong / bukan angka.', 'Isi field price (IDR) di Sanity.');
  else if (merged.price <= 0) err('price', `Harga ${merged.price} tidak valid (harus > 0).`, 'Isi harga jual yang benar.');
  if (Number.isFinite(merged.discountPrice)) {
    if (merged.discountPrice <= 0) err('discountPrice', 'Harga diskon harus > 0.', 'Kosongkan atau isi harga diskon yang benar.');
    else if (Number.isFinite(merged.price) && merged.discountPrice >= merged.price) err('discountPrice', 'Harga diskon harus < harga normal.', 'Turunkan harga diskon.');
  }

  // Stok
  if (!Number.isFinite(merged.stock)) err('stock', 'Stok kosong / bukan angka.', 'Isi field stock (bilangan bulat ≥ 0).');
  else if (!Number.isInteger(merged.stock) || merged.stock < 0) err('stock', `Stok "${merged.stock}" harus bilangan bulat ≥ 0.`, 'Perbaiki stok di Sanity.');

  // SKU
  if (!merged.sku) err('sku', 'SKU (SellerSku) kosong (wajib).', "Tambah field 'sku' di skema Sanity lalu isi unik per produk.");

  // Brand
  if (!merged.brand && !merged.brandId) {
    err('brand', 'Brand kosong (wajib di Lazada: brand atau brand_id).', "Isi field 'brand' (mis. 'No Brand') atau 'brandId' di Sanity.");
  }

  // Kategori Lazada
  const mappedId = lookupLazadaCategoryId(p.category);
  const categoryId = String(o.categoryId ?? p.lazadaCategoryId ?? mappedId ?? '').trim();
  if (!categoryId) {
    err('categoryId', `Kategori "${p.category || '(kosong)'}" belum terpetakan ke Lazada category_id.`, 'Isi lazadaCategoryId di Sanity ATAU api/_lib/lazada-category-map.js dari GetCategoryTree.');
  } else if (!/^\d+$/.test(categoryId)) {
    err('categoryId', `category_id "${categoryId}" tidak valid (harus angka).`, 'Periksa ID kategori daun dari Seller Center.');
  }

  // Berat & dimensi paket (Lazada: kg + cm)
  if (!Number.isFinite(merged.weightGrams)) err('weightGrams', 'Berat paket kosong.', "Tambah field 'weightGrams' (gram) di Sanity.");
  else if (merged.weightGrams <= 0) err('weightGrams', 'Berat paket harus > 0 gram.', 'Isi berat paket aktual (timbang).');
  if (!Number.isFinite(merged.lengthCm)) err('lengthCm', 'Panjang paket kosong.', "Tambah field 'lengthCm' (cm).");
  else if (merged.lengthCm <= 0) err('lengthCm', 'Panjang harus > 0 cm.', 'Ukur kemasan aktual.');
  if (!Number.isFinite(merged.widthCm)) err('widthCm', 'Lebar paket kosong.', "Tambah field 'widthCm' (cm).");
  else if (merged.widthCm <= 0) err('widthCm', 'Lebar harus > 0 cm.', 'Ukur kemasan aktual.');
  if (!Number.isFinite(merged.heightCm)) err('heightCm', 'Tinggi paket kosong.', "Tambah field 'heightCm' (cm).");
  else if (merged.heightCm <= 0) err('heightCm', 'Tinggi harus > 0 cm.', 'Ukur kemasan aktual.');

  // Gambar
  const realImages = (p.images || []).filter(Boolean);
  const placeholders = realImages.filter(isPlaceholderImage);
  const usable = realImages.filter((u) => !isPlaceholderImage(u) && /^https?:\/\//i.test(u));
  if (placeholders.length > 0) err('images', `${placeholders.length} gambar adalah placeholder/stok (mis. Unsplash).`, 'Ganti dengan foto produk asli di Sanity.');
  if (usable.length === 0) err('images', 'Tidak ada gambar valid (URL http(s) foto asli).', 'Unggah minimal 1 foto produk asli.');
  else {
    if (usable.length > 8) warn('images', `${usable.length} gambar (Lazada maks 8 per SKU).`, 'Kurangi hingga ≤ 8 gambar.');
    if (usable.length < 3) warn('images', `Hanya ${usable.length} gambar (disarankan ≥ 3).`, 'Tambah foto dari berbagai sudut.');
    warn('images', 'Lazada mewajibkan gambar inlink Lazada (migrasi via /image/migrate). URL eksternal bisa ditolak QC.', 'Migrasikan gambar ke Lazada inlink sebelum sync.');
  }

  // Deskripsi (opsional)
  if (merged.description && merged.description.length > 25000) {
    err('description', 'Deskripsi > 25.000 karakter.', 'Persingkat deskripsi.');
  }

  // Kondisi (opsional, validasi jika diisi)
  if (merged.condition && !['NEW', 'USED', 'REFURBISHED'].includes(merged.condition)) {
    warn('condition', `Kondisi "${merged.condition}" tidak standar.`, 'Gunakan NEW/USED/REFURBISHED atau kosongkan.');
  }

  const mode = 'SINGLE_SKU';

  return {
    valid: errors.length === 0,
    mode,
    categoryId,
    usableImages: usable,
    merged,
    overrideFields,
    errors,
    warnings,
  };
}

export function escapeXml(s) {
  return String(s ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

export function buildLazadaPayload(p, validation) {
  if (!validation.valid) {
    throw new Error(`Produk "${p.name || p.id}" belum VALID (${validation.errors.length} error). Perbaiki dulu, jangan sinkron.`);
  }
  const m = validation.merged;
  const weightKg = Number.isFinite(m.weightGrams) ? (m.weightGrams / 1000) : 0;
  const desc = m.description || '';
  const shortDesc = m.specs || '';
  const brand = m.brandId ? undefined : (m.brand || 'No Brand');
  const brandId = m.brandId || undefined;

  const attrs = {
    name: m.name,
    description: desc,
    short_description: shortDesc,
    brand: brand,
  };
  if (brandId) attrs.brand_id = brandId;

  const sku = {
    SellerSku: m.sku,
    quantity: String(m.stock),
    price: String(m.price),
    package_height: String(m.heightCm),
    package_length: String(m.lengthCm),
    package_width: String(m.widthCm),
    package_weight: String(weightKg),
    package_content: m.specs || m.name,
    Images: { Image: validation.usableImages.slice(0, 8) },
  };
  if (Number.isFinite(m.discountPrice)) {
    sku.special_price = String(m.discountPrice);
  }

  const product = {
    PrimaryCategory: validation.categoryId,
    Images: { Image: validation.usableImages.slice(0, 8) },
    Attributes: attrs,
    Skus: { Sku: [sku] },
  };

  const wrapped = { Request: { Product: product } };

  return {
    ...wrapped,
    sanity_ref: { id: p.id, category: p.category || '' },
    overrides_applied: validation.overrideFields,
  };
}

const csvCell = (v) => `"${String(v ?? '').replace(/"/g, '""').replace(/\r?\n/g, ' ').trim()}"`;

export function buildLazadaCsv(p, validation) {
  const m = validation.merged;
  const header = [
    'sanity_id', 'product_name', 'lazada_category_id', 'sanity_category', 'brand', 'brand_id',
    'description', 'specs', 'price_idr', 'special_price_idr', 'stock', 'seller_sku',
    'weight_kg', 'length_cm', 'width_cm', 'height_cm',
    'image_1', 'image_2', 'image_3', 'image_4',
    'validation_status', 'validation_notes',
  ];
  const notes = [
    ...validation.errors.map((e) => `ERROR[${e.field}]: ${e.message}`),
    ...validation.warnings.map((w) => `WARN[${w.field}]: ${w.message}`),
  ].join(' | ') || 'OK';
  const imgs = validation.usableImages.slice(0, 4);
  while (imgs.length < 4) imgs.push('');
  const row = [
    p.id, m.name, validation.categoryId, p.category, m.brand, m.brandId,
    m.description, m.specs,
    Number.isFinite(m.price) ? m.price : '', Number.isFinite(m.discountPrice) ? m.discountPrice : '',
    Number.isFinite(m.stock) ? m.stock : '', m.sku,
    Number.isFinite(m.weightGrams) ? (m.weightGrams / 1000) : '',
    Number.isFinite(m.lengthCm) ? m.lengthCm : '', Number.isFinite(m.widthCm) ? m.widthCm : '',
    Number.isFinite(m.heightCm) ? m.heightCm : '',
    ...imgs,
    validation.valid ? 'VALID' : 'INVALID',
    notes,
  ];
  return '\uFEFF' + header.join(',') + '\n' + row.map(csvCell).join(',') + '\n';
}

export function lazadaEnvStatus(env = process.env) {
  const has = (k) => Boolean(env[k] && String(env[k]).trim());
  const credentialsComplete = has('LAZADA_APP_KEY') && has('LAZADA_APP_SECRET') && has('LAZADA_ACCESS_TOKEN');
  const syncEnabled = String(env.LAZADA_SYNC_ENABLED || '').toLowerCase() === 'true';
  return {
    mode: syncEnabled && credentialsComplete ? 'SYNC_ARMED' : 'DRY_RUN_EXPORT',
    syncEnabled,
    credentialsComplete,
    hasAppKey: has('LAZADA_APP_KEY'),
    hasAppSecret: has('LAZADA_APP_SECRET'),
    hasAccessToken: has('LAZADA_ACCESS_TOKEN'),
    hasRefreshToken: has('LAZADA_REFRESH_TOKEN'),
    hasAdminKey: has('LAZADA_ADMIN_KEY'),
    syncBlocked: !(syncEnabled && credentialsComplete),
  };
}

export function readJsonBody(req) {
  return new Promise((resolve) => {
    if (req.body && typeof req.body === 'object') return resolve(req.body);
    let raw = '';
    req.on('data', (c) => { raw += c; });
    req.on('end', () => {
      try {
        resolve(raw ? JSON.parse(raw) : {});
      } catch {
        resolve({});
      }
    });
    req.on('error', () => resolve({}));
  });
}

// ---------------------------------------------------------------------------
// Tanda tangan (signature) Lazada Open Platform.
// Standar Lazada: urutkan parameter (kecuali "sign"), gabung "key+value",
// awali dengan nama API (contoh "/auth/token/create"), lalu HMAC-SHA256
// dan hasilnya HURUF BESAR.
// Beberapa akun/SDK memakai variasi lain, jadi kita sediakan beberapa varian
// dan memakai yang pertama diterima server.
// ---------------------------------------------------------------------------
export function lazadaSignBase(params) {
  return Object.keys(params)
    .filter((k) => k !== 'sign' && params[k] !== undefined && params[k] !== null)
    .sort()
    .map((k) => `${k}${params[k]}`)
    .join('');
}

export function lazadaSignVariants(apiPath, params, appSecret) {
  const base = lazadaSignBase(params);
  const secret = String(appSecret || '');
  const hex = (s) => crypto.createHmac('sha256', secret).update(s, 'utf8').digest('hex');
  return [
    { name: 'apiPath+uppercase', sign: hex(`${apiPath}${base}`).toUpperCase() },
    { name: 'apiPath+lowercase', sign: hex(`${apiPath}${base}`) },
    { name: 'params+uppercase', sign: hex(base).toUpperCase() },
    { name: 'params+lowercase', sign: hex(base) },
  ];
}

export function lazadaSign(apiPath, params, appSecret) {
  return lazadaSignVariants(apiPath, params, appSecret)[0].sign;
}
