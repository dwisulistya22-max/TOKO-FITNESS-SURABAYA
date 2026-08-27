import { useState, useEffect } from 'react';
import { ShoppingCart, X, Info, Star, ChevronLeft, ChevronRight, ExternalLink, ChevronDown, ChevronUp, Share2, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { STORE_CONFIG } from '../data/config';

const PROJECT_IDS = ['qi4rocc0', '856jrik3'];
const DATASET = 'production';
const OFFICIAL_SHOPEE_URL = 'https://shopee.co.id/fitnesssurabaya';
const HOMEPAGE_LIMIT = 8;

const formatPrice = (price: number) =>
  new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(price || 0);

const FeaturedProducts = ({ activeCategory = 'Semua' }: any) => {
  const [products, setProducts] = useState<any[]>([]);
  const [selected, setSelected] = useState<any>(null);
  const [activeImgIndex, setActiveImgIndex] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [showAll, setShowAll] = useState(false);
  const [copied, setCopied] = useState(false);

  const fetchProductsAndStore = async () => {
    setLoading(true);
    const productQuery = encodeURIComponent(`*[_type == "product"] | order(_createdAt desc) {
      _id, name, price, description, specs, tag, rating, reviews,
      shopeeUrl, shopee, order, sortOrder, urutan,
      isFeatured, featured, isUnggulan, showOnHome,
      "mainImage": coalesce(image.asset->url, foto.asset->url, photo.asset->url, ""),
      "galleryImages": coalesce(images[].asset->url, gallery[].asset->url, photos[].asset->url, []),
      "category": coalesce(category->title, category->name, category, "Umum")
    }`);

    for (const id of PROJECT_IDS) {
      try {
        const prodRes = await fetch(`https://${id}.api.sanity.io/v2024-01-01/data/query/${DATASET}?query=${productQuery}`, { cache: 'no-store' });
        const prodData = await prodRes.json();
        if (prodData?.result?.length) {
          const mappedProducts = prodData.result.map((item: any) => {
            const allImages: string[] = [];
            if (item.mainImage) allImages.push(item.mainImage);
            if (Array.isArray(item.galleryImages)) {
              item.galleryImages.forEach((img: string) => { if (img) allImages.push(img); });
            }
            if (allImages.length === 0) allImages.push('https://images.unsplash.com/photo-1517836357463-d25dfeac3438?q=80&w=800');
            const productRating = Number(item.rating || 5);
            const isFeatured = Boolean(productRating >= 5 || item.isFeatured || item.featured);
            return {
              id: item._id,
              name: item.name || 'Produk Fitness',
              price: item.price || 0,
              description: item.description || '',
              specs: item.specs || '',
              tag: item.tag || '',
              rating: productRating,
              reviews: item.reviews || 0,
              order: Number(item.order || 999),
              isFeatured,
              images: allImages,
              category: item.category || 'Umum',
              shopeeUrl: item.shopeeUrl || item.shopee || ''
            };
          });
          mappedProducts.sort((a: any, b: any) => a.order - b.order);
          setProducts(mappedProducts);
          break;
        }
      } catch (err) { console.error(err); }
    }
    setLoading(false);
  };

  useEffect(() => { fetchProductsAndStore(); }, []);
  useEffect(() => { setShowAll(false); }, [activeCategory]);

  const openDetail = (product: any) => {
    setSelected(product);
    setActiveImgIndex(0);
    setCopied(false);
  };

  // 🔗 FUNGSI BAGIKAN PRODUK (FIXED: AKTIF DI HP & LAPTOP)
  const handleShareProduct = (product: any) => {
    const shareText = `Cek *${product.name}* harga ${formatPrice(product.price)} hanya di Toko Fitness Surabaya!\n\nLihat selengkapnya di website kami:\nhttps://tokofitnesssurabaya.com`;

    if (navigator.share) {
      // Untuk HP (Android / iPhone)
      navigator.share({
        title: 'Toko Fitness Surabaya',
        text: shareText,
        url: 'https://tokofitnesssurabaya.com',
      }).catch(() => {
        // Jika gagal/cancel, buka WhatsApp sebagai cadangan
        window.open(`https://wa.me/?text=${encodeURIComponent(shareText)}`, '_blank');
      });
    } else {
      // Untuk Laptop / Desktop (Langsung buka WhatsApp Web)
      window.open(`https://wa.me/?text=${encodeURIComponent(shareText)}`, '_blank');
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    }
  };

  const categoryProducts = !activeCategory || activeCategory === 'Semua' ? products : products.filter(p => String(p.category).toLowerCase() === String(activeCategory).toLowerCase());
  const featuredOnly = products.filter(p => p.isFeatured);
  let displayProducts = activeCategory === 'Semua' ? (showAll ? products : (featuredOnly.length > 0 ? featuredOnly.slice(0, HOMEPAGE_LIMIT) : products.slice(0, 4))) : categoryProducts;

  const waNumber = (STORE_CONFIG.phone || '6281332345448').split(/[/,&\n]/)[0].replace(/\D/g, '');

  return (
    <section id="products" className="py-20 bg-white select-none" onContextMenu={(e) => e.preventDefault()}>
      <AnimatePresence>
        {selected && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-white w-full max-w-5xl rounded-3xl overflow-hidden shadow-2xl max-h-[94vh] flex flex-col md:flex-row relative">
              <button onClick={() => setSelected(null)} className="absolute top-4 right-4 z-20 bg-white/90 p-2 rounded-full shadow-lg hover:bg-red-600 hover:text-white transition-all"><X size={22} /></button>
              <div className="md:w-1/2 bg-gray-900 p-4 flex flex-col relative min-h-[350px]">
                <div className="relative w-full h-full rounded-2xl overflow-hidden bg-black flex items-center justify-center group">
                  <img src={selected.images[activeImgIndex]} alt={selected.name} draggable={false} className="w-full h-full object-contain pointer-events-none" />
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-20">
                    <div className="bg-black/80 text-white font-black text-xs sm:text-base uppercase tracking-widest px-4 py-2 rounded-2xl border-2 border-white/40 italic rotate-[-12deg] text-center shadow-2xl">OFFICIAL • TOKO FITNESS SURABAYA</div>
                  </div>
                  {selected.images.length > 1 && (
                    <>
                      <button onClick={() => setActiveImgIndex(prev => prev === 0 ? selected.images.length - 1 : prev - 1)} className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 text-white p-2 rounded-full"><ChevronLeft size={20}/></button>
                      <button onClick={() => setActiveImgIndex(prev => prev === selected.images.length - 1 ? 0 : prev + 1)} className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 text-white p-2 rounded-full"><ChevronRight size={20}/></button>
                    </>
                  )}
                </div>
              </div>
              <div className="md:w-1/2 p-8 overflow-y-auto">
                <div className="text-xs font-bold text-red-600 uppercase mb-2">{selected.category}</div>
                <h2 className="text-3xl font-bold text-gray-900 mb-3">{selected.name}</h2>
                <div className="text-2xl font-black text-red-600 mb-6">{formatPrice(selected.price)}</div>
                <div className="mb-8 border-t pt-4">
                  <h4 className="font-bold flex items-center gap-2 mb-2 text-gray-900"><Info size={18} className="text-red-600" /> Deskripsi Produk</h4>
                  <p className="text-gray-600 text-sm leading-relaxed whitespace-pre-wrap">{selected.description || 'Peralatan fitness kualitas premium.'}</p>
                </div>
                <div className="space-y-3">
                  <a href={`https://wa.me/${waNumber}?text=Halo, saya tertarik dengan produk *${encodeURIComponent(selected.name)}*`} target="_blank" rel="noopener noreferrer" className="w-full bg-green-500 hover:bg-green-600 text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-2 shadow-lg"><ShoppingCart size={20} /> Pesan via WhatsApp</a>
                  <button onClick={() => handleShareProduct(selected)} className="w-full bg-gray-100 hover:bg-gray-200 text-gray-800 border border-gray-200 py-3.5 rounded-2xl font-bold flex items-center justify-center gap-2 transition-all">
                    {copied ? <><Check size={18} className="text-green-600"/> <span className="text-green-600">Berbagi via WhatsApp...</span></> : <><Share2 size={18} className="text-red-600" /> <span>Bagikan Produk Ini Ke Teman</span></>}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-12">
          <div><h2 className="text-3xl md:text-5xl font-black text-gray-900 mb-3 uppercase tracking-tighter italic">Produk Pilihan</h2><p className="text-gray-500">Rekomendasi terbaik Toko Fitness Surabaya.</p></div>
          <div className="flex gap-2">
            <a href={OFFICIAL_SHOPEE_URL} target="_blank" rel="noopener noreferrer" className="bg-[#EE4D2D] text-white px-5 py-2.5 rounded-xl text-sm font-bold flex items-center gap-2 shadow-md hover:bg-[#d73211]">🧡 Shopee Mall</a>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-20 text-red-600 font-bold animate-pulse text-xl">⏳ Menghubungkan ke Sanity Studio...</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {displayProducts.map((p: any) => (
              <div key={p.id} className="bg-white rounded-3xl border border-gray-100 overflow-hidden hover:shadow-2xl transition-all flex flex-col justify-between group">
                <div className="relative aspect-square bg-gray-50 overflow-hidden">
                  <img src={p.images[0]} alt={p.name} draggable={false} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 pointer-events-none" />
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-25">
                    <div className="bg-black/70 text-white font-black text-[10px] uppercase tracking-widest px-3 py-1 rounded-xl border border-white/30 italic rotate-[-10deg] text-center">OFFICIAL • TOKO FITNESS SURABAYA</div>
                  </div>
                  {p.images.length > 1 && <span className="absolute bottom-4 right-4 bg-black/60 text-white text-[10px] font-bold px-2.5 py-1 rounded-lg backdrop-blur-md">📷 {p.images.length} FOTO</span>}
                </div>
                <div className="p-6">
                  <div className="text-[10px] text-red-600 font-bold uppercase mb-1">{p.category}</div>
                  <h3 className="font-bold text-gray-900 mb-2 line-clamp-2 h-10">{p.name}</h3>
                  <div className="text-xl font-black text-red-600">{formatPrice(p.price)}</div>
                  <button onClick={() => openDetail(p)} className="w-full bg-gray-900 hover:bg-red-600 text-white mt-4 py-3 rounded-xl text-xs font-bold transition-all">Detail & Galeri</button>
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
