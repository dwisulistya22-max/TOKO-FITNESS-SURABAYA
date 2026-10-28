# Panduan Koneksi Lazada — Langkah demi Langkah

⚠️ PENTING: Kerjakan **satu per satu**. Jangan lompat-lompat.
Kalau ada langkah yang membingungkan, sebutkan **nomornya saja** (misal: "langkah 4 bingung"),
nanti saya bantu di langkah itu saja.

---

## Dulu, pahami ini dulu (supaya tidak bingung)

Sebenarnya ada 2 tingkat "koneksi Lazada":

| Tingkat | Penjelasan | Status |
|---|---|---|
| **A. Tombol belanja** | Pengunjung website klik "Belanja di Lazada" → pindah ke toko Lazada Anda | ✅ SUDAH JALAN (tidak perlu diapa-apakan) |
| **B. Integrasi produk** | Data produk di website bisa dikirim otomatis ke Lazada (biar tidak input manual 2 kali) | 🔧 Kodenya sudah jadi, tinggal **mengisi kunci** |

Panduan di bawah ini hanya untuk **Tingkat B**.

Yang perlu Anda lakukan hanya **2 hal besar**:
1. **Ambil kunci** dari situs Lazada (namanya: App Key, App Secret, Access Token)
2. **Masukkan kunci** itu ke Vercel (tempat website Anda disimpan)

Itu saja. Tidak perlu ngoding sama sekali.

---

## LANGKAH 1 — Siapkan 2 hal ini dulu

- [ ] Pastikan Anda bisa **login ke akun Lazada Seller** (toko Lazada Anda yang sekarang)
- [ ] Buka aplikasi **Notepad** (atau catatan HP) — untuk menyimpan kunci sementara

✅ Selesai kalau: Anda sudah bisa login ke Lazada Seller dan Notepad sudah terbuka.

---

## LANGKAH 2 — Buka situs pengembang Lazada

1. Buka website: **https://open.lazada.com**
2. Klik tombol **Sign In** (Login) di pojok kanan atas
3. Login **pakai akun Lazada Seller yang sama** dengan toko Anda

✅ Selesai kalau: Anda sudah masuk dan melihat halaman dasbor pengembang.

---

## LANGKAH 3 — Buat "aplikasi" (tempat kunci disimpan)

1. Di menu atas, cari **My Apps** (Aplikasi Saya)
2. Klik **Create App** (Buat Aplikasi)
3. Isi formulirnya:
   - **App Name** (nama aplikasi): bebas, contoh: `Toko Fitness Surabaya`
   - **App Type** (tipe): pilih **Seller** (atau Self-service)
   - **Redirect URL**: isi dengan alamat website Anda
     (contoh: `https://tokofitnesssurabaya.com`)
   - Bagian lain: boleh dikosongkan
4. Klik **Save** / **Submit**

Setelah aplikasi jadi, halaman akan menampilkan 2 kunci:

| Kunci | Tampilan | Yang Anda lakukan |
|---|---|---|
| **App Key** | deretan angka/huruf | SALIN → tempel di Notepad |
| **App Secret** | deretan angka/huruf | SALIN → tempel di Notepad |

⚠️ **App Secret itu rahasia** — jangan dikirim ke siapa pun lewat chat/postingan publik.

✅ Selesai kalau: di Notepad Anda ada 2 baris: App Key dan App Secret.

---

## LANGKAH 4 — Mendapatkan "Access Token" (izin untuk toko Anda)

1. Di halaman aplikasi yang sama, cari menu **Authorization** (Otorisasi)
2. Klik tombol **Authorize** / **Generate Token**
3. Pilih toko Anda (Toko Fitness Surabaya), lalu klik **Setuju** / **Agree**
4. Akan muncul **Access Token** (dan biasanya **Refresh Token**)
5. SALIN keduanya → tempel juga di Notepad

✅ Selesai kalau: di Notepad ada 4 baris: App Key, App Secret, Access Token, Refresh Token.

> 💡 Kalau di Langkah 4 ini tombolnya tidak ketemu / bingung, **STOP** di sini dan
> kabari saya "langkah 4 bingung" — nanti saya bantu cari tombolnya.

---

## LANGKAH 5 — Masukkan kunci ke Vercel (tempat website disimpan)

