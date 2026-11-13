// api/_lib/lazada-presets.js
// Salinan server dari src/lib/lazada-category-presets.ts, dipakai HANYA oleh pratinjau
// read-only (GET /api/lazada/bulk?presets=1) supaya angka yang tampil sama dengan
// keadaan panel setelah admin menekan "Isi saran" + "Isi berat & ukuran perkiraan".
//
// Isinya tetap SARAN, bukan keputusan: panel tetap menampilkan angkanya dan admin
// wajib memeriksa + mencentang konfirmasi sebelum mengirim.

export const LAZADA_CATEGORY_PRESETS = [
  { sanity: 'Treadmill & Walking Pad', categoryId: '5314', weightGrams: 80000, lengthCm: 190, widthCm: 85, heightCm: 40 },
  { sanity: 'Sepeda Statis & Crosstrainer', categoryId: '5316', weightGrams: 45000, lengthCm: 120, widthCm: 60, heightCm: 30 },
  { sanity: 'Dumbbell & Weight Plate', categoryId: '15448', weightGrams: 25000, lengthCm: 40, widthCm: 30, heightCm: 25 },
  { sanity: 'Home Gym & Bench Press', categoryId: '15424', weightGrams: 60000, lengthCm: 170, widthCm: 60, heightCm: 40 },
  { sanity: 'Commercial Fitness', categoryId: '62473003', weightGrams: 120000, lengthCm: 150, widthCm: 110, heightCm: 100 },
  { sanity: 'Fitness Outdoor', categoryId: '62473003', weightGrams: 40000, lengthCm: 120, widthCm: 60, heightCm: 40 },
  { sanity: 'Rubber Flooring', categoryId: '15525', weightGrams: 25000, lengthCm: 105, widthCm: 25, heightCm: 25 },
  { sanity: 'Sparepart', categoryId: '62473401', weightGrams: 1000, lengthCm: 20, widthCm: 15, heightCm: 10 },
  { sanity: 'Stick & Accessories', categoryId: '15445', weightGrams: 8000, lengthCm: 190, widthCm: 15, heightCm: 15 },
];

// Gabungkan saran ke konfigurasi tanpa menimpa isian yang sudah ada.
export function applyPresetsToConfig(cfg) {
  const categoryMap = { ...(cfg.categoryMap || {}) };
  const perCategory = { ...(cfg.perCategory || {}) };
  for (const p of LAZADA_CATEGORY_PRESETS) {
    if (!categoryMap[p.sanity]) categoryMap[p.sanity] = p.categoryId;
    const cur = perCategory[p.sanity] || {};
    perCategory[p.sanity] = {
      ...cur,
      weightGrams: cur.weightGrams ?? p.weightGrams,
      lengthCm: cur.lengthCm ?? p.lengthCm,
      widthCm: cur.widthCm ?? p.widthCm,
      heightCm: cur.heightCm ?? p.heightCm,
    };
  }
  return { ...cfg, categoryMap, perCategory };
}
