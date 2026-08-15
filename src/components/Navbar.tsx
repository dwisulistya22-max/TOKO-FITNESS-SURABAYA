import { ShoppingCart, Menu, X, Search, Phone, Image as ImageIcon } from 'lucide-react';
import { STORE_CONFIG } from '../data/config';

interface NavbarProps {
  isAdmin: boolean;
  logo: string;
  onLogoChange: (newLogo: string) => void;
}

const Navbar = ({ isAdmin, logo, onLogoChange }: NavbarProps) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleLogoFileSelect = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        if (file.size > 2 * 1024 * 1024) {
          alert('Ukuran file terlalu besar! Maksimal 2MB.');
          return;
        }
        const reader = new FileReader();
        reader.onloadend = () => {
          onLogoChange(reader.result as string);
        };
        reader.readAsDataURL(file);
      }
    };
    input.click();
  };

  return (
    <nav className="fixed w-full z-50 bg-white/90 backdrop-blur-md border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-20 items-center">
          <div className="flex-shrink-0 flex items-center py-2 relative group">
            <a href="#" className="block" aria-label={STORE_CONFIG.name}>
              <img
                src={logo}
                alt="Logo Toko"
                className="h-14 md:h-20 w-auto min-w-[120px] object-contain block"
                style={{ display: 'block', minHeight: '50px' }}
              />
            </a>
            {isAdmin && (
              <button 
                onClick={handleLogoFileSelect}
                className="absolute -bottom-2 left-0 bg-red-600 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
                title="Ganti Logo"
              >
                <ImageIcon size={14} />
              </button>
            )}
          </div>

          <div className="hidden md:flex items-center space-x-8">
            <a href="#" className="text-gray-700 hover:text-red-600 font-medium transition-colors">Beranda</a>
            <a href="#products" className="text-gray-700 hover:text-red-600 font-medium transition-colors">Produk</a>
            <a href="#categories" className="text-gray-700 hover:text-red-600 font-medium transition-colors">Kategori</a>
            <a href="#about" className="text-gray-700 hover:text-red-600 font-medium transition-colors">Tentang Kami</a>
          </div>

          <div className="hidden md:flex items-center space-x-5">
            <button className="p-2 text-gray-500 hover:text-red-600 transition-colors">
              <Search size={22} />
            </button>
            <div className="relative p-2 text-gray-500 hover:text-red-600 transition-colors cursor-pointer">
              <ShoppingCart size={22} />
              <span className="absolute top-0 right-0 bg-red-600 text-white text-[10px] rounded-full h-4 w-4 flex items-center justify-center">0</span>
            </div>
            <a href={`https://wa.me/${STORE_CONFIG.phone}`} className="bg-red-600 text-white px-5 py-2.5 rounded-full font-medium flex items-center space-x-2 hover:bg-red-700 transition-all shadow-lg shadow-red-200">
              <Phone size={18} />
              <span>Hubungi Kami</span>
            </a>
          </div>

          <div className="md:hidden flex items-center space-x-4">
             <div className="relative p-2 text-gray-500">
              <ShoppingCart size={22} />
              <span className="absolute top-0 right-0 bg-red-600 text-white text-[10px] rounded-full h-4 w-4 flex items-center justify-center">0</span>
            </div>
            <button onClick={() => setIsOpen(!isOpen)} className="text-gray-700">
              {isOpen ? <X size={28} /> : <Menu size={28} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isOpen && (
        <div className="md:hidden bg-white border-t border-gray-100 animate-in slide-in-from-top duration-300">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            <a href="#" className="block px-3 py-4 text-base font-medium text-gray-700 hover:bg-gray-50 border-b border-gray-50">Beranda</a>
            <a href="#products" className="block px-3 py-4 text-base font-medium text-gray-700 hover:bg-gray-50 border-b border-gray-50">Produk</a>
            <a href="#categories" className="block px-3 py-4 text-base font-medium text-gray-700 hover:bg-gray-50 border-b border-gray-50">Kategori</a>
            <a href="#about" className="block px-3 py-4 text-base font-medium text-gray-700 hover:bg-gray-50 border-b border-gray-50">Tentang Kami</a>
            <div className="pt-4 px-3">
               <a href={`https://wa.me/${STORE_CONFIG.phone}`} className="w-full bg-red-600 text-white px-5 py-3 rounded-xl font-medium flex items-center justify-center space-x-2">
                <Phone size={18} />
                <span>Konsultasi Gratis</span>
              </a>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
import { useState } from 'react';
