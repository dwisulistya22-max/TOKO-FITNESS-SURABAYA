// src/lib/lazada-category-presets.ts
// Saran peta kategori Sanity -> leaf category Lazada.
//
// Dasar penyusunan (bukan tebakan):
// 1. ID diambil dari GetCategoryTree Lazada live (GET /category/tree/get, language=id).
// 2. Nama kategori dipilih setelah melihat nama produk asli di Sanity per kategori.
//
// Saran ini TIDAK otomatis dipakai. Admin menekan tombol "Isi saran kategori",
// melihat hasilnya di panel, lalu tetap harus menekan centang konfirmasi sebelum kirim.

export type LazadaCategoryPreset = {
  sanity: string;
  categoryId: string;
  path: string;
  reason: string;
};

export const LAZADA_CATEGORY_PRESETS: LazadaCategoryPreset[] = [
  {
    sanity: 'Treadmill & Walking Pad',
    categoryId: '5314',
    path: 'Sports & Outdoors Activities Equipment › Exercise & Fitness Equipment › Cardio Equipment › Treadmills',
    reason: 'Produk treadmill / walking pad.',
  },
  {
    sanity: 'Sepeda Statis & Crosstrainer',
    categoryId: '5316',
    path: 'Sports & Outdoors Activities Equipment › Exercise & Fitness Equipment › Cardio Equipment › Exercise Bikes',
    reason: 'Sepeda statis / crosstrainer masuk kelompok cardio exercise bikes.',
  },
  {
    sanity: 'Dumbbell & Weight Plate',
    categoryId: '15448',
    path: 'Sports & Outdoors Activities Equipment › Exercise & Fitness Equipment › Strength Training Equipment & Machines › Free Weight › Weight › Dumbbells',
    reason: 'Dumbbell; weight plate memakai pohon yang sama (Free Weight › Weight).',
  },
  {
    sanity: 'Home Gym & Bench Press',
    categoryId: '15424',
    path: 'Sports & Outdoors Activities Equipment › Exercise & Fitness Equipment › Strength Training Equipment & Machines › Full Body › Benches',
    reason: 'Bench press / bench home gym.',
  },
  {
    sanity: 'Commercial Fitness',
    categoryId: '62473003',
    path: 'Sports & Outdoors Activities Equipment › Exercise & Fitness Equipment › Strength Training Equipment & Machines › Other Strength Training Equipment',
    reason: 'Mesin gym komersial (leg press, lat pulldown, squat) yang tidak punya sub-kategori khusus.',
  },
  {
    sanity: 'Fitness Outdoor',
    categoryId: '62473003',
    path: 'Sports & Outdoors Activities Equipment › Exercise & Fitness Equipment › Strength Training Equipment & Machines › Other Strength Training Equipment',
    reason: 'Alat fitness outdoor (air walker, horse rider, sit up board) berupa rangka mesin.',
  },
  {
    sanity: 'Rubber Flooring',
    categoryId: '15525',
    path: 'Sports & Outdoors Activities Equipment › Exercise & Fitness Equipment › Gymnastics › Mats & Flooring',
    reason: 'Lantai karet / matras gym.',
  },
  {
    sanity: 'Sparepart',
    categoryId: '62473401',
    path: 'Sports & Outdoors Activities Equipment › Exercise & Fitness Equipment › Fitness Accessories › Other Fitness Accessories',
    reason: 'Suku cadang alat fitness (pulley, sling, klem, per) tidak punya kategori khusus.',
  },
  {
    sanity: 'Stick & Accessories',
    categoryId: '15445',
    path: 'Sports & Outdoors Activities Equipment › Exercise & Fitness Equipment › Strength Training Equipment & Machines › Free Weight › Weight › Barbells',
    reason: 'Stick/barbell olympic dan curl bar.',
  },
];

export function presetFor(sanityName: string): LazadaCategoryPreset | undefined {
  const key = String(sanityName || '').trim().toLowerCase();
  return LAZADA_CATEGORY_PRESETS.find((p) => p.sanity.trim().toLowerCase() === key);
}
