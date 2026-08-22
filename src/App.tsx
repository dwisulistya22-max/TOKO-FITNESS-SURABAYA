import React, { useState, useEffect } from 'react';
import { createClient } from '@sanity/client';

// =======================================================
// 1. DETEKSI PROJECT ID (Mendukung Vite & Create React App)
// =======================================================
// ⚠️ GANTI TEKS DI BAWAH DENGAN PROJECT ID SANITY ANDA JIKA PERLU!
const SANITY_PROJECT_ID = 
  (typeof process !== 'undefined' && process.env?.REACT_APP_SANITY_PROJECT_ID) ||
  (typeof import.meta !== 'undefined' && (import.meta as any).env?.VITE_SANITY_PROJECT_ID) ||
  's833x1z2'; // <-- JIKA ANDA PUNYA PROJECT ID, MASUKKAN DI SINI (Contoh: 's833x1z2')

const SANITY_DATASET = 'production';

// Inisialisasi Sanity Client
const sanityClient = createClient({
  projectId: SANITY_PROJECT_ID,
  dataset: SANITY_DATASET,
  useCdn: false, // Selalu ambil data terbaru
  apiVersion: '2024-01-01',
});

// =======================================================
// 2. TIPE DATA
// =======================================================
interface Category {
  _id: string;
  title: string;
  icon?: string;
}

interface Product {
  _id: string;
  name: string;
  price: number;
  description?: string;
  imageUrl?: string;
  category?: { _id: string; title: string };
}

interface StoreInfo {
  name?: string;
  description?: string;
  logoUrl?: string;
}

// =======================================================
// 3. KOMPONEN UTAMA
// =======================================================
export default function App() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [storeInfo, setStoreInfo] = useState<StoreInfo | null>(null);

  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [loading, setLoading] = useState<boolean>(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      setErrorMsg(null);

      // Query ke Sanity
      const storeQuery = `*[_type == "storeInfo" || _type == "settings"][0]{
        name, description, "logoUrl": logo.asset->url
      }`;
      const categoryQuery = `*[_type == "category"] | order(title asc) { _id, title, icon }`;
      const productQuery = `*[_type == "product"] | order(_createdAt desc) {
        _id, name, price, description,
        "imageUrl": image.asset->url,
        category->{ _id, title }
      }`;

      const [storeData, catData, prodData] = await Promise.all([
        sanityClient.fetch(storeQuery).catch(() => null),
        sanityClient.fetch(categoryQuery).catch(() => []),
        sanityClient.fetch(productQuery).catch(() => []),
      ]);

      if (storeData) setStoreInfo(storeData);
      if (Array.isArray(catData)) setCategories(catData);
      if (Array.isArray(prodData)) setProducts(prodData);

    } catch (err: any) {
      console.error('Sanity Error:', err);
      setErrorMsg(err?.message || 'Gagal terhubung ke Sanity Studio.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const filteredProducts = selectedCategory === 'all'
    ? products
    : products.filter((p) => p.category?._id === selectedCategory);

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f8fafc', fontFamily: 'sans-serif', color: '#1e293b', padding: '20px' }}>
      
      {/* TOMBOL REFRESH */}
      <div style={{ position: 'fixed', top: '16px', right: '16px', zIndex: 1000 }}>
        <button
          onClick={fetchData}
          style={{
            backgroundColor: '#0f172a',
            color: '#ffffff',
            border: 'none',
            padding: '10px 16px',
            borderRadius: '8px',
            cursor: 'pointer',
            fontWeight: 'bold',
            fontSize: '0.85rem'
          }}
        >
          🔄 Refresh Web
        </button>
      </div>

      <div style={{ maxWidth: '1000px', margin: '0 auto', paddingTop: '20px' }}>
        
        {/* HEADER / LOGO */}
        <header style={{ textAlign: 'center', marginBottom: '32px' }}>
          {storeInfo?.logoUrl && (
            <img
              src={storeInfo.logoUrl}
              alt="Logo Toko"
              style={{ width: '80px', height: '80px', objectFit: 'contain', borderRadius: '50%', marginBottom: '12px' }}
            />
          )}
          <h1 style={{ fontSize: '2rem', fontWeight: 'bold', margin: '0 0 8px 0' }}>
            {storeInfo?.name || 'Surabaya Fitness - Toko Alat Fitness'}
          </h1>
          <p style={{ color: '#64748b', margin: 0 }}>
            {storeInfo?.description || 'Katalog Resmi Alat Fitness Surabaya'}
          </p>
        </header>

        {/* NOTIFIKASI JIKA ADA ERROR */}
        {errorMsg && (
          <div style={{ backgroundColor: '#fef2f2', border: '1px solid #fca5a5', padding: '16px', borderRadius: '8px', color: '#991b1b', marginBottom: '24px' }}>
            <strong>⚠️ Perhatian:</strong> {errorMsg}
          </div>
        )}

        {/* KATEGORI */}
        <section style={{ marginBottom: '28px' }}>
          <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '8px' }}>
            <button
              onClick={() => setSelectedCategory('all')}
              style={{
                padding: '8px 16px',
                borderRadius: '20px',
                border: 'none',
                cursor: 'pointer',
                fontWeight: 600,
                backgroundColor: selectedCategory === 'all' ? '#2563eb' : '#e2e8f0',
                color: selectedCategory === 'all' ? '#ffffff' : '#475569',
              }}
            >
              Semua
            </button>

            {categories.map((cat) => (
              <button
                key={cat._id}
                onClick={() => setSelectedCategory(cat._id)}
                style={{
                  padding: '8px 16px',
                  borderRadius: '20px',
                  border: 'none',
                  cursor: 'pointer',
                  fontWeight: 600,
                  whiteSpace: 'nowrap',
                  backgroundColor: selectedCategory === cat._id ? '#2563eb' : '#e2e8f0',
                  color: selectedCategory === cat._id ? '#ffffff' : '#475569',
                }}
              >
                {cat.icon ? `${cat.icon} ` : ''}{cat.title}
              </button>
            ))}
          </div>
        </section>

        {/* DAFTAR PRODUK */}
        <section>
          {loading ? (
            <div style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>
              Memuat data dari Sanity...
            </div>
          ) : filteredProducts.length > 0 ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '20px' }}>
              {filteredProducts.map((item) => (
                <div
                  key={item._id}
                  style={{
                    backgroundColor: '#ffffff',
                    borderRadius: '12px',
                    overflow: 'hidden',
                    border: '1px solid #e2e8f0',
                    display: 'flex',
                    flexDirection: 'column'
                  }}
                >
                  <div style={{ height: '160px', backgroundColor: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {item.imageUrl ? (
                      <img src={item.imageUrl} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                      <span style={{ color: '#94a3b8', fontSize: '0.85rem' }}>📷 Tidak ada gambar</span>
                    )}
                  </div>
                  <div style={{ padding: '12px', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                    <div>
                      <h3 style={{ fontSize: '1rem', fontWeight: 'bold', margin: '0 0 6px 0' }}>{item.name}</h3>
                      <p style={{ fontSize: '0.8rem', color: '#64748b', margin: '0 0 8px 0' }}>{item.description || '-'}</p>
                    </div>
                    <div style={{ fontWeight: 'bold', color: '#16a34a', fontSize: '1rem' }}>
                      Rp {item.price ? item.price.toLocaleString('id-ID') : '0'}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '40px', color: '#94a3b8' }}>
              Belum ada produk untuk ditampilkan.
            </div>
          )}
        </section>

      </div>
    </div>
  );
}
