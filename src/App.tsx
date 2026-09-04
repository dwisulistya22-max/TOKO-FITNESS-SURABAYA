import Navbar from './components/Navbar';
import Hero from './components/Hero';
import Categories from './components/Categories';
import FeaturedProducts from './components/FeaturedProducts';
import WhyChooseUs from './components/WhyChooseUs';
import Testimonials from './components/Testimonials';
import FAQ from "./components/FAQ";
import Footer from './components/Footer';
import WhatsAppButton from './components/WhatsAppButton';
import { useState, useEffect } from 'react';
import { STORE_CONFIG } from './data/config';
import { MessageCircle, Download, CheckCircle2, Building2, Dumbbell, Trees, Sparkles } from 'lucide-react';

const SANITY_STUDIO_URL = 'https://sanity.io/@oHJoh6fdC/studio/qi4rocc0';
const ADMIN_PASSWORD = 'dwie_300776'; 

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
    setIsAuthenticated(false);
  };

  // 📥 FUNGSI DOWNLOAD KATALOG WA
    // 📥 FUNGSI DOWNLOAD KATALOG WA (SUDAH DIPERBAIKI + KATEGORI)
    // 📥 FUNGSI DOWNLOAD KATALOG WA (SUDAH DIPERBAIKI + KATEGORI)
  const handleDownloadWACatalog = async () => {
    const ids = ['qi4rocc0', '856jrik3'];
    const dataset = 'production';

    // ✅ Sekarang mengambil category juga dari Sanity
    const query = encodeURIComponent(`*[_type == "product"]{
      _id,
      name,
      price,
      description,
      category,
      "image": coalesce(image.asset->url, foto.asset->url, photo.asset->url, "")
    }`);

    let products: any[] = [];

    for (const id of ids) {
      try {
        const res = await fetch(
          `https://${id}.api.sanity.io/v2024-01-01/data/query/${dataset}?query=${query}`,
          { cache: 'no-store' }
        );
        const data = await res.json();
        if (data.result && data.result.length > 0) {
          products = data.result;
          break;
        }
      } catch (err) {
        console.error('Gagal ambil data dari ID:', id);
      }
    }

    if (products.length === 0) {
      alert('Gagal mendownload! Data produk tidak ditemukan.');
      return;
    }

    // Helper: amankan teks agar CSV tidak berantakan
    const esc = (val: any) => {
      const str = String(val ?? '')
        .replace(/"/g, '""')
        .replace(/\r?\n/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();
      return `"${str}"`;
    };

    // Helper: format kategori untuk WA Business
    // Hasilnya: "Cardio > Treadmill" atau nama kategori apa adanya
    const formatProductType = (category: string, name: string) => {
      const cat = (category || 'Fitness').trim();
      // Jika nama produk mengandung kata kunci, buat sub-kategori lebih spesifik
      const lower = (name || '').toLowerCase();
      let sub = '';
      if (lower.includes('treadmill')) sub = 'Treadmill';
      else if (lower.includes('sepeda') || lower.includes('bike')) sub = 'Sepeda Statis';
      else if (lower.includes('dumbbell') || lower.includes('dumbel')) sub = 'Dumbbell';
      else if (lower.includes('barbell')) sub = 'Barbell';
      else if (lower.includes('bench')) sub = 'Bench';
      else if (lower.includes('rack') || lower.includes('smith')) sub = 'Power Rack';
      else if (lower.includes('leg press')) sub = 'Leg Press';
      else if (lower.includes('multi gym') || lower.includes('multigym')) sub = 'Multi Gym';
      else if (lower.includes('matras') || lower.includes('mat ')) sub = 'Matras';
      else if (lower.includes('rubber') || lower.includes('flooring')) sub = 'Flooring';
      else if (lower.includes('plate') || lower.includes('beban')) sub = 'Weight Plate';
      else if (lower.includes('pull up') || lower.includes('pullup')) sub = 'Pull Up Bar';

      return sub ? `${cat} > ${sub}` : cat;
    };

    // ✅ Header resmi Meta/WA Catalog + product_type
    const headers = [
      'id',
      'title',
      'description',
      'availability',
      'condition',
      'price',
      'link',
      'image_link',
      'brand',
      'product_type',
      'google_product_category',
    ];

    let csv = headers.join(',') + '\n';

    products.forEach((p: any) => {
      const title = p.name || 'Produk Fitness';
      const desc = p.description || 'Peralatan fitness premium dari Toko Fitness Surabaya';
      const priceNum = Number(p.price) || 0;
      const price = `${priceNum} IDR`; // format wajib Meta
      const img =
        p.image ||
        'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?q=80&w=800';
      const productType = formatProductType(p.category, p.name);
      // 4997 = Sporting Goods > Exercise & Fitness (kode resmi Google)
      const googleCat = '4997';

      const row = [
        esc(p._id),
        esc(title),
        esc(desc),
        esc('in stock'),
        esc('new'),
        esc(price),
        esc('https://tokofitnesssurabaya.com'),
        esc(img),
        esc('Toko Fitness Surabaya'),
        esc(productType),       // ← INI YANG BIKIN KATEGORI RAPI DI WA
        esc(googleCat),
      ];

      csv += row.join(',') + '\n';
    });

    // Tambahkan BOM agar Excel Indonesia tidak berantakan
    const blob = new Blob(['\uFEFF' + csv], {
      type: 'text/csv;charset=utf-8;',
    });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `katalog-wa-surabaya-fitness.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

    // ✅ Sekarang mengambil category juga dari Sanity
    const query = encodeURIComponent(`*[_type == "product"]{
      _id,
      name,
      price,
      description,
      category,
      "image": coalesce(image.asset->url, foto.asset->url, photo.asset->url, "")
    }`);

    let products: any[] = [];

    for (const id of ids) {
      try {
        const res = await fetch(
          `https://${id}.api.sanity.io/v2024-01-01/data/query/${dataset}?query=${query}`,
          { cache: 'no-store' }
        );
        const data = await res.json();
        if (data.result && data.result.length > 0) {
          products = data.result;
          break;
        }
      } catch (err) {
        console.error('Gagal ambil data dari ID:', id);
      }
    }

    if (products.length === 0) {
      alert('Gagal mendownload! Data produk tidak ditemukan.');
      return;
    }

    // Helper: amankan teks agar CSV tidak berantakan
    const esc = (val: any) => {
      const str = String(val ?? '')
        .replace(/"/g, '""')
        .replace(/\r?\n/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();
      return `"${str}"`;
    };

    // Helper: format kategori untuk WA Business
    // Hasilnya: "Cardio > Treadmill" atau nama kategori apa adanya
    const formatProductType = (category: string, name: string) => {
      const cat = (category || 'Fitness').trim();
      // Jika nama produk mengandung kata kunci, buat sub-kategori lebih spesifik
      const lower = (name || '').toLowerCase();
      let sub = '';
      if (lower.includes('treadmill')) sub = 'Treadmill';
      else if (lower.includes('sepeda') || lower.includes('bike')) sub = 'Sepeda Statis';
      else if (lower.includes('dumbbell') || lower.includes('dumbel')) sub = 'Dumbbell';
      else if (lower.includes('barbell')) sub = 'Barbell';
      else if (lower.includes('bench')) sub = 'Bench';
      else if (lower.includes('rack') || lower.includes('smith')) sub = 'Power Rack';
      else if (lower.includes('leg press')) sub = 'Leg Press';
      else if (lower.includes('multi gym') || lower.includes('multigym')) sub = 'Multi Gym';
      else if (lower.includes('matras') || lower.includes('mat ')) sub = 'Matras';
      else if (lower.includes('rubber') || lower.includes('flooring')) sub = 'Flooring';
      else if (lower.includes('plate') || lower.includes('beban')) sub = 'Weight Plate';
      else if (lower.includes('pull up') || lower.includes('pullup')) sub = 'Pull Up Bar';

      return sub ? `${cat} > ${sub}` : cat;
    };

    // ✅ Header resmi Meta/WA Catalog + product_type
    const headers = [
      'id',
      'title',
      'description',
      'availability',
      'condition',
      'price',
      'link',
      'image_link',
      'brand',
      'product_type',
      'google_product_category',
    ];

    let csv = headers.join(',') + '\n';

    products.forEach((p: any) => {
      const title = p.name || 'Produk Fitness';
      const desc = p.description || 'Peralatan fitness premium dari Toko Fitness Surabaya';
      const priceNum = Number(p.price) || 0;
      const price = `${priceNum} IDR`; // format wajib Meta
      const img =
        p.image ||
        'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?q=80&w=800';
      const productType = formatProductType(p.category, p.name);
      // 4997 = Sporting Goods > Exercise & Fitness (kode resmi Google)
      const googleCat = '4997';

      const row = [
        esc(p._id),
        esc(title),
        esc(desc),
        esc('in stock'),
        esc('new'),
        esc(price),
        esc('https://tokofitnesssurabaya.com'),
        esc(img),
        esc('Toko Fitness Surabaya'),
        esc(productType),       // ← INI YANG BIKIN KATEGORI RAPI DI WA
        esc(googleCat),
      ];

      csv += row.join(',') + '\n';
    });

    // Tambahkan BOM agar Excel Indonesia tidak berantakan
    const blob = new Blob(['\uFEFF' + csv], {
      type: 'text/csv;charset=utf-8;',
    });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `katalog-wa-surabaya-fitness.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  // FUNGSI CHAT WA UNTUK PENAWARAN PAKET
  const handlePackageWA = (jenisPaket: string) => {
    const waAdmin = (STORE_CONFIG.phone || '6281332345448').split(/[/,&\n]/)[0].replace(/\D/g, '');
    let msg = '';
    if (jenisPaket === 'commercial') {
      msg = 'Halo Admin Toko Fitness Surabaya 👋%0A%0ASaya ingin konsultasi mengenai *PENAWARAN PAKET GYM COMMERCIAL / FITNESS CENTER*. Mohon informasi katalog & penawarannya.';
    } else if (jenisPaket === 'outdoor') {
      msg = 'Halo Admin Toko Fitness Surabaya 👋%0A%0ASaya ingin bertanya tentang *ALAT FITNESS OUTDOOR / TAMAN / FASILITAS PUBLIK*. Mohon kirimkan pricelist-nya.';
    } else {
      msg = 'Halo Admin Toko Fitness Surabaya 👋%0A%0ASaya berminat dengan *PAKET PROMO HOME GYM RUMAHAN*. Mohon rekomendasi paket terbaik untuk rumah saya.';
    }
    window.open(`https://wa.me/${waAdmin}?text=${msg}`, '_blank');
  };

  return (
    <div className="min-h-screen bg-white font-sans text-gray-900 relative select-none">
      
      {/* MODAL ADMIN */}
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
<FAQ />
        
        {/* 🔥 SECTION PENAWARAN PAKET KHUSUS (100% WA DIRECT - TANPA EMAIL) 🔥 */}
        <section className="py-20 bg-gradient-to-br from-red-900 via-red-700 to-slate-950 text-white relative overflow-hidden">
          
          <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none" />
          
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
            
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md text-amber-300 text-xs font-black uppercase tracking-widest px-4 py-2 rounded-full mb-4 border border-amber-300/30">
              <Sparkles size={14} className="animate-spin" />
              SPECIAL BUNDLE & KONSULTASI LANGSUNG
            </div>

            <h2 className="text-3xl sm:text-5xl font-black uppercase tracking-tight italic mb-4 leading-tight">
              PENAWARAN PAKET KHUSUS
            </h2>
            
            <p className="text-red-100 text-sm sm:text-base mb-14 max-w-2xl mx-auto leading-relaxed">
              Konsultasikan kebutuhan pembuatan Gym, Alat Outdoor, hingga Home Gym Anda bersama tim ahli Toko Fitness Surabaya. Dapatkan penawaran harga distributor terbaik!
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto text-left">
              
              {/* 1. PAKET COMMERCIAL GYM */}
              <div className="bg-slate-900/90 backdrop-blur-md p-8 rounded-3xl border border-slate-700/80 shadow-2xl flex flex-col justify-between hover:border-red-500/80 transition-all transform hover:-translate-y-1.5 group">
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-14 h-14 rounded-2xl bg-red-600/20 text-red-500 border border-red-500/30 flex items-center justify-center">
                      <Building2 size={28} />
                    </div>
                    <span className="bg-red-600 text-white text-[10px] font-black uppercase px-3 py-1 rounded-full tracking-wider">
                      Terpopuler
                    </span>
                  </div>

                  <h3 className="text-2xl font-black text-white mb-2 group-hover:text-red-400 transition-colors">
                    Commercial Gym
                  </h3>
                  <p className="text-slate-300 text-xs mb-6 leading-relaxed">
                    Cocok untuk pembuatan Fitness Center, Gym Hotel, Apartment, Kantor, & Instansi Resmi.
                  </p>

                  <ul className="space-y-2.5 text-xs text-slate-300 mb-8 border-t border-slate-800 pt-4">
                    <li className="flex items-center gap-2"><CheckCircle2 size={14} className="text-green-400 shrink-0"/> Free Konsultasi & Layout Ruangan</li>
                    <li className="flex items-center gap-2"><CheckCircle2 size={14} className="text-green-400 shrink-0"/> Garansi Resmi & Tim Teknisi</li>
                    <li className="flex items-center gap-2"><CheckCircle2 size={14} className="text-green-400 shrink-0"/> Pengiriman & Pemasangan Onsite</li>
                  </ul>
                </div>

                <button
                  onClick={() => handlePackageWA('commercial')}
                  className="w-full bg-green-500 hover:bg-green-600 text-white py-4 px-4 rounded-2xl font-bold text-xs sm:text-sm transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg hover:shadow-green-500/25"
                >
                  <MessageCircle size={18} />
                  <span>Konsultasi Paket via WhatsApp</span>
                </button>
              </div>

              {/* 2. PAKET HOME GYM RUMAHAN */}
              <div className="bg-slate-900/90 backdrop-blur-md p-8 rounded-3xl border border-slate-700/80 shadow-2xl flex flex-col justify-between hover:border-red-500/80 transition-all transform hover:-translate-y-1.5 group">
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-14 h-14 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center">
                      <Dumbbell size={28} />
                    </div>
                    <span className="bg-amber-500 text-black text-[10px] font-black uppercase px-3 py-1 rounded-full tracking-wider">
                      Hemat & Praktis
                    </span>
                  </div>

                  <h3 className="text-2xl font-black text-white mb-2 group-hover:text-amber-400 transition-colors">
                    Home Gym Rumahan
                  </h3>
                  <p className="text-slate-300 text-xs mb-6 leading-relaxed">
                    Paket bundling hemat Treadmill, Multi-Gym, Bench, & Dumbbell untuk latihan pribadi di rumah.
                  </p>

                  <ul className="space-y-2.5 text-xs text-slate-300 mb-8 border-t border-slate-800 pt-4">
                    <li className="flex items-center gap-2"><CheckCircle2 size={14} className="text-green-400 shrink-0"/> Paket Kombinasi Hemat Tempat</li>
                    <li className="flex items-center gap-2"><CheckCircle2 size={14} className="text-green-400 shrink-0"/> Unit 100% Baru & Bergaransi</li>
                    <li className="flex items-center gap-2"><CheckCircle2 size={14} className="text-green-400 shrink-0"/> Gratis Pasang Wilayah Surabaya</li>
                  </ul>
                </div>

                <button
                  onClick={() => handlePackageWA('homegym')}
                  className="w-full bg-green-500 hover:bg-green-600 text-white py-4 px-4 rounded-2xl font-bold text-xs sm:text-sm transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg hover:shadow-green-500/25"
                >
                  <MessageCircle size={18} />
                  <span>Konsultasi Paket via WhatsApp</span>
                </button>
              </div>

              {/* 3. PAKET FITNESS OUTDOOR */}
              <div className="bg-slate-900/90 backdrop-blur-md p-8 rounded-3xl border border-slate-700/80 shadow-2xl flex flex-col justify-between hover:border-red-500/80 transition-all transform hover:-translate-y-1.5 group">
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-14 h-14 rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center">
                      <Trees size={28} />
                    </div>
                    <span className="bg-emerald-600 text-white text-[10px] font-black uppercase px-3 py-1 rounded-full tracking-wider">
                      Tahan Cuaca
                    </span>
                  </div>

                  <h3 className="text-2xl font-black text-white mb-2 group-hover:text-emerald-400 transition-colors">
                    Outdoor Fitness
                  </h3>
                  <p className="text-slate-300 text-xs mb-6 leading-relaxed">
                    Alat olahraga luar ruangan bahan tebal anti-karat untuk Taman Kota, Perumahan, & Fasilitas Publik.
                  </p>

                  <ul className="space-y-2.5 text-xs text-slate-300 mb-8 border-t border-slate-800 pt-4">
                    <li className="flex items-center gap-2"><CheckCircle2 size={14} className="text-green-400 shrink-0"/> Bahan Tebal Anti-Karat & Panas</li>
                    <li className="flex items-center gap-2"><CheckCircle2 size={14} className="text-green-400 shrink-0"/> Standar Keamanan Fasilitas Publik</li>
                    <li className="flex items-center gap-2"><CheckCircle2 size={14} className="text-green-400 shrink-0"/> Siap Pengadaan Instansi / Developer</li>
                  </ul>
                </div>

                <button
                  onClick={() => handlePackageWA('outdoor')}
                  className="w-full bg-green-500 hover:bg-green-600 text-white py-4 px-4 rounded-2xl font-bold text-xs sm:text-sm transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg hover:shadow-green-500/25"
                >
                  <MessageCircle size={18} />
                  <span>Konsultasi Paket via WhatsApp</span>
                </button>
              </div>

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
