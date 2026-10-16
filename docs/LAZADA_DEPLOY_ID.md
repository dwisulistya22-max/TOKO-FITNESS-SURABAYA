# Deploy & Uji Integrasi Lazada

## 1. Deploy

- Repo ini adalah Vite (frontend) + folder `api/` (serverless Vercel-style).
- Deploy ke Vercel seperti biasa (`vercel` atau integrasi GitHub).
- Endpoint otomatis tersedia:
  - `GET /api/lazada/status`
  - `GET /api/lazada/products`
  - `POST /api/lazada/validate`
  - `POST /api/lazada/dryrun`
  - `POST /api/lazada/export`
  - `POST /api/lazada/sync`

## 2. Self-test lokal (wajib hijau)

```bash
node scripts/lazada-selftest.mjs
```

Uji validator/mapper dengan fixture sintetis, tanpa jaringan.

## 3. Uji di Vercel Preview (tanpa kredensial)

1. `GET /api/lazada/status` → `syncBlocked: true`, `mode: "DRY_RUN_EXPORT"`.
2. `GET /api/lazada/products` → daftar produk sama dengan Sanity Studio.
3. Admin Login (footer) → **Sinkronisasi Lazada** → pilih 1 produk →
   **Validasi** → **Dry-run** → **Ekspor CSV**.
4. Pastikan tidak ada panggilan apa pun ke Lazada (semua endpoint di atas offline
   terhadap Lazada).

## 4. Uji sinkron 1 produk (setelah akses lengkap)

1. Isi environment variables sesuai `docs/LAZADA_AKSES_ID.md`.
2. Set `LAZADA_SYNC_ENABLED=true`.
3. Buka panel → Validasi hingga VALID → Dry-run → **Sinkron 1**.
4. Masukkan `adminKey` + centang konfirmasi.
5. Verifikasi produk muncul di Seller Center (biasanya sebagai DRAFT/QC).
6. Bila QC menolak (mis. gambar bukan inlink), perbaiki lalu ulangi.

## 5. Troubleshooting

| Gejala | Penyebab | Solusi |
|---|---|---|
| `SINKRON TERKUNCI` | Flag/kredensial belum lengkap | Cek `/api/lazada/status` |
| `adminKey salah` | Env `LAZADA_ADMIN_KEY` belum di-set | Isi di Vercel |
| Error `categoryId` | Kategori belum terpetakan | Isi `lazadaCategoryId`/map dari GetCategoryTree |
| Error `images` placeholder | Foto Unsplash/dummy | Ganti foto asli di Sanity |
| QC reject gambar | Bukan Lazada inlink | Migrasi via `/image/migrate` dulu |
| Token expired | Access token habis masa | Refresh token / OAuth ulang |
