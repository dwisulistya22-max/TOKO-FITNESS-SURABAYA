import { useEffect, useMemo, useState } from 'react';
import { MapPin, Navigation, Clock3, Phone } from 'lucide-react';
import { STORE_CONFIG } from '../data/config';

const LocationSection = () => {
  const [contact, setContact] = useState({
    address: STORE_CONFIG.address,
    phone: STORE_CONFIG.phone,
    email: STORE_CONFIG.email,
  });

  useEffect(() => {
    const saved = localStorage.getItem('fitness_contact');
    if (saved) {
      setContact(JSON.parse(saved));
    }
  }, []);

  const mapUrl = useMemo(() => {
    return `https://www.google.com/maps?q=${encodeURIComponent(contact.address)}&output=embed`;
  }, [contact.address]);

  return (
    <section id="location" className="py-24 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-14">
          <span className="inline-flex items-center rounded-full bg-red-50 px-4 py-2 text-sm font-bold text-red-600">
            Lokasi Toko
          </span>
          <h2 className="mt-5 text-3xl md:text-4xl font-black text-gray-900">
            Kunjungi Showroom Kami di Surabaya
          </h2>
          <p className="mt-4 max-w-2xl mx-auto text-gray-600 leading-relaxed">
            Datang langsung ke toko untuk melihat produk, konsultasi kebutuhan gym rumah atau komersial, dan mendapatkan rekomendasi alat fitness terbaik.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[0.9fr_1.1fr] gap-8 items-stretch">
          <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-2xl bg-red-50 flex items-center justify-center text-red-600 shrink-0">
                  <MapPin size={22} />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 mb-1">Alamat Lengkap</h3>
                  <p className="text-gray-600 leading-relaxed">{contact.address}</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-2xl bg-red-50 flex items-center justify-center text-red-600 shrink-0">
                  <Phone size={22} />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 mb-1">WhatsApp / Telepon</h3>
                  <a href={`https://wa.me/${contact.phone}`} className="text-gray-600 hover:text-red-600 transition-colors">
                    {contact.phone}
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-2xl bg-red-50 flex items-center justify-center text-red-600 shrink-0">
                  <Clock3 size={22} />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 mb-1">Jam Operasional</h3>
                  <p className="text-gray-600">Senin - Sabtu, 09.00 - 17.00 WIB</p>
                </div>
              </div>
            </div>

            <div className="mt-8 flex flex-col sm:flex-row gap-3">
              <a
                href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(contact.address)}`}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-red-600 px-5 py-3 text-white font-bold hover:bg-red-700 transition-colors"
              >
                <Navigation size={18} />
                Buka di Google Maps
              </a>
              <a
                href={`https://wa.me/${contact.phone}`}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center justify-center gap-2 rounded-2xl border border-gray-200 bg-white px-5 py-3 text-gray-900 font-bold hover:border-red-200 hover:text-red-600 transition-colors"
              >
                <Phone size={18} />
                Hubungi Toko
              </a>
            </div>
          </div>

          <div className="overflow-hidden rounded-3xl shadow-sm border border-gray-100 min-h-[420px] bg-white">
            <iframe
              title="Google Maps Toko Fitness Surabaya"
              src={mapUrl}
              className="w-full h-full min-h-[420px]"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export default LocationSection;
