import { useState, useEffect } from 'react';
import { Star, ShoppingCart, Check, X, Info, ExternalLink } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { PRODUCTS as INITIAL_PRODUCTS, STORE_CONFIG } from '../data/config';

const SANITY_PROJECT_ID = 'qi4rocc0';
const SANITY_DATASET = 'production';
const SANITY_URL = `https://${SANITY_PROJECT_ID}.api.sanity.io/v2024-01-01/data/query/${SANITY_DATASET}?query=`;

// 🧡 LINK TOKO SHOPEE ANDA (Silakan ganti link ini dengan link asli toko Anda)
const MY_SHOPEE_URL = 'https://shopee.co.id/search?keyword=toko%20fitness%20surabaya';

const formatPrice = (price: number) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency', currency: 'IDR', minimumFractionDigits: 0
  }).format(price);
};

const FeaturedProducts = ({ activeCategory, onCategoryChange, isAdmin }: any) => {
  const [products, setProducts] = useState<any[]>(INITIAL_PRODUCTS);
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const query = encodeURIComponent(`*[_type == "product"] | order(_createdAt desc) {
          _id, name, price, description, specs, tag, shopeeUrl,
          "image": image.asset->url, "category": category->title
        }`);
        const response = await fetch(`${SANITY_URL}${query}`, { cache: 'no-store' });
        const data = await response.json();
        if (data?.result) {
          setProducts(data.result.map((item: any) => ({
            ...item,
            // PAKSA LINK SHOPEE: Jika di Sanity kosong, arahkan ke link toko utama
            shopeeUrl: item.shopeeUrl || MY_SHOPEE_URL 
          })));
        }
      } catch (error) { console.error(error); } 
      finally { setLoading(false); }
    };
    fetchProducts();
  }, []);

  const filtered = activeCategory === 'Semua' ? products : products.filter(p => p.category === activeCategory);
