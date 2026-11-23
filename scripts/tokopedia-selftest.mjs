// scripts/tokopedia-selftest.mjs — uji offline Phase 2 (tanpa jaringan).
// Jalankan: node scripts/tokopedia-selftest.mjs
import {
  ttsSign, ttsEnvStatus, validateTtsProduct, buildTtsPayload,
  TTS_BASE, TTS_IMAGE_MAX_COUNT,
} from '../api/_lib/tokopedia.js';

let pass = 0; let fail = 0;
const check = (name, cond, extra = '') => {
  if (cond) { pass++; console.log(`  ✅ ${name}`); }
  else { fail++; console.log(`  ❌ ${name}${extra ? ` — ${extra}` : ''}`); }
};

console.log('== TikTok Shop self-test (Phase 2) ==\n');

console.log('0) Sign algoritme vs contoh resmi docs:');
const got = ttsSign(
  '/authorization/202309/shops',
  { app_key: '29a39d', timestamp: 1623812664 },
  '',
  'e59af819cc',
);
const want = 'b596b73e0cc6de07ac26f036364178ab16b0a907af13d43f0a0cd2345f582dc8';
check('contoh resmi ter-reproduksi', got === want, got);
check('base URL benar', TTS_BASE === 'https://open-api.tiktokglobalshop.com');
check('batas gambar 9', TTS_IMAGE_MAX_COUNT === 9);

// sign POST dengan body
const postSign = ttsSign(
  '/product/202309/products',
  { app_key: 'k', timestamp: 1700000000, shop_cipher: 'ABC' },
  '{"save_mode":"AS_DRAFT"}',
  'sekret',
);
check('sign POST stabil (hex 64)', /^[0-9a-f]{64}$/.test(postSign));
const postSign2 = ttsSign(
  '/product/202309/products',
  { shop_cipher: 'ABC', timestamp: 1700000000, app_key: 'k' }, // urutan berbeda
  '{"save_mode":"AS_DRAFT"}',
  'sekret',
);
check('urutan query tak mempengaruhi sign', postSign === postSign2);

console.log('\n1) Validasi produk lengkap:');
const complete = {
  _id: 'prod-001',
  id: 'prod-001',
  name: 'Treadmill Elektrik ProRunner X500 Lipat 2.5HP untuk Home Gym',
  price: 4500000,
  discountPrice: 3999000,
  description: 'Treadmill elektrik lipat untuk home gym.',
  stock: 12,
  sku: 'TF-TRD-X500',
  weightGrams: 45000,
  images: [
    'https://cdn.sanity.io/images/qi4rocc0/production/a.jpg',
    'https://cdn.sanity.io/images/qi4rocc0/production/b.jpg',
  ],
};
const v1 = validateTtsProduct(complete, {});
check('valid === true', v1.valid === true, JSON.stringify(v1.errors));
check('judul asli terpakai (>=25)', v1.title === complete.name && v1.title.length >= 25);
check('seller_sku bersih', v1.sellerSku === 'TF-TRD-X500');
check('berat 45000g dipakai', v1.weightGrams === 45000);
check('2 gambar usable', v1.usableImages.length === 2);

console.log('\n2) Validasi produk bermasalah:');
const broken = { _id: 'x', id: 'x', name: '', price: 0, stock: -3, images: [] };
const v2 = validateTtsProduct(broken, {});
check('invalid', v2.valid === false);
check('error nama+harga+stok+gambar', v2.errors.length >= 4, JSON.stringify(v2.errors));

const shortName = { _id: 's', id: 's', name: 'Barbel 10kg', price: 100000, stock: 5, images: ['https://cdn.sanity.io/images/qi4rocc0/production/c.jpg'] };
const v3 = validateTtsProduct(shortName, {});
check('judul pendek dipad jadi >=25', v3.valid && v3.title.length >= 25, v3.title);
check('SKU kosong dibuat otomatis', v3.sellerSku.startsWith('TF-'), v3.sellerSku);

const floatStock = { ...complete, stock: 2.5 };
const v4 = validateTtsProduct(floatStock, {});
check('stok non-bulat ditolak', v4.valid === false && v4.errors.some((e) => e.field === 'stock'));

