// api/_lib/tiktok-category-map.js
// Mapping MANUAL: nama kategori Sanity -> TikTok Shop leaf category_id.
//
// ATURAN:
// - Jangan menebak ID. Isi hanya dari respons resmi API "Get Categories"
//   (atau kolom Category ID di Seller Center) untuk shop Indonesia.
// - Key adalah nama kategori Sanity persis (case-insensitive, spasi dipadatkan).
// - Produk yang kategorinya tidak ada di sini akan GAGAL validasi dengan error
//   yang jelas, kecuali Anda memberi overrides.categoryId eksplisit per aksi.
//
// Contoh pengisian (JANGAN dipakai sebelum diverifikasi):
//   'treadmill': '601234',
//   'sepeda statis': '601235',

export const TIKTOK_CATEGORY_MAP = {
  // 'nama kategori sanity (huruf kecil)': 'category_id daun tiktok',
};

export function lookupTiktokCategoryId(categoryName) {
  if (!categoryName) return '';
  const key = String(categoryName).toLowerCase().replace(/\s+/g, ' ').trim();
  return TIKTOK_CATEGORY_MAP[key] || '';
}
