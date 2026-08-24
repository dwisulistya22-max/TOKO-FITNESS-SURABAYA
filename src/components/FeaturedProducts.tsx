import { useState, useEffect } from 'react';
import { ShoppingCart, X, Info, Star, ChevronLeft, ChevronRight, ExternalLink, ChevronDown, ChevronUp } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { STORE_CONFIG } from '../data/config';

const PROJECT_IDS = ['qi4rocc0', '856jrik3'];
const DATASET = 'production';

// 🎯 LINK LANGSUNG TOKO ANDA (TIDAK AKAN NYASAR KE TOKO LAIN)
const OFFICIAL_SHOPEE_URL = 'https://shopee.co.id/toko_fitness_surabaya';
const HOMEPAGE_LIMIT = 8;

const formatPrice = (price: number) =>
  new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0
  }).format(price || 0);

const FeaturedProducts = ({ activeCategory = 'Semua' }: any) => {
  const [products, setProducts] = useState<any[]>([]);
  const [selected, setSelected] = useState<any>(null);
  const [activeImgIndex, setActiveImgIndex] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [showAll, setShowAll] = useState(false);

  const fetchProductsAndStore = async () => {
    setLoading(true);

    const productQuery = encodeURIComponent(`*[_type == "product"] | order(_createdAt desc) {
      _id, name, price, description, specs, tag, rating, reviews,
      shopeeUrl, shopee, order, sortOrder, urutan,
      isFeatured, featured, isUnggulan, showOnHome,
      "mainImage": coalesce(image.asset->url, foto.asset->url, photo.asset->url, ""),
      "galleryImages": coalesce(images[].asset->url, gallery[].asset->url, photos[].asset->url, []),
      "category": coalesce(category->title, category->name, category, "Umum")
    }`);

    for (const id of PROJECT_IDS) {
      try {
        const prodRes = await fetch(
          `https://${id}.api.sanity.io/v2024-01-01/data/query/${DATASET}?query=${productQuery}`,
          { cache: 'no-store' }
        );
        const prodData = await prodRes.json();

        if (prodData?.result?.length) {
          const mappedProducts = prodData.result.map((item: any) => {
            const allImages: string[] = [];
            if (item.mainImage) allImages.push(item.mainImage);
            if (Array.isArray(item.galleryImages)) {
              item.galleryImages.forEach((img: string) => {
                if (img && !allImages.includes(img)) allImages.push(img);
              });
            }
            if (allImages.length === 0) {
              allImages.push('https://images.unsplash.com/photo-1517836357463-d25dfeac3438?q=80&w=800');
            }

            const tagUpper = String(item.tag || '').toUpperCase().trim();
            const isFeatured = Boolean(
              item.isFeatured ||
              item.featured ||
              item.isUnggulan ||
              item.showOnHome ||
              tagUpper === 'UNGGULAN' ||
              tagUpper === 'UTAMA' ||
              tagUpper === 'DEPAN' ||
              tagUpper === 'FEATURED' ||
              (!isNaN(Number(tagUpper)) && Number(tagUpper) > 0 && Number(tagUpper) <= 8)
            );

            let priorityNumber = 999;
            if (item.order !== undefined) priorityNumber = Number(item.order);
            else if (!isNaN(Number(tagUpper)) && Number(tagUpper) > 0) priorityNumber = Number(tagUpper);

            return {
              id: item._id,
              name: item.name || 'Produk Fitness',
              price: item.price || 0,
              description: item.description || '',
              specs: item.specs || '',
              tag: isNaN(Number(item.tag)) ? item.tag : '',
              rating: item.rating || 5,
              reviews: item.reviews || 0,
              order: priorityNumber,
              isFeatured,
              images: allImages,
              category: item.category || 'Umum',
              shopeeUrl: item.shopeeUrl || item.shopee || ''
            };
          });

          mappedProducts.sort((a: any, b: any) => a.order - b.order);
          setProducts(mappedProducts);
          break;
        }
      } catch (err) {
        console.error('Error fetching Sanity data:', err);
      }
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchProductsAndStore();
  }, []);

  useEffect(() => {
    setShowAll(false);
  }, [activeCategory]);

  const openDetail = (product: any) => {
    setSelected(product);
    setActiveImgIndex(0);
  };

  const categoryProducts =
    !activeCategory || activeCategory === 'Semua'
      ? products
      : products.filter(
          (p) => String(p.category).toLowerCase() === String(activeCategory).toLowerCase()
        );

  const featuredOnly = products.filter((p) => p.isFeatured);

  let displayProducts: any[] = [];
  if (activeCategory === 'Semua') {
    if (showAll) {
      displayProducts = products;
    } else {
      displayProducts =
        featuredOnly.length > 0
          ? featuredOnly.slice(0, HOMEPAGE_LIMIT)
          : products.slice(0, 4);
    }
  } else {
    displayProducts = categoryProducts;
  }

  const waNumber = (STORE_CONFIG.phone || '6281332345448').split(/[/,&\n]/)[0].replace(/\D/g, '');

  return (
    <section id="products" className="py-20 bg-white">
      {/* MODAL DETAIL PRODUK */}
      <AnimatePresence>
        {selected && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white w-full max-w-5xl rounded-3xl overflow-hidden shadow-2xl max-h-[94vh] flex flex-col md:flex-row relative"
            >
              <button
                type="button"
                onClick={() => setSelected(null)}
                className="absolute top-4 right-4 z-20 bg-white/90 p-2 rounded-full shadow-lg hover:bg-red-600 hover:text-white transition-all"
                aria-label="Tutup modal"
              >
                <X size={22} />
              </button>

              <div className="md:w-1/2 bg-gray-900 p-4 flex flex-col relative min-h-[350px]">
                <div className="relative w-full h-full rounded-2xl overflow-hidden bg-black flex items-center justify-center">
                  <img
                    src={selected.images[activeImgIndex]}
                    alt={selected.name}
                    className="w-full h-full object-contain transition-all"
                  />
                  {selected.images.length > 1 && (
                    <>
                      <button
                        type="button"
                        onClick={() =>
                          setActiveImgIndex((prev) =>
                            prev === 0 ? selected.images.length - 1 : prev - 1
                          )
                        }
                        className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 text-white p-2 rounded-full hover:bg-black/80"
                      >
                        <ChevronLeft size={20} />
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          setActiveImgIndex((prev) =>
                            prev === selected.images.length - 1 ? 0 : prev + 1
                          )
                        }
                        className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 text-white p-2 rounded-full hover:bg-black/80"
                      >
                        <ChevronRight size={20} />
                      </button>
                    </>
                  )}
                </div>
                {selected.images.length > 1 && (
                  <div className="flex gap-2 mt-3 overflow-x-auto pb-1 justify-center">
                    {selected.images.map((img: string, idx: number) => (
                      <img
                        key={idx}
                        src={img}
                        alt=""
                        onClick={() => setActiveImgIndex(idx)}
                        className={`w-14 h-14 rounded-lg object-cover cursor-pointer border-2 transition-all ${
                          activeImgIndex === idx
                            ? 'border-red-500 scale-105'
                            : 'border-transparent opacity-50 hover:opacity-100'
                        }`}
                      />
                    ))}
                  </div>
                )}
              </div>

              <div className="md:w-1/2 p-8 overflow-y-auto">
                <div className="text-xs font-bold text-red-600 uppercase tracking-widest mb-2">
                  {selected.category}
                </div>
                <h2 className="text-3xl font-bold text-gray-900 mb-3">{selected.name}</h2>
                <div className="text-2xl font-black text-red-600 mb-6">
                  {formatPrice(selected.price)}
                </div>

                <div className="mb-8 space-y-4">
                  <div>
                    <h4 className="font-bold flex items-center gap-2 mb-2 border-b pb-2 text-gray-900">
                      <Info size={18} className="text-red-600" /> Deskripsi
                    </h4>
                    <p className="text-gray-600 text-sm leading-relaxed whitespace-pre-wrap">
                      {selected.description || 'Peralatan fitness kualitas premium.'}
                    </p>
                  </div>
                  {selected.specs && (
                    <div className="bg-gray-50 p-4 rounded-xl">
                      <h4 className="font-bold text-gray-900 text-xs mb-2 uppercase">
                        Spesifikasi Teknis:
                      </h4>
                      <p className="text-gray-500 text-xs leading-relaxed whitespace-pre-wrap">
                        {selected.specs}
                      </p>
                    </div>
                  )}
                </div>

                <div className="space-y-3">
                  <a
                    href={`https://wa.me/${waNumber}?text=Halo, saya tertarik dengan produk *${encodeURIComponent(
                      selected.name
                    )}*`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full bg-green-500 hover:bg-green-600 text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-2 shadow-lg transition-colors"
                  >
                    <ShoppingCart size={20} /> Pesan via WhatsApp
                  </a>

                  {selected.shopeeUrl && selected.shopeeUrl.length > 5 && (
                    <a
                      href={selected.shopeeUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full bg-[#EE4D2D] hover:bg-[#d73211] text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-2 shadow-lg transition-colors"
                    >
                      🧡 Beli di Shopee Official <ExternalLink size={18} />
                    </a>
                  )}
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-12">
          <div>
            <h2 className="text-3xl md:text-5xl font-black text-gray-900 mb-3 uppercase tracking-tighter italic">
              Produk Pilihan
            </h2>
            <p className="text-gray-500">
              {activeCategory === 'Semua'
                ? 'Rekomendasi peralatan fitness pilihan terbaik.'
                : `Koleksi lengkap kategori ${activeCategory}`}
            </p>
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={fetchProductsAndStore}
              className="bg-gray-100 hover:bg-gray-200 px-5 py-2.5 rounded-xl text-sm font-bold transition-all flex items-center gap-2"
            >
              🔄 Refresh Data
            </button>
            <a
              href={OFFICIAL_SHOPEE_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-[#EE4D2D] text-white px-5 py-2.5 rounded-xl text-sm font-bold flex items-center gap-2 shadow-md hover:bg-[#d73211] transition-colors"
            >
              🧡 Shopee Mall
            </a>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-20 text-red-600 font-bold animate-pulse text-xl">
            ⏳ Menghubungkan ke Sanity Studio...
          </div>
        ) : (
          <>
            {/* GRID PRODUK RAPI DENGAN 1 TOMBOL BLACK "DETAIL & GALERI" */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {displayProducts.map((p: any) => (
                <div
                  key={p.id}
                  className="bg-white rounded-3xl border border-gray-100 overflow-hidden hover:shadow-2xl transition-all flex flex-col justify-between group"
                >
                  <div>
                    <div className="relative aspect-square bg-gray-50 overflow-hidden">
                      <img
                        src={p.images[0]}
                        alt={p.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                      />
                      {p.tag && (
                        <span className="absolute top-4 left-4 bg-red-600 text-white text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-tighter">
                          {p.tag}
                        </span>
                      )}
                      {p.images.length > 1 && (
                        <span className="absolute bottom-4 right-4 bg-black/60 text-white text-[10px] font-bold px-2.5 py-1 rounded-lg backdrop-blur-md">
                          📷 {p.images.length} FOTO
                        </span>
                      )}
                    </div>
                    <div className="p-6">
                      <div className="text-[10px] text-red-600 font-bold uppercase mb-1">
                        {p.category}
                      </div>
                      <h3 className="font-bold text-gray-900 mb-2 line-clamp-2 leading-tight h-10">
                        {p.name}
                      </h3>
                      <div className="flex items-center gap-1 text-yellow-400 mb-3">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} size={12} fill={i < (p.rating || 5) ? 'currentColor' : 'none'} />
                        ))}
                        <span className="text-gray-400 text-[10px] ml-1">({p.reviews || '12+'})</span>
                      </div>
                      <div className="text-xl font-black text-red-600">{formatPrice(p.price)}</div>
                    </div>
                  </div>

                  <div className="p-6 pt-0">
                    <button
                      type="button"
                      onClick={() => openDetail(p)}
                      className="w-full bg-gray-900 hover:bg-red-600 text-white py-3 rounded-xl text-xs font-bold transition-all shadow-md"
                    >
                      Detail & Galeri
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* TOMBOL BUKA / TUTUP KATALOG */}
            {activeCategory === 'Semua' && products.length > displayProducts.length && (
              <div className="text-center mt-12">
                <button
                  type="button"
                  onClick={() => setShowAll(!showAll)}
                  className="inline-flex items-center gap-2 bg-gray-900 hover:bg-red-600 text-white px-8 py-4 rounded-2xl text-sm font-bold transition-all shadow-xl hover:shadow-red-600/30 transform hover:-translate-y-0.5"
                >
                  {showAll ? (
                    <>
                      Tampilkan Produk Pilihan Saja <ChevronUp size={18} />
                    </>
                  ) : (
                    <>
                      Lihat Semua Katalog Produk ({products.length} Barang) <ChevronDown size={18} />
                    </>
                  )}
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </section>
  );
};

export default FeaturedProducts;
