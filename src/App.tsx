import Navbar from './components/Navbar';
import Hero from './components/Hero';
import Categories from './components/Categories';
import FeaturedProducts from './components/FeaturedProducts';
import WhyChooseUs from './components/WhyChooseUs';
import Testimonials from './components/Testimonials';
import Footer from './components/Footer';
import WhatsAppButton from './components/WhatsAppButton';
import { useState, useEffect } from 'react';
import { STORE_CONFIG } from './data/config';
import { Mail, MessageCircle, Download } from 'lucide-react';

const SANITY_STUDIO_URL = 'https://sanity.io/@oHJoh6fdC/studio/qi4rocc0';
const ADMIN_PASSWORD = 'admin123'; 

function App() {
  const [activeCategory, setActiveCategory] = useState('Semua');
  const [logo, setLogo] = useState(STORE_CONFIG.logo);

  const [showAdminModal, setShowAdminModal] = useState(false);
  const [passwordInput, setPasswordInput] = useState('');
  const [passwordError, setPasswordError] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // 🛡️ FITUR KEAMANAN ANTI-COPY & ANTI-KLIK KANAN
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        (e.ctrlKey && (e.key === 'c' || e.key === 'C' || e.key === 's' || e.key === 'S' || e.key === 'u' || e.key === 'U')) ||
        e.key === 'F12'
      ) {
        e.preventDefault();
      }
    };

    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();
    };

    window.addEventListener('keydown', handleKeyDown);
    document.addEventListener('contextmenu', handleContextMenu);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('contextmenu', handleContextMenu);
    };
  }, []);

  useEffect(() => {
    const savedLogo = localStorage.getItem('fitness_logo');
    if (savedLogo && savedLogo.length > 5) {
      setLogo(savedLogo);
    } else {
      setLogo(STORE_CONFIG.logo);
    }
  }, []);

  const handleLogoChange = (newLogo: string) => {
    setLogo(newLogo);
    localStorage.setItem('fitness_logo', newLogo);
  };

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordInput === ADMIN_PASSWORD) {
      setIsAuthenticated(true);
      setPasswordError(false);
    } else {
      setPasswordError(true);
    }
  };

  const handleCloseModal = () => {
    setShowAdminModal(false);
    setPasswordInput('');
    setPasswordError(false);
    setIsAuthenticated(false);
  };

  // 📥 FUNGSI OTOMATIS DOWNLOAD FILE CSV KATALOG WA BUSINESS
  const handleDownloadWACatalog = async () => {
    const projectId = 'qi4rocc0';
    const dataset = 'production';
    const query = encodeURIComponent(`*[_type == "product"]{
      _id, name, price, description,
      "image": coalesce(image.asset->url, foto.asset->url, photo.asset->url, "")
    }`);

    try {
      const res = await fetch(`https://${projectId}.api.sanity.io/v2024-01-01/data/query/${dataset}?query=${query}`);
      const data = await res.json();

      let csv = 'id,title,description,availability,condition,price,link,image_link,brand\n';

      data.result.forEach((p: any) => {
        const id = p._id;
        const title = `"${(p.name || '').replace(/"/g, '""')}"`;
        const desc = `"${(p.description || 'Peralatan fitness kualitas premium').replace(/"/g, '""').replace(/\n/g, ' ')}"`;
        const avail = 'in stock';
        const cond = 'new';
        const price = `${p.price || 0} IDR`;
        const link = 'https://tokofitnesssurabaya.com';
        const img = p.image || 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?q=80&w=800';
        const brand = '"Toko Fitness Surabaya"';

        csv += `${id},${title},${desc},${avail},${cond},${price},${link},${img},${brand}\n`;
      });

      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'katalog-whatsapp-fitness.csv';
      a.click();
    } catch (err) {
      alert('Gagal mendownload CSV, pastikan koneksi lancar.');
    }
  };

  // FUNGSI CHAT WA UNTUK PENAWARAN PAKET GYM
  const handlePackageWA = (jenisPaket: string) => {
    const waAdmin = (STORE_CONFIG.phone || '6281332345448').split(/[/,&\n]/)[0].replace(/\D/g, '');
    let message = '';

    if (jenisPaket === 'commercial') {
      message = `Halo Admin Surabaya Fitness 👋%0A%0ASaya tertarik dengan *PENAWARAN PAKET GYM COMMERCIAL / FITNESS CENTER*.%0AMohon kirimkan katalog paket, proposal, dan penawaran harga terbaik. Terima kasih!`;
    } else if (jenisPaket === 'outdoor') {
      message = `Halo Admin Surabaya Fitness 👋%0A%0ASaya tertarik dengan *PENAWARAN ALAT FITNESS OUTDOOR / TAMAN / FASILITAS PUBLIK*.%0AMohon kirimkan katalog produk outdoor, spesifikasi, dan pricelist-nya. Terima kasih!`;
    } else {
      message = `Halo Admin Surabaya Fitness 👋%0A%0ASaya tertarik dengan *PAKET PROMO HOME GYM / RUMAHAN*.%0AMohon rekomendasi paket alat fitness dan pricelist-nya. Terima kasih!`;
    }

    window.open(`https://wa.me/${waAdmin}?text=${message}`, '_blank');
  };

  // FUNGSI SEND EMAIL PROPOSAL RESMI
  const handlePackageEmail = (jenisPaket: string) => {
    const emailToko = STORE_CONFIG.email || 'dwisulistya22@gmail.com';
    let subject = '';
    let body = '';

    if (jenisPaket === 'commercial') {
      subject = 'Permintaan Proposal Paket Gym Commercial - Surabaya Fitness';
      body = 'Halo Tim Surabaya Fitness,%0D%0A%0D%0ASaya ingin meminta proposal resmi dan pricelist untuk pembuatan Commercial Fitness Center / Gym.%0D%0A%0D%0AMohon konfirmasi dan pengiriman berkas penawaran ke email ini.%0D%0ATerima kasih.';
    } else if (jenisPaket === 'outdoor') {
      subject = 'Permintaan Penawaran Alat Fitness Outdoor - Surabaya Fitness';
      body = 'Halo Tim Surabaya Fitness,%0D%0A%0D%0ASaya ingin meminta katalog dan proposal penawaran harga untuk Alat Fitness Outdoor (Taman / Perumahan / Instansi).%0D%0A%0D%0AMohon informasi lebih lanjut.%0D%0ATerima kasih.';
    } else {
      subject = 'Permintaan Katalog Paket Home Gym Rumahan - Surabaya Fitness';
      body = 'Halo Tim Surabaya Fitness,%0D%0A%0D%0ASaya ingin meminta katalog penawaran harga Paket Home Gym Rumahan.%0D%0A%0D%0AMohon kirimkan pricelist dan rekomendasi produknya.%0D%0ATerima kasih.';
    }

    window.location.href = `mailto:${emailToko}?subject=${encodeURIComponent(subject)}&body=${body}`;
  };

  return (
    <div className="min-h-screen bg-white font-sans text-gray-900 relative select-none">

      {/* MODAL POP-UP PASSWORD ADMIN */}
      {showAdminModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[999] flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl relative border border-gray-100">
            <button 
              onClick={handleCloseModal}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-800 text-2xl font-bold w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-100"
            >
              ×
            </button>

            {!isAuthenticated ? (
              <div>
                <div className="text-center mb-6">
                  <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center text-3xl mx-auto mb-3">
                    🔐
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900">Akses Admin Panel</h3>
                  <p className="text-sm text-gray-500 mt-1">Masukkan password untuk masuk ke Sanity Studio & Fitur Admin</p>
                </div>

                <form onSubmit={handlePasswordSubmit} className="space-y-4">
                  <div>
                    <input 
                      type="password"
                      placeholder="Masukkan Password Admin..."
                      value={passwordInput}
                      onChange={(e) => setPasswordInput(e.target.value)}
                      className={`w-full px-4 py-3 rounded-xl border ${passwordError ? 'border-red-500 bg-red-50' : 'border-gray-300'} focus:outline-none focus:ring-2 focus:ring-red-500 text-center text-lg font-bold`}
                      autoFocus
                    />
                    {passwordError && (
                      <p className="text-red-600 text-xs font-bold text-center mt-2">
                        ❌ Password salah! Silakan coba lagi.
                      </p>
                    )}
                  </div>

                  <button 
                    type="submit"
                    className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3.5 rounded-xl shadow-lg transition-colors cursor-pointer text-base"
                  >
                    Verifikasi Password
                  </button>
                </form>
              </div>
            ) : (
              <div className="text-center py-4 space-y-4">
                <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center text-3xl mx-auto mb-3">
                  ✅
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-1">Akses Admin Diverifikasi!</h3>
                <p className="text-xs text-gray-500 mb-4">Pilih tindakan yang ingin Anda lakukan:</p>

                {/* TOMBOL 1: BUKA SANITY */}
                <a 
                  href={SANITY_STUDIO_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={handleCloseModal}
                  className="block w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-3.5 rounded-xl shadow-md transition-all text-center text-sm cursor-pointer"
                >
                  🚀 Buka Sanity Studio (Edit Barang) &rarr;
                </a>

                {/* TOMBOL 2: DOWNLOAD FILE KATALOG WA BUSINESS (BARU) */}
                <button
                  type="button"
                  onClick={handleDownloadWACatalog}
                  className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3.5 rounded-xl shadow-md transition-all text-center text-sm flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Download size={18} />
                  <span>Download File Katalog WA (CSV)</span>
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* COMPONENT UTAMA WEBSITE */}
      <Navbar isAdmin={false} logo={logo} onLogoChange={handleLogoChange} />
      
      <main>
        <Hero isAdmin={false} logo={logo} onLogoChange={handleLogoChange} />
        <Categories onSelectCategory={setActiveCategory} isAdmin={false} />
        
        <FeaturedProducts 
          activeCategory={activeCategory} 
          onCategoryChange={setActiveCategory} 
          isAdmin={false}
          setIsAdmin={() => {}}
        />
        
        <WhyChooseUs />
        <Testimonials />
        
        {/* SECTION PENAWARAN PAKET COMMERCIAL, HOME GYM & OUTDOOR FITNESS */}
        <section className="py-20 bg-gradient-to-r from-red-700 via-red-600 to-red-800 text-white relative overflow-hidden">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
            
            <span className="bg-black/30 text-white text-xs font-black uppercase tracking-widest px-4 py-1.5 rounded-full inline-block mb-4 border border-white/20">
              🔥 SPECIAL BUNDLE & DISTRIBUTOR OFFER
            </span>

            <h2 className="text-3xl sm:text-5xl font-black uppercase tracking-tight mb-4 leading-tight">
              PENAWARAN PAKET ALAT GYM & OUTDOOR
            </h2>
            
            <p className="text-red-100 text-base sm:text-lg mb-12 max-w-3xl mx-auto leading-relaxed">
              Solusi pembuatan Commercial Fitness Center, Fasilitas Gym Hotel/Kantor, Taman Fitness Outdoor, hingga Paket Home Gym Rumahan. Dapatkan penawaran harga distributor resmi dari {STORE_CONFIG.name}.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto text-left">
              
              {/* 1. PAKET COMMERCIAL GYM */}
              <div className="bg-gray-950/85 backdrop-blur-md p-7 rounded-3xl border border-white/10 shadow-2xl flex flex-col justify-between hover:border-red-500/50 transition-all">
                <div>
                  <div className="text-3xl mb-3">🏢</div>
                  <h3 className="text-xl font-bold text-white mb-2">Paket Commercial Gym</h3>
                  <p className="text-gray-400 text-sm mb-6 leading-relaxed">
                    Khusus Pembuatan Fitness Center, Gym Hotel, Apartment, Kantor & Instansi. Lengkap dengan Garansi Onsite & Teknisi.
                  </p>
                </div>

                <div className="space-y-2.5">
                  <button
                    onClick={() => handlePackageWA('commercial')}
                    className="w-full bg-green-500 hover:bg-green-600 text-white py-3 px-4 rounded-xl font-bold text-xs sm:text-sm transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md"
                  >
                    <MessageCircle size={16} />
                    <span>Minta Proposal via WA</span>
                  </button>

                  <button
                    onClick={() => handlePackageEmail('commercial')}
                    className="w-full bg-gray-800 hover:bg-gray-700 text-gray-200 border border-gray-700 py-2.5 px-4 rounded-xl font-semibold text-xs transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Mail size={15} />
                    <span>Kirim via Email Resmi</span>
                  </button>
                </div>
              </div>

              {/* 2. PAKET HOME GYM RUMAHAN */}
              <div className="bg-gray-950/85 backdrop-blur-md p-7 rounded-3xl border border-white/10 shadow-2xl flex flex-col justify-between hover:border-red-500/50 transition-all">
                <div>
                  <div className="text-3xl mb-3">🏋️‍♂️</div>
                  <h3 className="text-xl font-bold text-white mb-2">Paket Home Gym Rumahan</h3>
                  <p className="text-gray-400 text-sm mb-6 leading-relaxed">
                    Paket Promo Kombinasi Treadmill, Multi-Gym, Bench & Dumbbell Set untuk latihan pribadi di rumah. Gratis Pasang Surabaya!
                  </p>
                </div>

                <div className="space-y-2.5">
                  <button
                    onClick={() => handlePackageWA('homegym')}
                    className="w-full bg-green-500 hover:bg-green-600 text-white py-3 px-4 rounded-xl font-bold text-xs sm:text-sm transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md"
                  >
                    <MessageCircle size={16} />
                    <span>Konsultasi Paket WA</span>
                  </button>

                  <button
                    onClick={() => handlePackageEmail('homegym')}
                    className="w-full bg-gray-800 hover:bg-gray-700 text-gray-200 border border-gray-700 py-2.5 px-4 rounded-xl font-semibold text-xs transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Mail size={15} />
                    <span>Minta Katalog via Email</span>
                  </button>
                </div>
              </div>

              {/* 3. PAKET FITNESS OUTDOOR & TAMAN */}
              <div className="bg-gray-950/85 backdrop-blur-md p-7 rounded-3xl border border-white/10 shadow-2xl flex flex-col justify-between hover:border-red-500/50 transition-all">
                <div>
                  <div className="text-3xl mb-3">🌳</div>
                  <h3 className="text-xl font-bold text-white mb-2">Alat Fitness Outdoor</h3>
                  <p className="text-gray-400 text-sm mb-6 leading-relaxed">
                    Peralatan Gym Luar Ruangan Anti-Karat untuk Taman Kota, Perumahan, Sekolah, & Fasilitas Umum. Bersertifikat & Tahan Cuaca.
                  </p>
                </div>

                <div className="space-y-2.5">
                  <button
                    onClick={() => handlePackageWA('outdoor')}
                    className="w-full bg-green-500 hover:bg-green-600 text-white py-3 px-4 rounded-xl font-bold text-xs sm:text-sm transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md"
                  >
                    <MessageCircle size={16} />
                    <span>Penawaran Outdoor WA</span>
                  </button>

                  <button
                    onClick={() => handlePackageEmail('outdoor')}
                    className="w-full bg-gray-800 hover:bg-gray-700 text-gray-200 border border-gray-700 py-2.5 px-4 rounded-xl font-semibold text-xs transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Mail size={15} />
                    <span>Minta Proposal Email</span>
                  </button>
                </div>
              </div>

            </div>

          </div>
        </section>
      </main>
      
      <Footer isAdmin={false} logo={logo} onLogin={() => setShowAdminModal(true)} />
      <WhatsAppButton />
    </div>
  );
}

export default App;
