// scripts/lazada-selftest.mjs
import { normalizeProduct, validateProduct, buildLazadaPayload, buildLazadaCsv, lazadaEnvStatus } from '../api/_lib/lazada.js';

let pass = 0; let fail = 0;
const check = (name, cond, extra = '') => {
  if (cond) { pass++; console.log(`  ✅ ${name}`); }
  else { fail++; console.log(`  ❌ ${name}${extra ? ` — ${extra}` : ''}`); }
};

console.log('== Lazada sync self-test ==\n');

const complete = normalizeProduct({
  _id: 'fixture-lengkap-001',
  name: 'Treadmill Elektrik ProRunner X500 Lipat 2.5HP untuk Home Gym Keluarga',
  price: 4500000,
  discountPrice: 3999000,
  description: 'Treadmill elektrik lipat untuk home gym. '.repeat(20),
  specs: 'Motor 2.5HP, kecepatan 1-14 km/jam.',
  stock: 12,
  sku: 'TF-TRD-X500',
  weightGrams: 45000,
  lengthCm: 160, widthCm: 70, heightCm: 30,
  condition: 'NEW',
  brand: 'ProRunner',
  lazadaCategoryId: '12345',
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
try { payload = buildLazadaPayload(complete, v1); check('payload terbentuk', !!payload?.Request?.Product); }
catch (e) { check('payload terbentuk', false, e.message); }
check('payload bawa category_id', payload?.Request?.Product?.PrimaryCategory === '12345');
check('payload bawa brand', payload?.Request?.Product?.Attributes?.brand === 'ProRunner');
check('CSV VALID terbentuk', buildLazadaCsv(complete, v1).includes('VALID'));

const empty = normalizeProduct({
  _id: 'fixture-kosong-002',
  name: 'Dumbbell',
  price: 0,
  description: '',
  category: 'Kategori Tak Terdaftar XYZ',
  mainImage: 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?q=80&w=800',
  galleryImages: [],
});

console.log('\n2) Produk kosong harus DITOLAK per-field:');
const v2 = validateProduct(empty);
check('valid === false', v2.valid === false);
const fields = v2.errors.map((e) => e.field);
for (const f of ['price', 'stock', 'sku', 'brand', 'categoryId', 'weightGrams', 'lengthCm', 'widthCm', 'heightCm', 'images']) {
  check(`error field "${f}" dilaporkan`, fields.includes(f), `dapat: ${fields.join(',')}`);
}
check('gambar placeholder terdeteksi', v2.errors.some((e) => e.field === 'images' && /placeholder/i.test(e.message)));
let threw = false;
try { buildLazadaPayload(empty, v2); } catch { threw = true; }
check('buildLazadaPayload MENOLAK produk invalid', threw === true);
check('CSV bertanda INVALID', buildLazadaCsv(empty, v2).includes('INVALID'));

console.log('\n3) Overrides eksplisit:');
const v3 = validateProduct(empty, {
  price: 250000, stock: 10, sku: 'TF-DMB-001', brand: 'No Brand',
  weightGrams: 5000, lengthCm: 30, widthCm: 15, heightCm: 15, categoryId: '99999',
});
const stillMissing = v3.errors.map((e) => e.field);
check('hanya error images tersisa', stillMissing.length > 0 && stillMissing.every((f) => f === 'images'), `dapat: ${stillMissing.join(',')}`);
check('overrideFields tercatat', v3.overrideFields.includes('categoryId') && v3.overrideFields.includes('weightGrams'));

console.log('\n4) Harga diskon >= harga normal ditolak:');
const v4 = validateProduct({ ...complete, discountPrice: 4500000 });
check('discountPrice >= price ditolak', v4.errors.some((e) => e.field === 'discountPrice'));

console.log('\n5) Status env default = TERKUNCI:');
const s = lazadaEnvStatus({});
check('syncBlocked === true', s.syncBlocked === true);
check('mode DRY_RUN_EXPORT', s.mode === 'DRY_RUN_EXPORT');
check('credentialsComplete === false', s.credentialsComplete === false);
const s2 = lazadaEnvStatus({
  LAZADA_APP_KEY: 'k', LAZADA_APP_SECRET: 's', LAZADA_ACCESS_TOKEN: 'a', LAZADA_SYNC_ENABLED: 'true',
});
check('env lengkap + flag => SYNC_ARMED', s2.mode === 'SYNC_ARMED' && s2.syncBlocked === false);

console.log(`\n== Hasil: ${pass} lolos, ${fail} gagal ==`);
if (fail > 0) process.exit(1);
console.log('Self-test HIJAU.');
