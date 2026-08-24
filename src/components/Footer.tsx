import { useState, useEffect } from 'react';
import { MapPin, Phone, Mail, ExternalLink, Lock } from 'lucide-react';
import { STORE_CONFIG } from '../data/config';

const PROJECT_IDS = ['qi4rocc0', '856jrik3'];
const DATASET = 'production';

// 🎯 LINK LANGSUNG TOKO ANDA (TIDAK AKAN NYASAR KE TOKO LAIN)
const OFFICIAL_SHOPEE_URL = 'https://shopee.co.id/toko_fitness_surabaya';

// FUNGSI PEMBERSIH LINK (PENCEGAH LINK RUSAK / MATI)
const cleanShopeeUrl = (url: any) => {
  if (!url || typeof url !== 'string') return OFFICIAL_SHOPEE_URL;
  const trimmed = url.trim();
  // Jika link berisi id.sh.ee yang sering mati, paksa pakai link toko langsung
  if (trimmed.includes('id.sh.ee') || trimmed.length < 10) {
    return OFFICIAL_SHOPEE_URL;
  }
  if (!trimmed.startsWith('http://') && !trimmed.startsWith('https://')) {
    return 'https://' + trimmed;
  }
  return trimmed;
};

const Footer = () => {
  const [shopeeUrl, setShopeeUrl] = useState<string>(OFFICIAL_SHOPEE_URL);
  const [logoUrl, setLogoUrl] = useState<string>('/logo.png');

  useEffect(() => {
    const fetchFooterData = async () => {
      const query = encodeURIComponent(`{
        "store": *[_type in ["storeConfig","storeInfo","settings"]][0]{
          "shopee": coalesce(shopee, shopeeUrl, ""),
          "facebook": coalesce(facebook, ""),
          "logo": coalesce(logo.asset->url, image.asset->url, photo.asset->url, "")
        }
      }`);

      for (const id of PROJECT_IDS) {
        try {
          const res = await fetch(`https://${id}.api.sanity.io/v2024-01-01/data/query/${DATASET}?query=${query}`, { cache: 'no-store' });
          const data = await res.json();
          
          if (data?.result?.store) {
            const storeData = data.result.store;
            if (storeData.logo) setLogoUrl(storeData.logo);

            const rawLink = storeData.shopee || storeData.facebook || '';
            const cleaned = cleanShopeeUrl(rawLink);
            setShopeeUrl(cleaned);
            break;
          }
        } catch (err) { 
          console.error('Error fetching footer data:', err); 
        }
      }
    };
    fetchFooterData();
  }, []);

  return (
    <footer id="footer" className="bg-[#0f172a] text-white pt-16 pb-8 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 pb-12 border-b border-slate-800">
          
          {/* KOLOM 1: LOGO & SHOPEE OFFICIAL */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <img 
                src={logoUrl} 
                alt="Logo Toko Fitness Surabaya" 
                className="h-12 w-12 object-contain rounded-xl bg-white p-1" 
                onError={(e: any) => { e.target.src = '/logo.png'; }}
              />
              <span className="font-black text-xl tracking-tight italic uppercase">FITNESS SURABAYA</span>
            </div>
            <p className="text-slate-400 text-xs leading-relaxed">
              Pusat penyedia alat fitness terlengkap dan terpercaya di Surabaya. Solusi tepat untuk gaya hidup sehat Anda dengan peralatan berkualitas tinggi.
            </p>
            
            {/* TOMBOL SHOPEE UTAMA */}
            <a 
              href={shopeeUrl} 
              target="_blank" 
              rel="noopener noreferrer" 
              className="inline-flex items-center justify-center gap-2 bg-[#EE4D2D] hover:bg-[#d73211] text-white px-5 py-3 rounded-2xl text-xs font-bold shadow-lg transition-all transform hover:-translate-y-0.5"
            >
              🧡 Shopee Official <ExternalLink size={14} />
            </a>
          </div>

          {/* KOLOM 2: TAUTAN CEPAT */}
          <div>
            <h4 className="text-sm font-bold uppercase tracking-wider mb-4 text-white">Tautan Cepat</h4>
            <ul className="space-y-2.5 text-xs text-slate-400">
              <li><a href="#hero" className="hover:text-red-500 transition-colors">Beranda</a></li>
              <li><a href="#products" className="hover:text-red-500 transition-colors">Semua Produk</a></li>
              <li><a href="#categories" className="hover:text-red-500 transition-colors">Kategori</a></li>
            </ul>
          </div>

          {/* KOLOM 3: LAYANAN PELANGGAN */}
          <div>
            <h4 className="text-sm font-bold uppercase tracking-wider mb-4 text-white">Layanan Pelanggan</h4>
            <ul className="space-y-2.5 text-xs text-slate-400">
              <li>Garansi Resmi 1-3 Tahun</li>
              <li>Pengiriman & Pemasangan Onsite</li>
              <li>Layanan Pembayaran COD</li>
            </ul>
          </div>

          {/* KOLOM 4: HUBUNGI KAMI */}
          <div>
            <h4 className="text-sm font-bold uppercase tracking-wider mb-4 text-white">Hubungi Kami</h4>
            <ul className="space-y-3.5 text-xs text-slate-400">
              <li>
                <a 
                  href="https://maps.google.com/?q=Jl.+Kuwukan+Gg.+2+No.22,+Lontar,+Kec.+Sambikerep,+Surabaya" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="flex items-start gap-2.5 hover:text-white transition-colors group"
                >
                  <MapPin size={16} className="text-red-500 shrink-0 mt-0.5 group-hover:scale-110 transition-transform" />
                  <div>
                    <span>Jl. Kuwukan Gg. 2 No.22, Lontar, Kec. Sambikerep, Surabaya, Jawa Timur 60216</span>
                    <span className="text-red-500 font-bold block mt-1 underline group-hover:text-red-400">
                      📍 Buka di Google Maps →
                    </span>
                  </div>
                </a>
              </li>

              <li>
                <a 
                  href="https://wa.me/6281332345448?text=Halo%20Admin%201%20Toko%20Fitness%20Surabaya" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="flex items-center gap-2.5 hover:text-green-400 transition-colors group"
                >
                  <Phone size={16} className="text-red-500 shrink-0 group-hover:scale-110 transition-transform" />
                  <span>Admin 1: <strong className="text-white group-hover:text-green-400 underline">+6281332345448</strong></span>
                </a>
              </li>

              <li>
                <a 
                  href="https://wa.me/6281235907956?text=Halo%20Admin%202%20Toko%20Fitness%20Surabaya" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="flex items-center gap-2.5 hover:text-green-400 transition-colors group"
                >
                  <Phone size={16} className="text-red-500 shrink-0 group-hover:scale-110 transition-transform" />
                  <span>Admin 2: <strong className="text-white group-hover:text-green-400 underline">+6281235907956</strong></span>
                </a>
              </li>

              <li>
                <a 
                  href="mailto:dwisulistya22@gmail.com" 
                  className="flex items-center gap-2.5 hover:text-red-400 transition-colors group"
                >
                  <Mail size={16} className="text-red-500 shrink-0 group-hover:scale-110 transition-transform" />
                  <span className="underline">dwisulistya22@gmail.com</span>
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* COPYRIGHT & SUPER ADMIN */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-slate-500">
          <p>© 2024 TOKO FITNESS SURABAYA. All rights reserved.</p>
          
          <a 
            href="https://www.sanity.io/manage" 
            target="_blank" 
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 bg-slate-800 hover:bg-red-600 text-slate-300 hover:text-white px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all border border-slate-700 shadow-sm"
          >
            <Lock size={12} />
            Super Admin
          </a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
