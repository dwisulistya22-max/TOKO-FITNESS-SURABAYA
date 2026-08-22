import { useState, useEffect } from 'react';
import { ShoppingCart, X, Info } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// CONFIG LANGSUNG KE PROJECT ANDA
const PROJECT_ID = 'qi4rocc0';
const DATASET = 'production';
const QUERY = encodeURIComponent(`*[_type == "product"] | order(_createdAt desc) {
  _id, name, price, description, specs, tag, shopeeUrl,
  "image": image.asset->url, "category": category->title
}`);
const URL = `https://${PROJECT_ID}.api.sanity.io/v2021-10-21/data/query/${DATASET}?query=${QUERY}`;

const formatPrice = (price: number) => {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(price);
};

const FeaturedProducts = () => {
  const [products, setProducts] = useState<any[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const fetchNow = () => {
    setLoading(true);
    fetch(URL, { cache: 'no-store' })
      .then(res => res.json())
      .then(data => {
        if (data.result) {
          setProducts(data.result);
        }
        setLoading(false);
      })
      .catch(() => {
        setError(true);
        setLoading(false);
      });
  };

  useEffect(() => { fetchNow(); }, []);

  return (
    <section id="products" className="py-20 bg-white">
      {/* MODAL DETAIL */}
      <AnimatePresence>
        {selectedProduct && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="bg-white w-full max-w-4xl rounded-3xl overflow-hidden shadow-2xl relative max-h-[90vh] flex flex-col md:flex-row">
              <button onClick={() => setSelectedProduct(null)} className="absolute top-4 right-4 z-10 bg-white/80 p-2 rounded-full hover:bg-red-600 transition-all"><X size={24} /></button>
              <div className="md:w-1/2 bg-gray-100 flex items-center justify-center">
                <img src={selectedProduct.image} className="w-full h-full object-cover" />
              </div>
              <div className="md:w-1/2 p-8 overflow-y-auto">
                <div className="text-sm text-red-600 font-bold uppercase mb-2">{selectedProduct.category}</div>
                <h2 className="text-3xl font-bold mb-4">{selectedProduct.name}</h2>
                <div className="text-2xl font-black text-red-600 mb-6">{formatPrice(selectedProduct.price)}</div>
                <div className="space-y-4">
                   <h4 className="font-bold flex items-center gap-2 border-b pb-2"><Info size={18} /> Deskripsi</h4>
                   <p className="text-gray-600">{selectedProduct.description || 'Peralatan fitness berkualitas.'}</p>
                </div>
                <a href={`https://wa.me/6281235907956?text=Halo, saya tertarik ${selectedProduct.name}`} target="_blank" className="mt-8 w-full bg-green-500 hover:bg-green-600 text-white py-4 rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg transition-all"><ShoppingCart size={20} /> Pesan via WhatsApp</a>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between items-center mb-12">
          <h2 className="text-3xl font-black uppercase tracking-tighter">Produk Terbaru</h2>
          <button onClick={fetchNow} className="bg-gray-100 hover:bg-gray-200 px-4 py-2 rounded-lg font-bold text-sm transition-all">🔄 Muat Ulang Data</button>
        </div>

        {loading ? (
          <div className="text-center py-20"><p className="text-red-600 font-bold animate-pulse text-xl">Sedang mengambil data dari Sanity Studio...</p></div>
        ) : products.length === 0 ? (
          <div className="text-center py-20 bg-gray-50 rounded-3xl border-2 border-dashed border-gray-200">
             <p className="text-gray-500 text-lg mb-4">Ups! Sanity Studio Anda terdeteksi masih kosong.</p>
             <p className="text-sm text-gray-400">Pastikan Anda sudah menambah Produk di Sanity dan menekan tombol <b>Publish (Warna Hijau)</b>.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {products.map((product: any) => (
              <div key={product._id} className="bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-2xl transition-all group flex flex-col">
                <div className="relative aspect-square overflow-hidden bg-gray-100">
                  <img src={product.image} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                  {product.tag && <span className="absolute top-4 left-4 bg-red-600 text-white text-[10px] font-black px-3 py-1 rounded-full uppercase">{product.tag}</span>}
                </div>
                <div className="p-5 flex-1 flex flex-col justify-between">
                  <div>
                    <div className="text-[10px] text-gray-400 font-bold uppercase mb-1">{product.category}</div>
                    <h3 className="font-bold text-gray-900 mb-2 leading-tight">{product.name}</h3>
                    <div className="text-lg font-black text-red-600 mb-4">{formatPrice(product.price)}</div>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => setSelectedProduct(product)} className="flex-1 bg-gray-900 text-white py-2.5 rounded-xl font-bold text-xs hover:bg-red-600 transition-all">Detail & Beli</button>
                    {product.shopeeUrl && (
                       <a href={product.shopeeUrl} target="_blank" className="bg-[#EE4D2D] text-white px-3 py-2.5 rounded-xl font-bold text-[10px] flex items-center">SHOPEE</a>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
        
        {error && <p className="text-center text-red-500 mt-10">Koneksi internet bermasalah atau Project ID Sanity salah.</p>}
      </div>
    </section>
  );
};

export default FeaturedProducts;
