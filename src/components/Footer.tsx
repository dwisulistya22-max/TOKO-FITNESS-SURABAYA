import { useState, useEffect } from 'react';
import { MapPin, Phone, Mail, ExternalLink, Lock } from 'lucide-react';
import { STORE_CONFIG } from '../data/config';

const PROJECT_IDS = ['qi4rocc0', '856jrik3'];
const DATASET = 'production';

// LINK SHOPEE TOKO ANDA
const OFFICIAL_SHOPEE_URL = 'https://shopee.co.id/fitnesssurabaya';

const Footer = () => {
  const [shopeeUrl, setShopeeUrl] = useState<string>(OFFICIAL_SHOPEE_URL);
  const [logoUrl, setLogoUrl] = useState<string>('/logo.png');
  
  // STATE UNTUK ALAMAT DINAMIS DARI SANITY
  const [address, setAddress] = useState<string>('Jl. Dukuh Kuwukan Gg. 2 No.22, Lontar, Kec. Sambikerep, Surabaya');

  useEffect(() => {
    const fetchFooterData = async () => {
      // Query mengambil Logo, Shopee, dan ALAMAT terbaru
      const query = encodeURIComponent(`{
        "store": *[_type in ["storeConfig","storeInfo","settings"]][0]{
          "shopee": coalesce(shopee, shopeeUrl, ""),
          "facebook": coalesce(facebook, ""),
          "logo": coalesce(logo.asset->url, image.asset->url, photo.asset->url, ""),
          "alamat": coalesce(alamat, address, "")
        }
      }`);

      for (const id of PROJECT_IDS) {
        try {
          const res = await fetch(`https://${id}.api.sanity.io/v2024-01-01/data/query/${DATASET}?query=${query}`, { cache: 'no-store' });
          const data = await res.json();
          
          if (data?.result?.store) {
            const storeData = data.result.store;
            
            // 1. Update Logo
            if (storeData.logo) setLogoUrl(storeData.logo);

            // 2. Update Alamat (Agar muncul kata DUKUH sesuai Sanity)
            if (storeData.alamat) setAddress(storeData.alamat);

            // 3. Update Link Shopee
            const rawLink = storeData.shopee || storeData.facebook || '';
            if (rawLink && rawLink.includes('shopee.co.id') && !rawLink.includes('id.sh.ee')) {
               setShopeeUrl(rawLink.startsWith('http') ? rawLink : 'https://' + rawLink);
            } else {
              setShopeeUrl(OFFICIAL_SHOPEE_URL);
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
    <footer id="footer" className="bg-[#0f172a] text-white pt-16 pb-8 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 pb-12 border-b border-slate-800">
          
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <img src={logoUrl} alt="Logo" className="h-12 w-12 object-contain rounded-xl bg-white p-1" onError={(e: any) => { e.target.src = '/logo.png'; }} />
              <span className="font-black text-xl tracking-tight italic uppercase">TOKO FITNESS SURABAYA</span>
            </div>
            <p className="text-slate-400 text-xs leading-relaxed">
              Pusat penyedia alat fitness terlengkap dan terpercaya di Surabaya. Solusi tepat untuk gaya hidup sehat Anda.
            </p>
            <a href={shopeeUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center justify-center gap-2 bg-[#EE4D2D] hover:bg-[#d73211] text-white px-5 py-3 rounded-2xl text-xs font-bold shadow-lg transition-all transform hover:-translate-y-0.5">
              🧡 Shopee Official <ExternalLink size={14} />
            </a>
          </div>

          <div className="hidden lg:block">
            <h4 className="text-sm font-bold uppercase tracking-wider mb-4 text-white">Tautan Cepat</h4>
            <ul className="space-y-2.5 text-xs text-slate-400">
              <li><a href="#hero" className="hover:text-red-500 transition-colors">Beranda</a></li>
              <li><a href="#products" className="hover:text-red-500 transition-colors">Produk</a></li>
              <li><a href="#categories" className="hover:text-red-500 transition-colors">Kategori</a></li>
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-bold uppercase tracking-wider mb-4 text-white">Layanan</h4>
            <ul className="space-y-2.5 text-xs text-slate-400">
              <li>Garansi Resmi 1-3 Tahun</li>
              <li>Pengiriman & Pemasangan Onsite</li>
              <li>Layanan Pembayaran COD</li>
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-bold uppercase tracking-wider mb-4 text-white">Hubungi Kami</h4>
            <ul className="space-y-3.5 text-xs text-slate-400">
              {/* ALAMAT DIAMBIL LANGSUNG DARI SANITY */}
              <li>
                <a 
                  href={`https://maps.google.com/?q=${encodeURIComponent(address)}`} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="flex items-start gap-2.5 hover:text-white transition-colors group"
                >
                  <MapPin size={16} className="text-red-500 shrink-0 mt-0.5 group-hover:scale-110 transition-transform" />
                  <div>
                    <span className="leading-relaxed">{address}</span>
                    <span className="text-red-500 font-bold block mt-1 underline">📍 Buka Maps →</span>
                  </div>
                </a>
              </li>

              <li>
                <a href="https://wa.me/6281332345448" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2.5 hover:text-green-400 transition-colors group">
                  <Phone size={16} className="text-red-500 shrink-0 group-hover:scale-110 transition-transform" />
                  <span>Admin 1: <strong className="text-white">+6281332345448</strong></span>
                </a>
              </li>

              <li>
                <a href="https://wa.me/6281235907956" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2.5 hover:text-green-400 transition-colors group">
                  <Phone size={16} className="text-red-500 shrink-0 group-hover:scale-110 transition-transform" />
                  <span>Admin 2: <strong className="text-white">+6281235907956</strong></span>
                </a>
              </li>

              <li>
                <a href="mailto:dwisulistya22@gmail.com" className="flex items-center gap-2.5 hover:text-red-400 transition-colors group">
                  <Mail size={16} className="text-red-500 shrink-0 group-hover:scale-110 transition-transform" />
                  <span className="underline">dwisulistya22@gmail.com</span>
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-slate-500">
          <p>© 2024 TOKO FITNESS SURABAYA. All rights reserved.</p>
          <a href="https://www.sanity.io/manage" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 bg-slate-800 hover:bg-red-600 text-slate-300 hover:text-white px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all border border-slate-700">
            <Lock size={12} /> Super Admin
          </a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
