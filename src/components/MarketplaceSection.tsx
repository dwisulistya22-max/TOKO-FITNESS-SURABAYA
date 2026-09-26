import { ExternalLink, MessageCircle, ShieldCheck } from 'lucide-react';
import { motion } from 'framer-motion';
import { useMarketplaces, marketplaceHref } from '../utils/marketplaces';
import { MARKETPLACE_ICONS, MARKETPLACE_THEME } from './MarketplaceIcons';

const MarketplaceSection = () => {
  const items = useMarketplaces();

  return (
    <section id="marketplace" className="py-16 sm:py-20 bg-gradient-to-b from-white via-slate-50 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-10 sm:mb-14">
          <span className="inline-flex items-center gap-2 bg-red-50 text-red-600 text-[10px] sm:text-xs font-black uppercase tracking-[0.2em] px-4 py-2 rounded-full mb-4">
            Official Marketplace
          </span>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black uppercase italic tracking-tight text-gray-900 mb-4">
            Kami Juga Ada di{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-600 via-orange-500 to-amber-400">
              Shopee & Lazada
            </span>
          </h2>
          <p className="text-gray-500 text-sm sm:text-base leading-relaxed">
            Belanja alat fitness original lewat marketplace favorit Anda. Voucher, cicilan, COD, dan gratis ongkir platform tetap berlaku.
            Tokopedia & TikTok Shop segera menyusul.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {items.map((item, index) => {
            const Icon = MARKETPLACE_ICONS[item.id];
            const theme = MARKETPLACE_THEME[item.id];
            return (
              <motion.a
                key={item.id}
                href={marketplaceHref(item)}
                target="_blank"
                rel="noopener noreferrer"
                initial={{ opacity: 0, y: 18 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.08 }}
                className="group relative overflow-hidden rounded-3xl border border-gray-100 bg-white p-6 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all"
              >
                <div className={`absolute -right-8 -top-8 w-24 h-24 rounded-full blur-2xl opacity-40 ${theme.bg}`} />
                <div className={`w-12 h-12 rounded-2xl ${theme.bg} text-white flex items-center justify-center mb-5 shadow-lg`}>
                  <Icon className="w-6 h-6" />
                </div>
                <div className="flex items-center gap-2 mb-2">
                  <h3 className="text-xl font-black text-gray-900">{item.name}</h3>
                  {item.live ? (
                    <span className="text-[9px] font-black uppercase tracking-wider bg-green-100 text-green-700 px-2 py-0.5 rounded-full">
                      Official
                    </span>
                  ) : (
                    <span className="text-[9px] font-black uppercase tracking-wider bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full">
                      Segera Hadir
                    </span>
                  )}
                </div>
                <p className="text-gray-500 text-xs leading-relaxed mb-6 min-h-[48px]">{item.description}</p>
                <div className={`inline-flex items-center gap-2 ${theme.bg} ${theme.hover} text-white px-4 py-2.5 rounded-xl text-xs font-black shadow-md`}>
                  {item.live ? (
                    <>
                      Belanja di {item.name} <ExternalLink size={14} />
                    </>
                  ) : (
                    <>
                      Tanya via WhatsApp <MessageCircle size={14} />
                    </>
                  )}
                </div>
              </motion.a>
            );
          })}
        </div>

        <div className="mt-8 flex flex-wrap items-center justify-center gap-3 text-[11px] sm:text-xs font-bold text-gray-500">
          <span className="inline-flex items-center gap-1.5 bg-white border border-gray-100 px-3 py-2 rounded-full">
            <ShieldCheck size={14} className="text-red-500" /> Produk original & bergaransi
          </span>
          <span className="inline-flex items-center gap-1.5 bg-white border border-gray-100 px-3 py-2 rounded-full">
            Promo marketplace + harga toko
          </span>
          <span className="inline-flex items-center gap-1.5 bg-white border border-gray-100 px-3 py-2 rounded-full">
            Siap kirim & pasang Surabaya
          </span>
        </div>
      </div>
    </section>
  );
};

export default MarketplaceSection;
