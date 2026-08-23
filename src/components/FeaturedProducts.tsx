import { useState, useEffect } from 'react';
import { ShoppingCart, X, Info, Star, ChevronLeft, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { STORE_CONFIG } from '../data/config';

const PROJECT_IDS = ['qi4rocc0', '856jrik3'];
const DATASET = 'production';

const formatPrice = (price: number) =>
  new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0
  }).format(price || 0);

const FeaturedProducts = ({ activeCategory = 'Semua' }: any) => {
  const [products, setProducts] = useState<any[]>([]);
  const [selected, setSelected] = useState<any>(null);
  const [activeImgIndex, setActiveImgIndex] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [globalShopee, setGlobalShopee] = useState<string>('https://id.sh.ee/PEdSUDy6');

  const fetchProductsAndStore = async () => {
    setLoading(true);

    // Query untuk mengambil foto utama & array foto tambahan (images / gallery)
    const productQuery = encodeURIComponent(`*[_type == "product"] | order(_createdAt desc) {
      _id, name, price, description, specs, tag, rating, reviews,
      shopeeUrl, shopee,
      "mainImage": coalesce(image.asset->url, foto.asset->url, photo.asset->url, ""),
      "galleryImages": coalesce(images[].asset->url, gallery[].asset->url, photos[].asset->url, []),
      "category": coalesce(category->title, category->name, category, "Umum")
    }`);

    for (const id of PROJECT_IDS) {
      try {
        const prodRes = await fetch(`https://${id}.api.sanity.io/v2024-01-01/data/query/${DATASET}?query=${productQuery}`, { cache: 'no-store' });
        const prodData = await prodRes.json();

        if (prodData?.result?.length) {
          setProducts(
            prodData.result.map((item: any) => {
              // GABUNGKAN FOTO UTAMA DAN FOTO GALERI
              const allImages: string[] = [];
              if (item.mainImage) allImages.push(item.mainImage);
              if (Array.isArray(item.galleryImages)) {
                item.galleryImages.forEach((img: string) => {
                  if (img && !allImages.includes(img)) allImages.push(img);
                });
              }
              if (allImages.length === 0) {
                allImages.push('https://images.unsplash.com/photo-1517836357463-d25dfeac3438?q=80&w=800');
              }

              return {
                id: item._id,
                name: item.name || 'Produk Fitness',
                price: item.price || 0,
                description: item.description || '',
                specs: item.specs || '',
                tag: item.tag || '',
                rating: item.rating || 5,
                reviews: item.reviews || 0,
                images: allImages,
                category: item.category || 'Umum',
                shopeeUrl: item.shopeeUrl || item.shopee || globalShopee
              };
            })
          );
          break;
        }
      } catch (err) {
        console.error(err);
      }
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchProductsAndStore();
  }, []);

  const openDetail = (product: any) => {
    setSelected(product);
    setActiveImgIndex(0); // Reset ke foto pertama
  };

  const filtered = !activeCategory || activeCategory === 'Semua'
    ? products
    : products.filter((p) => String(p.category).toLowerCase() === String(activeCategory).toLowerCase());

  const waNumber = (STORE_CONFIG.phone || '6281332345448').split(/[/,&\n]/)[0].replace(/\D/g, '');

  return (
    <section id="products" className="py-20 bg-white">
      {/* ========================================================= */}
      {/* MODAL DETAIL PRODUK DENGAN GALERI FOTO BISA DIGESER       */}
      {/* ========================================================= */}
      <AnimatePresence>
        {selected && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-white w-full max-w-4xl rounded-3xl overflow-hidden shadow-2xl max-h-[92vh] flex flex-col md:flex-row relative">
              
              {/* TOMBOL CLOSE (X) */}
              <button type="button" onClick={() => setSelected(null)} className="absolute top-4 right-4 z-20 bg-white/90 p-2 rounded-full shadow-lg hover:bg-red-600 hover:text-white transition-all cursor-pointer">
                <X size={22} />
              </button>

              {/* KOLOM KIRI: SLIDER / GALERI FOTO */}
              <div className="md:w-1/2 bg-gray-900 p-4 flex flex-col justify-between relative">
                
                {/* FOTO UTAMA DENGAN PANAH NAVIGASI */}
                <div className="relative w-full h-[320px] sm:h-[380px] rounded-2xl overflow-hidden bg-black flex items-center justify-center">
                  <img src={selected.images[activeImgIndex]} alt={selected.name} className="w-full h-full object-contain transition-all duration-300" />
                  
                  {/* PANAH KIRI & KANAN (HANYA MUNCUL JIKA FOTO LEBIH DARI 1) */}
                  {selected.images.length > 1 && (
                    <>
                      <button 
                        onClick={() => setActiveImgIndex((prev) => (prev === 0 ? selected.images.length - 1 : prev - 1))}
                        className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/60 hover:bg-red-600 text-white p-2 rounded-full transition-all"
                      >
                        <ChevronLeft size={22} />
                      </button>
                      <button 
                        onClick={() => setActiveImgIndex((prev) => (prev === selected.images.length - 1 ? 0 : prev + 1))}
                        className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/60 hover:bg-red-600 text-white p-2 rounded-full transition-all"
                      >
                        <ChevronRight size={22} />
                      </button>
                    </>
                  )}
                </div>

                {/* THUMBNAILS (FOTO KECIL-KECIL DI BAWAHNYA) */}
                {selected.images.length > 1 && (
                  <div className="flex gap-2 mt-3 overflow-x-auto pb-1 justify-center">
                    {selected.images.map((img: string, idx: number) => (
                      <button
                        key={idx}
                        onClick={() => setActiveImgIndex(idx)}
                        className={`w-14 h-14 rounded-xl overflow-hidden border-2 transition-all shrink-0 cursor-pointer ${
                          activeImgIndex === idx ? 'border-red-500 scale-105 shadow-lg' : 'border-gray-700 opacity-60 hover:opacity-100'
                        }`}
                      >
                        <img src={img} alt="thumb" className="w-full h-full object-cover" />
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* KOLOM KANAN: DESKRIPSI & TOMBOL BUKAN/PEMBELIAN */}
              <div className="md:w-1/2 p-6 sm:p-8 overflow-y-auto">
                <div className="text-xs font-bold text-red-600 uppercase tracking-wider mb-2">{selected.category}</div>
                <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3 leading-tight">{selected.name}</h2>
                <div className="text-2xl font-black text-red-600 mb-5">{formatPrice(selected.price)}</div>
                
                <div className="mb-6 space-y-4">
                  <div>
                    <h4 className="font-bold flex items-center gap-2 mb-2 border-b pb-2 text-gray-900"><Info size={16} className="text-red-600" /> Deskripsi</h4>
                    <p className="text-gray-600 text-sm leading-relaxed whitespace-pre-wrap">{selected.description || 'Peralatan fitness berkualitas tinggi dengan standar komersial & home use.'}</p>
                  </div>

                  {selected.specs && (
                    <div>
                      <h4 className="font-bold text-gray-900 text-xs mb-1">Spesifikasi Teknis:</h4>
                      <p className="text-gray-500 text-xs leading-relaxed whitespace-pre-wrap">{selected.specs}</p>
                    </div>
                  )}
                </div>

                <div className="space-y-3 pt-2">
                  <a href={`https://wa.me/${waNumber}?text=Halo%20Surabaya%20Fitness,%20saya%20tertarik%20dengan%20produk%20*${encodeURIComponent(selected.name)}*`} target="_blank" rel="noopener noreferrer" className="w-full bg-green-500 hover:bg-green-600 text-white py-3.5 rounded-xl font-bold flex items-center justify-center gap-2 shadow-md transition-all">
                    <ShoppingCart size={18} /> Pesan via WhatsApp
                  </a>

                  <a href={selected.shopeeUrl || globalShopee} target="_blank" rel="noopener noreferrer" className="w-full bg-[#EE4D2D] hover:bg-[#d73211] text-white py-3.5 rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg transition-all">
                    🧡 Beli di Shopee Official
                  </a>
                </div>
              </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ========================================================= */}
      {/* KATALOG PRODUK UNGGULAN GRID                              */}
      {/* ========================================================= */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10">
          <div>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
              {activeCategory && activeCategory !== 'Semua' ? `Kategori: ${activeCategory}` : 'Produk Unggulan'}
            </h2>
            <p className="text-gray-600 text-sm">Bisa order WhatsApp atau langsung checkout di Shopee.</p>
          </div>
          <div className="flex gap-2">
            <button type="button" onClick={fetchProductsAndStore} className="bg-gray-100 hover:bg-gray-200 px-4 py-2 rounded-lg text-sm font-bold cursor-pointer">
              🔄 Refresh
            </button>
            <a href={globalShopee} target="_blank" rel="noopener noreferrer" className="bg-[#EE4D2D] hover:bg-[#d73211] text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-1 shadow-md">
              🧡 Toko Shopee Kami
            </a>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-16 text-red-600 font-bold animate-pulse">Memuat katalog produk dari Sanity...</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filtered.map((p: any) => (
              <div key={p.id} className="bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-xl transition-all flex flex-col justify-between">
                <div>
                  <div className="relative aspect-square bg-gray-100 overflow-hidden">
                    <img src={p.images[0]} alt={p.name} className="w-full h-full object-cover hover:scale-105 transition-transform duration-500" />
                    {p.tag && <span className="absolute top-3 left-3 bg-red-600 text-white text-[10px] font-bold px-2.5 py-1 rounded-full">{p.tag}</span>}
                    {p.images.length > 1 && (
                      <span className="absolute bottom-3 right-3 bg-black/70 text-white text-[10px] font-bold px-2 py-0.5 rounded-md backdrop-blur-sm">
                        📷 {p.images.length} Foto
                      </span>
                    )}
                  </div>

                  <div className="p-5 flex-1 flex flex-col">
                    <div className="text-[10px] text-gray-400 font-bold uppercase mb-1">{p.category}</div>
                    <h3 className="font-bold text-gray-900 mb-2 line-clamp-2">{p.name}</h3>
                    <div className="flex items-center gap-1 text-yellow-400 mb-2">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} size={12} fill={i < Math.floor(p.rating || 5) ? 'currentColor' : 'none'} />
                      ))}
                    </div>
                    <div className="text-lg font-black text-red-600 mb-4">{formatPrice(p.price)}</div>
                  </div>
                </div>

                <div className="p-5 pt-0 space-y-2">
                  <button type="button" onClick={() => openDetail(p)} className="w-full bg-gray-900 hover:bg-red-600 text-white py-2.5 rounded-xl text-xs font-bold transition-colors cursor-pointer">
                    Detail & Galeri Foto
                  </button>
                  <a href={p.shopeeUrl || globalShopee} target="_blank" rel="noopener noreferrer" className="w-full bg-[#EE4D2D] hover:bg-[#d73211] text-white py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1 transition-colors">
                    🧡 Beli di Shopee
                  </a>
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
