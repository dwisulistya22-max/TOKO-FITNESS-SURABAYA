import React, { useState, useEffect } from 'react';

// =======================================================
// 1. KONFIGURASI SANITY LANGSUNG DENGAN PROJECT ID ANDA
// =======================================================
const SANITY_PROJECT_ID = '856jrik3'; // Project ID milik Anda
const SANITY_DATASET = 'production';

// URL API Resmi Sanity (Aman dari crash build Vercel)
const BASE_URL = `https://${SANITY_PROJECT_ID}.api.sanity.io/v2024-01-01/data/query/${SANITY_DATASET}?query=`;

export default function App() {
  const [categories, setCategories] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [storeInfo, setStoreInfo] = useState<any>(null);

  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [loading, setLoading] = useState<boolean>(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // -----------------------------------------------------
  // FUNGSI MENGAMBIL DATA DARI SANITY (856jrik3)
  // -----------------------------------------------------
  const fetchAllData = async () => {
    try {
      setLoading(true);
      setErrorMessage(null);

      // Query GROQ Sanity untuk mengambil Info Toko, Kategori, dan Produk + URL Gambar
      const storeQuery = encodeURIComponent(`*[_type == "storeInfo" || _type == "settings" || _type == "siteSettings"][0]{ name, description, whatsapp, "logoUrl": logo.asset->url }`);
      const categoryQuery = encodeURIComponent(`*[_type == "category"] | order(title asc) { _id, title, icon }`);
      const productQuery = encodeURIComponent(`*[_type == "product"] | order(_createdAt desc) { _id, name, price, description, "imageUrl": image.asset->url, category->{ _id, title } }`);

      // Tarik Data Bersamaan
      const [resStore, resCat, resProd] = await Promise.all([
        fetch(`${BASE_URL}${storeQuery}`, { cache: 'no-store' }),
        fetch(`${BASE_URL}${categoryQuery}`, { cache: 'no-store' }),
        fetch(`${BASE_URL}${productQuery}`, { cache: 'no-store' }),
      ]);

      const dataStore = await resStore.json();
      const dataCat = await resCat.json();
      const dataProd = await resProd.json();

      if (dataStore.result) setStoreInfo(dataStore.result);
      if (dataCat.result) setCategories(dataCat.result);
      if (dataProd.result) setProducts(dataProd.result);

    } catch (err: any) {
      console.error('Error Fetching Data:', err);
      setErrorMessage('Gagal terhubung ke Sanity Studio. Periksa koneksi internet Anda.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllData();
  }, []);

  // Filter Produk berdasarkan Kategori yang dipilih
  const filteredProducts = selectedCategory === 'all'
    ? products
    : products.filter((p) => p.category?._id === selectedCategory);

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#0f172a', color: '#f8fafc', fontFamily: 'system-ui, -apple-system, sans-serif', padding: '20px' }}>
      
      {/* BAR ATAS: REFRESH & KONEKSI STUDIO */}
      <div style={{ maxWidth: '1100px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px', paddingBottom: '16px', borderBottom: '1px solid #334155' }}>
        <div style={{ fontWeight: 'bold', fontSize: '1.2rem', color: '#38bdf8', display: 'flex', alignItems: 'center', gap: '8px' }}>
          🏋️‍♂️ Surabaya Fitness
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            onClick={fetchAllData}
            style={{
              backgroundColor: '#1e293b',
              color: '#f8fafc',
              border: '1px solid #475569',
              padding: '8px 16px',
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: 600
            }}
          >
            🔄 Refresh Data
          </button>
          
          {/* Tombol Admin Sanity Studio Anda */}
          <a
            href="https://856jrik3.sanity.studio"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              backgroundColor: '#0284c7',
              color: '#ffffff',
              padding: '8px 16px',
              borderRadius: '8px',
              textDecoration: 'none',
              fontWeight: 600
            }}
          >
            🔐 Admin Studio
          </a>
        </div>
      </div>

      <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
        
        {/* HEADER / LOGO TOKO */}
        <header style={{ textAlign: 'center', marginBottom: '40px' }}>
          {storeInfo?.logoUrl ? (
            <img
              src={storeInfo.logoUrl}
              alt="Logo Toko"
              style={{ width: '100px', height: '100px', objectFit: 'contain', borderRadius: '50%', marginBottom: '16px', border: '3px solid #38bdf8', padding: '4px', backgroundColor: '#1e293b' }}
            />
          ) : (
            <div style={{ width: '80px', height: '80px', borderRadius: '50%', backgroundColor: '#1e293b', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px auto', border: '2px dashed #475569', fontSize: '2rem' }}>
              🏋️
            </div>
          )}
          
          <h1 style={{ fontSize: '2.5rem', fontWeight: 800, margin: '0 0 10px 0', color: '#ffffff' }}>
            {storeInfo?.name || 'Surabaya Fitness'}
          </h1>
          <p style={{ fontSize: '1.1rem', color: '#94a3b8', margin: 0, maxWidth: '600px', marginInline: 'auto' }}>
            {storeInfo?.description || 'Katalog Alat Fitness Terbaik & Terlengkap di Surabaya'}
          </p>
        </header>

        {/* NOTIFIKASI ERROR JIKA ADA */}
        {errorMessage && (
          <div style={{ backgroundColor: '#450a0a', border: '1px solid #ef4444', color: '#fca5a5', padding: '16px', borderRadius: '12px', marginBottom: '30px', textAlign: 'center' }}>
            ⚠️ {errorMessage}
          </div>
        )}

        {/* DAFTAR KATEGORI */}
        <section style={{ marginBottom: '32px' }}>
          <div style={{ display: 'flex', gap: '10px', overflowX: 'auto', paddingBottom: '10px' }}>
            <button
              onClick={() => setSelectedCategory('all')}
              style={{
                padding: '10px 22px',
                borderRadius: '30px',
                border: 'none',
                cursor: 'pointer',
                fontWeight: 700,
                backgroundColor: selectedCategory === 'all' ? '#0284c7' : '#1e293b',
                color: selectedCategory === 'all' ? '#ffffff' : '#94a3b8',
                transition: 'all 0.2s'
              }}
            >
              🔥 Semua Produk
            </button>

            {categories.length > 0 && categories.map((cat) => (
              <button
                key={cat._id}
                onClick={() => setSelectedCategory(cat._id)}
                style={{
                  padding: '10px 22px',
                  borderRadius: '30px',
                  border: 'none',
                  cursor: 'pointer',
                  fontWeight: 700,
                  whiteSpace: 'nowrap',
                  backgroundColor: selectedCategory === cat._id ? '#0284c7' : '#1e293b',
                  color: selectedCategory === cat._id ? '#ffffff' : '#94a3b8',
                  transition: 'all 0.2s'
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
            <div style={{ textAlign: 'center', padding: '60px 0', color: '#38bdf8', fontSize: '1.2rem' }}>
              ⏳ Memuat data produk dari Sanity...
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
                    backgroundColor: '#1e293b',
                    borderRadius: '16px',
                    overflow: 'hidden',
                    border: '1px solid #334155',
                    display: 'flex',
                    flexDirection: 'column'
                  }}
                >
                  <div style={{ height: '200px', backgroundColor: '#0f172a', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {item.imageUrl ? (
                      <img src={item.imageUrl} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                      <span style={{ color: '#64748b', fontSize: '0.9rem' }}>📷 Tidak Ada Gambar</span>
                    )}
                  </div>
                  <div style={{ padding: '20px', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                    <div>
                      {item.category?.title && (
                        <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#38bdf8', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                          {item.category.title}
                        </span>
                      )}
                      <h3 style={{ fontSize: '1.2rem', fontWeight: 700, margin: '6px 0 10px 0', color: '#ffffff' }}>
                        {item.name}
                      </h3>
                      <p style={{ fontSize: '0.875rem', color: '#94a3b8', margin: '0 0 16px 0', lineHeight: '1.4' }}>
                        {item.description || 'Peralatan fitness berkualitas tinggi.'}
                      </p>
                    </div>
                    <div style={{ borderTop: '1px solid #334155', paddingTop: '14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '1.25rem', fontWeight: 800, color: '#4ade80' }}>
                        Rp {item.price ? item.price.toLocaleString('id-ID') : '0'}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '60px 0', color: '#64748b', backgroundColor: '#1e293b', borderRadius: '16px', border: '1px dashed #334155' }}>
              Belum ada produk untuk kategori ini. Masukkan produk di Sanity Studio!
            </div>
          )}
        </section>

      </div>
    </div>
  );
}
