import { useState, useEffect } from 'react';
import { Phone, ShoppingCart, Search, Menu, X, ExternalLink } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { STORE_CONFIG } from '../data/config';
import { useCatalog } from '../catalog';
import { productMatchesQuery, searchRelevance } from '../utils/productSearch';
import { useMarketplaces, marketplaceHref } from '../utils/marketplaces';
import { MARKETPLACE_ICONS } from './MarketplaceIcons';

const PROJECT_IDS = ['qi4rocc0', '856jrik3'];
const DATASET = 'production';

const Navbar = ({ cartCount = 0, onOpenCart, onSelectCategory }: any) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [logoUrl, setLogoUrl] = useState('/logo.png');
  const { products, loading: catalogLoading, openProduct, searchQuery, setSearchQuery, isStrayClick } = useCatalog();
  const [clickShield, setClickShield] = useState(false);
  const marketplaces = useMarketplaces();

  // STATE SEARCH
  const [searchOpen, setSearchOpen] = useState(false);
  const [activeResult, setActiveResult] = useState(-1);

  const waNumber = (STORE_CONFIG.phone || '6281332345448').split(/[/,&\n]/)[0].replace(/\D/g, '');

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const fetchNavbarData = async () => {
      const query = encodeURIComponent(`{
        "store": *[_type in ["storeConfig","storeInfo","settings"]][0]{
          "logo": coalesce(logo.asset->url, image.asset->url, photo.asset->url, "")
        }
      }`);

      for (const id of PROJECT_IDS) {
        try {
          const res = await fetch(`https://${id}.api.sanity.io/v2024-01-01/data/query/${DATASET}?query=${query}`, { cache: 'no-store' });
          const data = await res.json();
          if (data?.result?.store?.logo) {
            setLogoUrl(data.result.store.logo);
            break;
          }
        } catch (err) {
          console.error(err);
        }
      }
    };
    fetchNavbarData();
  }, []);

  const searchResults = searchQuery.trim() === ''
    ? []
    : [...products]
        .filter((product) => productMatchesQuery(product, searchQuery))
        .sort((a, b) => searchRelevance(a, searchQuery) - searchRelevance(b, searchQuery));

  const showSearchResults = () => {
    setSearchOpen(false);
    setActiveResult(-1);
    window.setTimeout(() => {
      document.getElementById('product-results')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 80);
  };

  const openSearchResult = (item: any) => {
    if (!item) return;
    const query = searchQuery.trim();
    setClickShield(true);
    setActiveResult(-1);
    openProduct(item, query || item.name);
    window.setTimeout(() => {
      setSearchOpen(false);
      window.setTimeout(() => setClickShield(false), 500);
    }, 50);
  };

  const formatPrice = (price: number) =>
    new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(price || 0);

  return (
    <>
      <header className={`sticky top-0 z-50 transition-all duration-300 ${isScrolled ? 'bg-white/95 backdrop-blur-md shadow-md py-2' : 'bg-white py-3 border-b border-gray-100'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between gap-4">
            
            {/* LOGO RESMI */}
            <a href="#" className="flex items-center gap-3 group shrink-0">
              <img
                src={logoUrl}
                alt="Logo Toko Fitness Surabaya"
                className="h-10 w-10 sm:h-12 sm:w-12 object-contain rounded-xl bg-black p-1 transition-transform group-hover:scale-105"
                onError={(e: any) => { e.target.src = '/logo.png'; }}
              />
              <div className="hidden sm:flex flex-col">
                <span className="font-black text-base sm:text-lg tracking-tight italic text-gray-900 leading-none uppercase">
                  TOKO FITNESS SURABAYA
                </span>
                <span className="text-[9px] text-red-600 font-bold tracking-widest uppercase mt-0.5">
                  Official Equipment & Accessories
                </span>
              </div>
            </a>

            {/* NAVIGASI */}
            <nav className="hidden md:flex items-center gap-8 font-bold text-sm text-gray-700">
              <a href="#hero" className="hover:text-red-600 transition-colors">Beranda</a>
              <a href="#products" onClick={(event) => { if (isStrayClick()) { event.preventDefault(); return; } onSelectCategory && onSelectCategory('Semua'); }} className="hover:text-red-600 transition-colors">Produk</a>
              <a href="#categories" className="hover:text-red-600 transition-colors">Kategori</a>
              <a href="#marketplace" className="hover:text-red-600 transition-colors">Marketplace</a>
              <a href="#footer" className="hover:text-red-600 transition-colors">Tentang Kami</a>
            </nav>

            {/* TOMBOL PENCARIAN, HUBUNGI KAMI & MARKETPLACE */}
            <div className="flex items-center gap-3">
              
              {/* TOMBOL SEARCH */}
              <button 
                type="button"
                onClick={() => setSearchOpen(true)}
                className="p-2 text-gray-700 hover:text-red-600 hover:bg-red-50 rounded-full transition-all" 
                title="Cari Produk Alat Fitness"
              >
                <Search size={22} />
              </button>

              {onOpenCart && (
                <button type="button" onClick={onOpenCart} className="relative p-2 text-gray-600 hover:text-red-600 transition-colors" title="Keranjang">
                  <ShoppingCart size={20} />
                  {cartCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-600 text-white text-[10px] font-black w-4 h-4 rounded-full flex items-center justify-center animate-bounce">
                      {cartCount}
                    </span>
                  )}
                </button>
              )}

              <div className="relative flex flex-col items-end">
                <a
                  href={`https://wa.me/${waNumber}?text=Halo%20Admin%20Toko%20Fitness%20Surabaya,%20saya%20ingin%20konsultasi`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-red-600 hover:bg-red-700 text-white font-black text-xs sm:text-sm px-4 sm:px-6 py-2.5 rounded-full shadow-md flex items-center gap-2 transition-all transform hover:scale-105 active:scale-95"
                >
                  <Phone size={15} /> Hubungi Kami
                </a>

                <div className="absolute top-full mt-1.5 right-0 z-30 flex flex-col items-end gap-1.5 sm:flex-row">
                  {marketplaces.filter((item) => item.id === 'shopee' || item.id === 'lazada').map((item, index) => {
                    const Icon = MARKETPLACE_ICONS[item.id];
                    const isShopee = item.id === 'shopee';
                    return (
                      <motion.a
                        key={item.id}
                        href={marketplaceHref(item)}
                        target="_blank"
                        rel="noopener noreferrer"
                        initial={{ scale: 0.9 }}
                        animate={{
                          scale: [1, 1.08, 1],
                          boxShadow: isShopee
                            ? [
                                '0px 0px 0px rgba(238, 77, 45, 0)',
                                '0px 0px 18px rgba(238, 77, 45, 0.95)',
                                '0px 0px 0px rgba(238, 77, 45, 0)',
                              ]
                            : [
                                '0px 0px 0px rgba(245, 114, 36, 0)',
                                '0px 0px 18px rgba(245, 114, 36, 0.95)',
                                '0px 0px 0px rgba(245, 114, 36, 0)',
                              ],
                        }}
                        transition={{
                          repeat: Infinity,
                          duration: 1.2,
                          delay: index * 0.15,
                          ease: 'easeInOut',
                        }}
                        className={`inline-flex items-center gap-1.5 text-white font-black text-[9px] sm:text-[11px] uppercase tracking-wider px-3 py-1 rounded-full shadow-2xl border-2 whitespace-nowrap cursor-pointer hover:scale-105 transition-transform ${
                          isShopee
                            ? 'bg-gradient-to-r from-amber-400 via-[#EE4D2D] to-red-600 border-yellow-300'
                            : 'bg-gradient-to-r from-[#F57224] via-[#0F146D] to-[#1a237e] border-orange-300'
                        }`}
                      >
                        <span className="relative flex h-2 w-2">
                          <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${isShopee ? 'bg-yellow-200' : 'bg-orange-200'} opacity-90`}></span>
                          <span className={`relative inline-flex rounded-full h-2 w-2 ${isShopee ? 'bg-yellow-300' : 'bg-orange-300'}`}></span>
                        </span>
                        <Icon className={`w-3.5 h-3.5 ${isShopee ? 'text-yellow-300' : 'text-orange-300'} animate-bounce`} />
                        <span>{isShopee ? 'Beli di Shopee Official' : 'Beli di Lazada Official'}</span>
                        <ExternalLink size={11} className={isShopee ? 'text-yellow-200' : 'text-orange-200'} />
                      </motion.a>
                    );
                  })}
                </div>
              </div>

              {/* MOBILE MENU HAMBURGER */}
              <button
                type="button"
                onClick={() => setIsMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden p-2 text-gray-700 hover:text-red-600 ml-1"
              >
                {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>

            </div>
          </div>
        </div>

        {/* MOBILE MENU DROPDOWN */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden bg-white border-b border-gray-100 overflow-hidden"
            >
              <div className="px-4 pt-3 pb-6 space-y-3 font-bold text-sm text-gray-800">
                <a href="#hero" onClick={() => setIsMobileMenuOpen(false)} className="block py-2 border-b border-gray-50">Beranda</a>
                <a href="#products" onClick={(event) => { if (isStrayClick()) { event.preventDefault(); return; } setIsMobileMenuOpen(false); onSelectCategory && onSelectCategory('Semua'); }} className="block py-2 border-b border-gray-50">Produk</a>
                <a href="#categories" onClick={() => setIsMobileMenuOpen(false)} className="block py-2 border-b border-gray-50">Kategori</a>
                <a href="#marketplace" onClick={() => setIsMobileMenuOpen(false)} className="block py-2 border-b border-gray-50">Marketplace</a>
                <a href="#footer" onClick={() => setIsMobileMenuOpen(false)} className="block py-2">Tentang Kami</a>
                <div className="pt-2 space-y-2">
                  <p className="text-[10px] uppercase tracking-widest text-gray-400">Belanja di Marketplace</p>
                  {marketplaces.map((item) => {
                    const Icon = MARKETPLACE_ICONS[item.id];
                    return (
                      <a
                        key={item.id}
                        href={marketplaceHref(item)}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="flex items-center justify-between py-2 border-b border-gray-50"
                      >
                        <span className="inline-flex items-center gap-2">
                          <Icon className="w-4 h-4 text-red-600" />
                          {item.label}
                        </span>
                        <ExternalLink size={14} className="text-gray-400" />
                      </a>
                    );
                  })}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* POP-UP SEARCH */}
      {clickShield && (
        <div
          className="fixed inset-0 z-[140]"
          onMouseDown={(event) => { event.preventDefault(); event.stopPropagation(); }}
          onClick={(event) => { event.preventDefault(); event.stopPropagation(); }}
        />
      )}

      <AnimatePresence>
        {searchOpen && (
          <div className="fixed inset-0 z-[100] flex items-start justify-center pt-20 px-4 bg-black/75 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, y: -30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -30 }}
              className="bg-white w-full max-w-2xl rounded-3xl overflow-hidden shadow-2xl border border-gray-100 p-6 relative"
            >
              <button 
                onClick={() => setSearchOpen(false)}
                className="absolute top-5 right-5 text-gray-400 hover:text-red-600 p-2 rounded-full hover:bg-gray-100 transition-colors"
              >
                <X size={22} />
              </button>

              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  const picked = activeResult >= 0 ? searchResults[activeResult] : null;
                  if (picked) openSearchResult(picked);
                  else showSearchResults();
                }}
              >
              <div className="flex items-center gap-3 border-b-2 border-red-600 pb-3 mb-6 pr-10">
                <Search size={24} className="text-red-600 shrink-0" />
                <input 
                  type="text"
                  placeholder="Ketik nama alat fitness (contoh: Treadmill, Dumbbell)..."
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setActiveResult(-1);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'ArrowDown') {
                      e.preventDefault();
                      setActiveResult((index) => Math.min(index + 1, Math.max(searchResults.length - 1, 0)));
                    } else if (e.key === 'ArrowUp') {
                      e.preventDefault();
                      setActiveResult((index) => Math.max(index - 1, 0));
                    } else if (e.key === 'Escape') {
                      setSearchOpen(false);
                    }
                  }}
                  autoFocus
                  className="w-full text-lg font-bold text-gray-900 outline-none placeholder:text-gray-400 placeholder:font-normal"
                />
              </div>
              </form>

              <div className="max-h-96 overflow-y-auto space-y-3 pr-1">
                {catalogLoading && (
                  <div className="text-center py-8 text-gray-500 font-medium">
                    Katalog masih dimuat. Tunggu sebentar, lalu hasil pencarian akan muncul.
                  </div>
                )}

                {!catalogLoading && searchQuery.trim() !== '' && searchResults.length === 0 && (
                  <div className="text-center py-8 text-gray-500 font-medium">
                    Tidak ditemukan produk dengan kata kunci "<span className="text-red-600 font-bold">{searchQuery}</span>"
                  </div>
                )}

                {searchQuery.trim() !== '' && searchResults.length > 0 && (
                  <div className="flex items-center justify-between gap-3 px-1">
                    <div className="text-[11px] font-bold uppercase tracking-wider text-gray-400">
                      {searchResults.length} produk ditemukan
                    </div>
                    <button
                      type="button"
                      onClick={showSearchResults}
                      className="text-[11px] font-black uppercase tracking-wider text-red-600"
                    >
                      Lihat di katalog
                    </button>
                  </div>
                )}

                {searchResults.map((item, index) => {
                  const categoryLabel = item.category || '';
                  return (
                  <button
                    type="button"
                    key={item.id || `${item.name}-${index}`}
                    onMouseEnter={() => setActiveResult(index)}
                    onMouseDown={(event) => {
                      event.preventDefault();
                      event.stopPropagation();
                      openSearchResult(item);
                    }}
                    className={`w-full flex items-center justify-between p-3 rounded-2xl cursor-pointer transition-all border group text-left ${
                      index === activeResult
                        ? 'bg-red-50 border-red-200'
                        : 'bg-white border-transparent hover:bg-gray-50 hover:border-gray-200'
                    }`}
                  >
                    <div className="flex items-center gap-4 min-w-0">
                      <img src={item.images?.[0] || 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?q=80&w=200'} alt={item.name} className="w-14 h-14 object-cover rounded-xl bg-gray-100 shrink-0" />
                      <div className="min-w-0">
                        <h4 className="font-bold text-gray-900 text-sm group-hover:text-red-600 transition-colors truncate">{item.name}</h4>
                        {categoryLabel && (
                          <div className="text-[10px] font-bold uppercase tracking-wide text-gray-400 mt-0.5 truncate">{categoryLabel}</div>
                        )}
                        <div className="text-red-600 font-black text-xs mt-0.5">{formatPrice(item.price)}</div>
                      </div>
                    </div>
                    <span className="shrink-0 ml-3 text-[10px] font-black uppercase tracking-wider text-white bg-red-600 px-3 py-1.5 rounded-full">
                      Buka
                    </span>
                  </button>
                  );
                })}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Navbar;
