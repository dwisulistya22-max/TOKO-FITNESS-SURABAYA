import { MessageCircle } from 'lucide-react';

import { STORE_CONFIG } from '../data/config';

const WhatsAppButton = () => {
  return (
    <a 
      href={`https://wa.me/${STORE_CONFIG.phone}`} 
      target="_blank" 
      rel="noopener noreferrer"
      className="fixed bottom-6 right-6 z-[60] bg-green-500 text-white p-4 rounded-full shadow-2xl hover:bg-green-600 transition-all hover:scale-110 flex items-center group"
    >
      <MessageCircle size={28} />
      <span className="max-w-0 overflow-hidden group-hover:max-w-xs group-hover:ml-2 transition-all duration-300 font-medium whitespace-nowrap">
        Tanya CS {STORE_CONFIG.name}
      </span>
    </a>
  );
};

export default WhatsAppButton;
