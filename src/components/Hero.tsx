import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { STORE_CONFIG } from '../data/config';

const SANITY_PROJECT_ID = 'qi4rocc0';
const SANITY_DATASET = 'production';
const SANITY_URL = `https://${SANITY_PROJECT_ID}.api.sanity.io/v2024-01-01/data/query/${SANITY_DATASET}?query=`;

// BACKGROUND GYM GELAP DENGAN ATMOSFER LAMPU RED NEON GAGAH
const DARK_GYM_BG = 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=1600&auto=format&fit=crop';

export interface HeroProps {
  isAdmin?: boolean;
  logo?: string;
  onLogoChange?: (logo: string) => void;
}

const Hero = (props: HeroProps) => {
  const [heroData, setHeroData] = useState<any>({
    title: STORE_CONFIG.hero?.title || 'KUALITAS GYM PROFESIONAL DI RUMAH ANDA',
    subtitle: STORE_CONFIG.hero?.subtitle || 'Pusat penyedia alat fitness terlengkap dan terpercaya di Surabaya.',
    tag: STORE_CONFIG.hero?.tag || 'PROMO CUCI GUDANG 2024',
    image: DARK_GYM_BG
  });

  useEffect(() => {
    const fetchHeroFromSanity = async () => {
      try {
        const query = encodeURIComponent(`*[_type in ["slider", "banner", "hero"]][0]{
          "title": coalesce(title, heading, name, ""),
          "subtitle": coalesce(subtitle, description, subtext, desc, ""),
          "tag": coalesce(tag, badge, promo, label, ""),
          "image": coalesce(image.asset->url, photo.asset->url, bgImage.asset->url, "")
        }`);

        const response = await fetch(`${SANITY_URL}${query}`, { cache: 'no-store' });
        const data = await response.json();

        if (data?.result) {
          const res = data.result;
          setHeroData({
            title: res.title || STORE_CONFIG.hero?.title || 'KUALITAS GYM PROFESIONAL DI RUMAH ANDA',
            subtitle: res.subtitle || STORE_CONFIG.hero?.subtitle || 'Pusat penyedia alat fitness terlengkap dan terpercaya di Surabaya.',
            tag: res.tag || STORE_CONFIG.hero?.tag || 'PROMO CUCI GUDANG 2024',
            image: (res.image && res.image.length > 5) ? res.image : DARK_GYM_BG
          });
        }
      } catch (err) {
        console.error('Gagal mengambil banner:', err);
      }
    };

    fetchHeroFromSanity();
  }, []);

  const displayLogo = props.logo;

  return (
    <section className="relative min-h-[88vh] bg-black text-white flex items-center overflow-hidden py-14" id="beranda">
      
      {/* ATMOSFER GYM GELAP DENGAN KONTRAS GAGAH */}
      <div className="absolute inset-0 z-0">
        <img
          src={heroData.image}
          alt="Gym Atmosphere"
          className="w-full h-full object-cover object-center opacity-45 mix-blend-luminosity"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black via-black/85 to-black/40 z-10" />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black/70 z-10" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-20 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          
          {/* KARTU LOGO FS POSTER DI SEBELAH KIRI (PERSIS FOTO PERTAMA) */}
          <div className="lg:col-span-5 flex justify-center lg:justify-start">
            <div className="relative rounded-2xl overflow-hidden border-2 border-slate-800 shadow-[0_0_50px_rgba(0,0,0,0.9)] bg-slate-900 max-w-[360px] w-full group">
              {displayLogo ? (
                <img src={displayLogo} alt="FS Fitness Surabaya" className="w-full h-auto object-cover" />
              ) : (
                <div className="p-8 text-center bg-gradient-to-b from-slate-900 via-gray-900 to-black flex flex-col items-center justify-center min-h-[380px] border border-slate-800">
                  <div className="bg-red-600 text-white font-black text-6xl px-6 py-3 rounded-2xl shadow-[0_0_30px_rgba(220,38,38,0.5)] mb-4 border border-red-500">
                    FS
                  </div>
                  <h3 className="text-2xl font-black text-white tracking-wider">FITNESS SURABAYA</h3>
                  <p className="text-xs text-cyan-400 font-bold tracking-widest uppercase mt-2">FITNESS EQUIPMENT & ACCESSORIES</p>
                </div>
              )}
            </div>
          </div>

          {/* TEKS PROMO MERAH & JUDUL UTAMA BESAR DI KANAN */}
          <div className="lg:col-span-7 space-y-6 text-left">
            
            {/* BADGE MERAH NEON */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
              className="inline-block bg-red-600 text-white font-black text-xs sm:text-sm px-5 py-2.5 rounded-full uppercase tracking-wider shadow-[0_0_25px_rgba(220,38,38,0.6)]"
            >
              {heroData.tag}
            </motion.div>

            {/* TEKS JUDUL RAKSASA GAGAH PUTIH */}
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-4xl sm:text-6xl lg:text-7xl font-black text-white leading-[1.02] uppercase tracking-tight"
            >
              {heroData.title}
            </motion.h1>

            {/* SUB-JUDUL DESKRIPSI */}
            <p className="text-gray-300 text-base sm:text-xl font-normal leading-relaxed max-w-xl">
              {heroData.subtitle}
            </p>

          </div>

        </div>
      </div>

    </section>
  );
};

export default Hero;
