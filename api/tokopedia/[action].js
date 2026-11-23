// /api/tokopedia/[action] — SATU dynamic route untuk SEMUA endpoint Tokopedia & TikTok Shop.
//
// Kenapa digabung: plan Vercel Hobby dibatasi maks 12 Serverless Functions per
// deployment. File terpisah membuat total melebihi batas → ERROR
// exceeded_serverless_functions_per_deployment. Dynamic route [action] tetap
// melayani URL yang sama persis:
//   GET      /api/tokopedia/status      → bendera status env (tanpa rahasia)
//   GET      /api/tokopedia/auth-link   → link otorisasi + state HMAC (wajib adminKey)
//   GET      /api/tokopedia/callback    → redirect Partner Center: tukar auth_code → tampilkan token
//   GET/POST /api/tokopedia/refresh     → perpanjang access_token (wajib adminKey)
//   GET      /api/tokopedia/products    → daftar produk Sanity (read-only)
//   GET      /api/tokopedia/categories  → daftar kategori TikTok v2 (adminKey)
//   GET      /api/tokopedia/warehouses  → daftar gudang toko (adminKey)
//   POST     /api/tokopedia/dryrun      → pratinjau payload tanpa kirim (adminKey)
//   POST     /api/tokopedia/sync        → create product (adminKey + confirm + SYNC_ENABLED)
//   POST     /api/tokopedia/inventory   → push stok ke SKU TikTok (adminKey + confirm + SYNC_ENABLED)
//
// Keamanan tidak berubah: adminKey di semua endpoint tulis, token & App Secret
// hanya di server (env Vercel), state CSRF HMAC-SHA256 stateless 30 menit.
// Sync & inventory wajib TOKOPEDIA_SYNC_ENABLED=true — pola lock sama dengan Lazada.
import {
  envStatus,
  ttsEnvStatus,
  checkAdminKey,
  makeState,
  verifyState,
  exchangeAuthCode,
  refreshAccessToken,
  renderTokensPage,
  fetchTtsCategories,
  fetchTtsWarehouses,
  uploadTtsImage,
  validateTtsProduct,
  buildTtsPayload,
  getTtsShopCipher,
  ttsFetch,
  TTS_IMAGE_MAX_COUNT,
  AUTH_BASE,
} from '../_lib/tokopedia.js';
import { fetchSanityProducts, normalizeProduct } from '../_lib/lazada.js';

/* ── status ─────────────────────────────────────────────────────────── */
async function handleStatus(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  res.setHeader('Access-Control-Allow-Origin', '*');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'GET') return res.status(405).json({ error: 'Gunakan GET.' });

  const gate = checkAdminKey(req, null);
  if (!gate.ok) return res.status(gate.code).json({ ok: false, error: gate.error });

  const s = ttsEnvStatus(); // termasuk syncEnabled / syncBlocked (lock Phase 2)
  return res.status(200).json({
    ok: true,
    checkedAt: new Date().toISOString(),
    ...s,
    message: s.connected
      ? `Terhubung. Token kedaluwarsa ${s.daysLeft !== null ? `±${s.daysLeft} hari lagi` : '(tanggal tidak diisi)'}.`
      : s.credentialsComplete
        ? 'Kredensial App lengkap — jalankan otorisasi dari panel.'
        : 'Lengkapi TOKOPEDIA_APP_KEY + TOKOPEDIA_APP_SECRET di Vercel (Partner Center → App & Service).',
  });
}

/* ── auth-link ──────────────────────────────────────────────────────── */
async function handleAuthLink(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'GET') return res.status(405).json({ error: 'Gunakan GET.' });

  const gate = checkAdminKey(req, null);
  if (!gate.ok) return res.status(gate.code).json({ ok: false, error: gate.error });

  const s = envStatus();
  if (!s.credentialsComplete) {
    return res.status(409).json({
      ok: false,
      error: 'App Key/Secret belum lengkap di Vercel. Isi TOKOPEDIA_APP_KEY dan TOKOPEDIA_APP_SECRET dulu.',
    });
  }

  const state = makeState();
  const url = `${AUTH_BASE}?service_id=${encodeURIComponent(s.effectiveServiceId)}&state=${encodeURIComponent(state)}`;
  return res.status(200).json({
    ok: true,
    url,
    serviceIdUsed: s.hasExplicitServiceId ? 'TOKOPEDIA_SERVICE_ID' : 'TOKOPEDIA_APP_KEY (fallback)',
    note: 'Buka link ini di browser yang login ke Seller Center toko. Setelah menyetujui, Anda diarahkan ke callback dan diminta adminKey.',
  });
}

