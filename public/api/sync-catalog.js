// api/sync-catalog.js
// Webhook Sanity → update 1 produk ke Meta Catalog (WA Business)

export default async function handler(req, res) {
  // CORS preflight (opsional)
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Proteksi sederhana pakai secret
    const secret = req.headers['x-sanity-secret'] || req.headers['authorization'];
    const expected = process.env.SANITY_WEBHOOK_SECRET || '';
    if (expected && secret !== expected && secret !== `Bearer ${expected}`) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const catalogId = process.env.META_CATALOG_ID;
    const token = process.env.META_ACCESS_TOKEN;

    if (!catalogId || !token) {
      return res.status(500).json({
        error: 'META_CATALOG_ID atau META_ACCESS_TOKEN belum diisi di Vercel',
      });
    }

    const body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : (req.body || {});

    // Payload dari Sanity webhook
    const {
      _id,
      _type,
      name,
      price,
      description,
      category,
      image,
      transition, // create | update | delete (tergantung setting webhook)
    } = body;

    if (_type && _type !== 'product') {
      return res.status(200).json({ ok: true, skipped: true, reason: 'not a product' });
    }

    const retailerId = _id; // ID unik produk di catalog = Sanity _id
    if (!retailerId) {
      return res.status(400).json({ error: 'Missing product _id' });
    }

    // Jika produk dihapus di Sanity → hapus/arsip di catalog
    if (transition === 'delete' || body.operation === 'delete') {
      const delUrl = `https://graph.facebook.com/v19.0/${catalogId}/items_batch`;
      const delRes = await fetch(delUrl, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          item_type: 'PRODUCT_ITEM',
          requests: [
            {
              method: 'DELETE',
              data: { id: retailerId },
            },
          ],
        }),
      });
      const delJson = await delRes.json();
      return res.status(200).json({ ok: true, action: 'delete', result: delJson });
    }

    // Normalisasi kategori (bisa string atau object dari projection)
    const productType =
      (typeof category === 'string' && category) ||
      category?.title ||
      category?.name ||
      'Fitness';

    const imageUrl =
      image?.asset?.url ||
      image ||
      body.image_url ||
      'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?q=80&w=800';

    const priceNumber = Number(price) || 0;
    // Meta: price string + currency, contoh "21500000 IDR"
    const priceFormatted = `${priceNumber} IDR`;

    const productPayload = {
      method: 'UPDATE',
      data: {
        id: retailerId,
        title: name || 'Produk Fitness',
        description: (description || 'Peralatan fitness premium').toString().slice(0, 5000),
        availability: 'in stock',
        condition: 'new',
        price: priceFormatted,
        link: 'https://tokofitnesssurabaya.com',
        image_link: imageUrl,
        brand: 'Toko Fitness Surabaya',
        product_type: productType,
        google_product_category: '4997',
      },
    };

    // Batch API catalog (create/update by retailer id)
    const url = `https://graph.facebook.com/v19.0/${catalogId}/items_batch`;
    const metaRes = await fetch(url, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        item_type: 'PRODUCT_ITEM',
        requests: [productPayload],
      }),
    });

    const metaJson = await metaRes.json();

    if (!metaRes.ok) {
      console.error('Meta error:', metaJson);
      return res.status(502).json({ ok: false, error: metaJson });
    }

    return res.status(200).json({ ok: true, action: 'upsert', result: metaJson });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: err.message || 'Internal error' });
  }
}
