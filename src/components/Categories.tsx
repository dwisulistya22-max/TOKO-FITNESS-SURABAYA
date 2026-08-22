import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

// OTOMATIS MEMERIKSA PROJECT ID DARI SANITY STUDIO ANDA (qi4rocc0 / 856jrik3)
const PROJECT_IDS = ['qi4rocc0', '856jrik3']; 
const SANITY_DATASET = 'production';

// Data Cadangan jika internet lambat
const DEFAULT_CATEGORIES = [
  {
    id: 'cardio',
    title: 'Cardio',
    description: 'Koleksi peralatan fitness kardio (treadmill, sepeda statis, elliptical)',
    image: 'https://images.unsplash.com/photo-1576678927484-cc909957088c?q=80&w=800&auto=format&fit=crop'
  },
  {
    id: 'aksesoris',
    title: 'Aksesoris',
    description: 'Maksimalkan setiap sesi latihanmu di rumah',
    image: 'https://images.unsplash.com/photo-1518611012118-696072aa579a?q=80&w=800&auto=format&fit=crop'
  },
  {
    id: 'homegym',
    title: 'Home Gym',
    description: 'Bawa atmosfer gym profesional ke dalam rumah',
    image: 'https://images.unsplash.com/photo-1540497077202-7c8a3999166f?q=80&w=800&auto=format&fit=crop'
  },
  {
    id: 'strength',
    title: 'Strength',
    description: 'Koleksi alat penunjang latihan kekuatan beban',
    image: 'https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?q=80&w=800&auto=format&fit=crop'
  }
];

interface CategoriesProps {
  onSelectCategory: (category: string) => void;
  isAdmin?: boolean;
}

const Categories = ({ onSelectCategory }: CategoriesProps) => {
  const [categories, setCategories] = useState<any[]>(DEFAULT_CATEGORIES);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchCategoriesFromSanity = async () => {
      setLoading(true);

      // Query GROQ PINTAR: Membaca otomatis judul, deskripsi & gambar apapun nama kolomnya di Sanity
      const query = encodeURIComponent(`*[_type == "category"] | order(_createdAt asc) {
        _id,
        "title": coalesce(title, name, categoryName, label, "Kategori"),
        "description": coalesce(description, desc, detail, "Peralatan fitness berkualitas"),
        "image": coalesce(image.asset->url, photo.asset->url, thumbnail.asset->url, icon.asset->url, icon, "")
      }`);

      let foundData = false;

      // Coba panggil dari Project ID Sanity Anda
      for (const projId of PROJECT_IDS) {
        try {
          const url = `https://${projId}.api.sanity.io/v2024-01-01/data/query/${SANITY_DATASET}?query=${query}`;
          const response = await fetch(url, { cache: 'no-store' });
          const data = await response.json();

          if (data?.result && data.result.length > 0) {
            console.log("Data Kategori Berhasil Diambil dari Sanity:", data.result);
            
            const formatted = data.result.map((cat: any, index: number) => ({
              id: cat._id || index,
              title: cat.title,
              description: cat.description,
              image: cat.image && cat.image.length > 5 ? cat.image : DEFAULT_CATEGORIES[index % DEFAULT_CATEGORIES.length]?.image
            }));

            setCategories(formatted);
            foundData = true;
            break; // Hentikan pencarian jika data sudah ketemu
          }
        } catch (err) {
          console.warn(`Mencari data dari Project ID: ${projId}...`);
        }
      }

      if (!foundData) {
        console.log("Menggunakan data default.");
      }

      setLoading(false);
    };

    fetchCategoriesFromSanity();
  }, []);

  return (
    <section className="py-20 bg-gray-50" id="categories">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* JUDUL SECTION */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            Kategori Pilihan
          </h2>
          <p className="text-gray-600 text-lg">
            Temukan perlengkapan yang tepat untuk tujuan fitness Anda. Dari cardio hingga latihan beban intensif.
          </p>
        </div>

        {/* LIST KATEGORI */}
        {loading ? (
          <div className="text-center py-10 text-red-600 font-bold animate-pulse">
            ⏳ Memuat Kategori Terbaru dari Sanity Studio...
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {categories.map((cat, index) => (
              <motion.div
                key={cat.id || index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                viewport={{ once: true }}
                onClick={() => {
                  onSelectCategory(cat.title);
                  const el = document.getElementById('products');
                  if (el) el.scrollIntoView({ behavior: 'smooth' });
                }}
                className="group relative h-96 rounded-3xl overflow-hidden cursor-pointer shadow-lg hover:shadow-2xl transition-all duration-500"
              >
                {/* GAMBAR DARI SANITY STUDIO */}
                <img
                  src={cat.image}
                  alt={cat.title}
                  className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                />

                {/* GRADIENT OVERLAY */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />

                {/* DETAIL KATEGORI */}
                <div className="absolute bottom-0 left-0 right-0 p-6 flex flex-col justify-end">
                  <h3 className="text-2xl font-bold text-white mb-2">
                    {cat.title}
                  </h3>
                  <p className="text-gray-300 text-sm mb-4 line-clamp-2">
                    {cat.description}
                  </p>
                  <span className="text-red-500 font-bold text-sm group-hover:text-red-400 flex items-center transition-colors">
                    Lihat Semua &rarr;
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        )}

      </div>
    </section>
  );
};

export default Categories;
