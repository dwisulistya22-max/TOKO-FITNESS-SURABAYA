import { useState, useEffect } from 'react';
import { MapPin, Phone, Mail } from 'lucide-react';

// PRIORITAS PROJECT ID SESUAI SCREENSHOT ANDA
const SANITY_PROJECT_ID = 'qi4rocc0'; 
const SANITY_DATASET = 'production';
const SANITY_URL = `https://${SANITY_PROJECT_ID}.api.sanity.io/v2024-01-01/data/query/${SANITY_DATASET}?query=`;

export interface FooterProps {
  isAdmin?: boolean;
  logo?: string;
  onLogin?: () => void;
}

const Footer = (props: FooterProps) => {
  const [storeData, setStoreData] = useState<any>({
    phone: '6281235907956, 6281332345448', // Data sementara selagi loading
    address: 'Jl. Kuwukan Gg. 2 No.22, Lontar, Surabaya',
    email: 'dwisulistya22@gmail.com',
    logo: ''
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
          setStoreData(data.result);
        }
      } catch (err) {
        console.error('Fetch Error:', err);
      }
    };
    fetchFooterData();
  }, []);

  // Memecah nomor telepon berdasarkan koma atau garis miring
  const phones = storeData.phone ? storeData.phone.split(/[/,&\n]/).map((p: string) => p.trim()).filter(Boolean) : [];

  return (
    <footer className="bg-[#111827] text-gray-400 pt-16 pb-12 border-t border-gray-800" id="tentang">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 mb-12">
          
          <div>
            <div className="flex items-center gap-2 mb-4">
              {storeData.logo ? (
                <img src={storeData.logo} alt="Logo" className="h-10 w-auto" />
              ) : (
                <span className="text-xl font-black text-white">FS <span className="text-red-600">FITNESS</span></span>
              )}
            </div>
            <p className="text-sm leading-relaxed">
              Pusat penyedia alat fitness terlengkap dan terpercaya di Surabaya. Solusi tepat untuk gaya hidup sehat Anda.
            </p>
          </div>

          <div>
            <h3 className="text-white font-bold mb-4">Tautan Cepat</h3>
            <ul className="space-y-2 text-sm">
              <li><a href="#beranda" className="hover:text-red-500">Beranda</a></li>
              <li><a href="#products" className="hover:text-red-500">Semua Produk</a></li>
              <li><a href="#categories" className="hover:text-red-500">Kategori</a></li>
            </ul>
          </div>

          <div>
            <h3 className="text-white font-bold mb-4">Layanan</h3>
            <ul className="space-y-2 text-sm">
              <li>Garansi Resmi 1-3 Tahun</li>
              <li>Pengiriman & Pasang Onsite</li>
              <li>Layanan COD Surabaya</li>
            </ul>
          </div>

          <div>
            <h3 className="text-white font-bold mb-4">Hubungi Kami</h3>
            <ul className="space-y-3 text-sm">
              <li className="flex items-start gap-3">
                <MapPin size={18} className="text-red-600 shrink-0 mt-1" />
                <span>{storeData.address}</span>
              </li>
              <li className="flex items-start gap-3">
                <Phone size={18} className="text-red-600 shrink-0 mt-1" />
                <div className="flex flex-col gap-1">
                  {phones.map((p: string, idx: number) => (
                    <a key={idx} href={`https://wa.me/${p.replace(/\D/g, '')}`} target="_blank" className="text-white font-bold hover:text-red-500">
                      Admin {idx + 1}: +{p}
                    </a>
                  ))}
                </div>
              </li>
              <li className="flex items-center gap-3">
                <Mail size={18} className="text-red-600" />
                <span>{storeData.email}</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 pt-8 flex justify-between items-center text-xs">
          <p>© 2024 TOKO FITNESS SURABAYA.</p>
          <button onClick={props.onLogin} className="hover:text-white uppercase font-bold">Admin Login</button>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
