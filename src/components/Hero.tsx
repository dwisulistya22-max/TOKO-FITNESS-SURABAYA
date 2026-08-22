import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { STORE_CONFIG } from '../data/config';

const SANITY_PROJECT_ID = 'qi4rocc0';
const SANITY_DATASET = 'production';
const SANITY_URL = `https://${SANITY_PROJECT_ID}.api.sanity.io/v2024-01-01/data/query/${SANITY_DATASET}?query=`;

// 🔴 FOTO GYM LED MERAH ELEGAN (PERSIS SEPERTI FOTO PILIHAN ANDA)
const RED_LED_GYM_BG = 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=1920&auto=format&fit=crop';

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
    image: RED_LED_GYM_BG,
    poster: props.logo || ''
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
          setHeroData((prev: any) => ({
            ...prev,
            title: res.title || prev.title,
            subtitle: res.subtitle || prev.subtitle,
            tag: res.tag || prev.tag,
            image: (res.image && res.image.length > 5) ? res.image : RED_LED_GYM_BG
          }));
        }
      } catch (err) {
        console.error('Gagal mengambil banner:', err);
      }
    };

    fetchHeroFromSanity();
  }, []);

  const displayLogo = props.logo || heroData.poster || STORE_CONFIG.logo;

  return (
    <section className="relative min-h-[88vh] bg-black text-white flex items-center overflow-hidden py-12 antialiased" id="beranda">
      
      {/* BACKGROUND GYM LED MERAH MEWAH & GAGAH */}
      <div className="absolute inset-0 z-0">
        <img
          src={heroData.image}
          alt="Gym Red LED Atmosphere"
          className="w-full h-full object-cover object-center opacity-60"
        />
        {/* Layer kegelapan transparan agar lampu merah menyala & teks mudah dibaca */}
        <div className="absolute inset-0 bg-gradient-to-r from-black via-black/75 to-transparent z-10" />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black/60 z-10" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-20 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          
          {/* POSTER KARTU LOGO FS DI SEBELAH KIRI (SAMA PERSIS DENGAN NAVBAR) */}
          <div className="lg:col-span-5 flex justify-center lg:justify-start">
            <div className="relative rounded-2xl overflow-hidden border border-gray-800 shadow-[0_0_50px_rgba(0,0,0,0.9)] bg-black/80 max-w-[380px] w-full">
              {displayLogo ? (
                <img 
                  src={displayLogo} 
                  alt="FS Fitness Surabaya" 
                  className="w-full h-auto object-cover block" 
                />
              ) : (
                <div className="p-8 text-center bg-gradient-to-b from-gray-900 to-black min-h-[360px] flex flex-col items-center justify-center border border-gray-800">
                  <div className="bg-red-600 text-white font-black text-6xl px-6 py-3 rounded-2xl shadow-xl mb-4">
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
            
            {/* BADGE MERAH CUCI GUDANG */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
              className="inline-block bg-[#e60000] text-white font-black text-xs sm:text-sm px-5 py-2.5 rounded-full uppercase tracking-wider shadow-lg shadow-red-600/40"
            >
              {heroData.tag}
            </motion.div>

            {/* TEKS JUDUL RAKSASA PUTIH GAGAH */}
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-4xl sm:text-6xl lg:text-[4.5rem] font-black text-white leading-[1.02] uppercase tracking-tight drop-shadow-lg"
            >
              {heroData.title}
            </motion.h1>

            {/* SUB-JUDUL / DESKRIPSI */}
            <p className="text-gray-200 text-base sm:text-xl font-normal leading-relaxed max-w-xl">
              {heroData.subtitle}
            </p>

          </div>

        </div>
      </div>

    </section>
  );
};

export default Hero;
