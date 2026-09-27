# DEPLOY + UJI SATU PRODUK: Integrasi TikTok Shop

## 0. Prasyarat

- Branch `arena/01a0de11-toko-fitness-surabaya` sudah di-merge / di-deploy sebagai Vercel Preview.
- **Jangan** set `TIKTOK_SYNC_ENABLED=true` sebelum checklist `docs/TIKTOK_AKSES_ID.md` lengkap.

## 1. Deploy (Vercel)

1. Push branch, buat Pull Request ke `main` (jangan merge dulu bila ingin review).
2. Vercel otomatis membuat **Preview Deployment** → catat URL-nya, mis. `https://toko-xxx.vercel.app`.
3. Tanpa env TikTok apa pun, verifikasi endpoint baca (aman, tanpa secret):
   - `GET /api/tiktok/status` → `syncEnabled: false`, `syncBlocked: true`.
   - `GET /api/tiktok/products` → daftar produk dari Sanity (sisi server).
4. Bila `sanityReachable: false`, cek akses keluar Vercel → `*.api.sanity.io` (biasanya langsung bisa;
   kegagalan hanya terjadi di sandbox kerja ini yang memblokir sanity.io).

## 2. Uji alur TANPA kredensial TikTok (wajib lolos dulu)

1. Buka website → footer → **Admin Login** → masuk → **Sinkronisasi TikTok Shop**.
2. Panel menampilkan status `MODE DRY-RUN / EKSPOR` (sinkron terkunci — benar).
3. Pilih **satu** produk → klik **Validasi**.
   - Perbaiki di Sanity setiap item berlabel **ERROR** (berat, dimensi, SKU, kondisi, kategori, foto, harga, stok).
   - Item **WARNING** boleh lanjut, tapi disarankan diperbaiki (mis. nama < 25 karakter, foto < 5).
4. Klik **Dry-run** → periksa pratinjau payload JSON. Pastikan tidak ada nilai yang "ditebak":
   field kosong harus tampil sebagai error, bukan angka default.
5. Klik **Ekspor CSV** → file `tiktok-1produk-<id>.csv` terunduh. File ini untuk **upload manual /
   referensi kolom di Seller Center**, bukan sinkron otomatis.

## 3. Uji SATU produk via API (setelah akses siap)

**Lingkup uji yang disetujui pemilik toko (2026-09-26): 1 (satu) produk saja:**
**"Treadmill elektrik lipat untuk home gym"** (menggantikan pilihan awal treadmill commercial).
Di luar 1 produk ini, sinkron tetap terkunci dan dilarang.

> UPDATE 2026-09-27: pemilik toko memutuskan beralih ke **upload massal semua produk ke Tokopedia**
> via file (lihat `docs/TOKOPEDIA_MASSAL_ID.md`). Seluruh integrasi TikTok di dokumen ini
> **DITUNDA dan tetap terkunci** sampai ada instruksi baru.

1. Isi env di Vercel: `TIKTOK_APP_KEY`, `TIKTOK_APP_SECRET`, `TIKTOK_ACCESS_TOKEN`,
   `TIKTOK_REFRESH_TOKEN`, `TIKTOK_SHOP_ID`, `TIKTOK_SHOP_CIPHER`, `TIKTOK_ADMIN_KEY`.
   Tetap biarkan `TIKTOK_SYNC_ENABLED=false` dulu, lalu redeploy.
2. `GET /api/tiktok/status` → `credentialsComplete: true`, `syncEnabled: false` (masih terkunci — benar).
3. Ambil `category_id` daun + `warehouse_id` + aturan atribut dari API TikTok
   (endpoints resmi: Get Categories, Get Attributes, Get Warehouse List), lalu isi
   `api/_lib/tiktok-category-map.js` dan `tiktokCategoryId` di Sanity untuk produk uji.
4. Dry-run produk uji → harus **VALID** tanpa error.
5. Minta persetujuan eksplisit pemilik toko (tulis nama produk + ID), **baru kemudian**:
   set `TIKTOK_SYNC_ENABLED=true` → redeploy → sinkron **satu** produk dari panel admin
   (wajib centang konfirmasi + `TIKTOK_ADMIN_KEY`).
6. Verifikasi di Seller Center: produk muncul sebagai **DRAFT**, periksa nama, harga, stok,
   foto, berat, dimensi. Produk TIDAK langsung dipublish — publikasi dilakukan manual dari Seller Center.
7. Bila sukses: kembalikan `TIKTOK_SYNC_ENABLED=false` sampai batch berikutnya disetujui.

## 4. Rollback

- Kegagalan validasi/sync tidak mengubah data Sanity maupun website (endpoint tulis hanya memanggil TikTok).
- Untuk mematikan total: hapus env `TIKTOK_SYNC_ENABLED` (atau set `false`) + redeploy.
  Panel admin otomatis kembali ke mode dry-run/ekspor.

## 5. Uji otomatis (self-test, tanpa data asli)

```bash
node scripts/tiktok-selftest.mjs
```

Self-test memakai **fixture sintetis** (bukan data Sanity asli) untuk membuktikan:
validator menolak harga 0, stok kosong, gambar placeholder, berat/dimensi/SKU/kondisi/kategori yang kosong,
dan dry-run tidak pernah memanggil jaringan. Wajib hijau sebelum deploy.
