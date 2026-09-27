# TOKOPEDIA — Cakupan Riset (anti-nomor-geser)

KOREKSI FOTO (2026-09-27): cek foto batch 1–30 memakai nama field yang salah
(`images` jamak) sehingga semua produk dikira TANPA FOTO. Nama field yang benar
adalah `image` (tunggal) — dan 290/290 produk SUDAH punya foto di Sanity.
Kolom Foto 1 di CSV terisi otomatis. Semua tulisan "FOTO KOSONG/TANPA FOTO"
di file riset & doc batch sudah tidak berlaku (sudah dibersihkan dari file riset).

Total produk di Sanity: 290 (per 2026-09-27). Sudah diriset: 88. Sisa: 202.

ATURAN: jangan ambil batch per nomor posisi — katalog berubah (produk baru/rename).
Setiap batch: bangun query exclusion dari ID di tokopedia-specs.js, ambil 10 pertama
yang belum diriset (order by name), lalu ambil detailnya per _id:

  *[_type=="product" && _id in ["id1",...,"id10"]]{_id,name,price,stock,description,"imageUrl":images[0].asset->url}

## Batch 10 — SELESAI (98 spek)

## Batch 11 — SELESAI (108 spek)

## Batch 12 — SELESAI (118 spek)

## Batch 13 — SELESAI (128 spek)

## Batch 14 — SELESAI (138 spek)

## Batch 15 — SELESAI (148 spek)

## Batch 16–30 SELESAI — 290/290 (100%)! 🎉

RISET SELESAI per 2026-09-27. Semua produk punya berat & ukuran kirim.
Langkah berikut: (1) tambah foto, (2) timbang yang SEDANG, (3) upload CSV massal.

## Batch 30 (arsip final)

| # | _id | Nama |
|---|-----|------|
| 1 | 371c2cb8-c31a-4515-8e6f-90e1936df60b | Walking Pad TL-336 |
| 2 | 0bfc6bfe-5969-4ab9-8e16-e3e9ac2b0030 | Weight Adjuster Key WAK Lokal |
| 3 | 7ebbc23c-235e-4d50-a832-12bff6cbb7e9 | Home Gym 1sisi TL-HG-009 Beban 75kg (terlewat batch lama!) |

## Batch 29 (arsip)

| # | _id | Nama |
|---|-----|------|
| 1 | 65f78997-8d9a-4a2b-85d5-1fe4ab55136e | Treadmill Walking Pad TL-111 Portable |
| 2 | 309bb57c-f651-4410-9363-34d92d895e34 | Treadmill Walking Pad TL-555 Auto Incline Motor 2HP |
| 3 | 74097672-1f93-4c2a-ac15-930bb48d3fc9 | Tricep Rope Import |
| 4 | 44b8e54c-e0cc-4810-84c7-3a725072e6fd | Tummy Trimmer Single Spring |
| 5 | 4c4747b1-2331-4c30-b63e-2ec3a6ae8acf | Vertical Knee Up / Dip U3047 DHZ |
| 6 | 451c6023-da78-4398-b602-47f8863e6926 | Vertical Press U3008C DHZ |
| 7 | 43ed7d65-02a9-4df4-9608-83836157562d | Vertical Row U3034C DHZ |
| 8 | a289f37e-d203-42ee-b33d-8e201de2e2c7 | Walking Pad CH-21 |
| 9 | 047c70b9-b621-45f0-8198-8e56b7276bb9 | Walking Pad TL-212 2 in 1 |
| 10 | 5c140169-a2c5-43a6-9819-889e15ff6be4 | Walking Pad TL-220 |

(8360d89a/84d4ab63/0af5ee2a sudah diriset — skip.)

## Batch 28 (arsip)

| # | _id | Nama |
|---|-----|------|
| 1 | 461ef0f4-077c-43b8-9038-c97b74a76a2c | Treadmill Electric TL-633 |
| 2 | 84fd9f47-44be-4569-a04f-877e68bc5919 | Treadmill Electric TL-66 |
| 3 | 603bdece-f034-40fb-8d03-cc9a51d31752 | Treadmill Electric TL-680 |
| 4 | 1fbc7e77-0ffc-4989-b280-db009762f23c | Treadmill Electric TL-777 |
| 5 | 7f664647-af70-4cac-ae9b-83a015457392 | Treadmill Electric TL-88AC Motor 4HP |
| 6 | 1667b044-d9f0-4857-8201-c80edb162734 | Treadmill Electric TL-99AC Motor 4HP |
| 7 | 610c107a-3c50-413a-b30d-149b8a113d76 | Treadmill Electric Tl-170 Motor DC |
| 8 | 9306142b-3618-4be2-a254-b8a1fb8a96ee | Treadmill Electric Tl-246 |
| 9 | 047cb1d3-52cd-4100-a47b-d8c7a73c709f | Treadmill Electric Tl-607 |
| 10 | 5548f874-2cbf-424c-b1df-775bdf5db338 | Treadmill Manual TL-004 |

