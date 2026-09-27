// node scripts/tokopedia-top100.mjs
// Pilih 100 produk terbaik (data OK + ada stok + ada berat) untuk batch pertama
// (batas toko masa percobaan). Tulis tokopedia-csv/top100.json untuk pembuat file Excel.
import { readFileSync, writeFileSync } from 'node:fs';
import { normalizeProduct, isPlaceholderImage } from '../api/_lib/tiktok.js';
import { lookupSpec } from '../api/_lib/tokopedia-specs.js';
import { makeSku } from '../api/_lib/tokopedia.js';

const raws = [];
for (const f of ['tokopedia-csv/part1.jsonl', 'tokopedia-csv/part2.jsonl', 'tokopedia-csv/part3.jsonl']) {
  for (const line of readFileSync(f, 'utf8').split('\n')) {
    const t = line.trim();
    if (t) raws.push(JSON.parse(t));
  }
}
// Logika status SAMA PERSIS dengan buildTokopediaMasterCsv (api/_lib/tokopedia.js).
const rows = raws.map((r, i) => {
  const p = normalizeProduct({ ...r, mainImage: r.mainImage || r.img, galleryImages: r.galleryImages || [] });
  const photos = (p.images || [])
    .filter((u) => u && !isPlaceholderImage(u))
    .map((u) => (/\.webp(\?|$)/i.test(u) ? (u.includes('?') ? `${u}&fm=jpg` : `${u}?fm=jpg`) : u))
    .slice(0, 5);
  while (photos.length < 5) photos.push('');
  const spec = lookupSpec(p.id);
  const notes = [];
  if (!p.name) notes.push('nama kosong');
  if (!Number.isFinite(p.price) || p.price <= 0) notes.push('harga 0/kosong');
  if (!Number.isFinite(p.stock)) notes.push('stok kosong');
  else if (p.stock === 0) notes.push('STOK 0');
  if (!p.description) notes.push('deskripsi kosong');
  if (!photos[0]) notes.push('TANPA FOTO ASLI');
  let weight = '';
  if (spec) {
    if (Number.isFinite(spec.weightGrams) && spec.weightGrams > 0) weight = spec.weightGrams;
    else notes.push('BERAT BELUM ADA');
  } else {
    notes.push('berat/dimensi BELUM DIRISET');
  }
  const blocking = notes.some((n) => /TANPA FOTO|harga|nama kosong|BERAT BELUM ADA|BELUM DIRISET/i.test(n));
  return {
    p, photos, weight, notes, blocking, idx: i,
    dimsFull: !!(spec && spec.lengthCm && spec.widthCm && spec.heightCm),
    dims: spec ? [spec.lengthCm || '', spec.widthCm || '', spec.heightCm || ''] : ['', '', ''],
  };
});
const ok = rows.filter((r) => !r.blocking && r.p.stock > 0)
  .sort((a, b) => (b.dimsFull - a.dimsFull) || (b.p.stock - a.p.stock) || (a.p.price - b.p.price));
const top = ok.slice(0, 100);
const out = top.map((r, k) => ({
  no: k + 1,
  name: r.p.name,
  description: r.p.description,
  photos: r.photos,
  weight: r.weight,
  length: r.dims[0],
  width: r.dims[1],
  height: r.dims[2],
  price: r.p.price,
  stock: r.p.stock,
  sku: makeSku(r.p.id, r.idx),
  sanityCategory: r.p.category || '',
}));
writeFileSync('tokopedia-csv/top100.json', JSON.stringify(out, null, 1));
console.log('total:', rows.length, '| OK+stok>0:', ok.length, '| diambil:', out.length);
console.log('tanpa-dimensi-lengkap:', out.filter((o) => o.length === '' || o.width === '' || o.height === '').length);
const cats = {};
for (const o of out) cats[o.sanityCategory] = (cats[o.sanityCategory] || 0) + 1;
console.log('kategori:', JSON.stringify(cats));
const kurang = rows.filter((r) => r.blocking);
const why = {};
for (const r of kurang) for (const n of r.notes) if (/TANPA FOTO|harga|nama kosong|BERAT BELUM ADA|BELUM DIRISET/i.test(n)) why[n.split('—')[0].trim()] = (why[n.split('—')[0].trim()] || 0) + 1;
console.log('KURANG:', kurang.length, JSON.stringify(why));
