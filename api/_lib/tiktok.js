// api/_lib/tiktok.js
// Inti integrasi Sanity -> TikTok Shop. Tanpa dependensi (Node 18+ / Vercel).
// Prinsip: TIDAK MENEBak data kosong. Field kosong => error validasi.

import { lookupTiktokCategoryId } from './tiktok-category-map.js';

export const SANITY_PROJECT_IDS = ['qi4rocc0', '856jrik3'];
export const SANITY_DATASET = 'production';
export const SANITY_API_VERSION = 'v2024-01-01';

const GROQ_PRODUCT = `*[_type == "product"] | order(_createdAt desc) {
  _id, name, title, nama, price, discountPrice, description, specs,
  stock, sku, weightGrams, lengthCm, widthCm, heightCm,
  condition, brand, tiktokCategoryId, tag, rating, reviews,
  order, sortOrder, urutan, isFeatured, featured, isUnggulan, showOnHome,
  shopeeUrl, shopee,
  "mainImage": coalesce(image.asset->url, foto.asset->url, photo.asset->url, gambar.asset->url, ""),
  "galleryImages": coalesce(images[].asset->url, gallery[].asset->url, photos[].asset->url, []),
  "category": coalesce(category->title, category->name, kategori->title, kategori->name, category, kategori, "")
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

// ---------- Fetch Sanity (sisi server) ----------

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

// ---------- Normalisasi (tanpa tebakan) ----------

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
    tiktokCategoryId: asText(item.tiktokCategoryId),
    category: asText(item.category),
    tag: asText(item.tag),
    rating: asNumber(item.rating),
    images,
    raw: undefined, // sengaja tidak membawa seluruh blob mentah ke browser
  };
}

// ---------- Validasi TikTok Shop ----------

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
  };
  const overrideFields = Object.keys(o).filter((k) => o[k] !== undefined && o[k] !== '');

  // Nama
  if (!merged.name) err('name', 'Nama produk kosong.', 'Isi field name/title di Sanity.');
  else {
    if (merged.name.length < 25) warn('name', `Nama hanya ${merged.name.length} karakter (disarankan ≥ 25).`, 'Perpanjang nama: merek + jenis + fitur utama.');
    if (merged.name.length > 200) err('name', `Nama ${merged.name.length} karakter (maks 200).`, 'Persingkat nama produk.');
    if (/https?:\/\//i.test(merged.name)) err('name', 'Nama mengandung URL.', 'Hapus URL dari nama.');
  }

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
  if (!merged.sku) err('sku', 'SKU kosong (wajib untuk sinkron API).', "Tambah field 'sku' di skema Sanity lalu isi unik per produk.");

  // Deskripsi
  if (!merged.description) err('description', 'Deskripsi kosong.', 'Isi field description di Sanity.');
  else {
    if (merged.description.length < 300) warn('description', `Deskripsi ${merged.description.length} karakter (disarankan ≥ 300).`, 'Tambah 3–5 selling point.');
    if (merged.description.length > 10000) err('description', 'Deskripsi > 10.000 karakter.', 'Persingkat deskripsi.');
  }

  // Gambar
  const realImages = (p.images || []).filter(Boolean);
  const placeholders = realImages.filter(isPlaceholderImage);
  const usable = realImages.filter((u) => !isPlaceholderImage(u) && /^https?:\/\//i.test(u));
  if (placeholders.length > 0) err('images', `${placeholders.length} gambar adalah placeholder/stok (mis. Unsplash).`, 'Ganti dengan foto produk asli di Sanity.');
  if (usable.length === 0) err('images', 'Tidak ada gambar valid (URL http(s) foto asli).', 'Unggah minimal 1 foto produk asli.');
  else {
    if (usable.length > 9) err('images', `${usable.length} gambar (maks 9).`, 'Kurangi hingga ≤ 9 gambar.');
    if (usable.length < 5) warn('images', `Hanya ${usable.length} gambar (disarankan ≥ 5, rasio 1:1, ≥800×800).`, 'Tambah foto dari berbagai sudut; foto utama latar putih.');
  }

  // Kategori TikTok (tidak boleh ditebak)
  const mappedId = lookupTiktokCategoryId(p.category);
  const categoryId = String(o.categoryId ?? p.tiktokCategoryId ?? mappedId ?? '').trim();
  if (!categoryId) {
    err('categoryId', `Kategori "${p.category || '(kosong)'}" belum terpetakan ke TikTok category_id.`, 'Isi tiktokCategoryId di Sanity ATAU api/_lib/tiktok-category-map.js dari data resmi Get Categories.');
  } else if (!/^\d+$/.test(categoryId)) {
    err('categoryId', `category_id "${categoryId}" tidak valid (harus angka).`, 'Periksa ID kategori daun dari API/Seller Center.');
  }

  // Kondisi
  if (!merged.condition) err('condition', 'Kondisi produk kosong.', "Isi field 'condition' (NEW/USED) di Sanity atau overrides.");
  else if (!['NEW', 'USED'].includes(merged.condition)) err('condition', `Kondisi "${merged.condition}" harus NEW atau USED.`, 'Perbaiki nilai condition.');

  // Berat & dimensi paket
  if (!Number.isFinite(merged.weightGrams)) err('weightGrams', 'Berat paket kosong.', "Tambah field 'weightGrams' (gram) di Sanity.");
  else if (merged.weightGrams <= 0) err('weightGrams', 'Berat paket harus > 0 gram.', 'Isi berat paket aktual (timbang).');
  if (!Number.isFinite(merged.lengthCm)) err('lengthCm', 'Panjang paket kosong.', "Tambah field 'lengthCm' (cm).");
  else if (merged.lengthCm <= 0) err('lengthCm', 'Panjang harus > 0 cm.', 'Ukur kemasan aktual.');
  if (!Number.isFinite(merged.widthCm)) err('widthCm', 'Lebar paket kosong.', "Tambah field 'widthCm' (cm).");
  else if (merged.widthCm <= 0) err('widthCm', 'Lebar harus > 0 cm.', 'Ukur kemasan aktual.');
  if (!Number.isFinite(merged.heightCm)) err('heightCm', 'Tinggi paket kosong.', "Tambah field 'heightCm' (cm).");
  else if (merged.heightCm <= 0) err('heightCm', 'Tinggi harus > 0 cm.', 'Ukur kemasan aktual.');

  // Brand (opsional, tapi butuh otorisasi bila diisi)
  if (merged.brand) {
    warn('brand', `Brand "${merged.brand}" perlu Brand Authorization di Seller Center.`, 'Ajukan otorisasi brand sebelum sinkron produk bermerek.');
  }

  // Varian: Sanity belum punya struktur varian -> mode single-SKU
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

// ---------- Mapping ke payload TikTok Shop (pratinjau / create product) ----------

export function escapeHtml(s) {
  return String(s ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

export function buildTiktokPayload(p, validation) {
  if (!validation.valid) {
    throw new Error(`Produk "${p.name || p.id}" belum VALID (${validation.errors.length} error). Perbaiki dulu, jangan sinkron.`);
  }
  const m = validation.merged;
  const descHtml = `<p>${escapeHtml(m.description).replace(/\n/g, '<br/>')}</p>`
    + (m.specs ? `<p><strong>Spesifikasi:</strong><br/>${escapeHtml(m.specs).replace(/\n/g, '<br/>')}</p>` : '');
  return {
    product_name: m.name,
    category_id: validation.categoryId,
    brand: m.brand || undefined,
    condition: m.condition, // NEW | USED
    description_html: descHtml,
    main_images: validation.usableImages.slice(0, 9).map((url) => ({ uri: url })),
    // SKU tunggal (Sanity belum punya varian)
    skus: [
      {
        seller_sku: m.sku,
        price: { currency: 'IDR', amount: String(m.price) },
        sale_price: Number.isFinite(m.discountPrice) ? { currency: 'IDR', amount: String(m.discountPrice) } : undefined,
        stock: m.stock,
      },
    ],
    package_weight: { value: String(m.weightGrams), unit: 'GRAM' },
    package_dimensions: {
      length: String(m.lengthCm),
      width: String(m.widthCm),
      height: String(m.heightCm),
      unit: 'CENTIMETER',
    },
    sanity_ref: { id: p.id, category: p.category || '' },
    overrides_applied: validation.overrideFields,
  };
}

// ---------- Ekspor CSV aman (1 produk; untuk upload manual di Seller Center) ----------

const csvCell = (v) => `"${String(v ?? '').replace(/"/g, '""').replace(/\r?\n/g, ' ').trim()}"`;

