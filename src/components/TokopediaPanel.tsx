import { useEffect, useRef, useState } from 'react';
import {
  ArrowLeft, ExternalLink, Link2, RefreshCw, ShieldCheck,
  Package, Tag, Layers, Send, Eye, Upload, Lock, Unlock,
} from 'lucide-react';

type Status = {
  ok: boolean;
  checkedAt?: string;
  hasAppKey: boolean;
  hasAppSecret: boolean;
  hasExplicitServiceId: boolean;
  effectiveServiceId: string | null;
  hasAccessToken: boolean;
  hasRefreshToken: boolean;
  adminKeyConfigured: boolean;
  adminKeySource: string;
  tokenExpiresAt: string | null;
  daysLeft: number | null;
  credentialsComplete: boolean;
  connected: boolean;
  shopCode: string | null;
  syncEnabled?: boolean;
  syncBlocked?: boolean;
  message?: string;
};

type Product = {
  id: string;
  name: string;
  price: number;
  stock: number;
  category: string;
  imageCount: number;
  thumbnail: string;
  hasDescription: boolean;
  sku: string;
  weightGrams: number | null;
  discountPrice: number | null;
};

type TikTokCat = { id: string; name: string; path: string };
type Warehouse = { id: string; name: string; isDefault: boolean; effectStatus: string; type: string };
type MapEntry = { productId: string; skuId: string; warehouseId: string };
type DryData = {
  id: string;
  name: string;
  wouldSync: boolean;
  validation: {
    valid: boolean;
    errors: { field: string; message: string }[];
    warnings: { field: string; message: string }[];
    title: string;
    sellerSku: string;
    imageCount: number;
  };
  payloadPreview: Record<string, unknown> | null;
  previewError: string | null;
};

const LS = {
  adminKey: 'toko_admin_key',
  catMap: 'tts-catmap-v1',
  saveMode: 'tts-savemode-v1',
  map: 'tts-map-v1',
};

const readJson = <T,>(key: string, fallback: T): T => {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
};

const call = async (url: string, opts: RequestInit = {}, adminKey = '') => {
  const r = await fetch(url, {
    ...opts,
    headers: {
      'Content-Type': 'application/json',
      ...(adminKey ? { 'x-admin-key': adminKey } : {}),
      ...(opts.headers || {}),
    },
  });
  const text = await r.text();
  let data: any = {};
  try {
    data = text ? JSON.parse(text) : {};
  } catch {
    data = { error: `Respons bukan JSON (${r.status})` };
  }
  if (!r.ok || data.ok === false) throw new Error(data.error || `HTTP ${r.status}`);
  return data;
};

const rupiah = (n: number) => Number(n || 0).toLocaleString('id-ID');
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

