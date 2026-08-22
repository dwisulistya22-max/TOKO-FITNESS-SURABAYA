import { useState, useEffect } from 'react';
import { MessageCircle, X, UserCheck } from 'lucide-react';
import { STORE_CONFIG } from '../data/config';

const SANITY_PROJECT_ID = 'qi4rocc0';
const SANITY_DATASET = 'production';
const SANITY_URL = `https://${SANITY_PROJECT_ID}.api.sanity.io/v2024-01-01/data/query/${SANITY_DATASET}?query=`;

const formatWaNumber = (num: string) => {
  if (!num) return '';
  let cleaned = num.replace(/\D/g, '');
  if (cleaned.startsWith('0')) {
    cleaned = '62' + cleaned.substring(1);
  }
  return cleaned;
};

const WhatsAppButton = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [admin1, setAdmin1] = useState<string>('6281332345448'); // ADMIN 1 DITUKAR
  const [admin2, setAdmin2] = useState<string | null>('6281235907956'); // ADMIN 2 DITUKAR

  useEffect(() => {
    const fetchPhoneFromSanity = async () => {
      try {
        const query = encodeURIComponent(`*[_type in ["storeConfig", "storeInfo", "settings"]][0]{
          "phone": coalesce(phone, whatsapp, phone1, "")
        }`);

        const response = await fetch(`${SANITY_URL}${query}`, { cache: 'no-store' });
        const data = await response.json();

        const rawPhone = data?.result?.phone;
        if (rawPhone) {
          const parts = rawPhone.split(/[/,&\n]/).map((p: string) => p.trim()).filter(Boolean);

          if (parts.length >= 2) {
            setAdmin1(formatWaNumber(parts[0]));
            setAdmin2(formatWaNumber(parts[1]));
          } else if (parts.length === 1) {
            setAdmin1(formatWaNumber(parts[0]));
            setAdmin2(null);
          }
        }
      } catch (err) {
        console.error('Error fetching phone from Sanity:', err);
      }
    };

    fetchPhoneFromSanity();
  }, []);

  return (
    <div className="fixed bottom-6 right-6 z-[999]">
      {isOpen && (
        <div className="mb-4 bg-white rounded-2xl shadow-2xl p-5 border border-gray-100 w-72 animate-in fade-in duration-300">
          <div className="flex items-center justify-between border-b border-gray-100 pb-3 mb-3">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-green-500 animate-pulse" />
              <span className="font-bold text-gray-900 text-sm">Customer Service WA</span>
            </div>
            <button onClick={() => setIsOpen(false)} className="text-gray-400 hover:text-gray-600 rounded-full p-1">
              <X size={18} />
            </button>
          </div>

          <p className="text-xs text-gray-500 mb-4">Silakan pilih Admin untuk respon cepat:</p>

          <div className="space-y-2.5">
            <a
              href={`https://wa.me/${admin1}?text=Halo%20Admin%201%20Surabaya%20Fitness,%20saya%20mau%20tanya%20produk`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 bg-green-50 hover:bg-green-100 border border-green-200 text-green-800 p-3 rounded-xl transition-all group"
            >
              <div className="bg-green-500 text-white p-2 rounded-lg">
                <UserCheck size={18} />
              </div>
              <div>
                <div className="font-bold text-xs text-gray-900">Admin 1 (Penjualan)</div>
                <div className="text-[11px] text-green-700">Online • Konsultasi Produk</div>
              </div>
            </a>

            {admin2 && (
              <a
                href={`https://wa.me/${admin2}?text=Halo%20Admin%202%20Surabaya%20Fitness,%20saya%20mau%20tanya%20produk`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 bg-green-50 hover:bg-green-100 border border-green-200 text-green-800 p-3 rounded-xl transition-all group"
              >
                <div className="bg-green-600 text-white p-2 rounded-lg">
                  <UserCheck size={18} />
                </div>
                <div>
                  <div className="font-bold text-xs text-gray-900">Admin 2 (Info Stok & Ongkir)</div>
                  <div className="text-[11px] text-green-700">Online • Layanan Cepat</div>
                </div>
              </a>
            )}
          </div>
        </div>
      )}

      <button
        onClick={() => setIsOpen(!isOpen)}
        className="bg-green-500 hover:bg-green-600 text-white w-14 h-14 rounded-full flex items-center justify-center shadow-2xl hover:scale-110 transition-all cursor-pointer relative"
      >
        <MessageCircle size={30} />
        {admin2 && (
          <span className="absolute -top-1 -right-1 bg-red-600 text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center border-2 border-white">
            2
          </span>
        )}
      </button>
    </div>
  );
};

export default WhatsAppButton;