/* ── callback (Redirect URL terdaftar di Partner Center) ─────────────── */
async function handleCallback(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  res.setHeader('X-Robots-Tag', 'noindex, nofollow, noarchive');
  if (req.method !== 'GET') return res.status(405).send('Gunakan GET.');

  const q = req.query || {};
  const s = envStatus();

  if (!s.credentialsComplete) {
    return res.status(409).send(
      renderTokensPage({
        ok: false,
        title: 'Konfigurasi belum lengkap',
        error: 'TOKOPEDIA_APP_KEY / TOKOPEDIA_APP_SECRET belum diatur di Vercel.',
      }),
    );
  }

  if (q.error) {
    return res.status(200).send(
      renderTokensPage({
        ok: false,
        title: 'Otorisasi dibatalkan',
        error: `Anda menolak/membatalkan otorisasi (${String(q.error)}). Buka lagi link otorisasi dari panel bila ingin mencoba.`,
      }),
    );
  }

  const code = String(q.code || '').trim();
  const state = String(q.state || '').trim();
  if (!code) {
    return res.status(400).send(
      renderTokensPage({ ok: false, title: 'Code tidak ditemukan', error: 'Parameter code kosong. Mulailah dari panel admin.' }),
    );
  }
  if (!verifyState(state)) {
    return res.status(400).send(
      renderTokensPage({
        ok: false,
        title: 'State tidak valid',
        error: 'Link kedaluwarsa (>30 menit) atau tidak dibuat dari panel. Buka lagi link otorisasi dari panel admin.',
      }),
    );
  }

  try {
    const data = await exchangeAuthCode(code);
    return res.status(200).send(
      renderTokensPage({
        ok: true,
        title: 'Otorisasi berhasil — salin token ini',
        data,
        note: 'Token ini <b>tidak disimpan server</b> — <b>wajib</b> Anda tempel ke env Vercel (lihat langkah di bawah), lalu <b>Redeploy</b>, agar koneksi awet. Auth code sudah terpakai (sekali pakai).',
      }),
    );
  } catch (e) {
    return res.status(502).send(
      renderTokensPage({ ok: false, title: 'Penukaran token gagal', error: String(e?.message || e) }),
    );
  }
}

/* ── refresh ────────────────────────────────────────────────────────── */
async function handleRefresh(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  res.setHeader('X-Robots-Tag', 'noindex, nofollow, noarchive');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'GET' && req.method !== 'POST') return res.status(405).json({ error: 'Gunakan GET atau POST.' });

  const gate = checkAdminKey(req, req.body);
  if (!gate.ok) {
    if (String(req.headers.accept || '').includes('text/html')) {
      return res.status(gate.code).send(renderTokensPage({ ok: false, title: 'adminKey salah', error: gate.error }));
    }
    return res.status(gate.code).json({ ok: false, error: gate.error });
  }

  const s = envStatus();
  if (!s.credentialsComplete || !s.hasRefreshToken) {
    const msg = 'Kredensial belum lengkap: butuh TOKOPEDIA_APP_KEY, TOKOPEDIA_APP_SECRET, dan TOKOPEDIA_REFRESH_TOKEN di Vercel.';
    if (String(req.headers.accept || '').includes('text/html')) {
      return res.status(409).send(renderTokensPage({ ok: false, title: 'Belum siap', error: msg }));
    }
    return res.status(409).json({ ok: false, error: msg });
  }

  try {
    const data = await refreshAccessToken();
    if (String(req.headers.accept || '').includes('text/html') || req.method === 'GET') {
      return res.status(200).send(
        renderTokensPage({
          ok: true,
          title: 'Token diperpanjang — salin yang baru',
          data,
          note: 'Perbarui env <b>TOKOPEDIA_ACCESS_TOKEN</b> (dan expire-in) di Vercel dengan nilai baru di atas, lalu <b>Redeploy</b>. Refresh token lama masih berlaku sampai masa otorisasi habis.',
        }),
      );
    }
    return res.status(200).json({
      ok: true,
      accessTokenExpiresAt: data.access_token_expire_in
        ? new Date(Number(data.access_token_expire_in) * 1000).toISOString()
        : null,
      note: 'Akses token baru dibuat. Simpan ke env TOKOPEDIA_ACCESS_TOKEN lalu Redeploy.',
      // Token TIDAK dikirim dalam JSON — hanya halaman HTML admin (di atas) yang menampilkannya,
      // agar tidak bocor ke log/riwayat respons API panel.
    });
  } catch (e) {
    const msg = String(e?.message || e);
    if (String(req.headers.accept || '').includes('text/html') || req.method === 'GET') {
      return res.status(502).send(renderTokensPage({ ok: false, title: 'Refresh gagal', error: msg }));
    }
    return res.status(502).json({ ok: false, error: msg });
  }
}

