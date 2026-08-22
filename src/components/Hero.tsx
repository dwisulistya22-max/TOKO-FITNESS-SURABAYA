import { useState, useEffect } from 'react';
import { STORE_CONFIG } from '../data/config';

const SANITY_PROJECT_ID = 'qi4rocc0';
const SANITY_DATASET = 'production';
const SANITY_URL = `https://${SANITY_PROJECT_ID}.api.sanity.io/v2024-01-01/data/query/${SANITY_DATASET}?query=`;

const DARK_GYM_BG = 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=1920&auto=format&fit=crop';

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
    image: DARK_GYM_BG,
    logo: props.logo || ''
  });

  useEffect(() => {
    const fetchHeroAndLogo = async () => {
      try {
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

        const bannerData = await bannerRes.json();
        const storeData = await storeRes.json();

        const b = bannerData?.result || {};
        const s = storeData?.result || {};

        setHeroData({
          title: b.title || STORE_CONFIG.hero?.title || 'KUALITAS GYM PROFESIONAL DI RUMAH ANDA',
          subtitle: b.subtitle || STORE_CONFIG.hero?.subtitle || 'Pusat penyedia alat fitness terlengkap dan terpercaya di Surabaya.',
          tag: b.tag || STORE_CONFIG.hero?.tag || 'PROMO CUCI GUDANG 2024',
          image: (b.image && b.image.length > 5) ? b.image : DARK_GYM_BG,
          logo: props.logo || s.logo || STORE_CONFIG.logo
        });

      } catch (err) {
        console.error('Error fetching Hero Data:', err);
      }
    };

    fetchHeroFromSanity();
  }, [props.logo]);

  function fetchHeroFromSanity() {
    // helper wrapper
  }

  const activeLogo = props.logo || heroData.logo || STORE_CONFIG.logo;

  return (
    <section className="relative w-full min-h-[85vh] bg-black text-white overflow-hidden flex items-end pb-12 pt-20 antialiased" id="beranda">
      
      {/* BACKGROUND ATMOSFER GYM FULL LEBAR */}
      <div className="absolute inset-0 z-0">
        <img
          src={heroData.image}
          alt="Gym Dark"
          className="w-full h-full object-cover object-center opacity-40"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black via-black/75 to-transparent z-10" />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black/50 z-10" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-20 w-full">
        
        {/* POSTER LOGO BESAR KIRI (LOGONYA SAMA PERSIS DENGAN NAVBAR) */}
        <div className="mb-6">
          <div className="w-full max-w-[340px] sm:max-w-[400px] border border-gray-800 rounded-xl overflow-hidden bg-black/80 shadow-2xl">
            {activeLogo ? (
              <img
                src={activeLogo}
                alt="FS Fitness Surabaya Poster"
                className="w-full h-auto object-cover block"
              />
            ) : (
              <div className="p-8 text-center bg-gradient-to-b from-gray-900 to-black">
                <span className="text-5xl font-black text-blue-400">FS</span>
                <h3 className="text-xl font-bold text-white mt-2">FITNESS SURABAYA</h3>
              </div>
            )}
          </div>
        </div>

        {/* BADGE MERAH "PROMO CUCI GUDANG 2024" */}
        <div className="mb-6">
          <span className="bg-[#e60000] text-white px-5 py-2 rounded-full font-bold text-xs sm:text-sm tracking-wider inline-block shadow-lg uppercase">
            {heroData.tag}
          </span>
        </div>

        {/* TEKS TULISAN RAKSASA PUTIH, LEMBUT, DAN ELEGAN */}
        <div className="max-w-4xl">
          <h1 className="text-4xl sm:text-6xl md:text-7xl lg:text-[5rem] font-black text-white leading-none tracking-tight uppercase drop-shadow-md">
            {heroData.title}
          </h1>

          <p className="text-gray-300 text-base sm:text-xl font-normal mt-4 max-w-2xl leading-relaxed">
            {heroData.subtitle}
          </p>
        </div>

      </div>

    </section>
  );
};

export default Hero;
