export type SearchableProduct = {
  id?: string;
  _id?: string;
  name?: string;
  category?: unknown;
  tag?: unknown;
  description?: unknown;
};

export type ProductRequest = {
  id?: string;
  name?: string;
  query?: string;
  token: number;
};

const asText = (value: unknown) => {
  if (value == null) return '';
  if (typeof value === 'string' || typeof value === 'number') return String(value);
  if (typeof value === 'object') {
    const record = value as { title?: string; name?: string; nama?: string };
    return String(record.title || record.name || record.nama || '');
  }
  return '';
};

export const normalizeSearchText = (value: unknown) =>
  asText(value)
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

export const productSearchHaystack = (product: SearchableProduct) =>
  normalizeSearchText(
    `${asText(product.name)} ${asText(product.category)} ${asText(product.tag)} ${asText(product.description)}`
  );

export const productMatchesQuery = (product: SearchableProduct, query: string) => {
  const normalizedQuery = normalizeSearchText(query);
  if (!normalizedQuery) return false;

  const haystack = productSearchHaystack(product);
  if (haystack.includes(normalizedQuery)) return true;

  const words = normalizedQuery.split(' ').filter(Boolean);
  return words.length > 1 && words.every((word) => haystack.includes(word));
};

export const searchRelevance = (product: SearchableProduct, query: string) => {
  const name = normalizeSearchText(product.name);
  const normalizedQuery = normalizeSearchText(query);
  if (!normalizedQuery) return 99;
  if (name === normalizedQuery) return 0;
  if (name.startsWith(normalizedQuery)) return 1;
  if (name.includes(normalizedQuery)) return 2;
  if (productMatchesQuery(product, query)) return 3;
  return 99;
};

export const productDomId = (id: unknown) =>
  `product-${String(id ?? '').replace(/[^a-zA-Z0-9_-]/g, '')}`;

export const findProductByRequest = <T extends SearchableProduct>(
  products: T[],
  request?: { id?: string; name?: string } | null
) => {
  if (!request) return null;

  if (request.id) {
    const byId = products.find((product) => product.id === request.id || product._id === request.id);
    if (byId) return byId;
  }

  const name = normalizeSearchText(request.name);
  if (!name) return null;
  return products.find((product) => normalizeSearchText(product.name) === name) || null;
};

export const updateProductUrl = (params: { q?: string | null; produk?: string | null }) => {
  if (typeof window === 'undefined') return;

  const url = new URL(window.location.href);
  if ('q' in params) {
    if (params.q) url.searchParams.set('q', params.q);
    else url.searchParams.delete('q');
  }
  if ('produk' in params) {
    if (params.produk) url.searchParams.set('produk', params.produk);
    else url.searchParams.delete('produk');
  }

  const next = `${url.pathname}${url.search}${url.hash}`;
  const current = `${window.location.pathname}${window.location.search}${window.location.hash}`;
  if (next !== current) window.history.replaceState({}, '', next);
};
