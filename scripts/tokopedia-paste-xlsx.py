# python3 scripts/tokopedia-paste-xlsx.py
# Buat file Excel 3 blok siap copy-paste ke template resmi Tokopedia + panduan kategori.
import json
from openpyxl import Workbook
from openpyxl.styles import Font

top = json.load(open('tokopedia-csv/top100.json', encoding='utf-8'))
wb = Workbook()
ws0 = wb.active
ws0.title = 'CARA PAKAI'
lines = [
    'CARA MEMAKAI FILE INI (10 menit)',
    '',
    'File ini berisi 100 produk yang SUDAH DIPILIH (ada stok + data lengkap).',
    'Anda tinggal COPY-PASTE 3 blok ke file template Tokopedia (sheet "Template").',
    '',
    'Langkah 0 - Buka file template Tokopedia, klik "Enable Editing" (baris kuning di atas).',
    'Langkah 1 - Isi kolom A (Kategori) PER KELOMPOK (lihat sheet "BANTU-KATEGORI"):',
    'contoh: baris 7-36 semuanya treadmill -> klik A7, pilih kategori dari panah kecil,',
    'lalu tarik kotak hijau di sudut sel ke bawah sampai A36. Ulangi untuk kelompok berikutnya.',
    'Pilih kategori yang paling mirip (ada kata Treadmill / Gym / Fitness / Alat Olahraga).',
    'Langkah 2 - BLOK 1: buka sheet "BLOK 1-tempel-C7", tekan Ctrl+A (pilih semua), Ctrl+C (copy),',
    'pindah ke template, klik sel C7, tekan Ctrl+V (paste).',
    'Langkah 3 - BLOK 2: buka sheet "BLOK 2-tempel-S7", Ctrl+A, Ctrl+C,',
    'pindah ke template, klik sel S7, Ctrl+V.',
    'Langkah 4 - BLOK 3: buka sheet "BLOK 3-tempel-X7", Ctrl+A, Ctrl+C,',
    'pindah ke template, klik sel X7, Ctrl+V.',
    'Langkah 5 - Di template tekan Ctrl+S (simpan). Upload di Seller Center > Langkah 2 (Unggah File).',
    '',
    'CATATAN: kolom B (Merek) dan kolom Y (Pre-sale) sengaja dikosongkan - benar begitu.',
    'CATATAN 2: 4 baris PALING BAWAH dimensinya kosong -',
    'kalau upload error, hapus saja 4 baris paling bawah itu di template.',
    'CATATAN 3: kalau jenis produk tidak ada di pilihan kolom A,',
    'hapus baris produk itu (di-upload nanti dengan template kategori lain).',
    'Kalau ada foto ditolak Tokopedia, beri tahu saya.',
]
for i, t in enumerate(lines, 1):
    ws0.cell(row=i, column=1, value=t)
ws0.column_dimensions['A'].width = 95
ws0['A1'].font = Font(bold=True, size=14)


def sheet(name, cols):
    ws = wb.create_sheet(name)
    for r, o in enumerate(top, 1):
        for c, fn in enumerate(cols, 1):
            ws.cell(row=r, column=c, value=fn(o))


E = lambda o: ''  # noqa: E731 - kolom kosong (B=Merek, Y=Pre-sale)
sheet('BLOK 1-tempel-C7', [
    lambda o: o['name'], lambda o: (o['description'] or '').strip(),
    lambda o: o['photos'][0], lambda o: o['photos'][1], lambda o: o['photos'][2],
    lambda o: o['photos'][3], lambda o: o['photos'][4], E, E, E, E])
sheet('BLOK 2-tempel-S7', [
    lambda o: o['weight'], lambda o: o['length'], lambda o: o['width'], lambda o: o['height']])
sheet('BLOK 3-tempel-X7', [
    lambda o: o['price'], E, lambda o: o['stock'], lambda o: o['sku']])

# Panduan kategori per kelompok (template baris = file baris + 6)
ws = wb.create_sheet('BANTU-KATEGORI')
ws.append(['Baris di template', 'Jenis produk', 'Jumlah'])
groups = []
start = 0
for i, o in enumerate(top):
    if o['sanityCategory'] != top[start]['sanityCategory']:
        groups.append((start, i - 1, top[start]['sanityCategory']))
        start = i
groups.append((start, len(top) - 1, top[start]['sanityCategory']))
for a, b, cat in groups:
    ws.append([f'Baris {a + 7}-{b + 7}', cat, b - a + 1])
ws.column_dimensions['A'].width = 18
ws.column_dimensions['B'].width = 30
ws.column_dimensions['C'].width = 10

wb.save('tokopedia-csv/TEMPLATE-ISI-100-PRODUK.xlsx')
print('xlsx OK:', len(top), '| kelompok:', len(groups))
