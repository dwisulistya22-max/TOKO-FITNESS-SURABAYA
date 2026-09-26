import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { findProductByRequest, updateProductUrl } from './utils/productSearch';

const PROJECT_IDS = ['qi4rocc0', '856jrik3'];
const DATASET = 'production';
const PRODUCT_QUERY = encodeURIComponent(`*[_type == "product"] | order(_createdAt desc) {
  _id, name, title, nama, price, description, specs, tag, rating, reviews,
  shopeeUrl, shopee, order, sortOrder, urutan,
  isFeatured, featured, isUnggulan, showOnHome,
  "mainImage": coalesce(image.asset->url, foto.asset->url, photo.asset->url, gambar.asset->url, ""),
  "galleryImages": coalesce(images[].asset->url, gallery[].asset->url, photos[].asset->url, []),
  "category": coalesce(category->title, category->name, kategori->title, kategori->name, category, kategori, "Umum")
}`);

export type CatalogProduct = {
  id: string;
  name: string;
  price: number;
  description: string;
  specs: string;
  tag: string;
  rating: number;
  reviews: number;
  order: number;
  isFeatured: boolean;
  images: string[];
  category: string;
  shopeeUrl: string;
};

type CatalogContextValue = {
  products: CatalogProduct[];
  loading: boolean;
  error: string;
  reload: () => void;
  selected: CatalogProduct | null;
  highlightId: string | null;
  focusToken: number;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  openProduct: (product: Partial<CatalogProduct> & { _id?: string }, query?: string) => void;
  isStrayClick: () => boolean;
  closeProduct: () => void;
  clearSearch: () => void;
};

const CatalogContext = createContext<CatalogContextValue | null>(null);

const textValue = (value: unknown) => {
  if (typeof value === 'string' || typeof value === 'number') return String(value);
  if (value && typeof value === 'object') {
    const record = value as { title?: string; name?: string; nama?: string };
    return String(record.title || record.name || record.nama || '');
  }
  return '';
};

export const mapCatalogProduct = (item: any): CatalogProduct => {
  const images: string[] = [];
  const pushImage = (url: unknown) => {
    if (typeof url === 'string' && url && !images.includes(url)) images.push(url);
  };
  pushImage(item?.mainImage);
  pushImage(item?.image);
  if (Array.isArray(item?.galleryImages)) item.galleryImages.forEach(pushImage);
  if (Array.isArray(item?.images)) item.images.forEach(pushImage);
  if (images.length === 0) {
    images.push('https://images.unsplash.com/photo-1517836357463-d25dfeac3438?q=80&w=800');
  }

  const rating = Number(item?.rating || 5);
  return {
    id: String(item?._id || item?.id || item?.name || images[0]),
    name: textValue(item?.name) || textValue(item?.title) || textValue(item?.nama) || 'Produk Fitness',
    price: Number(item?.price) || 0,
    description: textValue(item?.description),
    specs: textValue(item?.specs),
    tag: textValue(item?.tag),
    rating,
    reviews: Number(item?.reviews) || 0,
    order: item?.order !== undefined ? Number(item.order) : 999,
    isFeatured: Boolean(rating >= 5 || item?.isFeatured || item?.featured || item?.isUnggulan),
    images,
    category: textValue(item?.category) || 'Umum',
    shopeeUrl: textValue(item?.shopeeUrl) || textValue(item?.shopee),
  };
};

const resolveProduct = (products: CatalogProduct[], raw: Partial<CatalogProduct> & { _id?: string }) => {
  const requestedId = raw.id || raw._id;
  return (
    findProductByRequest(products, { id: requestedId, name: raw.name }) ||
    (raw.name || requestedId ? mapCatalogProduct({ ...raw, _id: requestedId, id: requestedId }) : null)
  );
};

