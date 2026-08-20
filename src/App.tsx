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
  const [isAdmin, setIsAdmin] = useState(false);
  const [localIsAdmin, setLocalIsAdmin] = useState(false);
  const [showAdminPanel, setShowAdminPanel] = useState(false);

  const [storeConfig, setStoreConfig] = useState<any>(FALLBACK_CONFIG);
  const [categories, setCategories] = useState<any[]>(FALLBACK_CATEGORIES);
  const [products, setProducts] = useState<any[]>(FALLBACK_PRODUCTS);
  const [logo, setLogo] = useState(FALLBACK_CONFIG.logo);

  useEffect(() => {
    async function fetchSanityData() {
      try {
        console.log('Fetching data from Sanity...');

        const [categoriesData, productsData, storeData] = await Promise.all([
          getAllCategories(),
          getAllProducts(),
          getStoreInfo(),
        ]);

        console.log('Sanity categories:', categoriesData);
        console.log('Sanity products:', productsData);

        if (categoriesData && categoriesData.length > 0) {
          setCategories(
            categoriesData.map((cat: any, index: number) => ({
              id: cat._id || index + 1,
              name: cat.name || 'Kategori',
              image: cat.image || '',
              description: cat.description || '',
            }))
          );
          console.log('Categories UPDATED from Sanity!', categoriesData.length);
        }

        if (productsData && productsData.length > 0) {
          setProducts(
            productsData.map((p: any, index: number) => ({
              id: p._id || index + 1,
              name: p.name || 'Produk',
              price: p.price ?? 0,
              category: p.category || '',
              image: p.image || '',
              rating: p.rating ?? 5,
              description: p.description || '',
            }))
          );
          console.log('Products UPDATED from Sanity!', productsData.length);
        }

        if (storeData) {
          setStoreConfig({
            ...FALLBACK_CONFIG,
            name: storeData.name || FALLBACK_CONFIG.name,
            slogan: storeData.slogan || FALLBACK_CONFIG.slogan,
            phone: storeData.phone || FALLBACK_CONFIG.phone,
            email: storeData.email || FALLBACK_CONFIG.email,
            address: storeData.address || FALLBACK_CONFIG.address,
            logo: storeData.logo || FALLBACK_CONFIG.logo,
          });
          if (storeData.logo) setLogo(storeData.logo);
        }
      } catch (err) {
        console.error('Error fetching Sanity:', err);
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