/* ── Phase 2: produk Sanity (read-only, tanpa adminKey — pola lazada/products.js) ── */

async function handleProducts(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  res.setHeader('Access-Control-Allow-Origin', '*');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'GET') return res.status(405).json({ ok: false, error: 'Gunakan GET.' });

  const { projectId, products, error } = await fetchSanityProducts();
  if (!products.length) {
    return res.status(502).json({ ok: false, sanityReachable: false, projectId, products: [], error });
  }
  const slim = products.map((p) => {
    const n = normalizeProduct(p);
    const usable = (n.images || []).filter(Boolean);
    return {
      id: n.id,
      name: n.name,
      price: n.price,
      stock: n.stock,
      category: n.category,
      imageCount: usable.length,
      thumbnail: usable[0] || '',
      hasDescription: Boolean(n.description && String(n.description).trim()),
      sku: n.sku || '',
      weightGrams: n.weightGrams || null,
      discountPrice: n.discountPrice || null,
    };
  });
  return res.status(200).json({ ok: true, sanityReachable: true, projectId, count: slim.length, products: slim });
}

/* ── Phase 2: kategori TikTok v2 (adminKey; read-only) ── */

async function handleCategories(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  res.setHeader('Access-Control-Allow-Origin', '*');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'GET') return res.status(405).json({ ok: false, error: 'Gunakan GET.' });

  const gate = checkAdminKey(req, req.query);
  if (!gate.ok) return res.status(401).json({ ok: false, error: gate.reason });

  try {
    const keyword = String(req.query.keyword || '').trim();
    const result = await fetchTtsCategories({ keyword });
    return res.status(200).json({ ok: true, ...result });
  } catch (err) {
    console.error('[tokopedia/categories]', err.code || '', err.message);
    return res.status(502).json({ ok: false, error: err.message, code: err.code ?? null });
  }
}

/* ── Phase 2: gudang toko (adminKey; read-only) ── */

async function handleWarehouses(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  res.setHeader('Access-Control-Allow-Origin', '*');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'GET') return res.status(405).json({ ok: false, error: 'Gunakan GET.' });

  const gate = checkAdminKey(req, req.query);
  if (!gate.ok) return res.status(401).json({ ok: false, error: gate.reason });

  try {
    const result = await fetchTtsWarehouses();
    return res.status(200).json({ ok: true, ...result });
  } catch (err) {
    console.error('[tokopedia/warehouses]', err.code || '', err.message);
    return res.status(502).json({ ok: false, error: err.message, code: err.code ?? null });
  }
}

/* ── helper bersama dryrun & sync: ambil + validasi 1 produk ── */

async function prepareOne(body) {
  const { projectId, products } = await fetchSanityProducts();
  const id = String(body.id || '').trim();
  // fetchSanityProducts sudah ternormalisasi → field-nya `id` (bukan `_id`)
  const raw = products.find((p) => String(p.id || p._id || '') === id);
  if (!raw) {
    const err = new Error(`Produk "${id}" tidak ada di Sanity (${projectId || 'n/a'}).`);
    err.status = 404;
    throw err;
  }
  const p = normalizeProduct(raw);
  const validation = validateTtsProduct(p, body.overrides || {});
  return { p, validation, projectId };
}

/* ── Phase 2: dryrun — pratinjau payload, tanpa kirim (adminKey) ── */

