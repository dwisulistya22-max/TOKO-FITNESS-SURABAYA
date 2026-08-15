import { Star, Quote } from 'lucide-react';
import { motion } from 'framer-motion';

const testimonials = [
  {
    id: 1,
    name: 'Budi Santoso',
    role: 'Pemilik Gym Local',
    content: 'Pelayanan Fitness Surabaya sangat memuaskan. Pengiriman cepat dan teknisinya sangat ahli dalam instalasi alat-alat berat.',
    rating: 5,
    avatar: 'https://i.pravatar.cc/150?u=budi'
  },
  {
    id: 2,
    name: 'Siska Amelia',
    role: 'Ibu Rumah Tangga',
    content: 'Beli Treadmill di sini garansinya jelas. Sudah pakai 1 tahun masih awet dan lancar. Sangat membantu program diet saya!',
    rating: 5,
    avatar: 'https://i.pravatar.cc/150?u=siska'
  },
  {
    id: 3,
    name: 'dr. Andi Wijaya',
    role: 'Personal Trainer',
    content: 'Rekomendasi terbaik untuk alat fitness berkualitas di Jawa Timur. Barangnya ori dan harganya sangat kompetitif.',
    rating: 5,
    avatar: 'https://i.pravatar.cc/150?u=andi'
  }
];

const Testimonials = () => {
  return (
    <section id="testimonials" className="py-24 bg-gray-900 text-white overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Apa Kata Mereka?</h2>
          <p className="text-gray-400">Kepuasan pelanggan adalah prioritas utama kami.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((t, idx) => (
            <motion.div
              key={t.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.2 }}
              viewport={{ once: true }}
              className="bg-white/5 backdrop-blur-sm p-8 rounded-3xl border border-white/10 relative"
            >
              <Quote className="absolute top-6 right-6 text-red-600/20" size={40} />
              <div className="flex text-yellow-500 mb-6">
                {[...Array(t.rating)].map((_, i) => (
                  <Star key={i} size={16} fill="currentColor" />
                ))}
              </div>
              <p className="text-gray-300 mb-8 italic text-lg leading-relaxed">
                "{t.content}"
              </p>
              <div className="flex items-center space-x-4">
                <img src={t.avatar} alt={t.name} className="w-12 h-12 rounded-full border-2 border-red-600" />
                <div>
                  <h4 className="font-bold text-white">{t.name}</h4>
                  <p className="text-sm text-gray-500">{t.role}</p>
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
