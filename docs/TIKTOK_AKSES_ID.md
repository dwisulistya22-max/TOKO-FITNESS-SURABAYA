# CHECKLIST AKSES: TikTok Shop Seller Center + Open API

**Status saat ini (2026-09-26):** BELUM ADA — tidak ada kredensial TikTok di repo ini, dan tidak boleh
ditambahkan ke repo. Semua item di bawah disimpan sebagai **Environment Variable di Vercel** (server saja).

## A. Akun & toko (di Seller Center)

- [ ] Akun **TikTok Shop Seller Center Indonesia** (by Tokopedia) untuk Toko Fitness Surabaya.
- [ ] Verifikasi identitas usaha selesai (KTP/paspor + dokumen usaha bila diminta).
- [ ] **Informasi kontak** toko terisi (nama, telepon, email).
- [ ] **Rekening bank** toko terisi dan terverifikasi.
- [ ] Alamat gudang/pickup terisi (untuk `warehouse_id`).
- [ ] Kategori produk yang akan dijual (alat fitness/cardio/strength) **tidak masuk kategori terbatas**,
      atau persetujuan kategorinya sudah diperoleh.
- [ ] Jika menjual produk **bermerek** (mis. merek treadmill tertentu): siapkan bukti otorisasi brand
      (pemilik merek / distributor resmi / reseller resmi) dan ajukan **Brand Authorization** di Seller Center.

## B. Aplikasi API (di TikTok Shop Partner Center)

- [ ] Akun di **TikTok Shop Partner Center** (`partner.tiktokshop.com`).
- [ ] Buat **TikTok Shop App (OAuth client)** untuk integrasi toko sendiri.
- [ ] Catat **App Key** dan **App Secret**.
- [ ] Isi **Redirect URL** OAuth (disarankan endpoint server, mis.
      `https://tokofitnesssurabaya.com/api/tiktok/oauth-callback` — endpoint ini BARU dibuat saat akses siap).
- [ ] Ajukan **scope API** minimum: `product` (baca/tulis produk), `inventory`, `logistics`, `order`
      (sesuaikan IAM saat App Review bila diminta TikTok).

## C. Token & ID toko (hasil OAuth, rahasia)

- [ ] `authorization code` dari persetujuan seller → tukar menjadi token (cukup sekali, via server).
- [ ] **Access Token** (+ masa berlaku).
- [ ] **Refresh Token**.
- [ ] **Shop ID** dan **Shop Cipher**.

## D. Environment Variable di Vercel (nama persis seperti di `.env.example`)

| Variable | Sifat | Keterangan |
|---|---|---|
| `TIKTOK_APP_KEY` | Publik-boleh | App Key dari Partner Center |
| `TIKTOK_APP_SECRET` | **Rahasia** | App Secret — server saja |
| `TIKTOK_ACCESS_TOKEN` | **Rahasia** | Token akses hasil OAuth |
| `TIKTOK_REFRESH_TOKEN` | **Rahasia** | Token refresh |
| `TIKTOK_SHOP_ID` | Internal | Shop ID hasil otorisasi |
| `TIKTOK_SHOP_CIPHER` | **Rahasia** | Shop cipher hasil otorisasi |
| `TIKTOK_API_BASE` | Konfigurasi | Base URL API (default produksi ID bila tersedia) |
| `TIKTOK_SYNC_ENABLED` | Flag | Wajib `true` untuk membuka endpoint sync; default `false` |
| `TIKTOK_ADMIN_KEY` | **Rahasia** | Kunci admin untuk memanggil endpoint tulis (sync) |

> Prinsip: **tidak ada satu pun nilai di atas yang boleh masuk ke Git, ke kode frontend, atau ke chat publik.**
> Endpoint `/api/tiktok/status` hanya melaporkan "sudah diisi / belum".

## E. Data katalog yang harus dilengkapi di Sanity (per produk yang akan diuji)

- [ ] Nama produk final (jelas, tanpa URL/frasa marketing).
- [ ] Harga > 0 dan harga diskon (jika ada) < harga normal.
- [ ] Stok bilangan bulat ≥ 0.
- [ ] Minimal 1 foto asli (disarankan ≥ 5, rasio 1:1, ≥ 800×800 px, latar putih untuk foto utama).
- [ ] Berat paket (gram) + dimensi paket P×L×T (cm) — **field baru, lihat Bagian F**.
- [ ] SKU unik — **field baru, lihat Bagian F**.
- [ ] Kondisi produk (baru/bekas) — **field baru, lihat Bagian F**.
- [ ] Brand (jika bermerek) + dokumen otorisasi di Seller Center.

## F. Field Sanity yang disarankan untuk ditambahkan (skema)

Agar sinkron API bisa berjalan tanpa input manual berulang, tambahkan field berikut ke skema `product`
di Sanity Studio (nama field persis agar terbaca validator):

```js
// Tambahan skema product (Sanity Studio)
{ name: 'sku', type: 'string', title: 'SKU' },
{ name: 'stock', type: 'number', title: 'Stok' },           // bila belum ada
{ name: 'weightGrams', type: 'number', title: 'Berat paket (gram)' },
{ name: 'lengthCm', type: 'number', title: 'Panjang paket (cm)' },
{ name: 'widthCm', type: 'number', title: 'Lebar paket (cm)' },
{ name: 'heightCm', type: 'number', title: 'Tinggi paket (cm)' },
{ name: 'condition', type: 'string', title: 'Kondisi',      // "NEW" | "USED"
  options: { list: ['NEW', 'USED'] } },
{ name: 'brand', type: 'string', title: 'Brand' },
{ name: 'tiktokCategoryId', type: 'string', title: 'TikTok Category ID (leaf)' },
```

Sampai field di atas tersedia, validator akan melaporkan error yang jelas per field —
dan dry-run menyediakan kolom `overrides` eksplisit (per aksi, tercatat) sebagai jalan sementara.
