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

function App() {
  const [activeCategory, setActiveCategory] = useState('Semua');
  const [logo, setLogo] = useState(STORE_CONFIG.logo);

  // Load logo dari local (sebagai cadangan awal)
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

  // =========================================================
  // UPGRADE: LOGIN ADMIN LANGSUNG KE SANITY STUDIO
  // Tidak pakai prompt manual lagi, langsung masuk ke panel canggih
  // =========================================================
  const handleLogin = () => {
    window.open('https://856jrik3.sanity.studio', '_blank');
  };

  return (
    <div className="min-h-screen bg-white font-sans text-gray-900 relative">
      
      {/* TOMBOL ADMIN SANITY MELAYANG DI KIRI BAWAH (Agar mudah diakses pemilik web) */}
      <button 
        onClick={handleLogin}
        className="fixed bottom-6 left-6 bg-gray-900 text-white px-4 py-3 rounded-full font-bold shadow-lg hover:bg-gray-800 z-50 flex items-center gap-2 border-2 border-gray-700"
        title="Masuk ke Panel Sanity"
      >
        🔐 <span className="hidden sm:inline">Admin Panel</span>
      </button>

      <Navbar isAdmin={false} logo={logo} onLogoChange={handleLogoChange} />
      
      <main>
        <Hero isAdmin={false} logo={logo} onLogoChange={handleLogoChange} />
        <Categories onSelectCategory={setActiveCategory} isAdmin={false} />
        
        {/* DAFTAR PRODUK */}
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
      
      {/* Saat footer "Login Admin" diklik, otomatis buka Sanity */}
      <Footer isAdmin={false} logo={logo} onLogin={handleLogin} />
      <WhatsAppButton />
    </div>
  );
}

export default App;
