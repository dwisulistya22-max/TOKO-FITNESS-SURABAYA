import { useState, useEffect } from 'react';
import { Star, Quote } from 'lucide-react';
import { motion } from 'framer-motion';

const PROJECT_IDS = ['qi4rocc0', '856jrik3'];
const DATASET = 'production';
const SANITY_URL = (id: string) => `https://${id}.api.sanity.io/v2024-01-01/data/query/${DATASET}?query=`;

const DEFAULT_REVIEWS = [
  {
    name: "Budi Santoso",
    role: "Pemilik Gym Local",
    content: "Pelayanan Fitness Surabaya sangat memuaskan. Pengiriman cepat dan teknisinya sangat ahli dalam instalasi alat-alat berat.",
    rating: 5,
    image: "https://i.pravatar.cc/150?u=budi"
  },
  {
    name: "Siska Amelia",
    role: "Ibu Rumah Tangga",
    content: "Beli Treadmill di sini garansinya jelas. Sudah pakai 1 tahun masih awet dan lancar. Sangat membantu program diet saya!",
    rating: 5,
    image: "https://i.pravatar.cc/150?u=siska"
  },
  {
    name: "dr. Andi Wijaya",
    role: "Personal Trainer",
    content: "Rekomendasi terbaik untuk alat fitness berkualitas di Jawa Timur. Barangnya ori dan harganya sangat kompetitif.",
    rating: 5,
    image: "https://i.pravatar.cc/150?u=andi"
  }
];

const Testimonials = () => {
  const [reviews, setReviews] = useState<any[]>(DEFAULT_REVIEWS);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReviews = async () => {
      setLoading(true);
      const query = encodeURIComponent(`*[_type == "testimonial"] | order(_createdAt desc) {
        name, role, content, rating,
        "image": coalesce(image.asset->url, "https://i.pravatar.cc/150")
      }`);

      for (const id of PROJECT_IDS) {
        try {
          const res = await fetch(SANITY_URL(id) + query, { cache: 'no-store' });
          const data = await res.json();
          if (data?.result && data.result.length > 0) {
            setReviews(data.result);
            break;
          }
        } catch (err) {
          console.error("Gagal ambil testimoni:", err);
        }
      }
      setLoading(false);
    };

    fetchReviews();
  }, []);

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
          {reviews.map((item, idx) => (
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

        {loading && (
          <p className="text-center mt-8 text-slate-500 animate-pulse">Menghubungkan testimoni terbaru...</p>
        )}
      </div>
    </section>
  );
};

export default Testimonials;
