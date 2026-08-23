import { useState, useEffect } from 'react';
import { ShoppingCart, ExternalLink, ShieldCheck, ArrowRight, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';
import { STORE_CONFIG } from '../data/config';

const PROJECT_IDS = ['qi4rocc0', '856jrik3'];
const DATASET = 'production';
const SHOPEE_FALLBACK = 'https://shopee.co.id/search?keyword=toko%20fitness%20surabaya';

const fixLink = (url: any) => {
  if (!url || typeof url !== 'string') return SHOPEE_FALLBACK;
  const link = url.trim();
  if (!link) return SHOPEE_FALLBACK;
  if (!link.startsWith('http://') && !link.startsWith('https://')) {
    return 'https://' + link;
  }
  return link;
};

const Hero = () => {
  const [shopeeUrl, setShopeeUrl] = useState<string>(
    fixLink((STORE_CONFIG as any)?.shopee)
  );

  useEffect(() => {
    const fetchHeroData = async () => {
      const query = encodeURIComponent(`*[_type in ["storeConfig","storeInfo","settings"]][0]{
        "shopee": coalesce(shopee, shopeeUrl, ""),
        "facebook": coalesce(facebook, "")
      }`);

      for (const id of PROJECT_IDS) {
        try {
          const res = await fetch(
            `https://${id}.api.sanity.io/v2024-01-01/data/query/${DATASET}?query=${query}`,
            { cache: 'no-store' }
          );
          const data = await res.json();
          let foundShopee = data?.result?.shopee;
          const fbLink = data?.result?.facebook;

          if (!foundShopee && fbLink && (fbLink.includes('sh.ee') || fbLink.includes('shopee'))) {
            foundShopee = fbLink;
          }

          if (foundShopee) {
            setShopeeUrl(fixLink(foundShopee));
            break;
          }
        } catch (err) {
          console.error('Error fetching hero store data:', err);
        }
      }
    };

    fetchHeroData();
  }, []);

  const waNumber = (STORE_CONFIG.phone || '6281332345448').split(/[/,&\n]/)[0].replace(/\D/g, '');

  return (
    <section id="hero" className="relative min-h-[90vh] bg-black text-white flex items-center overflow-hidden py-16">
      {/* BACKGROUND IMAGE WITH DARK OVERLAY */}
      <div className="absolute inset-0 z-0">
        <img
          src="https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=1920"
          alt="Gym Background"
          className="w-full h-full object-cover object-center opacity-30 scale-105 transform transition-transform duration-1000"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black via-black/90 to-transparent z-10" />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black/60 z-10" />
      </div>

      <div className="relative z-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="max-w-3xl flex flex-col items-start text-left space-y-6">
          
          {/* 1. BADGE "PROMO SETIAP HARI" (PALING ATAS) */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 bg-red-600 text-white text-xs font-black uppercase tracking-widest px-4 py-2 rounded-full shadow-lg shadow-red-600/30 border border-red-500/40"
          >
            <Sparkles size={14} className="animate-pulse" />
            "PROMO SETIAP HARI"
          </motion.div>

          {/* 2. LOGO DIKECILKAN & DI TINGKAT DI ATAS JUDUL */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="flex items-center gap-4 bg-gray-900/80 backdrop-blur-md border border-gray-800 p-2.5 pr-5 rounded-2xl shadow-xl"
          >
            <img
              src="/logo.png"
              alt="Fitness Surabaya Logo"
              className="w-16 h-16 sm:w-20 sm:h-20 object-contain rounded-xl bg-black p-1.5 border border-gray-800"
              onError={(e: any) => {
                // Fallback jika file logo.png tidak ditemukan
                e.target.src = 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?q=80&w=200';
              }}
            />
            <div className="flex flex-col">
              <span className="text-lg sm:text-xl font-black italic tracking-tight text-white uppercase leading-none">
                FITNESS SURABAYA
              </span>
              <span className="text-[10px] sm:text-xs text-gray-400 font-bold uppercase tracking-widest mt-1">
                Equipment & Accessories
              </span>
            </div>
          </motion.div>

          {/* 3. TULISAN JUDUL UTAMA (DI BAWAH LOGO) */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-4xl sm:text-6xl lg:text-7xl font-black uppercase tracking-tighter italic leading-[1.05] text-white"
          >
            Kualitas Gym <br className="hidden sm:inline" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 via-red-600 to-orange-500">
              Profesional
            </span>{' '}
            Di Rumah Anda
          </motion.h1>

          {/* 4. DESKRIPSI SINGKAT */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="text-gray-300 text-sm sm:text-lg max-w-2xl leading-relaxed font-normal"
          >
            Pusat penyedia alat fitness terlengkap dan terpercaya di Surabaya. Garansi resmi, siap kirim & pasang langsung di rumah Anda.
          </motion.p>

          {/* 5. TOMBOL TRANSAKSI */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="flex flex-wrap gap-4 pt-4 w-full sm:w-auto"
          >
            <a
              href={`https://wa.me/${waNumber}?text=Halo%20Admin%20Toko%20Fitness%20Surabaya,%20saya%20ingin%20tanya%20produk%20fitness`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 bg-green-500 hover:bg-green-600 text-white font-bold px-8 py-4 rounded-2xl text-sm shadow-xl shadow-green-500/20 transition-all transform hover:-translate-y-1"
            >
              <ShoppingCart size={18} /> Hubungi via WA
            </a>

            <a
              href={shopeeUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 bg-[#EE4D2D] hover:bg-[#d73211] text-white font-bold px-8 py-4 rounded-2xl text-sm shadow-xl shadow-[#EE4D2D]/20 transition-all transform hover:-translate-y-1"
            >
              🧡 Beli di Shopee <ExternalLink size={16} />
            </a>

            <a
              href="#products"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-gray-900/80 hover:bg-gray-800 border border-gray-700 text-white font-bold px-6 py-4 rounded-2xl text-sm transition-all"
            >
              Lihat Produk <ArrowRight size={16} />
            </a>
          </motion.div>

          {/* BADGE JAMINAN */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.5 }}
            className="flex items-center gap-6 pt-6 text-xs text-gray-400 border-t border-gray-800/80 w-full"
          >
            <div className="flex items-center gap-2">
              <ShieldCheck size={16} className="text-red-500" />
              <span>Garansi Resmi 1-3 Tahun</span>
            </div>
            <div className="flex items-center gap-2">
              <ShieldCheck size={16} className="text-red-500" />
              <span>Bisa COD & Pasang Onsite</span>
            </div>
          </motion.div>

        </div>
      </div>
    </section>
  );
};

export default Hero;
