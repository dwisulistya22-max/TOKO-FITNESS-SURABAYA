import { useState, useEffect } from 'react';
import { MessageCircle, X, UserCheck } from 'lucide-react';
import { STORE_CONFIG } from '../data/config';

// Sanity Config
const SANITY_PROJECT_ID = 'qi4rocc0';
const SANITY_DATASET = 'production';
const SANITY_URL = `https://${SANITY_PROJECT_ID}.api.sanity.io/v2024-01-01/data/query/${SANITY_DATASET}?query=`;

// Fungsi Pembersih Nomor HP (Mengubah 08xx menjadi 628xx)
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
  const [admin1, setAdmin1] = useState<string>('6281332345448');
  const [admin2, setAdmin2] = useState<string | null>('6281234567890');

  useEffect(() => {
    const fetchPhoneFromSanity = async () => {
      try {
        const query = encodeURIComponent(`*[_type in ["storeConfig", "storeInfo", "settings"]][0]{
          "phone": coalesce(phone, whatsapp, phone1, "")
        }`);

        const response = await fetch(`${SANITY_URL}${query}`, { cache: 'no-store' });
        const data = await response.json();

        const rawPhone = data?.result?.phone || STORE_CONFIG.phone || '081332345448 / 081234567890';

        // OTOMATIS MEMISAHKAN 2 NOMOR (Bisa dipisah tanda / , & atau enter)
        const parts = rawPhone.split(/[/,&\n]/).map((p: string) => p.trim()).filter(Boolean);

        if (parts.length >= 2) {
          setAdmin1(formatWaNumber(parts[0]));
          setAdmin2(formatWaNumber(parts[1]));
        } else if (parts.length === 1) {
          setAdmin1(formatWaNumber(parts[0]));
          setAdmin2(null); // Jika cuma 1 nomor di Sanity, Admin 2 sembunyi
        }
      } catch (err) {
        console.error('Error fetching phone from Sanity:', err);
      }
    };

    fetchPhoneFromSanity();
  }, []);

  return (
    <div className="fixed bottom-6 right-6 z-[999]">
      
      {/* POP-UP PILIHAN ADMIN */}
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
                <div className="font-bold text-xs text-gray-900">Admin 