## Batch 27 (arsip)

| # | _id | Nama |
|---|-----|------|
| 1 | 4f21a75f-8ff7-4823-ac93-814b0dca22a9 | Treadmill Electric TL-270 |
| 2 | 6a1bef9a-9c00-4e9b-a3ad-e263dfb783e5 | Treadmill Electric TL-288 |
| 3 | 97badcc8-53fa-4fe8-b3fe-44baccf7b84f | Treadmill Electric TL-299 |
| 4 | 44bf755b-f572-4200-b15b-5766237ac785 | Treadmill Electric TL-333 |
| 5 | 7f317bca-13a0-4bb8-8c86-4f6b0055186e | Treadmill Electric TL-33AC Motor 4HP |
| 6 | 1c910543-32b3-44da-a12b-3debabe38508 | Treadmill Electric TL-33TT AC Motor 4HP |
| 7 | 5dcee483-6388-4fab-9435-8bd70ed2235b | Treadmill Electric TL-55AC Motor 4HP |
| 8 | 6832e9f9-fb27-4c87-8dc9-9544f25a6a85 | Treadmill Electric TL-55TT AC Motor 4HP |
| 9 | be18cb91-c564-4309-876d-2379e86e703e | Treadmill Electric TL-625 |
| 10 | e5c5db93-7c42-4671-a56d-5be6890a8a10 | Treadmill Electric TL-629 |

## Batch 26 (arsip)

| # | _id | Nama |
|---|-----|------|
| 1 | 1235023d-a10c-4318-93b9-a2124a28d8ad | Thimble Sling Pembentuk dan Pelindung Tali Sling |
| 2 | eda9124a-e442-40b0-834c-7499e22c380d | Treadmill Commercial Manual Curve TL-800 |
| 3 | 9285dd11-ad05-438a-a8eb-420d26c4e840 | Treadmill Electric TL-122 Motor DC 3HP |
| 4 | af5b2b08-74aa-47ed-a0e7-e864ff011650 | Treadmill Electric TL-130 |
| 5 | 09307761-f8c8-41d1-8b7f-bcf947906373 | Treadmill Electric TL-146 |
| 6 | 64b26b03-b55d-4fac-ae37-0e2ab7d79aa4 | Treadmill Electric TL-177 Motor 4HP |
| 7 | 155de32d-5c45-42ec-8499-65d1f5704386 | Treadmill Electric TL-188 Motor 3HP |
| 8 | fb358401-26b8-4d31-ab59-86edf40e58f3 | Treadmill Electric TL-198 Motor 4HP |
| 9 | cfc5b413-a4fe-4a45-adb7-b0201941ff0b | Treadmill Electric TL-266 |
| 10 | 5efe9230-fcfb-4fc5-9a06-a7e54beddfe9 | Treadmill Electric TL-26AC Motor 6HP |

(2 waist twister 32e8d0c0/977cec7a sudah diriset — skip.)

## Batch 25 (arsip)

| # | _id | Nama |
|---|-----|------|
| 1 | 75d18b20-6f80-4b34-a40b-7d13aff88775 | Stick Solid Dumbell Uk.35x2,5cm |
| 2 | b79b165e-4dae-4a26-a982-d1f31e24b09b | Stick Solid Dumbell Uk.35x2,8cm |
| 3 | 45f279eb-415d-466b-8b95-a33318674338 | Stick Tricep Bar 2,5cm |
| 4 | a466c06c-cd50-4bd1-97d2-76f9db436a3e | Stick Tricep Bar Olympic 5cm |
| 5 | 5fd15e1b-ce93-4504-91c8-cdbe747d5947 | Super Bench U3036 DHZ |
| 6 | 02539f6b-e0ed-40fe-9742-756222197529 | Super Squat U3065 DHZ |
| 7 | d97586ca-c0ab-478b-875a-6618b4ebcf9c | Suspension Trainer TRX |
| 8 | be53e33e-fc90-40bb-81da-f07cb22ae8f6 | Tali Sling Hitam Import 6mm |
| 9 | 2d18c2be-6cd2-41ea-a2f4-d66dfc8164cf | Tali Sling Hitam Lokal 6mm |
| 10 | d8b67d09-0ab7-4718-8da7-240b1919379f | Tali Sling Putih Lokal 6mm |

