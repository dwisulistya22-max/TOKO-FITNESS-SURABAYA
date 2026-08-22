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
  const [logoUrl, setLogoUrl] = useState('');
  const [phone, setPhone] = useState(STORE_CONFIG.phone || '');

  useEffect(() => {
    const run = async () => {
      try {
        const q = encodeURIComponent(`*[_type in ["storeConfig","storeInfo","settings"]][0]{
          "logo": logo.asset->url,
          "phone": coalesce(phone, whatsapp, "")
        }`);
        const res = await fetch(`${SANITY_URL}${q}`, { cache: 'no-store' });
        const data = await res.json();
        if (data?.result?.logo) setLogoUrl(data.result.logo);
        if (data?.result?.phone) setPhone(data.result.phone);
      } catch (e) {
        console.error(e);
      }
    };
    run();
  }, []);

  const logo = props.logo || logoUrl;
  const wa = (phone || STORE_CONFIG.phone || '6281235907956')
    .split(/[/,&\n]/)[0]
    .replace(/\D/g, '') || '6281235907956';

  const goProducts = () => {
    document.getElementById('products')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <nav className="sticky top-0 z-50 bg-white border-b border-gray-100 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-[72px] flex items-center justify-between">
        <a href="#beranda" className="shrink-0">
          {logo ? (
            <img src={logo} alt="FS Fitness Surabaya" className="h-14 w-14 object-contain rounded-md" />
          ) : (
            <div className="h-14 w-14 bg-black text-white rounded-md flex items-center justify-center font-black">FS</div>
          )}
        </a>

        <div className="hidden md:flex items-center gap-8 text-[15px] font-semibold text-slate-700">
          <a href="#beranda" className="hover:text-red-600">Beranda</a>
          <a href="#products" className="hover:text-red-600">Produk</a>
          <a href="#categories" className="hover:text-red-600">Kategori</a>
          <a href="#tentang" className="hover:text-red-600">Tentang Kami</a>
        </div>

        <div className="flex items-center gap-4 sm:gap-5">
          <button type="button" onClick={goProducts} className="text-slate-600 hover:text-red-600" aria-label="Cari">
            <Search size={20} />
          </button>
          <button type="button" onClick={goProducts} className="relative text-slate-600 hover:text-red-600" aria-label="Troli">
            <ShoppingCart size={22} />
            <span className="absolute -top-2 -right-2 bg-red-600 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">0</span>
          </button>
          <a
            href={`https://wa.me/${wa}?text=Halo%20Surabaya%20Fitness`}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-red-600 hover:bg-red-700 text-white px-4 sm:px-5 py-2.5 rounded-full font-bold text-sm flex items-center gap-2 shadow-md shadow-red-600/30"
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
