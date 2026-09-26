import type { ReactElement } from 'react';
import type { MarketplaceId } from '../data/config';

type IconProps = { className?: string };

export const ShopeeIcon = ({ className = 'w-4 h-4' }: IconProps) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M19 7h-3V6a4 4 0 0 0-8 0v1H5a1 1 0 0 0-1 1v11a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8a1 1 0 0 0-1-1zm-9-1a2 2 0 0 1 4 0v1h-4V6zm8 13H6V9h2v1a1 1 0 0 0 2 0V9h4v1a1 1 0 0 0 2 0V9h2v10z" />
  </svg>
);

export const LazadaIcon = ({ className = 'w-4 h-4' }: IconProps) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M7.2 8.2 12 3.8l4.8 4.4c.4.4.7 1 .7 1.6v7.7A2.5 2.5 0 0 1 15 24H9a2.5 2.5 0 0 1-2.5-2.5V9.8c0-.6.3-1.2.7-1.6zM12 8.2a1.8 1.8 0 1 0 0 3.6 1.8 1.8 0 0 0 0-3.6z" />
  </svg>
);

export const TokopediaIcon = ({ className = 'w-4 h-4' }: IconProps) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M4 9.2 12 3l8 6.2v10.3A1.5 1.5 0 0 1 18.5 21h-13A1.5 1.5 0 0 1 4 19.5V9.2zm5.2 3.1a2.8 2.8 0 1 0 5.6 0H16a4.2 4.2 0 1 1-8.4 0h1.6z" />
  </svg>
);

export const TikTokIcon = ({ className = 'w-4 h-4' }: IconProps) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M14.1 3h2.3c.15 1.55.86 2.96 1.98 4.02A6.7 6.7 0 0 0 22 8.9v2.35a8.7 8.7 0 0 1-4.4-1.22v6.72A6.75 6.75 0 1 1 9.2 10.1v2.5a4.25 4.25 0 1 0 4.9 4.2V3z" />
  </svg>
);

export const MARKETPLACE_ICONS: Record<MarketplaceId, (props: IconProps) => ReactElement> = {
  shopee: ShopeeIcon,
  lazada: LazadaIcon,
  tokopedia: TokopediaIcon,
  tiktok: TikTokIcon,
};

export const MARKETPLACE_THEME: Record<
  MarketplaceId,
  { bg: string; hover: string; ring: string; soft: string; text: string }
> = {
  shopee: {
    bg: 'bg-[#EE4D2D]',
    hover: 'hover:bg-[#d73211]',
    ring: 'ring-[#EE4D2D]/30',
    soft: 'bg-[#EE4D2D]/10 text-[#EE4D2D]',
    text: 'text-[#EE4D2D]',
  },
  lazada: {
    bg: 'bg-[#0F146D]',
    hover: 'hover:bg-[#1b2394]',
    ring: 'ring-[#F57224]/40',
    soft: 'bg-[#0F146D]/10 text-[#0F146D]',
    text: 'text-[#0F146D]',
  },
  tokopedia: {
    bg: 'bg-[#42B549]',
    hover: 'hover:bg-[#349b3b]',
    ring: 'ring-[#42B549]/30',
    soft: 'bg-[#42B549]/10 text-[#2E9E3A]',
    text: 'text-[#2E9E3A]',
  },
  tiktok: {
    bg: 'bg-black',
    hover: 'hover:bg-neutral-800',
    ring: 'ring-pink-500/30',
    soft: 'bg-black/10 text-black',
    text: 'text-black',
  },
};
