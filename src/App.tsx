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

  // 🛡️ FITUR KEAMANAN
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey && (e.key === 'c' || e.key === 'C' || e.key === 's' || e.key === 'S' || e.key === 'u' || e.key === 'U')) || e.key === 'F12') {
        e.preventDefault();
      }
    };
    const handleContextMenu = (e: MouseEvent) => { e.preventDefault(); };
    window.addEventListener('keydown', handleKeyDown);
    document.addEventListener('contextmenu', handleContextMenu);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('contextmenu', handleContextMenu);
    };
  }, []);

  useEffect(() => {
    const savedLogo = localStorage.getItem('fitness_logo');
    setLogo(savedLogo && savedLogo.length > 5 ? savedLogo : STORE_CONFIG.logo);
  }, []);

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

  // 📥 FUNGSI DOWNLOAD KATALOG WA (VERSI LEBIH KUAT)
  const handleDownloadWACatalog = async () => {
    const projectId = 'qi4rocc0';
    const dataset = 'production';
    const query = encodeURIComponent(`*[_type == "product"]{
      _id, name, price, description,
      "image": coalesce(image.asset->url, foto.asset->url, photo.asset->url, "")
    }`);
    
    const url = `https://${projectId}.api.sanity.io/v2021-10-21/data/query/${dataset}?query=${query}`;

    try {
      const res = await fetch(url, { cache: 'no-store' });
      const data = await res.json();

      if (!data.result || data.result.length === 0) {
        alert("Data produk kosong di Sanity.");
        return;
      }

      let csv = 'id,title,description,availability,condition,price,link,image_link,brand\n';

      data.result.forEach((p: any) => {
        const id = p._id;
        const title = `"${(p.name || '').replace(/"/g, '""')}"`;
        const desc = `"${(p.description || 'Peralatan fitness kualitas premium').replace(/"/g, '""').replace(/\n/g, ' ')}"`;
        const price = `${p.price || 0} IDR`;
        const img = p.image || 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?q=80&w=800';
        
        csv += `${id},${title},${desc},in stock,new,${price},https://tokofitnesssurabaya.com,${img},"Toko Fitness Surabaya"\n`;
      });

      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = `katalog-wa-fitness-${new Date().toLocaleDateString()}.csv`;
      link.click();
    } catch (err) {
      console.error(err);
      alert("Gagal Download! Pastikan Anda sudah melakukan LANGKAH 1 (Setting CORS) di dashboard Sanity.");
    }
  };

  const handlePackageWA = (jenisPaket: string) => {
    const waAdmin = (STORE_CONFIG.phone || '6281332345448').split(/[/,&\n]/)[0].replace(/\D/g, '');
    let msg = jenisPaket === 'commercial' ? 'PAKET GYM COMMERCIAL' : jenisPaket === 'outdoor' ? 'ALAT FITNESS OUTDOOR' : 'PAKET HOME GYM';
    window.open(`https://wa.me/${waAdmin}?text=Halo Admin, saya tertarik dengan *${msg}*`, '_blank');
  };

  const handlePackageEmail = (jenis: string) => {
    window.location.href = `mailto:dwisulistya22@gmail.com?subject=Tanya Paket ${jenis}`;
  };

  return (
    <div className="min-h-screen bg-white font-sans text-gray-900 relative select-none">
      {showAdminModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[999] flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl relative">
            <button onClick={handleCloseModal} className="absolute top-4 right-4 text-gray-400 text-2xl w-10 h-10 hover:bg-gray-100 rounded-full">×</button>
            {!isAuthenticated ? (
              <form onSubmit={handlePasswordSubmit} className="text-center">
                <div className="text-3xl mb-3">🔐</div>
                <h3 className="text-2xl font-bold mb-6">Admin Login</h3>
                <input type="password" placeholder="Password Admin..." value={passwordInput} onChange={(e) => setPasswordInput(e.target.value)} className="w-full px-4 py-3 rounded-xl border mb-4 text-center font-bold" autoFocus />
                {passwordError && <p className="text-red-600 text-xs mb-4">❌ Password salah!</p>}
                <button type="submit" className="w-full bg-red-600 text-white font-bold py-3.5 rounded-xl">Masuk</button>
              </form>
            ) : (
              <div className="text-center space-y-4">
                <div className="text-3xl mb-3">✅</div>
                <h3 className="text-2xl font-bold">Menu Admin</h3>
                <a href={SANITY_STUDIO_URL} target="_blank" rel="noopener noreferrer" className="block w-full bg-slate-900 text-white font-bold py-3.5 rounded-xl">🚀 Buka Sanity Studio</a>
                <button onClick={handleDownloadWACatalog} className="w-full bg-green-600 text-white font-bold py-3.5 rounded-xl flex items-center justify-center gap-2"><Download size={18} /> Download CSV WA</button>
              </div>
            )}
          </div>
        </div>
      )}

      <Navbar onSelectCategory={setActiveCategory} />
      <main>
        <Hero />
        <Categories onSelectCategory={setActiveCategory} />
        <FeaturedProducts activeCategory={activeCategory} />
        <WhyChooseUs />
        <Testimonials />
        <section className="py-20 bg-gradient-to-r from-red-700 to-red-800 text-white text-center">
          <h2 className="text-3xl sm:text-5xl font-black mb-12">PENAWARAN PAKET KHUSUS</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto px-4">
            {['commercial', 'homegym', 'outdoor'].map((pk) => (
              <div key={pk} className="bg-gray-950/80 p-8 rounded-3xl border border-white/10">
                <h3 className="text-xl font-bold mb-4 uppercase">{pk}</h3>
                <button onClick={() => handlePackageWA(pk)} className="w-full bg-green-500 py-3 rounded-xl font-bold mb-2 flex items-center justify-center gap-2"><MessageCircle size={18}/> Chat WA</button>
                <button onClick={() => handlePackageEmail(pk)} className="w-full bg-gray-800 py-3 rounded-xl font-bold">Minta Email</button>
              </div>
            ))}
          </div>
        </section>
      </main>
      <Footer onLogin={() => setShowAdminModal(true)} />
      <WhatsAppButton />
    </div>
  );
}

export default App;
