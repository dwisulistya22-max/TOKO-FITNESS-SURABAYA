import { useState, useEffect } from 'react';
import { MapPin, Phone, Mail, ExternalLink, Lock } from 'lucide-react';
import { STORE_CONFIG } from '../data/config';

const PROJECT_IDS = ['qi4rocc0', '856jrik3'];
const DATASET = 'production';

// LINK PENCARIAN CADANGAN
const SHOPEE_FALLBACK = 'https://shopee.co.id/search?keyword=toko%20fitness%20surabaya';

// FUNGSI PEMBERSIH LINK
const fixLink = (url: any) => {
  if (!url || typeof url !== 'string') return SHOPEE_FALLBACK;
  const link = url.trim();
  if (!link) return SHOPEE_FALLBACK;
  if (!link.startsWith('http')) return 'https://' + link;
  return link;
};

const Footer = () => {
  const [shopeeUrl, setShopeeUrl] = useState<string>(fixLink((STORE_CONFIG as any)?.shopee));
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

            let foundShopee = storeData.shopee;
            const fbLink = storeData.facebook;
            
            if (!foundShopee && fbLink && (fbLink.includes('sh.ee') || fbLink.includes('shopee'))) {
              foundShopee = fbLink;
            }
            
            if (foundShopee) {
              setShopeeUrl(fixLink(foundShopee));
            }
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
    <footer className="bg-[#0f172a] text-white pt-16 pb-8 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 pb-12 border-b border-slate-800">
          
          {/* KOLOM 1: LOGO & SHOPEE */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <img 
                src={logoUrl} 
                alt="Fitness Surabaya Logo" 
                className="h-12 w-12 object-contain rounded-xl bg-white p-1" 
                onError={(e: any) => {
                  e.target.src = '/logo.png';
                }}
              />
              <span className="font-black text-xl tracking-tight italic uppercase">FITNESS SURABAYA</span>
            </div>
            <p className="text-slate-400 text-xs leading-relaxed">
              Pusat penyedia alat fitness terlengkap dan terpercaya di Surabaya. Solusi tepat untuk gaya hidup sehat Anda dengan peralatan berkualitas tinggi.
            </p>
            <a 
              href={shopeeUrl} 
              target="_blank" 
              rel="noopener noreferrer" 
              className="inline-flex items-center justify-center gap-2 bg-[#EE4D2D] hover:bg-[#d73211] text-white px-5 py-3 rounded-2xl text-xs font-bold shadow-lg transition-all"
            >
              🧡 Shopee Official <ExternalLink size={14} />
            </a>
          </div>

          {/* KOLOM 2: TAUTAN */}
          <div>
            <h4 className="text-sm font-bold uppercase tracking-wider mb-4">Tautan Cepat</h4>
            <ul className="space-y-2.5 text-xs text-slate-400">
              <li><a href="#hero" className="hover:text-red-500 transition-colors">Beranda</a></li>
              <li><a href="#products" className="hover:text-red-500 transition-colors">Semua Produk</a></li>
              <li><a href="#categories" className="hover:text-red-500 transition-colors">Kategori</a></li>
            </ul>
          </div>

          {/* KOLOM 3: LAYANAN */}
          <div>
            <h4 className="text-sm font-bold uppercase tracking-wider mb-4">Layanan Pelanggan</h4>
            <ul className="space-y-2.5 text-xs text-slate-400">
              <li>Garansi Resmi 1-3 Tahun</li>
              <li>Pengiriman & Pemasangan Onsite</li>
              <li>Layanan Pembayaran COD</li>
            </ul>
          </div>

          {/* KOLOM 4: HUBUNGI KAMI */}
          <div>
            <h4 className="text-sm font-bold uppercase tracking-wider mb-4">Hubungi Kami</h4>
            <ul className="space-y-3 text-xs text-slate-400">
              <li className="flex items-start gap-2.5">
                <MapPin size={16} className="text-red-500 shrink-0 mt-0.5" />
                <span>Jl. Kuwukan Gg. 2 No.22, Lontar, Kec. Sambikerep, Surabaya, Jawa Timur 60216</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Phone size={16} className="text-red-500 shrink-0" />
                <span>Admin 1: +6281332345448</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Phone size={16} className="text-red-500 shrink-0" />
                <span>Admin 2: +6281235907956</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Mail size={16} className="text-red-500 shrink-0" />
                <span>dwisulistya22@gmail.com</span>
              </li>
            </ul>
          </div>
        </div>

        {/* COPYRIGHT & TOMBOL SUPER ADMIN BERSIH & JELAS */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-slate-500">
          <p>© 2024 TOKO FITNESS SURABAYA. All rights reserved.</p>
          
          {/* TOMBOL SUPER ADMIN JELAS & ELEGAN */}
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
