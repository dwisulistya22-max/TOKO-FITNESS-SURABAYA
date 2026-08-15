import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Edit2, Plus, Trash2 } from 'lucide-react';
import { CATEGORIES as INITIAL_CATEGORIES } from '../data/config';

interface CategoriesProps {
  onSelectCategory: (category: string) => void;
  isAdmin?: boolean;
  setIsAdmin?: (val: boolean) => void;
}

const Categories = ({ onSelectCategory, isAdmin: propIsAdmin, setIsAdmin: propSetIsAdmin }: CategoriesProps) => {
  const [categories, setCategories] = useState(INITIAL_CATEGORIES);
  const [localIsAdmin, setLocalIsAdmin] = useState(false);

  const isAdmin = propIsAdmin !== undefined ? propIsAdmin : localIsAdmin;
  const setIsAdmin = propSetIsAdmin !== undefined ? propSetIsAdmin : setLocalIsAdmin;

  // Load dari localStorage
  useEffect(() => {
    const saved = localStorage.getItem('fitness_categories');
    if (saved) {
      setCategories(JSON.parse(saved));
    }
  }, []);

  const handleImageChange = (id: number, file: File) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
      const updated = categories.map(c => 
        c.id === id ? { ...c, image: base64String } : c
      );
      setCategories(updated);
      localStorage.setItem('fitness_categories', JSON.stringify(updated));
    };
    reader.readAsDataURL(file);
  };

  const handleFileSelect = (id: number) => {
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
        handleImageChange(id, file);
      }
    };
    input.click();
  };

  const handleNameChange = (id: number, newName: string) => {
    const updated = categories.map(c => 
      c.id === id ? { ...c, name: newName } : c
    );
    setCategories(updated);
    localStorage.setItem('fitness_categories', JSON.stringify(updated));
  };

  const handleDescChange = (id: number, newDesc: string) => {
    const updated = categories.map(c => 
      c.id === id ? { ...c, description: newDesc } : c
    );
    setCategories(updated);
    localStorage.setItem('fitness_categories', JSON.stringify(updated));
  };

  const handleAddCategory = () => {
    const name = prompt("Nama Kategori Baru:");
    if (!name) return;
    
    const description = prompt("Deskripsi Kategori:");
    
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      let imageUrl = 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?q=80&w=800&auto=format&fit=crop';
      
      const saveCat = (img: string) => {
        const newCategory = {
          id: Date.now(),
          name: name,
          image: img,
          description: description || 'Deskripsi kategori'
        };
        const updated = [...categories, newCategory];
        setCategories(updated);
        localStorage.setItem('fitness_categories', JSON.stringify(updated));
        alert(`Kategori "${name}" berhasil ditambahkan!`);
      };
      
      if (file) {
        if (file.size > 2 * 1024 * 1024) {
          alert('Ukuran file terlalu besar!');
          saveCat(imageUrl);
          return;
        }
        const reader = new FileReader();
        reader.onloadend = () => saveCat(reader.result as string);
        reader.readAsDataURL(file);
      } else {
        saveCat(imageUrl);
      }
    };
    input.click();
  };

  const handleDeleteCategory = (id: number, name: string) => {
    if (confirm(`Yakin ingin menghapus kategori "${name}"?\n\nProduk dengan kategori ini tidak akan terfilter.`)) {
      const updated = categories.filter(c => c.id !== id);
      setCategories(updated);
      localStorage.setItem('fitness_categories', JSON.stringify(updated));
    }
  };

  return (
    <section id="categories" className="py-24 bg-gray-50 relative">
      {/* Tombol Admin Kategori */}
      <div className="absolute top-8 right-8 z-10">
        <button 
          onClick={() => setIsAdmin(!isAdmin)}
          className={`px-4 py-2 rounded-lg font-bold text-sm flex items-center space-x-2 transition-colors ${
            isAdmin ? 'bg-red-600 text-white' : 'bg-gray-900 text-white hover:bg-gray-700'
          }`}
        >
          <Edit2 size={16} />
          <span>{isAdmin ? 'Selesai Edit' : 'Edit Kategori'}</span>
        </button>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Kategori Pilihan</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Temukan perlengkapan yang tepat untuk tujuan fitness Anda. Dari cardio hingga latihan beban intensif.
          </p>
          {isAdmin && (
            <div className="mt-4 space-y-2">
              <p className="text-red-600 font-bold text-sm animate-pulse">● Mode Edit Kategori Aktif</p>
              <button 
                onClick={handleAddCategory}
                className="bg-green-600 text-white px-4 py-2 rounded-lg font-bold text-sm flex items-center space-x-2 hover:bg-green-700 transition-colors mx-auto"
              >
                <Plus size={16} />
                <span>Tambah Kategori Baru</span>
              </button>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {categories.map((category, index) => (
            <motion.div
              key={category.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              viewport={{ once: true }}
              className={`group relative overflow-hidden rounded-2xl aspect-[4/5] shadow-xl ${
                isAdmin ? 'ring-2 ring-red-300 ring-offset-2' : ''
              }`}
            >
              {/* Layer Klik untuk Filter */}
              {!isAdmin && (
                <a
                  href="#products"
                  onClick={() => onSelectCategory(category.name)}
                  className="absolute inset-0 z-10 cursor-pointer"
                />
              )}
              
              <img 
                src={category.image} 
                alt={category.name} 
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent"></div>
              
              {/* Tombol Edit Gambar */}
              {isAdmin && (
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-20">
                  <button 
                    onClick={() => handleFileSelect(category.id)}
                    className="bg-white text-gray-900 px-4 py-2 rounded-lg font-bold text-sm flex items-center space-x-2 shadow-xl hover:bg-red-600 hover:text-white transition-all"
                  >
                    <Edit2 size={16} />
                    <span>Ganti Gambar</span>
                  </button>
                </div>
              )}

              {/* Tombol Hapus */}
              {isAdmin && (
                <button 
                  onClick={() => handleDeleteCategory(category.id, category.name)}
                  className="absolute top-4 right-4 z-30 bg-red-600 text-white p-2 rounded-lg shadow-lg hover:bg-red-700 transition-colors"
                >
                  <Trash2 size={16} />
                </button>
              )}

              <div className="absolute bottom-0 left-0 p-6 text-white w-full">
                {isAdmin ? (
                  <div className="space-y-2 z-30 relative">
                    <input 
                      type="text"
                      value={category.name}
                      onChange={(e) => handleNameChange(category.id, e.target.value)}
                      className="w-full text-2xl font-bold bg-white/20 border border-white/30 rounded px-2 py-1 text-white placeholder-white/50"
                      placeholder="Nama Kategori"
                    />
                    <input 
                      type="text"
                      value={category.description}
                      onChange={(e) => handleDescChange(category.id, e.target.value)}
                      className="w-full text-sm bg-white/20 border border-white/30 rounded px-2 py-1 text-white placeholder-white/50"
                      placeholder="Deskripsi"
                    />
                  </div>
                ) : (
                  <>
                    <h3 className="text-2xl font-bold mb-1">{category.name}</h3>
                    <p className="text-sm text-gray-300 mb-4">{category.description}</p>
                    <div className="inline-flex items-center text-red-500 font-semibold group-hover:translate-x-2 transition-transform">
                      Lihat Semua →
                    </div>
                  </>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Categories;
