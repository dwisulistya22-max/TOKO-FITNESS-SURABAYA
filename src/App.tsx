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

// LINK SANITY STUDIO ANDA
// ... (kode import di atasnya tetap sama)

// LINK SANITY STUDIO LANGSUNG KE FOLDER EDIT
const SANITY_STUDIO_URL = 'https://sanity.io/@oHJoh6fdC/studio/qi4rocc0/default/structure';

// 🔑 PASSWORD ADMIN
const ADMIN_PASSWORD = 'admin123'; 

// ... (kode ke bawahnya tetap sama)

function App() {
  const [activeCategory, setActiveCategory] = useState('Semua');
  const [logo, setLogo] = useState(STORE_CONFIG.logo);

  // State untuk Pop-Up Password Admin
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

  // Cek Password saat form dikirim
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

      {/* ========================================================= */}
      {/* MODAL POP-UP PASSWORD (BEBAS BLOKIR GOOGLE CHROME)       */}
      {/* ========================================================= */}
      {showAdminModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[999] flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl relative border border-gray-100">
            
            {/* Tombol Close (X) */}
            <button 
              onClick={handleCloseModal}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-800 text-2xl font-bold w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-100"
            >
              ×
            </button>

            {!isAuthenticated ? (
              /* FORM INPUT PASSWORD */
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
              /* TAMPILAN JIKA PASSWORD BENAR (LINK LANGSUNG RESMI) */
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
        
        {/* Newsletter Section */}
        <section className="py-20 bg-red-600">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl font-bold text-white mb-4">Dapatkan Update Promo Terbaru</h2>
            <p className="text-red-100 mb-8 max-w-xl mx-auto">
              Berlangganan newsletter kami untuk mendapatkan info produk terbaru dan diskon eksklusif {STORE_CONFIG.name}.
            </p>
            <form className="max-w-md mx-auto flex gap-4" onSubmit={(e) => e.preventDefault()}>
              <input 
                type="email" 
                placeholder="Alamat Email Anda" 
                className="flex-1 px-6 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-400"
              />
              <button className="bg-gray-900 text-white px-8 py-3 rounded-xl font-bold hover:bg-gray-800 transition-colors">
                Daftar
              </button>
            </form>
          </div>
        </section>
      </main>
      
      <Footer isAdmin={false} logo={logo} onLogin={() => setShowAdminModal(true)} />
      <WhatsAppButton />
    </div>
  );
}

export default App;
