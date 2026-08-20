import { useEffect, useState } from 'react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import Categories from './components/Categories';
import FeaturedProducts from './components/FeaturedProducts';
import WhyChooseUs from './components/WhyChooseUs';
import Testimonials from './components/Testimonials';
import Footer from './components/Footer';
import WhatsAppButton from './components/WhatsAppButton';
import {
  STORE_CONFIG as FALLBACK_CONFIG,
  CATEGORIES as FALLBACK_CATEGORIES,
  PRODUCTS as FALLBACK_PRODUCTS,
} from './data/config';
import {
  getStoreInfo,
  getAllCategories,
  getAllProducts,
} from './utils/sanity';

function App() {
  const [activeCategory, setActiveCategory] = useState('Semua');
  const [localIsAdmin, setLocalIsAdmin] = useState(false);

  const [storeConfig, setStoreConfig] = useState<any>(FALLBACK_CONFIG);
  const [categories, setCategories] = useState<any[]>(FALLBACK_CATEGORIES);
  const [products, setProducts] = useState<any[]>(FALLBACK_PRODUCTS);
  const [logo, setLogo] = useState(FALLBACK_CONFIG.logo);

  useEffect(() => {
    async function fetchSanityData() {
      // 1. Ambil Kategori dari Sanity (Mandiri)
      try {
        const catData = await getAllCategories();
        if (catData && catData.length > 0) {
          setCategories(
            catData.map((cat: any, index: number) => ({
              id: cat._id || index + 1,
              name: cat.name || 'Kategori',
              image: cat.image || '',
              description: cat.description || '',
            }))
          );
        }
      } catch (err) {
        console.error('Error fetching categories:', err);
      }

      // 2. Ambil Produk dari Sanity (Mandiri)
      try {
        const prodData = await getAllProducts();
        if (prodData && prodData.length > 0) {
          setProducts(
            prodData.map((p: any, index: number) => ({
              id: p._id || index + 1,
              name: p.name || 'Produk',
              price: p.price ?? 0,
              category: p.category || '',
              image: p.image || '',
              rating: p.rating ?? 5,
              description: p.description || '',
            }))
          );
        }
      } catch (err) {
        console.error('Error fetching products:', err);
      }

      // 3. Ambil Info Toko dari Sanity (Mandiri)
      try {
        const storeData = await getStoreInfo();
        if (storeData) {
          setStoreConfig((prev: any) => ({
            ...prev,
            name: storeData.name || prev.name,
            slogan: storeData.slogan || prev.slogan,
            phone: storeData.phone || prev.phone,
            email: storeData.email || prev.email,
            address: storeData.address || prev.address,
            logo: storeData.logo || prev.logo,
          }));
          if (storeData.logo) setLogo(storeData.logo);
        }
      } catch (err) {
        console.error('Error fetching store info:', err);
      }
    }

    fetchSanityData();
  }, []);

  const filteredProducts =
    activeCategory === 'Semua'
      ? products
      : products.filter((p) => p.category === activeCategory);

  return (
    <div className="min-h-screen bg-white">
      <Navbar
        logo={logo}
        storeConfig={storeConfig}
      />
      <Hero storeConfig={storeConfig} />
      <Categories
        categories={categories}
        activeCategory={activeCategory}
        setActiveCategory={setActiveCategory}
        localIsAdmin={localIsAdmin}
        setLocalIsAdmin={setLocalIsAdmin}
      />
      <FeaturedProducts
        products={filteredProducts}
        activeCategory={activeCategory}
      />
      <WhyChooseUs />
      <Testimonials />
      <Footer storeConfig={storeConfig} />
      <WhatsAppButton phone={storeConfig?.phone || FALLBACK_CONFIG.phone} />
    </div>
  );
}

export default App;