console.log('\n3) Bangun payload create-product:');
const wh = 'WH123';
const payload = buildTtsPayload(complete, v1, {
  categoryId: '999888777',
  warehouseId: wh,
  imageUris: ['uri-a', 'uri-b'],
  saveMode: 'AS_DRAFT',
});
check('save_mode AS_DRAFT', payload.save_mode === 'AS_DRAFT');
check('category_id string', payload.category_id === '999888777');
check('main_images 2', payload.main_images.length === 2 && payload.main_images[0].uri === 'uri-a');
check('listing_platforms ganda', JSON.stringify(payload.listing_platforms) === '["TIKTOK_SHOP","TOKOPEDIA"]');
check('category_version v2', payload.category_version === 'v2');
check('external_product_id = id Sanity', payload.external_product_id === 'prod-001');
check('package_weight KILOGRAM 45', payload.package_weight.value === '45.00' && payload.package_weight.unit === 'KILOGRAM');
check('1 SKU', payload.skus.length === 1);
check('seller_sku terpakai', payload.skus[0].seller_sku === 'TF-TRD-X500');
check('currency IDR', payload.skus[0].price.currency === 'IDR');
check('amount = harga normal 2 desimal', payload.skus[0].price.amount === '4500000.00');
check('sale_price = diskon', payload.skus[0].price.sale_price === '3999000.00');
check('inventory warehouse+quantity', payload.skus[0].inventory[0].warehouse_id === wh && payload.skus[0].inventory[0].quantity === 12);
check('description HTML', payload.description.startsWith('<p>') && payload.description.includes('</p>'));
check('saveMode LISTING diterima', buildTtsPayload(complete, v1, { categoryId: '1', warehouseId: 'w', imageUris: ['u'], saveMode: 'LISTING' }).save_mode === 'LISTING');

const noSale = validateTtsProduct({ ...complete, discountPrice: null }, {});
const pNoSale = buildTtsPayload(complete, noSale, { categoryId: '1', warehouseId: 'w', imageUris: ['u'] });
check('tanpa diskon: sale = harga', pNoSale.skus[0].price.sale_price === pNoSale.skus[0].price.amount);

let threw = false;
try { buildTtsPayload(complete, v1, { categoryId: '', warehouseId: 'w', imageUris: ['u'] }); } catch { threw = true; }
check('categoryId kosong melempar', threw);
threw = false;
try { buildTtsPayload(complete, v1, { categoryId: '1', warehouseId: 'w', imageUris: [] }); } catch { threw = true; }
check('imageUris kosong melempar', threw);

console.log('\n4) Lock sinkron (ttsEnvStatus):');
const saved = { ...process.env };
delete process.env.TOKOPEDIA_SYNC_ENABLED;
delete process.env.TOKOPEDIA_APP_KEY;
let st = ttsEnvStatus();
check('tanpa flag: syncEnabled false', st.syncEnabled === false);
check('tanpa flag: syncBlocked true', st.syncBlocked === true);

process.env.TOKOPEDIA_SYNC_ENABLED = 'true';
process.env.TOKOPEDIA_APP_KEY = 'k';
process.env.TOKOPEDIA_APP_SECRET = 's';
process.env.TOKOPEDIA_ACCESS_TOKEN = 't';
process.env.TOKOPEDIA_REFRESH_TOKEN = 'r';
st = ttsEnvStatus();
check('flag+token: syncEnabled true', st.syncEnabled === true);
check('flag+token: syncBlocked false', st.syncBlocked === false);

process.env.TOKOPEDIA_SYNC_ENABLED = 'TRUE'; // case-insensitive
st = ttsEnvStatus();
check('case-insensitive', st.syncEnabled === true);

process.env.TOKOPEDIA_SYNC_ENABLED = 'false';
st = ttsEnvStatus();
check('flag false: blocked lagi', st.syncBlocked === true);

// kredensial hilang walau flag true -> tetap blocked
process.env.TOKOPEDIA_SYNC_ENABLED = 'true';
delete process.env.TOKOPEDIA_ACCESS_TOKEN;
st = ttsEnvStatus();
check('token hilang: blocked', st.syncBlocked === true);

// restore
for (const k of Object.keys(process.env)) {
  if (!(k in saved)) delete process.env[k];
}
Object.assign(process.env, saved);

console.log('\n5) Overrides panel:');
const ov = validateTtsProduct(shortName, { title: 'Barbel Karet 10kg Premium Satuan - Toko Fitness', price: 150000, stock: 8, sku: 'BBL-10' });
check('judul override dipakai', ov.title.startsWith('Barbel Karet'), ov.title);
check('harga override', ov.price === 150000);
check('stok override', ov.stock === 8);
check('sku override', ov.sellerSku === 'BBL-10');

console.log(`\n== Hasil: ${pass} lolos, ${fail} gagal ==`);
if (fail > 0) process.exit(1);
console.log('Self-test HIJAU.');