export function CatalogProvider({ children }: { children: React.ReactNode }) {
  const [products, setProducts] = useState<CatalogProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selected, setSelected] = useState<CatalogProduct | null>(null);
  const [highlightId, setHighlightId] = useState<string | null>(null);
  const [focusToken, setFocusToken] = useState(0);
  const [searchQuery, setSearchQueryState] = useState('');
  const [reloadKey, setReloadKey] = useState(0);
  const appliedUrlProduct = useRef(false);
  const strayClickLock = useRef(0);

  const reload = useCallback(() => setReloadKey((value) => value + 1), []);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const query = (params.get('q') || params.get('cari') || '').trim();
    if (query) setSearchQueryState(query);
  }, []);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      setLoading(true);
      setError('');
      let found = false;

      for (const id of PROJECT_IDS) {
        try {
          const response = await fetch(
            `https://${id}.api.sanity.io/v2024-01-01/data/query/${DATASET}?query=${PRODUCT_QUERY}`,
            { cache: 'no-store' }
          );
          const data = await response.json();
          if (cancelled) return;
          if (Array.isArray(data?.result) && data.result.length > 0) {
            const mapped = data.result.map(mapCatalogProduct).sort((a: CatalogProduct, b: CatalogProduct) => a.order - b.order);
            setProducts(mapped);
            found = true;
            break;
          }
        } catch (err) {
          console.error(err);
        }
      }

      if (!cancelled) {
        if (!found) setError('Katalog belum berhasil dimuat. Coba muat ulang.');
        setLoading(false);
      }
    };

    load();
    return () => {
      cancelled = true;
    };
  }, [reloadKey]);

  useEffect(() => {
    if (appliedUrlProduct.current || loading || products.length === 0) return;
    appliedUrlProduct.current = true;
    const productId = (new URLSearchParams(window.location.search).get('produk') || '').trim();
    if (!productId) return;
    const product = products.find((item) => item.id === productId);
    if (!product) return;
    setSelected(product);
    setHighlightId(product.id);
    setFocusToken((value) => value + 1);
  }, [loading, products]);

  const setSearchQuery = useCallback((query: string) => {
    setSearchQueryState(query);
    setSelected(null);
    setHighlightId(null);
    updateProductUrl({ q: query.trim() || null, produk: null });
  }, []);

  const openProduct = useCallback((raw: Partial<CatalogProduct> & { _id?: string }, query?: string) => {
    const requestedId = raw.id || raw._id;
    const direct = products.find((item) => item === raw || item.id === requestedId);
    const product = direct || resolveProduct(products, raw);
    if (!product) return;
    strayClickLock.current = Date.now() + 700;
    const nextQuery = query !== undefined ? query : searchQuery;
    if (query !== undefined) setSearchQueryState(query);
    setSelected(product);
    setHighlightId(product.id);
    setFocusToken((value) => value + 1);
    updateProductUrl({
      q: nextQuery.trim() || null,
      produk: product.id,
    });
  }, [products, searchQuery]);

  const isStrayClick = useCallback(() => Date.now() < strayClickLock.current, []);

  const closeProduct = useCallback(() => {
    setSelected(null);
    updateProductUrl({ produk: null });
  }, []);

  const clearSearch = useCallback(() => {
    setSearchQueryState('');
    setHighlightId(null);
    setSelected(null);
    updateProductUrl({ q: null, produk: null });
  }, []);

  const value = useMemo(() => ({
    products,
    loading,
    error,
    reload,
    selected,
    highlightId,
    focusToken,
    searchQuery,
    setSearchQuery,
    openProduct,
    isStrayClick,
    closeProduct,
    clearSearch,
  }), [products, loading, error, reload, selected, highlightId, focusToken, searchQuery, setSearchQuery, openProduct, isStrayClick, closeProduct, clearSearch]);

  return <CatalogContext.Provider value={value}>{children}</CatalogContext.Provider>;
}

export const useCatalog = () => {
  const catalog = useContext(CatalogContext);
  if (!catalog) throw new Error('useCatalog harus dipakai di dalam CatalogProvider');
  return catalog;
};
