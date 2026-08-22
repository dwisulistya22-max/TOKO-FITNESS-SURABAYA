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

  // Data Default (Tampil jika di Sanity belum diisi)
  const defaultInfo = {
    name: 'TOKO FITNESS SURABAYA',
    phone: '0812-3456-7890',
    whatsapp: '6281234567890',
    address: 'Jl. Mayjen Sungkono No. 120, Surabaya, Jawa Timur (Dekat Ciputra World)',
    description: 'Pusat Penjualan Alat Fitness Terlengkap & Termurah di Surabaya. Melayani Pengiriman & Pemasangan Se-Jawa Timur.',
    hours: 'Senin - Minggu: 08.00 - 21.00 WIB'
  };

  // -----------------------------------------------------
  // AMBIL DATA DARI SANITY STUDIO
  // -----------------------------------------------------
  const fetchAllData = async () => {
    try {
      setLoading(true);

      const storeQuery = encodeURIComponent(`*[_type == "storeInfo" || _type == "settings" || _type == "siteSettings"][0]{ name, description, phone, whatsapp, address, hours, "logoUrl": logo.asset->url }`);
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

      if (dataStore?.result) setStoreInfo(dataStore.result);
      if (dataCat?.result) setCategories(dataCat.result);
      if (dataProd?.result) setProducts(dataProd.result);

    } catch (err) {
      console.error('Menggunakan Data Lokal/Fallback:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllData();
  }, []);

  const info = {
    name: storeInfo?.name || defaultInfo.name,
    phone: storeInfo?.phone || defaultInfo.phone,
    whatsapp: storeInfo?.whatsapp || defaultInfo.whatsapp,
    address: storeInfo?.address || defaultInfo.address,
    description: storeInfo?.description || defaultInfo.description,
    hours: storeInfo?.hours || defaultInfo.hours,
    logoUrl: storeInfo?.logoUrl
  };

  // Filter Produk
  const filteredProducts = products.filter((p) => {
    const matchesCategory = selectedCategory === 'all' || p.category?._id === selectedCategory;
    const matchesSearch = p.name?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleBuyWA = (productName: string, price: number) => {
    const text = `Halo Admin *${info.name}*, saya ingin bertanya/membeli: *${productName}* seharga *Rp ${price?.toLocaleString('id-ID')}*. Apakah stok masih ada? Mohon info ongkir ke alamat saya.`;
    window.open(`https://wa.me/${info.whatsapp}?text=${encodeURIComponent(text)}`, '_blank');
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#0a0a0a', color: '#ffffff', fontFamily: "'Poppins', sans-serif" }}>
      
      {/* ================= 1. BAR INFORMASI ATAS (TOP ANNOUNCEMENT BAR) ================= */}
      <div style={{ backgroundColor: '#dc2626', color: '#ffffff', fontSize: '0.8rem', fontWeight: 600, padding: '6px 16px' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
          <div>
            🔥 <strong>PROMO CUCI GUDANG 2024</strong> — DISKON UP TO 50% + GRATIS ONGKIR SURABAYA & SIDOARJO!
          </div>
          <div style={{ display: 'flex', gap: '16px' }}>
            <span>📍 {info.address.split('(')[0]}</span>
            <span>📞 Call/WA: {info.phone}</span>
          </div>
        </div>
      </div>

      {/* ================= 2. NAVBAR / HEADER UTAMA ================= */}
      <nav style={{
        position: 'sticky',
        top: 0,
        zIndex: 100,
        backgroundColor: '#171717',
        borderBottom: '1px solid #262626',
        padding: '14px 24px'
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px' }}>
          
          {/* LOGO & NAMA TOKO */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            {info.logoUrl ? (
              <img src={info.logoUrl} alt="Logo" style={{ height: '45px', objectFit: 'contain' }} />
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{ backgroundColor: '#dc2626', width: '38px', height: '38px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: '1.2rem' }}>
                  FS
                </div>
                <div style={{ fontWeight: 900, fontSize: '1.25rem', letterSpacing: '-0.5px', lineHeight: '1.1' }}>
                  TOKO FITNESS <br />
                  <span style={{ color: '#dc2626' }}>SURABAYA</span>
                </div>
              </div>
            )}
          </div>

          {/* MENU NAVIGASI */}
          <div style={{ display: 'flex', gap: '24px', fontSize: '0.9rem', fontWeight: 600 }}>
            <a href="#beranda" style={{ color: '#ffffff', textDecoration: 'none' }}>Beranda</a>
            <a href="#produk" style={{ color: '#a3a3a3', textDecoration: 'none' }}>Katalog Produk</a>
            <a href="#kategori" style={{ color: '#a3a3a3', textDecoration: 'none' }}>Kategori</a>
            <a href="#promo" style={{ color: '#ef4444', textDecoration: 'none' }}>🔥 Promo Special</a>
            <a href="#tentang" style={{ color: '#a3a3a3', textDecoration: 'none' }}>Tentang Kami</a>
            <a href="#kontak" style={{ color: '#a3a3a3', textDecoration: 'none' }}>Kontak & Lokasi</a>
          </div>

          {/* PENCARIAN, CART, & TOMBOL WA */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <input
              type="text"
              placeholder="Cari alat fitness..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                backgroundColor: '#262626',
                border: '1px solid #404040',
                color: '#ffffff',
                padding: '7px 14px',
                borderRadius: '20px',
                fontSize: '0.85rem',
                outline: 'none',
                width: '150px'
              }}
            />

            <div style={{ position: 'relative', cursor: 'pointer' }} title="Troli Belanja">
              <span style={{ fontSize: '1.4rem' }}>🛒</span>
              {cartCount > 0 && (
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
              )}
            </div>

            <a
              href={`https://wa.me/${info.whatsapp}`}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                backgroundColor: '#dc2626',
                color: '#ffffff',
                padding: '9px 18px',
                borderRadius: '24px',
                textDecoration: 'none',
                fontWeight: 700,
                fontSize: '0.85rem',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                boxShadow: '0 4px 14px rgba(220, 38, 38, 0.4)'
              }}
            >
              📞 Hubungi Kami
            </a>
          </div>

        </div>
      </nav>

      {/* ================= 3. HERO BANNER UTAMA ================= */}
      <section id="beranda" style={{
        position: 'relative',
        minHeight: '520px',
        background: 'linear-gradient(to right, rgba(10,10,10,0.95), rgba(10,10,10,0.6)), url("https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=1600") center/cover no-repeat',
        display: 'flex',
        alignItems: 'center',
        padding: '60px 24px'
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', width: '100%' }}>
          <div style={{ maxWidth: '680px' }}>
            
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
              PROMO CUCI GUDANG SURABAYA 2024
            </div>

            <h1 style={{
              fontSize: '3.4rem',
              fontWeight: 900,
              lineHeight: '1.1',
              margin: '0 0 18px 0',
              textTransform: 'uppercase',
              letterSpacing: '-1px'
            }}>
              Kualitasy Gym Profesional Di Rumah Anda
            </h1>

            <p style={{ fontSize: '1.1rem', color: '#d4d4d4', marginBottom: '32px', lineHeight: '1.6' }}>
              {info.description}
            </p>

            <div style={{ display: 'flex', gap: '14px', flexWrap: 'wrap' }}>
              <a
                href="#produk"
                style={{
                  backgroundColor: '#dc2626',
                  color: '#ffffff',
                  padding: '14px 32px',
                  borderRadius: '30px',
                  textDecoration: 'none',
                  fontWeight: 800,
                  fontSize: '1rem',
                  boxShadow: '0 4px 20px rgba(220,38,38,0.5)'
                }}
              >
                LIHAT KATALOG PRODUK
              </a>

              <a
                href="https://856jrik3.sanity.studio"
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  backgroundColor: '#262626',
                  border: '1px solid #525252',
                  color: '#ffffff',
                  padding: '14px 24px',
                  borderRadius: '30px',
                  textDecoration: 'none',
                  fontWeight: 600,
                  fontSize: '0.9rem'
                }}
              >
                🔐 Edit Data Web (Admin Studio)
              </a>
            </div>

          </div>
        </div>
      </section>

      {/* ================= 4. KEUNGGULAN TOKO ================= */}
      <section style={{ backgroundColor: '#171717', borderBottom: '1px solid #262626', padding: '30px 24px' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px', textAlign: 'center' }}>
          <div style={{ padding: '16px' }}>
            <div style={{ fontSize: '2rem', marginBottom: '8px' }}>🛡️</div>
            <div style={{ fontWeight: 700, fontSize: '1rem', color: '#ffffff' }}>Garansi Resmi 1-3 Tahun</div>
            <div style={{ fontSize: '0.8rem', color: '#a3a3a3' }}>Sparepart & Service Dijamin Ready</div>
          </div>
          <div style={{ padding: '16px' }}>
            <div style={{ fontSize: '2rem', marginBottom: '8px' }}>🚚</div>
            <div style={{ fontWeight: 700, fontSize: '1rem', color: '#ffffff' }}>Bisa COD & Pasang Di Tempat</div>
            <div style={{ fontSize: '0.8rem', color: '#a3a3a3' }}>Khusus Surabaya, Sidoarjo, Gresik</div>
          </div>
          <div style={{ padding: '16px' }}>
            <div style={{ fontSize: '2rem', marginBottom: '8px' }}>🏢</div>
            <div style={{ fontWeight: '700', fontSize: '1rem', color: '#ffffff' }}>Showroom Fisik Surabaya</div>
            <div style={{ fontSize: '0.8rem', color: '#a3a3a3' }}>Bisa Coba & Tes Alat Langsung</div>
          </div>
          <div style={{ padding: '16px' }}>
            <div style={{ fontSize: '2rem', marginBottom: '8px' }}>💳</div>
            <div style={{ fontWeight: 700, fontSize: '1rem', color: '#ffffff' }}>Pembayaran Mudah</div>
            <div style={{ fontSize: '0.8rem', color: '#a3a3a3' }}>Transfer, Cash, Cicilan 0%</div>
          </div>
        </div>
      </section>

      {/* ================= 5. KATALOG PRODUK & KATEGORI ================= */}
      <main style={{ maxWidth: '1200px', margin: '0 auto', padding: '60px 24px' }} id="produk">
        
        <div style={{ marginBottom: '40px', textAlign: 'center' }} id="kategori">
          <h2 style={{ fontSize: '2.2rem', fontWeight: 900, margin: '0 0 10px 0', textTransform: 'uppercase' }}>
            Katalog Alat Fitness
          </h2>
          <p style={{ color: '#a3a3a3', margin: '0 0 20px 0' }}>Pilih kategori alat fitness sesuai kebutuhan latihan Anda di rumah atau gym</p>
          <div style={{ width: '80px', height: '4px', backgroundColor: '#dc2626', margin: '0 auto 30px auto', borderRadius: '2px' }}></div>

          {/* TOMBOL FILTER KATEGORI */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: '10px', flexWrap: 'wrap' }}>
            <button
              onClick={() => setSelectedCategory('all')}
              style={{
                padding: '10px 24px',
                borderRadius: '24px',
                border: 'none',
                cursor: 'pointer',
                fontWeight: 700,
                backgroundColor: selectedCategory === 'all' ? '#dc2626' : '#262626',
                color: selectedCategory === 'all' ? '#ffffff' : '#a3a3a3',
                transition: '0.2s'
              }}
            >
              🔥 Semua Produk
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
                  backgroundColor: selectedCategory === cat._id ? '#dc2626' : '#262626',
                  color: selectedCategory === cat._id ? '#ffffff' : '#a3a3a3',
                  transition: '0.2s'
                }}
              >
                {cat.icon ? `${cat.icon} ` : ''}{cat.title}
              </button>
            ))}
          </div>
        </div>

        {/* DAFTAR PRODUK GRID */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '60px 0', color: '#dc2626', fontSize: '1.2rem', fontWeight: 600 }}>
            ⏳ Memuat Produk dari Sanity Studio...
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
                  backgroundColor: '#171717',
                  borderRadius: '16px',
                  overflow: 'hidden',
                  border: '1px solid #262626',
                  display: 'flex',
                  flexDirection: 'column',
                  boxShadow: '0 4px 20px rgba(0,0,0,0.5)'
                }}
              >
                <div style={{ height: '220px', backgroundColor: '#0a0a0a', position: 'relative', overflow: 'hidden' }}>
                  {item.imageUrl ? (
                    <img src={item.imageUrl} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#525252' }}>
                      📷 Tidak Ada Gambar
                    </div>
                  )}
                  {item.category?.title && (
                    <span style={{
                      position: 'absolute',
                      top: '12px',
                      left: '12px',
                      backgroundColor: 'rgba(0,0,0,0.85)',
                      color: '#ef4444',
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

                <div style={{ padding: '20px', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                  <div>
                    <h3 style={{ fontSize: '1.15rem', fontWeight: 700, margin: '0 0 8px 0', color: '#ffffff' }}>
                      {item.name}
                    </h3>
                    <p style={{ fontSize: '0.85rem', color: '#a3a3a3', margin: '0 0 16px 0', lineHeight: '1.4' }}>
                      {item.description || 'Peralatan gym standar komersial dan home-use.'}
                    </p>
                  </div>

                  <div>
                    <div style={{ fontSize: '1.3rem', fontWeight: 800, color: '#22c55e', marginBottom: '14px' }}>
                      Rp {item.price ? item.price.toLocaleString('id-ID') : '0'}
                    </div>

                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button
                        onClick={() => setCartCount(c => c + 1)}
                        style={{
                          backgroundColor: '#262626',
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
          <div style={{ textAlign: 'center', padding: '60px', color: '#737373', backgroundColor: '#171717', borderRadius: '16px' }}>
            Belum ada produk untuk kategori ini. Tambahkan produk di Sanity Studio!
          </div>
        )}

      </main>

      {/* ================= 6. BANNER PROMO CUCI GUDANG ================= */}
      <section id="promo" style={{ backgroundColor: '#dc2626', padding: '50px 24px', textAlign: 'center' }}>
        <div style={{ maxWidth: '900px', margin: '0 auto' }}>
          <h2 style={{ fontSize: '2.4rem', fontWeight: 900, margin: '0 0 12px 0', color: '#ffffff' }}>
            SPECIAL PAKET PROMO HOME GYM & TREADMILL
          </h2>
          <p style={{ fontSize: '1.1rem', color: '#fef2f2', marginBottom: '24px' }}>
            Dapatkan Penawaran Harga Paket Terbaik Pembelian Hari Ini! Bonus Karpet/Matras + Free Installasi Wilayah Surabaya.
          </p>
          <a
            href={`https://wa.me/${info.whatsapp}?text=Halo%20Admin%20Toko%20Fitness%20Surabaya,%20saya%20mau%20tanya%20Promo%20Paket%20Home%20Gym`}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              backgroundColor: '#ffffff',
              color: '#dc2626',
              padding: '14px 32px',
              borderRadius: '30px',
              textDecoration: 'none',
              fontWeight: 900,
              fontSize: '1rem',
              display: 'inline-block',
              boxShadow: '0 4px 15px rgba(0,0,0,0.3)'
            }}
          >
            💬 CHAT ADMIN UNTUK CLAIM PROMO
          </a>
        </div>
      </section>

      {/* ================= 7. TENTANG KAMI & LOKASI KONTAK ================= */}
      <section id="tentang" style={{ backgroundColor: '#171717', padding: '60px 24px', borderTop: '1px solid #262626' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '40px' }} id="kontak">
          
          {/* TENTANG KAMI */}
          <div>
            <h3 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#ffffff', marginBottom: '16px' }}>
              TENTANG {info.name}
            </h3>
            <p style={{ color: '#a3a3a3', lineHeight: '1.7', marginBottom: '16px' }}>
              {info.name} adalah penyedia alat fitnes terpercaya di Kota Surabaya dan Jawa Timur. Kami menyediakan berbagai alat olahraga komersial gym maupun penggunaan pribadi di rumah (*Home Use*) seperti Treadmill Elektrik, Sepeda Statis, Bench Press, Dumbbell, hingga Home Gym 1-4 Sisi.
            </p>
            <p style={{ color: '#a3a3a3', lineHeight: '1.7' }}>
              Setiap produk kami dijamin berkualitas tinggi, bergaransi resmi, dan memiliki *sparepart* pendukung serta teknisi berpengalaman.
            </p>
          </div>

          {/* INFORMASI ALAMAT & KONTAK LENGKAP */}
          <div>
            <h3 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#ffffff', marginBottom: '16px' }}>
              LOKASI SHOWROOM & KONTAK
            </h3>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, color: '#a3a3a3', lineHeight: '2.2' }}>
              <li>📍 <strong>Alamat Toko:</strong> {info.address}</li>
              <li>📞 <strong>Telepon / WA:</strong> {info.phone}</li>
              <li>⏰ <strong>Jam Operasional:</strong> {info.hours}</li>
              <li>🚚 <strong>Area Pengiriman:</strong> Surabaya, Sidoarjo, Gresik, Malang, & Seluruh Indonesia</li>
            </ul>
          </div>

        </div>
      </section>

      {/* ================= 8. FOOTER ================= */}
      <footer style={{ backgroundColor: '#0a0a0a', borderTop: '1px solid #262626', padding: '30px 24px', textAlign: 'center', color: '#737373', fontSize: '0.85rem' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <p style={{ margin: '0 0 8px 0', fontWeight: 700, color: '#a3a3a3' }}>
            © 2024 {info.name}. All Rights Reserved.
          </p>
          <p style={{ margin: 0 }}>Pusat Alat Fitness Terbaik & Terlengkap di Surabaya</p>
        </div>
      </footer>

      {/* ================= 9. TOMBOL FLOATING WHATSAPP ================= */}
      <a
        href={`https://wa.me/${info.whatsapp}?text=Halo%20Admin%20Toko%20Fitness%20Surabaya,%20saya%20mau%20tanya%20produk`}
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
          boxShadow: '0 4px 20px rgba(34, 197, 94, 0.6)',
          zIndex: 999,
          textDecoration: 'none'
        }}
        title="Chat WhatsApp Admin"
      >
        💬
      </a>

    </div>
  );
}
