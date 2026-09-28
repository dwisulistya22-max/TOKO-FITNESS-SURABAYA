# AUDIT: Sinkronisasi Katalog Sanity → TikTok Shop Seller Center

**Tanggal:** 2026-09-26
**Status eksekusi:** AUDIT + PERANCANGAN SAJA — tidak ada produk yang diunggah/dipublikasikan.
**Kesimpulan singkat:** API seller **belum tersedia** (belum ada App Key/Secret, token, dan mapping kategori).
Maka sesuai instruksi: integrasi dibangun **tertutup (gated)** di sisi server + disediakan **ekspor CSV aman**
sebagai alternatif sampai akses API siap.

---

## 1. Inventaris struktur katalog Sanity (saat ini)

Sumber: query GROQ yang dipakai website (`src/catalog.tsx`, `src/utils/sanity.ts`, `api/katalog.js`, `src/App.tsx`).
Project ID yang dicoba website: `qi4rocc0`, `856jrik3` — dataset `production`.

> Catatan: dari lingkungan kerja ini koneksi langsung ke `*.api.sanity.io` terblokir,
> sehingga audit field didasarkan pada seluruh query yang dipakai kode produksi (bukan tebakan isi data).
> Verifikasi jumlah produk live perlu dijalankan dari mesin/Vercel yang bisa akses Sanity
> via endpoint `GET /api/tiktok/products` (lihat Bagian 5).

### 1.1 Field `product` yang ADA di Sanity

| Field Sanity (varian nama) | Dipakai website | Keterangan |
|---|---|---|
| `_id` | ✅ | ID unik produk |
| `name` / `title` / `nama` | ✅ | Nama produk |
| `price` | ✅ | Harga jual (IDR) |
| `discountPrice` | ✅ | Harga diskon |
| `description` | ✅ | Deskripsi (plain text) |
| `specs` | ✅ | Spesifikasi (plain text) |
| `stock` | ✅ | Stok (angka) |
| `rating`, `reviews` | ✅ | Rating & jumlah ulasan (display) |
| `featured` / `isFeatured` / `isUnggulan` / `showOnHome` | ✅ | Flag unggulan |
| `image` / `foto` / `photo` / `gambar` | ✅ | 1 gambar utama (asset Sanity) |
| `images[]` / `gallery[]` / `photos[]` | ✅ | Galeri tambahan (jika diisi) |
| `category` / `kategori` (reference → `name`/`title`) | ✅ | Kategori teks bebas, mis. "Treadmill" |
| `tag` | ✅ | Tag/penanda |
| `shopeeUrl` / `shopee` | ✅ | Link Shopee |
| `order` / `sortOrder` / `urutan` | ✅ | Urutan tampil |
| `slug` | ✅ | Slug URL |

### 1.2 Field WAJIB TikTok Shop yang TIDAK ADA di Sanity

| Kebutuhan TikTok Shop | Status di Sanity | Dampak |
|---|---|---|
| `category_id` daun (leaf) TikTok | ❌ Tidak ada — kategori Sanity hanya teks bebas | **Blokir sinkron.** Wajib mapping manual (tidak boleh ditebak) |
| Berat paket (`package_weight`, gram) | ❌ Tidak ada field | **Blokir sinkron** sampai diisi |
| Dimensi paket P×L×T (`package_dimension`, cm) | ❌ Tidak ada field | **Blokir sinkron** sampai diisi |
| SKU per produk/varian | ❌ Tidak ada field | Wajib untuk sinkron API (bisa dibuat dari `_id`, hanya jika disetujui) |
| Varian (warna/ukuran) + stok per varian | ❌ Tidak ada struktur varian | Mode awal: **single-SKU per produk** |
| Brand + sertifikat otorisasi brand | ❌ Tidak ada field | Produk bermerek butuh dokumen di Seller Center |
| Kondisi produk (`condition`: baru/bekas) | ❌ Tidak ada field | Wajib diisi eksplisit per aksi sinkron |
| Atribut wajib per kategori TikTok | ❌ Tidak ada | Dicek saat dry-run per kategori |
| ID gudang (`warehouse_id`) | ❌ Bukan data Sanity | Diambil dari API saat kredensial tersedia |
| Video produk / sertifikasi kategori terbatas | ❌ Tidak ada | Opsional, kecuali kategori mewajibkan |

### 1.3 Risiko data yang ditemukan (dijaga oleh validator)

1. **Gambar fallback Unsplash** — kode website memakai gambar stok Unsplash bila produk tanpa gambar.
   Validator **menolak** URL placeholder (`unsplash`, `placeholder`, `dummyimage`, `placehold`) — produk tanpa
   foto asli tidak bisa lolos validasi.
2. **Harga 0 / kosong** — validator menolak `price <= 0`.
3. **Kategori teks bebas** — tidak ada `category_id` TikTok; mapping harus diisi manual di
   `api/_lib/tiktok-category-map.js`. Produk dengan kategori tak terpetakan = error, bukan ditebak.
4. **Dua project ID** — website mencoba `qi4rocc0` lalu `856jrik3`. Endpoint server mengikuti urutan yang sama
   dan melaporkan project mana yang menjawab, agar tidak tercampur.

---

## 2. Persyaratan resmi integrasi TikTok Shop (by Tokopedia)

Ringkasan dari dokumentasi TikTok Shop Partner / Open API & Seller Center:

### 2.1 Akses & otentikasi (semua sisi server)

- Daftar **TikTok Shop Seller Center** (toko Indonesia) dan verifikasi data usaha + rekening + kontak.
- Buat **TikTok Shop App (OAuth client)** di **TikTok Shop Partner Center** → dapat **App Key** (boleh publik)
  dan **App Secret** (rahasia, hanya di server/env, jangan di-commit).
