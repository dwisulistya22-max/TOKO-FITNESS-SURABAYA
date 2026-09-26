import { useState, useEffect } from 'react';
import { MapPin, Phone, Lock, CheckCircle2 } from 'lucide-react';
import MarketplaceButtons from './MarketplaceButtons';
import { useMarketplaces } from '../utils/marketplaces';

const PROJECT_IDS = ['qi4rocc0', '856jrik3'];
const DATASET = 'production';

const Footer = ({ onLogin }: { onLogin: () => void }) => {
  const marketplaces = useMarketplaces();
  const [logoUrl, setLogoUrl] = useState<string>('/logo.png');
  const [address, setAddress] = useState<string>('Jl. Dukuh Kuwukan Gg. 2 No.22, Lontar, Kec. Sambikerep, Surabaya');

  useEffect(() => {
    const fetchFooterData = async () => {
      const query = encodeURIComponent(`{
        "store": *[_type in ["storeConfig","storeInfo","settings"]][0]{
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
            if (storeData.logo) setLogoUrl(storeData.logo);
            if (storeData.alamat) setAddress(storeData.alamat);
            break;
          }
        } catch (err) { console.error('Error fetching footer data:', err); }
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
            <p className="text-[10px] font-black uppercase tracking-[0.18em] text-amber-300">Belanja juga di marketplace</p>
            <MarketplaceButtons items={marketplaces} variant="footer" />
          </div>

          <div className="hidden lg:block">
            <h4 className="text-sm font-bold uppercase tracking-wider mb-4 text-white">Tautan Cepat</h4>
            <ul className="space-y-2.5 text-xs text-slate-400">
              <li><a href="#hero" className="hover:text-red-500 transition-colors">Beranda</a></li>
              <li><a href="#products" className="hover:text-red-500 transition-colors">Produk</a></li>
              <li><a href="#categories" className="hover:text-red-500 transition-colors">Kategori</a></li>
              <li><a href="#marketplace" className="hover:text-red-500 transition-colors">Shopee, Lazada & Marketplace</a></li>
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-bold uppercase tracking-wider mb-4 text-white">Layanan</h4>
            <ul className="space-y-3 text-xs text-slate-400">
              <li className="flex items-center gap-2"><CheckCircle2 size={15} className="text-green-500 shrink-0" /> Garansi Resmi 1 Tahun</li>
              <li className="flex items-center gap-2"><CheckCircle2 size={15} className="text-green-500 shrink-0" /> Pengiriman & Pemasangan Onsite</li>
              <li className="flex items-center gap-2"><CheckCircle2 size={15} className="text-green-500 shrink-0" /> Unit 100% Original & Baru</li>
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-bold uppercase tracking-wider mb-4 text-white">Hubungi Kami</h4>
            <ul className="space-y-3.5 text-xs text-slate-400">
              <li>
                <a href={`https://maps.google.com/?q=${encodeURIComponent(address)}`} target="_blank" rel="noopener noreferrer" className="flex items-start gap-2.5 hover:text-white transition-colors group">
                  <MapPin size={16} className="text-red-500 shrink-0 mt-0.5 group-hover:scale-110 transition-transform" />
                  <div><span>{address}</span><span className="text-red-500 font-bold block mt-1 underline">📍 Buka Maps →</span></div>
                </a>
              </li>
              <li>
                <a href="https://wa.me/6281332345448?text=Halo%20Admin%201%20Toko%20Fitness%20Surabaya" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2.5 hover:text-green-400 transition-colors group">
                  <Phone size={16} className="text-red-500 shrink-0 group-hover:scale-110 transition-transform" />
                  <span>Admin 1: <strong className="text-white group-hover:text-green-400 underline">+6281332345448</strong></span>
                </a>
              </li>
              <li>
                <a href="https://wa.me/6281235907956?text=Halo%20Admin%202%20Toko%20Fitness%20Surabaya" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2.5 hover:text-green-400 transition-colors group">
                  <Phone size={16} className="text-red-500 shrink-0 group-hover:scale-110 transition-transform" />
                  <span>Admin 2: <strong className="text-white group-hover:text-green-400 underline">+6281235907956</strong></span>
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-slate-500">
          <p>© 2024 TOKO FITNESS SURABAYA. All rights reserved.</p>
          <button onClick={onLogin} className="inline-flex items-center gap-1.5 bg-slate-800 hover:bg-red-600 text-slate-300 hover:text-white px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all border border-slate-700 cursor-pointer">
            <Lock size={12} /> Super Admin
          </button>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