1. Buka **https://vercel.com** → login (akun yang dipakai untuk website ini)
2. Pilih project **TOKO-FITNESS-SURABAYA**
3. Klik menu **Settings** → **Environment Variables**
4. Tambahkan satu per satu (klik Add, isi nama + nilai, lalu Save):

| Nama | Nilai (dari Notepad) |
|---|---|
| `LAZADA_APP_KEY` | isi App Key |
| `LAZADA_APP_SECRET` | isi App Secret |
| `LAZADA_ACCESS_TOKEN` | isi Access Token |
| `LAZADA_REFRESH_TOKEN` | isi Refresh Token (kalau ada) |
| `LAZADA_SYNC_ENABLED` | isi: `false` (dulu!) |
| `LAZADA_ADMIN_KEY` | buat kata sandi sendiri yang rumit, contoh: `rahasia123-XYZ` |

5. Setelah semua terisi, klik **Deployments** → di deployment terbaru klik **⋮** → **Redeploy**

✅ Selesai kalau: website sudah di-redeploy dan semua variabel tersimpan.

---

## LANGKAH 6 — Uji coba (TANPA mengirim produk apa pun)

1. Buka website toko Anda
2. Scroll ke paling bawah → klik **Login Admin** (di footer) → masukkan password admin
3. Klik tombol **🛒 Sinkronisasi Lazada (dry-run)**
4. Di layar itu, **pilih 1 produk** dari daftar
5. Klik tombol **Validasi**
   - Kalau muncul tulisan merah "error" → berarti data produk di Sanity belum lengkap
     (misal: SKU kosong, berat kosong). Sebutkan errornya ke saya, nanti saya bantu perbaiki.
6. Kalau sudah hijau "VALID" → klik **Dry-run**
   - Layar akan menampilkan "pratinjau" data yang AKAN dikirim. Tidak ada yang benar-benar terkirim.
7. (Opsional) Klik **Ekspor CSV** → file terunduh untuk dilihat/dicek

✅ Selesai kalau: Anda sudah bisa melihat pratinjau data 1 produk.

---

## LANGKAH 7 — Baru kirim 1 produk sungguhan (nanti, kalau sudah yakin)

⚠️ Jangan lakukan langkah ini sekarang. Baru dilakukan setelah Langkah 6 lancar:

1. Di Vercel, ubah `LAZADA_SYNC_ENABLED` menjadi `true` → Redeploy
2. Di panel Sinkronisasi tadi, pilih 1 produk → Validasi → Dry-run
3. Kalau sudah yakin, klik **Sinkron 1**
4. Masukkan kata sandi `LAZADA_ADMIN_KEY` + centang persetujuan
5. Buka **Lazada Seller Center** → cek produk Anda muncul (biasanya status DRAFT / menunggu review)

Itu saja. **Tidak ada pengiriman massal.** Semua pengiriman harus 1 per 1 dengan persetujuan Anda.

---

## LANGKAH 4b — Ambil Access Token lewat otorisasi toko

Aplikasi bertipe **Seller In-house APP** memakai kebijakan *Allow binding users to authorize*, jadi toko Anda
harus didaftarkan dulu di whitelist baru bisa memberi izin.

1. **Open Platform** → **App Management** → **Manage** aplikasi **Toko Fitness Surabaya**
2. Gulir paling bawah → **Authorized Seller Whitelist** → **+ Add**
   - **Seller ID** = *Kode Pendek* di Seller Center → Pengaturan (contoh: `ID68PMOYJZ`)
   - **Seller Email** + **Password** = email & password login Seller Center
   - **Country** = **Indonesia** → **Submit**
3. Buka alamat otorisasi ini di browser (ganti `client_id` bila App Key berbeda):

   ```
   https://auth.lazada.com/oauth/authorize?response_type=code&force_auth=true&redirect_uri=https%3A%2F%2Ftokofitnesssurabaya.com&client_id=143555
   ```

4. Login dengan akun Seller Center → klik **Agree/Authorize**. Browser akan kembali ke
   `https://tokofitnesssurabaya.com/?code=XXXX` → **salin nilai `code` dari address bar**.
5. Dalam **30 menit**, buka:

   ```
   https://tokofitnesssurabaya.com/api/lazada/auth?code=KODE_TADI
   ```

   Halaman akan menampilkan **LAZADA_ACCESS_TOKEN** dan **LAZADA_REFRESH_TOKEN**. Simpan ke Notepad.