- Otorisasi seller via **OAuth 2.0** → dapat `authorization code` → tukar ke **access token**,
  **refresh token**, dan **shop cipher / shop id**.
- Setiap API call memakai `app_key + access_token + shop_id/shop_cipher + timestamp + sign`
  (`sign` = HMAC-SHA256 dari parameter terurut dengan App Secret).
- Minta **scope API** yang dibutuhkan sejak awal: produk, inventori, order, logistik, dsb.

### 2.2 Aturan produk minimum (inti)

- **Nama produk** jelas (disarankan ≥ 25 karakter, maks ~200), tanpa URL/nama seller/frasa marketing.
- **Deskripsi** HTML, maks 10.000 karakter; disarankan 3–5 selling point + gambar pendukung.
- **Gambar utama 1–9 file**: JPG/JPEG/PNG, 300×300 s.d. 4000×4000 px (praktik terbaik ≥800×800, rasio 1:1,
  latar putih untuk gambar pertama), maks ±5 MB/file.
- **Harga & stok**: harga > 0; stok bilangan bulat ≥ 0 per SKU.
- **Kategori**: wajib `category_id` daun yang valid + atribut wajib kategori tersebut.
- **Brand**: produk bermerek wajib otorisasi brand (pemilik merek / distributor resmi / reseller resmi).
- **Berat & dimensi paket**: wajib (`package_weight` + `package_dimension`).
- **Gudang**: wajib `warehouse_id` valid milik shop.
- Produk kategori terbatas: wajib sertifikasi/persetujuan kategori terlebih dahulu.

### 2.3 Batas operasional yang kami terapkan

- Sinkron **satu produk per aksi**, wajib `confirm: true` eksplisit.
- Tidak ada sinkron massal/bulk tanpa persetujuan tertulis Anda per batch.
- Mode default seluruh endpoint tulis: **DRY-RUN** (hanya pratinjau payload + validasi, tidak memanggil TikTok).
- Panggilan API TikTok asli hanya terbuka bila **semua** terpenuhi:
  `TIKTOK_SYNC_ENABLED=true` + App Key + App Secret + Access Token (+ Refresh Token) + Shop ID/Cipher.

---

## 3. Keputusan arsitektur

- **Token & secret hanya di server** (Vercel Environment Variables). Browser tidak pernah menerima,
  menyimpan, atau mengirim token TikTok. Endpoint `/api/tiktok/status` hanya mengembalikan boolean
  "sudah diisi / belum" — tidak pernah nilai secret.
- **Satu produk per aksi**: endpoint `validate`, `dryrun`, `export`, `sync` semuanya menerima satu ID produk.
- **Tanpa tebakan**: field kosong → error validasi yang menyebut nama field + cara mengisi.
  Pengecualian hanya berupa `overrides` eksplisit yang Anda ketik per aksi
  (mis. `condition: "NEW"`, `categoryId`, `weightGrams`) — tercatat di pratinjau, bukan default tersembunyi.
- **Jejak audit**: setiap dry-run/sync mengembalikan ringkasan validasi + payload yang akan dikirim.

## 4. Daftar file integrasi

| File | Fungsi |
|---|---|
| `api/_lib/tiktok.js` | Normalisasi Sanity → validasi → mapping payload TikTok → builder CSV. Tanpa dependensi |
| `api/_lib/tiktok-category-map.js` | **Mapping manual** kategori Sanity → `category_id` TikTok (masih kosong, wajib diisi) |
| `api/tiktok/status.js` | `GET` kesiapan integrasi (boolean saja, aman dipanggil browser) |
| `api/tiktok/products.js` | `GET` daftar produk ternormalisasi dari Sanity (sisi server) |
| `api/tiktok/validate.js` | `POST { id }` hasil validasi satu produk |
| `api/tiktok/dryrun.js` | `POST { id, overrides? }` pratinjau payload TikTok + validasi, **tidak** memanggil TikTok |
| `api/tiktok/export.js` | `POST { id }` unduh CSV satu produk (alternatif aman saat API belum ada) |
| `api/tiktok/sync.js` | `POST { id, confirm: true }` sinkron 1 produk — **terkunci** sampai kredensial + flag aktif |
| `src/components/TikTokSyncPanel.tsx` | Panel admin: pilih 1 produk → validasi → dry-run → ekspor/sinkron |
| `.env.example` | Daftar environment variable yang harus disiapkan |
| `scripts/tiktok-selftest.mjs` | Uji validator/mapper dengan fixture (bukan data asli) |
| `docs/TIKTOK_AKSES_ID.md` | Checklist akses yang harus Anda siapkan |
| `docs/TIKTOK_DEPLOY_ID.md` | Langkah deploy + uji satu produk |

## 5. Cara memverifikasi audit ini setelah deploy

1. Deploy branch ini ke Vercel (preview), lalu buka `https://<preview>/api/tiktok/status` → pastikan
   `sanityReachable: true` dan `syncEnabled: false`.
2. Buka `https://<preview>/api/tiktok/products` → cocokkan jumlah produk dengan Sanity Studio.
3. Dari panel admin → pilih 1 produk → **Validasi** → lengkapi field yang dilaporkan error di Sanity.
4. Ulangi hingga 1 produk berstatus **VALID**, lalu jalankan **Dry-run** dan periksa pratinjau payload.
5. Jangan lanjut ke sinkron sebelum checklist `docs/TIKTOK_AKSES_ID.md` lengkap.