## Batch 24 (arsip)

| # | _id | Nama |
|---|-----|------|
| 1 | 9cb810a3-6e31-4df4-9cca-0d7f99a8841b | Stick Bar 150cm Diameter 2,5cm |
| 2 | e52b4abf-057f-42b2-94c9-7af4578532c1 | Stick Bar 180cm Diameter 2,5cm |
| 3 | ce049c29-74f8-42b5-be62-f034d8bdc93b | Stick Bar 200cm Diameter 2,5cm |
| 4 | 1587f1a6-5acf-46e1-84f2-e8d9375829bd | Stick Bar Olympic 180cm 5cm |
| 5 | a93901e2-e3f7-431e-8c97-d3a7e70b39c9 | Stick Bar Olympic 212cm Stainless 5cm |
| 6 | 528e52cd-0ddc-4e62-afc1-d537dce06747 | Stick Bar Olympic 220cm 5cm |
| 7 | 4d41745d-8c59-4094-8f6a-cad001fcb093 | Stick Body Pump 1set |
| 8 | 2a3c605e-ab34-47c0-8b4f-4de6845766c2 | Stick Curl Bar 120cm Diameter 2,5cm |
| 9 | 346a930c-74f1-42dd-872f-726b2a60922d | Stick Curl Bar Olympic 5cm |
| 10 | 141b442f-3db5-4b18-b862-c04a91432392 | Stick Hexa Bar Olympic 5cm |

## Batch 23 (arsip)

| # | _id | Nama |
|---|-----|------|
| 1 | bba937c4-3397-4517-8967-ce299d4cb35f | Sit Up Bench Total TL-712 |
| 2 | fab7688b-66a7-4098-a41d-ba800e7d293e | Smith Machine MultiGym Station Commercial TL-088 |
| 3 | edad9aa7-b4fb-4f52-9e8d-557777b24c18 | Smith Machine MultiGym TL-099 ( Free Rubber Plate 40kg ) |
| 4 | 6a76403b-79c0-46f4-b55a-4f9196ad6880 | Smith Machine U3063 DHZ |
| 5 | a2421610-5421-4199-96ba-46b9d5894409 | Sok Bumbung As Smith Machine |
| 6 | 97b9d3db-eb34-45a0-8dbd-065247e56466 | Spinning Bike Racer Commercial |
| 7 | 4bdbe936-43b6-470a-93aa-22e3f7012a5b | Spon Busa Kaki Alat Fitness |
| 8 | d9fc08e1-40c8-425d-b688-8a54fb981ec3 | Squat Rack U3050 DHZ |
| 9 | 67d77b3f-21a7-4a32-954c-89ef4f85cf74 | Stair Climber TL-8200 |
| 10 | 0ac63f3e-ca90-4103-a1e2-5c05dead89a5 | Standing Multi Flight U2046 DHZ |

(Single Pole fe7ece11 sudah diriset batch 5 — skip.)

## Batch 22 (arsip)

| # | _id | Nama |
|---|-----|------|
| 1 | 02f8c983-71dd-4ff1-b336-10393db0aaac | Sepeda Statis Platinum Bike TL-8207 |
| 2 | de1ebe4a-4e4c-4a85-8c2d-5d42628a5222 | Sepeda Statis Recumbent TL-368R |
| 3 | 51c24a0a-1987-4577-8a87-84e27c45667e | Sepeda Statis Spinning Bike TL-8300 New |
| 4 | 8e23cca6-1f44-409d-b83e-9d51c1951a88 | Sepeda Statis Spinning Bike TL-960 |
| 5 | 04ad8bf2-0251-422a-9c0b-aa8c59984be9 | Sepeda Statis Wind Bike TL-8202 |
| 6 | 917dfcd9-a075-4ba3-854f-10e056d017fe | Sepeda Statis X-Bike TL-925 |
| 7 | c51e91e7-53e0-4e21-ac0f-14ebbc572c00 | Shoulder Press U3006C DHZ |
| 8 | e8b50ccf-362e-44e3-9660-59705032e94a | Shoulder Press Y935Z DHZ |
| 9 | 289d7c15-cb85-4a9f-b23e-c852bba2ff02 | Single Handle Solid |
| 10 | 7d5dbed4-085f-459f-a812-aaec16b58e13 | Single Handle Strap |

