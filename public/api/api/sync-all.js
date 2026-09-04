// api/sync-all.js
// Ambil semua produk Sanity → batch update ke Meta Catalog

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const secret = req.headers['x-admin-secret'] || '';
    // pakai password admin yang sama, atau env khusus
    if (secret !== (process.env.ADMIN_SYNC_SECRET || 'dwie_300776')) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const catalogId = process.env.META_CATALOG_ID;
    const token = process.env.META_ACCESS_TOKEN;
    if (!catalogId || !token) {
      return res.status(500).json({ error: 'Env Meta belum lengkap' });
    }

    const projectIds = ['qi4rocc0', '856jrik3'];
    const dataset = 'production';
    const query = encodeURIComponent(`*[_type == "product"]{
      _id,
      name,
      price,
      description,
      "category": coalesce(
        category->title,
        category->name,
        kategori->title,
        kategori->name,
        category,
        kategori,
        "Fitness"
      ),
      "image": coalesce(image.asset->url, foto.asset->url, photo.asset->url, "")
    }`);

    let products = [];
    for (const id of projectIds) {
      const r = await fetch(
        `https://${id}.api.sanity.io/v2024-01-01/data/query/${dataset}?query=${query}`,
        { cache: 'no-store' }
      );
      const data = await r.json();
      if (data.result?.length) {
        products = data.result;
        break;
      }
    }

    if (!products.length) {
      return res.status(404).json({ error: 'Produk tidak ditemukan di Sanity' });
    }

    // Meta batch max ~50 item per request — kita chunk
    const chunkSize = 40;
    const results = [];

    for (let i = 0; i < products.length; i += chunkSize) {
      const chunk = products.slice(i, i + chunkSize);
      const requests = chunk.map((p) => ({
        method: 'UPDATE',
        data: {
          id: p._id,
          title: p.name || 'Produk Fitness',
          description: String(p.description || 'Peralatan fitness premium').slice(0, 5000),
          availability: 'in stock',
          condition: 'new',
          price: `${Number(p.price) || 0} IDR`,
          link: 'https://tokofitnesssurabaya.com',
          image_link:
            p.image ||
            'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?q=80&w=800',
          brand: 'Toko Fitness Surabaya',
          product_type: p.category || 'Fitness',
          google_product_category: '4997',
        },
      }));

      const metaRes = await fetch(
        `https://graph.facebook.com/v19.0/${catalogId}/items_batch`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            item_type: 'PRODUCT_ITEM',
            requests,
          }),
        }
      );
      results.push(await metaRes.json());
    }

    return res.status(200).json({
      ok: true,
      total: products.length,
      batches: results.length,
      results,
    });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
