import { useState, useEffect } from 'react';
import { Phone, ShoppingCart, Search, Menu, X, Flame, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { STORE_CONFIG } from '../data/config';

const PROJECT_IDS = ['qi4rocc0', '856jrik3'];
const DATASET = 'production';

const Navbar = ({ cartCount = 0, onOpenCart, onSelectCategory }: any) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [logoUrl, setLogoUrl] = useState('/logo.png');

  // STATE UNTUK KONTROL PROMO DARI SANITY
  const [promoText, setPromoText] = useState<string>('PROMO SETIAP HARI');
  const [showPromo, setShowPromo] = useState<boolean>(true);

  const waNumber = (STORE_CONFIG.phone || '6281332345448').split(/[/,&\n]/)[0].replace(/\D/g, '');

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const fetchNavbarData = async () => {
      // Query membaca Logo & Pengaturan Promo dari Sanity
      const query = encodeURIComponent(`{
        "store": *[_type in ["storeConfig","storeInfo","settings"]][0]{
          "logo": coalesce(logo.asset->url, image.asset->url, photo.asset->url, "")
        },
        "promo": *[_type in ["storeConfig","storeInfo","settings","slider","banner"]][0]{
          "tag": coalesce(promoText, tagPromo, promoTag, tag, ""),
          "disable": coalesce(disablePromo, hidePromo, false)
        }
      }`);

      for (const id of PROJECT_IDS) {
        try {
          const res = await fetch(`https://${id}.api.sanity.io/v2024-01-01/data/query/${DATASET}?query=${query}`, { cache: 'no-store' });
          const data = await res.json();
          
          if (data?.result) {
            // Update Logo
            if (data.result.store?.logo) {
              setLogoUrl(data.result.store.logo);
            }

            // Update Status Promo
            const rawTag = data.result.promo?.tag;
            const isDisabled = data.result.promo?.disable;

            if (isDisabled || rawTag === null || rawTag === undefined || String(rawTag).trim() === '') {
              // JIKA DI SANITY KOSONG / DISABLED -> MATIKAN BADGE PROMO
              setShowPromo(false);
            } else {
              // JIKA TERISI -> TAMPILKAN BADGE PROMO
              setShowPromo(true);
              setPromoText(String(rawTag).trim());
            }
            break;
          }
        } catch (err) {
          console.error('Error fetching navbar data:', err);
        }
      }
    };
    fetchNavbarData();
  }, []);

  return (
    <header className={`sticky top-0 z-50 transition-all duration-300 ${isScrolled ? 'bg-white/95 backdrop-blur-md shadow-md py-2' : 'bg-white py-3 border-b border-gray-100'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-4">
          
          {/* LOGO RESMI */}
          <a href="#" className="flex items-center gap-3 group shrink-0">
            <img
              src={logoUrl}
              alt="Logo"
              className="h-10 w-10 sm:h-12 sm:w-12 object-contain rounded-xl bg-black p-1 transition-transform group-hover:scale-105"
              onError={(e: any) => { e.target.src = '/logo.png'; }}
            />
            <div className="hidden sm:flex flex-col">
              <span className="font-black text-base sm:text-lg tracking-tight italic text-gray-900 leading-none">
                FITNESS SURABAYA
              </span>
              <span className="text-[9px] text-red-600 font-bold tracking-widest uppercase mt-0.5">
                Official Equipment
              </span>
            </div>
          </a>

          {/* MENU NAVIGASI UTAMA */}
          <nav className="hidden md:flex items-center gap-8 font-bold text-sm text-gray-700">
            <a href="#hero" className="hover:text-red-600 transition-colors">Beranda</a>
            <a href="#products" onClick={() => onSelectCategory && onSelectCategory('Semua')} className="hover:text-red-600 transition-colors">Produk</a>
            <a href="#categories" className="hover:text-red-600 transition-colors">Kategori</a>
            <a href="#footer" className="hover:text-red-600 transition-colors">Tentang Kami</a>
          </nav>

          {/* SISI KANAN: HUBUNGI KAMI + BADGE PROMO DINAMIS */}
          <div className="flex items-center gap-3">
            
            {/* SEARCH & CART */}
            <a href="#products" className="p-2 text-gray-600 hover:text-red-600 transition-colors" title="Cari Produk">
              <Search size={20} />
            </a>

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

            {/* CONTAINER KHUSUS TOMBOL & BADGE LEDAKAN */}
            <div className="relative flex flex-col items-end">
              
              {/* TOMBOL HUBUNGI KAMI */}
              <a
                href={`https://wa.me/${waNumber}?text=Halo%20Admin%20Toko%20Fitness%20Surabaya,%20saya%20ingin%20konsultasi`}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-red-600 hover:bg-red-700 text-white font-black text-xs sm:text-sm px-4 sm:px-6 py-2.5 rounded-full shadow-md flex items-center gap-2 transition-all transform hover:scale-105 active:scale-95"
              >
                <Phone size={15} /> Hubungi Kami
              </a>

              {/* 🔥 BADGE "PROMO SETIAP HARI" HANYA MUNCUL JIKA AKTIF DI SANITY 🔥 */}
              {showPromo && (
                <motion.div
                  initial={{ scale: 0.9 }}
                  animate={{
                    scale: [1, 1.12, 1],
                    boxShadow: [
                      "0px 0px 0px rgba(239, 68, 68, 0)",
                      "0px 0px 18px rgba(239, 68, 68, 0.9)",
                      "0px 0px 0px rgba(239, 68, 68, 0)"
                    ]
                  }}
                  transition={{
                    repeat: Infinity,
                    duration: 1.2,
                    ease: "easeInOut"
                  }}
                  className="absolute top-full mt-1.5 right-0 z-30 inline-flex items-center gap-1.5 bg-gradient-to-r from-amber-400 via-red-600 to-amber-500 text-white font-black text-[9px] sm:text-[11px] uppercase tracking-wider px-3 py-1 rounded-full shadow-2xl border-2 border-yellow-300 whitespace-nowrap cursor-pointer"
                  onClick={() => {
                    const productSection = document.getElementById('products');
                    if (productSection) productSection.scrollIntoView({ behavior: 'smooth' });
                  }}
                >
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-yellow-200 opacity-90"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-yellow-300"></span>
                  </span>
                  
                  <Flame size={13} className="text-yellow-300 animate-bounce" />
                  <span>"{promoText}"</span>
                  <Sparkles size={12} className="text-yellow-200" />
                </motion.div>
              )}

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
              <a href="#products" onClick={() => { setIsMobileMenuOpen(false); onSelectCategory && onSelectCategory('Semua'); }} className="block py-2 border-b border-gray-50">Produk</a>
              <a href="#categories" onClick={() => setIsMobileMenuOpen(false)} className="block py-2 border-b border-gray-50">Kategori</a>
              <a href="#footer" onClick={() => setIsMobileMenuOpen(false)} className="block py-2">Tentang Kami</a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};

export default Navbar;