## Batch 21 (arsip)

## Batch 21 (10 berikutnya yang belum diriset, per 2026-09-27 — verifikasi ulang via exclusion query)

| # | _id | Nama |
|---|-----|------|
| 1 | 0dbeb61a-dece-401b-9f71-a27105485cf3 | Rubber Plate Elite 15kg lubang 5cm |
| 2 | 0f8b8022-ae0b-472b-8680-b0bd4c8d79e3 | Rubber Plate Elite 2,5kg lubang 5cm |
| 3 | c7f2fbdd-805a-4959-ae98-d7179aeb53a2 | Rubber Plate Elite 20kg lubang 5cm |
| 4 | 7a9d986e-7199-4b83-bb1f-a1339811583d | Rubber Plate Elite 5kg lubang 5cm |
| 5 | 7e493a4c-2324-4453-ac43-4f0fb30baad6 | Running Belt Treadmill Electric |
| 6 | 661bd31c-89ec-4857-9db2-064c7d4e7fd6 | Sabuk Angkat Beban Kulit |
| 7 | b7663ff4-84c3-4394-8119-7b7a7a69a125 | Seated Preacher Curl U3044 DHZ |
| 8 | 4bab30ba-c6c5-4529-9e95-b8a1c846b6d9 | Sepeda Statis Magnetic TL-360B |
| 9 | 8bbf1965-e493-49bf-8f10-19f5a5cf5869 | Sepeda Statis Magnetic TL-8208 |
| 10 | c463a77c-de67-4db2-a039-3d0762393cff | Sepeda Statis Orbitrack Plat TL-8290 |

## Batch 20 (arsip)

## Batch 20 (10 berikutnya yang belum diriset, per 2026-09-27 — verifikasi ulang via exclusion query)

| # | _id | Nama |
|---|-----|------|
| 1 | 56bcb687-6ce3-4ad4-a512-14109e0fb035 | Roda Roll Elliptical Bike |
| 2 | 7c95e6c0-99f0-4143-8cca-031cbf4c9e1b | Rotary Torso U3018C DHZ |
| 3 | 840a9864-3023-4bdf-b064-882897fbff92 | Rotor 2 Circle Total Fitness |
| 4 | 0dd58219-d8a1-4c39-a65d-1e9117563ea9 | Rubber Flooring Pyramid Puzzle 50×50 10mm |
| 5 | ebeaa3c9-7b86-48e8-b668-b34587195559 | Rubber Flooring Tile 50×50 15mm |
| 6 | 22381ea8-cc7c-482d-bc8d-d5d7670e2896 | Rubber Flooring Tile 50×50 20mm |
| 7 | d305d9ff-fafe-4260-846b-b3569cc34f11 | Rubber Plate TF 2,5–20kg lubang 5cm |
| 8 | 7a9dfbef-edf0-40e6-9347-0456591308fc | Rubber Plate Basic 1,25–20kg lubang 3cm |
| 9 | 9fe4686a-f2f8-401f-a88c-4315e25b9a7a | Rubber Plate Basic 2,5–20kg lubang 5cm |
| 10 | dbe631bc-5556-4e31-920c-50989022096b | Rubber Plate Elite 10kg lubang 5cm |

## Batch 19 (arsip)

## Batch 19 (10 berikutnya yang belum diriset, per 2026-09-27 — verifikasi ulang via exclusion query)

| # | _id | Nama |
|---|-----|------|
| 1 | 266e8743-0e6d-4844-ac42-216eb4b720c5 | Power Strap Gymex SG-01 |
| 2 | 600785c8-773b-44a3-9528-bec156e09dc8 | Power Strap Gym Lifting Besi |
| 3 | 63def66f-4772-4b47-9a15-d313bd106054 | Power Strap Import Valeo |
| 4 | 2576776e-3917-4635-96f0-b24bee31de28 | Prone Leg Curl U3001C DHZ |
| 5 | 0a0cd928-d334-4a10-87d0-a4a3f5a4ba99 | Pull Up Bar BM-50 |
| 6 | 15ea2053-f5d7-4626-b8bb-a40c2cd8e3ec | Pulley Roda Aluminium Sling |
| 7 | 97f360f2-104c-4560-b3ed-d4f5fd1fae4b | Pulley Roda Sling 12cm |
| 8 | f6e8e1d6-72aa-40d1-a483-f69eab653c13 | Pulley Roda Teflon Sling |
| 9 | db9b0695-f571-45f2-9af6-5a4194bc1a5e | Recumbent Bike Commercial CMR |
| 10 | 857a0257-57a2-4bb5-9f87-47bfe8a76c31 | Roda Elliptical Bike |

