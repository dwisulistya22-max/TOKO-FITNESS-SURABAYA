import { useState, useEffect } from 'react';
import { ShoppingCart, X, Info, Star, ChevronLeft, ChevronRight, ExternalLink, ChevronDown, ChevronUp } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { STORE_CONFIG } from '../data/config';

const PROJECT_IDS = ['qi4rocc0', '856jrik3'];
const DATASET = 'production';
const SHOPEE_FALLBACK = 'https://shopee.co.id/search?keyword=toko%20fitness%20surabaya';

// FUNGSI PEMBERSIH LINK AGRESSIF
const fixLink = (url: any) => {
  if (!url || typeof url !== 'string') return '';
  let link = url.trim();
  if (!link || link.length < 5) return '';
  
  // Jika masih ada sisa-sisa id.sh.ee yang rusak, abaikan dan pakai fallback
  if (link.includes('id.sh.ee')) return '';

  if (!link.startsWith('http://') && !link.startsWith('https://')) {
    link = 'https://' + link;
  }
  return link;
};

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
  const [globalShopee, setGlobalShopee] = useState<string>(SHOPEE_FALLBACK);

  const fetchProductsAndStore = async () => {
    setLoading(true);
    // Tambahkan Random string agar API Sanity tidak memberi data lama (Cache Buster)
    const nocache = `&t=${new Date().getTime()}`;

    const storeQuery = encodeURIComponent(`*[_type in ["storeConfig","storeInfo","settings"]][0]{
      "shopee": coalesce(shopee, shopeeUrl, ""),
      "facebook": coalesce(facebook, "")
    }`);

    const productQuery = encodeURIComponent(`*[_type == "product"] | order(_createdAt desc) {
      _id, name, price, description, specs, tag, rating, reviews,
      shopeeUrl, shopee, order, sortOrder, urutan,
      isFeatured, featured,
      "mainImage": coalesce(image.asset->url, foto.asset->url, photo.asset->url, ""),
      "galleryImages": coalesce(images[].asset->url, gallery[].asset->url, photos[].asset->url, []),
      "category": coalesce(category->title, category->name, category, "Umum")
    }`);

    for (const id of PROJECT_IDS) {
      try {
        const storeRes = await fetch(`https://${id}.api.sanity.io/v2021-10-21/data/query/${DATASET}?query=${storeQuery}${nocache}`);
        const storeData = await storeRes.json();
        
        const rawShopee = storeData?.result?.shopee;
        const rawFacebook = storeData?.result?.facebook;

        // PRIORITAS: 
        // 1. Cek Facebook (karena user mengisi link Shopee di sana)
        // 2. Cek Shopee
        // 3. Fallback jika semua mengandung 'id.sh.ee' atau kosong
        let bestLink = '';
        if (rawFacebook && (rawFacebook.includes('shopee.co.id'))) bestLink = fixLink(rawFacebook);
        else if (rawShopee && (rawShopee.includes('shopee.co.id'))) bestLink = fixLink(rawShopee);
        
        setGlobalShopee(bestLink || SHOPEE_FALLBACK);

        const prodRes = await fetch(`https://${id}.api.sanity.io/v2021-10-21/data/query/${DATASET}?query=${productQuery}${nocache}`);
        const prodData = await prodRes.json();

        if (prodData?.result?.length) {
          const mapped = prodData.result.map((item: any) => {
            const itemLink = fixLink(item.shopeeUrl || item.shopee);
            
            // Logic Featured
            const tagUpper = String(item.tag || '').toUpperCase().trim();
            const isMarked = Boolean(
              item.isFeatured || item.featured || 
              ['UNGGULAN', 'UTAMA', 'DEPAN'].includes(tagUpper) ||
              (!isNaN(Number(tagUpper)) && Number(tagUpper) > 0 && Number(tagUpper) <= 20)
            );

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
              isFeatured: isMarked,
              images: (item.mainImage ? [item.mainImage, ...item.galleryImages] : item.galleryImages).filter(Boolean),
              category: item.category || 'Umum',
              shopeeUrl: itemLink || bestLink || SHOPEE_FALLBACK
            };
          });

          mapped.sort((a: any, b: any) => a.order - b.order);
          setProducts(mapped);
          break;
        }
      } catch (err) { console.error(err); }
    }
    setLoading(false);
  };

  useEffect(() => { fetchProductsAndStore(); }, []);
  useEffect(() => { setShowAll(false); }, [activeCategory]);

  const filteredByCategory = !activeCategory || activeCategory === 'Semua' 
    ? products 
    : products.filter(p => String(p.category).toLowerCase() === String(activeCategory).toLowerCase());

  const displayProducts = activeCategory === 'Semua' && !showAll
    ? (products.filter(p => p.isFeatured).length > 0 ? products.filter(p => p.isFeatured) : products.slice(0, 8))
    : filteredByCategory;

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
                <div className="space-y-6 mb-8">
                   <div><h4 className="font-bold flex items-center gap-2 mb-2 border-b pb-2"><Info size={18} className="text-red-600" /> Deskripsi</h4><p className="text-gray-600 text-sm whitespace-pre-wrap">{selected.description || 'Peralatan fitness premium.'}</p></div>
                </div>
                <div className="space-y-3">
                  <a href={`https://wa.me/${waNumber}?text=Halo, saya tertarik dengan produk *${encodeURIComponent(selected.name)}*`} target="_blank" rel="noopener noreferrer" className="w-full bg-green-500 hover:bg-green-600 text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-2 shadow-lg"><ShoppingCart size={20} /> Pesan via WhatsApp</a>
                  <a href={selected.shopeeUrl} target="_blank" rel="noopener noreferrer" className="w-full bg-[#EE4D2D] hover:bg-[#d73211] text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-2 shadow-lg">🧡 Beli di Shopee <ExternalLink size={18} /></a>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-12">
          <div><h2 className="text-3xl md:text-5xl font-black text-gray-900 mb-3 uppercase italic italic">Produk Pilihan</h2><p className="text-gray-500">Peralatan fitness rekomendasi terbaik.</p></div>
          <div className="flex gap-2">
            <button onClick={fetchProductsAndStore} className="bg-gray-100 hover:bg-gray-200 px-5 py-2.5 rounded-xl text-sm font-bold flex items-center gap-2">🔄 Refresh Data</button>
            <a href={globalShopee} target="_blank" rel="noopener noreferrer" className="bg-[#EE4D2D] text-white px-5 py-2.5 rounded-xl text-sm font-bold flex items-center gap-2 shadow-md">🧡 Shopee Mall</a>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-20 text-red-600 font-bold animate-pulse text-xl">⏳ Menghubungkan...</div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {displayProducts.map((p: any) => (
                <div key={p.id} className="bg-white rounded-3xl border border-gray-100 overflow-hidden hover:shadow-2xl transition-all flex flex-col justify-between group">
                  <div className="relative aspect-square bg-gray-50 overflow-hidden">
                    <img src={p.images[0]} alt={p.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                    {p.tag && <span className="absolute top-4 left-4 bg-red-600 text-white text-[10px] font-black px-3 py-1 rounded-full uppercase">{p.tag}</span>}
                  </div>
                  <div className="p-6">
                    <div className="text-[10px] text-red-600 font-bold uppercase mb-1">{p.category}</div>
                    <h3 className="font-bold text-gray-900 mb-2 line-clamp-2 h-10">{p.name}</h3>
                    <div className="text-xl font-black text-red-600">{formatPrice(p.price)}</div>
                    <div className="mt-4 space-y-2">
                      <button onClick={() => {setSelected(p); setActiveImgIndex(0);}} className="w-full bg-gray-900 text-white py-2.5 rounded-xl text-xs font-bold">Detail</button>
                      <a href={p.shopeeUrl} target="_blank" rel="noopener noreferrer" className="w-full bg-[#EE4D2D]/10 text-[#EE4D2D] py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1 border border-[#EE4D2D]/20">🧡 Shopee</a>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            {activeCategory === 'Semua' && products.length > displayProducts.length && (
              <div className="text-center mt-12">
                <button onClick={() => setShowAll(!showAll)} className="bg-gray-900 text-white px-8 py-4 rounded-2xl text-sm font-bold flex items-center gap-2 mx-auto shadow-xl">
                  {showAll ? <>Tampilkan Pilihan Saja <ChevronUp size={18}/></> : <>Lihat Semua Katalog ({products.length}) <ChevronDown size={18}/></>}
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
