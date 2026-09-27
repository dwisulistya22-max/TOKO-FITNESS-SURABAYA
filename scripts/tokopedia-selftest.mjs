// scripts/tokopedia-selftest.mjs — Uji pembuat file massal Tokopedia (fixture, tanpa jaringan).
// Jalankan: node scripts/tokopedia-selftest.mjs

import { normalizeProduct } from '../api/_lib/tiktok.js';
import { buildTokopediaMasterCsv, makeSku } from '../api/_lib/tokopedia.js';
import { TOKOPEDIA_SPECS } from '../api/_lib/tokopedia-specs.js';

let pass = 0;
let fail = 0;
const check = (name, cond, extra = '') => {
  if (cond) { pass++; console.log(`  ✅ ${name}`); }
  else { fail++; console.log(`  ❌ ${name}${extra ? ` — ${extra}` : ''}`); }
};

console.log('== Tokopedia massal self-test (fixture, tanpa jaringan) ==\n');

// Produk A: ID fiktif (tidak ada di file riset) => berat kosong + ditandai
// Produk B: pakai salah satu ID riset batch 1 => berat terisi + sumber tercatat
const specIds = Object.keys(TOKOPEDIA_SPECS);
const specId = specIds[0];
const spec = TOKOPEDIA_SPECS[specId];

const products = [
  normalizeProduct({
    _id: 'fiktif-tanpa-riset', name: 'Produk Fiktif Tanpa Riset',
    price: 100000, stock: 5, description: 'Deskripsi ada.', category: 'Fitness',
    mainImage: 'https://cdn.sanity.io/images/x/prod/a.webp', galleryImages: [],
  }),
  normalizeProduct({
    _id: specId, name: 'Produk Batch 1 (ID riset)',
    price: 200000, stock: 3, description: 'Deskripsi ada.', category: 'Fitness',
    mainImage: 'https://cdn.sanity.io/images/x/prod/b.jpg', galleryImages: [],
  }),
  normalizeProduct({
    _id: 'zzz999', name: 'Dumbbell Set', price: 0, stock: 0,
    description: '', category: 'Dumbbell',
    mainImage: 'https://images.unsplash.com/photo-xxx', galleryImages: [],
  }),
];

const csv = buildTokopediaMasterCsv(products);
const lines = csv.split('\n').filter((l) => l.trim());

check('header 20 kolom', lines[0].split(',').length === 20, lines[0].slice(0, 120));
check('3 baris produk', lines.length === 4, `dapat ${lines.length}`);
check('produk tanpa riset: berat kosong + ditandai BELUM DIRISET', lines[1].includes('BELUM DIRISET'));
check('produk tanpa riset: status KURANG', lines[1].includes('KURANG — perbaiki dulu'));
check('produk riset: berat terisi dari file riset', lines[2].includes(String(spec.weightGrams)));
check('produk riset: sumber tercatat', lines[2].includes(spec.source.slice(0, 30)));
check('produk riset: status OK', lines[2].includes('OK — siap copy ke template'));
check('stok 0 ditandai', lines[3].includes('STOK 0'));
check('produk rusak: status KURANG', lines[3].includes('KURANG — perbaiki dulu'));
check('foto placeholder TIDAK ikut', !csv.includes('unsplash'));
check('foto .webp otomatis diminta sebagai .jpg', csv.includes('?fm=jpg'));
check('SKU unik per produk', makeSku('abc123', 0) !== makeSku('zzz999', 1));
check('mulai dengan BOM agar rapi di Excel', csv.charCodeAt(0) === 0xFEFF);
check('file riset berisi 290 produk (batch 1-30, SELESAI)', specIds.length === 290, `dapat ${specIds.length}`);
check('tidak ada teks FOTO KOSONG (foto dari Sanity otomatis)', !JSON.stringify(TOKOPEDIA_SPECS).includes('FOTO KOSONG'));

console.log(`\n== Hasil: ${pass} lolos, ${fail} gagal ==`);
if (fail > 0) process.exit(1);
console.log('Self-test Tokopedia HIJAU.');
