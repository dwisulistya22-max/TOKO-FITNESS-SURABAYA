import { Star, Quote } from 'lucide-react';
import { motion } from 'framer-motion';
import { TESTIMONIALS } from '../data/config';

const Testimonials = () => {
  return (
    <section className="py-24 bg-[#0f172a] text-white overflow-hidden" id="tentang">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="text-center mb-16">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-5xl font-black uppercase tracking-tight mb-4"
          >
            Apa Kata Mereka?
          </motion.h2>
          <p className="text-slate-400 text-lg">Kepuasan pelanggan adalah prioritas utama kami.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {TESTIMONIALS.map((item, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ delay: idx * 0.1 }}
              className="bg-slate-800/50 backdrop-blur-sm p-8 rounded-3xl border border-slate-700 relative group hover:border-red-500/50 transition-all"
            >
              <Quote className="absolute top-6 right-8 text-slate-700 group-hover:text-red-500/20 transition-colors" size={40} />
              
              <div className="flex gap-1 text-yellow-400 mb-6">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} size={16} fill={i < item.rating ? "currentColor" : "none"} />
                ))}
              </div>

              <p className="text-slate-300 italic leading-relaxed mb-8 text-lg">
                "{item.content}"
              </p>

              <div className="flex items-center gap-4">
                <img 
                  src={item.image} 
                  alt={item.name} 
                  className="w-12 h-12 rounded-full object-cover border-2 border-slate-600"
                />
                <div>
                  <h4 className="font-bold text-white text-base">{item.name}</h4>
                  <p className="text-slate-500 text-xs uppercase tracking-widest font-bold">{item.role}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

      </div>
    </section>
  );
};

export default Testimonials;
