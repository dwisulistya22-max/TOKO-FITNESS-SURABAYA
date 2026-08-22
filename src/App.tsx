import React, { useState, useEffect } from 'react';
import { createClient } from '@sanity/client';

// =======================================================
// 1. KONFIGURASI SANITY CLIENT (PERBAIKAN CACHE)
// =======================================================
export const sanityClient = createClient({
  projectId: process.env.REACT_APP_SANITY_PROJECT_ID || 'PROJ_ID_ANDA', // Pastikan ID ini benar
  dataset: process.env.REACT_APP_SANITY_DATASET || 'production',
  useCdn: false, // ⚠️ WAJIB FALSE agar perubahan di Sanity langsung tampil tanpa nunggu cache!
  apiVersion: '2024-01-01',
});

// =======================================================
// 2. TIPE DATA (TYPESCRIPT)
// =======================================================
interface Category {
  _id: string;
  title: string;
  slug?: { current: string };
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
  whatsapp?: string;
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

  // ----------------------------------------------------
  // FUNGSI UNTUK MENGAMBIL SEMUA DATA TERBARU DARI SANITY
  // ----------------------------------------------------
  const fetchData = async () => {
    try {
      setLoading(true);

      // 1. Query Info Toko & LOGO (Diambil URL gambarnya secara spesifik)
      const storeQuery = `*[_type == "storeInfo" || _type == "settings"][0]{
        name,
        description,
        whatsapp,
        "logoUrl": logo.asset->url
      }`;

      // 2. Query Kategori
      const categoryQuery = `*[_type == "category"] | order(title asc) {
        _id,
        title,
        icon
      }`;

      // 3. Query Produk & GAMBAR PRODUK (Diambil URL gambarnya secara spesifik)
      const productQuery = `*[_type == "product"] | order(_createdAt desc) {
        _id,
        name,
        price,
        description,
        "imageUrl": image.asset->url,
        category->{ _id, title }
      }`;

      // Eksekusi semua query secara bersamaan
      const [storeData, catData, prodData] = await Promise.all([
        sanityClient.fetch(storeQuery),
        sanityClient.fetch(categoryQuery),
        sanityClient.fetch(productQuery),
      ]);

      if (storeData) setStoreInfo(storeData);
      if (catData) setCategories(catData);
      if (prodData) setProducts(prodData);

    } catch (error) {
      console.error('Gagal mengambil data dari Sanity:', error);
    } finally {
      setLoading(false);
    }
  };

  // Jalankan saat pertama kali web dibuka
  useEffect(() => {
    fetchData();
  }, []);

  // Filter produk berdasarkan kategori
  const filteredProducts = selectedCategory === 'all'
    ? products
    : products.filter((p) => p.category?._id === selectedCategory);

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f8fafc', fontFamily: 'Segoe UI, Roboto, sans-serif', color: '#1e293b' }}>
      
      {/* 🔐 TOMBOL ADMIN & REFRESH (Pojok Kanan Atas) */}
      <div style={{ position: 'fixed', top: '16px', right: '16px', zIndex: 1000, display: 'flex', gap: '8px' }}>
        <button
          onClick={fetchData}
          title="Klik untuk memuat ulang data terbaru"
          style={{
            backgroundColor: '#ffffff',
            border: '1px solid #cbd5e1',
            padding: '8px 12px',
            borderRadius: '8px',
            cursor: 'pointer',
            fontWeight: 600,
            fontSize: '0.85rem',
            boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
          }}
        >
          🔄 Refresh
        </button>

        {/* Ganti URL di bawah ini dengan URL Sanity Studio Anda jika sudah di-deploy */}
        <a
          href="https://toko-saya.sanity.studio" 
          target="_blank"
          rel="noopener noreferrer"
          style={{
            backgroundColor: '#0f172a',
            color: '#ffffff',
            padding: '8px 14px',
            borderRadius: '8px',
            textDecoration: 'none',
            fontWeight: 600,
            fontSize: '0.85rem',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
          }}
        >
          🔐 Admin Panel
        </a>
      </div>