## Batch 18 (arsip)

## Batch 18 (10 berikutnya yang belum diriset, per 2026-09-27 — verifikasi ulang via exclusion query)

| # | _id | Nama |
|---|-----|------|
| 1 | 93a5847b-c7de-47b0-bfbd-0e5070dba70e | MultiGym TL-026 (stack besi 150kg) |
| 2 | 00831b25-7913-4f73-9ae5-b8c07b9c212c | MultiGym TL-026 (stack platik 150kg) |
| 3 | cac6a891-271c-487b-b4c3-c02e8098fcf7 | MultiGym TL-022 |
| 4 | 260b9150-9336-49e2-a4b2-45426fb3fe79 | Olympic Decline Bench U3041 DHZ |
| 5 | 6272e1c8-3f63-4a83-85f6-95da1bf5f614 | Olympic Flat Bench U3043 DHZ |
| 6 | 99ac186e-a7ae-4ea5-b74f-ff797f1115a9 | Olympic Incline Bench U3042 DHZ |
| 7 | 7116bcea-a18c-4346-8235-c1b5ce70be61 | Pall Rope Resistance Rope |
| 8 | 5958cfe5-28ca-48ec-b03d-b0caca30d54e | Pec Delt U3007C DHZ |
| 9 | 1a119788-687a-4a21-8cb3-bb82e0eb6284 | Per Pegas Penahan Beban |
| 10 | 6c38dbb1-d9ab-448b-994f-1bd18a99913c | Power Grip Cabel BM-A255 |

## Batch 17 (arsip)

## Batch 17 (10 berikutnya yang belum diriset, per 2026-09-27 — verifikasi ulang via exclusion query)

| # | _id | Nama |
|---|-----|------|
| 1 | 0924f9e7-1d82-4496-8755-e360ce5cd5cf | Leg Press U3003C DHZ |
| 2 | 06e67b7b-3b44-4832-9864-e1143a4224e5 | Long Pull U3033C DHZ |
| 3 | 60f1258a-a130-4f3e-ad6c-db0e251a46a9 | Low Row Y925Z DHZ |
| 4 | e9e8dec6-136a-419f-a6e0-d5aa7ddd77a4 | Magnetic Bike Commercial CMB |
| 5 | 0d9a7e0b-3a2e-454f-a294-e7777542ffe6 | Matras Senam Lokal |
| 6 | d098cd9b-de52-4c9f-8180-c8d803d7fd68 | Matras Yoga Champs 6mm |
| 7 | 6b6ed125-0707-4611-a47b-91dfd8d489d1 | Medicine Ball Bola Gym 2kg |
| 8 | c87b2ab0-52c7-46cf-bafa-34b0c89a0c91 | Medicine Ball Bola Gym 8kg |
| 9 | 7f7d7f9d-94d5-40e8-830b-52a12b547767 | Multi Exercise Bar BM-A246 |
| 10 | bb394e8a-10ca-4ea6-9314-4a2accea4bd1 | Multi Purpose Bench U3038 DHZ |

## Batch 16 (arsip)

| # | _id | Nama |
|---|-----|------|
| 1 | 182e41e0-11d2-47e7-b99f-327efc219b73 | Klem Tali Sling WH-2 |
| 2 | b3dc82be-c8ab-4ad0-bb13-52d44b9579a0 | Klem Tali Sling WH-3 Halus |
| 3 | 74f1ac8a-0199-40fc-ad8b-6e16561f9231 | Klem Tali Sling WH-3 Kasar |
| 4 | b81a0405-e33a-4aa0-b33a-8ff75666b15d | Klem U Pengait Tali Sling |
| 5 | 271a2823-30fc-41a6-b5cd-6c2062d2d8ca | Klem U Segel D Tali Sling |
| 6 | 190bc7c0-0dc9-4d4e-89bb-16aca25f669a | Lat & Pulley Machine U3085C DHZ |
| 7 | eee2a1c2-f98f-4d76-b07e-88f357c5260d | Lat Bar Handle Katrol BM-A222 |
| 8 | 4b57a800-4c2e-485e-b469-06af57c02acb | Lat Pull Down U3012C DHZ |
| 9 | 3ac12b30-56f9-4f66-904a-e6ed54a9ca01 | Leg Extention & Leg Curl U3086C DHZ |
| 10 | 3cc6106f-ae2c-4b47-8dae-1d5dc91f5a39 | Leg Extention U3002 DHZ |

