import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ShoppingBag, MessageCircle, ArrowRight } from 'lucide-react';
import { STORE_CONFIG } from '../data/config';

// =========================================================
// KONFIGURASI SANITY REST API
// =========================================================
const SANITY_PROJECT_ID = 'qi4rocc0';
const SANITY_DATASET = 'production';
const SANITY_URL = `https://${SANITY_PROJECT_ID}.api.sanity.io/v2024-01-01/data/query/${SANITY_DATASET}?query=`;

// Foto Background Default jika di Sanity belum di-upload
const DEFAULT_BG = 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=1600&auto=format&fit=crop';

interface HeroProps {
  isAdmin?: boolean;
  logo?: string;
  onLogoChange?: (logo: string) => void;
}

const Hero = ({}: HeroProps) => {
  const [heroData, setHeroData] = useState<any>({
    title: STORE_CONFIG.hero?.title || 'KUALITAS GYM PROFESIONAL DI RUMAH ANDA',
    subtitle: STORE_CONFIG.hero?.subtitle || 'Pusat penyedia alat fitness terlengkap dan terpercaya di Surabaya. Solusi tepat untuk gaya hidup sehat Anda.',
    tag: STORE_CONFIG.hero?.tag || 'PROMO CUCI GUDANG 2024',
    image: DEFAULT_BG
  });

  const [loading, setLoading] = useState<boolean>(true);

  // -----------------------------------------------------
  // AMBIL DATA BANNER / SLIDER DARI SANITY STUDIO
  // -----------------------------------------------------
  useEffect(() => {
    const fetchHeroFromSanity = async () => {
      try {
        setLoading(true);
        // Query GROQ fleksibel untuk mengambil data Slider / Banner
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
        console.error('Gagal mengambil banner dari Sanity:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchHeroFromSanity();
  }, []);

  // Scroll halus ke section produk
  const scrollToProducts = () => {
    const el = document.getElementById('products');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const waNumber = STORE_CONFIG.phone || '6281332345448';

  return (
    <section className="relative min-h-[85vh] flex items-center bg-gray-950 overflow-hidden pt-20 pb-16">
      {/* GAMBAR BACKGROUND DENGAN OVERLAY GELAP ELEGAN */}
      <div className="absolute inset-0 z-0">
        <img
          src={heroData.image}
          alt="Banner Surabaya Fitness"
          className="w-full h-full object-cover object-center opacity-40 transition-all duration-700"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-gray-950 via-gray-950/80 to-transparent z-10" />
        <div className="absolute inset-0 bg-gradient-to-t from-gray-950 via-transparent to-transparent z-10" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-20 w-full">
        <div className="max-w-3xl">
          
          {/* BADGE PROMO MERAH */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 bg-red-600/90 text-white font-black text-xs sm:text-sm px-4 py-2 rounded-full shadow-lg shadow-red-600/30 uppercase tracking-wider mb-6 border border-red-500/50"
          >
            <span className="w-2 h-2 rounded-full bg-white animate-ping" />
            {heroData.tag}
          </motion.div>

          {/* JUDUL UTAMA BANNER */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-4xl sm:text-6xl md:text-7xl font-black text-white leading-tight uppercase tracking-tight mb-6"
          >
            {heroData.title.split(' ').map((word: string, i: number) => (
              <span key={i} className={word.toLowerCase().includes('gym') || word.toLowerCase().includes('fitness') ? 'text-red-600' : ''}>
                {word}{' '}
              </span>
            ))}
          </motion.h1>

          {/* SUB-JUDUL / DESKRIPSI */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-lg sm:text-xl text-gray-300 font-normal leading-relaxed mb-10 max-w-2xl"
          >
            {heroData.subtitle}
          </motion.p>

          {/* TOMBOL AKSI LENGKAP */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="flex flex-col sm:flex-row gap-4 items-stretch sm:items-center"
          >
            <button
              onClick={scrollToProducts}
              className="bg-red-600 hover:bg-red-700 text-white px-8 py-4 rounded-2xl font-bold text-base flex items-center justify-center gap-3 shadow-xl shadow-red-600/40 hover:scale-105 transition-all cursor-pointer"
            >
              <ShoppingBag size={20} />
              <span>Lihat Produk Unggulan</span>
              <ArrowRight size={18} />
            </button>

            <a
              href={`https://wa.me/${waNumber}?text=Halo%20Surabaya%20Fitness,%20saya%20mau%20konsultasi%20alat%20fitness`}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-gray-900/90 hover:bg-gray-800 text-white border border-gray-700 px-8 py-4 rounded-2xl font-bold text-base flex items-center justify-center gap-3 backdrop-blur-sm hover:scale-105 transition-all cursor-pointer"
            >
              <MessageCircle size={20} className="text-green-500" />
              <span>Konsultasi WA Gratis</span>
            </a>
          </motion.div>

        </div>
      </div>
    </section>
  );
};

export default Hero;