async function handleDryrun(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  res.setHeader('Access-Control-Allow-Origin', '*');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ ok: false, error: 'Gunakan POST.' });

  const gate = checkAdminKey(req, req.body);
  if (!gate.ok) return res.status(401).json({ ok: false, error: gate.reason });

  const status = ttsEnvStatus();
  try {
    const { p, validation } = await prepareOne(req.body || {});
    const categoryId = String((req.body || {}).categoryId || '').trim();
    const warehouseId = String((req.body || {}).warehouseId || '').trim();
    const saveMode = String((req.body || {}).saveMode || 'AS_DRAFT');

    let payloadPreview = null;
    let previewError = null;
    if (validation.valid && categoryId && warehouseId) {
      try {
        payloadPreview = buildTtsPayload(p, validation, {
          categoryId,
          warehouseId,
          saveMode,
          imageUris: validation.usableImages.slice(0, TTS_IMAGE_MAX_COUNT).map((_, i) => `URI-${i + 1}`),
        });
      } catch (e) {
        previewError = e.message;
      }
    } else if (validation.valid && !categoryId) {
      previewError = 'categoryId belum dipilih — pilih kategori TikTok dulu.';
    } else if (validation.valid && !warehouseId) {
      previewError = 'warehouseId kosong — tidak ada gudang aktif di toko.';
    }

    return res.status(200).json({
      ok: true,
      wouldSync: Boolean(payloadPreview),
      product: { id: p.id, name: p.name, price: p.price, stock: p.stock, images: validation.usableImages.length },
      validation,
      payloadPreview,
      previewError,
      syncBlocked: status.syncBlocked,
      syncEnabled: status.syncEnabled,
    });
  } catch (err) {
    const code = err.status === 404 ? 404 : 502;
    return res.status(code).json({ ok: false, error: err.message, code: err.code ?? null });
  }
}

/* ── Phase 2: sync — create product sungguhan (adminKey + confirm + lock) ── */

async function handleSync(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  res.setHeader('Access-Control-Allow-Origin', '*');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ ok: false, error: 'Gunakan POST.' });

  const body = req.body || {};
  const gate = checkAdminKey(req, body);
  if (!gate.ok) return res.status(401).json({ ok: false, error: gate.reason });

  const status = ttsEnvStatus();
  if (status.syncBlocked) {
    return res.status(409).json({
      ok: false,
      error: status.syncEnabled
        ? 'Kredensial/token belum lengkap — cek Status dulu.'
        : 'Sinkron TikTok terkunci. Set TOKOPEDIA_SYNC_ENABLED=true di environment Vercel, lalu Redeploy.',
      syncEnabled: status.syncEnabled,
    });
  }
  if (body.confirm !== true) return res.status(400).json({ ok: false, error: 'Kirim butuh confirm: true.' });

  let sentPayload = null;
  try {
    const { p, validation } = await prepareOne(body);
    if (!validation.valid) {
      return res.status(422).json({ ok: false, validation, error: 'Validasi gagal — perbaiki dulu.' });
    }

    const categoryId = String(body.categoryId || '').trim();
    if (!categoryId) return res.status(400).json({ ok: false, error: 'categoryId wajib — pilih kategori TikTok.' });

    // gudang: pakai yang dipilih, atau default toko
    let warehouseId = String(body.warehouseId || '').trim();
    let warehouseName = '';
    if (!warehouseId) {
      const wh = await fetchTtsWarehouses();
      warehouseId = wh.defaultId;
      warehouseName = wh.defaultName;
    }
    if (!warehouseId) {
      return res.status(502).json({ ok: false, error: 'Tidak ada gudang aktif di toko TikTok — cek panel Warehouses.' });
    }

    // upload gambar (maks 9) — kegagalan sebagian dicatat, semua gagal = blokir
    const toUpload = validation.usableImages.slice(0, TTS_IMAGE_MAX_COUNT);
    const uris = [];
    const imagesFailed = [];
    for (const url of toUpload) {
      try {
        uris.push(await uploadTtsImage(url));
      } catch (e) {
        imagesFailed.push({ url, error: e.message });
      }
    }
    if (!uris.length) {
      return res.status(502).json({ ok: false, error: 'Semua upload gambar gagal — produk tidak dikirim.', imagesFailed, validation });
    }

    const saveMode = String(body.saveMode || 'AS_DRAFT') === 'LISTING' ? 'LISTING' : 'AS_DRAFT';
    sentPayload = buildTtsPayload(p, validation, { categoryId, warehouseId, imageUris: uris, saveMode });

    const shopCipher = await getTtsShopCipher(true);
    const json = await ttsFetch('/product/202309/products', {
      method: 'POST',
      params: { shop_cipher: shopCipher },
      body: sentPayload,
    });

    return res.status(200).json({
      ok: true,
      message: `Produk "${p.name}" terkirim ke TikTok Shop (product_id ${json.data?.product_id ?? '-'}).`,
      productId: json.data?.product_id ?? '',
      skus: json.data?.skus || [],
      warnings: json.data?.warnings || [],
      imagesUploaded: uris.length,
      imagesFailed,
      saveMode,
      warehouse: { id: warehouseId, name: warehouseName },
      sentPayload,
      validation,
    });
  } catch (err) {
    console.error('[tokopedia/sync]', err.code || '', err.message);
    return res.status(502).json({ ok: false, error: err.message, code: err.code ?? null, tiktokData: err.data ?? null, sentPayload });
  }
}