## Batch 15 (arsip)

| # | _id | Nama |
|---|-----|------|
| 1 | 330972d1-e1eb-440d-94ae-b63635238453 | Home Gym 1sisi TL-HG-011 (stack 75kg) |
| 2 | e619b4f9-2b58-4eeb-bf4a-8b23e22067d6 | Home Gym 3sisi + Sansak HG-077 (stack 75kg) |
| 3 | 92be6029-0dd5-4cbb-a40e-1e3f1408bd6a | Home Gym 3sisi + Squat HG-055 |
| 4 | 4c87c306-966e-4097-b04f-3cd594795df9 | Incline Level Row U3061 |
| 5 | f2778b9d-41ae-4967-9562-ad39091227b3 | Kanvas Pemberat Spinning Bike |
| 6 | 1bd17292-986b-46be-9100-d1c44381f233 | Karet Pembatas Beban Smith Machine |
| 7 | 57950de5-85f3-4de9-978c-7f3fc0870ec7 | Karet Penahan Beban Rubber Mounting |
| 8 | 26cd189a-78c8-4dba-a681-312b56d569d3 | Karet Power Yoga Power Balance |
| 9 | 1393ef85-631f-4447-8572-9475c2904f67 | Kettlebell Neoprene 2–12kg (per kg) |
| 10 | cdb9a9de-6ec7-4cc0-9e91-184e689a2827 | Klem Penahan Tali Sling WH-1 |

## Batch 14 (arsip)

| # | _id | Nama |
|---|-----|------|
| 1 | a9beb227-0674-47a7-9be3-1287f85cab82 | Dumbell Set Chrome 30kg |
| 2 | 55f39c53-69d4-4ea1-aee9-c89a9e46ed78 | Dumbell Set Chrome 50kg |
| 3 | ba632497-57ba-4626-a5ac-d4b171a111ba | Dumbell Set Hexa Rubber 2,5–25kg + Rack |
| 4 | fd098dbd-75d3-47bb-9482-b5c8993511b2 | Game Boxing Music |
| 5 | 56a33620-5502-438b-ba87-90dbf1a2af5c | Gymnastic Ball Yoga Ball 65cm |
| 6 | b91a8315-24e1-4564-8550-dad0e3f36a2c | Half Rack E6221 DHZ |
| 7 | 834c05ea-41f6-40b7-8cc2-b6e2ce394db5 | Handle Karet Pegangan |
| 8 | 3864212b-d1ec-42b6-ac96-2d5e13597c76 | Handle Katrol Pendek |
| 9 | d7182289-7b99-4b72-aa65-c67ace5baf33 | Hip Thrust U3092 DHZ |
| 10 | acbfe536-1fc1-42fa-bb2e-312f89647d15 | Home Gym TL-HG-006 |

## Batch 13 (arsip)

| # | _id | Nama |
|---|-----|------|
| 1 | 1b28efbb-0c2c-41ef-9301-862b183c780f | Dumbell Adjustable 25kg |
| 2 | d4827b32-d8cf-406a-8853-36598da92f79 | Dumbell Bench TL-1202 |
| 3 | c9415326-fd4d-4bc5-abbf-a75e7249db76 | Dumbell Hexa Rubber 2,5–40kg (per kg) |
| 4 | 95e1b831-5a97-45b8-a3ea-00d043c25940 | Dumbell Neoprene 1–5kg |
| 5 | 77207f04-7154-431f-8210-c2cf2acdf45b | Dumbell Plastik AB King 1–10kg |
| 6 | 1ca110fe-fa25-4724-9326-9edf6403a970 | Dumbell Set 2,5–25kg + Rack U3077 |
| 7 | 95ce3803-c7f1-49ac-b46b-b931a086672a | Dumbell Set Box Iron 20kg |
| 8 | ba31e20e-f95c-4793-801a-b8dc6f2bf81a | Dumbell Set Box Iron 50kg |
| 9 | 2027ceda-1456-4588-a822-c133e5574742 | Dumbell Set Box Iron 58kg |
| 10 | 249a9449-cad7-4aae-90f3-700fc2c6bd8b | Dumbell Set Chrome 20kg |

