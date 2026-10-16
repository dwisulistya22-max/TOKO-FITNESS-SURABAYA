# Audit Integrasi Lazada — Toko Fitness Surabaya

Audit struktur katalog (Sanity) vs persyaratan resmi **Lazada Open Platform** (CreateProduct API).
Prinsip: **tanpa tebakan data** — field kosong menjadi ERROR validasi, bukan diisi default.

## 1. Struktur katalog saat ini (Sanity `production`)

| Field Sanity | Wajib Lazada | Status | Catatan |
|---|---|---|---|
| `name` | ✅ (Attributes.name) | Ada | Maks 255 karakter |
| `price` | ✅ (Sku.price) | Ada | IDR |
| `discountPrice` | ❌ (Sku.special_price) | Ada | Wajib < harga normal |
| `stock` | ✅ (Sku.quantity) | Ada | Bilangan bulat ≥ 0 |
| `sku` | ✅ (Sku.SellerSku) | **Sering kosong** | Unik per produk |
| `brand` / `brandId` | ✅ (Attributes.brand / brand_id) | **Sering kosong** | "No Brand" boleh |
| `description` | ❌ (Attributes.description) | Ada | HTML, maks 25.000 char |
| `specs` | ❌ (Attributes.short_description) | Ada | Teks pendek |
| `weightGrams` | ✅ (Sku.package_weight **dalam kg**) | **Sering kosong** | Dikonversi otomatis gram→kg |
| `lengthCm`/`widthCm`/`heightCm` | ✅ (package_length/width/height) | **Sering kosong** | cm, 2 desimal |
| `images` | ✅ (Images.Image, maks 8) | Ada | **Harus Lazada inlink** (lihat catatan) |
| `lazadaCategoryId` | ✅ (PrimaryCategory) | **Belum ada** | Isi dari GetCategoryTree |
| `category` (Sanity) | ❌ | Ada | Hanya label, bukan ID Lazada |

## 2. Catatan penting

### Gambar HARUS Lazada inlink
Lazada menolak URL eksternal langsung. Sebelum CreateProduct, gambar perlu dimigrasi
lewat `POST /image/migrate` (MigrateImages) untuk mendapatkan inlink Lazada.
Validator otomatis memberi WARNING bila gambar masih dari domain eksternal (cdn.sanity.io, dsb).

### Kategori
`PrimaryCategory` harus ID **kategori daun** dari `GetCategoryTree` (region ID).
Isi `api/_lib/lazada-category-map.js` (atau field `lazadaCategoryId` di Sanity).
Kosong = error validasi (tidak ditebak).

### Brand
Lazada mensyaratkan `brand` ATAU `brand_id` (dari `GetBrandByPages`).
Produk tanpa merek bisa memakai "No Brand". Brand terdaftar butuh Brand Authorization.

### Varian
Skema Sanity saat ini single-SKU. Payload dibuat mode SINGLE_SKU (1 Sku per produk).

## 3. Mode operasi yang dibangun

| Endpoint | Fungsi | Memanggil Lazada? |
|---|---|---|
| `GET /api/lazada/status` | Kesiapan kredensial (boolean saja) | ❌ |
| `GET /api/lazada/products` | Daftar produk Sanity ternormalisasi | ❌ |
| `POST /api/lazada/validate` | Validasi 1 produk per-field | ❌ |
| `POST /api/lazada/dryrun` | Pratinjau payload 1 produk | ❌ |
| `POST /api/lazada/export` | CSV 1 produk (untuk Seller Center) | ❌ |
| `POST /api/lazada/sync` | Kirim 1 produk (TERKUNCI 5 lapis) | ✅ (hanya bila lolos semua kunci) |

## 4. Kunci pengaman sinkron (`/api/lazada/sync`)

1. `LAZADA_SYNC_ENABLED=true`
2. Kredensial lengkap (App Key + Secret + Access Token)
3. `adminKey` cocok (diketik per aksi, tidak disimpan di browser)
4. `confirm: true` eksplisit untuk 1 produk
5. Validasi produk harus VALID (tanpa error)

Selain itu => DITOLAK (HTTP 409/401/400/422), tanpa ada panggilan ke Lazada.

## 5. Kesimpulan

Integrasi **siap dipakai untuk dry-run & ekspor** sejak langkah ini.
Sinkron nyata menunggu pemilik toko menyiapkan akun Lazada Open Platform + OAuth
(lihat `docs/LAZADA_AKSES_ID.md`) dan melengkapi field wajib di Sanity.
