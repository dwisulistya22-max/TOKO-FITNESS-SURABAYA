import { useState, useEffect } from 'react';
import { STORE_CONFIG } from '../data/config';

const SANITY_PROJECT_ID = 'qi4rocc0';
const SANITY_DATASET = 'production';
const SANITY_URL = `https://${SANITY_PROJECT_ID}.api.sanity.io/v2024-01-01/data/query/${SANITY_DATASET}?query=`;

// Background gym gelap + lampu merah (gagah seperti foto Anda)
const DEFAULT_BG =
  'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=1920&auto=format&fit=crop';

export interface HeroProps {
  isAdmin?: boolean;
  logo?: string;
  onLogoChange?: (logo: string) => void;
}

const Hero = (props: HeroProps) => {
  const [heroData, setHeroData] = useState({
    title: STORE_CONFIG.hero?.title || 'KUALITAS GYM PROFESIONAL DI RUMAH ANDA',
    subtitle:
      STORE_CONFIG.hero?.subtitle ||
      'Pusat penyedia alat fitness terlengkap dan terpercaya di Surabaya.',
    tag: STORE_CONFIG.hero?.tag || 'PROMO CUCI GUDANG 2024',
    image: DEFAULT_BG,
    poster: props.logo || '',
  });

  useEffect(() => {
    const fetchAll = async () => {
      try {
        // Banner + logo toko
        const bannerQuery = encodeURIComponent(`*[_type in ["slider", "banner", "hero"]][0]{
          "title": coalesce(title, heading, name, ""),
          "subtitle": coalesce(subtitle, description, subtext, desc, ""),
          "tag": coalesce(tag, badge, promo, label, ""),
          "image": coalesce(image.asset->url, photo.asset->url, bgImage.asset->url, "")
        }`);
        const storeQuery = encodeURIComponent(`*[_type in ["storeConfig", "storeInfo", "settings"]][0]{
          "logo": logo.asset->url
        }`);

        const [bannerRes, storeRes] = await Promise.all([
          fetch(`${SANITY_URL}${bannerQuery}`, { cache: 'no-store' }),
          fetch(`${SANITY_URL}${storeQuery}`, { cache: 'no-store' }),
        ]);

        const bannerJson = await bannerRes.json();
        const storeJson = await storeRes.json();

        const b = bannerJson?.result || {};
        const s = storeJson?.result || {};

        setHeroData({
          title: b.title || STORE_CONFIG.hero?.title || 'KUALITAS GYM PROFESIONAL DI RUMAH ANDA',
          subtitle:
            b.subtitle ||
            STORE_CONFIG.hero?.subtitle ||
            'Pusat penyedia alat fitness terlengkap dan terpercaya di Surabaya.',
          tag: b.tag || STORE_CONFIG.hero?.tag || 'PROMO CUCI GUDANG 2024',
          image: b.image && b.image.length > 5 ? b.image : DEFAULT_BG,
          poster: props.logo || s.logo || '',
        });
      } catch (err) {
        console.error(err);
      }
    };

    fetchAll();
  }, [props.logo]);

  return (
    <section
      id="beranda"
      className="relative min-h-[78vh] md:min-h-[86vh] bg-black text-white overflow-hidden flex items-end"
    >
      {/* BACKGROUND GYM GELAP GAGAH */}
      <div className="absolute inset-0 z-0">
        <img
          src={heroData.image}
          alt="Gym Professional"
          className="w-full h-full object-cover object-center"
        />
        {/* Gelap kiri biar teks & logo kebaca, kanan tetap kelihatan mesin gym */}
        <div className="absolute inset-0 bg-gradient-to-r from-black via-black/75 to-black/25" />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-black/40" />
      </div>

      <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-10 pt-24 md:pb-14 md:pt-28">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-end">
          
          {/* KARTU LOGO FS BESAR KIRI (seperti foto) */}
          <div className="lg:col-span-5">
            <div className="w-full max-w-[420px] rounded-xl overflow-hidden border border-white/10 shadow-2xl bg-black/40 backdrop-blur-[1px]">
              {heroData.poster ? (
                <img
                  src={heroData.poster}
                  alt="FS Fitness Surabaya"
                  className="w-full h-auto object-cover block"
                />
              ) : (
                <div className="aspect-square flex flex-col items-center justify-center bg-gradient-to-b from-slate-900 to-black p-8 text-center">
                  <div className="text-6xl font-black text-cyan-300 tracking-wider mb-2">FS</div>
                  <div className="text-2xl font-black text-white tracking-wide">FITNESS</div>
                  <div className="text-2xl font-black text-blue-200 tracking-wide">SURABAYA</div>
                  <div className="text-[11px] mt-3 tracking-[0.2em] text-cyan-400 font-bold">
                    FITNESS EQUIPMENT & ACCESSORIES
                  </div>
                </div>
              )}
            </div>

            {/* BADGE MERAH DI BAWAH KARTU LOGO */}
            <div className="mt-5">
              <span className="inline-block bg-red-600 text-white text-xs sm:text-sm font-extrabold tracking-wide px-5 py-2.5 rounded-full shadow-lg shadow-red-600/40 uppercase">
                {heroData.tag}
              </span>
            </div>
          </div>

          {/* JUDUL BESAR KANAN/BAWAH */}
          <div className="lg:col-span-7 lg:pb-2">
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black uppercase leading-[0.95] tracking-tight text-white drop-shadow-xl">
              {heroData.title}
            </h1>
            <p className="mt-5 max-w-2xl text-gray-200 text-base sm:text-lg leading-relaxed">
              {heroData.subtitle}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
