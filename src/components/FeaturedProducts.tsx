import { useState, useEffect } from 'react';
import { ShoppingCart, X, Info, Star, ChevronLeft, ChevronRight, ExternalLink } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { STORE_CONFIG } from '../data/config';

const PROJECT_IDS = ['qi4rocc0', '856jrik3'];
const DATASET = 'production';

// LINK CADANGAN TOKO UTAMA
const SHOPEE_FALLBACK = 'https://shopee.co.id/search?keyword=toko%20fitness%20surabaya';

// FUNGSI PEMBERSIH LINK OTOMATIS
const fixLink = (url: any) => {
  if (!url || typeof url !== 'string') return '';
  const link = url.trim();
  if (!link) return '';

  if (!link.startsWith('http://') && !link.startsWith('https://')) {
    return 'https://' + link;
  }
  return link;
};

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
  const [globalShopee, setGlobalShopee] = useState<string>(
    fixLink((STORE_CONFIG as any)?.shopee) || SHOPEE_FALLBACK
  );

  const fetchProductsAndStore = async () => {
    setLoading(true);

    const storeQuery = encodeURIComponent(`*[_type in ["storeConfig","storeInfo","settings"]][0]{
      "shopee": coalesce(shopee, shopeeUrl, ""),
      "facebook": coalesce(facebook, "")
    }`);

    const productQuery = encodeURIComponent(`*[_type == "product"] | order(_createdAt desc) {
      _id, name, price, description, specs, tag, rating, reviews,
      shopeeUrl, shopee, order, sortOrder, urutan,
      "mainImage": coalesce(image.asset->url, foto.asset->url, photo.asset->url, ""),
      "galleryImages": coalesce(images[].asset->url, gallery[].asset->url, photos[].asset->url, []),
      "category": coalesce(category->title, category->name, category, "Umum")
    }`);

    for (const id of PROJECT_IDS) {
      try {
        const storeRes = await fetch(
          `https://${id}.api.sanity.io/v2024-01-01/data/query/${DATASET}?query=${storeQuery}`,
          { cache: 'no-store' }
        );
        const storeData = await storeRes.json();

        let foundShopee = storeData?.result?.shopee;
        const fbLink = storeData?.result?.facebook;

        if (!foundShopee && fbLink && (fbLink.includes('sh.ee') || fbLink.includes('shopee'))) {
          foundShopee = fbLink;
        }
        if (foundShopee) setGlobalShopee(fixLink(foundShopee) || SHOPEE_FALLBACK);

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

            const itemShopeeLink = fixLink(item.shopeeUrl || item.shopee);

            // LOGIKA CERDAS DETEKSI URUTAN:
            // 1. Cek jika ada field order/sortOrder/urutan
            // 2. Jika tidak ada, cek apakah kolom TAG diisi ANGKA (misal: "1", "2")
            let priorityNumber = 999;
            if (item.order !== undefined) priorityNumber = Number(item.order);
            else if (item.sortOrder !== undefined) priorityNumber = Number(item.sortOrder);
            else if (item.urutan !== undefined) priorityNumber = Number(item.urutan);
            else if (item.tag && !isNaN(Number(item.tag))) priorityNumber = Number(item.tag);

            return {
              id: item._id,
              name: item.name || 'Produk Fitness',
              price: item.price || 0,
              description: item.description || '',
              specs: item.specs || '',
              tag: isNaN(Number(item.tag)) ? item.tag : '', // Jika tag diisi angka, jangan tampilkan sebagai badge tag
              rating: item.rating || 5,
              reviews: item.reviews || 0,
              order: priorityNumber,
              images: allImages,
              category: item.category || 'Umum',
              shopeeUrl: itemShopeeLink
            };
          });

          // Urutkan angka terkecil (1, 2, 3...) di paling awal
          mappedProducts.sort((a: any, b: any) => 
