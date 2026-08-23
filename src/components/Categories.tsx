import { useState, useEffect } from 'react';
import { ArrowRight } from 'lucide-react';

const PROJECT_IDS = ['qi4rocc0', '856jrik3'];
const DATASET = 'production';

// KATEGORI DEFAULT (DITAMPILKAN JIKA SANITY KOSONG / KONEKSI TERPUTUS)
const DEFAULT_CATEGORIES = [
  {
    id: 'cat-1',
    title: 'Cardio',
    description: 'Koleksi peralatan fitness kardio (cardiovascular training) terlengkap.',
    image: 'https://images.unsplash.com/photo-1538805060514-97d9cc17730c?q=80&w=800',
    order: 1
  },
  {
    id: 'cat-2',
    title: 'Commercial Use Fitness',
    description: 'Commercial use fitness adalah mesin dan alat olahraga kelas berat...',
    image: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=800',
    order: 2
  },
  {
    id: 'cat-3',
    title: 'Home Gym',
    description: 'Bawa atmosfer gym profesional ke dalam kenyamanan hunian Anda.',
    image: 'https://images.unsplash.com/photo-1540497077202-7c8a3999166f?q=80&w=800',
    order: 3
  },
  {
    id: 'cat-4',
    title: 'Aksesoris',
    description: 'Maksimalkan setiap sesi latihanmu di rumah maupun di gym!',
    image: 'https://images.unsplash.com/photo-1584735935682-2f2b69dff9d2?q=80&w=800',
    order: 4
  },
  {
    id: 'cat-5',
    title: 'Outdoor Fitness Equipment',
    description: 'Peralatan fitness luar ruangan tahan cuaca dengan standar keamanan tinggi.',
    image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?q=80&w=800',
    order: 5
  }
];

const Categories = ({ onSelectCategory }: any) => {
  // Langsung beri default agar TIDAK PERNAH KOSONG saat loading
  const [categories, setCategories] = useState<any[]>(DEFAULT_CATEGORIES);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCategories = async () => {
      const query = encodeURIComponent(`*[_type in ["category", "kategori", "categories"]] {
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
          ""
        )
      }`);

      let hasData = false;

      for (const id of PROJECT_IDS) {
        try {
          const res = await fetch(
            `https://${id}.api.sanity.io/v2024-01-01/data/query/${DATASET}?query=${query}`,
            { cache: 'no-store' }
          );
          const data = await res.json();

          if (data?.result && Array.isArray(data.result) && data.result.length > 0) {
            const formatted = data.result
              .filter((item: any) => item.title)
              .map((item: any, idx: number) => ({
                id: item._id || `cat-${idx}`,
                title: item.title,
                description: item.description || 'Peralatan fitness berkualitas tinggi.',
                order: Number(item.order !== undefined ? item.order : idx + 1),
                image: item.image || DEFAULT_CATEGORIES[idx % DEFAULT_CATEGORIES.length]?.image
              }));

            if (formatted.length > 0) {
              // Urutkan berdasarkan nomor order
              formatted.sort((a: any, b: any) => a.order - b.order);
              setCategories(formatted);
              hasData = true;
              break;
            }
          }
        } catch (err) {
          console.error('Gagal mengambil kategori Sanity:', err);
        }
      }

      if (!hasData) {
        setCategories(DEFAULT_CATEGORIES);
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

  return (
    <section id="categories" className="py-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-black text-gray-900 uppercase italic tracking-tighter">
            Pilih Berdasarkan Kategori
          </h2>
          <p className="text-gray-500 mt-2">
            Temukan alat fitness yang sesuai dengan kebutuhan latihan Anda
          </p>
        </div>

        {loading ? (
          <div className="py-12 text-center text-gray-400 font-bold animate-pulse">
            ⏳ Memuat Kategori...
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {categories.map((cat) => (
              <div
                key={cat.id}
                onClick={() => handleCategoryClick(cat.title)}
                className="group relative h-96 rounded-3xl overflow-hidden cursor-pointer shadow-lg hover:shadow-2xl transition-all duration-500 border border-gray-100 flex flex-col justify-end p-6"
              >
                <img
                  src={cat.image}
                  alt={cat.title}
                  className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent group-hover:from-black/95 transition-all duration-300" />
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
        )}
      </div>
    </section>
  );
};

export default Categories;