/* ── Phase 2: inventory — push stok ke 1 SKU (adminKey + confirm + lock) ── */

async function handleInventory(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  res.setHeader('Access-Control-Allow-Origin', '*');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ ok: false, error: 'Gunakan POST.' });

  const body = req.body || {};
  const gate = checkAdminKey(req, body);
  if (!gate.ok) return res.status(401).json({ ok: false, error: gate.reason });

  const status = ttsEnvStatus();
  if (status.syncBlocked) {
    return res.status(409).json({
      ok: false,
      error: status.syncEnabled
        ? 'Kredensial/token belum lengkap — cek Status dulu.'
        : 'Sinkron TikTok terkunci. Set TOKOPEDIA_SYNC_ENABLED=true di environment Vercel, lalu Redeploy.',
      syncEnabled: status.syncEnabled,
    });
  }
  if (body.confirm !== true) return res.status(400).json({ ok: false, error: 'Push stok butuh confirm: true.' });

  try {
    const productId = String(body.productId || '').trim();
    const skuId = String(body.skuId || '').trim();
    const quantity = Number(body.quantity);
    if (!productId || !skuId) return res.status(400).json({ ok: false, error: 'productId & skuId wajib (dari hasil sync).' });
    if (!Number.isInteger(quantity) || quantity < 0) return res.status(400).json({ ok: false, error: 'quantity harus bilangan bulat >= 0.' });

    let warehouseId = String(body.warehouseId || '').trim();
    if (!warehouseId) {
      const wh = await fetchTtsWarehouses();
      warehouseId = wh.defaultId;
    }
    if (!warehouseId) return res.status(502).json({ ok: false, error: 'Tidak ada gudang aktif di toko.' });

    const shopCipher = await getTtsShopCipher(true);
    // Body mengikuti pola inventory[] yang sama dengan create-product.
    // Kalau TikTok membalas error field, sesuaikan di sini (satu baris).
    const payload = { skus: [{ id: skuId, inventory: [{ warehouse_id: warehouseId, quantity }] }] };
    const json = await ttsFetch('/product/202309/products/inventory', {
      method: 'POST',
      params: { shop_cipher: shopCipher },
      body: payload,
    });

    return res.status(200).json({
      ok: true,
      message: `Stok SKU ${skuId} diatur ke ${quantity} (gudang ${warehouseId}).`,
      tiktokData: json.data ?? null,
      sentPayload: payload,
    });
  } catch (err) {
    console.error('[tokopedia/inventory]', err.code || '', err.message);
    return res.status(502).json({ ok: false, error: err.message, code: err.code ?? null, tiktokData: err.data ?? null });
  }
}

/* ── router ─────────────────────────────────────────────────────────── */
export default async function handler(req, res) {
  const action = String((req.query && req.query.action) || '').toLowerCase();
  switch (action) {
    case 'status':
      return handleStatus(req, res);
    case 'auth-link':
      return handleAuthLink(req, res);
    case 'callback':
      return handleCallback(req, res);
    case 'refresh':
      return handleRefresh(req, res);
    case 'products':
      return handleProducts(req, res);
    case 'categories':
      return handleCategories(req, res);
    case 'warehouses':
      return handleWarehouses(req, res);
    case 'dryrun':
      return handleDryrun(req, res);
    case 'sync':
      return handleSync(req, res);
    case 'inventory':
      return handleInventory(req, res);
    default:
      res.setHeader('Cache-Control', 'no-store');
      return res.status(404).json({
        ok: false,
        error: `Endpoint /api/tokopedia/${action || '?'} tidak dikenal. Tersedia: status, auth-link, callback, refresh, products, categories, warehouses, dryrun, sync, inventory.`,
      });
  }
}
