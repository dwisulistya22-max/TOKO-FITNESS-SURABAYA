// api/_lib/tokopedia-specs.js
// Data BERAT & DIMENSI hasil riset (bukan karangan). Key = Sanity _id.
// confidence: TINGGI (deskripsi pemilik / sumber identik) | SEDANG (referensi sejenis) | RENDAH (estimasi aman)
// Aturan: yang tidak ketemu sumbernya => weightGrams: null + cara verifikasi di notes.

export const TOKOPEDIA_SPECS = {
  // 1. Rubber Flooring Roll 1x10m 8mm
  '11e9e11c-bffb-4fc1-89b5-022133c9c9be': {
    weightGrams: 90000, lengthCm: 105, widthCm: 45, heightCm: 45,
    source: 'Referensi pabrikan Greatmats (AS): rubber roll 8mm = 1.85 lbs/sqft (±9 kg/m²) × 10 m².',
    confidence: 'SEDANG', verify: 'WAJIB timbang ulang 1 roll sebelum upload.',
  },
  // 2. Lat Pull Down 2 Seat Total Fitness (alat OUTDOOR)
  'f56f5574-56b7-4337-91de-2d4cacf81482': {
    weightGrams: 50000, lengthCm: 210, widthCm: 70, heightCm: 200,
    source: 'Katalog New Quality Group: Weight 50 kg, Dimensions 210×70×200 cm (sama persis dgn deskripsi).',
    confidence: 'TINGGI', verify: 'Alat outdoor knockdown — kirim via kargo/truk.',
  },
  // 3. Leg Press Hack Squat 2in1 Combo BM-LPHS2050 (dimensi dari deskripsi pemilik; berat TIDAK dipublikasikan)
  '8f38beed-afca-49c5-bb44-bc8ededbba86': {
    weightGrams: null, lengthCm: 190, widthCm: 102, heightCm: 143,
    source: 'Dimensi dari deskripsi pemilik. Berat mesin TIDAK tercantum di website resmi Indofitnes/Bodymaster.',
    confidence: '-', verify: 'TANYA SUPPLIER berat mesin LPHS2050 (atau timbang). Produk sejenis ±140-180 kg — JANGAN pakai angka itu.',
  },
  // 4. Leg Press Hack Squat 2in1 BM-LPHS2030 (sama: berat tidak dipublikasikan)
  '952f5266-15a1-42fb-97c1-b9b53ad901d7': {
    weightGrams: null, lengthCm: 190, widthCm: 102, heightCm: 143,
    source: 'Dimensi dari deskripsi pemilik. Berat mesin TIDAK tercantum di website resmi Indofitnes/Bodymaster.',
    confidence: '-', verify: 'TANYA SUPPLIER berat mesin LPHS2030 (atau timbang).',
  },
  // 5. Adjustable Bench BM-102 (Bodymaster)
  'c87f6522-61cc-47fd-a142-ce85cc321904': {
    weightGrams: 12000, lengthCm: 115, widthCm: 40, heightCm: 35,
    source: 'Lapak Tokopedia (teks deskripsi IDENTIK dgn milik sendiri): berat 12KG, ukuran P108×L34×T109 cm.',
    confidence: 'TINGGI', verify: 'Dimensi packing estimasi (posisi lipat).',
  },
  // 6. Lat Pull Down Bar BM-A218
  'c520f0ed-f654-4d21-b366-5a070dbec297': {
    weightGrams: 5500, lengthCm: 125, widthCm: 15, heightCm: 15,
    source: 'Deskripsi produk milik sendiri: ukuran 121cm, berat 5,5kg.',
    confidence: 'TINGGI', verify: 'Dimensi packing pipa estimasi.',
  },
  // 7. Curl Bar Handle 28"
  '0820eb0e-0af7-471c-9887-0c0a4a491d97': {
    weightGrams: 3500, lengthCm: 85, widthCm: 15, heightCm: 15,
    source: 'Deskripsi produk milik sendiri: 78×10 cm, berat 3,5kg.',
    confidence: 'TINGGI', verify: 'Dimensi packing estimasi.',
  },
  // 8. Handle Grip (1 pasang + carabiner)
  '68e9c5c3-69c2-4fb4-8349-3bb670bda2f2': {
    weightGrams: 1000, lengthCm: 30, widthCm: 20, heightCm: 15,
    source: 'Estimasi AMAN untuk aksesoris kecil (minimum hitung kurir 1kg). Ukuran produk 23×14cm dari deskripsi.',
    confidence: 'RENDAH (aman untuk ongkir)', verify: 'Opsional: timbang 1 pasang (±0,8-1,2kg).',
  },
  // 9. Iso Lateral Bench Press SM-2032
  '5f2bd37c-4b36-4404-b422-cadb741ac095': {
    weightGrams: 148000, lengthCm: 122, widthCm: 170, heightCm: 183,
    source: 'Deskripsi produk milik sendiri: Dimension 122×170×183 cm, Weight 148 Kg.',
    confidence: 'TINGGI', verify: 'Mesin 148kg — wajib kargo/truk + asuransi.',
  },
  // 10. Iso Lateral Wide Chest SM-2014
  '08a7888c-06a2-4c52-aa6d-533de0ca70aa': {
    weightGrams: 182000, lengthCm: 195, widthCm: 114, heightCm: 189,
    source: 'Deskripsi produk milik sendiri: Dimension 195×114×189 cm, Weight 182 Kg.',
    confidence: 'TINGGI', verify: 'Mesin 182kg — wajib kargo/truk + asuransi.',
  },
  // --- BATCH 2 (produk no 11-20) ---
  // 11. Iso Lateral Row SM-2011
  '396a3d9c-80d9-48ea-bed2-7798a6eedbab': {
    weightGrams: 125000, lengthCm: 155, widthCm: 127, heightCm: 132,
    source: 'Deskripsi produk milik sendiri: Dimension 155×127×132 cm, Weight 125 Kg.',
    confidence: 'TINGGI', verify: 'Mesin 125kg — wajib kargo/truk + asuransi.',
  },
  // 12. Iso Lateral High Row SM-2006
  '8efa06ab-58ca-4432-bbd5-820760556d05': {
    weightGrams: 166000, lengthCm: 163, widthCm: 145, heightCm: 201,
    source: 'Deskripsi produk milik sendiri: Dimension 163×145×201 cm, Weight 166 Kg.',
    confidence: 'TINGGI', verify: 'Mesin 166kg — wajib kargo/truk + asuransi.',
  },
  // 13. Iso Lateral Chest Back SM-2002
  '4267cd01-4338-4c67-9391-cf35297cae74': {
    weightGrams: 182000, lengthCm: 198, widthCm: 137, heightCm: 229,
    source: 'Deskripsi produk milik sendiri: Dimension 198×137×229 cm, Weight 182 Kg.',
    confidence: 'TINGGI', verify: 'Mesin 182kg — wajib kargo/truk + asuransi.',
  },
  // 14. Circular Lat PullDown D610
  '53e7a020-0691-4b33-8827-af0e227f2348': {
    weightGrams: 195000, lengthCm: 193, widthCm: 186, heightCm: 206,
    source: 'Deskripsi produk milik sendiri: Dimension 193×186×206 cm, Weight 195 Kg.',
    confidence: 'TINGGI', verify: 'Mesin 195kg — wajib kargo/truk + asuransi.',
  },
  // 15. Abdominal Crunch D604
  'b35b541d-c070-45be-bd37-bb813cdba7a1': {
    weightGrams: 121000, lengthCm: 138, widthCm: 178, heightCm: 172,
    source: 'Deskripsi produk milik sendiri: Dimension 138×178×172 cm, Weight 121 Kg.',
    confidence: 'TINGGI', verify: 'Mesin 121kg — wajib kargo/truk + asuransi.',
  },
  // 16. Dumbell Set 22,5-40kg + Rack (8 pasang = 500kg + rak 68kg)
  '599ed253-274f-4f0b-b671-3394ed946515': {
    weightGrams: 568000, lengthCm: 248, widthCm: 81, heightCm: 72,
    source: 'Hitung dari deskripsi sendiri: 8 pasang dumbbell 22,5–40kg (total 500kg) + rak 68kg. Dimensi rak 72×248×81.',
    confidence: 'TINGGI', verify: 'Total 568kg MULTI-KOLI (rak + tiap pasang dumbbell) — wajib kargo/truk.',
  },
  // 17. Rubber Flooring Springkle 60x120cm 8mm (harga PER METER)
  '5e4734f6-e697-4ba6-8c2f-b158fac6c650': {
    weightGrams: 9000, lengthCm: 120, widthCm: 60, heightCm: 8,
    source: 'Referensi pabrikan (living.fit AS): rubber 8mm = 1,9 lbs/sqft (±9,3 kg/m²).',
    confidence: 'SEDANG', verify: 'Harga PER METER — pastikan unit jual (per m²/lembar?) + timbang 1 unit aktual.',
  },
  // 18. Rubber Flooring Springkle 60x120cm 6mm (harga PER METER)
  '77379df1-f4f0-42e5-8659-59d1c29584ef': {
    weightGrams: 7000, lengthCm: 120, widthCm: 60, heightCm: 6,
    source: 'Referensi pabrikan (Rymar/Greatmats AS): rubber 6mm = 1,3–1,6 lbs/sqft (±6,3–7,8 kg/m²).',
    confidence: 'SEDANG', verify: 'Harga PER METER — pastikan unit jual (per m²/lembar?) + timbang 1 unit aktual.',
  },
  // 19. Rubber Flooring Outdoor 60x80cm 25mm (harga PER LEMBAR)
  'fdf0ede9-d50e-46de-81af-44c2c2d991fe': {
    weightGrams: 10000, lengthCm: 80, widthCm: 60, heightCm: 25,
    source: 'Referensi pabrikan (Bench Fitness): composite rubber tile 25mm = 21,2 kg/m² × 0,48 m² (±10,2 kg/lembar).',
    confidence: 'SEDANG', verify: 'WAJIB timbang 1 lembar aktual.',
  },
  // 20. Rubber Flooring Bintik Roll 1x10m 8mm (harga PER ROLL)
  '359a8b3a-2b2f-4191-a1ba-b0414b1e2af3': {
    weightGrams: 90000, lengthCm: 105, widthCm: 45, heightCm: 45,
    source: 'Sama dgn batch 1 no 1: referensi Greatmats 8mm ±9 kg/m² × 10 m².',
    confidence: 'SEDANG', verify: 'WAJIB timbang ulang 1 roll sebelum upload.',
  },
  // --- BATCH 3 (produk no 21-30, semua Rubber Flooring) ---
  // 21. Rubber Tile 50x50cm 40mm (harga PER METER)
  '07e63148-4c93-4c16-8844-d0a21500f881': {
    weightGrams: 33000, lengthCm: 55, widthCm: 55, heightCm: 18,
    source: 'Densitas composite tile ±833 kg/m³ (ref MF Floor): 40mm ≈ 33 kg/m².',
    confidence: 'SEDANG', verify: 'Timbang 4 keping (1 m²) aktual + pastikan unit jual.',
  },
  // 22. Rubber Puzzle Pyramid 50x50cm 10mm (harga PER METER)
  '744e0f27-5cc9-48ed-9494-848836f895ac': {
    weightGrams: 10000, lengthCm: 55, widthCm: 55, heightCm: 8,
    source: 'Densitas rubber ±1050 kg/m³: 10mm ≈ 10,5 kg/m².',
    confidence: 'SEDANG', verify: 'Timbang 4 keping (1 m²) aktual + pastikan unit jual.',
  },
  // 23. Rubber Pyramid Roll 1x10m 10mm (harga PER ROLL)
  'b5971717-09c3-45f1-8094-c0fa914649c1': {
    weightGrams: 95000, lengthCm: 105, widthCm: 45, heightCm: 45,
    source: 'Basis 10mm ±10,5–11,7 kg/m² (ref living.fit/Greatmats), dikurangi motif pyramid ±15%.',
    confidence: 'SEDANG', verify: 'WAJIB timbang ulang 1 roll sebelum upload.',
  },
  // 24. Rubber Polos Roll 1x10m 10mm (harga PER ROLL)
  '7f15a6ef-3a17-43fe-b633-1dfd23683911': {
    weightGrams: 110000, lengthCm: 105, widthCm: 45, heightCm: 45,
    source: 'Densitas ±1050 kg/m³ + ref living.fit (10mm ≈ 2,4 lbs/sqft): ±11 kg/m² × 10 m².',
    confidence: 'SEDANG', verify: 'WAJIB timbang ulang 1 roll sebelum upload.',
  },
  // 25. Rubber Polos Roll 1x10m 5mm (harga PER ROLL)
  '2ffe3046-8b84-45fe-8f7d-b34a7e3485e2': {
    weightGrams: 60000, lengthCm: 105, widthCm: 35, heightCm: 35,
    source: 'Densitas ±1050 kg/m³ + ref Greatmats 6mm 1,5 lbs/sqft: 5mm ±6 kg/m² × 10 m².',
    confidence: 'SEDANG', verify: 'WAJIB timbang ulang 1 roll sebelum upload.',
  },
  // 26. Rubber Roll 1x10m 10mm import (harga PER ROLL)
  '5dec5234-7775-4671-8f22-175b50c78400': {
    weightGrams: 110000, lengthCm: 105, widthCm: 45, heightCm: 45,
    source: 'Sama dgn no 24: 10mm ±11 kg/m² × 10 m².',
    confidence: 'SEDANG', verify: 'WAJIB timbang ulang 1 roll sebelum upload.',
  },
  // 27. Rubber 50x50cm 20mm import (harga PER METER)
  'ebbc2e0c-bb6f-4f14-98b2-98e774eac9ca': {
    weightGrams: 18000, lengthCm: 55, widthCm: 55, heightCm: 12,
    source: 'Densitas composite ±833–950 kg/m³: 20mm ±17–19 kg/m².',
    confidence: 'SEDANG', verify: 'Timbang 4 keping (1 m²) aktual + pastikan unit jual.',
  },
  // 28. Rubber 100x100cm 10mm import (harga PER METER)
  '8e9791c0-f1c0-4da3-93a0-606b0d873203': {
    weightGrams: 10000, lengthCm: 105, widthCm: 105, heightCm: 5,
    source: 'Densitas ±1050 kg/m³: 10mm ≈ 10,5 kg/m² (1 keping = 1 m²).',
    confidence: 'SEDANG', verify: 'Timbang 1 keping aktual + pastikan unit jual.',
  },
  // 29. Rubber 50x50cm 10mm import (harga PER METER)
  'd58445b9-a0e7-42f2-abe1-154747bc83f1': {
    weightGrams: 10000, lengthCm: 55, widthCm: 55, heightCm: 8,
    source: 'Sama dgn no 22: 10mm ≈ 10,5 kg/m².',
    confidence: 'SEDANG', verify: 'Timbang 4 keping (1 m²) aktual + pastikan unit jual.',
  },
  // 30. Rubber Puzzle 50x50cm 10mm import (harga PER METER)
  'a8617094-580a-405c-a0c9-20abff35557b': {
    weightGrams: 10000, lengthCm: 55, widthCm: 55, heightCm: 8,
    source: 'Sama dgn no 22: 10mm ≈ 10,5 kg/m².',
    confidence: 'SEDANG', verify: 'Timbang 4 keping (1 m²) aktual + pastikan unit jual.',
  },
  // --- BATCH 4 (produk no 31-40, semua Total Fitness OUTDOOR) ---
  // 31. Double Swing Board (ayunan) — berat TIDAK ada sumbernya
  '9fe82925-0b8b-41b6-a81f-4b87461b939c': {
    weightGrams: null, lengthCm: 125, widthCm: 150, heightCm: 85,
    source: 'Dimensi dari deskripsi pemilik. Berat ayunan TIDAK dipublikasikan di katalog distributor.',
    confidence: '-', verify: 'TANYA SUPPLIER berat ayunan (atau timbang). Catatan pemilik: tidak dalam dus, konfirmasi dulu.',
  },
  // 32. Double Children Swings (ayunan anak) — berat TIDAK ada sumbernya
  '60251cf1-160a-4a3b-89a0-f9b1e6235215': {
    weightGrams: null, lengthCm: 145, widthCm: 155, heightCm: 60,
    source: 'Dimensi dari deskripsi pemilik. Berat ayunan TIDAK dipublikasikan di katalog distributor.',
    confidence: '-', verify: 'TANYA SUPPLIER berat ayunan (atau timbang). Catatan pemilik: tidak dalam dus, konfirmasi dulu.',
  },
  // 33. Double Leg Press
  'dcc26bfc-2358-416d-9a74-d783d6a9a6dd': {
    weightGrams: 50000, lengthCm: 180, widthCm: 40, heightCm: 170,
    source: 'Katalog New Quality Group: Weight 50 kg, dims 180×40×170 sama persis.',
    confidence: 'TINGGI', verify: 'Tidak dalam dus — kargo + packing kayu, konfirmasi dulu.',
  },
  // 34. Chest Press 2 Seat — PERHATIAN: deskripsi website keliru (tertulis twister 150×130×130)
  '546cd427-9cf1-4c75-8d9c-13d3fc5a0a23': {
    weightGrams: 50000, lengthCm: 180, widthCm: 70, heightCm: 200,
    source: 'Katalog New Quality Group: Weight 50 kg, dims 180×70×200. Dimensi website (150×130×130) SALAH — copas dari twister.',
    confidence: 'TINGGI', verify: 'PEMILIK: betulkan deskripsi Chest Press di website (saat ini tertulis twister).',
  },
  // 35. Three Position Waist Twister
  '32e8d0c0-7187-429b-8c5c-833e859148de': {
    weightGrams: 50000, lengthCm: 150, widthCm: 130, heightCm: 130,
    source: 'Katalog New Quality Group: Weight 50 kg, dims 150×130×130 sama persis.',
    confidence: 'TINGGI', verify: 'Tidak dalam dus — kargo + packing kayu, konfirmasi dulu.',
  },
  // 36. Warming Arm 4 Circle
  '444b16a4-ee95-4989-ab90-e693c86739f4': {
    weightGrams: 50000, lengthCm: 115, widthCm: 100, heightCm: 140,
    source: 'Katalog New Quality Group: Weight 50 kg, dims 115×100×140 sama persis.',
    confidence: 'TINGGI', verify: 'Tidak dalam dus — kargo + packing kayu, konfirmasi dulu.',
  },
  // 37. Back Massager
  '88d5f7a2-9b7b-4fee-9227-ecbcdfaec83c': {
    weightGrams: 50000, lengthCm: 120, widthCm: 100, heightCm: 150,
    source: 'Katalog New Quality Group: Weight 50 kg, dims 120×100×150 sama persis.',
    confidence: 'TINGGI', verify: 'Tidak dalam dus — kargo + packing kayu, konfirmasi dulu.',
  },
  // 38. Rotor 2 Circle (= B20-3; sudah diriset — tidak ditulis ulang)
  '840a9864-3023-4bdf-b064-882897fbff92': {
    weightGrams: 50000, lengthCm: 100, widthCm: 55, heightCm: 180,
    source: 'Katalog New Quality Group: Weight 50 kg, dims 100×55×180 sama persis.',
    confidence: 'TINGGI', verify: 'Tidak dalam dus — kargo + packing kayu, konfirmasi dulu.',
  },
  // 39. Air Walker
  '39289cb7-4854-4728-a48e-664f64d852fc': {
    weightGrams: 50000, lengthCm: 90, widthCm: 35, heightCm: 130,
    source: 'Katalog New Quality Group: Weight 50 kg, dims 90×35×130 sama persis.',
    confidence: 'TINGGI', verify: 'Tidak dalam dus — kargo + packing kayu, konfirmasi dulu.',
  },
  // 40. Rowing Machine
  '5d82d959-f125-4ad4-af72-44ab89403f68': {
    weightGrams: 50000, lengthCm: 120, widthCm: 90, heightCm: 70,
    source: 'Katalog New Quality Group: Weight 50 kg, dims 120×90×70 sama persis.',
    confidence: 'TINGGI', verify: 'Tidak dalam dus — kargo + packing kayu, konfirmasi dulu.',
  },
  // --- BATCH 5 (produk no 41-50: 4 Total Fitness + 6 Jupiterfit, semua OUTDOOR) ---
  // 41. Double Sit Up Board Total Fitness
  '11bb4f80-8f0f-4b5c-9ded-93250b3a9190': {
    weightGrams: 50000, lengthCm: 160, widthCm: 125, heightCm: 85,
    source: 'Katalog New Quality Group: Weight 50 kg, dims 160×125×85 sama persis.',
    confidence: 'TINGGI', verify: 'Tidak dalam dus — kargo + packing kayu, konfirmasi dulu.',
  },
  // 42. Elliptical Machine Total Fitness
  '34b3d4d0-a804-401a-b8e2-481a6a594963': {
    weightGrams: 50000, lengthCm: 100, widthCm: 55, heightCm: 140,
    source: 'Katalog New Quality Group: Weight 50 kg, dims 100×55×140 sama persis.',
    confidence: 'TINGGI', verify: 'Tidak dalam dus — kargo + packing kayu, konfirmasi dulu.',
  },
  // 43. UpRight Bike Machine Total Fitness
  '8360d89a-1474-4daf-a69f-92a14fbafe37': {
    weightGrams: 50000, lengthCm: 100, widthCm: 52, heightCm: 100,
    source: 'Katalog New Quality Group: Weight 50 kg, dims 100×52×100 sama persis.',
    confidence: 'TINGGI', verify: 'Tidak dalam dus — kargo + packing kayu, konfirmasi dulu.',
  },
  // 44. Horse Rider Machine Total Fitness
  '20c20d4d-1f77-4179-8a80-30ab51f99cc8': {
    weightGrams: 50000, lengthCm: 85, widthCm: 65, heightCm: 115,
    source: 'Katalog New Quality Group: Weight 50 kg, dims 85×65×115 sama persis.',
    confidence: 'TINGGI', verify: 'Tidak dalam dus — kargo + packing kayu, konfirmasi dulu.',
  },
  // 45. Waist & Stepper Jupiterfit (acuan sejenis)
  '0af5ee2a-4c64-4e5a-ac12-a981fce97272': {
    weightGrams: 50000, lengthCm: 120, widthCm: 60, heightCm: 135,
    source: 'ACUAN sejenis: stasiun outdoor pipa galvanis 3mm seukuran (air walker/warming arm) = 50kg (katalog NQ Group).',
    confidence: 'SEDANG', verify: 'Tanya supplier Jupiterfit / timbang untuk pastikan.',
  },
  // 46. Body Pulling Training Jupiterfit — BERAT belum ada sumber
  '8678b57c-16e8-4c5f-859c-595c4f16434a': {
    weightGrams: null, lengthCm: 165, widthCm: 190, heightCm: 195,
    source: 'Dimensi dari deskripsi pemilik. Berat frame pull-up outdoor ini TIDAK ditemukan sumbernya.',
    confidence: '-', verify: 'TANYA SUPPLIER / timbang. Foto produk juga terlalu kecil (146px) — ganti foto.',
  },
  // 47. Horse Rider Machine Jupiterfit (acuan sejenis)
  'edcd2b10-0057-42a0-a097-23641ba3ea7f': {
    weightGrams: 50000, lengthCm: 135, widthCm: 165, heightCm: 55,
    source: 'ACUAN sejenis: horse rider outdoor Total Fitness 50kg (katalog NQ Group).',
    confidence: 'SEDANG', verify: 'Tanya supplier Jupiterfit / timbang untuk pastikan.',
  },
  // 48. 4 Swivel Wheel Jupiterfit (acuan sejenis)
  'bf6deee4-886e-42ef-991b-9f9c22ec9037': {
    weightGrams: 50000, lengthCm: 165, widthCm: 175, heightCm: 55,
    source: 'ACUAN sejenis: stasiun roda tangan outdoor (warming arm 4 circle) 50kg (katalog NQ Group).',
    confidence: 'SEDANG', verify: 'Tanya supplier Jupiterfit / timbang untuk pastikan.',
  },
  // 49. Single Pole Parallel Bars Jupiterfit (acuan parallel bars)
  'fe7ece11-363e-4e69-ad12-246148440f6b': {
    weightGrams: 55000, lengthCm: 195, widthCm: 160, heightCm: 55,
    source: 'ACUAN: parallel bars outdoor 240×77×142cm = 57kg (alatfitnessoutdoor.com).',
    confidence: 'SEDANG', verify: 'Tanya supplier Jupiterfit / timbang untuk pastikan.',
  },
  // 50. Upper Limb Pulling Jupiterfit — BERAT belum ada sumber
  '84d4ab63-f32a-4dd8-bf32-4e0e71fdb40f': {
    weightGrams: null, lengthCm: 100, widthCm: 240, heightCm: 75,
    source: 'Dimensi dari deskripsi pemilik. Berat frame pull outdoor ini TIDAK ditemukan sumbernya.',
    confidence: '-', verify: 'TANYA SUPPLIER / timbang.',
  },
  // --- BATCH 6 (produk no 51-60, semua Jupiterfit OUTDOOR; dimensi cocok dgn katalog Jupiter Fit) ---
  // 51. Hanging Swivel (acuan frame gantung sejenis)
  'e3e23747-71b7-42fd-a29b-dbbe1d395bb2': {
    weightGrams: 60000, lengthCm: 100, widthCm: 240, heightCm: 65,
    source: 'ACUAN: frame outdoor tinggi 240cm sekelas parallel bars (±57kg, alatfitnessoutdoor.com).',
    confidence: 'SEDANG', verify: 'Tanya supplier Jupiterfit / timbang untuk pastikan. Kargo + packing kayu.',
  },
  // 52. Massage Apparatus (acuan back massager)
  '8f443596-cc35-4624-8fb1-6a5742f23019': {
    weightGrams: 50000, lengthCm: 135, widthCm: 150, heightCm: 80,
    source: 'ACUAN sejenis: back massager outdoor 50kg (katalog NQ Group).',
    confidence: 'SEDANG', verify: 'Tanya supplier Jupiterfit / timbang untuk pastikan. Kargo + packing kayu.',
  },
  // 53. Elliptical Machine (acuan elliptical outdoor)
  '69e20464-b393-4296-9d53-58cf6902eaf7': {
    weightGrams: 50000, lengthCm: 145, widthCm: 165, heightCm: 55,
    source: 'ACUAN sejenis: elliptical outdoor Total Fitness 50kg (katalog NQ Group).',
    confidence: 'SEDANG', verify: 'Tanya supplier Jupiterfit / timbang untuk pastikan. Kargo + packing kayu.',
  },
  // 54. Bicycle (acuan upright bike outdoor)
  '3957ed77-a66d-46e3-b559-24ef48b1b297': {
    weightGrams: 50000, lengthCm: 110, widthCm: 50, heightCm: 130,
    source: 'ACUAN sejenis: upright bike outdoor 50kg (katalog NQ Group).',
    confidence: 'SEDANG', verify: 'Tanya supplier Jupiterfit / timbang untuk pastikan. Kargo + packing kayu.',
  },
  // 55. Pressing Leg Rack (acuan stasiun kompak)
  'e56e124a-330b-45eb-a2f9-a8af8c46071c': {
    weightGrams: 50000, lengthCm: 95, widthCm: 125, heightCm: 95,
    source: 'ACUAN sejenis: stasiun outdoor pipa galvanis 3mm seukuran = 50kg (katalog NQ Group).',
    confidence: 'SEDANG', verify: 'Tanya supplier Jupiterfit / timbang untuk pastikan. Kargo + packing kayu.',
  },
  // 56. Rowing Machine (acuan rowing outdoor)
  'ddb31eec-b206-4b06-bd20-fece3e5fd41b': {
    weightGrams: 50000, lengthCm: 110, widthCm: 50, heightCm: 130,
    source: 'ACUAN sejenis: rowing machine outdoor 50kg (katalog NQ Group).',
    confidence: 'SEDANG', verify: 'Tanya supplier / timbang. Foto produk kecil (235px) — ganti foto.',
  },
  // 57. Double Sit up Board (acuan double sit up)
  'e0e7274b-c647-4826-a89c-961d5d9acf07': {
    weightGrams: 50000, lengthCm: 150, widthCm: 165, heightCm: 75,
    source: 'ACUAN sejenis: double sit up outdoor 50kg (katalog NQ Group).',
    confidence: 'SEDANG', verify: 'Tanya supplier Jupiterfit / timbang untuk pastikan. Kargo + packing kayu.',
  },
  // 58. Double Children Press Board (acuan board station)
  '18941150-af25-4a71-a9e6-77ae89c2a3a0': {
    weightGrams: 50000, lengthCm: 195, widthCm: 95, heightCm: 45,
    source: 'ACUAN sejenis: stasiun board outdoor pipa galvanis 3mm = 50kg (katalog NQ Group).',
    confidence: 'SEDANG', verify: 'Tanya supplier Jupiterfit / timbang untuk pastikan. Kargo + packing kayu.',
  },
  // 59. Three Seats Waist Swivel (stasiun TRIPLE besar — acuan dgn margin)
  '977cec7a-9332-44e8-9ae1-12ed223d869e': {
    weightGrams: 60000, lengthCm: 185, widthCm: 185, heightCm: 135,
    source: 'ACUAN: twister 3-seat outdoor sejenis; stasiun besar sekelas 50–65kg.',
    confidence: 'SEDANG', verify: 'WAJIB tanya supplier / timbang (unit triple besar). Kargo + packing kayu.',
  },
  // 60. Double Children Swings (ayunan — sama dgn no 32, BERAT belum ada sumber)
  'a50eb947-a84c-4654-a185-d4a789944bb6': {
    weightGrams: null, lengthCm: 145, widthCm: 155, heightCm: 60,
    source: 'Dimensi dari deskripsi pemilik (sama dgn no 32). Berat ayunan TIDAK dipublikasikan.',
    confidence: '-', verify: 'TANYA SUPPLIER berat ayunan (atau timbang).',
  },
  // --- BATCH 7 (produk no 61-70: 6 Jupiterfit + 4 DHZ commercial) ---
  // 61. Big Swivel Wheel Jupiterfit
  'bd87cf18-e335-4b6b-8507-037ab71eaafc': {
    weightGrams: 50000, lengthCm: 180, widthCm: 95, heightCm: 65,
    source: 'ACUAN sejenis: stasiun roda tangan outdoor 50kg (katalog NQ Group). Dimensi cocok katalog Jupiter Fit.',
    confidence: 'SEDANG', verify: 'Tanya supplier / timbang. Foto kecil (279px) — ganti foto.',
  },
  // 62. Bench For Two (Double Leg Press) Jupiterfit — besi 3.5mm, unit besar
  '803468e4-c7be-49cd-8a23-a72bc3202607': {
    weightGrams: 60000, lengthCm: 210, widthCm: 165, heightCm: 55,
    source: 'ACUAN dgn margin: bench ganda outdoor besi 3.5mm (lebih tebal dari lini 3mm/50kg).',
    confidence: 'SEDANG', verify: 'WAJIB tanya supplier / timbang (unit besar). Kargo + packing kayu.',
  },
  // 63. Air Walker Jupiterfit
  '8ce7b9e3-6d3a-4cb9-bec1-af8695df9903': {
    weightGrams: 50000, lengthCm: 110, widthCm: 140, heightCm: 48,
    source: 'ACUAN sejenis: air walker outdoor 50kg (katalog NQ Group). Dimensi cocok katalog Jupiter Fit.',
    confidence: 'SEDANG', verify: 'Tanya supplier / timbang untuk pastikan. Kargo + packing kayu.',
  },
  // 64. Double Swing Board Jupiterfit (ayunan — BERAT belum ada sumber)
  'd8c79494-2a73-47b6-8033-169601273fb4': {
    weightGrams: null, lengthCm: 125, widthCm: 150, heightCm: 85,
    source: 'Dimensi dari deskripsi pemilik (sama dgn no 31). Berat ayunan TIDAK dipublikasikan.',
    confidence: '-', verify: 'TANYA SUPPLIER berat ayunan (atau timbang).',
  },
  // 65. Lat Pull Down Two Seats Jupiterfit — unit besar 235cm
  'bf849bf7-dc6f-4786-b386-d2744fd269d4': {
    weightGrams: 65000, lengthCm: 235, widthCm: 165, heightCm: 75,
    source: 'ACUAN dgn margin: stasiun ganda outdoor besar, besi 3.5mm (di atas lini 3mm/50kg).',
    confidence: 'SEDANG', verify: 'WAJIB tanya supplier / timbang. Foto terlalu kecil (179px) — ganti foto.',
  },
  // 66. Chest Press Two Seats Jupiterfit — unit besar 234cm
  '156b0f9d-e725-4194-9fa7-e18d16725699': {
    weightGrams: 65000, lengthCm: 234, widthCm: 190, heightCm: 68,
    source: 'ACUAN dgn margin: stasiun ganda outdoor besar, besi 3.5mm (di atas lini 3mm/50kg).',
    confidence: 'SEDANG', verify: 'WAJIB tanya supplier / timbang (unit besar). Kargo + packing kayu.',
  },
  // 67. Circular Lat Pull Down D610 DHZ (sama spek dgn no 14)
  '21779c70-b103-4c16-9c95-96db28357ac0': {
    weightGrams: 195000, lengthCm: 193, widthCm: 186, heightCm: 206,
    source: 'Deskripsi milik sendiri: 193×186×206 cm, 195 kg (kode D610, sama dgn no 14).',
    confidence: 'TINGGI', verify: 'Mesin 195kg — wajib kargo/truk + asuransi.',
  },
  // 68. Abdominal Crunch D-604 DHZ — KONFLIK dgn no 15 (121kg vs 150kg)!
  'cc999734-17a2-4837-b617-80b93c93da61': {
    weightGrams: 150000, lengthCm: 138, widthCm: 178, heightCm: 172,
    source: 'Deskripsi milik sendiri: 138×178×172cm, Berat Alat 150kg (kode D604).',
    confidence: 'TINGGI', verify: 'KONFLIK: produk no 15 (D604, dimensi sama) tertulis 121kg — PEMILIK pastikan yang benar!',
  },
  // 69. Dip Chin Assist U3009 DHZ — berat 88kg, DIMENSI belum ada + varian meragukan
  'f47fface-ea3d-46a4-b8c1-506aaccb1996': {
    weightGrams: 88000, lengthCm: null, widthCm: null, heightCm: null,
    source: 'Berat dari deskripsi sendiri: 88kg. Dimensi TIDAK ADA di deskripsi.',
    confidence: 'TINGGI (berat)', verify: 'Varian U3009D/D-K di pasaran 268kg — 88kg jauh lebih ringan, PASTIKAN varian + ukur dimensi saat packing.',
  },
  // 70. Bicep Curl U3030C DHZ
  'd284471e-02e0-4e22-b50e-6e198c0b20ed': {
    weightGrams: 165000, lengthCm: 128, widthCm: 94, heightCm: 163,
    source: 'Deskripsi milik sendiri: 128×94×163 cm, 165 Kg (stack 65 Kg).',
    confidence: 'TINGGI', verify: 'Mesin 165kg — wajib kargo/truk + asuransi.',
  },
  // --- BATCH 8 (produk no 71-80: set dumbell + elliptical; SEMUA tanpa foto!) ---
  // 71. Hexagonal 1-10kg + Rack (10 pasang = 110kg + rak)
  '69e1b26b-42b1-4f43-b85c-37702552c0f7': {
    weightGrams: 130000, lengthCm: 70, widthCm: 64, heightCm: 150,
    source: 'Total Fitness Official (Tokopedia): set hex 1-10kg + rak segitiga = 130kg, 70×64×150cm.',
    confidence: 'TINGGI', verify: 'Cocokkan dgn barang di gudang.',
  },
  // 72. PVC 20kg (plat 19kg + stik — cocok nama)
  '10452731-646c-4034-b5f5-662f9e446766': {
    weightGrams: 21000, lengthCm: 40, widthCm: 25, heightCm: 15,
    source: 'Hitung isi sendiri: plat 5+6+8=19kg + stik ≈ 20kg. Bhinneka (set TF 20kg): 21kg, dus 40×25×15.',
    confidence: 'TINGGI', verify: 'Foto terisi otomatis dari Sanity.',
  },
  // 73. PVC 40kg (plat 39kg + stik — cocok nama)
  'cb427670-da55-475d-a08f-73fc5b95736e': {
    weightGrams: 40000, lengthCm: null, widthCm: null, heightCm: null,
    source: 'Hitung isi sendiri: plat 24+10+5=39kg + stik ≈ 40kg, cocok nama.',
    confidence: 'TINGGI', verify: 'Ukur dus saat packing.',
  },
  // 74. Plastik 10kg (plat 9kg + stik — cocok nama)
  '04255496-51b2-4c9f-858e-8e1b26dc1086': {
    weightGrams: 10000, lengthCm: null, widthCm: null, heightCm: null,
    source: 'Hitung isi sendiri: plat 4+5=9kg + stik ≈ 10kg, cocok nama.',
    confidence: 'TINGGI', verify: 'Ukur dus saat packing.',
  },
  // 75. Plastik 20kg (plat 19kg + stik — sama isi dgn no 72)
  'e28892b8-2939-430b-b86a-85b36ae5c380': {
    weightGrams: 21000, lengthCm: 40, widthCm: 25, heightCm: 15,
    source: 'Hitung isi sendiri: plat 5+6+8=19kg + stik ≈ 20kg. Bhinneka (set TF 20kg): 21kg, dus 40×25×15.',
    confidence: 'TINGGI', verify: 'Foto terisi otomatis dari Sanity.',
  },
  // 76. Plastik 30kg (plat 29kg + stik — cocok nama)
  '68c69493-d551-4763-a019-9af14587bda8': {
    weightGrams: 30000, lengthCm: null, widthCm: null, heightCm: null,
    source: 'Hitung isi sendiri: plat 5+6+8+10=29kg + stik ≈ 30kg, cocok nama.',
    confidence: 'TINGGI', verify: 'Ukur dus saat packing.',
  },
  // 77. Plastik 40kg — KONFLIK: plat cuma 28kg!
  '22f40d5a-297a-454d-88db-4f9b737b6e01': {
    weightGrams: 30000, lengthCm: null, widthCm: null, heightCm: null,
    source: 'Hitung isi sendiri: plat 6+10+12=28kg + stik ≈ 30kg.',
    confidence: 'SEDANG', verify: 'KONFLIK: nama 40kg tapi isi cuma ±30kg — PEMILIK pastikan!',
  },
  // 78. Rubber 2,5-20kg + Rack (bel 180kg pasti + rak acuan)
  '4043c108-a1ca-4c3f-8df6-cbe121d0943a': {
    weightGrams: 220000, lengthCm: null, widthCm: null, heightCm: null,
    source: 'Bel 180kg dari hitungan deskripsi sendiri. Rak segitiga komersial ACUAN ±40kg.',
    confidence: 'SEDANG', verify: 'Timbang rak untuk pastikan. Kargo/truk.',
  },
  // 79. Rubber 22,5-40kg + Rack (bel 500kg pasti + rak acuan)
  '59947d21-0573-430a-b5db-f78de1e8274f': {
    weightGrams: 575000, lengthCm: null, widthCm: null, heightCm: null,
    source: 'Bel 500kg dari hitungan deskripsi sendiri. Rak 2-tier komersial ACUAN ±75kg (pasaran 72-125kg).',
    confidence: 'SEDANG', verify: 'Timbang rak; kirim via truk, kemungkinan multi-koli.',
  },
  // 80. Elliptical Commercial CME (max user 150kg, elektrik)
  '5aea5fad-a626-4abc-964e-5db17added83': {
    weightGrams: 99000, lengthCm: null, widthCm: null, heightCm: null,
    source: 'ACUAN sekelas: elliptical commercial max-user 150kg (PowerMax EC-1500) GW 99kg.',
    confidence: 'SEDANG', verify: 'Tanya supplier / timbang. Ukur dus saat packing.',
  },
  // 42 = no 84 skrg (Elliptical Machine Total Fitness) dan 53 = no 83 skrg
  // (Elliptical Machine Jupiterfit) — keduanya SUDAH diriset, tidak ditulis ulang.
  // --- BATCH 9 (produk no 81-90: elliptical, aksesoris kecil, 2 DHZ; SEMUA tanpa foto!) ---
  // 81. Elliptical TL-366E (pakai GW 35kg)
  'a1927839-d8f6-42cf-8498-8ab16dec3529': {
    weightGrams: 35000, lengthCm: 115, widthCm: 63, heightCm: 154,
    source: 'Deskripsi milik sendiri: 115×63×154cm, NW/GW 31/35kg (pakai GW untuk ongkir).',
    confidence: 'TINGGI', verify: 'Foto terisi otomatis dari Sanity.',
  },
  // 82. Elliptical TL-8505 (pakai GW 34kg)
  '7727ddca-041c-44d0-a78f-0445a785523e': {
    weightGrams: 34000, lengthCm: 116, widthCm: 49, heightCm: 115,
    source: 'Deskripsi milik sendiri: 116×49×115cm, dus 89×25×52, NW/GW 31/34kg (pakai GW).',
    confidence: 'TINGGI', verify: 'Foto terisi otomatis dari Sanity.',
  },
  // (posisi 83-84 = no 53 & 42 lama, sudah diriset — lihat entri di atas)
  // 85. Ab Wheel Double Wheel (kecil, ringan)
  '957eda5a-3e49-420c-8418-cc91d5408b43': {
    weightGrams: 1000, lengthCm: null, widthCm: null, heightCm: null,
    source: 'ACUAN sejenis: ab wheel double wheel 750g (Speeds) + packing.',
    confidence: 'SEDANG', verify: 'Ukur dus saat packing.',
  },
  // 86. Fanbelt / V-belt (sparepart kecil, ringan)
  '6f555ff5-020a-4e61-9103-f336198266a3': {
    weightGrams: 500, lengthCm: null, widthCm: null, heightCm: null,
    source: 'ACUAN sparepart kecil: v-belt treadmill + packing ±500g.',
    confidence: 'SEDANG', verify: 'Ringan — timbang pasti saat packing.',
  },
  // 87. Figure Trimmer Ab King Magnetic
  'f870e052-38c0-434f-8925-4ed134a516be': {
    weightGrams: 1000, lengthCm: null, widthCm: null, heightCm: null,
    source: 'ACUAN sejenis: magnetic twister 0,76-0,86kg (Amazon/eBay) + packing.',
    confidence: 'SEDANG', verify: 'Ukur dus saat packing.',
  },
  // 88. Figure Trimmer Twister With Rope (diameter 28cm)
  '8bd3e5dd-105f-44f6-b095-4753dc3d4924': {
    weightGrams: 1000, lengthCm: 30, widthCm: 30, heightCm: 4,
    source: 'ACUAN sejenis: twister 12-inch 0,86kg, dus 30×30×4cm (eBay Figure Trimmer).',
    confidence: 'SEDANG', verify: 'Foto terisi otomatis dari Sanity.',
  },
  // 89. Flat Bench U3036 DHZ
  '7e938421-dace-4af8-a0b6-22c65f77a092': {
    weightGrams: 54000, lengthCm: 162, widthCm: 72, heightCm: 81,
    source: 'Deskripsi milik sendiri: 162×72×81cm, 54kg.',
    confidence: 'TINGGI', verify: 'Kargo + packing kayu.',
  },
  // 90. Functional Trainer Evost U1017C DHZ (stack 2×95kg)
  '72fc2b49-3815-4fbc-8ac3-5be34f1bad91': {
    weightGrams: 360000, lengthCm: 156, widthCm: 120, heightCm: 216,
    source: 'Deskripsi milik sendiri: 156×120×216cm, 360kg (stack 95kg × 2).',
    confidence: 'TINGGI', verify: 'Mesin 360kg — wajib truk + asuransi.',
  },
  // --- BATCH 10 (10 produk berikutnya yg belum diriset; SEMUA tanpa foto!) ---
  // B10-1. AB Machine TL-950 (pakai GW 12kg)
  'a993b75c-0998-44cd-8b38-321515319061': {
    weightGrams: 12000, lengthCm: 95, widthCm: 40, heightCm: 95,
    source: 'Deskripsi milik sendiri: 95×40×95cm, NW/GW 11/12kg (pakai GW).',
    confidence: 'TINGGI', verify: 'Foto terisi otomatis dari Sanity.',
  },
  // B10-2. Abdominal Isolator U3073C DHZ (stack 95kg)
  '29012573-15d3-42f4-9d19-6a8a239bd2f3': {
    weightGrams: 235000, lengthCm: 130, widthCm: 89, heightCm: 162,
    source: 'Pabrik DHZ (E3073, dimensi PERSIS SAMA 130×89×162): Weight 235kg.',
    confidence: 'TINGGI', verify: 'Mesin 235kg — wajib kargo/truk + asuransi.',
  },
  // B10-3. Abductor & Adductor U3021C DHZ (stack 92kg)
  '6935f691-175f-46c3-858d-7dcce4fd78e3': {
    weightGrams: 235000, lengthCm: 161, widthCm: 92, heightCm: 163,
    source: 'Deskripsi milik sendiri: 161×92×163cm, 235kg (stack 92kg).',
    confidence: 'TINGGI', verify: 'Mesin 235kg — wajib kargo/truk + asuransi.',
  },
  // B10-4. Adjustable Decline Bench U3037 DHZ
  'd6e0b239-45d8-4a46-86dd-2973b3003ada': {
    weightGrams: 54000, lengthCm: 162, widthCm: 72, heightCm: 81,
    source: 'Deskripsi milik sendiri: 162×72×81cm, 54kg.',
    confidence: 'TINGGI', verify: 'Kargo + packing kayu.',
  },
  // B10-5. Aerobic Step ID-03 Idachi 90cm (3 level)
  '955a01a1-c521-4a38-86d0-b265a0213c16': {
    weightGrams: 6000, lengthCm: 90, widthCm: 34, heightCm: 25,
    source: 'ACUAN dgn margin: step 68cm = 4-5kg (Tokogrosirolahraga/Lazada); ini 90cm lebih besar.',
    confidence: 'SEDANG', verify: 'Barang besar-ringan: volumetrik ±13kg, ukur dus saat packing.',
  },
  // B10-6. Angkle Support Remora M (aksesori kain kecil)
  '07c3808d-fadb-4609-9e89-4e216d9207e8': {
    weightGrams: 300, lengthCm: null, widthCm: null, heightCm: null,
    source: 'ACUAN aksesori kain kecil + packing ±300g.',
    confidence: 'SEDANG', verify: 'Ukur paket saat packing.',
  },
  // B10-7. Angled Leg Press U3056S DHZ
  '72b44954-2e80-48db-b784-330ea8c60fb3': {
    weightGrams: 241000, lengthCm: 217, widthCm: 161, heightCm: 126,
    source: 'Deskripsi milik sendiri: 217×161×126cm, 241kg.',
    confidence: 'TINGGI', verify: 'Mesin 241kg — wajib truk + asuransi.',
  },
  // B10-8. Arm Blaster Bollinger (plat aluminium 30×10cm)
  '2c35b84a-dbc0-47f9-b7d8-165419c82b2b': {
    weightGrams: 500, lengthCm: null, widthCm: null, heightCm: null,
    source: 'HITUNG bahan: plat aluminium 30×10×0,4cm ≈ 325g + tali/busa + packing.',
    confidence: 'SEDANG', verify: 'Ukur dus saat packing.',
  },
  // B10-9. Sauna Suit + Topi Ab King (setelan PVC)
  '2cd52a6e-501a-4258-a9c1-659febf653a9': {
    weightGrams: 500, lengthCm: null, widthCm: null, heightCm: null,
    source: 'ACUAN setelan sauna PVC (atasan+bawahan+topi) + packing ±500g.',
    confidence: 'SEDANG', verify: 'Ukur paket saat packing.',
  },
  // B10-10. Bangku Adjustable B-1500 (160cm, home gym)
  'a792a5b1-f668-4929-87f1-8bbdf2d46779': {
    weightGrams: 22000, lengthCm: 160, widthCm: 41, heightCm: 130,
    source: 'ACUAN bench home seukuran: 11-18kg (eBay/FITS 120-130cm); ini 160cm + rangka kokoh.',
    confidence: 'SEDANG', verify: 'Tanya supplier / timbang. Kargo.',
  },
  // --- BATCH 11 (bench, battle rope, bearing, stopper; SEMUA tanpa foto!) ---
  // B11-1. Bangku Adjustable TL-1200 (pakai GW 44kg + dims kemasan)
  '716b9d69-b08f-483f-a89e-1671f74e8a82': {
    weightGrams: 44000, lengthCm: 132, widthCm: 48, heightCm: 30,
    source: 'Deskripsi milik sendiri: kemasan 132×48×30cm, NW/GW 41/44kg (pakai GW).',
    confidence: 'TINGGI', verify: 'Kargo.',
  },
  // B11-2. Battle Rope 12m 38mm (+ mounting & dynabolt)
  '666b6867-b922-403d-b3c1-7a5080357141': {
    weightGrams: 11000, lengthCm: null, widthCm: null, heightCm: null,
    source: 'ACUAN sejenis: rope 38mm 9m=7,4kg & 15m=12,7kg (Bullrock) → 12m ±10kg + mounting.',
    confidence: 'SEDANG', verify: 'Timbang untuk pastikan. Ukur gulungan saat packing.',
  },
  // B11-3. Battle Rope 15m 38mm (+ mounting & dynabolt)
  '912b3d84-c140-4a68-8f34-00c60c2f02e0': {
    weightGrams: 13000, lengthCm: null, widthCm: null, heightCm: null,
    source: 'ACUAN sejenis: rope 38mm 15m=12,7kg (Bullrock) + mounting & baut.',
    confidence: 'SEDANG', verify: 'Timbang untuk pastikan. Ukur gulungan saat packing.',
  },
  // B11-4. Battle Rope 9m 38mm (+ mounting & dynabolt)
  '26f2a900-1b10-46fd-8fb2-af41378a1c0b': {
    weightGrams: 8000, lengthCm: null, widthCm: null, heightCm: null,
    source: 'ACUAN sejenis: rope 38mm 9m=7,4kg (Bullrock) + mounting & baut.',
    confidence: 'SEDANG', verify: 'Timbang untuk pastikan. Ukur gulungan saat packing.',
  },
  // B11-5. Bearing Smith Machine 30×45×64 (= standar LM30UU)
  'fa79aba3-7c2d-40ab-8a20-0c5e1e6d60c2': {
    weightGrams: 500, lengthCm: null, widthCm: null, heightCm: null,
    source: 'Standar industri LM30UU (ukuran persis sama): 240-370g + packing.',
    confidence: 'SEDANG', verify: 'Harga satuan = per pcs.',
  },
  // B11-6. Bearing Smith Multi 25×40×59 (= standar LM25UU, satuan)
  '77695bb3-8e75-43c9-8cc9-acd2eda6edc8': {
    weightGrams: 300, lengthCm: null, widthCm: null, heightCm: null,
    source: 'Standar industri LM25UU (ukuran persis sama): 206g + packing.',
    confidence: 'TINGGI', verify: 'Harga satuan = per pcs.',
  },
  // B11-7. Bench Press TL-750 (pakai GW 28kg + dims kemasan)
  'b70138dd-217a-4344-8124-c7644cf50196': {
    weightGrams: 28000, lengthCm: 114, widthCm: 47, heightCm: 20,
    source: 'Deskripsi milik sendiri: kemasan 114×47×20cm, NW/GW 26,5/28kg (pakai GW).',
    confidence: 'TINGGI', verify: 'Kargo.',
  },
  // B11-8. Bench Press TL-7705 (pakai GW 30kg + dims kemasan)
  '6a3234e5-7bf8-4efe-a77f-329c69318b21': {
    weightGrams: 30000, lengthCm: 125, widthCm: 45, heightCm: 17,
    source: 'Deskripsi milik sendiri: kemasan 125×45×17cm, NW/GW 27/30kg (pakai GW).',
    confidence: 'TINGGI', verify: 'Kargo.',
  },
  // B11-9. Bola Karet Stopper (OD 5cm, kecil)
  '98d4d947-e413-4ce8-bbd7-7b747690f160': {
    weightGrams: 200, lengthCm: null, widthCm: null, heightCm: null,
    source: 'HITUNG volume: bola karet OD 5cm ≈ 78g + packing.',
    confidence: 'SEDANG', verify: 'Foto terisi otomatis dari Sanity.',
  },
  // B11-10. Bola Stopper Teflon 3,5×4cm (kecil)
  '1803b79d-037e-4796-8448-441a682b52db': {
    weightGrams: 200, lengthCm: null, widthCm: null, heightCm: null,
    source: 'HITUNG volume: teflon 3,5×4cm ≈ 97g + packing.',
    confidence: 'SEDANG', verify: 'Foto terisi otomatis dari Sanity.',
  },
  // --- BATCH 12 (bosu, bumper, DHZ, carabiner, stair climber, handle, dumbell; SEMUA tanpa foto!) ---
  // B12-1. Bosu Balance Ball 58cm (paket 60×50×12)
  '511c4da9-1d80-4fb2-ad8c-5392c845286a': {
    weightGrams: 8000, lengthCm: 60, widthCm: 50, heightCm: 12,
    source: 'ACUAN ukuran+material sama: bosu 58cm PVC, paket 8kg (Svarga).',
    confidence: 'SEDANG', verify: 'Timbang untuk pastikan.',
  },
  // B12-2. Bumper Plate Eco — HARGA PER KG (varian 5-25kg)!
  '9b89b8c5-1942-4da9-bcb8-1cf5de5609dd': {
    weightGrams: 5000, lengthCm: null, widthCm: null, heightCm: null,
    source: 'Varian terkecil 5kg (diameter 45cm standar).',
    confidence: 'TINGGI (varian 5kg)', verify: 'HARGA PER KG — pecah jadi 5 produk/variasi (5/10/15/20/25kg)!',
  },
  // B12-3. Cable Cross Over U3016 DHZ (stack 2×95kg, lebar 4,5m!)
  'edacccae-6ad5-4cbf-a280-c8f341aa9c77': {
    weightGrams: 411000, lengthCm: 450, widthCm: 109, heightCm: 231,
    source: 'Deskripsi milik sendiri: 450×109×231cm, 411kg (stack 95kg × 2).',
    confidence: 'TINGGI', verify: 'Wajib truk + asuransi, kemungkinan multi-koli.',
  },
  // B12-4. Carabiner 7mm (40g)
  '30cb55cb-b501-4427-8e4f-617f1c1ac05b': {
    weightGrams: 100, lengthCm: null, widthCm: null, heightCm: null,
    source: 'Deskripsi milik sendiri: 7×3,4cm, 40g + packing.',
    confidence: 'TINGGI', verify: 'Foto terisi otomatis dari Sanity.',
  },
  // B12-5. Carabiner 8mm (60g)
  'a5cda2d8-27d9-44b4-a65a-347d313761b3': {
    weightGrams: 100, lengthCm: null, widthCm: null, heightCm: null,
    source: 'Deskripsi milik sendiri: 8×3,9cm, 60g + packing.',
    confidence: 'TINGGI', verify: 'Foto terisi otomatis dari Sanity.',
  },
  // B12-6. Chest & Shoulder Press U3084C DHZ (stack 110kg)
  '6c108bdc-296b-4581-bc5c-8667e0d9c856': {
    weightGrams: 256000, lengthCm: 181, widthCm: 146, heightCm: 183,
    source: 'Deskripsi milik sendiri: 181×146×183cm, 256kg (stack 110kg).',
    confidence: 'TINGGI', verify: 'Mesin 256kg — wajib truk + asuransi.',
  },
  // B12-7. Chest Press Y905Z DHZ
  '8de3805d-65dc-46fb-ac61-eba6fa20a481': {
    weightGrams: 162000, lengthCm: 150, widthCm: 120, heightCm: 172,
    source: 'Deskripsi milik sendiri: 150×120×172cm, 162kg.',
    confidence: 'TINGGI', verify: 'Kargo/truk + asuransi.',
  },
  // B12-8. Commercial Stair Climber (pakai GW 255kg + dims kemasan)
  'a10ec798-98fe-4cc2-afbf-5b7511d13b15': {
    weightGrams: 255000, lengthCm: 135, widthCm: 95, heightCm: 130,
    source: 'Deskripsi milik sendiri: kemasan 135×95×130cm, NW/GW 205/255kg (pakai GW).',
    confidence: 'TINGGI', verify: 'Wajib truk + asuransi.',
  },
  // B12-9. Double Handle BM-A238 (1,9kg)
  'adcb6902-6641-41ae-907f-3503a84cb925': {
    weightGrams: 2000, lengthCm: 19, widthCm: 14, heightCm: 12,
    source: 'Deskripsi milik sendiri: 18,5×14×12cm, 1,9kg + packing.',
    confidence: 'TINGGI', verify: 'Foto terisi otomatis dari Sanity.',
  },
  // B12-10. Dumbell Adjustable 12,5kg (tanpa deskripsi!)
  '27d3a4d4-a5a0-4ed4-8c96-3949653f779d': {
    weightGrams: 13000, lengthCm: null, widthCm: null, heightCm: null,
    source: 'Nama produk 12,5kg + packing (sekelas TotalGym: 12,5kg satuan).',
    confidence: 'SEDANG', verify: 'SATUAN atau SEPASANG? Pastikan + ukur dus.',
  },
  // --- BATCH 13 (semua dumbell; SEMUA tanpa foto!) ---
  // B13-1. Adjustable 25kg SATUAN (tanpa deskripsi!)
  '1b28efbb-0c2c-41ef-9301-862b183c780f': {
    weightGrams: 26000, lengthCm: null, widthCm: null, heightCm: null,
    source: 'Nama 25kg + packing. Harga 1,75jt = SATUAN (iReborn 25kg satuan 1,675jt; sepasang 3,25jt).',
    confidence: 'SEDANG', verify: 'Pastikan satuan + ukur dus.',
  },
  // B13-2. Bench TL-1202 (pakai GW 13kg + dims kemasan)
  'd4827b32-d8cf-406a-8853-36598da92f79': {
    weightGrams: 13000, lengthCm: 31, widthCm: 27, heightCm: 123,
    source: 'Deskripsi milik sendiri: kemasan 31×27×123cm, NW/GW 12/13kg (pakai GW).',
    confidence: 'TINGGI', verify: 'Foto terisi otomatis dari Sanity.',
  },
  // B13-3. Hexa Rubber 2,5-40kg — HARGA PER KG!
  'c9415326-fd4d-4bc5-abbf-a75e7249db76': {
    weightGrams: 2500, lengthCm: null, widthCm: null, heightCm: null,
    source: 'Varian terkecil 2,5kg.',
    confidence: 'TINGGI (varian 2,5kg)', verify: 'HARGA PER KG — pecah jadi banyak variasi (2,5-40kg)!',
  },
  // B13-4. Neoprene 1-5kg — HARGA PER KG & PER PC (bukan pasang)!
  '95e1b831-5a97-45b8-a3ea-00d043c25940': {
    weightGrams: 1000, lengthCm: null, widthCm: null, heightCm: null,
    source: 'Varian terkecil 1kg, 1 pc (bukan sepasang).',
    confidence: 'TINGGI (varian 1kg)', verify: 'Buat 5 variasi (1-5kg, per pc)! Timbang tiap varian + packing.',
  },
  // B13-5. Plastik AB King 1-10kg — HARGA PER KG!
  '77207f04-7154-431f-8210-c2cf2acdf45b': {
    weightGrams: 1000, lengthCm: null, widthCm: null, heightCm: null,
    source: 'Varian terkecil 1kg.',
    confidence: 'TINGGI (varian 1kg)', verify: 'HARGA PER KG — pecah 8 variasi (1,2,3,4,5,6,8,10kg)!',
  },
  // B13-6. Set 2,5-25kg + Rack U3077 (bel 275kg + rak 68kg)
  '1ca110fe-fa25-4724-9326-9edf6403a970': {
    weightGrams: 343000, lengthCm: 72, widthCm: 248, heightCm: 81,
    source: 'HITUNG deskripsi: 10 pasang = 275kg + rak 68kg (dims rak 72×248×81).',
    confidence: 'TINGGI', verify: 'Wajib truk + asuransi, multi-koli.',
  },
  // B13-7. Box Iron 20kg (isi pas 20kg + dus)
  '95ce3803-c7f1-49ac-b46b-b931a086672a': {
    weightGrams: 22000, lengthCm: null, widthCm: null, heightCm: null,
    source: 'HITUNG isi: plat 2+5+10=17kg + stik & kunci ≈ 20kg + dus box.',
    confidence: 'SEDANG', verify: 'Timbang 1 box untuk pastikan + ukur dus.',
  },
  // B13-8. Box Iron 50kg (isi pas 50kg + dus)
  'ba31e20e-f95c-4793-801a-b8dc6f2bf81a': {
    weightGrams: 53000, lengthCm: null, widthCm: null, heightCm: null,
    source: 'HITUNG isi: plat 3+7,5+10+20=40,5kg + stik & kunci ≈ 50kg + dus box.',
    confidence: 'SEDANG', verify: 'Timbang 1 box untuk pastikan + ukur dus.',
  },
  // B13-9. Box Iron 58kg (tanpa deskripsi!)
  '2027ceda-1456-4588-a822-c133e5574742': {
    weightGrams: 60000, lengthCm: null, widthCm: null, heightCm: null,
    source: 'Nama 58kg + dus box (acuan: box set 50kg ≈ 55kg aktual).',
    confidence: 'SEDANG', verify: 'Cek isi box + timbang + ukur dus.',
  },
  // B13-10. Chrome 20kg (isi pas 20kg)
  '249a9449-cad7-4aae-90f3-700fc2c6bd8b': {
    weightGrams: 21000, lengthCm: null, widthCm: null, heightCm: null,
    source: 'HITUNG isi: plat 10+5=15kg + 2 stik & kunci ≈ 20kg + packing.',
    confidence: 'TINGGI', verify: 'Ukur dus saat packing.',
  },
  // --- BATCH 14 (chrome, hexa set, boxing, gym ball, DHZ, home gym; SEMUA tanpa foto!) ---
  // B14-1. Chrome 30kg (plat saja sudah 30kg!)
  'a9beb227-0674-47a7-9be3-1287f85cab82': {
    weightGrams: 33000, lengthCm: null, widthCm: null, heightCm: null,
    source: 'HITUNG isi: plat 20+10=30kg + 2 stik & kunci ≈ 33kg.',
    confidence: 'SEDANG', verify: 'Timbang (isi plat sudah 30kg + stik).',
  },
  // B14-2. Chrome 50kg — KONFLIK: isi cuma ±42kg!
  '55f39c53-69d4-4ea1-aee9-c89a9e46ed78': {
    weightGrams: 42000, lengthCm: null, widthCm: null, heightCm: null,
    source: 'HITUNG isi: plat 20+10+5=35kg + stik, konektor & kunci ≈ 42kg.',
    confidence: 'SEDANG', verify: 'KONFLIK: nama 50kg tapi isi ±42kg — PEMILIK pastikan!',
  },
  // B14-3. Hexa Rubber 2,5-25 + Rack (tanpa deskripsi! bel 275kg + rak acuan)
  'ba632497-57ba-4626-a5ac-d4b171a111ba': {
    weightGrams: 343000, lengthCm: null, widthCm: null, heightCm: null,
    source: 'HITUNG bel: 10 pasang 2,5-25kg = 275kg + rak ACUAN ±68kg (sekelas U3077).',
    confidence: 'SEDANG', verify: 'Timbang rak untuk pastikan. Truk, multi-koli.',
  },
  // B14-4. Game Boxing Music (+ sarung tangan)
  'fd098dbd-75d3-47bb-9482-b5c8993511b2': {
    weightGrams: 6500, lengthCm: null, widthCm: null, heightCm: null,
    source: 'ACUAN sejenis: music boxing pad + sarung tangan, paket 6,4kg (Amazon).',
    confidence: 'SEDANG', verify: 'Ukur dus saat packing.',
  },
  // B14-5. Gym Ball 65cm Champs (+ pompa)
  '56a33620-5502-438b-ba87-90dbf1a2af5c': {
    weightGrams: 2000, lengthCm: null, widthCm: null, heightCm: null,
    source: 'ACUAN: gym ball 65cm PVC 1-1,4kg (Svarga/pasarwarga) + pompa + packing.',
    confidence: 'SEDANG', verify: 'Ukur kemasan saat packing.',
  },
  // B14-6. Half Rack E6221 DHZ
  'b91a8315-24e1-4564-8550-dad0e3f36a2c': {
    weightGrams: 255000, lengthCm: 174, widthCm: 180, heightCm: 247,
    source: 'Spesifikasi E6221 (ProSports UAE + marketplace Jakarta): 174×180×247, 255kg — dims sama persis.',
    confidence: 'TINGGI', verify: 'Wajib truk + asuransi.',
  },
  // B14-7. Handle Karet 1 meter (selang grip)
  '834c05ea-41f6-40b7-8cc2-b6e2ce394db5': {
    weightGrams: 500, lengthCm: null, widthCm: null, heightCm: null,
    source: 'ACUAN selang karet 1m + packing ±500g.',
    confidence: 'SEDANG', verify: 'Timbang pasti saat packing.',
  },
  // B14-8. Handle Katrol Pendek 52cm (2,2kg)
  '3864212b-d1ec-42b6-ac96-2d5e13597c76': {
    weightGrams: 2500, lengthCm: null, widthCm: null, heightCm: null,
    source: 'Deskripsi milik sendiri: 52×4cm, 2,2kg + packing.',
    confidence: 'TINGGI', verify: 'Foto terisi otomatis dari Sanity.',
  },
  // B14-9. Hip Thrust U3092 DHZ — KONFLIK DIMENSI!
  'd7182289-7b99-4b72-aa65-c67ace5baf33': {
    weightGrams: 160000, lengthCm: 110, widthCm: 131, heightCm: 188,
    source: 'ACUAN: U3092 net 160kg (Aldowly). Dimensi sendiri 110×131×188 BEDA dgn publikasi 181×124×124!',
    confidence: 'SEDANG', verify: 'KONFLIK DIMENSI — pastikan tipe mesin + timbang! Kargo/truk.',
  },
  // B14-10. Home Gym HG-006 (stack 75kg)
  'acbfe536-1fc1-42fa-bb2e-312f89647d15': {
    weightGrams: 150000, lengthCm: 170, widthCm: 90, heightCm: 210,
    source: 'ACUAN: home gym 1-sisi seukuran (HG-009: 165×95×202) + stack 75kg ≈ 150kg.',
    confidence: 'SEDANG', verify: 'Tanya supplier / timbang. Kargo/truk.',
  },
  // --- BATCH 15 (3 home gym, DHZ row, kanvas, karet, kettlebell, klem; SEMUA tanpa foto!) ---
  // B15-1. Home Gym HG-011 1-sisi (stack 75kg)
  '330972d1-e1eb-440d-94ae-b63635238453': {
    weightGrams: 145000, lengthCm: 200, widthCm: 120, heightCm: 210,
    source: 'ACUAN 1-sisi sekelas: HG-009 (165×95×202) 135kg & HG-014 (230×110×208) 145kg.',
    confidence: 'SEDANG', verify: 'Tanya supplier / timbang. Kargo/truk.',
  },
  // B15-2. Home Gym HG-077 3-sisi + sansak (berat produk 149kg)
  'e619b4f9-2b58-4eeb-bf4a-8b23e22067d6': {
    weightGrams: 149000, lengthCm: 159, widthCm: 237, heightCm: 213,
    source: 'Deskripsi milik sendiri: 159×237×213cm, Product Weight 149kg.',
    confidence: 'TINGGI', verify: 'Stack 150lbs (68kg) vs nama 75kg — beda kecil, abaikan. Kargo/truk.',
  },
  // B15-3. Home Gym HG-055 3-sisi + squat (stack 75kg)
  '92be6029-0dd5-4cbb-a40e-1e3f1408bd6a': {
    weightGrams: 170000, lengthCm: 190, widthCm: 240, heightCm: 230,
    source: 'ACUAN: HG-077 3-sisi 149kg; HG-055 + stasiun squat, sedikit lebih berat.',
    confidence: 'SEDANG', verify: 'Tanya supplier / timbang. Kargo/truk.',
  },
  // B15-4. Incline Level Row U3061 DHZ (74kg) — NAMA ADA TYPO ".jpg"!
  '4c87c306-966e-4097-b04f-3cd594795df9': {
    weightGrams: 74000, lengthCm: 185, widthCm: 79, heightCm: 119,
    source: 'Deskripsi milik sendiri: 185×79×119cm, 74kg.',
    confidence: 'TINGGI', verify: 'BETULKAN NAMA: "U3061.jpg" → "U3061"! Kargo.',
  },
  // B15-5. Kanvas Spinning (2 varian: 35g & 65g, satuan)
  'f2778b9d-41ae-4967-9562-ad39091227b3': {
    weightGrams: 200, lengthCm: null, widthCm: null, heightCm: null,
    source: 'Deskripsi sendiri: ID 90N 35g / ID 92N 65g + packing (pakai varian terberat).',
    confidence: 'TINGGI', verify: '2 varian (90N/92N) — buat variasi!',
  },
  // B15-6. Karet Pembatas Smith (7g)
  '1bd17292-986b-46be-9100-d1c44381f233': {
    weightGrams: 100, lengthCm: null, widthCm: null, heightCm: null,
    source: 'Deskripsi milik sendiri: 7g + packing.',
    confidence: 'TINGGI', verify: 'Foto terisi otomatis dari Sanity.',
  },
  // B15-7. Rubber Mounting Ø6,6cm (satuan)
  '57950de5-85f3-4de9-978c-7f3fc0870ec7': {
    weightGrams: 200, lengthCm: null, widthCm: null, heightCm: null,
    source: 'HITUNG volume: karet Ø6,6×1,9cm minus lubang ≈ 68g + packing.',
    confidence: 'SEDANG', verify: 'Harga satuan = per pcs.',
  },
  // B15-8. Karet Yoga 20×6,5cm (satuan)
  '26cd189a-78c8-4dba-a681-312b56d569d3': {
    weightGrams: 200, lengthCm: null, widthCm: null, heightCm: null,
    source: 'HITUNG volume: karet 20×6,5×0,8cm ≈ 110g + packing.',
    confidence: 'SEDANG', verify: 'Harga satuan = per pcs.',
  },
  // B15-9. Kettlebell Neoprene — HARGA PER KG!
  '1393ef85-631f-4447-8572-9475c2904f67': {
    weightGrams: 2000, lengthCm: null, widthCm: null, heightCm: null,
    source: 'Varian terkecil 2kg.',
    confidence: 'TINGGI (varian 2kg)', verify: 'HARGA PER KG — pecah 6 variasi (2,4,6,8,10,12kg)!',
  },
  // B15-10. Klem Sling WH-1 (pen 1,5cm, kecil)
  'cdb9a9de-6ec7-4cc0-9e91-184e689a2827': {
    weightGrams: 100, lengthCm: null, widthCm: null, heightCm: null,
    source: 'ACUAN sparepart besi kecil + packing ±100g.',
    confidence: 'SEDANG', verify: 'Foto terisi otomatis dari Sanity.',
  },
  // --- BATCH 16 (5 klem, lat bar, 4 mesin DHZ; SEMUA tanpa foto!) ---
  // B16-1. Klem WH-2 chrome 7cm
  '182e41e0-11d2-47e7-b99f-327efc219b73': {
    weightGrams: 200, lengthCm: null, widthCm: null, heightCm: null,
    source: 'HITUNG volume: chrome Ø1,9×7cm ≈ 155g (minus lubang) + packing.',
    confidence: 'SEDANG', verify: 'Foto terisi otomatis dari Sanity.',
  },
  // B16-2. Klem WH-3 Halus chrome 7cm
  'b3dc82be-c8ab-4ad0-bb13-52d44b9579a0': {
    weightGrams: 200, lengthCm: null, widthCm: null, heightCm: null,
    source: 'HITUNG volume: chrome Ø×7cm sekelas WH-2 ≈ 150g + packing.',
    confidence: 'SEDANG', verify: 'Foto terisi otomatis dari Sanity.',
  },
  // B16-3. Klem WH-3 Kasar chrome 7cm
  '74f1ac8a-0199-40fc-ad8b-6e16561f9231': {
    weightGrams: 200, lengthCm: null, widthCm: null, heightCm: null,
    source: 'HITUNG volume: chrome Ø×7cm sekelas WH-2 ≈ 150g + packing.',
    confidence: 'SEDANG', verify: 'Foto terisi otomatis dari Sanity.',
  },
  // B16-4. Klem U Pengait (10g)
  'b81a0405-e33a-4aa0-b33a-8ff75666b15d': {
    weightGrams: 100, lengthCm: null, widthCm: null, heightCm: null,
    source: 'Deskripsi milik sendiri: 10g + packing.',
    confidence: 'TINGGI', verify: 'Foto terisi otomatis dari Sanity.',
  },
  // B16-5. Segel D 6mm/8mm (2 ukuran!)
  '271a2823-30fc-41a6-b5cd-6c2062d2d8ca': {
    weightGrams: 100, lengthCm: null, widthCm: null, heightCm: null,
    source: 'Standar industri: D-shackle 6mm=25g, 8mm=59g (Harken/steelropes24) + packing.',
    confidence: 'TINGGI', verify: '2 ukuran (6mm/8mm) — buat variasi!',
  },
  // B16-6. Lat & Pulley U3085C DHZ (stack 110kg)
  '190bc7c0-0dc9-4d4e-89bb-16aca25f669a': {
    weightGrams: 244000, lengthCm: 197, widthCm: 135, heightCm: 224,
    source: 'Deskripsi milik sendiri: 197×135×224cm, 244kg (stack 110kg).',
    confidence: 'TINGGI', verify: 'Wajib truk + asuransi.',
  },
  // B16-7. Lat Bar BM-A222 70cm (4,4kg)
  'eee2a1c2-f98f-4d76-b07e-88f357c5260d': {
    weightGrams: 5000, lengthCm: 70, widthCm: 16, heightCm: null,
    source: 'Deskripsi milik sendiri: 70×16cm, 4,4kg + packing.',
    confidence: 'TINGGI', verify: 'Ukur dus saat packing.',
  },
  // B16-8. Lat Pull U3012C DHZ (stack 110kg)
  '4b57a800-4c2e-485e-b469-06af57c02acb': {
    weightGrams: 235000, lengthCm: 193, widthCm: 121, heightCm: 234,
    source: 'Deskripsi milik sendiri: 193×121×234cm, 235kg (stack 110kg).',
    confidence: 'TINGGI', verify: 'Wajib truk + asuransi.',
  },
  // B16-9. Leg Ext & Curl U3086C DHZ (stack 110kg)
  '3ac12b30-56f9-4f66-904a-e6ed54a9ca01': {
    weightGrams: 255000, lengthCm: 144, widthCm: 102, heightCm: 163,
    source: 'Deskripsi milik sendiri: 144×102×163cm, 255kg (stack 110kg).',
    confidence: 'TINGGI', verify: 'Wajib truk + asuransi.',
  },
  // B16-10. Leg Extention U3002 DHZ (stack 110kg)
  '3cc6106f-ae2c-4b47-8dae-1d5dc91f5a39': {
    weightGrams: 230000, lengthCm: 144, widthCm: 103, heightCm: 163,
    source: 'Deskripsi milik sendiri: 144×103×163cm, 230kg (stack 110kg).',
    confidence: 'TINGGI', verify: 'Wajib truk + asuransi.',
  },
  // --- BATCH 17 (3 DHZ, bike CMB, 2 matras, 2 med ball, multi bar, bench; SEMUA tanpa foto!) ---
  // B17-1. Leg Press U3003C DHZ (stack 109kg)
  '0924f9e7-1d82-4496-8755-e360ce5cd5cf': {
    weightGrams: 250000, lengthCm: 209, widthCm: 104, heightCm: 163,
    source: 'Deskripsi milik sendiri: 209×104×163cm, 250kg (stack 109kg).',
    confidence: 'TINGGI', verify: 'Wajib truk + asuransi.',
  },
  // B17-2. Long Pull U3033C DHZ (stack 110kg)
  '06e67b7b-3b44-4832-9864-e1143a4224e5': {
    weightGrams: 215000, lengthCm: 180, widthCm: 133, heightCm: 204,
    source: 'Deskripsi milik sendiri: 180×133×204cm, 215kg (stack 110kg).',
    confidence: 'TINGGI', verify: 'Wajib truk + asuransi.',
  },
  // B17-3. Low Row Y925Z DHZ
  '60f1258a-a130-4f3e-ad6c-db0e251a46a9': {
    weightGrams: 190000, lengthCm: 129, widthCm: 157, heightCm: 163,
    source: 'Deskripsi milik sendiri: 129×157×163cm, 190kg.',
    confidence: 'TINGGI', verify: 'Kargo/truk + asuransi.',
  },
  // B17-4. Magnetic Bike CMB (pakai GW 59kg)
  'e9e8dec6-136a-419f-a6e0-d5aa7ddd77a4': {
    weightGrams: 59000, lengthCm: 118, widthCm: 63, heightCm: 148,
    source: 'Deskripsi milik sendiri: 118×63×148cm, NW/GW 50/59kg (pakai GW).',
    confidence: 'TINGGI', verify: 'Kargo + packing kayu.',
  },
  // B17-5. Matras Lokal 50×100×2 (spon rebonit)
  '0d9a7e0b-3a2e-454f-a294-e7777542ffe6': {
    weightGrams: 2000, lengthCm: 50, widthCm: 100, heightCm: 2,
    source: 'HITUNG skala: matras rebonit 200×100×6 = 14kg (TSO) → 50×100×2 ≈ 1,2kg + packing.',
    confidence: 'SEDANG', verify: 'Volumetrik darat ±2,5kg — konfirmasi dus.',
  },
  // B17-6. Matras Champs — KONFLIK TEBAL (nama 6mm vs deskripsi 8mm)!
  'd098cd9b-de52-4c9f-8180-c8d803d7fd68': {
    weightGrams: 1000, lengthCm: null, widthCm: null, heightCm: null,
    source: 'ACUAN: matras NBR 183×61 (8-10mm) = 700-840g (Speeds/Olympus) + packing.',
    confidence: 'SEDANG', verify: 'KONFLIK: nama 6mm vs deskripsi 8mm — PEMILIK pastikan! Ukur gulungan.',
  },
  // B17-7. Medicine Ball 2kg
  '6b6ed125-0707-4611-a47b-91dfd8d489d1': {
    weightGrams: 2500, lengthCm: null, widthCm: null, heightCm: null,
    source: 'Nama produk 2kg + packing.',
    confidence: 'TINGGI', verify: 'Ukur dus saat packing.',
  },
  // B17-8. Medicine Ball 8kg
  'c87b2ab0-52c7-46cf-bafa-34b0c89a0c91': {
    weightGrams: 8500, lengthCm: null, widthCm: null, heightCm: null,
    source: 'Nama produk 8kg + packing.',
    confidence: 'TINGGI', verify: 'Ukur dus saat packing.',
  },
  // B17-9. Multi Bar BM-A246 (3,8kg)
  '7f7d7f9d-94d5-40e8-830b-52a12b547767': {
    weightGrams: 4000, lengthCm: 40, widthCm: 23, heightCm: 24,
    source: 'Deskripsi milik sendiri: 40×23×23,5cm, 3,8kg + packing.',
    confidence: 'TINGGI', verify: 'Foto terisi otomatis dari Sanity.',
  },
  // B17-10. Bench U3038 DHZ
  'bb394e8a-10ca-4ea6-9314-4a2accea4bd1': {
    weightGrams: 54000, lengthCm: 162, widthCm: 72, heightCm: 81,
    source: 'Deskripsi milik sendiri: 162×72×81cm, 54kg.',
    confidence: 'TINGGI', verify: 'Kargo + packing kayu.',
  },
  // --- BATCH 18 (2 multigym TL-026, TL-022, 3 bench DHZ, band, pec delt, pegas, mag grip; SEMUA tanpa foto!) ---
  // B18-1. MultiGym TL-026 stack BESI (pakai GW 460kg!)
  '93a5847b-c7de-47b0-bfbd-0e5070dba70e': {
    weightGrams: 460000, lengthCm: 202, widthCm: 205, heightCm: 222,
    source: 'Deskripsi milik sendiri: 202×205×222cm, NW/GW 408/460kg (pakai GW).',
    confidence: 'TINGGI', verify: 'Wajib truk + asuransi, multi-koli.',
  },
  // B18-2. MultiGym TL-026 stack PLATIK (pakai GW 460kg)
  '00831b25-7913-4f73-9ae5-b8c07b9c212c': {
    weightGrams: 460000, lengthCm: 202, widthCm: 205, heightCm: 222,
    source: 'Deskripsi milik sendiri: 202×205×222cm, NW/GW 408/460kg (pakai GW).',
    confidence: 'TINGGI', verify: 'Bobot SAMA PERSIS dgn versi besi — pastikan benar. Truk + multi-koli.',
  },
  // B18-3. MultiGym TL-022 (5 koli, total GW 189kg)
  'cac6a891-271c-487b-b4c3-c02e8098fcf7': {
    weightGrams: 189000, lengthCm: 136, widthCm: 152, heightCm: 209,
    source: 'Ardiangym: TL-022 = 5 koli, GW 29+36+42+40+42 = 189kg. Dims produk sendiri 136×152×209.',
    confidence: 'TINGGI', verify: '5 koli — wajib kargo + asuransi.',
  },
  // B18-4. Olympic Decline U3041 DHZ
  '260b9150-9336-49e2-a4b2-45426fb3fe79': {
    weightGrams: 83000, lengthCm: 206, widthCm: 178, heightCm: 109,
    source: 'Deskripsi milik sendiri: 206×178×109cm, 83kg.',
    confidence: 'TINGGI', verify: 'Kargo + packing kayu.',
  },
  // B18-5. Olympic Flat U3043 DHZ
  '6272e1c8-3f63-4a83-85f6-95da1bf5f614': {
    weightGrams: 66000, lengthCm: 173, widthCm: 178, heightCm: 122,
    source: 'Deskripsi milik sendiri: 173×178×122cm, 66kg.',
    confidence: 'TINGGI', verify: 'Kargo + packing kayu.',
  },
  // B18-6. Olympic Incline U3042 DHZ
  '99ac186e-a7ae-4ea5-b74f-ff797f1115a9': {
    weightGrams: 87000, lengthCm: 201, widthCm: 178, heightCm: 109,
    source: 'Deskripsi milik sendiri: 201×178×109cm, 87kg.',
    confidence: 'TINGGI', verify: 'Kargo + packing kayu.',
  },
  // B18-7. Pall Rope Resistance Band (deskripsi minim!)
  '7116bcea-a18c-4346-8235-c1b5ce70be61': {
    weightGrams: 1000, lengthCm: null, widthCm: null, heightCm: null,
    source: 'ACUAN: resistance band satuan 0,1-2,9kg / set 3pcs 1,2kg (Svarga).',
    confidence: 'SEDANG', verify: 'CEK ISI: satuan atau set? Timbang + ukur.',
  },
  // B18-8. Pec Delt U3007C DHZ (stack 110kg)
  '5958cfe5-28ca-48ec-b03d-b0caca30d54e': {
    weightGrams: 249000, lengthCm: 124, widthCm: 99, heightCm: 211,
    source: 'Deskripsi milik sendiri: 124×99×211cm, 249kg (stack 110kg).',
    confidence: 'TINGGI', verify: 'Wajib truk + asuransi.',
  },
  // B18-9. Per Pegas 100g (satuan)
  '1a119788-687a-4a21-8cb3-bb82e0eb6284': {
    weightGrams: 200, lengthCm: null, widthCm: null, heightCm: null,
    source: 'Deskripsi milik sendiri: 100g + packing.',
    confidence: 'TINGGI', verify: 'Harga satuan = per pcs.',
  },
  // B18-10. MAG Grip Set 5pcs BM-A255
  '6c38dbb1-d9ab-448b-994f-1bd18a99913c': {
    weightGrams: 21000, lengthCm: null, widthCm: null, heightCm: null,
    source: 'ACUAN: mag grip set 5pcs = 20kg (DMS/GymGear) + packing.',
    confidence: 'SEDANG', verify: 'Timbang untuk pastikan + ukur dus.',
  },
  // --- BATCH 19 (3 strap, leg curl DHZ, pullup bar, 3 pulley, bike CMR, roda elliptical; SEMUA tanpa foto!) ---
  // B19-1. Strap Gymex SG-01 (100g)
  '266e8743-0e6d-4844-ac42-216eb4b720c5': {
    weightGrams: 200, lengthCm: null, widthCm: null, heightCm: null,
    source: 'Deskripsi milik sendiri: 57×5cm nylon, 100g + packing.',
    confidence: 'TINGGI', verify: 'Foto terisi otomatis dari Sanity.',
  },
  // B19-2. Strap Gym Lifting 35cm
  '600785c8-773b-44a3-9528-bec156e09dc8': {
    weightGrams: 200, lengthCm: null, widthCm: null, heightCm: null,
    source: 'ACUAN lifting strap sepasang + packing ±200g.',
    confidence: 'SEDANG', verify: 'Foto terisi otomatis dari Sanity.',
  },
  // B19-3. Strap Valeo Import 32cm
  '63def66f-4772-4b47-9a15-d313bd106054': {
    weightGrams: 200, lengthCm: null, widthCm: null, heightCm: null,
    source: 'ACUAN lifting strap + buckle stainless + packing ±200g.',
    confidence: 'SEDANG', verify: 'Foto terisi otomatis dari Sanity.',
  },
  // B19-4. Prone Leg Curl U3001C DHZ (stack 110kg)
  '2576776e-3917-4635-96f0-b24bee31de28': {
    weightGrams: 230000, lengthCm: 144, widthCm: 103, heightCm: 163,
    source: 'Deskripsi milik sendiri: 144×103×163cm, 230kg (stack 110kg).',
    confidence: 'TINGGI', verify: 'Wajib truk + asuransi.',
  },
  // B19-5. Pull Up Bar BM-50 (wall mount besi solid)
  '0a0cd928-d334-4a10-87d0-a4a3f5a4ba99': {
    weightGrams: 8000, lengthCm: null, widthCm: null, heightCm: null,
    source: 'ACUAN: wall mount besi solid + dynabolt (sekelas Indofitnes BM-50; versi multifungsi 15kg).',
    confidence: 'SEDANG', verify: 'Timbang + ukur dus (produk sama dgn Indofitnes BM-50).',
  },
  // B19-6. Pulley Aluminium Ø9cm
  '15ea2053-f5d7-4626-b8bb-a40c2cd8e3ec': {
    weightGrams: 500, lengthCm: null, widthCm: null, heightCm: null,
    source: 'HITUNG volume: aluminium Ø9cm ≈ 340g (minus lubang) + packing.',
    confidence: 'SEDANG', verify: 'Foto terisi otomatis dari Sanity.',
  },
  // B19-7. Pulley Plastik Ø12cm
  '97f360f2-104c-4560-b3ed-d4f5fd1fae4b': {
    weightGrams: 500, lengthCm: null, widthCm: null, heightCm: null,
    source: 'HITUNG volume: plastik tebal Ø12cm ≈ 200g + packing.',
    confidence: 'SEDANG', verify: 'Foto terisi otomatis dari Sanity.',
  },
  // B19-8. Pulley Teflon Ø9cm
  'f6e8e1d6-72aa-40d1-a483-f69eab653c13': {
    weightGrams: 500, lengthCm: null, widthCm: null, heightCm: null,
    source: 'HITUNG volume: teflon Ø9cm ≈ 280g (minus lubang) + packing.',
    confidence: 'SEDANG', verify: 'Foto terisi otomatis dari Sanity.',
  },
  // B19-9. Recumbent Bike CMR (pakai GW 74kg)
  'db9b0695-f571-45f2-9af6-5a4194bc1a5e': {
    weightGrams: 74000, lengthCm: 158, widthCm: 61, heightCm: 141,
    source: 'Deskripsi milik sendiri: 158×61×141cm, NW/GW 60/74kg (pakai GW).',
    confidence: 'TINGGI', verify: 'Kargo + packing kayu.',
  },
  // B19-10. Roda Elliptical Ø7cm teflon+bearing (satuan)
  '857a0257-57a2-4bb5-9f87-47bfe8a76c31': {
    weightGrams: 500, lengthCm: null, widthCm: null, heightCm: null,
    source: 'HITUNG volume: teflon Ø7×5cm + bearing besi ≈ 320g + packing.',
    confidence: 'SEDANG', verify: 'Harga satuan = per pcs.',
  },
  // --- BATCH 20 (roda elliptical, torso DHZ, rotor TF, flooring, rubber plate; SEMUA tanpa foto!) ---
  // B20-1. Roda Roll Elliptical (115g, satuan)
  '56bcb687-6ce3-4ad4-a512-14109e0fb035': {
    weightGrams: 200, lengthCm: null, widthCm: null, heightCm: null,
    source: 'Deskripsi milik sendiri: teflon 6,5×3cm, 115g + packing.',
    confidence: 'TINGGI', verify: 'Harga satuan = per pcs.',
  },
  // B20-2. Rotary Torso U3018C DHZ (stack 65kg)
  '7c95e6c0-99f0-4143-8cca-031cbf4c9e1b': {
    weightGrams: 169000, lengthCm: 110, widthCm: 112, heightCm: 163,
    source: 'Deskripsi milik sendiri: 110×112×163cm, 169kg (stack 65kg).',
    confidence: 'TINGGI', verify: 'Kargo/truk + asuransi.',
  },
  // (B20-3 = no 38 lama, sudah diriset — lihat entri di atas)
  // B20-4. Flooring Pyramid 50×50 10mm (3,5kg/pc, satuan)
  '0dd58219-d8a1-4c39-a65d-1e9117563ea9': {
    weightGrams: 4000, lengthCm: 50, widthCm: 50, heightCm: 1,
    source: 'HITUNG deskripsi: 14kg/m² ÷ 4pcs = 3,5kg/pc + packing.',
    confidence: 'TINGGI', verify: 'Harga satuan = per lembar.',
  },
  // B20-5. Flooring Tile 50×50 15mm (per lembar)
  'ebeaa3c9-7b86-48e8-b668-b34587195559': {
    weightGrams: 3500, lengthCm: 50, widthCm: 50, heightCm: 1.5,
    source: 'ACUAN: rubber tile 50×50×15mm = 3,3kg/lembar (Granuflex) + packing.',
    confidence: 'SEDANG', verify: 'Timbang 1 lembar untuk pastikan.',
  },
  // B20-6. Flooring Tile 50×50 20mm (4kg/pc)
  '22381ea8-cc7c-482d-bc8d-d5d7670e2896': {
    weightGrams: 4000, lengthCm: 50, widthCm: 50, heightCm: 2,
    source: 'Deskripsi milik sendiri: EPDM solid 4kg/pc + wrap.',
    confidence: 'TINGGI', verify: 'Foto terisi otomatis dari Sanity.',
  },
  // B20-7. Rubber Plate TF — HARGA PER KG!
  'd305d9ff-fafe-4260-846b-b3569cc34f11': {
    weightGrams: 2500, lengthCm: null, widthCm: null, heightCm: null,
    source: 'Varian terkecil 2,5kg (lubang 5cm).',
    confidence: 'TINGGI (varian 2,5kg)', verify: 'HARGA PER KG — pecah 5 variasi (2,5/5/10/15/20kg)!',
  },
  // B20-8. Rubber Plate Basic 3cm — HARGA PER KG!
  '7a9dfbef-edf0-40e6-9347-0456591308fc': {
    weightGrams: 1500, lengthCm: null, widthCm: null, heightCm: null,
    source: 'Varian terkecil 1,25kg + packing (lubang 3cm).',
    confidence: 'TINGGI (varian 1,25kg)', verify: 'HARGA PER KG — pecah 6 variasi (1,25–20kg)!',
  },
  // B20-9. Rubber Plate Basic 5cm — HARGA PER KG!
  '9fe4686a-f2f8-401f-a88c-4315e25b9a7a': {
    weightGrams: 2500, lengthCm: null, widthCm: null, heightCm: null,
    source: 'Varian terkecil 2,5kg (lubang Olympic 5cm).',
    confidence: 'TINGGI (varian 2,5kg)', verify: 'HARGA PER KG — pecah 5 variasi (2,5–20kg)!',
  },
  // B20-10. Rubber Plate Elite 10kg
  'dbe631bc-5556-4e31-920c-50989022096b': {
    weightGrams: 10500, lengthCm: null, widthCm: null, heightCm: null,
    source: 'Nama produk 10kg + packing.',
    confidence: 'TINGGI', verify: 'Ukur dus saat packing.',
  },
  // --- BATCH 21 (4 plate elite, running belt, sabuk, preacher DHZ, 3 sepeda; SEMUA tanpa foto!) ---
  // B21-1. Rubber Plate Elite 15kg
  '0dbeb61a-dece-401b-9f71-a27105485cf3': {
    weightGrams: 15500, lengthCm: null, widthCm: null, heightCm: null,
    source: 'Nama produk 15kg + packing.',
    confidence: 'TINGGI', verify: 'Ukur dus saat packing.',
  },
  // B21-2. Rubber Plate Elite 2,5kg
  '0f8b8022-ae0b-472b-8680-b0bd4c8d79e3': {
    weightGrams: 3000, lengthCm: null, widthCm: null, heightCm: null,
    source: 'Nama produk 2,5kg + packing.',
    confidence: 'TINGGI', verify: 'Ukur dus saat packing.',
  },
  // B21-3. Rubber Plate Elite 20kg
  'c7f2fbdd-805a-4959-ae98-d7179aeb53a2': {
    weightGrams: 20500, lengthCm: null, widthCm: null, heightCm: null,
    source: 'Nama produk 20kg + packing.',
    confidence: 'TINGGI', verify: 'Ukur dus saat packing.',
  },
  // B21-4. Rubber Plate Elite 5kg
  '7a9d986e-7199-4b83-bb1f-a1339811583d': {
    weightGrams: 5500, lengthCm: null, widthCm: null, heightCm: null,
    source: 'Nama produk 5kg + packing.',
    confidence: 'TINGGI', verify: 'Ukur dus saat packing.',
  },
  // B21-5. Running Belt (ukuran CUSTOM, 2 tipe!)
  '7e493a4c-2324-4453-ac43-4f0fb30baad6': {
    weightGrams: 5000, lengthCm: null, widthCm: null, heightCm: null,
    source: 'ACUAN: running belt commercial 560×3255mm = 5kg (Fitbox).',
    confidence: 'SEDANG', verify: 'UKURAN CUSTOM per pesanan — timbang & ukur tiap order!',
  },
  // B21-6. Sabuk Kulit PU + buckle stainless
  '661bd31c-89ec-4857-9db2-064c7d4e7fd6': {
    weightGrams: 1000, lengthCm: null, widthCm: null, heightCm: null,
    source: 'ACUAN: belt PU L = 0,8kg (JakartaNotebook); belt kulit gross 0,5kg (Alibaba) + packing.',
    confidence: 'SEDANG', verify: 'Ukur kemasan saat packing.',
  },
  // B21-7. Preacher Curl U3044 DHZ
  'b7663ff4-84c3-4394-8119-7b7a7a69a125': {
    weightGrams: 49000, lengthCm: 132, widthCm: 84, heightCm: 97,
    source: 'Deskripsi milik sendiri: 132×84×97cm, 49kg.',
    confidence: 'TINGGI', verify: 'Kargo + packing kayu.',
  },
  // B21-8. Sepeda TL-360B (pakai GW 25kg)
  '4bab30ba-c6c5-4529-9e95-b8a1c846b6d9': {
    weightGrams: 25000, lengthCm: 87, widthCm: 48, heightCm: 130,
    source: 'Deskripsi milik sendiri: 87×48×130cm, NW/GW 23/25kg (pakai GW).',
    confidence: 'TINGGI', verify: 'Kargo + packing kayu.',
  },
  // B21-9. Sepeda TL-8208 (pakai GW 20kg + dims dus)
  '8bbf1965-e493-49bf-8f10-19f5a5cf5869': {
    weightGrams: 20000, lengthCm: 64, widthCm: 26, heightCm: 56,
    source: 'Deskripsi milik sendiri: dus 64×26×56cm, NW/GW 18/20kg (pakai GW).',
    confidence: 'TINGGI', verify: 'Foto terisi otomatis dari Sanity.',
  },
  // B21-10. Orbitrack TL-8290 (GW 34kg, 2 koli!)
  'c463a77c-de67-4db2-a039-3d0762393cff': {
    weightGrams: 34000, lengthCm: 98, widthCm: 22, heightCm: 66.5,
    source: 'Okefitnes TL-8290 (dus SAMA PERSIS 98×22×66,5): NW/GW 31/34kg.',
    confidence: 'SEDANG', verify: 'Varian lain 41kg — timbang! 2 koli (orbitrack + twister).',
  },
  // --- BATCH 22 (6 sepeda, 2 shoulder DHZ, 2 handle; SEMUA dari deskripsi sendiri!) ---
  // B22-1. Sepeda TL-8207 (pakai GW 17kg + dims dus)
  '02f8c983-71dd-4ff1-b336-10393db0aaac': {
    weightGrams: 17000, lengthCm: 88, widthCm: 19, heightCm: 59,
    source: 'Deskripsi milik sendiri: dus 88×19×59cm, NW/GW 15/17kg (pakai GW).',
    confidence: 'TINGGI', verify: 'Foto terisi otomatis dari Sanity.',
  },
  // B22-2. Sepeda Recumbent TL-368R (pakai GW 30kg)
  'de1ebe4a-4e4c-4a85-8c2d-5d42628a5222': {
    weightGrams: 30000, lengthCm: 138, widthCm: 67, heightCm: 118,
    source: 'Deskripsi milik sendiri: 138×67×118cm, NW/GW 27/30kg (pakai GW).',
    confidence: 'TINGGI', verify: 'Kargo + packing kayu.',
  },
  // B22-3. Spinning TL-8300 New (pakai GW 37kg)
  '51c24a0a-1987-4577-8a87-84e27c45667e': {
    weightGrams: 37000, lengthCm: 96, widthCm: 54, heightCm: 120,
    source: 'Deskripsi milik sendiri: 96×54×120cm, NW/GW 35/37kg (pakai GW).',
    confidence: 'TINGGI', verify: 'Kargo + packing kayu.',
  },
  // B22-4. Spinning TL-960 (pakai GW 27kg)
  '8e23cca6-1f44-409d-b83e-9d51c1951a88': {
    weightGrams: 27000, lengthCm: 108, widthCm: 49, heightCm: 128,
    source: 'Deskripsi milik sendiri: 108×49×128cm, NW/GW 24/27kg (pakai GW).',
    confidence: 'TINGGI', verify: 'Kargo + packing kayu.',
  },
  // B22-5. Wind Bike TL-8202 (pakai GW 21kg + dims dus)
  '04ad8bf2-0251-422a-9c0b-aa8c59984be9': {
    weightGrams: 21000, lengthCm: 87, widthCm: 23, heightCm: 63,
    source: 'Deskripsi milik sendiri: dus 87×23×63cm, NW/GW 18/21kg (pakai GW).',
    confidence: 'TINGGI', verify: 'Foto terisi otomatis dari Sanity.',
  },
  // B22-6. X-Bike TL-925 (pakai GW 19kg + dims dus)
  '917dfcd9-a075-4ba3-854f-10e056d017fe': {
    weightGrams: 19000, lengthCm: 115, widthCm: 42, heightCm: 21,
    source: 'Deskripsi milik sendiri: dus 115×42×21cm, NW/GW 17/19kg (pakai GW).',
    confidence: 'TINGGI', verify: 'Foto terisi otomatis dari Sanity.',
  },
  // B22-7. Shoulder Press U3006C DHZ (stack 110kg)
  'c51e91e7-53e0-4e21-ac0f-14ebbc572c00': {
    weightGrams: 236000, lengthCm: 183, widthCm: 133, heightCm: 163,
    source: 'Deskripsi milik sendiri: 183×133×163cm, 236kg (stack 110kg).',
    confidence: 'TINGGI', verify: 'Truk + asuransi.',
  },
  // B22-8. Shoulder Press Y935Z DHZ
  'e8b50ccf-362e-44e3-9660-59705032e94a': {
    weightGrams: 146000, lengthCm: 129, widthCm: 126, heightCm: 149,
    source: 'Deskripsi milik sendiri: 129×126×149cm, 146kg.',
    confidence: 'TINGGI', verify: 'Kargo/truk + asuransi.',
  },
  // B22-9. Single Handle Solid (700gr)
  '289d7c15-cb85-4a9f-b23e-c852bba2ff02': {
    weightGrams: 1000, lengthCm: null, widthCm: null, heightCm: null,
    source: 'Deskripsi milik sendiri: 700gr + packing.',
    confidence: 'TINGGI', verify: 'Ukur kemasan saat packing.',
  },
  // B22-10. Single Handle Strap (200gr)
  '7d5dbed4-085f-459f-a812-aaec16b58e13': {
    weightGrams: 500, lengthCm: null, widthCm: null, heightCm: null,
    source: 'Deskripsi milik sendiri: 200gr + packing.',
    confidence: 'TINGGI', verify: 'Ukur kemasan saat packing.',
  },
  // --- BATCH 23 (sit up, 3 smith, sok teflon, spinning racer, spon, squat, stair, U2046) ---
  // B23-1. Sit Up Bench TL-712 (pakai GW 9kg + dims dus)
  'bba937c4-3397-4517-8967-ce299d4cb35f': {
    weightGrams: 9000, lengthCm: 135, widthCm: 16, heightCm: 33,
    source: 'Deskripsi milik sendiri: dus 135×16×33cm, NW/GW 8/9kg (pakai GW).',
    confidence: 'TINGGI', verify: 'Foto terisi otomatis dari Sanity.',
  },
  // B23-2. Smith TL-088 (pakai GW 460kg + dims box!)
  'fab7688b-66a7-4098-a41d-ba800e7d293e': {
    weightGrams: 460000, lengthCm: 202, widthCm: 90, heightCm: 37,
    source: 'Deskripsi milik sendiri: box 202×90×37cm, NW/GW 408/460kg (pakai GW).',
    confidence: 'TINGGI', verify: 'TRUK + asuransi + teknisi.',
  },
  // B23-3. Smith TL-099 (tanpa berat total — acuan kakak TL-088!)
  'edad9aa7-b4fb-4f52-9e8d-557777b24c18': {
    weightGrams: 460000, lengthCm: 210, widthCm: 170, heightCm: 225,
    source: 'ACUAN kakak TL-088 (stack sama 150kg): GW 460kg. TotalFitnes resmi tanpa berat total.',
    confidence: 'SEDANG', verify: 'WAJIB TIMBANG! Multi-koli + gratis plate 40kg (hitung terpisah).',
  },
  // B23-4. Smith Machine U3063 DHZ
  '6a76403b-79c0-46f4-b55a-4f9196ad6880': {
    weightGrams: 258000, lengthCm: 109, widthCm: 218, heightCm: 232,
    source: 'Deskripsi milik sendiri: 109×218×232cm, 258kg.',
    confidence: 'TINGGI', verify: 'TRUK + asuransi + teknisi.',
  },
  // B23-5. Sok Bumbung As Smith (teflon kecil)
  'a2421610-5421-4199-96ba-46b9d5894409': {
    weightGrams: 500, lengthCm: null, widthCm: null, heightCm: null,
    source: 'HITUNG densitas teflon (±130g, acuan pulley batch 20: 115g) + packing.',
    confidence: 'SEDANG', verify: 'Ukur kemasan saat packing.',
  },
  // B23-6. Spinning Racer Commercial (pakai GW 49kg + dims dus)
  '97b9d3db-eb34-45a0-8dbd-065247e56466': {
    weightGrams: 49000, lengthCm: 107, widthCm: 20, heightCm: 85,
    source: 'Deskripsi milik sendiri: dus 107×20×85cm, NW/GW 43/49kg (pakai GW).',
    confidence: 'TINGGI', verify: 'Kargo + packing kayu.',
  },
  // B23-7. Spon Busa Kaki (250gr)
  '4bdbe936-43b6-470a-93aa-22e3f7012a5b': {
    weightGrams: 500, lengthCm: 20, widthCm: 11, heightCm: 11,
    source: 'Deskripsi milik sendiri: 250gr, 20cm × Ø11cm + packing.',
    confidence: 'TINGGI', verify: 'Foto terisi otomatis dari Sanity.',
  },
  // B23-8. Squat Rack U3050 DHZ
  'd9fc08e1-40c8-425d-b688-8a54fb981ec3': {
    weightGrams: 122000, lengthCm: 185, widthCm: 173, heightCm: 180,
    source: 'Deskripsi milik sendiri: 185×173×180cm, 122kg.',
    confidence: 'TINGGI', verify: 'Kargo/truk + asuransi.',
  },
  // B23-9. Stair Climber TL-8200 (pakai GW 12,5kg + dims dus)
  '67d77b3f-21a7-4a32-954c-89ef4f85cf74': {
    weightGrams: 12500, lengthCm: 90, widthCm: 14, heightCm: 50,
    source: 'Deskripsi milik sendiri: dus 90×14×50cm, NW/GW 11/12,5kg (pakai GW).',
    confidence: 'TINGGI', verify: 'Foto terisi otomatis dari Sanity.',
  },
  // B23-10. Standing Multi Flight U2046 DHZ (stack 80kg)
  '0ac63f3e-ca90-4103-a1e2-5c05dead89a5': {
    weightGrams: 322000, lengthCm: 143, widthCm: 89, heightCm: 199,
    source: 'Deskripsi milik sendiri: 143×89×199cm, 322kg (stack 80kg).',
    confidence: 'TINGGI', verify: 'TRUK + asuransi + teknisi.',
  },
  // --- BATCH 24 (10 stick bar; SEMUA berat dari deskripsi sendiri!) ---
  // B24-1. Stick Bar 150cm 2,5cm (8kg)
  '9cb810a3-6e31-4df4-9cca-0d7f99a8841b': {
    weightGrams: 8500, lengthCm: null, widthCm: null, heightCm: null,
    source: 'Deskripsi milik sendiri: 8kg, panjang 150cm + packing.',
    confidence: 'TINGGI', verify: 'Panjang 150cm — ukur kemasan/pipa.',
  },
  // B24-2. Stick Bar 180cm 2,5cm (8kg)
  'e52b4abf-057f-42b2-94c9-7af4578532c1': {
    weightGrams: 8500, lengthCm: null, widthCm: null, heightCm: null,
    source: 'Deskripsi milik sendiri: 8kg, panjang 180cm + packing.',
    confidence: 'TINGGI', verify: 'Panjang 180cm — ukur kemasan/pipa.',
  },
  // B24-3. Stick Bar 200cm 2,5cm (8kg)
  'ce049c29-74f8-42b5-be62-f034d8bdc93b': {
    weightGrams: 8500, lengthCm: null, widthCm: null, heightCm: null,
    source: 'Deskripsi milik sendiri: 8kg, panjang 200cm + packing.',
    confidence: 'TINGGI', verify: 'Panjang 200cm — ukur kemasan/pipa.',
  },
  // B24-4. Stick Bar Olympic 180cm (11,5kg)
  '1587f1a6-5acf-46e1-84f2-e8d9375829bd': {
    weightGrams: 12000, lengthCm: null, widthCm: null, heightCm: null,
    source: 'Deskripsi milik sendiri: 11,5kg, panjang 180cm + packing.',
    confidence: 'TINGGI', verify: 'Panjang 180cm — ukur kemasan/pipa.',
  },
  // B24-5. Stick Bar Olympic 212cm Stainless (18kg)
  'a93901e2-e3f7-431e-8c97-d3a7e70b39c9': {
    weightGrams: 18500, lengthCm: null, widthCm: null, heightCm: null,
    source: 'Deskripsi milik sendiri: 18kg, panjang 212cm + packing.',
    confidence: 'TINGGI', verify: 'Panjang 212cm — kargo, ukur kemasan.',
  },
  // B24-6. Stick Bar Olympic 220cm (20kg)
  '528e52cd-0ddc-4e62-afc1-d537dce06747': {
    weightGrams: 20500, lengthCm: null, widthCm: null, heightCm: null,
    source: 'Deskripsi milik sendiri: 20kg, panjang 220cm + packing.',
    confidence: 'TINGGI', verify: 'Panjang 220cm — kargo, ukur kemasan.',
  },
  // B24-7. Stick Body Pump 1set (stick 1,3 + plate 2×1,25kg)
  '4d41745d-8c59-4094-8f6a-cad001fcb093': {
    weightGrams: 4500, lengthCm: null, widthCm: null, heightCm: null,
    source: 'HITUNG deskripsi: 1,3 + 2×1,25 = 3,8kg + packing.',
    confidence: 'TINGGI', verify: 'Panjang 118cm — ukur kemasan.',
  },
  // B24-8. Stick Curl Bar 120cm (+ 2 collar)
  '2a3c605e-ab34-47c0-8b4f-4de6845766c2': {
    weightGrams: 5000, lengthCm: null, widthCm: null, heightCm: null,
    source: 'Deskripsi milik sendiri: 4,5kg + 2 collar + packing.',
    confidence: 'TINGGI', verify: 'Panjang 120cm — ukur kemasan.',
  },
  // B24-9. Stick Curl Bar Olympic (7kg)
  '346a930c-74f1-42dd-872f-726b2a60922d': {
    weightGrams: 7500, lengthCm: null, widthCm: null, heightCm: null,
    source: 'Deskripsi milik sendiri: 7kg, panjang 120cm + packing.',
    confidence: 'TINGGI', verify: 'Panjang 120cm — ukur kemasan.',
  },
  // B24-10. Stick Hexa Bar Olympic (23kg)
  '141b442f-3db5-4b18-b862-c04a91432392': {
    weightGrams: 23500, lengthCm: null, widthCm: null, heightCm: null,
    source: 'Deskripsi milik sendiri: 23kg, 60×140cm + packing.',
    confidence: 'TINGGI', verify: 'Bentuk hexa — ukur kemasan.',
  },
  // --- BATCH 25 (stick dumbell/tricep, bench+squat DHZ, TRX, 3 tali sling) ---
  // B25-1. Stick Dumbell 35×2,5 (1,45kg + 2 collar)
  '75d18b20-6f80-4b34-a40b-7d13aff88775': {
    weightGrams: 2000, lengthCm: null, widthCm: null, heightCm: null,
    source: 'Deskripsi milik sendiri: 1,45kg + 2 collar + packing.',
    confidence: 'TINGGI', verify: 'Harga per pcs.',
  },
  // B25-2. Stick Dumbell 35×2,8 (2,5kg + 2 kunci)
  'b79b165e-4dae-4a26-a982-d1f31e24b09b': {
    weightGrams: 3000, lengthCm: null, widthCm: null, heightCm: null,
    source: 'Deskripsi milik sendiri: 2,5kg + 2 kunci drat + packing.',
    confidence: 'TINGGI', verify: 'Ukur kemasan saat packing.',
  },
  // B25-3. Stick Tricep 2,5cm (6kg + 2 collar)
  '45f279eb-415d-466b-8b95-a33318674338': {
    weightGrams: 6500, lengthCm: null, widthCm: null, heightCm: null,
    source: 'Deskripsi milik sendiri: 6kg, 86cm + 2 collar + packing.',
    confidence: 'TINGGI', verify: 'Panjang 86cm — ukur kemasan.',
  },
  // B25-4. Stick Tricep Olympic 95cm (tanpa berat — acuan Body-Solid!)
  'a466c06c-cd50-4bd1-97d2-76f9db436a3e': {
    weightGrams: 12000, lengthCm: null, widthCm: null, heightCm: null,
    source: 'ACUAN: Body-Solid OB34 86cm = 10kg (tanpa collar); punya sendiri 95cm + 2 kunci + packing.',
    confidence: 'SEDANG', verify: 'Timbang saat packing!',
  },
  // B25-5. Super Bench U3036 DHZ
  '5fd15e1b-ce93-4504-91c8-cdbe747d5947': {
    weightGrams: 61000, lengthCm: 162, widthCm: 72, heightCm: 81,
    source: 'Deskripsi milik sendiri: 162×72×81cm, 61kg.',
    confidence: 'TINGGI', verify: 'Kargo + packing kayu.',
  },
  // B25-6. Super Squat U3065 DHZ
  '02539f6b-e0ed-40fe-9742-756222197529': {
    weightGrams: 165000, lengthCm: 231, widthCm: 107, heightCm: 204,
    source: 'Deskripsi milik sendiri: 231×107×204cm, 165kg.',
    confidence: 'TINGGI', verify: 'TRUK + asuransi + teknisi.',
  },
  // B25-7. Suspension Trainer TRX 1set (acuan 2kg!)
  'd97586ca-c0ab-478b-875a-6618b4ebcf9c': {
    weightGrams: 2000, lengthCm: null, widthCm: null, heightCm: null,
    source: 'ACUAN: IFitFun TRX set (Rp390rb) = 2kg; TRX ori 1,19kg.',
    confidence: 'SEDANG', verify: 'Timbang saat packing!',
  },
  // B25-8. Tali Sling Hitam Import 6mm (HARGA PER METER!)
  'be53e33e-fc90-40bb-81da-f07cb22ae8f6': {
    weightGrams: 500, lengthCm: null, widthCm: null, heightCm: null,
    source: 'TABEL: wire rope 6mm 6×19 = 0,15kg/m (Monotaro) + lapis karet + packing.',
    confidence: 'SEDANG', verify: 'Harga PER METER — berat × jumlah meter!',
  },
  // B25-9. Tali Sling Hitam Lokal 6mm (HARGA PER METER!)
  '2d18c2be-6cd2-41ea-a2f4-d66dfc8164cf': {
    weightGrams: 500, lengthCm: null, widthCm: null, heightCm: null,
    source: 'TABEL: wire rope 6mm = 0,15kg/m (Monotaro) + lapis PVC + packing.',
    confidence: 'SEDANG', verify: 'Harga PER METER — berat × jumlah meter!',
  },
  // B25-10. Tali Sling Putih Lokal 6mm (satuan?)
  'd8b67d09-0ab7-4718-8da7-240b1919379f': {
    weightGrams: 500, lengthCm: null, widthCm: null, heightCm: null,
    source: 'TABEL: wire rope 6mm = 0,15kg/m (Monotaro) + lapis PVC + packing.',
    confidence: 'SEDANG', verify: 'Konfirmasi satuan (per meter?)!',
  },
  // --- BATCH 26 (thimble + 9 treadmill) ---
  // B26-1. Thimble Sling (15gr)
  '1235023d-a10c-4318-93b9-a2124a28d8ad': {
    weightGrams: 500, lengthCm: null, widthCm: null, heightCm: null,
    source: 'Deskripsi milik sendiri: 15gr + packing.',
    confidence: 'TINGGI', verify: 'Ukur kemasan saat packing.',
  },
  // B26-2. Treadmill Curve TL-800 (pakai GW 190kg!)
  'eda9124a-e442-40b0-834c-7499e22c380d': {
    weightGrams: 190000, lengthCm: 210, widthCm: 86, heightCm: 148,
    source: 'Deskripsi milik sendiri: 210×86×148cm, NW/GW 150/190kg (pakai GW).',
    confidence: 'TINGGI', verify: 'TRUK + asuransi + teknisi.',
  },
  // B26-3. Treadmill TL-122 (pakai GW 93kg + dims lipat)
  '9285dd11-ad05-438a-a8eb-420d26c4e840': {
    weightGrams: 93000, lengthCm: 184, widthCm: 90, heightCm: 32,
    source: 'Deskripsi milik sendiri: lipat 184×90×32cm, NW/GW 84/93kg (pakai GW).',
    confidence: 'TINGGI', verify: 'Kargo/truk + packing kayu.',
  },
  // B26-4. Treadmill TL-130 (pakai GW 63kg + dims box)
  'af5b2b08-74aa-47ed-a0e7-e864ff011650': {
    weightGrams: 63000, lengthCm: 171, widthCm: 73, heightCm: 28,
    source: 'Deskripsi milik sendiri: box 171×73×28cm, NW/GW 57/63kg (pakai GW).',
    confidence: 'TINGGI', verify: 'Kargo + packing kayu.',
  },
  // B26-5. Treadmill TL-146 (pakai GW 79kg)
  '09307761-f8c8-41d1-8b7f-bcf947906373': {
    weightGrams: 79000, lengthCm: 210, widthCm: 83, heightCm: 140,
    source: 'Deskripsi milik sendiri: 210×83×140cm, NW/GW 71/79kg (pakai GW).',
    confidence: 'TINGGI', verify: 'Kargo/truk + packing kayu.',
  },
  // B26-6. Treadmill TL-177 4HP (tanpa berat — acuan TL-188!)
  '64b26b03-b55d-4fac-ae37-0e2ab7d79aa4': {
    weightGrams: 100000, lengthCm: 193, widthCm: 86, heightCm: 140,
    source: 'ACUAN kakak TL-188 (ukuran mirip 195×80×150): GW 100kg.',
    confidence: 'SEDANG', verify: 'WAJIB TIMBANG! TRUK + asuransi.',
  },
  // B26-7. Treadmill TL-188 (pakai GW 100kg + dims box)
  '155de32d-5c45-42ec-8499-65d1f5704386': {
    weightGrams: 100000, lengthCm: 187, widthCm: 86, heightCm: 37,
    source: 'Deskripsi milik sendiri: box 187×86×37cm, NW/GW 90/100kg (pakai GW).',
    confidence: 'TINGGI', verify: 'TRUK + asuransi.',
  },
  // B26-8. Treadmill TL-198 4HP (tanpa berat — acuan TL-122!)
  'fb358401-26b8-4d31-ab59-86edf40e58f3': {
    weightGrams: 100000, lengthCm: 177, widthCm: 85, heightCm: 143,
    source: 'ACUAN kakak TL-122 (ukuran mirip, motor 3HP): GW 93kg → 4HP ≈ 100kg.',
    confidence: 'SEDANG', verify: 'WAJIB TIMBANG! TRUK + asuransi.',
  },
  // B26-9. Treadmill TL-266 (pakai GW 43kg)
  'cfc5b413-a4fe-4a45-adb7-b0201941ff0b': {
    weightGrams: 43000, lengthCm: 135, widthCm: 62, heightCm: 104,
    source: 'Deskripsi milik sendiri: 135×62×104cm, NW/GW 34/43kg (pakai GW).',
    confidence: 'TINGGI', verify: 'Kargo + packing kayu.',
  },
  // B26-10. Treadmill TL-26AC (pakai GW 205kg!)
  '5efe9230-fcfb-4fc5-9a06-a7e54beddfe9': {
    weightGrams: 205000, lengthCm: 210, widthCm: 92, heightCm: 166,
    source: 'Deskripsi milik sendiri: 210×92×166cm, NW/GW 164/205kg (pakai GW).',
    confidence: 'TINGGI', verify: 'TRUK + asuransi + teknisi.',
  },
  // --- BATCH 27 (10 treadmill elektrik) ---
  // B27-1. Treadmill TL-270 (berat dari toko lain — tipe SAMA PERSIS!)
  '4f21a75f-8ff7-4823-ac93-814b0dca22a9': {
    weightGrams: 63000, lengthCm: 171, widthCm: 75, heightCm: 29,
    source: 'Ragaria TL-270 (tipe sama persis): box 171×75×29cm, NW/GW 56/63kg.',
    confidence: 'SEDANG', verify: 'Timbang saat packing! Kargo + packing kayu.',
  },
  // B27-2. Treadmill TL-288 (acuan kakak TL-270!)
  '6a1bef9a-9c00-4e9b-a3ad-e263dfb783e5': {
    weightGrams: 63000, lengthCm: null, widthCm: null, heightCm: null,
    source: 'ACUAN kakak TL-270 (belt sama 1350×450): GW 63kg.',
    confidence: 'SEDANG', verify: 'WAJIB TIMBANG + UKUR! Kargo + packing kayu.',
  },
  // B27-3. Treadmill TL-299 (acuan kakak TL-625/TL-680!)
  '97badcc8-53fa-4fe8-b3fe-44baccf7b84f': {
    weightGrams: 60000, lengthCm: 125, widthCm: 56, heightCm: 140,
    source: 'ACUAN kakak TL-625 (GW 54) & TL-680 (max sama 120kg, GW 73) → ≈60kg.',
    confidence: 'SEDANG', verify: 'WAJIB TIMBANG! Kargo + packing kayu.',
  },
  // B27-4. Treadmill TL-333 (pakai GW 72kg + dims dus)
  '44bf755b-f572-4200-b15b-5766237ac785': {
    weightGrams: 72000, lengthCm: 168, widthCm: 80, heightCm: 33,
    source: 'Deskripsi milik sendiri: dus 168×80×33cm, NW/GW 64/72kg (pakai GW).',
    confidence: 'TINGGI', verify: 'Kargo/truk + packing kayu.',
  },
  // B27-5. Treadmill TL-33AC (pakai GW 131kg, tanpa dims!)
  '7f317bca-13a0-4bb8-8c86-4f6b0055186e': {
    weightGrams: 131000, lengthCm: null, widthCm: null, heightCm: null,
    source: 'Deskripsi milik sendiri: NW/GW 119/131kg (pakai GW).',
    confidence: 'TINGGI', verify: 'Ukur dus. TRUK + asuransi.',
  },
  // B27-6. Treadmill TL-33TT (pakai GW 131kg)
  '1c910543-32b3-44da-a12b-3debabe38508': {
    weightGrams: 131000, lengthCm: 200, widthCm: 92, heightCm: 159,
    source: 'Deskripsi milik sendiri: 200×92×159cm, NW/GW 119/131kg (pakai GW).',
    confidence: 'TINGGI', verify: 'TRUK + asuransi.',
  },
  // B27-7. Treadmill TL-55AC (acuan TL-177: dims SAMA PERSIS!)
  '5dcee483-6388-4fab-9435-8bd70ed2235b': {
    weightGrams: 100000, lengthCm: 193, widthCm: 86, heightCm: 140,
    source: 'ACUAN kakak TL-177 (dims sama persis 193×86×140, max sama 150kg): GW 100kg.',
    confidence: 'SEDANG', verify: 'WAJIB TIMBANG! TRUK + asuransi.',
  },
  // B27-8. Treadmill TL-55TT (acuan TL-33TT: spek mirip!)
  '6832e9f9-fb27-4c87-8dc9-9544f25a6a85': {
    weightGrams: 131000, lengthCm: 204, widthCm: 93, heightCm: 144,
    source: 'ACUAN kakak TL-33TT (AC 4HP Android, max sama 150kg): GW 131kg.',
    confidence: 'SEDANG', verify: 'WAJIB TIMBANG! TRUK + asuransi.',
  },
  // B27-9. Treadmill TL-625 (pakai GW 54kg + dims box)
  'be18cb91-c564-4309-876d-2379e86e703e': {
    weightGrams: 54000, lengthCm: 154, widthCm: 76, heightCm: 26,
    source: 'Deskripsi milik sendiri: box 154×76×26cm, NW/GW 47/54kg (pakai GW).',
    confidence: 'TINGGI', verify: 'Kargo + packing kayu.',
  },
  // B27-10. Treadmill TL-629 (pakai GW 36kg)
  'e5c5db93-7c42-4671-a56d-5be6890a8a10': {
    weightGrams: 36000, lengthCm: 136, widthCm: 52, heightCm: 106,
    source: 'Deskripsi milik sendiri: 136×52×106cm, NW/GW 27/36kg (pakai GW).',
    confidence: 'TINGGI', verify: 'Kargo + packing kayu.',
  },
  // --- BATCH 28 (9 treadmill elektrik + 1 manual) ---
  // B28-1. Treadmill TL-633 (acuan kakak TL-66!)
  '461ef0f4-077c-43b8-9038-c97b74a76a2c': {
    weightGrams: 60000, lengthCm: 140, widthCm: 64, heightCm: 127,
    source: 'ACUAN kakak TL-66 (max sama 120kg): GW 70kg → ukuran lebih kecil ≈60kg. Resmi tanpa berat.',
    confidence: 'SEDANG', verify: 'WAJIB TIMBANG! Kargo + packing kayu.',
  },
  // B28-2. Treadmill TL-66 (pakai GW 70kg + dims dus)
  '84fd9f47-44be-4569-a04f-877e68bc5919': {
    weightGrams: 70000, lengthCm: 169, widthCm: 79, heightCm: 33,
    source: 'Deskripsi milik sendiri: dus 169×79×33cm, NW/GW 60/70kg (pakai GW).',
    confidence: 'TINGGI', verify: 'Kargo/truk + packing kayu.',
  },
  // B28-3. Treadmill TL-680 (pakai GW 73kg + dims box)
  '603bdece-f034-40fb-8d03-cc9a51d31752': {
    weightGrams: 73000, lengthCm: 169, widthCm: 76, heightCm: 32.5,
    source: 'Deskripsi milik sendiri: box 169×76×32,5cm, NW/GW 65/73kg (pakai GW).',
    confidence: 'TINGGI', verify: 'Kargo/truk + packing kayu.',
  },
  // B28-4. Treadmill TL-777 (acuan kakak TL-66!)
  '1fbc7e77-0ffc-4989-b280-db009762f23c': {
    weightGrams: 70000, lengthCm: 155, widthCm: 67, heightCm: 122,
    source: 'ACUAN kakak TL-66 (max & ukuran mirip): GW 70kg.',
    confidence: 'SEDANG', verify: 'WAJIB TIMBANG! Kargo/truk + packing kayu.',
  },
  // B28-5. Treadmill TL-88AC (pakai GW 250kg!)
  '7f664647-af70-4cac-ae9b-83a015457392': {
    weightGrams: 250000, lengthCm: 206, widthCm: 94, heightCm: 173,
    source: 'Deskripsi milik sendiri: 206×94×173cm, NW/GW 193/250kg (pakai GW).',
    confidence: 'TINGGI', verify: 'TRUK + asuransi + teknisi.',
  },
  // B28-6. Treadmill TL-99AC (acuan kakak TL-129!)
  '1667b044-d9f0-4857-8201-c80edb162734': {
    weightGrams: 105000, lengthCm: 175, widthCm: 87, heightCm: 158,
    source: 'ACUAN kakak TL-129 (4HP, max & ukuran mirip): GW 105kg.',
    confidence: 'SEDANG', verify: 'WAJIB TIMBANG! TRUK + asuransi.',
  },
  // B28-7. Treadmill Tl-170 (acuan kakak TL-199!)
  '610c107a-3c50-413a-b30d-149b8a113d76': {
    weightGrams: 99000, lengthCm: 170, widthCm: 76, heightCm: 147,
    source: 'ACUAN kakak TL-199 (belt & max sama): GW 99kg. Resmi tanpa berat.',
    confidence: 'SEDANG', verify: 'WAJIB TIMBANG! Kargo/truk + packing kayu.',
  },
  // B28-8. Treadmill Tl-246 (pakai GW 39kg + dims dus)
  '9306142b-3618-4be2-a254-b8a1fb8a96ee': {
    weightGrams: 39000, lengthCm: 144, widthCm: 67, heightCm: 24,
    source: 'Deskripsi milik sendiri: dus 144×67×24cm, NW/GW 33/39kg (pakai GW).',
    confidence: 'TINGGI', verify: 'Kargo + packing kayu.',
  },
  // B28-9. Treadmill Tl-607 (2 toko: GW 52kg; resmi 44,5!)
  '047cb1d3-52cd-4100-a47b-d8c7a73c709f': {
    weightGrams: 52000, lengthCm: 141, widthCm: 73, heightCm: 29,
    source: 'Up Fit Health + Total-Healthgym TL-607 (tipe sama): box 141×73×29, NW/GW 44/52kg.',
    confidence: 'SEDANG', verify: 'Resmi tulis 44,5kg — WAJIB TIMBANG! Kargo + packing kayu.',
  },
  // B28-10. Treadmill Manual TL-004 (3 toko: GW 43kg!)
  '5548f874-2cbf-424c-b1df-775bdf5db338': {
    weightGrams: 43000, lengthCm: 133, widthCm: 55, heightCm: 22,
    source: 'Total-Healthgym + 2 Tokopedia TL-004 (tipe sama): box 133×55×22, NW/GW 39/43kg.',
    confidence: 'SEDANG', verify: 'Kargo + packing kayu.',
  },
  // --- BATCH 29 (walking pad, tricep rope, tummy trimmer, 3 DHZ; SEMUA dari deskripsi!) ---
  // B29-1. Walking Pad TL-111 (pakai GW 32kg)
  '65f78997-8d9a-4a2b-85d5-1fe4ab55136e': {
    weightGrams: 32000, lengthCm: 126, widthCm: 65, heightCm: 107,
    source: 'Deskripsi milik sendiri: 126×65×107cm, NW/GW 28/32kg (pakai GW).',
    confidence: 'TINGGI', verify: 'Kargo + packing kayu.',
  },
  // B29-2. Walking Pad TL-555 (pakai GW 38,5kg)
  '309bb57c-f651-4410-9363-34d92d895e34': {
    weightGrams: 38500, lengthCm: 137, widthCm: 70, heightCm: 109,
    source: 'Deskripsi milik sendiri: 137×70×109cm, bersih/kotor 32,5/38,5kg (pakai kotor).',
    confidence: 'TINGGI', verify: 'Kargo + packing kayu.',
  },
  // B29-3. Tricep Rope Import (±1kg)
  '74097672-1f93-4c2a-ac15-930bb48d3fc9': {
    weightGrams: 1500, lengthCm: null, widthCm: null, heightCm: null,
    source: 'Deskripsi milik sendiri: ±1kg, 68cm + packing.',
    confidence: 'TINGGI', verify: 'Ukur kemasan saat packing.',
  },
  // B29-4. Tummy Trimmer Single (750gr)
  '44b8e54c-e0cc-4810-84c7-3a725072e6fd': {
    weightGrams: 1000, lengthCm: null, widthCm: null, heightCm: null,
    source: 'Deskripsi milik sendiri: 750gr, 34×26cm + packing.',
    confidence: 'TINGGI', verify: 'Ukur kemasan saat packing.',
  },
  // B29-5. Vertical Knee Up / Dip U3047 DHZ
  '4c4747b1-2331-4c30-b63e-2ec3a6ae8acf': {
    weightGrams: 77000, lengthCm: 127, widthCm: 71, heightCm: 160,
    source: 'Deskripsi milik sendiri: 127×71×160cm, 77kg.',
    confidence: 'TINGGI', verify: 'Kargo/truk + packing kayu.',
  },
  // B29-6. Vertical Press U3008C DHZ (stack 110kg)
  '451c6023-da78-4398-b602-47f8863e6926': {
    weightGrams: 242000, lengthCm: 148, widthCm: 105, heightCm: 181,
    source: 'Deskripsi milik sendiri: 148×105×181cm, 242kg (stack 110kg).',
    confidence: 'TINGGI', verify: 'TRUK + asuransi + teknisi.',
  },
  // B29-7. Vertical Row U3034C DHZ (stack 95kg)
  '43ed7d65-02a9-4df4-9608-83836157562d': {
    weightGrams: 227000, lengthCm: 155, widthCm: 132, heightCm: 160,
    source: 'Deskripsi milik sendiri: 155×132×160cm, 227kg (stack 95kg).',
    confidence: 'TINGGI', verify: 'TRUK + asuransi + teknisi.',
  },
  // B29-8. Walking Pad CH-21 (pakai GW 21kg)
  'a289f37e-d203-42ee-b33d-8e201de2e2c7': {
    weightGrams: 21000, lengthCm: 118, widthCm: 54, heightCm: 95,
    source: 'Deskripsi milik sendiri: 118×54×95cm, NW/GW 17/21kg (pakai GW).',
    confidence: 'TINGGI', verify: 'Kargo + packing kayu.',
  },
  // B29-9. Walking Pad TL-212 (pakai GW 27kg)
  '047c70b9-b621-45f0-8198-8e56b7276bb9': {
    weightGrams: 27000, lengthCm: 122, widthCm: 55, heightCm: 115,
    source: 'Deskripsi milik sendiri: 122×55×115cm, NW/GW 24/27kg (pakai GW).',
    confidence: 'TINGGI', verify: 'Kargo + packing kayu.',
  },
  // B29-10. Walking Pad TL-220 (pakai GW 28,5kg)
  '5c140169-a2c5-43a6-9819-889e15ff6be4': {
    weightGrams: 28500, lengthCm: 125, widthCm: 53, heightCm: 105,
    source: 'Deskripsi milik sendiri: 125×53×105cm, bersih/kotor 25/28,5kg (pakai kotor).',
    confidence: 'TINGGI', verify: 'Kargo + packing kayu.',
  },
  // --- BATCH 30 FINAL (3 terakhir — SELESAI 290/290!) ---
  // B30-1. Walking Pad TL-336 (pakai GW 22kg)
  '371c2cb8-c31a-4515-8e6f-90e1936df60b': {
    weightGrams: 22000, lengthCm: 110, widthCm: 54, heightCm: 94,
    source: 'Deskripsi milik sendiri: 110×54×94cm, NW/GW 19/22kg (pakai GW).',
    confidence: 'TINGGI', verify: 'Kargo + packing kayu.',
  },
  // B30-2. Weight Adjuster Key WAK Lokal (pin bench kecil)
  '0bfc6bfe-5969-4ab9-8e16-e3e9ac2b0030': {
    weightGrams: 500, lengthCm: null, widthCm: null, heightCm: null,
    source: 'ACUAN: pin bench gym 40–96g (eBay) + packing.',
    confidence: 'SEDANG', verify: 'Ukur kemasan saat packing.',
  },
  // B30-3. Home Gym TL-HG-009 (pakai GW 135kg — terlewat batch lama!)
  '7ebbc23c-235e-4d50-a832-12bff6cbb7e9': {
    weightGrams: 135000, lengthCm: 165, widthCm: 95, heightCm: 202,
    source: 'Deskripsi milik sendiri: 165×95×202cm, NW/GW 132/135kg (pakai GW).',
    confidence: 'TINGGI', verify: 'TRUK + asuransi + teknisi.',
  },
};

export function lookupSpec(id) {
  return TOKOPEDIA_SPECS[String(id || '')] || null;
}
