import { ShieldCheck, Truck, Settings, Wallet } from 'lucide-react';
import { STORE_CONFIG } from '../data/config';

const features = [
  {
    icon: <ShieldCheck className="w-8 h-8 text-red-600" />,
    title: 'Produk Original',
    description: 'Semua alat fitness yang kami jual adalah 100% original dengan garansi resmi pabrik.'
  },
  {
    icon: <Truck className="w-8 h-8 text-red-600" />,
    title: 'Gratis Ongkir & Instalasi',
    description: 'Layanan pengiriman dan perakitan gratis untuk wilayah Surabaya dan sekitarnya.'
  },
  {
    icon: <Settings className="w-8 h-8 text-red-600" />,
    title: 'Layanan Service',
    description: 'Kami memiliki tim teknisi profesional untuk layanan purna jual dan perawatan rutin.'
  },
  {
    icon: <Wallet className="w-8 h-8 text-red-600" />,
    title: 'Harga Kompetitif',
    description: 'Dapatkan harga terbaik di kelasnya dengan pilihan cicilan 0% hingga 12 bulan.'
  }
];

const WhyChooseUs = () => {
  return (
    <section id="about" className="py-24 bg-gray-900 text-white overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div>
            <h2 className="text-3xl md:text-5xl font-bold mb-8 leading-tight">
              Mengapa Memilih <br />
              <span className="text-red-500">{STORE_CONFIG.name}?</span>
            </h2>
            <p className="text-gray-400 text-lg mb-12">
              Kami bukan sekadar toko alat fitness. Kami adalah partner perjalanan kesehatan Anda. Sejak 2010, kami telah melayani ribuan pelanggan mulai dari penggunaan rumah tangga hingga pusat kebugaran komersial.
            </p>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
              {features.map((feature, index) => (
                <div key={index} className="flex flex-col space-y-3">
                  <div className="bg-white/5 w-16 h-16 rounded-2xl flex items-center justify-center mb-2 border border-white/10">
                    {feature.icon}
                  </div>
                  <h3 className="text-xl font-bold">{feature.title}</h3>
                  <p className="text-gray-400 text-sm leading-relaxed">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
          
          <div className="relative">
            <div className="absolute -inset-4 bg-red-600/20 rounded-full blur-3xl"></div>
            <img 
              src="https://images.unsplash.com/photo-1571902943202-507ec2618e8f?q=80&w=1000&auto=format&fit=crop" 
              alt="Gym Setup" 
              className="relative rounded-3xl shadow-2xl border border-white/10"
            />
            <div className="absolute -bottom-6 -left-6 bg-red-600 p-8 rounded-2xl shadow-xl hidden md:block">
              <div className="text-4xl font-bold mb-1">14+</div>
              <div className="text-sm font-medium opacity-80">Tahun Pengalaman</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default WhyChooseUs;
