"""Build TEMPLATE-ISI-99-PRODUK.xlsx (batch-1 FINAL revisi).

Revisi 2026-09-28: Walking Pad CH-21 (top100[0]) SUDAH tayang manual, trial
Tokopedia maks 100 listing -> file ini berisi 99 produk (top100[1:]) agar
total 1 + 99 = 100 PAS. Kategori per kelompok sudah ground-truth via
category_id=837768 (Mesin Kebugaran) dari URL halaman edit produk live.
Kolom A template diisi dengan COPY sel dari sheet Category (JANGAN dropdown).
Nomor baris Category = KONDISI SETELAH user sort A-Z ( stabilization ).
"""
import json

from openpyxl import Workbook
from openpyxl.styles import Font

data = json.load(open('tokopedia-csv/top100.json'))
assert data[0]['name'] == 'Walking Pad CH-21', data[0]['name']
top = data[1:]
assert len(top) == 99, len(top)

wb = Workbook()
ws0 = wb.active
ws0.title = 'CARA PAKAI'
lines = [
    'CARA PAKAI - 99 PRODUK (Walking Pad CH-21 sudah tayang manual, tidak ikut file ini).',
    'Trial Tokopedia: 1 (manual) + 99 (file ini) = 100 PAS.',
    '',
    'Langkah 1 - Isi kolom A template dengan COPY dari sheet Category (JANGAN pakai panah kecil!):',
    'Pola: buka tab Category > klik sel sumber (misal A205) > Ctrl+C > buka tab Template >',
    'klik sel awal (misal A7) > tahan Shift + klik sel akhir (misal A35) > Ctrl+V.',
    '1x copy bisa di-paste ke beberapa tempat. Ikuti tabel di sheet BANTU-KATEGORI.',
    'PENTING: JANGAN klik Sort/Filter di sheet Category (nomor baris berubah!).',
    'Isi lama kolom A (A7 dst) langsung DITIMPA saja.',
    'Langkah 2 - BLOK 1: sheet "BLOK 1-tempel-C7" > Ctrl+A > Ctrl+C > template klik C7 > Ctrl+V.',
    'Langkah 3 - BLOK 2: sheet "BLOK 2-tempel-S7" > Ctrl+A > Ctrl+C > template klik S7 > Ctrl+V.',
    'Langkah 4 - BLOK 3: sheet "BLOK 3-tempel-X7" > Ctrl+A > Ctrl+C > template klik X7 > Ctrl+V.',
    'Langkah 5 - Di template tekan Ctrl+S (simpan). Upload di Seller Center > Langkah 2 (Unggah File).',
    '',
    'CATATAN: kolom B (Merek) dan kolom Y (Pre-sale) kosong = BENAR (produk manual tanpa merek lolos).',
    'CATATAN 2: kalau upload error di 4 baris paling bawah, hapus 4 baris itu lalu upload ulang.',
    'Kalau ada baris ditolak, catat nomor barisnya dan beri tahu saya.',
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

# [COPY sel Category, PASTE range Template, nama kategori, isi produk]
# Template rows 7-105 (99 produk). A205 ground-truth via category_id=837768 live.
BANTU = [
    ('A205', 'A7:A35', 'Mesin Kebugaran', 'Treadmill & Walking Pad (29)'),
    ('A205', 'A36:A60', 'Mesin Kebugaran', 'Commercial Fitness (25)'),
    ('A205', 'A76:A89', 'Mesin Kebugaran', 'Sepeda Statis & Crosstrainer (14)'),
    ('A205', 'A101', 'Mesin Kebugaran', 'Alat Outdoor (1)'),
    ('A201', 'A61:A75', 'Latihan Beban', 'Home Gym & Bench (15)'),
    ('A201', 'A96:A97', 'Latihan Beban', 'Dumbell Set (2)'),
    ('A201', 'A103', 'Latihan Beban', 'Rubber Plate (1)'),
    ('A196', 'A92', 'Aksesori Mesin Olahraga', 'Handle Row (1)'),
    ('A196', 'A95', 'Aksesori Mesin Olahraga', 'Spon Busa (1)'),
    ('A196', 'A102', 'Aksesori Mesin Olahraga', 'Tali Sling Putih (1)'),
    ('A196', 'A104:A105', 'Aksesori Mesin Olahraga', 'Tali Sling Hitam + Klem U (2)'),
    ('A204', 'A91', 'Matras olahraga', 'Matras Senam (1)'),
    ('A204', 'A98:A100', 'Matras olahraga', 'Rubber Flooring (3)'),
    ('A202', 'A90', 'Latihan Otot Perut', 'Figure Trimmer Twister (1)'),
    ('A208', 'A93', 'Peralatan Latihan Keseimbangan', 'Bosu Balance Ball (1)'),
    ('A188', 'A94', 'Senam (Bersantai & Rekreasi)', 'Aerobic Step (1)'),
]

ws = wb.create_sheet('BANTU-KATEGORI')
ws.append(['COPY sel ini (di sheet Category)', 'PASTE ke (di sheet Template)', 'Kategori', 'Produk'])
for row in BANTU:
    ws.append(list(row))
ws.column_dimensions['A'].width = 32
ws.column_dimensions['B'].width = 30
ws.column_dimensions['C'].width = 32
ws.column_dimensions['D'].width = 38

wb.save('tokopedia-csv/TEMPLATE-ISI-99-PRODUK.xlsx')
print('xlsx OK:', len(top), '| bantu-baris:', len(BANTU))
