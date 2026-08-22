import { useState } from 'react';
import { MessageCircle, X, UserCheck } from 'lucide-react';
import { STORE_CONFIG } from '../data/config';

const WhatsAppButton = () => {
  const [isOpen, setIsOpen] = useState(false);

  const admin1 = STORE_CONFIG.phone || '6281332345448';
  const admin2 = (STORE_CONFIG as any).phone2 || '6281234567890';

  return (
    <div className="fixed bottom-6 right-6 z-[999]">
      
      {/* POP-UP PILIHAN ADMIN (MUNCUL SAAT TOMBOL DIKLIK) */}
      {isOpen && (
        <div className="mb-4 bg-white rounded-2xl shadow-2xl p-5 border border-gray-100 w-72 animate-in fade-in slide-in-from-bottom-5 duration-300">
          <div className="flex items-center justify-between border-b border-gray-100 pb-3 mb-3">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-green-500 animate-pulse" />
              <span className="font-bold text-gray-900 text-sm">Customer Service WA</span>
            </div>
            <button 
              onClick={() => setIsOpen(false)}
              className="text-gray-400 hover:text-gray-600 rounded-full p-1 transition-colors"
            >
              <X size={18} />
            </button>
          </div>

          <p className="text-xs text-gray-500 mb-4">
            Silakan pilih Admin WhatsApp untuk respon cepat:
          </p>

          <div className="space-y-2.5">
            {/* TOMBOL ADMIN 1 */}
            <a
              href={`https://wa.me/${admin1}?text=Halo%20Admin%201%20Surabaya%20Fitness,%20saya%20mau%20tanya%20produk`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 bg-green-50 hover:bg-green-100 border border-green-200 text-green-800 p-3 rounded-xl transition-all group"
            >
              <div className="bg-green-500 text-white p-2 rounded-lg group-hover:scale-110 transition-transform">
                <UserCheck size={18} />
              </div>
              <div>
                <div className="font-bold text-xs text-gray-900">Admin 1 (Penjualan)</div>
                <div className="text-[11px] text-green-700">Online • Konsultasi Produk</div>
              </div>
            </a>

            {/* TOMBOL ADMIN 2 */}
            <a
              href={`https://wa.me/${admin2}?text=Halo%20Admin%202%20Surabaya%20Fitness,%20saya%20mau%20tanya%20produk`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 bg-green-50 hover:bg-green-100 border border-green-200 text-green-800 p-3 rounded-xl transition-all group"
            >
              <div className="bg-green-600 text-white p-2 rounded-lg group-hover:scale-110 transition-transform">
                <UserCheck size={18} />
              </div>
              <div>
                <div className="font-bold text-xs text-gray-900">Admin 2 (Info Stok & Ongkir)</div>
                <div className="text-[11px] text-green-700">Online • Layanan Cepat</div>
              </div>
            </a>
          </div>
        </div>
      )}

      {/* TOMBOL HIJAU MELAYANG */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="bg-green-500 hover:bg-green-600 text-white w-14 h-14 rounded-full flex items-center justify-center shadow-2xl hover:scale-110 transition-all cursor-pointer relative"
        title="Hubungi Admin WhatsApp"
      >
        <MessageCircle size={30} />
        <span className="absolute -top-1 -right-1 bg-red-600 text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center border-2 border-white">
          2
        </span>
      </button>

    </div>
  );
};

export default WhatsAppButton;
