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
    setIsAuthenticated(false);
  };

  // 📥 FUNGSI DOWNLOAD KATALOG WA (VERSI FINAL)
  const handleDownloadWACatalog = async () => {
    // Kita coba tarik dari kedua project ID Anda
    const ids = ['qi4rocc0', '856jrik3'];
    const dataset = 'production';
    const query = encodeURIComponent(`*[_type == "product"]{
      _id, name, price, description,
      "image": coalesce(image.asset->url, foto.asset->url, photo.asset->url, "")
    }`);

    let products = [];

    for (const id of ids) {
      try {
        const res = await fetch(`https://${id}.api.sanity.io/v2024-01-01/data/query/${dataset}?query=${query}`, { cache: 'no-store' });
        const data = await res.json();
        if (data.result && data.result.length > 0) {
          products = data.result;
          break;
        }
      } catch (err) { console.error("Gagal ambil data dari ID:", id); }
    }

    if (products.length === 0) {
      alert("Gagal mendownload! Data produk tidak ditemukan atau koneksi diblokir Sanity. Pastikan sudah tambah CORS origin bintang (*)");
      return;
    }

    let csv = 'id,title,description,availability,condition,price,link,image_link,brand\n';
    products.forEach((p: any) => {
      const title = `"${(p.name || '').replace(/"/g, '""')}"`;
      const desc = `"${(p.description || 'Peralatan fitness premium').replace(/"/g, '""').replace(/\n/g, ' ')}"`;
      const price = `${p.price || 0} IDR`;
      const img = p.image || 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?q=80&w=800';
      csv += `${p._id},${title},${desc},in stock,new,${price},https://tokofitnesssurabaya.com,${img},"Toko Fitness Surabaya"\n`;
    });

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `katalog-wa-surabaya-fitness.csv`;
    link.click();
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
                <button type="submit" className="w-full bg-red-600 text-white font-bold py-3.5 rounded-xl shadow-lg">Masuk</button>
              </form>
            ) : (
              <div className="text-center space-y-4 py-4">
                <div className="text-3xl mb-3">✅</div>
                <h3 className="text-2xl font-bold">Akses Admin Berhasil</h3>
                <a href={SANITY_STUDIO_URL} target="_blank" rel="noopener noreferrer" className="block w-full bg-slate-900 text-white font-bold py-4 rounded-xl shadow-md">🚀 Buka Sanity Studio</a>
                <button onClick={handleDownloadWACatalog} className="w-full bg-green-600 text-white font-bold py-4 rounded-xl shadow-md flex items-center justify-center gap-2 cursor-pointer hover:bg-green-700 transition-colors">
                  <Download size={20} /> Download CSV WA Business
                </button>
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
        
        {/* SECTION PENAWARAN PAKET */}
        <section className="py-20 bg-gradient-to-r from-red-700 to-red-800 text-white text-center">
          <div className="max-w-7xl mx-auto px-4">
            <h2 className="text-3xl sm:text-5xl font-black mb-12 uppercase italic">Penawaran Paket Khusus</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {['Commercial Gym', 'Home Gym', 'Outdoor Fitness'].map((item) => (
                <div key={item} className="bg-gray-950/80 p-8 rounded-3xl border border-white/10 shadow-xl">
                  <h3 className="text-xl font-bold mb-6">{item}</h3>
                  <button onClick={() => window.open(`https://wa.me/6281332345448?text=Tanya%20Paket%20${item}`, '_blank')} className="w-full bg-green-500 py-3 rounded-xl font-bold mb-3 flex items-center justify-center gap-2">
                    <MessageCircle size={18}/> Chat Admin
                  </button>
                  <button onClick={() => window.location.href='mailto:dwisulistya22@gmail.com'} className="w-full bg-transparent border border-white/20 py-3 rounded-xl font-bold hover:bg-white/10 transition-colors">
                    Minta Proposal
                  </button>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>
      <Footer onLogin={() => setShowAdminModal(true)} />
      <WhatsAppButton />
    </div>
  );
}

export default App;
