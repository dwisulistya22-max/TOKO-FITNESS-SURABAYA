import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { STORE_CONFIG } from '../data/config';

const SANITY_PROJECT_ID = 'qi4rocc0';
const SANITY_DATASET = 'production';
const SANITY_URL = `https://${SANITY_PROJECT_ID}.api.sanity.io/v2024-01-01/data/query/${SANITY_DATASET}?query=`;

const DEFAULT_BG = 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=1600&auto=format&fit=crop';

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
    image: DEFAULT_BG
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
            image: (res.image && res.image.length > 5) ? res.image : DEFAULT_BG
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
    <section className="relative min-h-[85vh] bg-black text-white flex items-center overflow-hidden py-12" id="beranda">
      
      {/* BACKGROUND ATMOSFER GYM GELAP DENGAN LAMPU NEON MERAH */}
      <div className="absolute inset-0 z-0">
        <img
          src={heroData.image}
          alt="Atmosphere Gym"
          className="w-full h-full object-cover opacity-35"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black via-black/80 to-transparent z-10" />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black/60 z-10" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-20 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          
          {/* KARTU LOGO GRAFIS FS DI SEBELAH KIRI (SESUAI FOTO ANDA) */}
          <div className="lg:col-span-4 hidden lg:block">
            {displayLogo ? (
              <div className="rounded-2xl overflow-hidden shadow-2xl border border-gray-800 bg-gray-900/90 backdrop-blur-md p-2">
                <img src={displayLogo} alt="FS Fitness Surabaya" className="w-full h-auto object-cover rounded-xl" />
              </div>
            ) : (
              <div className="rounded-2xl overflow-hidden shadow-2xl border border-gray-800 bg-gradient-to-b from-gray-900 to-black p-8 text-center flex flex-col items-center justify-center min-h-[380px]">
                <div className="bg-red-600 text-white font-black text-5xl px-6 py-3 rounded-2xl shadow-xl mb-4">
                  FS
                </div>
                <h3 className="text-2xl font-black text-white tracking-wider">FITNESS SURABAYA</h3>
                <p className="text-xs text-blue-400 tracking-widest uppercase font-bold mt-2">Fitness Equipment & Accessories</p>
              </div>
            )}
          </div>

          {/* TEKS JUDUL UTAMA & PROMO BADGE DI KANAN */}
          <div className="lg:col-span-8 space-y-6">
            
            {/* BADGE MERAH CUCI GUDANG */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
              className="inline-block bg-red-600 text-white font-black text-xs sm:text-sm px-5 py-2 rounded-full uppercase tracking-wider shadow-lg shadow-red-600/40"
            >
              {heroData.tag}
            </motion.div>

            {/* TEKS TEBAL BESAR PUTIH */}
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-4xl sm:text-6xl lg:text-7xl font-black text-white leading-tight uppercase tracking-tight"
            >
              {heroData.title}
            </motion.h1>

            <p className="text-gray-300 text-base sm:text-lg max-w-2xl font-normal leading-relaxed">
              {heroData.subtitle}
            </p>

          </div>

        </div>
      </div>

    </section>
  );
};

export default Hero;
