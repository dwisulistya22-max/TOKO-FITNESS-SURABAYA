import { useEffect, useState } from 'react';
import { ArrowLeft, CheckCircle2, Download, Eye, FlaskConical, RefreshCw, Send, ShieldAlert, ShieldCheck, XCircle } from 'lucide-react';

type StatusResp = {
  ok: boolean;
  mode: 'DRY_RUN_EXPORT' | 'SYNC_ARMED';
  syncEnabled: boolean;
  credentialsComplete: boolean;
  hasAppKey: boolean; hasAppSecret: boolean; hasAccessToken: boolean;
  hasRefreshToken: boolean; hasShopId: boolean; hasShopCipher: boolean; hasAdminKey: boolean;
  syncBlocked: boolean;
  message: string;
};

type SlimProduct = {
  id: string; name: string; price: number | null; stock: number | null;
  category: string; imageCount: number; thumbnail: string;
};

type Issue = { field: string; message: string; fix: string };

type Validation = {
  valid: boolean; mode: string; categoryId: string;
  usableImages: string[]; overrideFields: string[];
  errors: Issue[]; warnings: Issue[];
};

const inputCls = 'w-full px-3 py-2 rounded-xl border text-sm outline-none focus:border-red-500 bg-white text-gray-900';
const labelCls = 'block text-[11px] font-bold text-gray-500 uppercase tracking-wide mb-1';

