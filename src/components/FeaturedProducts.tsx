import { useState, useEffect } from 'react';
import { Star, ShoppingCart, Check, X, Info } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { PRODUCTS as INITIAL_PRODUCTS, STORE_CONFIG } from '../data/config';

// KONFIGURASI PROJECT ID YANG SESUAI SCREENSHOT ANDA
const SANITY_PROJECT_ID = 'qi4rocc0'; 
const SANITY_DATASET = 'production';
const SANITY_URL = `https://${SANITY_PROJECT_ID}.api.sanity.io/v2024-01-01/data/query/${SANITY_DATASET}?query=`;

const formatPrice = (price: number) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency', currency: 'IDR', minimumFractionDigits: 0
  }).format(price);
};

const FeaturedProducts = ({ activeCategory, onCategoryChange, isAdmin }: any) => {
  const [products, setProducts] = useState<any[]>(INITIAL_PRODUCTS);
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      // Query GROQ: Mengambil data yang sudah di-publish
      const query = encodeURIComponent(`*[_type == "product" && !(_id in path("drafts.**"))] | order(_createdAt desc) {
        _id, name, price, description, specs, tag, shopeeUrl, tokopediaUrl,
        "image": image.asset->url, "category": category->title
      }`);

      const response = await fetch(`${SANITY_URL}${query}`, { cache: 'no-store' });
      const data = await response.json();

      if (data?.result && data.result.length > 0) {
        setProducts(data.result.map((item: any) => ({
          ...item,
          shopeeUrl: item.shopeeUrl || 'https://shopee.co.id/search?keyword=toko%20fitness%20surabaya',
          tokopediaUrl: item.tokopediaUrl || 'https://tokopedia.com'
        })));
      }
    } catch (error) {
      console.error('Koneksi Sanity Error:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const filtered = activeCategory === 'Semua' 
    ? products 
    : products.filter(p => p.category?.toLowerCase() === activeCategory.toLowerCase());

  return (
    <section id="products" className="py-24 bg-white">
      <AnimatePresence>
        {selectedProduct && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="bg-white w-full max-w-4xl rounded-3xl overflow-hidden shadow-2xl relative max-h-[90vh] flex flex-col md:flex-row">
              <button onClick={() => setSelectedProduct(null)} className="absolute top-4 right-4 z-10 bg-white/80 p-2 rounded-full hover:bg-red-600 hover:text-white transition-all"><X size={24} /></button>
              <div className="md:w-1/2 bg-gray-100 flex items-center justify-center">
                <img src={selectedProduct.image} alt={selectedProduct.name} className="w-full h-full object-cover" />
              </div>
              <div className="md:w-1/2 p-8 overflow-y-auto">
                <div className="text-sm text-red-600 font-bold uppercase mb-2">{selectedProduct.category}</div>
                <h2 className="text-3xl font-bold mb-4">{selectedProduct.name}</h2>
                <div className="text-2xl font-black text-red-600 mb-6">{formatPrice(selectedProduct.price)}</div>
                <div className="space-y-6">
                  <div>
                    <h4 className="font-bold mb-2 flex items-center gap-2 border-b pb-2"><Info size={18} className="text-red-600" /> Deskripsi</h4>
                    <p className="text-gray-600 italic">{selectedProduct.description || 'Peralatan fitness berkualitas tinggi.'}</p>
                  </div>
                </div>
                <div className="mt-8 space-y-3">
                  <a href={`https://wa.me/6281235907956?text=Saya%20tertarik%20${selectedProduct.name}`} target="_blank" className="w-full bg-green-500 hover:bg-green-600 text-white py-4 rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg transition-all"><ShoppingCart size={20} /> Pesan via WhatsApp</a>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between items-end mb-12">
          <div>
            <h2 className="text-4xl font-bold mb-4">Produk Unggulan</h2>
            <button onClick={fetchProducts} className="text-red-600 font-bold text-sm flex items-center gap-2 bg-red-50 px-3 py-1 rounded-lg hover:bg-red-100 transition-all">🔄 Refresh Data Baru</button>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-20"><p className="text-red-600 font-bold animate-pulse">⏳ Memuat barang dari Sanity Studio...</p></div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {filtered.map((product: any) => (
              <div key={product._id} className="bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-2xl transition-all group flex flex-col justify-between">
                <div>
                  <div className="relative aspect-square overflow-hidden bg-gray-100">
                    <img src={product.image} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                    {product.tag && <span className="absolute top-4 left-4 bg-red-600 text-white text-[10px] font-bold px-3 py-1 rounded-full">{product.tag}</span>}
                  </div>
                  <div className="p-6">
                    <div className="text-[10px] text-gray-500 font-bold uppercase mb-1">{product.category}</div>
                    <h3 className="font-bold text-gray-900 mb-2 truncate">{product.name}</h3>
                    <div className="text-lg font-black text-red-600 mb-4">{formatPrice(product.price)}</div>
                  </div>
                </div>
                <div className="p-6 pt-0 flex gap-2">
                  <button onClick={() => setSelectedProduct(product)} className="w-full bg-gray-900 text-white py-2 rounded-lg font-bold text-xs hover:bg-red-600 transition-all">Detail & Beli</button>
                  <a href={product.shopeeUrl} target="_blank" className="bg-[#EE4D2D] text-white px-3 py-2 rounded-lg font-bold text-[10px] flex items-center">SHOPEE</a>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default FeaturedProducts;
