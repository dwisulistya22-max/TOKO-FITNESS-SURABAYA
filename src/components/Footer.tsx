import { useState, useEffect } from 'react';
import { Camera, Video, Globe, MapPin, Phone, Mail } from 'lucide-react';
import { STORE_CONFIG } from '../data/config';

interface FooterProps {
  isAdmin?: boolean;
  logo: string;
  onLogin?: () => void;
}

const Footer = ({ isAdmin, logo, onLogin }: FooterProps) => {
  const [contact, setContact] = useState({
    address: STORE_CONFIG.address,
    phone: STORE_CONFIG.phone,
    email: STORE_CONFIG.email
  });

  useEffect(() => {
    const saved = localStorage.getItem('fitness_contact');
    if (saved) {
      setContact(JSON.parse(saved));
    }
  }, []);

  const handleChange = (field: keyof typeof contact, value: string) => {
    const updated = { ...contact, [field]: value };
    setContact(updated);
    localStorage.setItem('fitness_contact', JSON.stringify(updated));
  };

  return (
    <footer className="bg-white border-t border-gray-100 pt-20 pb-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
          <div>
            <div className="mb-6">
              <img
                src={logo}
                alt={STORE_CONFIG.name}
                className="h-24 md:h-32 w-auto block object-contain"
                style={{ minWidth: '150px' }}
              />
            </div>
            <p className="text-gray-500 mb-6 leading-relaxed">
              Pusat penyedia alat fitness terlengkap dan terpercaya di Surabaya. Solusi tepat untuk gaya hidup sehat Anda dengan peralatan berkualitas tinggi.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 hover:bg-red-600 hover:text-white transition-all">
                <Camera size={20} />
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 hover:bg-red-600 hover:text-white transition-all">
                <Globe size={20} />
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 hover:bg-red-600 hover:text-white transition-all">
                <Video size={20} />
              </a>
            </div>
          </div>

          <div>
            <h4 className="font-bold text-gray-900 mb-6">Tautan Cepat</h4>
            <ul className="space-y-4">
              <li><a href="#" className="text-gray-500 hover:text-red-600 transition-colors">Beranda</a></li>
              <li><a href="#products" className="text-gray-500 hover:text-red-600 transition-colors">Semua Produk</a></li>
              <li><a href="#categories" className="text-gray-500 hover:text-red-600 transition-colors">Kategori</a></li>
              <li><a href="#" className="text-gray-500 hover:text-red-600 transition-colors">Promo Terbaru</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-gray-900 mb-6">Layanan Pelanggan</h4>
            <ul className="space-y-4">
              <li><a href="#" className="text-gray-500 hover:text-red-600 transition-colors">Cara Pemesanan</a></li>
              <li><a href="#" className="text-gray-500 hover:text-red-600 transition-colors">Informasi Garansi</a></li>
              <li><a href="#" className="text-gray-500 hover:text-red-600 transition-colors">Kebijakan Pengiriman</a></li>
              <li><a href="#" className="text-gray-500 hover:text-red-600 transition-colors">FAQ</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-gray-900 mb-6">Hubungi Kami</h4>
            <ul className="space-y-4">
              <li className="flex items-start space-x-3 text-gray-500">
                <MapPin className="text-red-600 flex-shrink-0 mt-1" size={18} />
                {isAdmin ? (
                  <textarea 
                    value={contact.address}
                    onChange={(e) => handleChange('address', e.target.value)}
                    className="w-full text-sm bg-red-50 border border-red-100 rounded p-1 outline-none focus:border-red-500"
                    rows={3}
                  />
                ) : (
                  <span className="text-sm">{contact.address}</span>
                )}
              </li>
              <li className="flex items-center space-x-3 text-gray-500">
                <Phone className="text-red-600 flex-shrink-0" size={18} />
                {isAdmin ? (
                  <input 
                    type="text"
                    value={contact.phone}
                    onChange={(e) => handleChange('phone', e.target.value)}
                    className="w-full text-sm bg-red-50 border border-red-100 rounded p-1 outline-none focus:border-red-500"
                  />
                ) : (
                  <span className="text-sm">{contact.phone}</span>
                )}
              </li>
              <li className="flex items-center space-x-3 text-gray-500">
                <Mail className="text-red-600 flex-shrink-0" size={18} />
                {isAdmin ? (
                  <input 
                    type="text"
                    value={contact.email}
                    onChange={(e) => handleChange('email', e.target.value)}
                    className="w-full text-sm bg-red-50 border border-red-100 rounded p-1 outline-none focus:border-red-500"
                  />
                ) : (
                  <span className="text-sm">{contact.email}</span>
                )}
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-gray-100 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-gray-500 text-sm">
            © 2024 {STORE_CONFIG.name}. All rights reserved.
          </p>
          <div className="flex items-center space-x-6 text-sm text-gray-400">
            <button 
              onClick={onLogin}
              className="hover:text-red-600 transition-colors cursor-pointer text-xs uppercase tracking-widest font-bold"
            >
              {isAdmin ? 'Logout Admin' : 'Super Admin Login'}
            </button>
            <a href="#" className="hover:text-gray-600">Privacy Policy</a>
            <a href="#" className="hover:text-gray-600">Terms of Service</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