export default function TikTokSyncPanel({ onBack }: { onBack: () => void }) {
  const [status, setStatus] = useState<StatusResp | null>(null);
  const [statusErr, setStatusErr] = useState('');
  const [products, setProducts] = useState<SlimProduct[]>([]);
  const [prodErr, setProdErr] = useState('');
  const [loading, setLoading] = useState(true);
  const [selectedId, setSelectedId] = useState('');
  const [busy, setBusy] = useState('');
  const [validation, setValidation] = useState<Validation | null>(null);
  const [preview, setPreview] = useState<any>(null);
  const [actionMsg, setActionMsg] = useState('');
  const [confirmSync, setConfirmSync] = useState(false);
  const [adminKey, setAdminKey] = useState('');
  // Overrides eksplisit per aksi (bukan tebakan): hanya dikirim bila diisi.
  const [ov, setOv] = useState({ categoryId: '', condition: '', weightGrams: '', lengthCm: '', widthCm: '', heightCm: '', sku: '', stock: '' });

  const loadAll = async () => {
    setLoading(true);
    setStatusErr(''); setProdErr('');
    try {
      const s = await fetch('/api/tiktok/status', { cache: 'no-store' });
      if (!s.ok) throw new Error(`status HTTP ${s.status}`);
      setStatus(await s.json());
    } catch (e: any) {
      setStatusErr(`Gagal memuat status: ${e?.message || e}`);
    }
    try {
      const p = await fetch('/api/tiktok/products', { cache: 'no-store' });
      const data = await p.json();
      if (!p.ok || !data?.ok) throw new Error(data?.error || `HTTP ${p.status}`);
      setProducts(data.products || []);
    } catch (e: any) {
      setProdErr(`Gagal memuat produk Sanity: ${e?.message || e}`);
    }
    setLoading(false);
  };

  useEffect(() => { loadAll(); }, []);

  const buildOverrides = () => {
    const o: Record<string, any> = {};
    if (ov.categoryId.trim()) o.categoryId = ov.categoryId.trim();
    if (ov.condition) o.condition = ov.condition;
    if (ov.sku.trim()) o.sku = ov.sku.trim();
    const num = (v: string) => (v.trim() === '' ? undefined : Number(v));
    const g = num(ov.weightGrams); if (g !== undefined) o.weightGrams = g;
    const l = num(ov.lengthCm); if (l !== undefined) o.lengthCm = l;
    const w = num(ov.widthCm); if (w !== undefined) o.widthCm = w;
    const h = num(ov.heightCm); if (h !== undefined) o.heightCm = h;
    const st = num(ov.stock); if (st !== undefined) o.stock = st;
    return o;
  };

  const needSelection = () => {
    if (!selectedId) { setActionMsg('Pilih SATU produk terlebih dahulu.'); return false; }
    return true;
  };

  const callJson = async (url: string, body: any) => {
    const r = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
    const data = await r.json().catch(() => ({}));
    return { r, data };
  };

  const handleValidate = async () => {
    if (!needSelection()) return;
    setBusy('validate'); setActionMsg(''); setPreview(null);
    const { r, data } = await callJson('/api/tiktok/validate', { id: selectedId, overrides: buildOverrides() });
    setBusy('');
    if (!r.ok) { setActionMsg(`❌ ${data?.error || 'Validasi gagal.'}`); setValidation(null); return; }
    setValidation(data.validation);
    setActionMsg(data.validation.valid ? '✅ Produk VALID — boleh lanjut ke dry-run.' : `⚠️ Belum valid: ${data.validation.errors.length} error, ${data.validation.warnings.length} warning.`);
  };

  const handleDryRun = async () => {
    if (!needSelection()) return;
    setBusy('dryrun'); setActionMsg('');
    const { r, data } = await callJson('/api/tiktok/dryrun', { id: selectedId, overrides: buildOverrides() });
    setBusy('');
    if (!r.ok) { setActionMsg(`❌ ${data?.error || 'Dry-run gagal.'}`); return; }
    setValidation(data.validation);
    setPreview(data.payloadPreview);
    setActionMsg(data.ok ? `✅ ${data.reason}` : `⚠️ ${data.reason}`);
  };

  const handleExport = async () => {
    if (!needSelection()) return;
    setBusy('export'); setActionMsg('');
    try {
      const r = await fetch('/api/tiktok/export', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: selectedId, overrides: buildOverrides() }) });
      if (!r.ok) {
        const data = await r.json().catch(() => ({}));
        setActionMsg(`❌ ${data?.error || 'Ekspor gagal.'}`);
      } else {
        const blob = await r.blob();
        const a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = `tiktok-1produk-${selectedId.replace(/[^a-zA-Z0-9_-]/g, '').slice(0, 40)}.csv`;
        document.body.appendChild(a); a.click(); a.remove();
        setActionMsg('✅ CSV 1 produk terunduh (untuk pengisian manual di Seller Center).');
      }
    } catch (e: any) {
      setActionMsg(`❌ ${e?.message || e}`);
    }
    setBusy('');
  };

  const handleSync = async () => {
    if (!needSelection()) return;
    if (!validation?.valid) { setActionMsg('❌ Sinkron ditolak: jalankan Validasi/Dry-run hingga VALID dulu.'); return; }
    if (!confirmSync) { setActionMsg('❌ Centang konfirmasi eksplisit untuk mengirim 1 produk.'); return; }
    if (!adminKey.trim()) { setActionMsg('❌ Masukkan kunci admin (diketik per aksi, tidak disimpan).'); return; }
    setBusy('sync'); setActionMsg('');
    const { r, data } = await callJson('/api/tiktok/sync', { id: selectedId, confirm: true, adminKey: adminKey.trim(), overrides: buildOverrides() });
    setBusy('');
    setAdminKey(''); setConfirmSync(false);
    if (!r.ok) { setActionMsg(`❌ ${data?.error || 'Sinkron gagal.'} ${data?.tiktokMessage || ''}`); return; }
    setActionMsg(`✅ ${data.message} (TikTok ID: ${data.tiktokProductId || '-'}) — verifikasi sebagai DRAFT di Seller Center.`);
  };

  const selected = products.find((p) => p.id === selectedId);

  return (
    <div className="text-left max-h-[80vh] overflow-y-auto pr-1">
      <button onClick={onBack} className="flex items-center gap-1 text-xs font-bold text-gray-500 hover:text-gray-800 mb-3">
        <ArrowLeft size={14} /> Kembali ke menu admin
      </button>
      <h3 className="text-xl font-black mb-1">Sinkronisasi TikTok Shop</h3>
      <p className="text-xs text-gray-500 mb-4">Satu produk per aksi • Pratinjau dulu • Tanpa tebakan data • Tanpa sinkron massal</p>

      {loading && <p className="text-sm text-gray-500">Memuat status & produk…</p>}
      {statusErr && <p className="text-sm text-red-600 mb-2">❌ {statusErr}</p>}
      {prodErr && <p className="text-sm text-red-600 mb-2">❌ {prodErr}</p>}

      {status && (
        <div className={`rounded-2xl border p-3 mb-4 text-xs ${status.syncBlocked ? 'bg-amber-50 border-amber-200' : 'bg-red-50 border-red-300'}`}>
          <div className="flex items-center gap-2 font-black mb-1">
            {status.syncBlocked ? <ShieldCheck size={16} className="text-amber-600" /> : <ShieldAlert size={16} className="text-red-600" />}
            {status.syncBlocked ? 'MODE DRY-RUN / EKSPOR (sinkron terkunci)' : 'SINKRON TERBUKA — tetap wajib konfirmasi per produk'}
          </div>
          <p className="text-gray-600 mb-2">{status.message}</p>
          <div className="grid grid-cols-2 gap-1 text-[11px]">
            {[
              ['App Key', status.hasAppKey], ['App Secret', status.hasAppSecret],
              ['Access Token', status.hasAccessToken], ['Refresh Token', status.hasRefreshToken],
              ['Shop ID', status.hasShopId], ['Shop Cipher', status.hasShopCipher],
              ['Admin Key', status.hasAdminKey], ['Flag SYNC', status.syncEnabled],
            ].map(([k, v]) => (
              <div key={k as string} className="flex items-center gap-1">
                {v ? <CheckCircle2 size={12} className="text-green-600" /> : <XCircle size={12} className="text-gray-400" />}
                <span>{k}: <b>{v ? 'terisi' : 'belum'}</b></span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Pilih 1 produk */}
      <label className={labelCls}>1) Pilih satu produk Sanity</label>
      <div className="flex gap-2 mb-2">
        <select value={selectedId} onChange={(e) => { setSelectedId(e.target.value); setValidation(null); setPreview(null); setActionMsg(''); }} className={inputCls}>
          <option value="">— pilih produk —</option>
          {products.map((p) => (
            <option key={p.id} value={p.id}>{p.name} — Rp{(p.price ?? 0).toLocaleString('id-ID')} — stok {p.stock ?? '?'} — {p.category || 'tanpa kategori'}</option>
          ))}
        </select>
        <button onClick={loadAll} title="Muat ulang" className="px-3 rounded-xl border hover:bg-gray-100"><RefreshCw size={16} /></button>
      </div>
      {selected && (
        <div className="flex items-center gap-3 mb-3 text-xs text-gray-600">
          {selected.thumbnail && <img src={selected.thumbnail} alt="" className="w-12 h-12 rounded-lg object-cover border" />}
          <div>ID: <code className="bg-gray-100 px-1 rounded">{selected.id}</code><br />{selected.imageCount} gambar • {selected.category || 'tanpa kategori'}</div>
        </div>
      )}

      {/* Overrides eksplisit */}
      <label className={labelCls}>2) Overrides eksplisit (opsional, per aksi — diketik manual, bukan tebakan)</label>
      <div className="grid grid-cols-2 gap-2 mb-3">
        <input className={inputCls} placeholder="TikTok category_id" value={ov.categoryId} onChange={(e) => setOv({ ...ov, categoryId: e.target.value })} />
        <select className={inputCls} value={ov.condition} onChange={(e) => setOv({ ...ov, condition: e.target.value })}>
          <option value="">Kondisi…</option><option value="NEW">NEW (baru)</option><option value="USED">USED (bekas)</option>
        </select>
        <input className={inputCls} placeholder="SKU" value={ov.sku} onChange={(e) => setOv({ ...ov, sku: e.target.value })} />
        <input className={inputCls} placeholder="Stok" inputMode="numeric" value={ov.stock} onChange={(e) => setOv({ ...ov, stock: e.target.value })} />
        <input className={inputCls} placeholder="Berat (gram)" inputMode="numeric" value={ov.weightGrams} onChange={(e) => setOv({ ...ov, weightGrams: e.target.value })} />
        <input className={inputCls} placeholder="P (cm)" inputMode="numeric" value={ov.lengthCm} onChange={(e) => setOv({ ...ov, lengthCm: e.target.value })} />
        <input className={inputCls} placeholder="L (cm)" inputMode="numeric" value={ov.widthCm} onChange={(e) => setOv({ ...ov, widthCm: e.target.value })} />
        <input className={inputCls} placeholder="T (cm)" inputMode="numeric" value={ov.heightCm} onChange={(e) => setOv({ ...ov, heightCm: e.target.value })} />
      </div>

      {/* Aksi */}
      <label className={labelCls}>3) Validasi → dry-run → ekspor / sinkron</label>
      <div className="grid grid-cols-2 gap-2 mb-3">
        <button onClick={handleValidate} disabled={!!busy} className="bg-slate-900 text-white text-sm font-bold py-2.5 rounded-xl flex items-center justify-center gap-1.5 disabled:opacity-50">
          <FlaskConical size={15} /> {busy === 'validate' ? '…' : 'Validasi'}
        </button>
        <button onClick={handleDryRun} disabled={!!busy} className="bg-blue-600 text-white text-sm font-bold py-2.5 rounded-xl flex items-center justify-center gap-1.5 disabled:opacity-50">
          <Eye size={15} /> {busy === 'dryrun' ? '…' : 'Dry-run'}
        </button>
        <button onClick={handleExport} disabled={!!busy} className="bg-green-600 text-white text-sm font-bold py-2.5 rounded-xl flex items-center justify-center gap-1.5 disabled:opacity-50">
          <Download size={15} /> {busy === 'export' ? '…' : 'Ekspor CSV'}
        </button>
        <button onClick={handleSync} disabled={!!busy || status?.syncBlocked} title={status?.syncBlocked ? 'Terkunci: kredensial/flag belum lengkap' : 'Kirim 1 produk ke TikTok'} className="bg-red-600 text-white text-sm font-bold py-2.5 rounded-xl flex items-center justify-center gap-1.5 disabled:opacity-40">
          <Send size={15} /> {busy === 'sync' ? '…' : 'Sinkron 1'}
        </button>
      </div>

      {/* Konfirmasi + admin key untuk sync */}
      {!status?.syncBlocked && (
        <div className="rounded-2xl border border-red-200 bg-red-50/50 p-3 mb-3 space-y-2">
          <label className="flex items-start gap-2 text-xs font-bold text-gray-700">
            <input type="checkbox" checked={confirmSync} onChange={(e) => setConfirmSync(e.target.checked)} className="mt-0.5" />
            Saya menyetujui pengiriman 1 produk ini ke TikTok Shop (sebagai DRAFT, bukan massal).
          </label>
          <input type="password" className={inputCls} placeholder="Kunci admin (diketik per aksi)" value={adminKey} onChange={(e) => setAdminKey(e.target.value)} autoComplete="off" />
        </div>
      )}

      {actionMsg && <p className="text-xs font-bold text-gray-700 bg-gray-100 rounded-xl p-2.5 mb-3">{actionMsg}</p>}

      {validation && (
        <div className="mb-3">
          <p className={`text-sm font-black mb-2 ${validation.valid ? 'text-green-700' : 'text-red-700'}`}>
            {validation.valid ? `✅ VALID (${validation.warnings.length} warning)` : `❌ INVALID — ${validation.errors.length} error, ${validation.warnings.length} warning`}
          </p>
          {validation.overrideFields.length > 0 && (
            <p className="text-[11px] text-blue-700 mb-2">Overrides tercatat: {validation.overrideFields.join(', ')}</p>
          )}
          <div className="space-y-1.5 max-h-48 overflow-y-auto">
            {validation.errors.map((e, i) => (
              <div key={`e${i}`} className="text-xs bg-red-50 border border-red-200 rounded-xl p-2">
                <b className="text-red-700">ERROR [{e.field}]</b> {e.message}<br /><span className="text-gray-500">→ {e.fix}</span>
              </div>
            ))}
            {validation.warnings.map((w, i) => (
              <div key={`w${i}`} className="text-xs bg-amber-50 border border-amber-200 rounded-xl p-2">
                <b className="text-amber-700">WARNING [{w.field}]</b> {w.message}<br /><span className="text-gray-500">→ {w.fix}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {preview && (
        <div className="mb-2">
          <label className={labelCls}>Pratinjau payload TikTok (dry-run, tidak dikirim)</label>
          <pre className="text-[11px] bg-gray-900 text-green-300 rounded-xl p-3 overflow-x-auto max-h-64 overflow-y-auto">{JSON.stringify(preview, null, 2)}</pre>
        </div>
      )}
    </div>
  );
}