export default function TokopediaPanel({ onBack }: { onBack: () => void }) {
  const [adminKey, setAdminKey] = useState(() => localStorage.getItem(LS.adminKey) || '');
  const [status, setStatus] = useState<Status | null>(null);
  const [err, setErr] = useState('');
  const [msg, setMsg] = useState('');
  const [busy, setBusy] = useState<string | null>(null);
  const [authLink, setAuthLink] = useState('');

  /* ── Phase 2 state ── */
  const [products, setProducts] = useState<Product[]>([]);
  const [cats, setCats] = useState<TikTokCat[]>([]);
  const [whs, setWhs] = useState<Warehouse[]>([]);
  const [catMap, setCatMap] = useState<Record<string, string>>(() => readJson(LS.catMap, {}));
  const [saveMode, setSaveMode] = useState<string>(() => localStorage.getItem(LS.saveMode) || 'AS_DRAFT');
  const [map, setMap] = useState<Record<string, MapEntry>>(() => readJson(LS.map, {}));
  const [dry, setDry] = useState<DryData | null>(null);
  const [lastResult, setLastResult] = useState<{ name: string; productId: string; images: number; warnings: string[] } | null>(null);
  const [log, setLog] = useState<string[]>([]);
  const bootRef = useRef(false);

  useEffect(() => {
    if (adminKey) void loadStatus();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // sekali saat terhubung: muat produk + kategori + gudang
  useEffect(() => {
    if (status?.connected && adminKey && !bootRef.current) {
      bootRef.current = true;
      void (async () => {
        await Promise.allSettled([loadProducts(), loadCats(), loadWh()]);
      })();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status?.connected, adminKey]);

  const remember = (k: string) => {
    setAdminKey(k);
    try { localStorage.setItem(LS.adminKey, k); } catch { /* ignore */ }
  };

  const loadStatus = async () => {
    setBusy('status');
    setErr('');
    setMsg('');
    try {
      const d = await call('/api/tokopedia/status', {}, adminKey);
      setStatus(d);
      if (d.connected) setAuthLink('');
    } catch (e: any) {
      setErr(e.message);
      setStatus(null);
    } finally {
      setBusy(null);
    }
  };

  const makeLink = async () => {
    setBusy('link');
    setErr('');
    setMsg('');
    try {
      const d = await call('/api/tokopedia/auth-link', {}, adminKey);
      setAuthLink(d.url);
      setMsg('Link dibuat. Buka di browser yang sudah login ke Seller Center toko ini.');
    } catch (e: any) {
      setErr(e.message);
    } finally {
      setBusy(null);
    }
  };

  const doRefresh = async () => {
    setBusy('refresh');
    setErr('');
    setMsg('');
    try {
      const r = await fetch('/api/tokopedia/refresh', {
        headers: { 'x-admin-key': adminKey, accept: 'text/html' },
      });
      if (!r.ok) {
        const t = await r.text();
        const m = t.match(/<p class="bad">([^<]*)/);
        throw new Error(m ? m[1] : `HTTP ${r.status}`);
      }
      const blob = await r.blob();
      const url = URL.createObjectURL(blob);
      window.open(url, '_blank');
      setTimeout(() => URL.revokeObjectURL(url), 60000);
      setMsg('Token baru dibuka di tab baru — salin ke env Vercel lalu Redeploy.');
    } catch (e: any) {
      setErr(e.message);
    } finally {
      setBusy(null);
    }
  };

  /* ═══ Phase 2 — muat data ═══ */

  const loadProducts = async () => {
    setBusy('products');
    try {
      const d = await call('/api/tokopedia/products');
      setProducts(d.products || []);
      setErr('');
    } catch (e: any) {
      setErr(`Produk: ${e.message}`);
    } finally {
      setBusy(null);
    }
  };

  const loadCats = async () => {
    setBusy('cats');
    try {
      const d = await call('/api/tokopedia/categories', {}, adminKey);
      setCats(d.categories || []);
      setErr('');
    } catch (e: any) {
      setErr(`Kategori TikTok: ${e.message}`);
    } finally {
      setBusy(null);
    }
  };

  const loadWh = async () => {
    setBusy('wh');
    try {
      const d = await call('/api/tokopedia/warehouses', {}, adminKey);
      setWhs(d.warehouses || []);
      setErr('');
    } catch (e: any) {
      setErr(`Gudang: ${e.message}`);
    } finally {
      setBusy(null);
    }
  };

  const setCatFor = (sanityCat: string, tiktokId: string) => {
    const next = { ...catMap };
    if (tiktokId) next[sanityCat] = tiktokId;
    else delete next[sanityCat];
    setCatMap(next);
    try { localStorage.setItem(LS.catMap, JSON.stringify(next)); } catch { /* ignore */ }
  };

  const setMode = (m: string) => {
    setSaveMode(m);
    try { localStorage.setItem(LS.saveMode, m); } catch { /* ignore */ }
  };

  const saveMap = (next: Record<string, MapEntry>) => {
    setMap(next);
    try { localStorage.setItem(LS.map, JSON.stringify(next)); } catch { /* ignore */ }
  };

  /* ═══ Phase 2 — dryrun / sync / stok ═══ */

  const runDry = async (p: Product, silent = false): Promise<DryData> => {
    const d = await call(
      '/api/tokopedia/dryrun',
      { method: 'POST', body: JSON.stringify({ id: p.id, categoryId: catMap[p.category] || '', saveMode }) },
      adminKey,
    );
    const out: DryData = { id: p.id, name: p.name, ...d };
    if (!silent) setDry(out);
    return out;
  };

  const preview = async (p: Product) => {
    setBusy(`dry:${p.id}`);
    setErr('');
    setLastResult(null);
    try {
      await runDry(p);
    } catch (e: any) {
      setErr(e.message);
      setDry(null);
    } finally {
      setBusy(null);
    }
  };

  const syncOne = async (p: Product, askConfirm = true) => {
    const categoryId = catMap[p.category] || '';
    if (!categoryId) throw new Error(`Kategori TikTok belum dipetakan untuk "${p.category}".`);
    const dr = await runDry(p, true);
    if (!dr.wouldSync) {
      const msgs = (dr.validation?.errors || []).map((x) => x.message).join(' ')
        || dr.previewError || 'Validasi gagal.';
      throw new Error(msgs);
    }
    if (askConfirm) {
      const ok = window.confirm(
        `Kirim "${p.name}" ke TikTok Shop?\n\n`
        + `Mode: ${saveMode === 'LISTING' ? 'LISTING — langsung tayang' : 'AS_DRAFT — ditinjau dulu'}\n`
        + `Kategori: ${cats.find((c) => c.id === categoryId)?.path || categoryId}`,
      );
      if (!ok) return null;
    }
    const d = await call(
      '/api/tokopedia/sync',
      { method: 'POST', body: JSON.stringify({ id: p.id, categoryId, saveMode, confirm: true }) },
      adminKey,
    );
    const skuId = String(d.skus?.[0]?.id || d.skus?.[0]?.sku_id || '');
    const whId = String(d.warehouse?.id || '');
    if (d.productId) {
      saveMap({ ...map, [p.id]: { productId: String(d.productId), skuId, warehouseId: whId } });
    }
    setLastResult({
      name: p.name,
      productId: String(d.productId || '-'),
      images: Number(d.imagesUploaded || 0),
      warnings: (d.warnings || []).map((w: any) => w.message || JSON.stringify(w)),
    });
    setDry(null);
    return d;
  };

  const doSync = async (p: Product) => {
    setBusy(`sync:${p.id}`);
    setErr('');
    setMsg('');
    try {
      const d = await syncOne(p, true);
      if (d) setMsg(`Terkirim ✓ — product_id ${d.productId}`);
    } catch (e: any) {
      setErr(e.message);
    } finally {
      setBusy(null);
    }
  };

  const syncAll = async () => {
    const targets = products.filter((p) => catMap[p.category]);
    if (!targets.length) {
      setErr('Belum ada produk yang kategorinya terpetakan.');
      return;
    }
    const ok = window.confirm(
      `Kirim ${targets.length} produk ke TikTok Shop (mode ${saveMode === 'LISTING' ? 'LISTING' : 'AS_DRAFT'})?\n`
      + 'Pastikan peta kategori sudah benar. Proses berjalan satu per satu.',
    );
    if (!ok) return;
    setBusy('bulk');
    setErr('');
    setMsg('');
    setLog([`Mulai ${targets.length} produk…`]);
    let sukses = 0;
    for (const p of targets) {
      try {
        const d = await syncOne(p, false);
        if (d) {
          sukses += 1;
          setLog((L) => [...L, `✓ ${p.name} → ${d.productId}`]);
        }
      } catch (e: any) {
        setLog((L) => [...L, `✗ ${p.name}: ${e.message}`]);
      }
      await sleep(700);
    }
    setLog((L) => [...L, `Selesai: ${sukses}/${targets.length} terkirim.`]);
    setMsg(`Selesai — ${sukses}/${targets.length} produk terkirim.`);
    setBusy(null);
  };

  const pushStock = async (p: Product) => {
    const m = map[p.id];
    if (!m?.skuId) {
      setErr('Belum ada mapping SKU — kirim produk dulu agar stok bisa dipush.');
      return;
    }
    const ok = window.confirm(`Push stok "${p.name}" → ${p.stock} pcs ke TikTok?`);
    if (!ok) return;
    setBusy(`stock:${p.id}`);
    setErr('');
    setMsg('');
    try {
      const d = await call(
        '/api/tokopedia/inventory',
        {
          method: 'POST',
          body: JSON.stringify({
            productId: m.productId,
            skuId: m.skuId,
            quantity: p.stock,
            warehouseId: m.warehouseId,
            confirm: true,
          }),
        },
        adminKey,
      );
      setMsg(d.message || 'Stok terpush ✓');
    } catch (e: any) {
      setErr(e.message);
    } finally {
      setBusy(null);
    }
  };

  /* ═══ render ═══ */

  const distinctCats = [...new Set(products.map((p) => p.category).filter(Boolean))].sort();
  const mappedCount = products.filter((p) => catMap[p.category]).length;
  const defaultWh = whs.find((w) => w.isDefault) || whs[0];
  const locked = Boolean(status?.syncBlocked);

  const Card = ({ title, value, ok, warn }: { title: string; value: string; ok: boolean; warn?: boolean }) => (
    <div className={`rounded-xl border px-4 py-3 ${ok ? 'border-emerald-200 bg-emerald-50' : warn ? 'border-amber-200 bg-amber-50' : 'border-slate-200 bg-slate-50'}`}>
      <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500">{title}</div>
      <div className={`mt-1 text-sm font-semibold ${ok ? 'text-emerald-700' : warn ? 'text-amber-700' : 'text-slate-500'}`}>{value}</div>
    </div>
  );

  const smallBtn = 'text-xs font-semibold px-2.5 py-1.5 rounded-lg border cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1';

  return (
    <div className="p-6 max-w-full">
      <div className="flex items-center gap-3 mb-5">
        <button onClick={onBack} className="text-slate-500 hover:text-black cursor-pointer" aria-label="Kembali">
          <ArrowLeft size={22} />
        </button>
        <h3 className="text-xl font-bold text-slate-900">Tokopedia &amp; TikTok Shop</h3>
        <span className="text-xs bg-emerald-100 text-emerald-700 font-bold px-2.5 py-1 rounded-full">Phase 1 ✓ Koneksi</span>
        <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${status?.connected && !locked ? 'bg-[#0F146D]/10 text-[#0F146D]' : 'bg-slate-100 text-slate-500'}`}>
          Phase 2 — Sinkron Produk
        </span>
      </div>

      {/* Admin key */}
      <div className="rounded-xl border border-slate-200 bg-white shadow-sm p-4 mb-4">
        <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">
          Admin key (TOKOPEDIA_ADMIN_KEY / LAZADA_ADMIN_KEY)
        </label>
        <div className="flex gap-2">
          <input
            type="password"
            value={adminKey}
            onChange={(e) => remember(e.target.value)}
            placeholder="tempel admin key"
            className="flex-1 border border-slate-200 rounded-lg px-3 py-2 text-sm font-mono focus:outline-none focus:border-slate-400"
          />
          <button
            onClick={loadStatus}
            disabled={!adminKey || busy === 'status'}
            className="bg-slate-900 text-white text-sm font-semibold px-4 py-2 rounded-lg hover:bg-slate-700 disabled:opacity-40 cursor-pointer"
          >
            {busy === 'status' ? '…' : 'Cek Status'}
          </button>
        </div>
      </div>

      {err && <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700 mb-4">{err}</div>}
      {msg && <div className="rounded-lg bg-emerald-50 border border-emerald-200 px-4 py-3 text-sm text-emerald-700 mb-4">{msg}</div>}

      {/* Status */}
      {status && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
          <Card title="App Key" value={status.hasAppKey ? '✓ terisi' : '✗ kosong'} ok={status.hasAppKey} />
          <Card title="App Secret" value={status.hasAppSecret ? '✓ terisi' : '✗ kosong'} ok={status.hasAppSecret} />
          <Card
            title="Access token"
            value={
              status.hasAccessToken
                ? status.daysLeft !== null
                  ? `${status.daysLeft} hari lagi (${new Date(status.tokenExpiresAt!).toLocaleDateString('id-ID')})`
                  : '✓ terisi'
                : '✗ belum otorisasi'
            }
            ok={status.connected}
            warn={status.hasAccessToken && status.daysLeft !== null && status.daysLeft <= 2}
          />
          <Card title="Refresh token" value={status.hasRefreshToken ? '✓ terisi' : '✗ kosong'} ok={status.hasRefreshToken} />
        </div>
      )}

      {status && !status.connected && (
        <div className="rounded-xl border border-slate-200 bg-white shadow-sm p-5 mb-4">
          <div className="flex items-center gap-2 mb-2">
            <Link2 size={18} className="text-slate-500" />
            <h4 className="font-bold text-slate-900">1. Hubungkan toko</h4>
          </div>
          <ol className="text-sm text-slate-600 list-decimal ml-5 space-y-1.5 mb-4">
            <li>Isi <code className="bg-slate-100 px-1 rounded">TOKOPEDIA_APP_KEY</code> + <code className="bg-slate-100 px-1 rounded">TOKOPEDIA_APP_SECRET</code> di Vercel (bila belum).</li>
            <li>Klik <b>Buat link otorisasi</b>, buka link-nya, login dengan akun seller toko ini, lalu setujui.</li>
            <li>Halaman tampil <b>token</b> — salin ke env Vercel, lalu <b>Redeploy</b>.</li>
          </ol>
          <button
            onClick={makeLink}
            disabled={!adminKey || busy === 'link' || !status.credentialsComplete}
            className="w-full bg-[#0F146D] text-white font-bold py-3 rounded-xl shadow-md flex items-center justify-center gap-2 hover:bg-[#1b2394] transition-colors disabled:opacity-40 cursor-pointer"
          >
            <Link2 size={17} />
            {busy === 'link' ? 'Membuat link…' : 'Buat Link Otorisasi'}
          </button>
        </div>
      )}

      {status?.connected && (
        <div className="rounded-xl border border-slate-200 bg-white shadow-sm p-5 mb-4">
          <div className="flex items-center gap-2 mb-2">
            <ShieldCheck size={18} className="text-emerald-600" />
            <h4 className="font-bold text-slate-900">Toko terhubung ✓</h4>
          </div>
          <p className="text-sm text-slate-600 mb-4">
            {status.shopCode && <>Shop code <b>{status.shopCode}</b> · </>}
            Akses token berlaku {status.daysLeft !== null ? (<>± <b>{status.daysLeft} hari</b> lagi</>) : null}
            {status.tokenExpiresAt && <> (s/d {new Date(status.tokenExpiresAt).toLocaleDateString('id-ID')})</>}.
            Token hidup <b>7 hari</b> — perpanjang berkala agar sinkron tidak putus.
          </p>
          <button
            onClick={doRefresh}
            disabled={busy === 'refresh'}
            className="w-full bg-slate-900 text-white font-bold py-3 rounded-xl shadow-md flex items-center justify-center gap-2 hover:bg-slate-700 transition-colors disabled:opacity-40 cursor-pointer"
          >
            <RefreshCw size={17} className={busy === 'refresh' ? 'animate-spin' : ''} />
            {busy === 'refresh' ? 'Memperpanjang…' : 'Perpanjang Token Sekarang'}
          </button>
          <button
            onClick={makeLink}
            disabled={!adminKey || busy === 'link'}
            className="mt-3 w-full bg-white border border-slate-300 text-slate-700 font-bold py-2.5 rounded-xl shadow-sm flex items-center justify-center gap-2 hover:bg-slate-50 transition-colors disabled:opacity-40 cursor-pointer"
          >
            <Link2 size={16} />
            {busy === 'link' ? 'Membuat link…' : 'Buat Link Otorisasi Baru (re-otorisasi)'}
          </button>
          {authLink && (
            <div className="mt-3">
              <input
                readOnly
                value={authLink}
                onFocus={(e) => e.currentTarget.select()}
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-xs font-mono bg-slate-50"
              />
              <a
                href={authLink}
                target="_blank"
                rel="noreferrer"
                className="mt-2 w-full inline-flex items-center justify-center gap-2 bg-emerald-600 text-white font-bold py-2.5 rounded-xl text-sm hover:bg-emerald-700 transition-colors"
              >
                <ExternalLink size={15} /> Buka &amp; Setujui di Seller Center
              </a>
            </div>
          )}
        </div>
      )}

      {/* ══════════ PHASE 2 — SINKRON PRODUK ══════════ */}
      {status?.connected && (
        <div className="rounded-xl border border-slate-200 bg-white shadow-sm p-5 mb-4">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <Package size={18} className="text-[#0F146D]" />
            <h4 className="font-bold text-slate-900">Phase 2 — Sinkron Produk</h4>
            <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 ${locked ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'}`}>
              {locked ? <Lock size={11} /> : <Unlock size={11} />}
              {locked ? 'Terkunci' : 'Terbuka'}
            </span>
          </div>
          <p className="text-xs text-slate-500 mb-3">
            Katalog Sanity → peta kategori TikTok → push produk (create) &amp; stok dua arah.
          </p>

          {locked && (
            <div className="rounded-lg bg-amber-50 border border-amber-200 px-4 py-3 text-xs text-amber-800 mb-4">
              Sinkron <b>terkunci</b>: set <code className="bg-amber-100 px-1 rounded">TOKOPEDIA_SYNC_ENABLED=true</code> di
              environment Vercel, lalu <b>Redeploy</b>. (Produk/kategori/gudang tetap bisa dibaca.)
            </div>
          )}

          {/* toolbar */}
          <div className="flex flex-wrap gap-2 mb-3 items-center">
            <button onClick={loadProducts} disabled={busy === 'products'} className={`${smallBtn} border-slate-300 bg-white hover:bg-slate-50`}>
              <Layers size={13} /> {busy === 'products' ? 'Memuat…' : `Produk (${products.length})`}
            </button>
            <button onClick={loadCats} disabled={busy === 'cats'} className={`${smallBtn} border-slate-300 bg-white hover:bg-slate-50`}>
              <Tag size={13} /> {busy === 'cats' ? 'Memuat…' : `Kategori TikTok (${cats.length})`}
            </button>
            <button onClick={loadWh} disabled={busy === 'wh'} className={`${smallBtn} border-slate-300 bg-white hover:bg-slate-50`}>
              <Package size={13} /> {busy === 'wh' ? 'Memuat…' : `Gudang (${whs.length})`}
            </button>
            <div className="flex items-center gap-1.5 ml-auto">
              <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Mode</label>
              <select
                value={saveMode}
                onChange={(e) => setMode(e.target.value)}
                className="border border-slate-200 rounded-lg px-2 py-1.5 text-xs font-semibold bg-white cursor-pointer"
              >
                <option value="AS_DRAFT">AS_DRAFT (aman)</option>
                <option value="LISTING">LISTING (langsung tayang)</option>
              </select>
            </div>
          </div>

          {defaultWh && (
            <div className="text-[11px] text-slate-500 mb-3">
              Gudang default: <b>{defaultWh.name}</b> <span className="font-mono">({defaultWh.id})</span>
              {defaultWh.effectStatus && <> · status {defaultWh.effectStatus}</>}
            </div>
          )}

          {/* peta kategori */}
          {distinctCats.length > 0 && (
            <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 mb-3">
              <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-2">
                Peta kategori (Sanity → TikTok) — otomatis tersimpan
              </div>
              {cats.length === 0 && (
                <p className="text-xs text-amber-600 mb-2">Kategori TikTok belum dimuat — klik tombol «Kategori TikTok» dulu.</p>
              )}
              <div className="space-y-1.5 max-h-52 overflow-y-auto pr-1">
                {distinctCats.map((c) => (
                  <div key={c} className="flex items-center gap-2">
                    <span className="text-xs text-slate-600 w-36 shrink-0 truncate" title={c}>{c}</span>
                    <select
                      value={catMap[c] || ''}
                      onChange={(e) => setCatFor(c, e.target.value)}
                      disabled={cats.length === 0}
                      className="flex-1 border border-slate-200 rounded-lg px-2 py-1.5 text-xs bg-white cursor-pointer disabled:opacity-50 min-w-0"
                    >
                      <option value="">— pilih kategori leaf TikTok —</option>
                      {cats.map((k) => (
                        <option key={k.id} value={k.id}>{k.path}</option>
                      ))}
                    </select>
                    <span className={`text-[10px] font-bold w-10 text-center rounded ${catMap[c] ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-200 text-slate-500'}`}>
                      {catMap[c] ? '✓' : '—'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* daftar produk */}
          {products.length > 0 ? (
            <div className="overflow-x-auto border border-slate-200 rounded-lg mb-3">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-slate-50 text-[11px] uppercase tracking-wider text-slate-500">
                    <th className="text-left px-3 py-2 font-bold">Produk</th>
                    <th className="text-right px-2 py-2 font-bold">Harga</th>
                    <th className="text-right px-2 py-2 font-bold">Stok</th>
                    <th className="text-left px-2 py-2 font-bold">Kategori</th>
                    <th className="text-right px-3 py-2 font-bold">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map((p) => {
                    const mapped = Boolean(catMap[p.category]);
                    const sent = Boolean(map[p.id]?.skuId);
                    return (
                      <tr key={p.id} className="border-t border-slate-100 hover:bg-slate-50/60">
                        <td className="px-3 py-2">
                          <div className="flex items-center gap-2 min-w-0">
                            {p.thumbnail
                              ? <img src={p.thumbnail} alt="" className="w-9 h-9 rounded object-cover border border-slate-200 shrink-0" loading="lazy" />
                              : <div className="w-9 h-9 rounded border border-dashed border-slate-300 shrink-0" />}
                            <div className="min-w-0">
                              <div className="text-xs font-semibold text-slate-800 truncate max-w-[240px]" title={p.name}>{p.name}</div>
                              <div className="text-[10px] text-slate-400 font-mono truncate max-w-[240px]">{p.id}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-2 py-2 text-right text-xs font-semibold whitespace-nowrap">
                          Rp{rupiah(p.price)}
                          {p.discountPrice && p.discountPrice < p.price && (
                            <div className="text-[10px] text-rose-500 line-through">Rp{rupiah(p.discountPrice)}</div>
                          )}
                        </td>
                        <td className="px-2 py-2 text-right text-xs font-semibold">{p.stock}</td>
                        <td className="px-2 py-2">
                          {mapped ? (
                            <span className="text-[10px] font-bold bg-emerald-100 text-emerald-700 px-1.5 py-0.5 rounded" title={cats.find((k) => k.id === catMap[p.category])?.path}>
                              ✓ {cats.find((k) => k.id === catMap[p.category])?.name || 'terpetakan'}
                            </span>
                          ) : (
                            <span className="text-[10px] font-bold bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded">{p.category || 'tanpa kategori'}</span>
                          )}
                          {sent && <span className="text-[10px] font-bold bg-[#0F146D]/10 text-[#0F146D] px-1.5 py-0.5 rounded ml-1" title={`product_id ${map[p.id].productId}`}>di TikTok</span>}
                        </td>
                        <td className="px-3 py-2">
                          <div className="flex gap-1.5 justify-end">
                            <button
                              onClick={() => preview(p)}
                              disabled={busy !== null}
                              className={`${smallBtn} border-slate-300 bg-white hover:bg-slate-50`}
                              title="Pratinjau payload (tanpa kirim)"
                            >
                              <Eye size={12} /> {busy === `dry:${p.id}` ? '…' : 'Pratinjau'}
                            </button>
                            <button
                              onClick={() => doSync(p)}
                              disabled={busy !== null || locked || !mapped}
                              className={`${smallBtn} border-[#0F146D] bg-[#0F146D] text-white hover:bg-[#1b2394]`}
                              title={locked ? 'Sinkron terkunci' : !mapped ? 'Petakan kategori dulu' : 'Kirim ke TikTok'}
                            >
                              <Send size={12} /> {busy === `sync:${p.id}` ? '…' : 'Kirim'}
                            </button>
                            <button
                              onClick={() => pushStock(p)}
                              disabled={busy !== null || locked || !sent}
                              className={`${smallBtn} border-emerald-600 text-emerald-700 bg-white hover:bg-emerald-50`}
                              title={sent ? `Push stok ${p.stock} ke TikTok` : 'Kirim produk dulu agar ada SKU'}
                            >
                              <Upload size={12} /> {busy === `stock:${p.id}` ? '…' : 'Stok'}
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-xs text-slate-400 mb-3">Belum ada produk — klik «Produk» untuk menarik katalog Sanity.</p>
          )}

          {/* bulk */}
          <div className="flex gap-2 flex-wrap items-center">
            <button
              onClick={syncAll}
              disabled={busy !== null || locked || mappedCount === 0}
              className="bg-[#0F146D] text-white text-sm font-bold px-4 py-2.5 rounded-xl shadow flex items-center gap-2 hover:bg-[#1b2394] transition-colors disabled:opacity-40 cursor-pointer"
            >
              <Send size={15} />
              {busy === 'bulk' ? 'Mengirim…' : `Kirim Semua yang Dipetakan (${mappedCount})`}
            </button>
            {(dry || lastResult || log.length > 0) && (
              <button onClick={() => { setDry(null); setLastResult(null); setLog([]); }} className="text-xs text-slate-400 hover:text-slate-600 underline cursor-pointer">
                bersihkan hasil
              </button>
            )}
          </div>

          {/* hasil dryrun */}
          {dry && (
            <div className={`mt-3 rounded-lg border px-4 py-3 ${dry.validation.valid && dry.wouldSync ? 'border-emerald-200 bg-emerald-50' : 'border-red-200 bg-red-50'}`}>
              <div className="text-xs font-bold mb-1">
                Pratinjau «{dry.name}» — {dry.validation.valid && dry.wouldSync
                  ? <span className="text-emerald-700">VALID ✓ siap dikirim</span>
                  : <span className="text-red-700">BELUM SIAP</span>}
              </div>
              {dry.validation.errors.length > 0 && (
                <ul className="text-xs text-red-700 list-disc ml-5 mb-1">
                  {dry.validation.errors.map((x, i) => <li key={i}>{x.field}: {x.message}</li>)}
                </ul>
              )}
              {dry.validation.warnings.length > 0 && (
                <ul className="text-xs text-amber-700 list-disc ml-5 mb-1">
                  {dry.validation.warnings.map((x, i) => <li key={i}>{x.message}</li>)}
                </ul>
              )}
              {dry.previewError && <div className="text-xs text-red-600 mb-1">{dry.previewError}</div>}
              {dry.validation.valid && (
                <div className="text-[11px] text-slate-600 mb-1">
                  Judul: <b>{dry.validation.title}</b> · SKU: <b>{dry.validation.sellerSku}</b> · Gambar: <b>{dry.validation.imageCount}</b>
                </div>
              )}
              {dry.payloadPreview && (
                <pre className="text-[10px] bg-slate-900 text-slate-100 rounded p-2 overflow-x-auto max-h-40 mt-1">
                  {JSON.stringify(dry.payloadPreview, null, 1)}
                </pre>
              )}
            </div>
          )}

          {/* hasil sync */}
          {lastResult && (
            <div className="mt-3 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-xs">
              <div className="font-bold text-emerald-800 mb-1">
                Terkirim ✓ — {lastResult.name}
              </div>
              <div className="text-emerald-700">
                product_id <b className="font-mono">{lastResult.productId}</b> · gambar terupload <b>{lastResult.images}</b>
              </div>
              {lastResult.warnings.length > 0 && (
                <ul className="text-amber-700 list-disc ml-5 mt-1">
                  {lastResult.warnings.map((w, i) => <li key={i}>{w}</li>)}
                </ul>
              )}
              <div className="text-[10px] text-slate-500 mt-1">Mapping tersimpan — tombol «Stok» kini aktif untuk produk ini.</div>
            </div>
          )}

          {/* log bulk */}
          {log.length > 0 && (
            <div className="mt-3 rounded-lg border border-slate-200 bg-slate-900 text-slate-100 px-3 py-2 max-h-44 overflow-y-auto">
              {log.map((l, i) => (
                <div key={i} className={`text-[11px] font-mono ${l.startsWith('✗') ? 'text-rose-400' : l.startsWith('✓') ? 'text-emerald-400' : 'text-slate-300'}`}>{l}</div>
              ))}
            </div>
          )}
        </div>
      )}

      <p className="text-[11px] text-slate-400 mt-4 flex items-center gap-1.5">
        <ShieldCheck size={13} /> Token &amp; App Secret hanya di server. Endpoint tulis dijaga adminKey + confirm + flag sinkron.
      </p>
    </div>
  );
}
