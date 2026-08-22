import { useState, useEffect } from 'react';
import { MessageCircle, X, UserCheck } from 'lucide-react';

const SANITY_PROJECT_ID = 'qi4rocc0';
const SANITY_DATASET = 'production';
const SANITY_URL = `https://${SANITY_PROJECT_ID}.api.sanity.io/v2024-01-01/data/query/${SANITY_DATASET}?query=`;

const formatWa = (num: string) => {
  let cleaned = num.replace(/\D/g, '');
  return cleaned.startsWith('0') ? '62' + cleaned.substring(1) : cleaned;
};

const WhatsAppButton = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [admins, setAdmins] = useState<string[]>(['6281235907956', '6281332345448']);

  useEffect(() => {
    const fetchWA = async () => {
      try {
        const query = encodeURIComponent(`*[_type in ["storeConfig", "storeInfo"]][0]{phone}`);
        const res = await fetch(`${SANITY_URL}${query}`, { cache: 'no-store' });
        const data = await res.json();
        if (data?.result?.phone) {
          const parts = data.result.phone.split(/[/,&\n]/).map((p: string) => p.trim()).filter(Boolean);
          setAdmins(parts);
        }
      } catch (e) { console.error(e); }
    };
    fetchWA();
  }, []);

  return (
    <div className="fixed bottom-6 right-6 z-[999]">
      {isOpen && (
        <div className="mb-4 bg-white rounded-2xl shadow-2xl p-5 border border-gray-100 w-72">
          <div className="flex justify-between items-center border-b pb-3 mb-3">
            <span className="font-bold text-sm text-gray-900">Pilih Admin WhatsApp</span>
            <button onClick={() => setIsOpen(false)}><X size={18} className="text-gray-400" /></button>
          </div>
          <div className="space-y-2">
            {admins.map((num, i) => (
              <a key={i} href={`https://wa.me/${formatWa(num)}`} target="_blank" className="flex items-center gap-3 bg-green-50 hover:bg-green-100 p-3 rounded-xl transition-all">
                <div className="bg-green-500 text-white p-2 rounded-lg"><UserCheck size={18} /></div>
                <div>
                  <div className="font-bold text-xs">Admin {i + 1}</div>
                  <div className="text-[10px] text-green-700">Online Sekarang</div>
                </div>
              </a>
            ))}
          </div>
        </div>
      )}
      <button onClick={() => setIsOpen(!isOpen)} className="bg-green-500 text-white w-14 h-14 rounded-full flex items-center justify-center shadow-2xl relative">
        <MessageCircle size={30} />
        {admins.length > 1 && <span className="absolute -top-1 -right-1 bg-red-600 text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center border-2 border-white">{admins.length}</span>}
      </button>
    </div>
  );
};

export default WhatsAppButton;
