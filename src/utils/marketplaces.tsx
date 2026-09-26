import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { MARKETPLACES, STORE_CONFIG, type MarketplaceConfig, type MarketplaceId } from '../data/config';

const PROJECT_IDS = ['qi4rocc0', '856jrik3'];
const DATASET = 'production';

const WA_ADMIN = (STORE_CONFIG.phone || '6281332345448').split(/[/,&\n]/)[0].replace(/\D/g, '');

const isHttpUrl = (value: string) => /^https?:\/\//i.test(value);

const normalizeUrl = (value: string) => {
  const trimmed = String(value || '').trim();
  if (!trimmed) return '';
  return isHttpUrl(trimmed) ? trimmed : `https://${trimmed}`;
};

const isPublicShopUrl = (id: MarketplaceId, url: string) => {
  if (!url || url.length < 12) return false;
  const lower = url.toLowerCase();
  if (id === 'lazada' && (lower.includes('sellercenter.lazada') || lower.includes('seller.lazada'))) return false;
  if (id === 'shopee' && lower.includes('id.sh.ee')) return false;
  if (id === 'tokopedia' && (lower.includes('/search') || lower.includes('q=toko'))) return false;
  return true;
};

export const marketplaceWhatsAppUrl = (name: string) =>
  `https://wa.me/${WA_ADMIN}?text=${encodeURIComponent(
    `Halo Admin Toko Fitness Surabaya, saya ingin belanja lewat ${name}. Mohon info produk, stok, dan harganya.`
  )}`;

export const marketplaceHref = (item: MarketplaceConfig) => {
  if (item.live && isPublicShopUrl(item.id, item.url)) return item.url;
  return marketplaceWhatsAppUrl(item.name);
};

export const mergeMarketplaceLinks = (remote: Partial<Record<MarketplaceId, string>> = {}): MarketplaceConfig[] =>
  MARKETPLACES.map((item) => {
    const remoteUrl = normalizeUrl(remote[item.id] || '');
    const fallbackUrl = normalizeUrl(item.url);
    const url = isPublicShopUrl(item.id, remoteUrl) ? remoteUrl : fallbackUrl;
    return {
      ...item,
      url,
      live: Boolean(item.live || isPublicShopUrl(item.id, url)),
    };
  });

const MarketplaceContext = createContext<MarketplaceConfig[]>(MARKETPLACES);

export function MarketplaceProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<MarketplaceConfig[]>(() => mergeMarketplaceLinks());

  useEffect(() => {
    const fetchLinks = async () => {
      const query = encodeURIComponent(`{
        "store": *[_type in ["storeConfig","storeInfo","settings"]][0]{
          "shopee": coalesce(shopee, shopeeUrl, ""),
          "lazada": coalesce(lazada, lazadaUrl, ""),
          "tokopedia": coalesce(tokopedia, tokopediaUrl, ""),
          "tiktok": coalesce(tiktok, tiktokUrl, tiktokShop, "")
        }
      }`);

      for (const id of PROJECT_IDS) {
        try {
          const res = await fetch(`https://${id}.api.sanity.io/v2024-01-01/data/query/${DATASET}?query=${query}`, {
            cache: 'no-store',
          });
          const data = await res.json();
          if (data?.result?.store) {
            setItems(mergeMarketplaceLinks(data.result.store));
            break;
          }
        } catch (err) {
          console.error('Error fetching marketplace links:', err);
        }
      }
    };

    fetchLinks();
  }, []);

  return <MarketplaceContext.Provider value={items}>{children}</MarketplaceContext.Provider>;
}

export const useMarketplaces = () => useContext(MarketplaceContext);
