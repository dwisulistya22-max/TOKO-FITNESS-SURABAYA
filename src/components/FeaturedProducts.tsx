import { useState, useEffect } from 'react';
import { Star, ShoppingCart, Check, X, Info } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { PRODUCTS as INITIAL_PRODUCTS, STORE_CONFIG } from '../data/config';

// =========================================================
// KONFIGURASI SANITY & LINK SHOPEE / TOKOPEDIA
// =========================================================
const SANITY_PROJECT_ID = 'qi4rocc0'; // Project ID Sanity Anda
const SANITY_DATASET = 'production';
const SANITY_URL = `https://${SANITY_PROJECT_ID}.api.sanity.io/v2024-01-01/data/query/${SANITY_DATASET}?query=`;

// 🧡 GANTI DENGAN LINK TOKO SHOPEE ANDA (SUDAH DEFAULT SEARCHING NAMA TOKO)
const MY_SHOPEE_URL = 'https://shopee.co.id/search?keyword=toko%20fitness%20surabaya';

// 🟢 GANTI DENGAN LINK TOKO TOKOPEDIA (Opsional)
const MY_TOKOPEDIA_URL = 'https://www.tokopedia.com/search?st=product&q=toko%20fitness%20surabaya';

// Nomor WhatsApp Toko
const WA_NUMBER = STORE_CONFIG.phone || '6281332345448';

// Format Rupiah
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

