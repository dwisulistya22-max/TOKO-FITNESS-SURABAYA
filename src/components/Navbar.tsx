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

  const activeLogo = props.logo || logoUrl || STORE_CONFIG.logo;
  const safePhone = phone || STORE_CONFIG.phone || '6281235907956';
  const firstPhone = safePhone.split(/[/,&\n]/)[0]?.replace(/\D/g, '') || '6281235907956';

  const scrollToProducts = () => {
    const el = document.getElementById('products');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <nav className="sticky top-0 z-50 bg-white border-b border-gray-100 shadow-sm antialiased">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        
        {/* LOGO KOTAK KIRI (KONSISTEN PERSIS DENGAN HERO) */}
        <a href="#beranda" className="flex items-center shrink-0">
          <div className="w-16 h-16 bg-black rounded-lg overflow-hidden border border-gray-800 shadow-md flex items-center justify-center">
            {activeLogo ? (
              <img
                src={activeLogo}
                alt="FS Fitness Surabaya"
                className="w-full h-full object-cover"
              />
            ) : (
              <span className="text-white font-black text-xl">FS</span>
            )}
          </div>
        </a>

        {/* MENU TENGAH - FONT LEMBUT & BERSIH */}
        <div className="hidden md:flex items-center gap-8 font-medium text-gray-700 text-base tracking-normal">
          <a href="#beranda" className="hover:text-red-600 transition-colors">Beranda</a>
          <a href="#products" className="hover:text-red-600 transition-colors">Produk</a>
          <a href="#categories" className="hover:text-red-600 transition-colors">Kategori</a>
          <a href="#tentang" className="hover:text-red-600 transition-colors">Tentang Kami</a>
        </div>

        {/* AKSI KANAN: CARI, TROLI, TOMBOL MERAH HUBUNGI KAMI */}
        <div className="flex items-center gap-5">
          <button onClick={scrollToProducts} className="text-gray-700 hover:text-red-600 transition-colors" title="Cari">
            <Search size={20} />
          </button>

          <button onClick={scrollToProducts} className="relative text-gray-700 hover:text-red-600 transition-colors" title="Troli">
            <ShoppingCart size={22} />
            <span className="absolute -top-2 -right-2 bg-red-600 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
              0
            </span>
          </button>

          <a
            href={`https://wa.me/${firstPhone}?text=Halo%20Surabaya%20Fitness`}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-[#e60000] hover:bg-red-700 text-white px-6 py-2.5 rounded-full font-medium text-sm flex items-center gap-2 shadow-md shadow-red-600/30 transition-all"
          >
            <Phone size={16} />
            <span className="hidden sm:inline">Hubungi Kami</span>
          </a>
        </div>

      </div>
    </nav>
  );
};

export default Navbar;
