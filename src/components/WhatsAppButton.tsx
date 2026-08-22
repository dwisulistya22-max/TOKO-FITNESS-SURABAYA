import { useState, useEffect } from 'react';
import { MessageCircle, X, UserCheck } from 'lucide-react';
import { STORE_CONFIG } from '../data/config';

const PROJECT_IDS = ['qi4rocc0', '856jrik3'];
const DATASET = 'production';

const clean = (num: string) => {
  let n = (num || '').replace(/\D/g, '');
  if (n.startsWith('0')) n = '62' + n.slice(1);
  return n;
};

const WhatsAppButton = () => {
  const [open, setOpen] = useState(false);
  const [admins, setAdmins] = useState<string[]>(
    (STORE_CONFIG.phone || '')
      .split(/[/,&|\n]+/)
      .map((p) => clean(p.trim()))
      .filter(Boolean)
  );

  useEffect(() => {
    const load = async () => {
      const query = encodeURIComponent(
        `*[_type in ["storeConfig","storeInfo","settings"]][0]{"phone": coalesce(phone, whatsapp, "")}`
      );

      for (const id of PROJECT_IDS) {
        try {
          const url = `https://${id}.api.sanity.io/v2024-01-01/data/query/${DATASET}?query=${query}`;
          const res = await fetch(url, { cache: 'no-store' });
          const json = await res.json();
          const raw = json?.result?.phone;
          if (raw && String(raw).trim()) {
            const list = String(raw)
              .split(/[/,&|\n]+/)
              .map((p) => clean(p.trim()))
              .filter(Boolean);
            if (list.length) {
              setAdmins(list);
              return; // pakai data Sanity pertama yang ketemu
            }
          }
        } catch {
          /* coba project berikutnya */
        }
      }
    };
    load();
  }, []);

  return (
    <div className="fixed bottom-6 right-6 z-[999]">
      {open && (
        <div className="mb-4 bg-white rounded-2xl shadow-2xl p-5 border w-72">
          <div className="flex justify-between items-center border-b pb-3 mb-3">
            <span className="font-bold text-sm text-gray-900">Pilih Admin WhatsApp</span>
            <button type="button" onClick={() => setOpen(false)}>
              <X size={18} className="text-gray-400" />
            </button>
          </div>
          <div className="space-y-2">
            {admins.map((num, i) => (
              <a
                key={`${num}-${i}`}
                href={`https://wa.me/${num}?text=${encodeURIComponent(
                  `Halo Admin ${i + 1} Surabaya Fitness, saya mau tanya produk`
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 bg-green-50 hover:bg-green-100 p-3 rounded-xl"
              >
                <div className="bg-green-500 text-white p-2 rounded-lg">
                  <UserCheck size={18} />
                </div>
                <div>
                  <div className="font-bold text-xs text-gray-900">Admin {i + 1}</div>
                  <div className="text-[11px] text-green-700">+{num}</div>
                </div>
              </a>
            ))}
          </div>
        </div>
      )}

      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="bg-green-500 hover:bg-green-600 text-white w-14 h-14 rounded-full flex items-center justify-center shadow-2xl relative"
      >
        <MessageCircle size={30} />
        {admins.length > 1 && (
          <span className="absolute -top-1 -right-1 bg-red-600 text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center border-2 border-white">
            {admins.length}
          </span>
        )}
      </button>
    </div>
  );
};

export default WhatsAppButton;
