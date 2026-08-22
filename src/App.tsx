import React, { useState, useEffect } from 'react';

// =======================================================
// KONFIGURASI SANITY PROJECT ID ANDA
// =======================================================
const SANITY_PROJECT_ID = '856jrik3';
const SANITY_DATASET = 'production';
const BASE_URL = `https://${SANITY_PROJECT_ID}.api.sanity.io/v2024-01-01/data/query/${SANITY_DATASET}?query=`;

export default function App() {
  const [categories, setCategories] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [storeInfo, setStoreInfo] = useState<any>(null);

  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [cartCount, setCartCount] = useState<number>(0);

  // -----------------------------------------------------
  // FETCH DATA DARI SANITY
  // -----------------------------------------------------
  const fetchAllData = async () => {
    try {
      setLoading(true);

      const storeQuery = encodeURIComponent(`*[_type == "storeInfo" || _type == "settings" || _type == "siteSettings"][0]{ name, description, whatsapp, "logoUrl": logo.asset->url }`);
      const categoryQuery = encodeURIComponent(`*[_type == "category"] | order(title asc) { _id, title, icon }`);
      const productQuery = encodeURIComponent(`*[_type == "product"] | order(_createdAt desc) { _id, name, price, description, "imageUrl": image.asset->url, category->{ _id, title } }`);

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

    } catch (err) {
      console.error('Error Fetching Data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllData();
  }, []);

  // Nombor WhatsApp Toko (Default jika di Sanity belum diisi)
  const waNumber = storeInfo?.whatsapp || '6281234567890';

  // Filter Produk
  const filteredProducts = products.filter((p) => {
    const matchesCategory = selectedCategory === 'all' || p.category?._id === selectedCategory;
    const matchesSearch = p.name?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleBuyWA = (productName: string, price: number) => {
    const text = `Halo Admin, saya ingin memesan: *${productName}* seharga *Rp ${price?.toLocaleString('id-ID')}*. Apakah stok masih ada?`;
    window.open(`https://wa.me/${waNumber}?text=${encodeURIComponent(text)}`, '_blank');
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#0c0a09', color: '#ffffff', fontFamily: "'Poppins', sans-serif" }}>
      
      {/* ================= 1. NAVBAR / HEADER ================= */}
      <nav style={{
        position: 'sticky',
        top: 0,
        zIndex: 100,
        backgroundColor: '#1c1917',
        borderBottom: '1px solid #292524',
        padding: '12px 24px'
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          
          {/* Logo */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            {storeInfo?.logoUrl ? (
              <img src={storeInfo.logoUrl} alt="Logo" style={{ height: '48px', objectFit: 'contain' }} />
            ) : (
              <div style={{ fontWeight: 900, fontSize: '1.4rem', color: '#38bdf8', letterSpacing: '-0.5px' }}>
                FITNESS <span style={{ color: '#ef4444' }}>SURABAYA</span>
              </div>
            )}
          </div>

          {/* Menu Navigasi Tengah */}
          <div style={{ display: 'flex', gap: '28px', fontSize: '0.95rem', fontWeight: 500 }} className="desktop-menu">
            <a href="#beranda" style={{ color: '#ffffff', textDecoration: 'none' }}>Beranda</a>
            <a href="#produk" style={{ color: '#a8a29e', textDecoration: 'none' }}>Produk</a>
            <a href="#kategori" style={{ color: '#a8a29e', textDecoration: 'none' }}>Kategori</a>
            <a href="#tentang" style={{ color: '#a8a29e', textDecoration: 'none' }}>Tentang Kami</a>
          </div>

          {/* Aksi Kanan: Cari, Troli, WA */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            {/* Search Input */}
            <input
              type="text"
              placeholder="Cari alat..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                backgroundColor: '#292524',
                border: '1px solid #44403c',
                color: '#ffffff',
                padding: '6px 12px',
                borderRadius: '20px',
                fontSize: '0.85rem',
                outline: 'none',
                width: '140px'
              }}
            />

            {/* Icon Troli */}
            <div style={{ position: 'relative', cursor: 'pointer' }}>
              <span style={{ fontSize: '1.3rem' }}>🛒</span>
              <span style={{
                position: 'absolute',
                top: '-6px',
                right: '-8px',
                backgroundColor: '#dc2626',
                color: '#ffffff',
                fontSize: '0.7rem',
                fontWeight: 'bold',
                borderRadius: '50%',
                padding: '2px 6px'
              }}>
                {cartCount}
              </span>
            </div>

            {/* Tombol Hubungi Kami Merah */}
            <a
              href={`https://wa.me/${waNumber}`}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                backgroundColor: '#dc2626',
                color: '#ffffff',
                padding: '8px 18px',
                borderRadius: '24px',
                textDecoration: 'none',
                fontWeight: 700,
                fontSize: '0.9rem',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                boxShadow: '0 4px 12px rgba(220, 38, 38, 0.4)'
              }}
            >
              📞 Hubungi Kami
            </a>
          </div>

        </div>
      </nav>

      {/* ================= 2. HERO BANNER UTAMA ================= */}
      <section id="beranda" style={{
        position: 'relative',
        minHeight: '480px',
        background: 'linear-gradient(to right, rgba(12,10,9,0.95), rgba(12,10,9,0.6)), url("https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=1600") center/cover no-repeat',
        display: 'flex',
        alignItems: 'center',
        padding: '60px 24px'
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', width: '100%' }}>
          <div style={{ maxWidth: '650px' }}>
            
            {/* Tag Promo Merah */}
            <div style={{
              display: 'inline-block',
              backgroundColor: '#dc2626',
              color: '#ffffff',
              padding: '6px 14px',
              borderRadius: '4px',
              fontWeight: 800,
              fontSize: '0.85rem',
              letterSpacing: '1px',
              marginBottom: '20px'
            }}>
              PROMO CUCI GUDANG 2024
            </div>

            {/* Judul Besar */}
            <h1 style={{
              fontSize: '3.2rem',
              fontWeight: 900,
              lineHeight: '1.1',
              margin: '0 0 16px 0',
              textTransform: 'uppercase'
            }}>
              Kualitasy Gym Profesional Di Rumah Anda
            </h1>

            <p style={{ fontSize: '1.1rem', color: '#d6d3d1', marginBottom: '28px', lineHeight: '1.6' }}>
              {storeInfo?.description || 'Dapatkan alat fitness komersial dan home use terlengkap dengan harga distributor Surabaya.'}
            </p>

            <div style={{ display: 'flex', gap: '14px' }}>
              <a
                href="#produk"
                style={{
                  backgroundColor: '#dc2626',
                  color: '#ffffff',
                  padding: '12px 28px',
                  borderRadius: '30px',
                  textDecoration: 'none',
                  fontWeight: 800,
                  fontSize: '1rem'
                }}
              >
                LIHAT PRODUK
              </a>
              <a
                href="https://856jrik3.sanity.studio"
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  backgroundColor: '#292524',
                  border: '1px solid #57534e',
                  color: '#ffffff',
                  padding: '12px 20px',
                  borderRadius: '30px',
                  textDecoration: 'none',
                  fontWeight: 600,
                  fontSize: '0.9rem'
                }}
              >
                🔐 Edit Isi Web (Admin)
              </a>
            </div>

          </div>
        </div>
      </section>

      {/* ================= 3. KATEGORI & PRODUK ================= */}
      <main style={{ maxWidth: '1200px', margin: '0 auto', padding: '50px 24px' }} id="produk">
        
        {/* Header Section Kategori */}
        <div style={{ marginBottom: '30px', textAlign: 'center' }} id="kategori">
          <h2 style={{ fontSize: '2rem', fontWeight: 800, margin: '0 0 10px 0', textTransform: 'uppercase' }}>
            Kategori Produk
          </h2>
          <div style={{ width: '60px', height: '4px', backgroundColor: '#dc2626', margin: '0 auto 24px auto', borderRadius: '2px' }}></div>

          {/* Tombol Kategori Pills */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: '10px', flexWrap: 'wrap' }}>
            <button
              onClick={() => setSelectedCategory('all')}
              style={{
                padding: '10px 24px',
                borderRadius: '24px',
                border: 'none',
                cursor: 'pointer',
                fontWeight: 700,
                backgroundColor: selectedCategory === 'all' ? '#dc2626' : '#1c1917',
                color: selectedCategory === 'all' ? '#ffffff' : '#a8a29e',
                transition: '0.2s'
              }}
            >
              Semua Kategori
            </button>

            {categories.map((cat) => (
              <button
                key={cat._id}
                onClick={() => setSelectedCategory(cat._id)}
                style={{
                  padding: '10px 24px',
                  borderRadius: '24px',
                  border: 'none',
                  cursor: 'pointer',
                  fontWeight: 700,
                  backgroundColor: selectedCategory === cat._id ? '#dc2626' : '#1c1917',
                  color: selectedCategory === cat._id ? '#ffffff' : '#a8a29e',
                  transition: '0.2s'
                }}
              >
                {cat.icon ? `${cat.icon} ` : ''}{cat.title}
              </button>
            ))}
          </div>
        </div>

        {/* GRID PRODUK */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '60px 0', color: '#dc2626', fontSize: '1.2rem', fontWeight: 600 }}>
            ⏳ Memuat Katalog Alat Fitness dari Sanity...
          </div>
        ) : filteredProducts.length > 0 ? (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(270px, 1fr))',
            gap: '28px'
          }}>
            {filteredProducts.map((item) => (
              <div
                key={item._id}
                style={{
                  backgroundColor: '#1c1917',
                  borderRadius: '16px',
                  overflow: 'hidden',
                  border: '1px solid #292524',
                  display: 'flex',
                  flexDirection: 'column',
                  boxShadow: '0 4px 20px rgba(0,0,0,0.5)'
                }}
              >
                {/* Gambar Produk */}
                <div style={{ height: '220px', backgroundColor: '#0c0a09', position: 'relative', overflow: 'hidden' }}>
                  {item.imageUrl ? (
                    <img src={item.imageUrl} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#78716c' }}>
                      📷 Tidak Ada Gambar
                    </div>
                  )}
                  {item.category?.title && (
                    <span style={{
                      position: 'absolute',
                      top: '12px',
                      left: '12px',
                      backgroundColor: 'rgba(0,0,0,0.8)',
                      color: '#38bdf8',
                      fontSize: '0.75rem',
                      fontWeight: 800,
                      padding: '4px 10px',
                      borderRadius: '4px',
                      textTransform: 'uppercase'
                    }}>
                      {item.category.title}
                    </span>
                  )}
                </div>

                {/* Konten Card */}
                <div style={{ padding: '20px', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                  <div>
                    <h3 style={{ fontSize: '1.15rem', fontWeight: 700, margin: '0 0 8px 0', color: '#ffffff' }}>
                      {item.name}
                    </h3>
                    <p style={{ fontSize: '0.85rem', color: '#a8a29e', margin: '0 0 16px 0', lineHeight: '1.4' }}>
                      {item.description || 'Peralatan gym standar internasional.'}
                    </p>
                  </div>

                  <div>
                    <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#22c55e', marginBottom: '14px' }}>
                      Rp {item.price ? item.price.toLocaleString('id-ID') : '0'}
                    </div>

                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button
                        onClick={() => setCartCount(c => c + 1)}
                        style={{
                          backgroundColor: '#292524',
                          border: 'none',
                          color: '#ffffff',
                          padding: '10px 14px',
                          borderRadius: '8px',
                          cursor: 'pointer',
                          fontWeight: 600
                        }}
                      >
                        🛒 +Troli
                      </button>
                      
                      <button
                        onClick={() => handleBuyWA(item.name, item.price)}
                        style={{
                          flex: 1,
                          backgroundColor: '#dc2626',
                          border: 'none',
                          color: '#ffffff',
                          padding: '10px 14px',
                          borderRadius: '8px',
                          cursor: 'pointer',
                          fontWeight: 700,
                          fontSize: '0.88rem'
                        }}
                      >
                        Beli via WA
                      </button>
                    </div>
                  </div>
                </div>

              </div>
            ))}
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '60px', color: '#78716c', backgroundColor: '#1c1917', borderRadius: '16px' }}>
            Tidak ada produk yang cocok dengan pencarian atau kategori ini.
          </div>
        )}

      </main>

      {/* ================= 4. FOOTER ================= */}
      <footer style={{ backgroundColor: '#1c1917', borderTop: '1px solid #292524', padding: '40px 24px', textAlign: 'center', color: '#78716c', fontSize: '0.9rem' }} id="tentang">
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <h3 style={{ color: '#ffffff', fontWeight: 800, fontSize: '1.2rem', marginBottom: '8px' }}>
            {storeInfo?.name || 'SURABAYA FITNESS'}
          </h3>
          <p style={{ maxWidth: '500px', margin: '0 auto 20px auto' }}>
            Pusat Penjualan Alat Fitness Terbaik, Treadmill, Sepeda Statis, Dumbbell, dan Home Gym di Surabaya.
          </p>
          <p>© 2024 Surabaya Fitness. All rights reserved.</p>
        </div>
      </footer>

      {/* ================= 5. TOMBOL FLOATING WHATSAPP (HIJAU MOJOK KANAN BAWAH) ================= */}
      <a
        href={`https://wa.me/${waNumber}?text=Halo%20Admin%20Surabaya%20Fitness,%20saya%20mau%20tanya%20produk`}
        target="_blank"
        rel="noopener noreferrer"
        style={{
          position: 'fixed',
          bottom: '24px',
          right: '24px',
          backgroundColor: '#22c55e',
          color: '#ffffff',
          width: '60px',
          height: '60px',
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '2rem',
          boxShadow: '0 4px 20px rgba(34, 197, 94, 0.5)',
          zIndex: 999,
          textDecoration: 'none'
        }}
        title="Chat via WhatsApp"
      >
        💬
      </a>

    </div>
  );
}
