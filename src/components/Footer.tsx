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

const Footer = (props: FooterProps) => {
  const [logoUrl, setLogoUrl] = useState<string>('');
  const [imageError, setImageError] = useState<boolean>(false);
  const [storeData, setStoreData] = useState<any>({
    phone: STORE_CONFIG.phone,
    address: STORE_CONFIG.address,
    email: STORE_CONFIG.email
  });

  useEffect(() => {
    const fetchFooterData = async () => {
      try {
        const query = encodeURIComponent(`*[_type in ["storeConfig", "storeInfo", "settings"]][0]{
          "logo": logo.asset->url,
          "phone": coalesce(phone, whatsapp, ""),
          "address": coalesce(address, ""),
          "email": coalesce(email, "")
        }`);

        const response = await fetch(`${SANITY_URL}${query}`, { cache: 'no-store' });
        const data = await response.json();

        if (data?.result) {
          if (data.result.logo) setLogoUrl(data.result.logo);
          setStoreData({
            phone: data.result.phone || STORE_CONFIG.phone,
            address: data.result.address || STORE_CONFIG.address,
            email: data.result.email || STORE_CONFIG.email
          });
        }
      } catch (err) {
        console.error('Error fetching footer data:', err);
      }
    };

    fetchFooterData();
  }, []);

  const safePhone = storeData?.phone || STORE_CONFIG.phone || '6281235907956, 6281332345448';
  const phones = safePhone.split(/[/,&\n]/).map((p: string) => p.trim()).filter(Boolean);

  return (
    <footer className="bg-gray-900 text-gray-300 pt-16 pb-12 border-t border-gray-800" id="tentang">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 mb-12">
          
          {/* LOGO & DESKRIPSI */}
          <div>
            <div className="flex items-center gap-3 mb-4">
              {logoUrl && !imageError ? (
                <img 
                  src={logoUrl} 
                  alt="Logo" 
                  className="h-12 w-auto object-contain" 
                  onError={() => setImageError(true)}
                />
              ) : (
                <div className="flex items-center gap-2">
                  <div className="bg-red-600 text-white font-black px-3 py-1 rounded-lg text-base">
                    FS
                  </div>
                  <span className="text-xl font-black text-white">
                    SURABAYA <span className="text-red-600">FITNESS</span>
                  </span>
                </div>
              )}
            </div>
            <p className="text-gray-400 text-sm leading-relaxed mb-6">
              Pusat penyedia alat fitness terlengkap dan terpercaya di Surabaya. Solusi tepat untuk gaya hidup sehat Anda dengan peralatan berkualitas tinggi.
            </p>
          </div>

          {/* TAUTAN CEPAT */}
          <div>
            <h3 className="text-white font-bold text-base mb-4">Tautan Cepat</h3>
            <ul className="space-y-2.5 text-sm text-gray-400">
              <li><a href="#beranda" className="hover:text-red-500 transition-colors">Beranda</a></li>
              <li><a href="#products" className="hover:text-red-500 transition-colors">Semua Produk</a></li>
              <li><a href="#categories" className="hover:text-red-500 transition-colors">Kategori</a></li>
            </ul>
          </div>

          {/* LAYANAN PELANGGAN */}
          <div>
            <h3 className="text-white font-bold text-base mb-4">Layanan Pelanggan</h3>
            <ul className="space-y-2.5 text-sm text-gray-400">
              <li><span>Garansi Resmi 1-3 Tahun</span></li>
              <li><span>Pengiriman & Pemasangan Onsite</span></li>
              <li><span>Layanan Pembayaran COD</span></li>
            </ul>
          </div>

          {/* HUBUNGI KAMI */}
          <div>
            <h3 className="text-white font-bold text-base mb-4">Hubungi Kami</h3>
            <ul className="space-y-3 text-sm text-gray-400">
              <li className="flex items-start gap-3">
                <MapPin size={18} className="text-red-600 shrink-0 mt-1" />
                <span>{storeData.address}</span>
              </li>

              {/* TAMPILKAN DUA NOMOR WA */}
              <li className="flex items-start gap-3">
                <Phone size={18} className="text-red-600 shrink-0 mt-1" />
                <div className="space-y-1">
                  {phones.map((p: string, idx: number) => (
                    <a
                      key={idx}
                      href={`https://wa.me/${p.replace(/\D/g, '')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block hover:text-red-500 transition-colors font-semibold text-white"
                    >
                      Admin {idx + 1}: +{p}
                    </a>
                  ))}
                </div>
              </li>

              <li className="flex items-center gap-3">
                <Mail size={18} className="text-red-600 shrink-0" />
                <span>{storeData.email}</span>
              </li>
            </ul>
          </div>

        </div>

        {/* FOOTER BOTTOM */}
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
