import { ExternalLink } from 'lucide-react';
import type { MarketplaceConfig } from '../data/config';
import { MARKETPLACE_ICONS, MARKETPLACE_THEME } from './MarketplaceIcons';
import { marketplaceHref } from '../utils/marketplaces';

type Variant = 'strip' | 'pills' | 'footer' | 'hero';

const MarketplaceButtons = ({
  items,
  variant = 'pills',
}: {
  items: MarketplaceConfig[];
  variant?: Variant;
}) => {
  if (variant === 'strip') {
    return (
      <div className="bg-slate-950 text-white border-t border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2 flex items-center gap-3 overflow-x-auto no-scrollbar">
          <span className="shrink-0 text-[10px] sm:text-[11px] font-black uppercase tracking-[0.18em] text-amber-300">
            Kami juga ada di
          </span>
          <div className="flex items-center gap-2">
            {items.map((item) => {
              const Icon = MARKETPLACE_ICONS[item.id];
              const theme = MARKETPLACE_THEME[item.id];
              return (
                <a
                  key={item.id}
                  href={marketplaceHref(item)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`inline-flex items-center gap-1.5 ${theme.bg} ${theme.hover} text-white px-3 py-1.5 rounded-full text-[10px] sm:text-[11px] font-black uppercase tracking-wide whitespace-nowrap shadow-sm transition-transform hover:-translate-y-0.5`}
                  title={item.live ? `Belanja di ${item.name}` : `${item.name} segera hadir`}
                >
                  {item.live && (
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white/80"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-white"></span>
                    </span>
                  )}
                  <Icon className="w-3.5 h-3.5" />
                  {item.name}
                  {!item.live && (
                    <span className="bg-white/20 px-1.5 py-0.5 rounded-full text-[8px] tracking-wider">Soon</span>
                  )}
                </a>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  const size =
    variant === 'hero'
      ? 'px-4 py-2.5 text-xs sm:text-sm rounded-xl'
      : variant === 'footer'
        ? 'px-4 py-2.5 text-[11px] rounded-xl'
        : 'px-3 py-2 text-[11px] rounded-full';

  return (
    <div className={`flex flex-wrap ${variant === 'hero' ? 'gap-3' : 'gap-2'}`}>
      {items.map((item) => {
        const Icon = MARKETPLACE_ICONS[item.id];
        const theme = MARKETPLACE_THEME[item.id];
        return (
          <a
            key={item.id}
            href={marketplaceHref(item)}
            target="_blank"
            rel="noopener noreferrer"
            className={`inline-flex items-center justify-center gap-2 ${theme.bg} ${theme.hover} text-white ${size} font-black shadow-md ${variant === 'hero' ? 'ring-2 ring-white/40' : ''} transition-all hover:-translate-y-0.5`}
          >
            <Icon className={variant === 'hero' ? 'w-4 h-4' : 'w-3.5 h-3.5'} />
            {item.live ? item.label : `${item.name} · Soon`}
            {item.live && variant !== 'pills' && <ExternalLink size={13} />}
          </a>
        );
      })}
    </div>
  );
};

export default MarketplaceButtons;
