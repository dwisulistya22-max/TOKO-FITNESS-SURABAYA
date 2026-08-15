import { useState, useEffect } from 'react';
import { Star, ShoppingCart, Edit2, Check, X, Info, Save } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { PRODUCTS as INITIAL_PRODUCTS, STORE_CONFIG } from '../data/config';

const formatPrice = (price: number) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0
  }).format(price);
};

interface FeaturedProductsProps {
  activeCategory: string;
  onCategoryChange: (category: string) => void;
  isAdmin: boolean;
  setIsAdmin: (val: boolean) => void;
}

const FeaturedProducts = ({ activeCategory, onCategoryChange, isAdmin, setIsAdmin }: FeaturedProductsProps) => {
  const [products, setProducts] = useState(INITIAL_PRODUCTS);
  const [selectedProduct, setSelectedProduct] = useState<any>(null);

  // Load data dari localStorage jika ada
  useEffect(() => {
    const savedProducts = localStorage.getItem('fitness_products');
    if (savedProducts && savedProducts !== "[]") {
      setProducts(JSON.parse(savedProducts));
    }
  }, []);

  const filteredProducts = activeCategory === 'Semua' 
    ? products 
    : products.filter(p => p.category === activeCategory);

  const handlePriceChange = (id: number, newPrice: string) => {
    const updated = products.map(p => 
      p.id === id ? { ...p, price: parseInt(newPrice.replace(/\D/g, '')) || 0 } : p
    );
    setProducts(updated);
    localStorage.setItem('fitness_products', JSON.stringify(updated));
  };

  const handleNameChange = (id: number, newName: string) => {
    const updated = products.map(p => 
      p.id === id ? { ...p, name: newName } : p
    );
    setProducts(updated);
    localStorage.setItem('fitness_products', JSON.stringify(updated));
  };

  const handleUpdateDetail = (id: number, field: string, value: string) => {
    const updated = products.map(p => 
      p.id === id ? { ...p, [field]: value } : p
    );
    setProducts(updated);
    localStorage.setItem('fitness_products', JSON.stringify(updated));
  };

  const handleImageChange = (id: number, file: File) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
      const updated = products.map(p => 
        p.id === id ? { ...p, image: base64String } : p
      );
      setProducts(updated);
      localStorage.setItem('fitness_products', JSON.stringify(updated));
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

  const handleAddProduct = () => {
    const name = prompt("Nama Produk:");
    if (!name) return;
    
    const priceStr = prompt("Harga Produk (contoh: 2500000):");
    if (!priceStr) return;
    const price = parseInt(priceStr.replace(/\D/g, '')) || 0;
    
    const category = prompt("Kategori (Cardio/Strength/Home Gym/Aksesoris):");
    if (!category) return;
    
    const useUrl = confirm("Gunakan URL gambar dari internet?\n\nKlik OK untuk URL, Cancel untuk upload dari laptop");
    
    if (useUrl) {
      const image = prompt("URL Gambar Produk:");
      saveNewProduct(name, price, category, image || 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?q=80&w=800&auto=format&fit=crop');
    } else {
      // Upload dari file
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
            saveNewProduct(name, price, category, reader.result as string);
          };
          reader.readAsDataURL(file);
        }
      };
      input.click();
    }
  };

  const saveNewProduct = (name: string, price: number, category: string, image: string) => {
    const newProduct = {
      id: Date.now(),
      name: name,
      price: price,
      category: category,
      rating: 5.0,
      reviews: 0,
      image: image,
      tag: 'Baru'
    };
    
    const updated = [...products, newProduct];
    setProducts(updated);
    localStorage.setItem('fitness_products', JSON.stringify(updated));
    alert(`Produk "${name}" berhasil ditambahkan!`);
  };

  const handleDeleteProduct = (id: number, name: string) => {
    if (confirm(`Yakin ingin menghapus produk "${name}"?`)) {
      const updated = products.filter(p => p.id !== id);
      setProducts(updated);
      localStorage.setItem('fitness_products', JSON.stringify(updated));
    }
  };

  const exportPermanentCode = () => {
    const logoData = localStorage.getItem('fitness_logo') || STORE_CONFIG.logo;
    const contactData = JSON.parse(localStorage.getItem('fitness_contact') || JSON.stringify({
      address: STORE_CONFIG.address,
      phone: STORE_CONFIG.phone,
      email: STORE_CONFIG.email
    }));

    const code = `export const STORE_CONFIG = {
  name: "${STORE_CONFIG.name}",
  logo: "${logoData}",
  slogan: "${STORE_CONFIG.slogan}",
  phone: "${contactData.phone}",
  email: "${contactData.email}",
  address: "${contactData.address}",
  hero: ${JSON.stringify(STORE_CONFIG.hero, null, 2)}
};

export const CATEGORIES = ${localStorage.getItem('fitness_categories') || JSON.stringify(INITIAL_PRODUCTS)};

export const PRODUCTS = ${JSON.stringify(products, null, 2)};
`;
    
    const blob = new Blob([code], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'config.ts';
    a.click();
    alert("File 'config.ts' telah didownload. \n\nSilakan buka file tersebut, salin isinya, dan timpa isi file 'src/data/config.ts' Anda agar editan menjadi PERMANEN.");
  };

  return (
    <section id="products" className={`py-24 bg-white relative ${isAdmin ? 'border-4 border-red-500/20' : ''}`}>
      {/* Detail Modal */}
      <AnimatePresence>
        {selectedProduct && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-white w-full max-w-4xl rounded-3xl overflow-hidden shadow-2xl relative max-h-[90vh] flex flex-col md:flex-row"
            >
              <button 
                onClick={() => setSelectedProduct(null)}
                className="absolute top-4 right-4 z-10 bg-white/80 p-2 rounded-full hover:bg-red-600 hover:text-white transition-all shadow-md"
              >
                <X size={24} />
              </button>
              
              <div className="md:w-1/2 bg-gray-100">
                <img src={selectedProduct.image} alt={selectedProduct.name} className="w-full h-full object-cover" />
              </div>
              
              <div className="md:w-1/2 p-8 overflow-y-auto">
                <div className="text-sm text-red-600 font-bold uppercase tracking-widest mb-2">{selectedProduct.category}</div>
                <h2 className="text-3xl font-bold text-gray-900 mb-4">{selectedProduct.name}</h2>
                <div className="text-2xl font-black text-red-600 mb-6">{formatPrice(selectedProduct.price)}</div>
                
                <div className="space-y-6">
                  <div>
                    <h4 className="font-bold text-gray-900 mb-2 flex items-center gap-2 border-b border-gray-100 pb-2">
                      <Info size={18} className="text-red-600" />
                      Kegunaan & Deskripsi
                    </h4>
                    <p className="text-gray-600 leading-relaxed italic">
                      {selectedProduct.description || 'Deskripsi belum ditambahkan.'}
                    </p>
                  </div>
                  
                  <div>
                    <h4 className="font-bold text-gray-900 mb-2 flex items-center gap-2 border-b border-gray-100 pb-2">
                      <Check size={18} className="text-red-600" />
                      Spesifikasi Teknis
                    </h4>
                    <p className="text-gray-600 leading-relaxed whitespace-pre-wrap">
                      {selectedProduct.specs || 'Spesifikasi belum ditambahkan.'}
                    </p>
                  </div>
                </div>
                
                <a 
                  href={`https://wa.me/6281234567890?text=Halo Surabaya Fitness, saya tertarik dengan produk ${selectedProduct.name}`}
                  target="_blank"
                  className="mt-8 w-full bg-green-500 hover:bg-green-600 text-white py-4 rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg transition-all"
                >
                  <ShoppingCart size={20} />
                  Pesan via WhatsApp Sekarang
                </a>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Tombol Admin hanya terlihat jika diperlukan */}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-4">
          <div>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              {activeCategory === 'Semua' ? 'Produk Unggulan' : `Kategori: ${activeCategory}`}
            </h2>
            <p className="text-gray-600">Alat fitness dengan performa terbaik pilihan pelanggan kami.</p>
            {isAdmin && (
            <div className="space-y-2">
              <p className="text-red-600 font-bold text-sm animate-pulse">● Mode Admin Aktif</p>
              <button 
                onClick={handleAddProduct}
                className="bg-green-600 text-white px-4 py-2 rounded-lg font-bold text-sm flex items-center space-x-2 hover:bg-green-700 transition-colors"
              >
                <span>+ Tambah Produk Baru</span>
              </button>
              <button 
                onClick={exportPermanentCode}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg font-bold text-sm flex items-center space-x-2 hover:bg-blue-700 transition-colors"
              >
                <Save size={16} />
                <span>💾 Simpan Data ke File Kode (Permanen)</span>
              </button>
            </div>
          )}
          </div>
          {activeCategory !== 'Semua' && (
            <button 
              onClick={() => onCategoryChange('Semua')}
              className="text-red-600 font-bold hover:text-red-700 transition-colors flex items-center bg-red-50 px-4 py-2 rounded-lg"
            >
              Lihat Semua Produk <span className="ml-2">×</span>
            </button>
          )}
        </div>

        {filteredProducts.length === 0 ? (
          <div className="text-center py-20 bg-gray-50 rounded-3xl border-2 border-dashed border-gray-200">
            <p className="text-gray-400 text-lg">Belum ada produk di kategori ini.</p>
            <button 
              onClick={() => onCategoryChange('Semua')}
              className="mt-4 text-red-600 font-bold"
            >
              Kembali ke Semua Produk
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {filteredProducts.map((product, index) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.1 }}
                viewport={{ once: true }}
                className={`bg-white rounded-2xl border ${isAdmin ? 'border-red-300 ring-2 ring-red-50 ring-offset-2' : 'border-gray-100'} overflow-hidden hover:shadow-2xl transition-all duration-300 group`}
              >
                <div className="relative aspect-square overflow-hidden bg-gray-100">
                  <img 
                    src={product.image} 
                    alt={product.name} 
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  {isAdmin && (
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <button 
                        onClick={() => handleFileSelect(product.id)}
                        className="bg-white text-gray-900 px-4 py-2 rounded-lg font-bold text-sm flex items-center space-x-2 shadow-xl hover:bg-red-600 hover:text-white transition-all"
                      >
                        <Edit2 size={16} />
                        <span>Ganti Gambar</span>
                      </button>
                    </div>
                  )}
                  {product.tag && (
                    <span className="absolute top-4 left-4 bg-red-600 text-white text-xs font-bold px-3 py-1 rounded-full">
                      {product.tag}
                    </span>
                  )}
                  {!isAdmin && (
                    <button className="absolute bottom-4 right-4 bg-white p-3 rounded-xl shadow-lg transform translate-y-12 group-hover:translate-y-0 opacity-0 group-hover:opacity-100 transition-all duration-300 hover:bg-red-600 hover:text-white">
                      <ShoppingCart size={20} />
                    </button>
                  )}
                  {isAdmin && (
                    <button 
                      onClick={() => handleDeleteProduct(product.id, product.name)}
                      className="absolute top-4 right-4 bg-red-600 text-white p-2 rounded-lg shadow-lg hover:bg-red-700 transition-colors"
                      title="Hapus Produk"
                    >
                      <span className="text-xs font-bold">× Hapus</span>
                    </button>
                  )}
                </div>
                
                <div className="p-6">
                  <div className="text-xs text-gray-500 font-medium mb-1 uppercase tracking-wider">{product.category}</div>
                  
                  {isAdmin ? (
                    <input 
                      type="text"
                      value={product.name}
                      onChange={(e) => handleNameChange(product.id, e.target.value)}
                      className="w-full font-bold text-gray-900 mb-2 border-b border-red-200 focus:border-red-500 outline-none bg-red-50/30 px-1"
                    />
                  ) : (
                    <h3 className="font-bold text-gray-900 mb-2 truncate" title={product.name}>{product.name}</h3>
                  )}
                  
                  <div className="flex items-center mb-4">
                    <div className="flex text-yellow-400">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} size={14} fill={i < Math.floor(product.rating) ? "currentColor" : "none"} />
                      ))}
                    </div>
                    <span className="text-xs text-gray-400 ml-2">({product.reviews})</span>
                  </div>

                  {isAdmin && (
                    <div className="mb-4 space-y-2">
                      <textarea 
                        placeholder="Kegunaan/Deskripsi"
                        value={product.description || ''}
                        onChange={(e) => handleUpdateDetail(product.id, 'description', e.target.value)}
                        className="w-full text-xs p-2 bg-gray-50 border border-gray-100 rounded-lg outline-none focus:border-red-300 h-20"
                      />
                      <textarea 
                        placeholder="Spesifikasi (contoh: Motor 2.0HP, Kecepatan 14km/h)"
                        value={product.specs || ''}
                        onChange={(e) => handleUpdateDetail(product.id, 'specs', e.target.value)}
                        className="w-full text-xs p-2 bg-gray-50 border border-gray-100 rounded-lg outline-none focus:border-red-300 h-20"
                      />
                    </div>
                  )}

                  <div className="flex items-center justify-between">
                    {isAdmin ? (
                      <div className="flex items-center bg-red-50 rounded-lg px-2 py-1 w-full">
                        <span className="text-red-600 font-bold mr-1">Rp</span>
                        <input 
                          type="text"
                          value={product.price.toLocaleString('id-ID')}
                          onChange={(e) => handlePriceChange(product.id, e.target.value)}
                          className="w-full font-bold text-red-600 bg-transparent outline-none"
                        />
                        <Check size={16} className="text-green-600" />
                      </div>
                    ) : (
                      <div className="flex items-center justify-between w-full">
                        <span className="text-lg font-bold text-red-600">{formatPrice(product.price)}</span>
                        <button 
                          onClick={() => setSelectedProduct(product)}
                          className="bg-gray-100 text-gray-900 p-2 rounded-lg hover:bg-red-600 hover:text-white transition-colors flex items-center gap-1 text-xs font-bold"
                        >
                          Detail
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default FeaturedProducts;
