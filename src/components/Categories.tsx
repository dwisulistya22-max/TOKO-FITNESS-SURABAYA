import { useState, useEffect } from 'react';
import { ArrowRight } from 'lucide-react';

const PROJECT_IDS = ['qi4rocc0', '856jrik3'];
const DATASET = 'production';

// GAMBAR CADANGAN HANYA JIKA DI SANITY BENAR-BENAR TIDAK ADA GAMBAR
const DEFAULT_CATEGORIES = [
  {
    id: '1',
    title: 'Cardio',
    description: 'Koleksi peralatan fitness kardio terlengkap.',
    image: 'https://images.unsplash.com/photo-1538805060514-97d9cc17730c?q=80&w=800',
    order: 1
  },
  {
    id: '2',
    title: 'Commercial Use Fitness',
    description: 'Mesin dan alat olahraga kelas berat untuk gym komersial.',
    image: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=800',
    order: 2
  },
  {
    id: '3',
    title: 'Home Gym',
    description: 'Bawa atmosfer gym profesional ke dalam kenyamanan hunian Anda.',
    image: 'https://images.unsplash.com/photo-1540497077202-7c8a3999166f?q=80&w=800',
    order: 3
  },
  {
    id: '4',
    title: 'Aksesoris',
    description: 'Maksimalkan setiap sesi latihanmu di rumah maupun di gym.',
    image: 'https://images.unsplash.com/photo-1584735935682-2f2b69dff9d2?q=80&w=800',
    order: 4
  }
];

const Categories = ({ onSelectCategory }: any) => {
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCategories = async () => {
      // GROQ Query cerdas: Mengecek semua kemungkinan nama field gambar & urutan di Sanity
      const query = encodeURIComponent(`*[_type in ["category", "kategori"]] {
        _id,
        "title": coalesce(title, name, nama, ""),
        "description": coalesce(description, deskripsi, ""),
        "order": coalesce(order, sortOrder, urutan, 99),
        "image": coalesce(
          image.asset->url, 
          foto.asset->url, 
          photo.asset->url, 
          gambar.asset->url, 
          cover.asset->url,
          bgImage.asset->url,
          ""
        )
      }`);

      // Tambahkan timestamp (_t) agar browser TIDAK MENSIMPAN CACHE lama
      const cacheBuster = `&_t=${Date.now()}`;

      for (const id of PROJECT_IDS) {
        try {
          const res = await fetch(
            `https://${id}.api.sanity.io/v2024-01-01/data/query/${DATASET}?query=${query}${cacheBuster}`,
            { cache: 'no-store' }
          );
          const data = await res.json();

          if (data?.result?.length) {
            const formatted = data.result.map((item: any, idx: number) => ({
              id: item._id,
              title: item.title || 'Kategori',
              description: item.description || 'Peralatan fitness berkualitas.',
              order: Number(item.order !== undefined ? item.order : idx + 1),
              image: item.image || DEFAULT_CATEGORIES[idx % DEFAULT_CATEGORIES.length]?.image
            }));

            // URUTKAN BERDASARKAN ANGKA 'ORDER'
            formatted.sort((a: any, b: any) => a.order - b.order);

            setCategories(formatted);
            break;
          }
        } catch (err) {
          console.error('Error fetching categories:', err);
        }
      }
      setLoading(false);
    };

    fetchCategories();
  }, []);

  const handleCategoryClick = (title: string) => {
    if (onSelectCategory) onSelectCategory(title);
    const productSection = document.getElementById('products');
    if (productSection) {
      productSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  if (loading) {
    return (
      <div className="py-12 text-center text-gray-400 font-bold animate-pulse">
        ⏳ Memuat Kategori Terbaru...
      </div>
    );
  }

  return (
    <section id="categories" className="py-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-black text-gray-900 uppercase italic tracking-tighter">
            Pilih Berdasarkan Kategori
          </h2>
          <p className="text-gray-500 mt-2">Temukan alat fitness yang sesuai dengan kebutuhan latihan Anda</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {categories.map((cat) => (
            <div
              key={cat.id}
              onClick={() => handleCategoryClick(cat.title)}
              className="group relative h-96 rounded-3xl overflow-hidden cursor-pointer shadow-lg hover:shadow-2xl transition-all duration-500 border border-gray-100 flex flex-col justify-end p-6"
            >
              {/* Gambar dari Sanity */}
              <img
                src={cat.image}
                alt={cat.title}
                className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
              />

              {/* Overlay Hitam Transparan */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent group-hover:from-black/95 transition-all duration-300" />

              {/* Konten Teks */}
              <div className="relative z-10">
                <h3 className="text-2xl font-black text-white mb-2 leading-tight group-hover:text-red-500 transition-colors">
                  {cat.title}
                </h3>
                <p className="text-gray-300 text-xs line-clamp-2 mb-4 leading-relaxed font-normal">
                  {cat.description}
                </p>
                <div className="inline-flex items-center gap-2 text-red-500 text-xs font-bold uppercase tracking-wider group-hover:translate-x-2 transition-transform">
                  Lihat Semua <ArrowRight size={14} />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Categories;
