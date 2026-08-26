import { useState, useEffect } from 'react';
import { Phone, ShoppingCart, Search, Menu, X, Flame, Sparkles, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { STORE_CONFIG } from '../data/config';

const PROJECT_IDS = ['qi4rocc0', '856jrik3'];
const DATASET = 'production';

const Navbar = ({ cartCount = 0, onOpenCart, onSelectCategory }: any) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [logoUrl, setLogoUrl] = useState('/logo.png');

  // STATE UNTUK POP-UP PENCARIAN (SEARCH)
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [allProducts, setAllProducts] = useState<any[]>([]);

  const [promoText, setPromoText] = useState<string>('PROMO SETIAP HARI');
  const [showPromo, setShowPromo] = useState<boolean>(true);

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
        },
        "promo": *[_type in ["storeConfig","storeInfo","settings","slider","banner"]][0]{
          "tag": coalesce(promoText, tagPromo, promoTag, tag, ""),
          "disable": coalesce(disablePromo, hidePromo, false)
        },
        "products": *[_type == "product"] {
          _id, name, price,
          "image": coalesce(image.asset->url, foto.asset->url, photo.asset->url, "")
        }
      }`);

      for (const id of PROJECT_IDS) {
        try {
          const res = await fetch(`https://${id}.api.sanity.io/v2024-01-01/data/query/${DATASET}?query=${query}`, { cache: 'no-store' });
          const data = await res.json();
          
          if (data?.result) {
            if (data.result.store?.logo) setLogoUrl(data.result.store.logo);
            if (data.result.products) setAllProducts(data.result.products);

            const rawTag = data.result.promo?.tag;
            const isDisabled = data.result.promo?.disable;

            if (isDisabled || !rawTag || String(rawTag).trim() === '') {
              setShowPromo(false);
            } else {
              setShowPromo(true);
              setPromoText(String(rawTag).trim());
            }
            break;
          }
        } catch (err) {
          console.error(err);
        }
      }
    };
    fetchNavbarData();
  }, []);

  // Filter Hasil Pencarian
  const searchResults = searchQuery.trim() === '' 
    ? [] 
    : allProducts.filter(p => p.name && p.name.toLowerCase().includes(searchQuery.toLowerCase()));

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
              <a href="#products" onClick={() => onSelectCategory && onSelectCategory('Semua')} className="hover:text-red-600 transition-colors">Produk</a>
              <a href="#categories" className="hover:text-red-600 transition-colors">Kategori</a>
              <a href="#footer" className="hover:text-red-600 transition-colors">Tentang Kami</a>
            </nav>

            {/* TOMBOL PENCARIAN & HUBUNGI KAMI */}
            <div className="flex items-center gap-3">
              
              {/* TOMBOL SEARCH AKTIF */}
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
                    transition={{ repeat: Infinity, duration: 1.2, ease: "easeInOut" }}
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

        {/* MOBILE MENU */}
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

      {/* POP-UP MODAL PENCARIAN SANGAT CEPAT */}
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

              <div className="flex items-center gap-3 border-b-2 border-red-600 pb-3 mb-6 pr-10">
                <Search size={24} className="text-red-600 shrink-0" />
                <input 
                  type="text"
                  placeholder="Ketik nama alat fitness (contoh: Treadmill, Dumbbell)..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  autoFocus
                  className="w-full text-lg font-bold text-gray-900 outline-none placeholder:text-gray-400 placeholder:font-normal"
                />
              </div>

              {/* DAFTAR HASIL PENCARIAN */}
              <div className="max-h-96 overflow-y-auto space-y-3 pr-1">
                {searchQuery.trim() !== '' && searchResults.length === 0 && (
                  <div className="text-center py-8 text-gray-500 font-medium">
                    Tidak ditemukan produk dengan kata kunci "<span className="text-red-600 font-bold">{searchQuery}</span>"
                  </div>
                )}

                {searchResults.map((item) => (
                  <div 
                    key={item._id}
                    onClick={() => {
                      setSearchOpen(false);
                      const productSection = document.getElementById('products');
                      if (productSection) productSection.scrollIntoView({ behavior: 'smooth' });
                    }}
                    className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-2xl cursor-pointer transition-all border border-transparent hover:border-gray-200 group"
                  >
                    <div className="flex items-center gap-4">
                      <img src={item.image || 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?q=80&w=200'} alt={item.name} className="w-14 h-14 object-cover rounded-xl bg-gray-100" />
                      <div>
                        <h4 className="font-bold text-gray-900 text-sm group-hover:text-red-600 transition-colors">{item.name}</h4>
                        <div className="text-red-600 font-black text-xs mt-0.5">{formatPrice(item.price)}</div>
                      </div>
                    </div>
                    <div className="text-xs font-bold text-gray-400 group-hover:text-red-600 flex items-center gap-1">
                      Lihat <ArrowRight size={14} />
                    </div>
                  </div>
                ))}

                {searchQuery.trim() === '' && (
                  <div className="text-center py-6 text-xs text-gray-400 font-medium">
                    Ketik kata kunci produk di atas untuk memulai pencarian cepat.
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Navbar;