export function buildTiktokCsv(p, validation) {
  const m = validation.merged;
  const header = [
    'sanity_id', 'product_name', 'tiktok_category_id', 'sanity_category', 'brand', 'condition',
    'description', 'specs', 'price_idr', 'discount_price_idr', 'stock', 'sku',
    'weight_grams', 'length_cm', 'width_cm', 'height_cm',
    'image_1', 'image_2', 'image_3', 'image_4', 'image_5',
    'validation_status', 'validation_notes',
  ];
  const notes = [
    ...validation.errors.map((e) => `ERROR[${e.field}]: ${e.message}`),
    ...validation.warnings.map((w) => `WARN[${w.field}]: ${w.message}`),
  ].join(' | ') || 'OK';
  const imgs = validation.usableImages.slice(0, 5);
  while (imgs.length < 5) imgs.push('');
  const row = [
    p.id, m.name, validation.categoryId, p.category, m.brand, m.condition,
    m.description, m.specs,
    Number.isFinite(m.price) ? m.price : '', Number.isFinite(m.discountPrice) ? m.discountPrice : '',
    Number.isFinite(m.stock) ? m.stock : '', m.sku,
    Number.isFinite(m.weightGrams) ? m.weightGrams : '',
    Number.isFinite(m.lengthCm) ? m.lengthCm : '', Number.isFinite(m.widthCm) ? m.widthCm : '',
    Number.isFinite(m.heightCm) ? m.heightCm : '',
    ...imgs,
    validation.valid ? 'VALID' : 'INVALID',
    notes,
  ];
  return '﻿' + header.join(',') + '\n' + row.map(csvCell).join(',') + '\n';
}

