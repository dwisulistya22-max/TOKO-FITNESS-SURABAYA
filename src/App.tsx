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

const SANITY_STUDIO_URL = 'https://sanity.io/@oHJoh6fdC/studio/qi4rocc0';
const ADMIN_PASSWORD = 'admin123'; 

function App() {
  const [activeCategory, setActiveCategory] = useState('Semua');
  const [logo, setLogo] = useState(STORE_CONFIG.logo);

  const [showAdminModal, setShowAdminModal] = useState(false);
  const [passwordInput, setPasswordInput] = useState('');
  const [passwordError, setPasswordError] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

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

  // FUNGSI CHAT WA UNTUK PENAWARAN PAKET GYM
  const handlePackageWA = (jenisPaket: string) => {
    const waAdmin = (STORE_CONFIG.phone || '6281332345448').split(/[/,&\n]/)[0].replace(/\D/g, '');
    let message = '';

    if (jenisPaket === 'commercial') {
      message = `Halo Admin Surabaya Fitness 👋%0A%0ASaya tertarik dengan *PENAWARAN PAKET GYM COMMERCIAL / FITNESS CENTER*.%0AMohon kirimkan katalog paket, proposal, dan penawaran harga terbaik. Terima kasih!`;
    } else {
      message = `Halo Admin Surabaya Fitness 👋%0A%0ASaya tertarik dengan *PAKET PROMO HOME GYM / RUMAHAN*.%0AMohon rekomendasi paket alat fitness dan pricelist-nya. Terima kasih!`;
    }

    window.open(`https://wa.me/${waAdmin}?text=${message}`, '_blank');
  };

  return (
    <div className="min-h-screen bg-white font-sans text-gray-900 relative">
      
      {/* TOMBOL ADMIN PANEL DI KIRI BAWAH */}
      <button 
        onClick={() => setShowAdminModal(true)}
        className="fixed bottom-6 left-6 bg-slate-900 hover:bg-slate-800 text-white px-5 py-3 rounded-full font-bold shadow-2xl z-50 flex items-center gap-2 border-2 border-slate-700 transition-all hover:scale-105 cursor-pointer"
        title="Masuk ke Panel Sanity Studio"
      >
        🔐 <span>Admin Panel</span>
      </button>

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
                  <p className="text-sm text-gray-500 mt-1">Masukkan password untuk masuk ke Sanity Studio Surabaya Fitness</p>
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
              <div className="text-center py-4">
                <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center text-3xl mx-auto mb-3">
                  ✅
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Password Benar!</h3>
                <p className="text-sm text-gray-600 mb-6">Silakan klik tombol di bawah untuk membuka Sanity Studio Anda:</p>

                <a 
                  href={SANITY_STUDIO_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={handleCloseModal}
                  className="inline-block w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-4 rounded-xl shadow-xl transition-all text-center text-lg cursor-pointer"
                >
                  🚀 Buka Sanity Studio Sekarang &rarr;
                </a>
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
        
        {/* ====================================================================== */}
        {/* SECTION PENAWARAN PAKET GYM COMMERCIAL & HOME GYM (PENGGANTI NEWSLETTER) */}
        {/* ====================================================================== */}
        <section className="py-20 bg-gradient-to-r from-red-700 via-red-600 to-red-800 text-white relative overflow-hidden">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
            
            <span className="bg-black/30 text-white text-xs font-black uppercase tracking-widest px-4 py-1.5 rounded-full inline-block mb-4 border border-white/20">
              🔥 SPECIAL BUNDLE & DISTRIBUTOR OFFER
            </span>

            <h2 className="text-3xl sm:text-5xl font-black uppercase tracking-tight mb-4 leading-tight">
              PENAWARAN PAKET ALAT GYM & COMMERCIAL
            </h2>
            
            <p className="text-red-100 text-base sm:text-lg mb-10 max-w-2xl mx-auto leading-relaxed">
              Ingin buka Commercial Fitness Center, Gym Hotel, Instansi, atau butuh Paket Home Gym Rumahan Lengkap? Dapatkan penawaran harga distributor terbaik dari {STORE_CONFIG.name}.
            </p>

            {/* DUA KARTU PILIHAN PAKET */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto text-left">
              
              {/* PAKET COMMERCIAL GYM */}
              <div className="bg-gray-950/80 backdrop-blur-md p-8 rounded-3xl border border-white/10 shadow-2xl flex flex-col justify-between hover:border-red-500/50 transition-all">
                <div>
                  <div className="text-3xl mb-3">🏢</div>
                  <h3 className="text-xl font-bold text-white mb-2">Paket Commercial Gym</h3>
                  <p className="text-gray-400 text-sm mb-6 leading-relaxed">
                    Khusus Pembuatan Fitness Center, Gym Hotel, Apartment, Kantor & Instansi. Lengkap dengan Garansi Onsite & Teknisi.
                  </p>
                </div>
                <button
                  onClick={() => handlePackageWA('commercial')}
                  className="w-full bg-red-600 hover:bg-red-700 text-white py-3.5 px-6 rounded-xl font-bold text-sm transition-all shadow-lg shadow-red-600/30 flex items-center justify-center gap-2 cursor-pointer"
                >
                  📄 Minta Proposal & Price List WA &rarr;
                </button>
              </div>

              {/* PAKET HOME GYM RUMAHAN */}
              <div className="bg-gray-950/80 backdrop-blur-md p-8 rounded-3xl border border-white/10 shadow-2xl flex flex-col justify-between hover:border-red-500/50 transition-all">
                <div>
                  <div className="text-3xl mb-3">🏋️‍♂️</div>
                  <h3 className="text-xl font-bold text-white mb-2">Paket Home Gym Rumahan</h3>
                  <p className="text-gray-400 text-sm mb-6 leading-relaxed">
                    Paket Promo Kombinasi Treadmill, Multi-Gym, Bench & Dumbbell Set untuk latihan pribadi di rumah. Gratis Pasang Surabaya!
                  </p>
                </div>
                <button
                  onClick={() => handlePackageWA('homegym')}
                  className="w-full bg-green-500 hover:bg-green-600 text-white py-3.5 px-6 rounded-xl font-bold text-sm transition-all shadow-lg shadow-green-500/30 flex items-center justify-center gap-2 cursor-pointer"
                >
                  💬 Konsultasi Paket Home Gym WA &rarr;
                </button>
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
