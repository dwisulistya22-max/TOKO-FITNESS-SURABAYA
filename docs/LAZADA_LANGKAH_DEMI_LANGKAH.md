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

## Ringkasan singkat

```
Langkah 1-4 : Ambil kunci dari open.lazada.com  → tempel di Notepad
Langkah 5   : Masukkan kunci ke Vercel
Langkah 6   : Uji coba (dry-run, aman, tidak kirim apa pun)
Langkah 7   : Kirim 1 produk sungguhan (nanti, kalau siap)
```

Masing-masing langkah selesai satu per satu, lalu kabari saya.
