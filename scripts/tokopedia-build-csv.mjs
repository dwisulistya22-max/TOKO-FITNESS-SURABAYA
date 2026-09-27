// node scripts/tokopedia-build-csv.mjs — Ambil produk Sanity -> bangun CSV Tokopedia.
// Dipakai oleh GitHub Actions (.github/workflows/tokopedia-csv.yml).
// Memakai kode yang SAMA dengan API /api/tokopedia-massal (hasil identik).

import { writeFileSync, mkdirSync } from 'node:fs';
import { fetchSanityProducts } from '../api/_lib/tiktok.js';
import { buildTokopediaMasterCsv } from '../api/_lib/tokopedia.js';

const { projectId, products, error } = await fetchSanityProducts();
if (!products.length) {
  console.error('GAGAL mengambil produk Sanity:', error);
  process.exit(1);
}
const csv = buildTokopediaMasterCsv(products);
mkdirSync('tokopedia-csv', { recursive: true });
writeFileSync('tokopedia-csv/tokopedia-semua-produk.csv', csv);
const baris = csv.split('\n').filter((l) => l.trim()).length - 1;
console.log(`OK: ${products.length} produk dari Sanity ${projectId}, ${baris} baris CSV.`);
