// Mapping kategori Sanity -> Lazada category_id (daun/leaf).
// JANGAN menebak. Isi dari GetCategoryTree / Seller Center resmi.
// Kosong = error validasi (tidak ada default).

export const LAZADA_CATEGORY_MAP = {};

export function lookupLazadaCategoryId(category) {
  const key = String(category || '').trim().toLowerCase();
  if (!key) return '';
  return LAZADA_CATEGORY_MAP[key] || '';
}
