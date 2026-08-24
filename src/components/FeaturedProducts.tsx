import { useState, useEffect } from 'react';
import { ShoppingCart, X, Info, Star, ChevronLeft, ChevronRight, ExternalLink, ChevronDown, ChevronUp } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { STORE_CONFIG } from '../data/config';

const PROJECT_IDS = ['qi4rocc0', '856jrik3'];
const DATASET = 'production';

// 🎯 LINK SHOPEE RESMI ANDA (SUDAH TERPASANG)
const OFFICIAL_SHOPEE_URL = 'https://shopee.co.id/fitnesssurabaya';
const HOMEPAGE_LIMIT = 8;

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
  const [showAll, setShowAll] = useState(false);

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

            const tagUpper = String(item.tag || '').toUpperCase().trim();
            const isFeatured = Boolean(item.isFeatured || item.featured || item.isUnggulan || item.showOnHome || tagUpper === 'UNGGULAN' || tagUpper === 'UTAMA' || (Number(tagUpper) > 0 && Number(tagUpper) <= 8));

            return {
              id: item._id,
              name: item.name || 'Produk Fitness',
              price: item.price || 0,
              description: item.description || '',
              specs: item.specs || '',
              tag: isNaN(Number(item.tag)) ? item.tag : '',
              rating: item.rating || 5,
              reviews: item.reviews || 0,
              order: Number(item.order || item.sortOrder || (isNaN(Number(item.tag)) ? 999 : item.tag)),
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

  const openDetail = (product: any) => { setSelected(product); setActiveImgIndex(0); };

  const categoryProducts = !activeCategory || activeCategory === 'Semua' ? products : products.filter(p => String(p.category).toLowerCase() === String(activeCategory).toLowerCase());
  const featuredOnly = products.filter(p => p.isFeatured);

  let displayProducts = activeCategory === 'Semua' ? (showAll ? products : (featuredOnly.length > 0 ? featuredOnly.slice(0, HOMEPAGE_LIMIT) : products.slice(0, 4))) : categoryProducts;

  const waNumber = (STORE_CONFIG.phone || '6281332345448').split(/[/,&\n]/)[0].replace(/\D/g, '');

  return (
    <section id="products" className="py-20 bg-white">
      <AnimatePresence>
        {selected && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-white w-full max-w-5xl rounded-3xl overflow-hidden shadow-2xl max-h-[94vh] flex flex-col md:flex-row relative">
              <button type="button" onClick={() => setSelected(null)} className="absolute top-4 right-4 z-20 bg-white/90 p-2 rounded-full shadow-lg hover:bg-red-600 hover:text-white transition-all"><X size={22} /></button>
              <div className="md:w-1/2 bg-gray-900 p-4 flex flex-col relative min-h-[350px]">
                <div className="relative w-full h-full rounded-2xl overflow-hidden bg-black flex items-center justify-center">
                  <img src={selected.images[activeImgIndex]} alt={selected.name} className="w-full h-full object-contain" />
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
                <div className="mb-8"><h4 className="font-bold flex items-center gap-2 mb-2 border-b pb-2 text-gray-900"><Info size={18} className="text-red-600" /> Deskripsi</h4><p className="text-gray-600 text-sm whitespace-pre-wrap">{selected.description || 'Peralatan fitness kualitas premium.'}</p></div>
                <div className="space-y-3">
                  <a href={`https://wa.me/${waNumber}?text=Halo, saya tertarik dengan produk *${encodeURIComponent(selected.name)}*`} target="_blank" rel="noopener noreferrer" className="w-full bg-green-500 hover:bg-green-600 text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-2 shadow-lg"><ShoppingCart size={20} /> Pesan via WhatsApp</a>
                  
                  {/* LINK SHOPEE DI DALAM MODAL DETAIL */}
                  <a href={selected.shopeeUrl && selected.shopeeUrl.length > 10 ? selected.shopeeUrl : OFFICIAL_SHOPEE_URL} target="_blank" rel="noopener noreferrer" className="w-full bg-[#EE4D2D] hover:bg-[#d73211] text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-2 shadow-lg">🧡 Beli di Shopee Official <ExternalLink size={18} /></a>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-12">
          <div><h2 className="text-3xl md:text-5xl font-black text-gray-900 mb-3 uppercase tracking-tighter italic">Produk Pilihan</h2><p className="text-gray-500">Rekomendasi terbaik untuk Anda.</p></div>
          <div className="flex gap-2">
            <button onClick={fetchProductsAndStore} className="bg-gray-100 hover:bg-gray-200 px-5 py-2.5 rounded-xl text-sm font-bold flex items-center gap-2">🔄 Refresh Data</button>
            <a href={OFFICIAL_SHOPEE_URL} target="_blank" rel="noopener noreferrer" className="bg-[#EE4D2D] text-white px-5 py-2.5 rounded-xl text-sm font-bold flex items-center gap-2 shadow-md hover:bg-[#d73211]">🧡 Shopee Mall</a>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-20 text-red-600 font-bold animate-pulse text-xl">⏳ Menghubungkan ke Sanity Studio...</div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {displayProducts.map((p: any) => (
                <div key={p.id} className="bg-white rounded-3xl border border-gray-100 overflow-hidden hover:shadow-2xl transition-all flex flex-col justify-between group">
                  <div className="relative aspect-square bg-gray-50 overflow-hidden">
                    <img src={p.images[0]} alt={p.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                  </div>
                  <div className="p-6">
                    <div className="text-[10px] text-red-600 font-bold uppercase mb-1">{p.category}</div>
                    <h3 className="font-bold text-gray-900 mb-2 line-clamp-2 h-10">{p.name}</h3>
                    <div className="text-xl font-black text-red-600">{formatPrice(p.price)}</div>
                  </div>
                  <div className="p-6 pt-0"><button onClick={() => openDetail(p)} className="w-full bg-gray-900 hover:bg-red-600 text-white py-3 rounded-xl text-xs font-bold transition-all shadow-md">Detail & Galeri</button></div>
                </div>
              ))}
            </div>
            {activeCategory === 'Semua' && products.length > displayProducts.length && (
              <div className="text-center mt-12">
                <button onClick={() => setShowAll(!showAll)} className="bg-gray-900 hover:bg-red-600 text-white px-8 py-4 rounded-2xl text-sm font-bold transition-all shadow-xl flex items-center gap-2 mx-auto">
                  {showAll ? <>Tampilkan Pilihan Saja <ChevronUp size={18} /></> : <>Lihat Semua Katalog Produk ({products.length}) <ChevronDown size={18} /></>}
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </section>
  );
};

export default FeaturedProducts;
