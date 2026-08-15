import { ArrowRight, CheckCircle2, Image as ImageIcon } from 'lucide-react';
import { motion } from 'framer-motion';
import { STORE_CONFIG } from '../data/config';

interface HeroProps {
  isAdmin: boolean;
  logo: string;
  onLogoChange: (newLogo: string) => void;
}

const Hero = ({ isAdmin, logo, onLogoChange }: HeroProps) => {
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
    <div className="relative min-h-screen flex items-center pt-16">
      <div className="absolute inset-0 z-0 overflow-hidden">
        <img 
          src={STORE_CONFIG.hero.image} 
          alt="Modern Gym" 
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/50 to-transparent"></div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 w-full">
        <div className="max-w-2xl text-white">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="relative inline-block group"
          >
            <img
              src={logo}
              alt="Logo Besar"
              className="mb-8 h-48 md:h-80 w-auto block object-contain mx-auto md:mx-0 drop-shadow-2xl"
              style={{ minWidth: '200px', minHeight: '150px' }}
            />
            {isAdmin && (
              <button 
                onClick={handleLogoFileSelect}
                className="absolute bottom-12 right-0 bg-red-600 text-white px-4 py-2 rounded-xl font-bold text-sm opacity-0 group-hover:opacity-100 transition-opacity shadow-2xl flex items-center space-x-2"
              >
                <ImageIcon size={18} />
                <span>Ganti Logo</span>
              </button>
            )}
            
            <span className="inline-block px-4 py-1.5 mb-6 rounded-full bg-red-600 text-sm font-semibold tracking-wider uppercase">
              {STORE_CONFIG.hero.promoTag}
            </span>
            <h1 className="text-5xl md:text-7xl font-bold leading-tight mb-6 uppercase tracking-tighter">
              {STORE_CONFIG.hero.title}
            </h1>
            <p className="text-lg md:text-xl text-gray-200 mb-8 leading-relaxed">
              {STORE_CONFIG.hero.subtitle}
            </p>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="flex flex-col sm:flex-row gap-4"
          >
            <button className="bg-red-600 hover:bg-red-700 text-white px-8 py-4 rounded-xl font-bold text-lg flex items-center justify-center space-x-2 transition-all transform hover:scale-105">
              <span>Mulai Belanja</span>
              <ArrowRight size={20} />
            </button>
            <button className="bg-white/10 backdrop-blur-md hover:bg-white/20 text-white border border-white/30 px-8 py-4 rounded-xl font-bold text-lg transition-all">
              Lihat Katalog
            </button>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 0.5 }}
            className="mt-12 grid grid-cols-2 md:grid-cols-3 gap-6"
          >
            <div className="flex items-center space-x-2">
              <CheckCircle2 className="text-red-500" size={20} />
              <span className="text-gray-300 font-medium text-sm">Garansi Resmi</span>
            </div>
            <div className="flex items-center space-x-2">
              <CheckCircle2 className="text-red-500" size={20} />
              <span className="text-gray-300 font-medium text-sm">Gratis Ongkir Surabaya</span>
            </div>
            <div className="flex items-center space-x-2">
              <CheckCircle2 className="text-red-500" size={20} />
              <span className="text-gray-300 font-medium text-sm">Cicilan 0%</span>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Hero;