      <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '40px 20px' }}>
        
        {/* ================= HEADER & LOGO ================= */}
        <header style={{ textAlign: 'center', marginBottom: '40px' }}>
          {storeInfo?.logoUrl && (
            <img
              src={storeInfo.logoUrl}
              alt="Logo Toko"
              style={{
                width: '90px',
                height: '90px',
                objectFit: 'contain',
                borderRadius: '50%',
                marginBottom: '16px',
                backgroundColor: '#ffffff',
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                padding: '4px'
              }}
            />
          )}
          <h1 style={{ fontSize: '2.2rem', fontWeight: 800, margin: '0 0 8px 0', color: '#0f172a' }}>
            {storeInfo?.name || 'Katalog Toko Online'}
          </h1>
          <p style={{ fontSize: '1rem', color: '#64748b', margin: 0, maxWidth: '600px', marginInline: 'auto' }}>
            {storeInfo?.description || 'Selamat datang di katalog produk kami.'}
          </p>
        </header>

        {/* ================= DAFTAR KATEGORI ================= */}
        <section style={{ marginBottom: '32px' }}>
          <div style={{ display: 'flex', gap: '10px', overflowX: 'auto', paddingBottom: '10px' }}>
            <button
              onClick={() => setSelectedCategory('all')}
              style={{
                padding: '10px 20px',
                borderRadius: '30px',
                border: 'none',
                cursor: 'pointer',
                fontWeight: 600,
                backgroundColor: selectedCategory === 'all' ? '#2563eb' : '#e2e8f0',
                color: selectedCategory === 'all' ? '#ffffff' : '#475569',
                transition: '0.2s'
              }}
            >
              Semua
            </button>

            {categories.map((cat) => (
              <button
                key={cat._id}
                onClick={() => setSelectedCategory(cat._id)}
                style={{
                  padding: '10px 20px',
                  borderRadius: '30px',
                  border: 'none',
                  cursor: 'pointer',
                  fontWeight: 600,
                  whiteSpace: 'nowrap',
                  backgroundColor: selectedCategory === cat._id ? '#2563eb' : '#e2e8f0',
                  color: selectedCategory === cat._id ? '#ffffff' : '#475569',
                  transition: '0.2s'
                }}
              >
                {cat.icon ? `${cat.icon} ` : ''}{cat.title}
              </button>
            ))}
          </div>
        </section>

        {/* ================= DAFTAR PRODUK ================= */}
        <section>
          {loading ? (
            <div style={{ textAlign: 'center', padding: '50px 0', color: '#64748b' }}>
              Memuat data terbaru...
            </div>
          ) : filteredProducts.length > 0 ? (
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
              gap: '24px'
            }}>
              {filteredProducts.map((item) => (
                <div
                  key={item._id}
                  style={{
                    backgroundColor: '#ffffff',
                    borderRadius: '16px',
                    overflow: 'hidden',
                    boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)',
                    border: '1px solid #f1f5f9',
                    display: 'flex',
                    flexDirection: 'column'
                  }}
                >
                  <div style={{ height: '180px', backgroundColor: '#f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {item.imageUrl ? (
                      <img
                        src={item.imageUrl}
                        alt={item.name}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      />
                    ) : (
                      <span style={{ color: '#94a3b8', fontSize: '0.85rem' }}>📷 Tidak ada gambar</span>
                    )}
                  </div>
                  <div style={{ padding: '16px', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                    <div>
                      <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#2563eb', textTransform: 'uppercase' }}>
                        {item.category?.title || 'Umum'}
                      </span>
                      <h3 style={{ fontSize: '1.15rem', fontWeight: 700, margin: '6px 0', color: '#0f172a' }}>
                        {item.name}
                      </h3>
                      <p style={{ fontSize: '0.875rem', color: '#64748b', margin: '0 0 12px 0' }}>
                        {item.description || 'Tidak ada deskripsi'}
                      </p>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #f1f5f9', paddingTop: '12px' }}>
                      <span style={{ fontSize: '1.15rem', fontWeight: 800, color: '#16a34a' }}>
                        Rp {item.price ? item.price.toLocaleString('id-ID') : '0'}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '60px 0', color: '#94a3b8' }}>
              Tidak ada produk pada kategori ini.
            </div>
          )}
        </section>

      </div>
    </div>
  );
}
