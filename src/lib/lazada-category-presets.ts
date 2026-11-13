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
  /** Perkiraan paket (BUKAN hasil timbangan). Admin tetap bisa mengubah angkanya. */
  weightGrams: number;
  lengthCm: number;
  widthCm: number;
  heightCm: number;
};

export const LAZADA_CATEGORY_PRESETS: LazadaCategoryPreset[] = [
  {
    sanity: 'Treadmill & Walking Pad',
    weightGrams: 80000, lengthCm: 190, widthCm: 85, heightCm: 40,
    categoryId: '5314',
    path: 'Sports & Outdoors Activities Equipment › Exercise & Fitness Equipment › Cardio Equipment › Treadmills',
    reason: 'Produk treadmill / walking pad. Perkiraan paket: treadmill lipat + kardus.',
  },
  {
    sanity: 'Sepeda Statis & Crosstrainer',
    weightGrams: 45000, lengthCm: 120, widthCm: 60, heightCm: 30,
    categoryId: '5316',
    path: 'Sports & Outdoors Activities Equipment › Exercise & Fitness Equipment › Cardio Equipment › Exercise Bikes',
    reason: 'Sepeda statis / crosstrainer masuk kelompok cardio exercise bikes. Perkiraan paket sepeda rumah.',
  },
  {
    sanity: 'Dumbbell & Weight Plate',
    weightGrams: 25000, lengthCm: 40, widthCm: 30, heightCm: 25,
    categoryId: '15448',
    path: 'Sports & Outdoors Activities Equipment › Exercise & Fitness Equipment › Strength Training Equipment & Machines › Free Weight › Weight › Dumbbells',
    reason: 'Dumbbell; weight plate memakai pohon yang sama (Free Weight › Weight). Perkiraan paket satu set.',
  },
  {
    sanity: 'Home Gym & Bench Press',
    weightGrams: 60000, lengthCm: 170, widthCm: 60, heightCm: 40,
    categoryId: '15424',
    path: 'Sports & Outdoors Activities Equipment › Exercise & Fitness Equipment › Strength Training Equipment & Machines › Full Body › Benches',
    reason: 'Bench press / bench home gym. Perkiraan paket bench + rangka.',
  },
  {
    sanity: 'Commercial Fitness',
    weightGrams: 120000, lengthCm: 150, widthCm: 110, heightCm: 100,
    categoryId: '62473003',
    path: 'Sports & Outdoors Activities Equipment › Exercise & Fitness Equipment › Strength Training Equipment & Machines › Other Strength Training Equipment',
    reason: 'Mesin gym komersial (leg press, lat pulldown, squat) yang tidak punya sub-kategori khusus. Perkiraan paket mesin besar; sebagian produk berupa set dumbbell + rak.',
  },
  {
    sanity: 'Fitness Outdoor',
    weightGrams: 40000, lengthCm: 120, widthCm: 60, heightCm: 40,
    categoryId: '62473003',
    path: 'Sports & Outdoors Activities Equipment › Exercise & Fitness Equipment › Strength Training Equipment & Machines › Other Strength Training Equipment',
    reason: 'Alat fitness outdoor (air walker, horse rider, sit up board) berupa rangka mesin. Berat belum termasuk beton cor.',
  },
  {
    sanity: 'Rubber Flooring',
    weightGrams: 25000, lengthCm: 105, widthCm: 25, heightCm: 25,
    categoryId: '15525',
    path: 'Sports & Outdoors Activities Equipment › Exercise & Fitness Equipment › Gymnastics › Mats & Flooring',
    reason: 'Lantai karet / matras gym. Perkiraan roll 1x10 m tebal 8 mm.',
  },
  {
    sanity: 'Sparepart',
    weightGrams: 1000, lengthCm: 20, widthCm: 15, heightCm: 10,
    categoryId: '62473401',
    path: 'Sports & Outdoors Activities Equipment › Exercise & Fitness Equipment › Fitness Accessories › Other Fitness Accessories',
    reason: 'Suku cadang alat fitness (pulley, sling, klem, per) tidak punya kategori khusus. Paket kecil.',
  },
  {
    sanity: 'Stick & Accessories',
    weightGrams: 8000, lengthCm: 190, widthCm: 15, heightCm: 15,
    categoryId: '15445',
    path: 'Sports & Outdoors Activities Equipment › Exercise & Fitness Equipment › Strength Training Equipment & Machines › Free Weight › Weight › Barbells',
    reason: 'Stick/barbell olympic dan curl bar. Paket memanjang 190 cm.',
  },
];

export function presetFor(sanityName: string): LazadaCategoryPreset | undefined {
  const key = String(sanityName || '').trim().toLowerCase();
  return LAZADA_CATEGORY_PRESETS.find((p) => p.sanity.trim().toLowerCase() === key);
}