## Batch 12 (arsip)

| # | _id | Nama |
|---|-----|------|
| 1 | 511c4da9-1d80-4fb2-ad8c-5392c845286a | Bosu Balance Ball Bola Gym |
| 2 | 9b89b8c5-1942-4da9-bcb8-1cf5de5609dd | Bumper Plate Eco 5kg–25kg |
| 3 | edacccae-6ad5-4cbf-a280-c8f341aa9c77 | Cable Cross Over Evost U3016 DHZ |
| 4 | 30cb55cb-b501-4427-8e4f-617f1c1ac05b | Carabiner Uk 7mm |
| 5 | a5cda2d8-27d9-44b4-a65a-347d313761b3 | Carabiner Uk 8mm |
| 6 | 6c108bdc-296b-4581-bc5c-8667e0d9c856 | Chest & Shoulder Press U3084C DHZ |
| 7 | 8de3805d-65dc-46fb-ac61-eba6fa20a481 | Chest Press Y905Z DHZ |
| 8 | a10ec798-98fe-4cc2-afbf-5b7511d13b15 | Commercial Stair Climber |
| 9 | adcb6902-6641-41ae-907f-3503a84cb925 | Double Handle Solid BM-A238 |
| 10 | 27d3a4d4-a5a0-4ed4-8c96-3949653f779d | Dumbell Adjustable 12,5kg |

## Batch 11 (arsip)

| # | _id | Nama |
|---|-----|------|
| 1 | 716b9d69-b08f-483f-a89e-1671f74e8a82 | Bangku Adjustable Bench TL-1200 |
| 2 | 666b6867-b922-403d-b3c1-7a5080357141 | Battle Rope 12m |
| 3 | 912b3d84-c140-4a68-8f34-00c60c2f02e0 | Battle Rope 15m |
| 4 | 26f2a900-1b10-46fd-8fb2-af41378a1c0b | Battle Rope 9m |
| 5 | fa79aba3-7c2d-40ab-8a20-0c5e1e6d60c2 | Bearing Smith Machine |
| 6 | 77695bb3-8e75-43c9-8cc9-acd2eda6edc8 | Bearing Smith Machine Multi |
| 7 | b70138dd-217a-4344-8124-c7644cf50196 | Bench Press TL-750 |
| 8 | 6a3234e5-7bf8-4efe-a77f-329c69318b21 | Bench Press TL-7705 |
| 9 | 98d4d947-e413-4ce8-bbd7-7b747690f160 | Bola Karet Stopper Tali Sling |
| 10 | 1803b79d-037e-4796-8448-441a682b52db | Bola Stopper Teflon Tali Sling |

## Batch 10 (arsip — 10 pertama yang belum diriset saat itu)

| # | _id | Nama |
|---|-----|------|
| 1 | a993b75c-0998-44cd-8b38-321515319061 | AB Machine TL-950 |
| 2 | 29012573-15d3-42f4-9d19-6a8a239bd2f3 | Abdominal Isolator U3073C DHZ |
| 3 | 6935f691-175f-46c3-858d-7dcce4fd78e3 | Abductor & Adductor U3021C DHZ |
| 4 | d6e0b239-45d8-4a46-86dd-2973b3003ada | Adjustable Decline Bench U3037 DHZ |
| 5 | 955a01a1-c521-4a38-86d0-b265a0213c16 | Aerobic Step Papan Senam ID-03 |
| 6 | 07c3808d-fadb-4609-9e89-4e216d9207e8 | Angkle Support Remora Uk.M |
| 7 | 72b44954-2e80-48db-b784-330ea8c60fb3 | Angled Leg Press U3056S DHZ |
| 8 | 2c35b84a-dbc0-47f9-b7d8-165419c82b2b | Arm Blaster Import Bollinger |
| 9 | 2cd52a6e-501a-4258-a9c1-659febf653a9 | Baju Sauna Suit + Topi Ab king |
| 10 | a792a5b1-f668-4929-87f1-8bbdf2d46779 | Bangku Adjustable Bench B-1500 |
