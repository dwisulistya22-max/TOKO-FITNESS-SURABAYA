// api/_lib/tokopedia.js
// Pembuat file data SEMUA produk untuk di-copy-paste ke template resmi
// "Tambah Sekaligus" Tokopedia Seller. Tanpa dependensi.
// Berat/dimensi digabung dari file riset tokopedia-specs.js (ada sumbernya).
// Yang belum diriset => kolom dikosongkan + ditandai (tidak dikarang).

import { isPlaceholderImage } from './tiktok.js';
import { lookupSpec } from './tokopedia-specs.js';

const csvCell = (v) => `"${String(v ?? '').replace(/"/g, '""').replace(/\r?\n/g, ' ').trim()}"`;

// SKU dibuat dari ID Sanity (unik, bisa diganti bebas di Excel).
export function makeSku(id, index) {
  const clean = String(id || '').replace(/[^a-zA-Z0-9]/g, '').slice(-6).toUpperCase() || String(index + 1);
  return `TF-${clean}`;
}

export function buildTokopediaMasterCsv(products) {
  const header = [
    'No', 'Nama Produk', 'Kategori (catatan dari website)', 'Harga Rp', 'Stok', 'SKU',
    'Berat Gram', 'Panjang Cm', 'Lebar Cm', 'Tinggi Cm',
    'Deskripsi', 'Spesifikasi',
    'Foto 1', 'Foto 2', 'Foto 3', 'Foto 4', 'Foto 5',
    'Status Data', 'Sumber Berat/Dimensi', 'Catatan',
  ];
  const rows = (products || []).map((p, i) => {
    // Tokopedia hanya terima foto .jpg/.jpeg/.png — foto .webp Sanity otomatis
    // diminta dalam format .jpg (?fm=jpg) agar bisa dipakai langsung.
    const realPhotos = (p.images || [])
      .filter((u) => u && !isPlaceholderImage(u))
      .map((u) => (/\.webp(\?|$)/i.test(u) ? (u.includes('?') ? `${u}&fm=jpg` : `${u}?fm=jpg`) : u));
    const spec = lookupSpec(p.id);
    const notes = [];
    if (!p.name) notes.push('nama kosong');
    if (!Number.isFinite(p.price) || p.price <= 0) notes.push('harga 0/kosong');
    if (!Number.isFinite(p.stock)) notes.push('stok kosong');
    else if (p.stock === 0) notes.push('STOK 0 — isi stok dulu (stok 0 tidak bisa dibeli)');
    if (!p.description) notes.push('deskripsi kosong');
    if (realPhotos.length === 0) notes.push('TANPA FOTO ASLI');

    let weight = '';
    let dims = ['', '', ''];
    let source = '';
    if (spec) {
      if (Number.isFinite(spec.weightGrams) && spec.weightGrams > 0) {
        weight = spec.weightGrams;
      } else {
        notes.push('BERAT BELUM ADA — ' + (spec.verify || 'tanya supplier/timbang'));
      }
      dims = [spec.lengthCm || '', spec.widthCm || '', spec.heightCm || ''];
      source = `[${spec.confidence}] ${spec.source} ${spec.verify || ''}`.trim();
      if (spec.confidence === 'SEDANG' || String(spec.confidence).startsWith('RENDAH')) {
        notes.push('berat/dimensi perlu verifikasi: ' + (spec.verify || 'cek ulang'));
      }
    } else {
      notes.push('berat/dimensi BELUM DIRISET — antri batch riset berikutnya');
    }

    const photos = realPhotos.slice(0, 5);
    while (photos.length < 5) photos.push('');
    const blocking = notes.some((n) => /TANPA FOTO|harga|nama kosong|BERAT BELUM ADA|BELUM DIRISET/i.test(n));
    const status = blocking ? 'KURANG — perbaiki dulu' : 'OK — siap copy ke template';
    return [
      i + 1, p.name || '', p.category || '',
      Number.isFinite(p.price) ? p.price : '', Number.isFinite(p.stock) ? p.stock : '',
      makeSku(p.id, i),
      weight, dims[0], dims[1], dims[2],
      p.description || '', p.specs || '',
      ...photos, status, source, notes.join('; '),
    ];
  });
  const lines = rows.map((r) => r.map(csvCell).join(','));
  return '﻿' + header.join(',') + '\n' + lines.join('\n') + '\n';
}
