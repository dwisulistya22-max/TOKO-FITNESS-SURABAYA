import { useState, useEffect } from 'react';
import { STORE_CONFIG } from '../data/config';

const SANITY_PROJECT_ID = 'qi4rocc0';
const SANITY_DATASET = 'production';
const SANITY_URL = `https://${SANITY_PROJECT_ID}.api.sanity.io/v2024-01-01/data/query/${SANITY_DATASET}?query=`;

// Background gym gelap + lampu merah (gaya foto Anda)
const DEFAULT_BG =
  'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=1920&auto=format&fit=crop';

export interface HeroProps {
  isAdmin?: boolean;
  logo?: string;
  onLogoChange?: (logo: string) => void;
}

const Hero = (props: HeroProps) => {
  const [data, setData] = useState({
    title: STORE_CONFIG.hero?.title || 'KUALITAS GYM PROFESIONAL DI RUMAH ANDA',
    subtitle:
      STORE_CONFIG.hero?.subtitle ||
      'Pusat penyedia alat fitness terlengkap dan terpercaya di Surabaya.',
    tag: STORE_CONFIG.hero?.tag || 'PROMO CUCI GUDANG 2024',
    bg: DEFAULT_BG,
    poster: props.logo || '',
  });

  useEffect(() => {
    const load = async () => {
      try {
        const bannerQ = encodeURIComponent(`*[_type in ["slider","banner","hero"]][0]{
          "title": coalesce(title, heading, name, ""),
          "subtitle": coalesce(subtitle, description, subtext, ""),
          "tag": coalesce(tag, badge, promo, label, ""),
          "bg": coalesce(image.asset->url, photo.asset->url, bgImage.asset->url, "")
        }`);
        const storeQ = encodeURIComponent(`*[_type in ["storeConfig","storeInfo","settings"]][0]{
          "logo": logo.asset->url
        }`);

        const [bRes, sRes] = await Promise.all([
          fetch(`${SANITY_URL}${bannerQ}`, { cache: 'no-store' }),
          fetch(`${SANITY_URL}${storeQ}`, { cache: 'no-store' }),
        ]);
        const b = (await bRes.json())?.result || {};
        const s = (await sRes.json())?.result || {};

        setData({
          title: b.title || STORE_CONFIG.hero?.title || 'KUALITAS GYM PROFESIONAL DI RUMAH ANDA',
          subtitle:
            b.subtitle ||
            STORE_CONFIG.hero?.subtitle ||
            'Pusat penyedia alat fitness terlengkap dan terpercaya di Surabaya.',
          tag: b.tag || STORE_CONFIG.hero?.tag || 'PROMO CUCI GUDANG 2024',
          bg: b.bg && b.bg.length > 5 ? b.bg : DEFAULT_BG,
          poster: props.logo || s.logo || '',
        });
      } catch (e) {
        console.error(e);
      }
    };
    load();
  }, [props.logo]);

  return (
    <section id="beranda" className="relative min-h-[82vh] md:min-h-[88vh] bg-black overflow-hidden">
      {/* BACKGROUND FULL — mesin gym + lampu merah */}
      <div className="absolute inset-0">
        <img src={data.bg} alt="Gym" className="w-full h-full object-cover object-center" />
        {/* Gelap di kiri/bawah biar logo & teks kebaca, kanan tetap kelihatan gym */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/55 to-black/20" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-transparent to-black/35" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 min-h-[82vh] md:min-h-[88vh] flex items-end pb-10 md:pb-14 pt-28">
        <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-end">
          
          {/* KOLOM KIRI: POSTER FS + BADGE MERAH */}
          <div className="lg:col-span-5">
            <div className="max-w-[400px] rounded-xl overflow-hidden border border-white/10 shadow-2xl bg-black/30">
              {data.poster ? (
                <img
                  src={data.poster}
                  alt="FS Fitness Surabaya"
                  className="w-full h-auto object-cover block"
                />
              ) : (
                <div className="aspect-square flex flex-col items-center justify-center bg-gradient-to-b from-slate-900 to-black p-8 text-center">
                  <div className="text-6xl font-black text-cyan-300 mb-1">FS</div>
                  <div className="text-2xl font-black text-white">FITNESS</div>
                  <div className="text-2xl font-black text-blue-200">SURABAYA</div>
                  <div className="text-[10px] mt-3 tracking-[0.25em] text-cyan-400 font-bold">
                    FITNESS EQUIPMENT & ACCESSORIES
                  </div>
                </div>
              )}
            </div>

            <div className="mt-5">
              <span className="inline-flex bg-red-600 text-white text-xs sm:text-sm font-extrabold uppercase tracking-wide px-5 py-2.5 rounded-full shadow-lg shadow-red-600/50">
                {data.tag}
              </span>
            </div>
          </div>

          {/* KOLOM KANAN/BAWAH: JUDUL RAKSASA PUTIH */}
          <div className="lg:col-span-7 lg:pb-2">
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-[4.5rem] font-black uppercase leading-[0.95] tracking-tight text-white drop-shadow-2xl">
              {data.title}
            </h1>
            <p className="mt-5 max-w-2xl text-gray-200 text-base sm:text-lg leading-relaxed">
              {data.subtitle}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
