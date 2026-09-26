import { useState, useEffect, useRef } from 'react';
import { ShoppingCart, X, Info, Star, ChevronLeft, ChevronRight, ExternalLink, ChevronDown, ChevronUp, Share2, Check, Search } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { STORE_CONFIG } from '../data/config';
import { useCatalog } from '../catalog';
import { productDomId, productMatchesQuery, searchRelevance } from '../utils/productSearch';

// 🎯 LINK SHOPEE RESMI ANDA
const OFFICIAL_SHOPEE_URL = 'https://shopee.co.id/fitnesssurabaya';
const HOMEPAGE_LIMIT = 8;

// 🛒 IKON TAS SHOPEE ASLI
const ShopeeIcon = ({ className = "w-4 h-4" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M19 7h-3V6a4 4 0 0 0-8 0v1H5a1 1 0 0 0-1 1v11a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8a1 1 0 0 0-1-1zm-9-1a2 2 0 0 1 4 0v1h-4V6zm8 13H6V9h2v1a1 1 0 0 0 2 0V9h4v1a1 1 0 0 0 2 0V9h2v10z"/>
  </svg>
);

const formatPrice = (price: number) =>
  new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(price || 0);

const FeaturedProducts = ({ activeCategory = 'Semua' }: any) => {
  const {
    products,
    loading,
    error,
    reload,
    selected,
    highlightId,
    focusToken,
    searchQuery,
    setSearchQuery,
    openProduct,
    isStrayClick,
    closeProduct,
    clearSearch,
  } = useCatalog();
  const [activeImgIndex, setActiveImgIndex] = useState<number>(0);
  const [showAll, setShowAll] = useState(false);
  const [copied, setCopied] = useState(false);
  const scrolledToken = useRef<string | null>(null);

  useEffect(() => { setShowAll(false); }, [activeCategory]);
  useEffect(() => { setActiveImgIndex(0); setCopied(false); }, [selected?.id]);

  const openDetail = (product: any) => {
    if (isStrayClick()) return;
    openProduct(product);
  };
  const closeDetail = () => closeProduct();

  const handleShareProduct = (product: any) => {
    const shareText = `Cek *${product.name}* harga ${formatPrice(product.price)} hanya di Toko Fitness Surabaya!\n\nLihat selengkapnya di website kami:\nhttps://tokofitnesssurabaya.com`;

    if (navigator.share) {
      navigator.share({
        title: 'Toko Fitness Surabaya',
        text: shareText,
        url: 'https://tokofitnesssurabaya.com',
      }).catch(() => {
        window.open(`https://wa.me/?text=${encodeURIComponent(shareText)}`, '_blank');
      });
    } else {
      window.open(`https://wa.me/?text=${encodeURIComponent(shareText)}`, '_blank');
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    }
  };

  const normalizedQuery = searchQuery.trim();
  const focusProduct = selected && normalizedQuery && (selected.id === highlightId) ? selected : null;

  const categoryProducts =
    !activeCategory || activeCategory === 'Semua'
      ? products
      : products.filter(
          (p) => String(p.category).toLowerCase() === String(activeCategory).toLowerCase()
        );

  const featuredOnly = products.filter((p) => p.isFeatured);

  let displayProducts: any[] = [];
  if (normalizedQuery) {
    displayProducts = products
      .filter((product) => productMatchesQuery(product, normalizedQuery) || product.id === focusProduct?.id)
      .sort((a, b) => {
        if (focusProduct) {
          if (a.id === focusProduct.id) return -1;
          if (b.id === focusProduct.id) return 1;
        }
        return searchRelevance(a, normalizedQuery) - searchRelevance(b, normalizedQuery);
      });
  } else if (activeCategory === 'Semua') {
    displayProducts = showAll
      ? products
      : (featuredOnly.length > 0 ? featuredOnly.slice(0, HOMEPAGE_LIMIT) : products.slice(0, 4));
  } else {
    displayProducts = categoryProducts;
  }

  const waNumber = (STORE_CONFIG.phone || '6281332345448').split(/[/,&\n]/)[0].replace(/\D/g, '');

  return (
    <section id="products" className="py-20 bg-white select-none scroll-mt-24" onContextMenu={(e) => e.preventDefault()}>
      
      {/* MODAL DETAIL PRODUK + GALERI LENGKAP */}
      <AnimatePresence>
        {selected && (
          <div className="fixed inset-0 z-[160] flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white w-full max-w-5xl rounded-3xl overflow-hidden shadow-2xl max-h-[94vh] flex flex-col md:flex-row relative"
            >
              <button
                type="button"
                onClick={closeDetail}
                className="absolute top-4 right-4 z-20 bg-white/90 p-2 rounded-full shadow-lg hover:bg-red-600 hover:text-white transition-all"
              >
                <X size={22} />
              </button>

              {/* TAMPILAN FOTO UTAMA & THUMBNAIL GALERI (KIRI) */}
              <div className="md:w-1/2 bg-gray-900 p-4 flex flex-col justify-between relative min-h-[380px]">
                <div className="relative w-full h-[300px] sm:h-[360px] rounded-2xl overflow-hidden bg-black flex items-center justify-center group select-none">
                  
                  {/* FOTO UTAMA */}
                  <img
                    src={selected.images?.[activeImgIndex] || selected.images?.[0]}
                    alt={selected.name}
                    draggable={false}
                    className="w-full h-full object-contain transition-all pointer-events-none"
                  />

                  {/* 🌟 STEMPEL WATERMARK BARU: www.tokofitnesssurabaya.com */}
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-25">
                    <div className="bg-black/80 text-white font-black text-xs sm:text-sm tracking-wider px-4 py-2 rounded-2xl border-2 border-white/40 italic rotate-[-12deg] text-center shadow-2xl">
                      www.tokofitnesssurabaya.com
                    </div>
                  </div>

                  {selected.images.length > 1 && (
                    <>
                      <button
                        type="button"
                        onClick={() => setActiveImgIndex((prev) => (prev === 0 ? selected.images.length - 1 : prev - 1))}
                        className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/60 text-white p-2 rounded-full hover:bg-red-600 transition-all z-10 shadow-lg"
                      >
                        <ChevronLeft size={20} />
                      </button>
                      <button
                        type="button"
                        onClick={() => setActiveImgIndex((prev) => (prev === selected.images.length - 1 ? 0 : prev + 1))}
                        className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/60 text-white p-2 rounded-full hover:bg-red-600 transition-all z-10 shadow-lg"
                      >
                        <ChevronRight size={20} />
                      </button>
                    </>
                  )}
                </div>

                {/* 📷 BARIS FOTO GALERI KECIL */}
                {selected.images.length > 1 && (
                  <div className="flex gap-2.5 mt-3 overflow-x-auto pb-1 justify-center items-center">
                    {selected.images.map((img: string, idx: number) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setActiveImgIndex(idx)}
                        className={`relative rounded-xl overflow-hidden border-2 transition-all cursor-pointer shrink-0 ${
                          activeImgIndex === idx
                            ? 'border-red-500 scale-105 shadow-md ring-2 ring-red-500/50'
                            : 'border-gray-700 opacity-60 hover:opacity-100 hover:border-gray-400'
                        }`}
                      >
                        <img
                          src={img}
                          alt=""
                          draggable={false}
                          className="w-14 h-14 object-cover pointer-events-none"
                        />
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* INFORMASI PRODUK (KANAN) */}
              <div className="md:w-1/2 p-8 overflow-y-auto select-none">
                <div className="text-xs font-bold text-red-600 uppercase tracking-widest mb-2">
                  {selected.category}
                </div>
                <h2 className="text-3xl font-bold text-gray-900 mb-3">{selected.name}</h2>
                <div className="text-2xl font-black text-red-600 mb-6">{formatPrice(selected.price)}</div>

                <div className="mb-8 space-y-4">
                  <div>
                    <h4 className="font-bold flex items-center gap-2 mb-2 border-b pb-2 text-gray-900">
                      <Info size={18} className="text-red-600" /> Deskripsi Produk
                    </h4>
                    <p className="text-gray-600 text-sm leading-relaxed whitespace-pre-wrap select-none">
                      {selected.description || 'Peralatan fitness kualitas premium.'}
                    </p>
                  </div>
                  {selected.specs && (
                    <div className="bg-gray-50 p-4 rounded-xl">
                      <h4 className="font-bold text-gray-900 text-xs mb-2 uppercase">Spesifikasi Teknis:</h4>
                      <p className="text-gray-500 text-xs leading-relaxed whitespace-pre-wrap select-none">{selected.specs}</p>
                    </div>
                  )}
                </div>

                <div className="space-y-3">
                  <a
                    href={`https://wa.me/${waNumber}?text=Halo, saya tertarik dengan produk *${encodeURIComponent(selected.name)}*`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full bg-green-500 hover:bg-green-600 text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-2 shadow-lg transition-colors"
                  >
                    <ShoppingCart size={20} /> Pesan via WhatsApp
                  </a>

                  {selected.shopeeUrl && selected.shopeeUrl.length > 5 && (
                    <a
                      href={selected.shopeeUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full bg-[#EE4D2D] hover:bg-[#d73211] text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-2 shadow-lg transition-colors"
                    >
                      <ShopeeIcon className="w-5 h-5" /> Beli di Shopee Official <ExternalLink size={18} />
                    </a>
                  )}

                  <button
                    type="button"
                    onClick={() => handleShareProduct(selected)}
                    className="w-full bg-gray-100 hover:bg-gray-200 text-gray-800 border border-gray-200 py-3.5 rounded-2xl font-bold flex items-center justify-center gap-2 transition-all cursor-pointer"
                  >
                    {copied ? (
                      <>
                        <Check size={18} className="text-green-600" />
                        <span className="text-green-600">Berbagi via WhatsApp...</span>
                      </>
                    ) : (
                      <>
                        <Share2 size={18} className="text-red-600" />
                        <span>Bagikan Produk Ini Ke Teman</span>
                      </>
                    )}
                  </button>
                </div>

              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-12">
          <div>
            <h2 className="text-3xl md:text-5xl font-black text-gray-900 mb-3 uppercase tracking-tighter italic">
              {searchQuery ? 'Hasil Pencarian' : 'Produk Pilihan'}
            </h2>
            <p className="text-gray-500 font-medium">
              {normalizedQuery ? (
                <>Menampilkan produk untuk "<span className="text-gray-900 font-bold">{normalizedQuery}</span>" <span className="bg-red-100 text-red-700 text-xs font-bold px-2.5 py-0.5 rounded-full ml-1">({displayProducts.length} Barang)</span></>
              ) : activeCategory === 'Semua' ? (
                <>Rekomendasi peralatan fitness pilihan terbaik. <span className="bg-red-100 text-red-700 text-xs font-bold px-2.5 py-0.5 rounded-full ml-1">(Total {products.length} Barang)</span></>
              ) : (
                <>Koleksi lengkap kategori {activeCategory} <span className="bg-red-100 text-red-700 text-xs font-bold px-2.5 py-0.5 rounded-full ml-1">({categoryProducts.length} Barang)</span></>
              )}
            </p>
          </div>
          
          <div className="flex gap-2">
            {normalizedQuery && (
              <button
                type="button"
                onClick={clearSearch}
                className="bg-white text-gray-800 border border-gray-200 px-5 py-2.5 rounded-xl text-sm font-bold hover:border-red-300 hover:text-red-600 transition-colors"
              >
                Hapus Pencarian
              </button>
            )}
            <a
              href={OFFICIAL_SHOPEE_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-[#EE4D2D] text-white px-5 py-2.5 rounded-xl text-sm font-bold flex items-center gap-2 shadow-md hover:bg-[#d73211] transition-colors"
            >
              <ShopeeIcon className="w-5 h-5" /> Shopee Mall
            </a>
          </div>
        </div>

        <form
          className="mb-8"
          onSubmit={(event) => {
            event.preventDefault();
            if (displayProducts.length === 1) openProduct(displayProducts[0], normalizedQuery);
            document.getElementById('product-results')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }}
        >
          <label className="flex items-center gap-3 bg-gray-50 border border-gray-200 rounded-2xl px-4 py-3 focus-within:border-red-500 focus-within:bg-white">
            <Search size={18} className="text-red-600 shrink-0" />
            <input
              type="search"
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              placeholder="Cari produk di katalog, contoh: Treadmill BM, Dumbbell..."
              className="w-full bg-transparent text-sm sm:text-base font-semibold text-gray-900 outline-none placeholder:font-normal placeholder:text-gray-400"
            />
          </label>
          {normalizedQuery && (
            <p className="mt-2 text-xs text-gray-500">
              Katalog di bawah ini hanya menampilkan produk yang cocok, bukan produk pertama.
            </p>
          )}
        </form>

        {loading ? (
          <div className="text-center py-20 text-red-600 font-bold animate-pulse text-xl">
            ⏳ Katalog masih dimuat. Tunggu sebentar, jangan ditutup dulu.
          </div>
        ) : error && products.length === 0 ? (
          <div className="text-center py-16 text-gray-500 font-medium">
            {error}
            <button type="button" onClick={reload} className="block mx-auto mt-4 bg-red-600 text-white px-5 py-2.5 rounded-xl text-sm font-bold">
              Muat ulang katalog
            </button>
          </div>
        ) : (
          <>
            <div id="product-results">
            {displayProducts.length === 0 ? (
              <div className="text-center py-16 text-gray-500 font-medium">
                Tidak ada produk untuk "<span className="text-red-600 font-bold">{normalizedQuery || activeCategory}</span>".
                {normalizedQuery && (
                  <button type="button" onClick={clearSearch} className="block mx-auto mt-4 text-sm font-bold text-red-600">
                    Kembali ke produk pilihan
                  </button>
                )}
              </div>
            ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {displayProducts.map((p: any) => (
                <div
                  key={p.id}
                  id={productDomId(p.id)}
                  ref={(el) => {
                    if (!el || highlightId !== p.id) return;
                    const token = `${p.id}:${focusToken}`;
                    if (scrolledToken.current === token) return;
                    scrolledToken.current = token;
                    window.setTimeout(() => el.scrollIntoView({ behavior: 'smooth', block: 'center' }), 60);
                  }}
                  className={`bg-white rounded-3xl border overflow-hidden hover:shadow-2xl transition-all flex flex-col justify-between group scroll-mt-28 ${
                    highlightId === p.id ? 'border-red-500 ring-4 ring-red-500 shadow-2xl' : 'border-gray-100'
                  }`}
                >
                  <div>
                    <div className="relative aspect-square bg-gray-50 overflow-hidden select-none">
                      <img
                        src={p.images[0]}
                        alt={p.name}
                        draggable={false}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 pointer-events-none"
                      />

                      {/* 🌟 STEMPEL WATERMARK BARU: www.tokofitnesssurabaya.com */}
                      <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-30">
                        <div className="bg-black/70 text-white font-black text-[9px] sm:text-[10px] tracking-wider px-3 py-1 rounded-xl border border-white/30 backdrop-blur-xs italic rotate-[-10deg] text-center shadow-lg">
                          www.tokofitnesssurabaya.com
                        </div>
                      </div>

                      {p.tag && (
                        <span className="absolute top-4 left-4 bg-red-600 text-white text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-tighter">
                          {p.tag}
                        </span>
                      )}

                      {highlightId === p.id && (
                        <span className="absolute top-4 right-4 z-10 bg-red-600 text-white text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-tighter">
                          Produk dicari
                        </span>
                      )}

                      {p.images.length > 1 && (
                        <span className="absolute bottom-4 right-4 bg-black/60 text-white text-[10px] font-bold px-2.5 py-1 rounded-lg backdrop-blur-md z-10">
                          📷 {p.images.length} FOTO
                        </span>
                      )}
                    </div>

                    <div className="p-6">
                      <div className="text-[10px] text-red-600 font-bold uppercase mb-1">
                        {p.category}
                      </div>
                      <h3 className="font-bold text-gray-900 mb-2 line-clamp-2 leading-tight h-10">
                        {p.name}
                      </h3>
                      <div className="flex items-center gap-1 text-yellow-400 mb-3">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} size={12} fill={i < 5 ? 'currentColor' : 'none'} />
                        ))}
                        <span className="text-gray-400 text-[10px] ml-1">({p.reviews || '12+'})</span>
                      </div>
                      <div className="text-xl font-black text-red-600">{formatPrice(p.price)}</div>
                    </div>
                  </div>

                  <div className="p-6 pt-0">
                    <button
                      type="button"
                      onClick={() => openDetail(p)}
                      className="w-full bg-gray-900 hover:bg-red-600 text-white py-3 rounded-xl text-xs font-bold transition-all shadow-md"
                    >
                      Detail & Galeri
                    </button>
                  </div>
                </div>
              ))}
            </div>
            )}
            </div>

            {/* 📊 TOMBOL BUKA/TUTUP KATALOG */}
            {!searchQuery && activeCategory === 'Semua' && products.length > HOMEPAGE_LIMIT && (
              <div className="text-center mt-12 flex flex-col items-center gap-3">
                <button
                  type="button"
                  onClick={() => setShowAll(!showAll)}
                  className="inline-flex items-center gap-2 bg-gray-900 hover:bg-red-600 text-white px-8 py-4 rounded-2xl text-sm font-bold transition-all shadow-xl hover:shadow-red-600/30 transform hover:-translate-y-0.5 cursor-pointer"
                >
                  {showAll ? (
                    <>Tampilkan Produk Pilihan Saja <ChevronUp size={18} /></>
                  ) : (
                    <>Lihat Semua Katalog Produk ({products.length} Barang) <ChevronDown size={18} /></>
                  )}
                </button>
                <span className="text-xs text-gray-400 font-semibold">
                  Total {products.length} Produk Terdaftar di Katalog Toko Fitness Surabaya
                </span>
              </div>
            )}
          </>
        )}
      </div>
    </section>
  );
};

export default FeaturedProducts;
