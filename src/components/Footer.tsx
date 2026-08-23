import { useState, useEffect } from 'react';
import { MapPin, Phone, Mail } from 'lucide-react';
import { STORE_CONFIG } from '../data/config';

const SANITY_PROJECT_ID = 'qi4rocc0';
const SANITY_DATASET = 'production';
const SANITY_URL = `https://${SANITY_PROJECT_ID}.api.sanity.io/v2024-01-01/data/query/${SANITY_DATASET}?query=`;

export interface FooterProps {
  isAdmin?: boolean;
  logo?: string;
  onLogin?: () => void;
}

function fixShopeeUrl(url?: string) {
  if (!url || url.trim().length < 5) return 'https://id.sh.ee/PEdSUDy6';
  const t = url.trim();
  if (t.startsWith('http://') || t.startsWith('https://')) return t;
  return `https://${t}`;
}

const Footer = (props: FooterProps) => {
  const [logoUrl, setLogoUrl] = useState('');
  const [imageError, setImageError] = useState(false);
  const [storeData, setStoreData] = useState({
    phone: STORE_CONFIG.phone || '6281332345448, 6281235907956',
    address: STORE_CONFIG.address || 'Jl. Kuwukan Gg. 2 No.22, Lontar, Kec. Sambikerep, Surabaya, Jawa Timur 60216',
    email: STORE_CONFIG.email || 'dwisulistya22@gmail.com',
    maps: '',
    shopee: STORE_CONFIG.shopee || 'https://id.sh.ee/PEdSUDy6'
  });

  useEffect(() => {
    async function fetchFooterData() {
      try {
        const query = encodeURIComponent(`*[_type in ["storeConfig", "storeInfo", "settings"]][0]{
          "logo": logo.asset->url,
          "phone": coalesce(phone, whatsapp, ""),
          "address": coalesce(address, ""),
          "email": coalesce(email, ""),
          "maps": coalesce(maps, googleMaps, linkMaps, ""),
          "shopee": coalesce(shopee, shopeeUrl, facebook, "")
        }`);
        const response = await fetch(`${SANITY_URL}${query}`, { cache: 'no-store' });
        const data = await response.json();
        if (data?.result) {
          if (data.result.logo) setLogoUrl(data.result.logo);
          setStoreData({
            phone: data.result.phone || STORE_CONFIG.phone || '6281332345448, 6281235907956',
            address: data.result.address || STORE_CONFIG.address,
            email: data.result.email || STORE_CONFIG.email || 'dwisulistya22@gmail.com',
            maps: data.result.maps || '',
            shopee: fixShopeeUrl(data.result.shopee || STORE_CONFIG.shopee || 'https://id.sh.ee/PEdSUDy6')
          });
        }
      } catch (err) {
        console.error(err);
      }
    }
    fetchFooterData();
  }, []);

  const displayLogo = props.logo || logoUrl;
  const phones = (storeData.phone || '6281332345448, 6281235907956')
    .split(/[/,&\n]/)
    .map((p: string) => p.trim())
    .filter(Boolean);
  const shopeeLink = fixShopeeUrl(storeData.shopee || STORE_CONFIG.shopee || 'https://id.sh.ee/PEdSUDy6');
  const activeEmail = storeData.email || STORE_CONFIG.email || 'dwisulistya22@gmail.com';
  const mapsUrl =
    storeData.maps && storeData.maps.length > 5
      ? storeData.maps
      : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(storeData.address || STORE_CONFIG.address)}`;

  return (
    <footer className="bg-gray-900 text-gray-300 pt-16 pb-12 border-t border-gray-800" id="tentang">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 mb-12">
          <div>
            <div className="flex items-center gap-3 mb-4">
              {displayLogo && !imageError ? (
                <img
                  src={displayLogo}
                  alt="Logo"
                  className="h-12 w-auto object-contain"
                  onError={() => setImageError(true)}
                />
              ) : (
                <div className="flex items-center gap-2">
                  <div className="bg-red-600 text-white font-black px-3 py-1 rounded-lg text-base">FS</div>
                  <span className="text-xl font-black text-white">
                    SURABAYA <span className="text-red-600">FITNESS</span>
                  </span>
                </div>
              )}
            </div>
            <p className="text-gray-400 text-sm leading-relaxed mb-4">
              Pusat penyedia alat fitness terlengkap dan terpercaya di Surabaya. Solusi tepat untuk gaya hidup sehat Anda dengan peralatan berkualitas tinggi.
            </p>
            <a
              href={shopeeLink}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-[#EE4D2D] hover:bg-[#d73211] text-white px-4 py-2 rounded-lg text-sm font-bold"
            >
              🧡 Shopee Official
            </a>
          </div>

          <div>
            <h3 className="text-white font-bold text-base mb-4">Tautan Cepat</h3>
            <ul className="space-y-2.5 text-sm text-gray-400">
              <li><a href="#beranda" className="hover:text-red-500">Beranda</a></li>
              <li><a href="#products" className="hover:text-red-500">Semua Produk</a></li>
              <li><a href="#categories" className="hover:text-red-500">Kategori</a></li>
            </ul>
          </div>

          <div>
            <h3 className="text-white font-bold text-base mb-4">Layanan Pelanggan</h3>
            <ul className="space-y-2.5 text-sm text-gray-400">
              <li>Garansi Resmi 1-3 Tahun</li>
              <li>Pengiriman & Pemasangan Onsite</li>
              <li>Layanan Pembayaran COD</li>
            </ul>
          </div>

          <div>
            <h3 className="text-white font-bold text-base mb-4">Hubungi Kami</h3>
            <ul className="space-y-3 text-sm text-gray-400">
              <li>
                <a
                  href={mapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-start gap-3 hover:text-red-500 transition-colors"
                >
                  <MapPin size={18} className="text-red-600 shrink-0 mt-1" />
                  <span>
                    {storeData.address}
                    <span className="block text-xs text-red-500 font-bold mt-1">📍 Buka di Google Maps →</span>
                  </span>
                </a>
              </li>
              <li className="flex items-start gap-3">
                <Phone size={18} className="text-red-600 shrink-0 mt-1" />
                <div className="space-y-1">
                  {phones.map((p: string, idx: number) => (
                    <a
                      key={idx}
                      href={`https://wa.me/${p.replace(/\D/g, '')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block hover:text-red-500 font-semibold text-white"
                    >
                      Admin {idx + 1}: +{p}
                    </a>
                  ))}
                </div>
              </li>
              <li>
                <a
                  href={`mailto:${activeEmail}?subject=${encodeURIComponent('Tanya Produk Surabaya Fitness')}`}
                  className="flex items-center gap-3 hover:text-red-500 transition-colors"
                >
                  <Mail size={18} className="text-red-600 shrink-0" />
                  <span>{activeEmail}</span>
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 pt-8 flex flex-col sm:flex-row justify-between items-center gap-4 text-xs text-gray-500">
          <p>© 2024 TOKO FITNESS SURABAYA. All rights reserved.</p>
          <button
            onClick={props.onLogin}
            className="text-gray-500 hover:text-gray-300 font-bold tracking-wider uppercase transition-colors"
          >
            SUPER ADMIN LOGIN
          </button>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
