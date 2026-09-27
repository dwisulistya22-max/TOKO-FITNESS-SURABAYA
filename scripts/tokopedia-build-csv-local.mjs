// node scripts/tokopedia-build-csv-local.mjs
// Bangun CSV Tokopedia dari file JSONL lokal (part1/2/3.jsonl).
// Dipakai saat API Vercel tidak bisa diakses; data disalin manual dari Sanity.
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { normalizeProduct } from '../api/_lib/tiktok.js';
import { buildTokopediaMasterCsv } from '../api/_lib/tokopedia.js';

const raws = [];
for (const f of ['tokopedia-csv/part1.jsonl', 'tokopedia-csv/part2.jsonl', 'tokopedia-csv/part3.jsonl']) {
  for (const line of readFileSync(f, 'utf8').split('\n')) {
    const t = line.trim();
    if (t) raws.push(JSON.parse(t));
  }
}
const products = raws.map((r) =>
  normalizeProduct({
    _id: r._id,
    name: r.name,
    price: r.price,
    stock: r.stock,
    description: r.description,
    specs: r.specs,
    sku: r.sku,
    category: r.category,
    mainImage: r.mainImage || r.img,
    galleryImages: r.galleryImages || [],
  }),
);
const csv = buildTokopediaMasterCsv(products);
mkdirSync('tokopedia-csv', { recursive: true });
writeFileSync('tokopedia-csv/tokopedia-semua-produk.csv', csv);
console.log(`OK: ${products.length} produk -> tokopedia-csv/tokopedia-semua-produk.csv`);
