import { useState, useEffect } from 'react';
import { Phone } from 'lucide-react';
import { STORE_CONFIG } from '../data/config';

const SANITY_PROJECT_ID = 'qi4rocc0';
const SANITY_DATASET = 'production';
const SANITY_URL = `https://${SANITY_PROJECT_ID}.api.sanity.io/v2024-01-01/data/query/${SANITY_DATASET}?query=`;

export interface NavbarProps {
  isAdmin?: boolean;
  logo?: string;
  onLogoChange?: (logo: string) => void;
}

const Navbar = (_props: NavbarProps) => {
  const [logoUrl, setLogoUrl] = useState<string>('');
  const [imageError, setImageError] = useState<boolean>(false);
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

  const safePhone = phone || STORE_CONFIG.phone || '6281235907956';
  const firstPhone = safePhone.split(/[/,&\n]/)[0]?.replace(/\D/g, '') || '6281235907956';

  return (
    <nav className="sticky top-0 z-50 bg-white border-b border-gray-100 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        
        {/* LOGO TEKS ELEGAN (ANTI-RUSAK) */}
        <a href="#" className="flex items-center gap-3">
          {logoUrl && !imageError ? (
            <img
              src={logoUrl}
              alt="Surabaya Fitness"
              className="h-12 w-auto object-contain"
              onError={() => setImageError(true)}
            />
          ) : (
            <div className="flex items-center gap-2">
              <div className="bg-red-600 text-white font-black px-3 py-1.5 rounded-xl text-lg tracking-wider shadow-md">
                FS
              </div>
              <div className="font-black text-xl text-gray-900 tracking-tight leading-none">
                FITNESS <span className="text-red-600 block text-xs tracking-widest mt-0.5">SURABAYA</span>
              </div>
            </div>
          )}
        </a>

        {/* NAV LINKS */}
        <div className="hidden md:flex items-center gap-8 font-bold text-sm text-gray-700">
          <a href="#beranda" className="hover:text-red-600 transition-colors">Beranda</a>
          <a href="#products" className="hover:text-red-600 transition-colors">Produk</a>
          <a href="#categories" className="hover:text-red-600 transition-colors">Kategori</a>
          <a href="#tentang" className="hover:text-red-600 transition-colors">Tentang Kami</a>
        </div>

        {/* TOMBOL CALL WA */}
        <div className="flex items-center gap-4">
          <a
            href={`https://wa.me/${firstPhone}?text=Halo%20Surabaya%20Fitness`}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-red-600 hover:bg-red-700 text-white px-5 py-2.5 rounded-full font-bold text-xs sm:text-sm flex items-center gap-2 shadow-md shadow-red-600/30 transition-all"
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
