import { useState, useEffect } from 'react';
import { ShieldCheck, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';

const PROJECT_IDS = ['qi4rocc0', '856jrik3'];
const DATASET = 'production';

const Hero = () => {
  const [logoUrl, setLogoUrl] = useState<string>('/logo.png');

  useEffect(() => {
    const fetchHeroLogo = async () => {
      const query = encodeURIComponent(`*[_type in ["storeConfig","storeInfo","settings"]][0]{
        "logo": coalesce(logo.asset->url, image.asset->url, photo.asset->url, "")
      }`);

      for (const id of PROJECT_IDS) {
        try {
          const res = await fetch(
            `https://${id}.api.sanity.io/v2024-01-01/data/query/${DATASET}?query=${query}`,
            { cache: 'no-store' }
          );
          const data = await res.json();
          if (data?.result?.logo) {
            setLogoUrl(data.result.logo);
            break;
          }
        } catch (err) {
          console.error('Error fetching hero logo:', err);
        }
      }
    };

    fetchHeroLogo();
  }, []);

  return (
    <section id="hero" className="relative min-h-[80vh] bg-black text-white flex items-center overflow-hidden py-16">
      {/* BACKGROUND IMAGE WITH ELEGANT DARK OVERLAY */}
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
          
          {/* 1. BADGE "PROMO SETIAP HARI" */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 bg-red-600 text-white text-xs font-black uppercase tracking-widest px-4 py-2 rounded-full shadow-lg shadow-red-600/30 border border-red-500/40"
          >
            <Sparkles size={14} className="animate-pulse" />
            "PROMO SETIAP HARI"
          </motion.div>

          {/* 2. LOGO RESMI TAMPIL EKSKLUSIF DI ATAS JUDUL */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="pt-2"
          >
            <img
              src={logoUrl}
              alt="Fitness Surabaya Official Logo"
              className="h-20 sm:h-28 w-auto object-contain rounded-2xl drop-shadow-[0_10px_20px_rgba(0,0,0,0.8)]"
              onError={(e: any) => {
                e.target.src = '/logo.png';
              }}
            />
          </motion.div>

          {/* 3. TULISAN JUDUL UTAMA */}
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

          {/* 5. JAMINAN KUALITAS & GARANSI */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="flex items-center gap-6 pt-6 text-xs sm:text-sm text-gray-300 border-t border-gray-800/80 w-full"
          >
            <div className="flex items-center gap-2">
              <ShieldCheck size={18} className="text-red-500" />
              <span>Garansi Resmi 1-3 Tahun</span>
            </div>
            <div className="flex items-center gap-2">
              <ShieldCheck size={18} className="text-red-500" />
              <span>Bisa COD & Pasang Onsite</span>
            </div>
          </motion.div>

        </div>
      </div>
    </section>
  );
};

export default Hero;