// ---------- Status kredensial (boolean saja — tidak pernah mengembalikan nilai secret) ----------

export function tiktokEnvStatus(env = process.env) {
  const has = (k) => Boolean(env[k] && String(env[k]).trim());
  const credentialsComplete = has('TIKTOK_APP_KEY') && has('TIKTOK_APP_SECRET')
    && has('TIKTOK_ACCESS_TOKEN') && has('TIKTOK_REFRESH_TOKEN')
    && has('TIKTOK_SHOP_ID') && has('TIKTOK_SHOP_CIPHER');
  const syncEnabled = String(env.TIKTOK_SYNC_ENABLED || '').toLowerCase() === 'true';
  return {
    mode: syncEnabled && credentialsComplete ? 'SYNC_ARMED' : 'DRY_RUN_EXPORT',
    syncEnabled,
    credentialsComplete,
    hasAppKey: has('TIKTOK_APP_KEY'),
    hasAppSecret: has('TIKTOK_APP_SECRET'),
    hasAccessToken: has('TIKTOK_ACCESS_TOKEN'),
    hasRefreshToken: has('TIKTOK_REFRESH_TOKEN'),
    hasShopId: has('TIKTOK_SHOP_ID'),
    hasShopCipher: has('TIKTOK_SHOP_CIPHER'),
    hasAdminKey: has('TIKTOK_ADMIN_KEY'),
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
