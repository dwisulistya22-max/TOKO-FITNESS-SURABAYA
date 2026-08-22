import Navbar from './components/Navbar';
import Hero from './components/Hero';
import Categories from './components/Categories';
import FeaturedProducts from './components/FeaturedProducts';
import WhyChooseUs from './components/WhyChooseUs';
import Testimonials from './components/Testimonials';
import Footer from './components/Footer';
import WhatsAppButton from './components/WhatsAppButton';
import AdminDashboard from './components/AdminDashboard';
import { useState, useEffect } from 'react';
import { STORE_CONFIG } from './data/config';

function App() {
  const [activeCategory, setActiveCategory] = useState('Semua');
  const [isAdmin, setIsAdmin] = useState(false);
  const [logo, setLogo] = useState(STORE_CONFIG.logo);
  const [showAdminPanel, setShowAdminPanel] = useState(false);

  // Load state login & logo
  useEffect(() => {
    const savedAdmin = localStorage.getItem('is_super_admin');
    if (savedAdmin === 'true') {
      setIsAdmin(true);
      setShowAdminPanel(true);
    }

    const savedLogo = localStorage.getItem('fitness_logo');
    // Pastikan logo yang tersimpan tidak kosong atau null
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

  const handleLogin = () => {
    if (isAdmin) {
      setShowAdminPanel(true);
      return;
    }
    
    const pass = prompt("Masukkan Password Super Admin:");
    if (pass === "admin123") {
      setIsAdmin(true);
      setShowAdminPanel(true);
      localStorage.setItem('is_super_admin', 'true');
      alert("Selamat Datang di Panel Kontrol Surabaya Fitness!");
    } else {
      alert("Password Salah!");
    }
  };

  const handleLogout = () => {
    setIsAdmin(false);
    setShowAdminPanel(false);
    localStorage.setItem('is_super_admin', 'false');
  };

  if (showAdminPanel) {
    return (
      <AdminDashboard 
        onLogout={handleLogout} 
        logo={logo} 
        onLogoChange={handleLogoChange} 
      />
    );
  }

  return (
    <div className="min-h-screen bg-white font-sans text-gray-900">
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
      <Footer isAdmin={isAdmin} logo={logo} onLogin={handleLogin} />
      <WhatsAppButton />
    </div>
  );
}

export default App;
