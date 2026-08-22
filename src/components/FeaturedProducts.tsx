import { useState, useEffect } from 'react';
import { ShoppingCart, X, Info, Star } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { PRODUCTS as INITIAL_PRODUCTS, STORE_CONFIG } from '../data/config';

const PROJECT_IDS = ['qi4rocc0', '856jrik3'];
const DATASET = 'production';

// Link default dari config (selalu ada)
const DEFAULT_SHOPEE =
  (STORE_CONFIG as any).shopee ||
  'https://shopee.co.id/search?keyword=toko%20fitness%20surabaya';
const DEFAULT_TOKOPEDIA =
  (STORE_CONFIG as any).tokopedia ||
  'https://www.tokopedia.com/search?st=product&q=toko%20fitness%20surabaya';
const WA =
  (STORE_CONFIG.phone || '6281332345448')
    .split(/[/,&\n]/)[0]
    .replace(/\D/g, '') || '6281332345448';

const formatPrice = (price: number) =>
  new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0
  }).format(price || 0);

const FeaturedProducts = ({
  activeCategory = 'Semua',
  onCategoryChange
}: any) => {
  const [products, setProducts] = useState<any[]>(INITIAL_PRODUCTS || []);
  const [selected, setSelected] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchProducts = async () => {
    setLoading(true);
    const query = encodeURIComponent(`*[_type == "product"] | order(_createdAt desc) {
      _id, name, price, description, specs, tag, rating, reviews,
      shopeeUrl, shopee, tokopediaUrl,
      "image": coalesce(image.asset->url, foto.asset->url, photo.asset->url, ""),
      "category": coalesce(category->title, category->name, category, "Umum")
    }`);

    let list: any[] = [];
    for (const id of PROJECT_IDS) {
      try {
        const url = `https://${id}.api.sanity.io/v2024-01-01/data/query/${DATASET}?query=${query}`;
        const res = await fetch(url, { cache: 'no-store' });
        const data = await res.json();
        if (data?.result?.length) {
          list = data.result;
          break;
        }
      } catch {
        /* coba project lain */
      }
    }

    if (list.length) {
      setProducts(
        list.map((item: any) => ({
          id: item._id,
          name: item.name || 'Produk Fitness',
          price: item.price || 0,
          description: item.description || '',
          specs: item.specs || '',
          tag: item.tag || '',
          rating: item.rating || 5,
          reviews: item.reviews || 0,
          image:
            item.image ||
            'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?q=80&w=800',
          category: item.category || 'Umum',
          // 🧡 PAKSA ADA LINK SHOPEE
          shopeeUrl: item.shopeeUrl || item.shopee || DEFAULT_SHOPEE,
          tokopediaUrl: item.tokopediaUrl || DEFAULT_TOKOPEDIA
        }))
      );
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const filtered =
    !activeCategory || activeCategory === 'Semua'
      ? products
      : products.filter(
          (p) =>
            String(p.category).toLowerCase() ===
            String(activeCategory).toLowerCase()
        );

  return (
    <section id="products" className="py-20 bg-white">
      {/* MODAL DETAIL */}
      <AnimatePresence>
        {selected && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white w-full max-w-4xl rounded-3xl overflow-hidden shadow-2xl max-h-[90vh] flex flex-col md:flex-row relative"
            >
              <button
                type="button"
                onClick={() => setSelected(null)}
                className="absolute top-4 right-4 z-10 bg-white p-2 rounded-full shadow hover:bg-red-600 hover:text-white"
              >
                <X size={22} />
              </button>
              <div className="md:w-1/2 bg-gray-100 min-h-[240px]">
                <img
                  src={selected.image}
                  alt={selected.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="md:w-1/2 p-8 overflow-y-auto">
                <div className="text-xs font-bold text-red-600 uppercase mb-2">
                  {selected.category}
                </div>
                <h2 className="text-2xl md:text-3xl font-bold mb-3">{selected.name}</h2>
                <div className="text-2xl font-black text-red-600 mb-5">
                  {formatPrice(selected.price)}
                </div>
                <div className="mb-6">
                  <h4 className="font-bold flex items-center gap-2 mb-2 border-b pb-2">
                    <Info size={16} className="text-red-600" /> Deskripsi
                  </h4>
                  <p className="text-gray-600 text-sm leading-relaxed">
                    {selected.description || 'Peralatan fitness berkualitas tinggi.'}
                  </p>
                </div>

                {/* TOMBOL ORDER */}
                <div className="space-y-3">
                  <a
                    href={`https://wa.me/${WA}?text=${encodeURIComponent(
                      `Halo Surabaya Fitness, saya tertarik *${selected.name}* (${formatPrice(
                        selected.price
                      )})`
                    )}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full bg-green-500 hover:bg-green-600 text-white py-3.5 rounded-xl font-bold flex items-center justify-center gap-2"
                  >
                    <ShoppingCart size={18} /> Pesan via WhatsApp
                  </a>

                  {/* 🧡 SHOPEE SELALU MUNCUL */}
                  <a
                    href={selected.shopeeUrl || DEFAULT_SHOPEE}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full bg-[#EE4D2D] hover:bg-[#d73211] text-white py-3.5 rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg"
                  >
                    🧡 Beli di Shopee Official
                  </a>

                  <a
                    href={selected.tokopediaUrl || DEFAULT_TOKOPEDIA}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full bg-[#03AC0E] hover:bg-[#028a0b] text-white py-3.5 rounded-xl font-bold flex items-center justify-center gap-2"
                  >
                    💚 Beli di Tokopedia
                  </a>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10">
          <div>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
              {activeCategory && activeCategory !== 'Semua'
                ? `Kategori: ${activeCategory}`
                : 'Produk Unggulan'}
            </h2>
            <p className="text-gray-600 text-sm">
              Bisa order WhatsApp atau langsung checkout di Shopee.
            </p>
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={fetchProducts}
              className="bg-gray-100 hover:bg-gray-200 px-4 py-2 rounded-lg text-sm font-bold"
            >
              🔄 Refresh
            </button>
            {/* 🧡 TOMBOL TOKO SHOPEE UTAMA */}
            <a
              href={DEFAULT_SHOPEE}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-[#EE4D2D] hover:bg-[#d73211] text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-1"
            >
              🧡 Toko Shopee Kami
            </a>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-16 text-red-600 font-bold animate-pulse">
            Memuat produk...
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 bg-gray-50 rounded-3xl border border-dashed border-gray-200">
            <p className="text-gray-500 mb-4">Belum ada produk di kategori ini.</p>
            {onCategoryChange && (
              <button
                type="button"
                onClick={() => onCategoryChange('Semua')}
                className="text-red-600 font-bold"
              >
                Lihat Semua Produk
              </button>
            )}
            <div className="mt-6">
              <a
                href={DEFAULT_SHOPEE}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex bg-[#EE4D2D] text-white px-6 py-3 rounded-xl font-bold"
              >
                🧡 Belanja di Shopee Official
              </a>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filtered.map((p: any) => (
              <div
                key={p.id}
                className="bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-xl transition-all flex flex-col"
              >
                <div className="relative aspect-square bg-gray-100 overflow-hidden">
                  <img
                    src={p.image}
                    alt={p.name}
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                  />
                  {p.tag && (
                    <span className="absolute top-3 left-3 bg-red-600 text-white text-[10px] font-bold px-2.5 py-1 rounded-full">
                      {p.tag}
                    </span>
                  )}
                </div>

                <div className="p-5 flex-1 flex flex-col">
                  <div className="text-[10px] text-gray-400 font-bold uppercase mb-1">
                    {p.category}
                  </div>
                  <h3 className="font-bold text-gray-900 mb-2 line-clamp-2">{p.name}</h3>
                  <div className="flex items-center gap-1 text-yellow-400 mb-2">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        size={12}
                        fill={i < Math.floor(p.rating || 5) ? 'currentColor' : 'none'}
                      />
                    ))}
                  </div>
                  <div className="text-lg font-black text-red-600 mb-4">
                    {formatPrice(p.price)}
                  </div>

                  <div className="mt-auto space-y-2">
                    <button
                      type="button"
                      onClick={() => setSelected(p)}
                      className="w-full bg-gray-900 hover:bg-red-600 text-white py-2.5 rounded-xl text-xs font-bold transition-colors"
                    >
                      Detail & Beli
                    </button>

                    {/* 🧡 TOMBOL SHOPEE DI SETIAP PRODUK — SELALU ADA */}
                    <a
                      href={p.shopeeUrl || DEFAULT_SHOPEE}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full bg-[#EE4D2D] hover:bg-[#d73211] text-white py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1 transition-colors"
                    >
                      🧡 Beli di Shopee
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default FeaturedProducts;
