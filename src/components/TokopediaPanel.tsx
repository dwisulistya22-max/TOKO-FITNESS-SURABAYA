import { useEffect, useState } from 'react';
import { ArrowLeft, ExternalLink, Link2, RefreshCw, ShieldCheck } from 'lucide-react';

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
  message?: string;
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

export default function TokopediaPanel({ onBack }: { onBack: () => void }) {
  const [adminKey, setAdminKey] = useState(() => localStorage.getItem('toko_admin_key') || '');
  const [status, setStatus] = useState<Status | null>(null);
  const [err, setErr] = useState('');
  const [msg, setMsg] = useState('');
  const [busy, setBusy] = useState<'status' | 'link' | 'refresh' | null>(null);
  const [authLink, setAuthLink] = useState('');

  useEffect(() => {
    if (adminKey) void loadStatus();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const remember = (k: string) => {
    setAdminKey(k);
    try { localStorage.setItem('toko_admin_key', k); } catch { /* ignore */ }
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
      // GET + Accept html → halaman HTML berisi token baru (tidak lewat JSON/log)
      const r = await fetch('/api/tokopedia/refresh', {
        headers: { 'x-admin-key': adminKey, accept: 'text/html' },
      });
      if (!r.ok) {
        const t = await r.text();
        const m = t.match(/<p class="bad">([^<]*)/);
        throw new Error(m ? m[1] : `HTTP ${r.status}`);
      }
      // Buka hasil di tab baru supaya token tampil & bisa disalin
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

  const Card = ({ title, value, ok, warn }: { title: string; value: string; ok: boolean; warn?: boolean }) => (
    <div className={`rounded-xl border px-4 py-3 ${ok ? 'border-emerald-200 bg-emerald-50' : warn ? 'border-amber-200 bg-amber-50' : 'border-slate-200 bg-slate-50'}`}>
      <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500">{title}</div>
      <div className={`mt-1 text-sm font-semibold ${ok ? 'text-emerald-700' : warn ? 'text-amber-700' : 'text-slate-500'}`}>{value}</div>
    </div>
  );

  return (
    <div className="p-6 max-w-full">
      <div className="flex items-center gap-3 mb-5">
        <button onClick={onBack} className="text-slate-500 hover:text-black cursor-pointer" aria-label="Kembali">
          <ArrowLeft size={22} />
        </button>
        <h3 className="text-xl font-bold text-slate-900">Tokopedia &amp; TikTok Shop</h3>
        <span className="text-xs bg-emerald-100 text-emerald-700 font-bold px-2.5 py-1 rounded-full">Phase 1 — Koneksi</span>
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
        </div>
      )}

      {/* Fase 2 */}
      <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-5 opacity-80">
        <h4 className="font-bold text-slate-600 mb-1">Phase 2 — Sinkron Produk (menyusul)</h4>
        <p className="text-sm text-slate-500">
          Setelah koneksi aktif: tarik katalog dari Sanity, cocokkan kategori/logistik Tokopedia, lalu
          push produk + stok dua arah — pola sama dengan panel Lazada.
        </p>
      </div>

      <p className="text-[11px] text-slate-400 mt-4 flex items-center gap-1.5">
        <ShieldCheck size={13} /> Token & App Secret hanya di server. Endpoint tulis dijaga adminKey.
      </p>
    </div>
  );
}
