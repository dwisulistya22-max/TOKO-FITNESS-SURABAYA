import { useState, useEffect } from 'react';
import { 
  Package, ListTree, Settings, 
  LogOut, Plus, Trash2, Edit2, Save, Globe, 
  Phone, Mail, MapPin, Image as ImageIcon 
} from 'lucide-react';
import { PRODUCTS as INITIAL_PRODUCTS, CATEGORIES as INITIAL_CATEGORIES, STORE_CONFIG } from '../data/config';

interface AdminDashboardProps {
  onLogout: () => void;
  logo: string;
  onLogoChange: (val: string) => void;
}

const AdminDashboard = ({ onLogout, logo, onLogoChange }: AdminDashboardProps) => {
  const [activeTab, setActiveTab] = useState<'products' | 'categories' | 'settings'>('products');
  const [products, setProducts] = useState(INITIAL_PRODUCTS);
  const [categories, setCategories] = useState(INITIAL_CATEGORIES);
  const [contact, setContact] = useState({
    address: STORE_CONFIG.address,
    phone: STORE_CONFIG.phone,
    email: STORE_CONFIG.email,
    name: STORE_CONFIG.name
  });

  useEffect(() => {
    const savedProducts = localStorage.getItem('fitness_products');
    if (savedProducts) setProducts(JSON.parse(savedProducts));

    const savedCats = localStorage.getItem('fitness_categories');
    if (savedCats) setCategories(JSON.parse(savedCats));

    const savedContact = localStorage.getItem('fitness_contact');
    if (savedContact) setContact(JSON.parse(savedContact));
  }, []);

  const handleContactChange = (field: string, value: string) => {
    const updated = { ...contact, [field]: value };
    setContact(updated);
    localStorage.setItem('fitness_contact', JSON.stringify(updated));
  };

  const handleLogoFileSelect = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        if (file.size > 2 * 1024 * 1024) {
          alert('Ukuran file terlalu besar! Maksimal 2MB.');
          return;
        }
        const reader = new FileReader();
        reader.onloadend = () => {
          onLogoChange(reader.result as string);
        };
        reader.readAsDataURL(file);
      }
    };
    input.click();
  };

  const getCodeString = () => {
    return `export const STORE_CONFIG = {
  name: "${contact.name}",
  logo: "${logo}",
  slogan: "${STORE_CONFIG.slogan}",
  phone: "${contact.phone}",
  email: "${contact.email}",
  address: "${contact.address}",
  hero: ${JSON.stringify(STORE_CONFIG.hero, null, 2)}
};

export const CATEGORIES = ${JSON.stringify(categories, null, 2)};

export const PRODUCTS = ${JSON.stringify(products, null, 2)};
`;
  };

  const copyCode = () => {
    const code = getCodeString();
    navigator.clipboard.writeText(code);
    alert("✅ Kode Berhasil Disalin!\n\nSekarang silakan ke layar sebelah kiri, buka file 'src/data/config.ts', hapus semua isinya, lalu PASTE (Tempel) di sana.");
  };

  const exportCode = () => {
    const code = getCodeString();
    const blob = new Blob([code], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'DATA_UNTUK_GITHUB.txt'; // Diganti ke .txt agar mudah dibuka
    a.click();
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <div className="w-64 bg-gray-900 text-white flex flex-col">
        <div className="p-6 border-b border-gray-800">
          <img src={logo} alt="Logo" className="h-12 w-auto mb-4" />
          <h1 className="text-xl font-bold text-red-500">Super Admin</h1>
          <p className="text-xs text-gray-400">Surabaya Fitness Panel</p>
        </div>
        
        <nav className="flex-1 p-4 space-y-2">
          <button 
            onClick={() => setActiveTab('products')}
            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-colors ${activeTab === 'products' ? 'bg-red-600 text-white' : 'hover:bg-gray-800 text-gray-400'}`}
          >
            <Package size={20} />
            <span className="font-medium">Produk</span>
          </button>
          <button 
            onClick={() => setActiveTab('categories')}
            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-colors ${activeTab === 'categories' ? 'bg-red-600 text-white' : 'hover:bg-gray-800 text-gray-400'}`}
          >
            <ListTree size={20} />
            <span className="font-medium">Kategori</span>
          </button>
          <button 
            onClick={() => setActiveTab('settings')}
            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-colors ${activeTab === 'settings' ? 'bg-red-600 text-white' : 'hover:bg-gray-800 text-gray-400'}`}
          >
            <Settings size={20} />
            <span className="font-medium">Pengaturan Toko</span>
          </button>
        </nav>

        <div className="p-4 border-t border-gray-800 space-y-2">
          <button 
            onClick={copyCode}
            className="w-full flex items-center justify-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-xl text-sm font-bold transition-all"
          >
            <Save size={16} />
            <span>📋 Salin Kode config.ts</span>
          </button>
          <button 
            onClick={exportCode}
            className="w-full flex items-center justify-center space-x-2 bg-gray-800 hover:bg-gray-700 text-white px-4 py-2.5 rounded-xl text-sm font-bold transition-all"
          >
            <Save size={16} />
            <span>Ekspor DATA_WEBSITE.txt</span>
          </button>
          <button 
            onClick={onLogout}
            className="w-full flex items-center justify-center space-x-2 bg-gray-800 hover:bg-red-600 text-white px-4 py-2.5 rounded-xl text-sm font-bold transition-all"
          >
            <LogOut size={16} />
            <span>Keluar Dashboard</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto p-10">
        <header className="mb-10 flex justify-between items-center">
          <div>
            <h2 className="text-3xl font-black text-gray-900 capitalize">{activeTab === 'products' ? 'Manajemen Produk' : activeTab === 'categories' ? 'Manajemen Kategori' : 'Pengaturan Toko'}</h2>
            <p className="text-gray-500">Kelola informasi website Anda secara real-time.</p>
          </div>
          <button className="bg-red-600 text-white px-6 py-3 rounded-2xl font-bold flex items-center space-x-2 shadow-lg shadow-red-200">
            <Plus size={20} />
            <span>Tambah Data</span>
          </button>
        </header>

        {activeTab === 'products' && (
          <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
            <table className="w-full text-left">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="px-6 py-4 font-bold text-gray-600">Gambar</th>
                  <th className="px-6 py-4 font-bold text-gray-600">Nama Produk</th>
                  <th className="px-6 py-4 font-bold text-gray-600">Kategori</th>
                  <th className="px-6 py-4 font-bold text-gray-600">Harga</th>
                  <th className="px-6 py-4 font-bold text-gray-600">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {products.map((p: any) => (
                  <tr key={p.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <img src={p.image} className="w-12 h-12 rounded-lg object-cover" />
                    </td>
                    <td className="px-6 py-4 font-semibold text-gray-900">{p.name}</td>
                    <td className="px-6 py-4 text-gray-500 text-sm uppercase">{p.category}</td>
                    <td className="px-6 py-4 font-bold text-red-600">Rp {p.price.toLocaleString('id-ID')}</td>
                    <td className="px-6 py-4">
                      <div className="flex space-x-2">
                        <button className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"><Edit2 size={18} /></button>
                        <button className="p-2 text-red-600 hover:bg-red-50 rounded-lg"><Trash2 size={18} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="max-w-2xl bg-white p-8 rounded-3xl shadow-sm border border-gray-100 space-y-8">
            <div className="space-y-4">
              <label className="block font-bold text-gray-700">Logo Toko</label>
              <div className="flex items-center space-x-6">
                <img src={logo} className="h-20 w-auto bg-gray-100 p-2 rounded-xl border-2 border-red-300" alt="Logo Toko" />
                <div className="flex flex-col gap-2">
                  <label className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-xl font-bold text-sm flex items-center justify-center gap-2 cursor-pointer shadow-lg transition-all">
                    <ImageIcon size={18} />
                    <span>Pilih Logo Baru</span>
                    <input 
                      type="file" 
                      accept="image/*" 
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          if (file.size > 2 * 1024 * 1024) {
                            alert('Ukuran file terlalu besar! Maksimal 2MB.');
                            return;
                          }
                          const reader = new FileReader();
                          reader.onloadend = () => {
                            onLogoChange(reader.result as string);
                            alert('Logo berhasil diganti!');
                          };
                          reader.readAsDataURL(file);
                        }
                      }}
                      className="hidden"
                    />
                  </label>
                  <span className="text-xs text-gray-500">Ukuran maksimal: 2MB (JPG, PNG, WebP)</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-6">
              <div className="space-y-2">
                <label className="flex items-center space-x-2 font-bold text-gray-700 text-sm">
                  <Globe size={16} /> <span>Nama Toko</span>
                </label>
                <input 
                  type="text" value={contact.name} 
                  onChange={(e) => handleContactChange('name', e.target.value)}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl outline-none focus:border-red-500"
                />
              </div>
              <div className="space-y-2">
                <label className="flex items-center space-x-2 font-bold text-gray-700 text-sm">
                  <Phone size={16} /> <span>WhatsApp (62...)</span>
                </label>
                <input 
                  type="text" value={contact.phone}
                  onChange={(e) => handleContactChange('phone', e.target.value)}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl outline-none focus:border-red-500"
                />
              </div>
              <div className="space-y-2">
                <label className="flex items-center space-x-2 font-bold text-gray-700 text-sm">
                  <Mail size={16} /> <span>Email Toko</span>
                </label>
                <input 
                  type="text" value={contact.email}
                  onChange={(e) => handleContactChange('email', e.target.value)}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl outline-none focus:border-red-500"
                />
              </div>
              <div className="space-y-2">
                <label className="flex items-center space-x-2 font-bold text-gray-700 text-sm">
                  <MapPin size={16} /> <span>Alamat Lengkap</span>
                </label>
                <textarea 
                  rows={3} value={contact.address}
                  onChange={(e) => handleContactChange('address', e.target.value)}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl outline-none focus:border-red-500"
                />
              </div>
            </div>

            <div className="mt-10 p-6 bg-blue-50 rounded-2xl border border-blue-100">
              <h3 className="font-bold text-blue-900 mb-2 flex items-center gap-2">
                <Save size={18} /> KODE PERMANEN UNTUK GITHUB
              </h3>
              <p className="text-xs text-blue-700 mb-4 italic">Salin semua kode di bawah ini, lalu tempelkan ke file 'src/data/config.ts' di editor sebelah kiri agar editan Bapak tidak hilang.</p>
              <textarea 
                readOnly
                value={getCodeString()}
                className="w-full h-64 p-4 bg-gray-900 text-green-400 font-mono text-xs rounded-xl border-none outline-none"
                onClick={(e) => (e.target as HTMLTextAreaElement).select()}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
