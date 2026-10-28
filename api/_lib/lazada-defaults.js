// api/_lib/lazada-defaults.js
// Mengubah "isi cepat massal" (nilai EKSPLISIT dari admin) menjadi overrides per produk.
//
// Prinsip tidak berubah: TIDAK ADA TEBAKAN.
// - Nilai hanya dipakai kalau admin benar-benar mengisinya.
// - SKU otomatis hanya mengisi produk yang SKU-nya masih kosong.
// - Kategori Lazada dipilih admin per kategori Sanity (bukan ditebak dari nama).

export const DEFAULT_CONFIG = {
  brand: '',
  brandId: '',
  weightGrams: '',
  lengthCm: '',
  widthCm: '',
  heightCm: '',
  stock: '',
  skuPrefix: '',
  skuPad: 4,
  skuStart: 1,
  categoryMap: {}, // { "Treadmill": "12345" }
  perCategory: {}, // { "Treadmill": { weightGrams: 45000, lengthCm: 160, ... } }
};

const num = (v) => {
  if (v === null || v === undefined || v === '') return undefined;
  const n = Number(v);
  return Number.isFinite(n) ? n : undefined;
};

const str = (v) => (typeof v === 'string' ? v.trim() : '');

export function normalizeConfig(raw = {}) {
  const c = { ...DEFAULT_CONFIG, ...(raw || {}) };
  return {
    brand: str(c.brand),
    brandId: str(c.brandId),
    weightGrams: num(c.weightGrams),
    lengthCm: num(c.lengthCm),
    widthCm: num(c.widthCm),
    heightCm: num(c.heightCm),
    stock: num(c.stock),
    skuPrefix: str(c.skuPrefix),
    skuPad: Number.isFinite(Number(c.skuPad)) && Number(c.skuPad) > 0 ? Math.min(Number(c.skuPad), 8) : 4,
    skuStart: Number.isFinite(Number(c.skuStart)) ? Math.max(1, Number(c.skuStart)) : 1,
    categoryMap: c.categoryMap && typeof c.categoryMap === 'object' ? c.categoryMap : {},
    perCategory: c.perCategory && typeof c.perCategory === 'object' ? c.perCategory : {},
  };
}

// Daftar kategori produk di Sanity beserta jumlah produk (untuk tabel pemetaan).
export function listSanityCategories(products = []) {
  const map = new Map();
  for (const p of products) {
    const key = str(p.category) || '(tanpa kategori)';
    map.set(key, (map.get(key) || 0) + 1);
  }
  return [...map.entries()]
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count);
}

// Susun overrides per produk dari konfigurasi eksplisit.
export function buildBulkOverrides(products = [], rawConfig = {}) {
  const cfg = normalizeConfig(rawConfig);
  const overridesById = {};
  const notes = [];

  // Urutan stabil supaya nomor SKU tidak berubah antar putaran.
  const ordered = [...products].sort((a, b) => String(a.id).localeCompare(String(b.id)));
  const seq = new Map(ordered.map((p, i) => [p.id, i]));

  for (const p of products) {
    const o = {};
    const catKey = str(p.category) || '(tanpa kategori)';
    const per = cfg.perCategory[catKey] || {};

    // 1) Kategori Lazada: per kategori Sanity, atau peta global.
    const mapped = str(per.categoryId) || str(cfg.categoryMap[catKey]);
    if (mapped) o.categoryId = mapped;

    // 2) Brand
    if (cfg.brandId) o.brandId = cfg.brandId;
    if (cfg.brand) o.brand = cfg.brand;

    // 3) Berat & dimensi: khusus kategori dulu, lalu nilai umum.
    const pick = (field) => {
      const v = num(per[field]);
      return v !== undefined ? v : cfg[field];
    };
    const w = pick('weightGrams'); if (w !== undefined) o.weightGrams = w;
    const l = pick('lengthCm'); if (l !== undefined) o.lengthCm = l;
    const wd = pick('widthCm'); if (wd !== undefined) o.widthCm = wd;
    const h = pick('heightCm'); if (h !== undefined) o.heightCm = h;

    // 4) Stok hanya bila admin mengisi (tidak menimpa angka asli dengan tebakan).
    if (cfg.stock !== undefined) o.stock = cfg.stock;

    // 5) SKU otomatis hanya untuk produk yang SKU-nya kosong.
    if (!str(p.sku) && cfg.skuPrefix) {
      const n = cfg.skuStart + (seq.get(p.id) || 0);
      o.sku = `${cfg.skuPrefix}${String(n).padStart(cfg.skuPad, '0')}`;
    }

    if (Object.keys(o).length) overridesById[p.id] = o;
  }

  const missingCategory = products.filter((p) => {
    const catKey = str(p.category) || '(tanpa kategori)';
    return !str(cfg.perCategory[catKey]?.categoryId) && !str(cfg.categoryMap[catKey]);
  }).length;
  if (missingCategory > 0) {
    notes.push(`${missingCategory} produk belum punya kategori Lazada — isi di tabel pemetaan kategori.`);
  }
  const noSku = products.filter((p) => !str(p.sku) && !cfg.skuPrefix).length;
  if (noSku > 0) notes.push(`${noSku} produk belum punya SKU — isi "awalan SKU otomatis".`);

  return { overridesById, notes, config: cfg };
}
