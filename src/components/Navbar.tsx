import { useState, useEffect } from 'react';
import { Search, ShoppingCart, Phone } from 'lucide-react';
import { STORE_CONFIG } from '../data/config';

const SANITY_PROJECT_ID = 'qi4rocc0';
const SANITY_DATASET = 'production';
const SANITY_URL = `https://${SANITY_PROJECT_ID}.api.sanity.io/v2024-01-01/data/query/${SANITY_DATASET}?query=`;

export interface NavbarProps {
  isAdmin?: boolean;
  logo?: string;
  onLogoChange?: (logo: string) => void;
}

const Navbar = (props: NavbarProps) => {
  const [logoUrl, setLogoUrl] = useState<string>('');
  const [phone, setPhone] = useState<string>(STORE_CONFIG.phone);

  useEffect(() => {
    const fetchStoreData = async () => {
      try {
        const query = encodeURIComponent(`*[_type in ["storeConfig", "storeInfo", "settings"]][0]{
          "logo": logo.asset->url,
          "phone": coalesce(phone, whatsapp, "")
        }`);
        const res = await fetch(`${SANITY_URL}${query}`, { cache: 'no-store' });
        const data = await res.json();
        if (data?.result) {
          if (data.result.logo) setLogoUrl(data.result.logo);
          if (data.result.phone) setPhone(data.result.phone);
        }
      } catch (e) {
        console.error(e);
      }
    };
    fetchStoreData();
  }, []);

  const displayLogo = props.logo || logoUrl;
  const safePhone = phone || STORE_CONFIG.phone || '6281235907956';
  const firstPhone = safePhone.split(/[/,&\n]/)[0]?.replace(/\D/g, '') || '6281235907956';

  const scrollToProducts = () => {
    const el = document.getElementById('products');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <nav className="sticky top-0 z-50 bg-white shadow-sm border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        
        {/* LOGO FS GRAPHIC KOTAK ELEGAN */}
        <a href="#beranda" className="flex items-center">
          {displayLogo ? (
            <img
              src={displayLogo}
              alt="Surabaya Fitness"
              className="h-16 w-auto object-contain shadow-sm"
            />
          ) : (
            <div className="bg-gradient-to-br from-slate-900 via-gray-900 to-black p-2.5 rounded-lg border border-gray-800 shadow-md flex items-center gap-2">
              <div className="bg-red-600 text-white font-black px-2.5 py-1 rounded text-base tracking-widest">
                FS
              </div>
              <div className="text-left leading-none">
                <span className="block font-black text-white text-sm tracking-wider">FITNESS</span>
                <span className="block text-[10px] font-bold text-red-500 tracking-widest mt-0.5">SURABAYA</span>
              </div>
            </div>
          )}
        </a>

        {/* MENU NAVIGASI TENGAH */}
        <div className="hidden md:flex items-center gap-8 font-semibold text-gray-700 text-sm">
          <a href="#beranda" className="hover:text-red-600 transition-colors">Beranda</a>
          <a href="#products" className="hover:text-red-600 transition-colors">Produk</a>
          <a href="#categories" className="hover:text-red-600 transition-colors">Kategori</a>
          <a href="#tentang" className="hover:text-red-600 transition-colors">Tentang Kami</a>
        </div>

        {/* AKSI KANAN: CARI, TROLI, TOMBOL MERAH HUBUNGI KAMI */}
        <div className="flex items-center gap-5">
          <button onClick={scrollToProducts} className="text-gray-600 hover:text-red-600 transition-colors" title="Cari Produk">
            <Search size={20} />
          </button>

          <div onClick={scrollToProducts} className="relative cursor-pointer text-gray-600 hover:text-red-600 transition-colors" title="Troli">
            <ShoppingCart size={22} />
            <span className="absolute -top-2 -right-2 bg-red-600 text-white text-[10px] font-black rounded-full w-4 h-4 flex items-center justify-center border border-white">
              0
            </span>
          </div>

          <a
            href={`https://wa.me/${firstPhone}?text=Halo%20Surabaya%20Fitness,%20saya%20mau%20bertanya`}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-red-600 hover:bg-red-700 text-white px-6 py-2.5 rounded-full font-bold text-sm flex items-center gap-2 shadow-lg shadow-red-600/30 transition-all cursor-pointer"
          >
            <Phone size={16} />
            <span>Hubungi Kami</span>
          </a>
        </div>

      </div>
    </nav>
  );
};

export default Navbar;