6. Masukkan ke Vercel: `LAZADA_APP_KEY`, `LAZADA_APP_SECRET`, `LAZADA_ACCESS_TOKEN`,
   `LAZADA_REFRESH_TOKEN`, `LAZADA_ADMIN_KEY`, dan `LAZADA_SYNC_ENABLED=false` → **Redeploy**.

> Kode otorisasi hanya berlaku 30 menit dan sekali pakai. Bila kedaluwarsa, ulangi Langkah 4.
> Token hanya ditampilkan di layar Anda sendiri; server tidak menyimpannya.

---

## LANGKAH 8 — Kirim SEMUA produk sekaligus (bulk)

Dipakai setelah Langkah 6 (dry-run) lancar.

1. Di Vercel tambahkan dua variabel lalu **Redeploy**:
   - `LAZADA_ADMIN_KEY` = kata sandi pilihan Anda (diketik ulang setiap aksi)
   - `LAZADA_SYNC_ENABLED` = `true` (membuka sinkron; boleh dikembalikan ke `false` kapan saja)
2. Buka panel **Sinkronisasi Lazada** → bagian **4) Kirim SEMUA produk sekaligus (bulk)**.
3. Klik **1. Hitung rencana**. Muncul jumlah **siap** vs **perlu diperbaiki** (beserta alasannya).
   Belum ada yang dikirim di tahap ini.
4. (Opsional) Klik **Unduh CSV semua** untuk melihat semua produk + status validasinya.
5. Centang persetujuan, ketik **kunci admin**, lalu klik **2. KIRIM semua produk yang siap**.

Aturan yang selalu berlaku:

- Produk yang datanya belum lengkap (SKU, berat, dimensi, stok, kategori Lazada, foto asli) **dilewati** dan
  dilaporkan — sistem tidak menebak.
- Maksimal **5 produk per putaran**, dengan jeda aman. Klik tombolnya lagi untuk putaran berikutnya.
- Produk masuk Lazada sebagai **DRAFT / menunggu review**, bukan langsung tayang.

---

## LANGKAH 9 — Melengkapi data 291 produk sekaligus (isi cepat massal)

Hampir semua produk belum punya SKU, brand, berat, dimensi, dan kategori Lazada. Isi lewat panel,
bukan satu per satu.

**A. Ambil kategori asli dari Lazada**

1. Panel **Sinkronisasi Lazada** → bagian **4) Kirim SEMUA produk** → kotak **Kategori Lazada per jenis produk**.
2. Ketik kata kunci (mis. `treadmill`) lalu klik **Ambil**. Muncul daftar `category_id` + jalur lengkap.
   Daftar ini diambil **langsung dari Lazada**, bukan ditebak.

**B. Isi cepat massal**

3. Isi **Brand** (mis. `No Brand`) dan **Awalan SKU** (mis. `TFS-`). SKU otomatis mengikuti urutan produk
   (`TFS-0001`, `TFS-0002`, …) dan **hanya mengisi produk yang SKU-nya kosong**.
4. Isi **Berat umum** dan **P/L/T umum** — atau isi per jenis produk (lebih akurat, mis. Treadmill 45 kg
   vs Rubber Flooring 8 kg).
5. Isi `category_id` Lazada untuk tiap jenis produk, lalu klik **Simpan profil** (tersimpan di browser).
6. Klik **1. Hitung rencana** → angka **siap** akan naik.

**C. Kirim** (setelah yakin)

7. Isi `LAZADA_ADMIN_KEY` dan `LAZADA_SYNC_ENABLED=true` di Vercel → **Redeploy**.
8. Centang persetujuan → ketik kunci admin → klik **2. KIRIM semua produk yang siap** (maks 5 per putaran).

> Semua angka yang dipakai berasal dari isian Anda sendiri. Kalau ada kolom yang Anda kosongkan,
> produk itu tetap dianggap **tidak siap** dan dilaporkan alasannya.

---

## Ringkasan singkat

```
Langkah 1-4 : Ambil kunci dari open.lazada.com  → tempel di Notepad
Langkah 5   : Masukkan kunci ke Vercel
Langkah 6   : Uji coba (dry-run, aman, tidak kirim apa pun)
Langkah 7   : Kirim 1 produk sungguhan (nanti, kalau siap)
```

Masing-masing langkah selesai satu per satu, lalu kabari saya.