const FeaturedProducts = ({ activeCategory, onCategoryChange, isAdmin }: FeaturedProductsProps) => {
  const [products, setProducts] = useState<any[]>(INITIAL_PRODUCTS);
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // -----------------------------------------------------
  // AMBIL PRODUK DARI SANITY STUDIO
  // -----------------------------------------------------
  const fetchProductsFromSanity = async () => {
    try {
      setLoading(true);
      const query = encodeURIComponent(`*[_type == "product"] | order(_createdAt desc) {
        _id,
        name,
        price,
        description,
        specs,
        rating,
        reviews,
        tag,
        shopeeUrl,
        tokopediaUrl,
        "image": image.asset->url,
        "category": category->title
      }`);

      const response = await fetch(`${SANITY_URL}${query}`, { cache: 'no-store' });
      const data = await response.json();

      if (data?.result && data.result.length > 0) {
        const formatted = data.result.map((item: any, index: number) => ({
          id: item._id || index,
          name: item.name || 'Produk Fitness',
          price: item.price || 0,
          category: item.category || 'Umum',
          rating: item.rating || 5.0,
          reviews: item.reviews || 15,
          image: item.image || 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?q=80&w=800',
          description: item.description || '',
          specs: item.specs || '',
          tag: item.tag || '',
          // PAKSA TOMBOL MARKETPLACE MUNCUL:
          shopeeUrl: item.shopeeUrl || MY_SHOPEE_URL,
          tokopediaUrl: item.tokopediaUrl || MY_TOKOPEDIA_URL
        }));
        setProducts(formatted);
      } else {
        // Data Cadangan dari config lokal
        const savedProducts = localStorage.getItem('fitness_products');
        if (savedProducts && savedProducts !== "[]") {
          const parsed = JSON.parse(savedProducts).map((p: any) => ({
            ...p,
            shopeeUrl: p.shopeeUrl || MY_SHOPEE_URL,
            tokopediaUrl: p.tokopediaUrl || MY_TOKOPEDIA_URL
          }));
          setProducts(parsed);
        }
      }
    } catch (error) {
      console.error('Gagal mengambil data Sanity:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProductsFromSanity();
  }, []);

  const filteredProducts = activeCategory === 'Semua' 
    ? products 
    : products.filter(p => p.category?.toLowerCase() === activeCategory.toLowerCase());

  return (
    <section id="products" className={`py-24 bg-white relative ${isAdmin ? 'border-4 border-red-500/20' : ''}`}>
      
      {/* ================================================= */}
      {/* MODAL DETAIL PRODUK                              */}
      {/* ================================================= */}
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
              
              <div className="md:w-1/2 bg-gray-100 flex items-center justify-center">
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
                      {selectedProduct.description || 'Peralatan fitness berkualitas tinggi dengan standar komersial.'}
                    </p>
                  </div>
                  
                  <div>
                    <h4 className="font-bold text-gray-900 mb-2 flex items-center gap-2 border-b border-gray-100 pb-2">
                      <Check size={18} className="text-red-600" />
                      Spesifikasi Teknis
                    </h4>
                    <p className="text-gray-600 leading-relaxed whitespace-pre-wrap">
                      {selectedProduct.specs || 'Spesifikasi standar alat fitness komersial & home use.'}
                    </p>
                  </div>
                </div>

                {/* TOMBOL AKSI ORDER (WA, SHOPEE, TOKOPEDIA) */}
                <div className="mt-8 space-y-3">
                  <a 
                    href={`https://wa.me/${WA_NUMBER}?text=Halo ${STORE_CONFIG.name}, saya tertarik dengan produk *${selectedProduct.name}* seharga *${formatPrice(selectedProduct.price)}*. Apakah stok masih ada?`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full bg-green-500 hover:bg-green-600 text-white py-3.5 px-4 rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg transition-all"
                  >
                    <ShoppingCart size={18} />
                    Pesan via WhatsApp
                  </a>

                  <div className="grid grid-cols-2 gap-3">
                    <a 
                      href={selectedProduct.shopeeUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bg-[#EE4D2D] hover:bg-[#d73f1d] text-white py-3.5 px-3 rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg transition-all text-sm"
                    >
                      🧡 Shopee
                    </a>

                    <a 
                      href={selectedProduct.tokopediaUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bg-[#03AC0E] hover:bg-[#028A0B] text-white py-3.5 px-3 rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg transition-all text-sm"
                    >
                      💚 Tokopedia
                    </a>
                  </div>
                </div>

              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* HEADER SECTION */}
        <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-4">
          <div>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              {activeCategory === 'Semua' ? 'Produk Unggulan' : `Kategori: ${activeCategory}`}
            </h2>
            <p className="text-gray-600">Alat fitness dengan performa terbaik pilihan pelanggan kami.</p>
          </div>
          
          <div className="flex gap-3">
            <button 
              onClick={fetchProductsFromSanity}
              className="text-gray-700 bg-gray-100 hover:bg-gray-200 font-bold px-4 py-2 rounded-lg text-sm transition-colors flex items-center gap-2"
            >
              🔄 Refresh Data
            </button>

            {activeCategory !== 'Semua' && (
              <button 
                onClick={() => onCategoryChange('Semua')}
                className="text-red-600 font-bold hover:text-red-700 transition-colors flex items-center bg-red-50 px-4 py-2 rounded-lg text-sm"
              >
                Lihat Semua Produk <span className="ml-2">×</span>
              </button>
            )}
          </div>
        </div>

        {/* LOADING & GRID PRODUK */}
        {loading ? (
          <div className="text-center py-20 bg-gray-50 rounded-3xl">
            <p className="text-red-600 font-bold text-lg animate-pulse">⏳ Memuat katalog produk dari Sanity Studio...</p>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="text-center py-20 bg-gray-50 rounded-3xl border-2 border-dashed border-gray-200">
            <p className="text-gray-400 text-lg">Belum ada produk di kategori "{activeCategory}".</p>
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
                key={product.id || index}
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.05 }}
                viewport={{ once: true }}
                className="bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-2xl transition-all duration-300 group flex flex-col justify-between"
              >
                <div>
                  <div className="relative aspect-square overflow-hidden bg-gray-100">
                    <img 
                      src={product.image} 
                      alt={product.name} 
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    
                    {product.tag && (
                      <span className="absolute top-4 left-4 bg-red-600 text-white text-xs font-bold px-3 py-1 rounded-full shadow-md">
                        {product.tag}
                      </span>
                    )}

                    <button 
                      onClick={() => setSelectedProduct(product)}
                      className="absolute bottom-4 right-4 bg-white p-3 rounded-xl shadow-lg transform translate-y-12 group-hover:translate-y-0 opacity-0 group-hover:opacity-100 transition-all duration-300 hover:bg-red-600 hover:text-white"
                      title="Lihat Detail & Beli"
                    >
                      <ShoppingCart size={20} />
                    </button>
                  </div>
                  
                  <div className="p-6">
                    <div className="text-xs text-gray-500 font-medium mb-1 uppercase tracking-wider">{product.category}</div>
                    
                    <h3 className="font-bold text-gray-900 mb-2 truncate" title={product.name}>{product.name}</h3>
                    
                    <div className="flex items-center mb-4">
                      <div className="flex text-yellow-400">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} size={14} fill={i < Math.floor(product.rating || 5) ? "currentColor" : "none"} />
                        ))}
                      </div>
                      <span className="text-xs text-gray-400 ml-2">({product.reviews || 10})</span>
                    </div>

                    <p className="text-xs text-gray-500 line-clamp-2 mb-4">
                      {product.description || 'Peralatan fitness berkualitas tinggi dengan standar komersial & home use.'}
                    </p>
                  </div>
                </div>

                {/* FOOTER CARD: HARGA + TOMBOL MINI SHOPEE */}
                <div className="p-6 pt-0 space-y-2">
                  <div className="flex items-center justify-between border-t border-gray-100 pt-4">
                    <span className="text-lg font-bold text-red-600">{formatPrice(product.price)}</span>
                    <button 
                      onClick={() => setSelectedProduct(product)}
                      className="bg-gray-100 text-gray-900 px-3 py-2 rounded-lg hover:bg-red-600 hover:text-white transition-colors flex items-center gap-1 text-xs font-bold"
                    >
                      Detail
                    </button>
                  </div>

                  {/* TOMBOL MARKETPLACE MINI (DIPAKSA MUNCUL) */}
                  <div className="grid grid-cols-2 gap-2">
                    <a
                      href={product.shopeeUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bg-[#EE4D2D] hover:bg-[#d73f1d] text-white text-center py-2 rounded-lg text-xs font-bold transition-colors flex items-center justify-center gap-1"
                    >
                      🧡 Shopee
                    </a>
                    <a
                      href={product.tokopediaUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bg-[#03AC0E] hover:bg-[#028A0B] text-white text-center py-2 rounded-lg text-xs font-bold transition-colors flex items-center justify-center gap-1"
                    >
                      💚 Tokped
                    </a>
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
