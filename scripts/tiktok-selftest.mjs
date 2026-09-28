// scripts/tiktok-selftest.mjs
// Uji validator/mapper/dry-run dengan FIXTURE SINTETIS (bukan data Sanity asli).
// Tidak memanggil jaringan sama sekali. Wajib hijau sebelum deploy.
// Jalankan: node scripts/tiktok-selftest.mjs

import { normalizeProduct, validateProduct, buildTiktokPayload, buildTiktokCsv, tiktokEnvStatus } from '../api/_lib/tiktok.js';

let pass = 0;
let fail = 0;
const check = (name, cond, extra = '') => {
  if (cond) { pass++; console.log(`  ✅ ${name}`); }
  else { fail++; console.log(`  ❌ ${name}${extra ? ` — ${extra}` : ''}`); }
};

console.log('== TikTok sync self-test (fixture sintetis, tanpa jaringan) ==\n');

// Fixture 1: produk LENGKAP (mensimulasikan Sanity yang sudah dilengkapi field baru)
const complete = normalizeProduct({
  _id: 'fixture-lengkap-001',
  name: 'Treadmill Elektrik ProRunner X500 Lipat 2.5HP untuk Home Gym Keluarga',
  price: 4500000,
  discountPrice: 3999000,
  description: 'Treadmill elektrik lipat untuk home gym. '.repeat(20), // > 300 char
  specs: 'Motor 2.5HP, kecepatan 1-14 km/jam, kemiringan manual.',
  stock: 12,
  sku: 'TF-TRD-X500',
  weightGrams: 45000,
  lengthCm: 160, widthCm: 70, heightCm: 30,
  condition: 'NEW',
  brand: '',
  tiktokCategoryId: '601234',
  category: 'Treadmill',
  mainImage: 'https://cdn.sanity.io/images/xxx/prod/foto-asli-1.jpg',
  galleryImages: [
    'https://cdn.sanity.io/images/xxx/prod/foto-asli-2.jpg',
    'https://cdn.sanity.io/images/xxx/prod/foto-asli-3.jpg',
    'https://cdn.sanity.io/images/xxx/prod/foto-asli-4.jpg',
    'https://cdn.sanity.io/images/xxx/prod/foto-asli-5.jpg',
  ],
});

console.log('1) Produk lengkap harus VALID + payload terbentuk:');
const v1 = validateProduct(complete);
check('valid === true', v1.valid === true, JSON.stringify(v1.errors));
check('tanpa error', v1.errors.length === 0);
let payload = null;
try { payload = buildTiktokPayload(complete, v1); check('payload terbentuk', !!payload?.product_name); }
catch (e) { check('payload terbentuk', false, e.message); }
check('payload bawa category_id eksplisit', payload?.category_id === '601234');
check('payload bawa berat 45000 GRAM', payload?.package_weight?.value === '45000');
check('payload bawa 5 gambar', payload?.main_images?.length === 5);
check('CSV VALID terbentuk', buildTiktokCsv(complete, v1).includes('VALID'));

// Fixture 2: produk KOSONG seperti kondisi Sanity saat ini (tanpa tebakan!)
const empty = normalizeProduct({
  _id: 'fixture-kosong-002',
  name: 'Dumbbell',
  price: 0,
  description: '',
  // stock, sku, weight, dimensions, condition, categoryId: TIDAK ADA
  category: 'Kategori Tak Terdaftar XYZ',
  mainImage: 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?q=80&w=800', // placeholder!
  galleryImages: [],
});

console.log('\n2) Produk kosong harus DITOLAK per-field (tanpa ditebak):');
const v2 = validateProduct(empty);
check('valid === false', v2.valid === false);
const fields = v2.errors.map((e) => e.field);
for (const f of ['price', 'stock', 'sku', 'description', 'images', 'categoryId', 'condition', 'weightGrams', 'lengthCm', 'widthCm', 'heightCm']) {
  check(`error field "${f}" dilaporkan`, fields.includes(f), `dapat: ${fields.join(',')}`);
}
check('gambar placeholder terdeteksi', v2.errors.some((e) => e.field === 'images' && /placeholder/i.test(e.message)));
let threw = false;
try { buildTiktokPayload(empty, v2); } catch { threw = true; }
check('buildTiktokPayload MENOLAK produk invalid', threw === true);
check('CSV bertanda INVALID', buildTiktokCsv(empty, v2).includes('INVALID'));

// Fixture 3: overrides eksplisit (bukan tebakan) bisa melengkapi
console.log('\n3) Overrides eksplisit per aksi tercatat (bukan default tersembunyi):');
const v3 = validateProduct(empty, {
  price: 250000, stock: 10, sku: 'TF-DMB-001', description: 'Dumbbell besi cor lapis karet. '.repeat(20),
  condition: 'NEW', weightGrams: 5000, lengthCm: 30, widthCm: 15, heightCm: 15, categoryId: '601999',
});
const stillMissing = v3.errors.map((e) => e.field);
check('hanya error images tersisa', stillMissing.length > 0 && stillMissing.every((f) => f === 'images'), `dapat: ${stillMissing.join(',')}`);
check('overrideFields tercatat', v3.overrideFields.includes('categoryId') && v3.overrideFields.includes('weightGrams'));

// Fixture 4: harga diskon >= harga normal ditolak
console.log('\n4) Aturan harga diskon:');
const v4 = validateProduct({ ...complete, discountPrice: 4500000 });
check('discountPrice >= price ditolak', v4.errors.some((e) => e.field === 'discountPrice'));

// Fixture 5: status env default = terkunci
console.log('\n5) Status kredensial default (tanpa env) = TERKUNCI:');
const s = tiktokEnvStatus({});
check('syncBlocked === true', s.syncBlocked === true);
check('mode DRY_RUN_EXPORT', s.mode === 'DRY_RUN_EXPORT');
check('credentialsComplete === false', s.credentialsComplete === false);
const s2 = tiktokEnvStatus({
  TIKTOK_APP_KEY: 'k', TIKTOK_APP_SECRET: 's', TIKTOK_ACCESS_TOKEN: 'a',
  TIKTOK_REFRESH_TOKEN: 'r', TIKTOK_SHOP_ID: '1', TIKTOK_SHOP_CIPHER: 'c', TIKTOK_SYNC_ENABLED: 'true',
});
check('env lengkap + flag => SYNC_ARMED', s2.mode === 'SYNC_ARMED' && s2.syncBlocked === false);

console.log(`\n== Hasil: ${pass} lolos, ${fail} gagal ==`);
if (fail > 0) process.exit(1);
console.log('Self-test HIJAU. Validator menolak data kosong (tidak menebak), sync default terkunci.');
