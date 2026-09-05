// api/katalog.js
// Feed CSV otomatis untuk Meta / WhatsApp Catalog
// Buka: https://tokofitnesssurabaya.com/api/katalog

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Cache-Control', 's-maxage=300, stale-while-revalidate=600');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
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
      try {
        const r = await fetch(
          `https://${id}.api.sanity.io/v2024-01-01/data/query/${dataset}?query=${query}`,
          { cache: 'no-store' }
        );
        const data = await r.json();
        if (data.result && data.result.length > 0) {
          products = data.result;
          break;
        }
      } catch (e) {
        console.error('Sanity error', id, e.message);
      }
    }

    if (!products.length) {
      res.statusCode = 404;
      res.setHeader('Content-Type', 'text/plain; charset=utf-8');
      return res.end('No products');
    }

    const clean = (t) =>
      String(t ?? '')
        .replace(/"/g, '""')
        .replace(/\r?\n/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();

    const header =
      'id,title,description,availability,condition,price,link,image_link,brand,product_type,google_product_category';

    const lines = products.map((p) => {
      const title = clean(p.name || 'Produk Fitness');
      const desc = clean(p.description || 'Peralatan fitness premium');
      const price = `${Number(p.price) || 0} IDR`;
      const img =
        p.image ||
        'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?q=80&w=800';
      const cat = clean(p.category || 'Fitness');

      return [
        p._id,
        `"${title}"`,
        `"${desc}"`,
        'in stock',
        'new',
        `"${price}"`,
        'https://tokofitnesssurabaya.com',
        img,
        '"Toko Fitness Surabaya"',
        `"${cat}"`,
        '4997',
      ].join(',');
    });

    const csv = '\uFEFF' + header + '\n' + lines.join('\n');

    res.statusCode = 200;
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    return res.end(csv);
  } catch (err) {
    console.error(err);
    res.statusCode = 500;
    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    return res.end('Error');
  }
}
