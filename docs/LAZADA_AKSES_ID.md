# Checklist Akses Lazada — untuk Pemilik Toko

Integrasi Sanity → Lazada **tidak akan mengirim produk apa pun** sebelum semua
item di bawah ini disiapkan pemilik toko. Server hanya menyimpan nilai ini di
environment variables (Vercel). Browser TIDAK PERNAH menerima token.

## 1. Akun & Aplikasi

- [ ] Punya akun **Lazada Seller Center** (toko sudah aktif di lazada.co.id).
- [ ] Daftar di **Lazada Open Platform** → https://open.lazada.com
- [ ] Buat aplikasi baru → dapat **App Key** + **App Secret**
- [ ] Set **Callback URL** aplikasi (mis. `https://tokofitnesssurabaya.com/api/lazada/oauth-callback` atau placeholder resmi)
- [ ] Selesaikan alur **OAuth** (authorize toko) → dapat **Access Token** (+ **Refresh Token**)
  - Perhatikan masa berlaku token; siapkan refresh bila perlu.

## 2. Data referensi dari Lazada (WAJIB, jangan menebak)

- [ ] **GetCategoryTree** → catat `category_id` daun untuk kategori produk:
  - Treadmill, Sepeda Statis, Home Gym, Dumbbell & Barbell, Matras, Aksesoris, dll.
  - Isi ke `api/_lib/lazada-category-map.js` atau field `lazadaCategoryId` di Sanity.
- [ ] **GetBrandByPages** → `brand_id` untuk merek yang dijual (atau pakai "No Brand").
- [ ] Pahami aturan **gambar inlink**: semua gambar produk harus melalui
  `POST /image/migrate` (MigrateImages) sebelum CreateProduct.

## 3. Environment Variables di Vercel

| Variabel | Isi | Wajib untuk sinkron |
|---|---|---|
| `LAZADA_APP_KEY` | App Key aplikasi | ✅ |
| `LAZADA_APP_SECRET` | App Secret aplikasi | ✅ |
| `LAZADA_ACCESS_TOKEN` | Access token OAuth | ✅ |
| `LAZADA_REFRESH_TOKEN` | Refresh token | Opsional |
| `LAZADA_API_BASE` | Default `https://api.lazada.co.id/rest` | ❌ |
| `LAZADA_ADMIN_KEY` | Kunci acak kuat (diketik per aksi) | ✅ |
| `LAZADA_SYNC_ENABLED` | `false` dulu; `true` hanya saat siap | ✅ |

Salin dari `.env.example`. **Jangan commit `.env`.**

## 4. Field yang perlu dilengkapi di Sanity (per produk)

- [ ] `sku` — kode unik per produk (SellerSku)
- [ ] `brand` (atau `brandId`) — minimal "No Brand"
- [ ] `weightGrams` — berat paket aktual (timbang)
- [ ] `lengthCm`, `widthCm`, `heightCm` — ukuran kemasan aktual
- [ ] `stock` — stok bilangan bulat
- [ ] `lazadaCategoryId` — ID kategori daun dari GetCategoryTree
- [ ] Foto produk **asli** (bukan Unsplash/placeholder), idealnya ≥ 3–8 foto

## 5. Urutan aman

1. Lengkapi checklist di atas (kecuali `LAZADA_SYNC_ENABLED`, tetap `false`).
2. Buka web → Admin Login → **Sinkronisasi Lakada (dry-run)** → pilih 1 produk → **Validasi**.
3. Perbaiki semua ERROR (dan sebaiknya WARNING) di Sanity, ulangi Validasi.
4. **Dry-run** → cek pratinjau payload.
5. **Ekspor CSV** → cocokkan isinya dengan Seller Center (opsional).
6. Set `LAZADA_SYNC_ENABLED=true` + isi `LAZADA_ADMIN_KEY`.
7. **Sinkron 1** dengan konfirmasi eksplisit → verifikasi produk muncul sebagai
   **DRAFT** di Seller Center.
8. Jangan sinkron massal tanpa persetujuan eksplisit.
