import { useEffect, useState } from 'react';
import { ArrowLeft, CheckCircle2, Download, Eye, FlaskConical, RefreshCw, Send, ShieldAlert, ShieldCheck, Sparkles, XCircle } from 'lucide-react';
import { presetFor } from '../lib/lazada-category-presets';

type StatusResp = {
  ok: boolean;
  mode: 'DRY_RUN_EXPORT' | 'SYNC_ARMED';
  syncEnabled: boolean;
  credentialsComplete: boolean;
  hasAppKey: boolean; hasAppSecret: boolean; hasAccessToken: boolean;
  hasRefreshToken: boolean; hasAdminKey: boolean;
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

export default function LazadaSyncPanel({ onBack }: { onBack: () => void }) {
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
  // --- kirim cepat 1 produk (panel ringkas di paling atas) ---
  const [quickOpen, setQuickOpen] = useState(false);
  const [quickBusy, setQuickBusy] = useState('');
  const [quickMsg, setQuickMsg] = useState('');
  const [quickConfirm, setQuickConfirm] = useState(false);
  const [quickKey, setQuickKey] = useState('');
  const [adminKey, setAdminKey] = useState('');
  const [ovMsg, setOvMsg] = useState('');
  const [ov, setOv] = useState({ categoryId: '', brand: '', brandId: '', sku: '', stock: '', weightGrams: '', lengthCm: '', widthCm: '', heightCm: '' });
  // --- bulk: kirim SEMUA produk ---
  const [bulkPlan, setBulkPlan] = useState<any>(null);
  const [bulkMsg, setBulkMsg] = useState('');
  const [bulkBusy, setBulkBusy] = useState('');
  const [bulkConfirm, setBulkConfirm] = useState(false);
  const [bulkAdminKey, setBulkAdminKey] = useState('');
  const [bulkResults, setBulkResults] = useState<any[]>([]);
  // --- isi cepat massal (nilai EKSPLISIT dari admin, bukan tebakan) ---
  const [cfg, setCfg] = useState<any>({ brand: '', brandId: '', weightGrams: '', lengthCm: '', widthCm: '', heightCm: '', stock: '', skuPrefix: '', skuPad: 4, skuStart: 1, categoryMap: {}, perCategory: {} });
  const [cfgMsg, setCfgMsg] = useState('');
  const [catList, setCatList] = useState<any[]>([]);
  const [catAll, setCatAll] = useState<any[]>([]); // semua kategori daun untuk pilihan dropdown
  const [catMsg, setCatMsg] = useState('');
  const [catBusy, setCatBusy] = useState('');
  const [catSearch, setCatSearch] = useState('');
  const [sanityCats, setSanityCats] = useState<{ name: string; count: number }[]>([]);

  const loadAll = async () => {
    setLoading(true);
    setStatusErr(''); setProdErr('');
    try {
      const s = await fetch('/api/lazada/status', { cache: 'no-store' });
      if (!s.ok) throw new Error(`status HTTP ${s.status}`);
      setStatus(await s.json());
    } catch (e: any) {
      setStatusErr(`Gagal memuat status: ${e?.message || e}`);
    }
    try {
      const p = await fetch('/api/lazada/products', { cache: 'no-store' });
      const data = await p.json();
      if (!p.ok || !data?.ok) throw new Error(data?.error || `HTTP ${p.status}`);
      setProducts(data.products || []);
    } catch (e: any) {
      setProdErr(`Gagal memuat produk Sanity: ${e?.message || e}`);
    }
    setLoading(false);
  };

  useEffect(() => { loadAll(); }, []);
  useEffect(() => {
    try {
      const raw = localStorage.getItem('lazada-bulk-config-v1');
      if (raw) setCfg(JSON.parse(raw));
    } catch { /* abaikan */ }
  }, []);

  // Simpan otomatis: isian cepat tidak hilang saat halaman dimuat ulang.
  useEffect(() => {
    try { localStorage.setItem('lazada-bulk-config-v1', JSON.stringify(cfg)); } catch { /* abaikan */ }
  }, [cfg]);

  // Hitung isi kolom untuk satu produk: isian cepat admin -> saran per jenis -> data Sanity.
  // Semua nilai tetap ditampilkan di kotak, jadi admin bisa memeriksa & mengubah sebelum kirim.
  const computeOverrides = (p: any) => {
    const catKey = p?.category || '';
    const per = (cfg.perCategory || {})[catKey] || {};
    const preset = presetFor(catKey);
    const pick = (...vals: any[]) => {
      for (const v of vals) if (String(v ?? '').trim() !== '') return String(v).trim();
      return '';
    };
    const ordered = [...products].sort((a, b) => String(a.id).localeCompare(String(b.id)));
    const idx = ordered.findIndex((x) => x.id === p?.id);
    const pad = Math.min(Number(cfg.skuPad) || 4, 8);
    const autoSku = cfg.skuPrefix
      ? `${cfg.skuPrefix}${String((Number(cfg.skuStart) || 1) + Math.max(idx, 0)).padStart(pad, '0')}`
      : '';
    // Kalau admin mengetik nama brand di kotak Brand ID, pindahkan ke Brand.
    const rawBrand = pick(cfg.brand);
    const rawBrandId = pick(cfg.brandId);
    const brandIdIsNumeric = /^\d+$/.test(rawBrandId);
    const brand = rawBrand || (rawBrandId && !brandIdIsNumeric ? rawBrandId : '');
    const brandId = brandIdIsNumeric ? rawBrandId : '';

    return {
      categoryId: pick(cfg.categoryMap?.[catKey], preset?.categoryId),
      brand,
      brandId,
      sku: pick(autoSku),
      stock: pick(cfg.stock, p?.stock),
      weightGrams: pick(per.weightGrams, cfg.weightGrams, preset?.weightGrams),
      lengthCm: pick(per.lengthCm, cfg.lengthCm, preset?.lengthCm),
      widthCm: pick(per.widthCm, cfg.widthCm, preset?.widthCm),
      heightCm: pick(per.heightCm, cfg.heightCm, preset?.heightCm),
    };
  };

  // Isi ulang kolom (menimpa) dengan nilai terbaru dari isian cepat + saran.
  const fillOverridesFromCfg = () => {
    const p = products.find((x) => x.id === selectedId);
    if (!p) { setOvMsg('Pilih produk dulu.'); return; }
    setOv(computeOverrides(p));
    setOvMsg('Kolom diisi dari isian cepat + saran per jenis. Periksa dulu, lalu klik Validasi.');
  };

  // Saat produk dipilih, kolom langsung terisi otomatis supaya tidak perlu mengetik manual.
  useEffect(() => {
    if (!selectedId) return;
    const p = products.find((x) => x.id === selectedId);
    if (!p) return;
    setOv(computeOverrides(p));
    setOvMsg('Kolom terisi otomatis (isian cepat + saran). Periksa, lalu klik Validasi.');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedId, products.length]);

  const buildOverrides = () => {
    const o: Record<string, any> = {};
    if (ov.categoryId.trim()) o.categoryId = ov.categoryId.trim();
    if (ov.brand.trim()) o.brand = ov.brand.trim();
    if (ov.brandId.trim()) o.brandId = ov.brandId.trim();
    if (ov.sku.trim()) o.sku = ov.sku.trim();
    const num = (v: string) => (v.trim() === '' ? undefined : Number(v));
    const st = num(ov.stock); if (st !== undefined) o.stock = st;
    const g = num(ov.weightGrams); if (g !== undefined) o.weightGrams = g;
    const l = num(ov.lengthCm); if (l !== undefined) o.lengthCm = l;
    const w = num(ov.widthCm); if (w !== undefined) o.widthCm = w;
    const h = num(ov.heightCm); if (h !== undefined) o.heightCm = h;
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
    const { r, data } = await callJson('/api/lazada/validate', { id: selectedId, overrides: buildOverrides() });
    setBusy('');
    if (!r.ok) { setActionMsg(`❌ ${data?.error || 'Validasi gagal.'}`); setValidation(null); return; }
    setValidation(data.validation);
    setActionMsg(data.validation.valid ? '✅ Produk VALID — boleh lanjut ke dry-run.' : `⚠️ Belum valid: ${data.validation.errors.length} error, ${data.validation.warnings.length} warning.`);
  };

  const handleDryRun = async () => {
    if (!needSelection()) return;
    setBusy('dryrun'); setActionMsg('');
    const { r, data } = await callJson('/api/lazada/dryrun', { id: selectedId, overrides: buildOverrides() });
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
      const r = await fetch('/api/lazada/export', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: selectedId, overrides: buildOverrides() }) });
      if (!r.ok) {
        const data = await r.json().catch(() => ({}));
        setActionMsg(`❌ ${data?.error || 'Ekspor gagal.'}`);
      } else {
        const blob = await r.blob();
        const a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = `lazada-1produk-${selectedId.replace(/[^a-zA-Z0-9_-]/g, '').slice(0, 40)}.csv`;
        document.body.appendChild(a); a.click(); a.remove();
        setActionMsg('✅ CSV 1 produk terunduh (untuk pengisian manual di Seller Center).');
      }
    } catch (e: any) {
      setActionMsg(`❌ ${e?.message || e}`);
    }
    setBusy('');
  };

  // Kirim cepat: validasi dulu (tidak mengirim), lalu kirim 1 produk bila admin sudah centang.
  const handleQuickSend = async () => {
    if (!selectedId) { setQuickMsg('Pilih produk dulu.'); return; }
    if (!quickConfirm) { setQuickMsg('❌ Centang dulu pernyataan persetujuan.'); return; }
    if (!quickKey.trim()) { setQuickMsg('❌ Kunci admin belum diisi.'); return; }

    setQuickBusy('validate'); setQuickMsg('Memeriksa data…');
    const v = await callJson('/api/lazada/validate', { id: selectedId, overrides: buildOverrides() });
    if (!v.r.ok || !v.data?.validation?.valid) {
      const errs = v.data?.validation?.errors || [];
      setQuickBusy('');
      setQuickMsg(`❌ Belum bisa dikirim: ${v.data?.error || `${errs.length} data belum lengkap`}${errs.length ? ` — ${errs[0].field}: ${errs[0].message}` : ''}`);
      return;
    }

    setQuickBusy('send'); setQuickMsg('Mengirim ke Lazada…');
    const { r, data } = await callJson('/api/lazada/sync', {
      id: selectedId, confirm: true, adminKey: quickKey.trim(), overrides: buildOverrides(),
    });
    setQuickBusy('');
    if (!r.ok) {
      setQuickMsg(`❌ ${data?.error || 'Gagal mengirim.'} ${data?.detail || data?.message || ''}${data?.lazadaDetail ? ` — ${String(data.lazadaDetail).slice(0, 200)}` : ''}`);
      return;
    }
    try {
      const sent = JSON.parse(localStorage.getItem('lazada-bulk-sent-ids-v1') || '[]');
      localStorage.setItem('lazada-bulk-sent-ids-v1', JSON.stringify([...new Set([...sent, selectedId])]));
    } catch { /* catat pengiriman best-effort */ }
    setQuickMsg('✅ Terkirim ke Lazada sebagai DRAFT. Cek Seller Center → Products.');
    setQuickConfirm(false);
  };

  const handleSync = async () => {
    if (!needSelection()) return;
    if (!validation?.valid) { setActionMsg('❌ Sinkron ditolak: jalankan Validasi/Dry-run hingga VALID dulu.'); return; }
    if (!confirmSync) { setActionMsg('❌ Centang konfirmasi eksplisit untuk mengirim 1 produk.'); return; }
    if (!adminKey.trim()) { setActionMsg('❌ Masukkan kunci admin (diketik per aksi, tidak disimpan).'); return; }
    setBusy('sync'); setActionMsg('');
    const { r, data } = await callJson('/api/lazada/sync', { id: selectedId, confirm: true, adminKey: adminKey.trim(), overrides: buildOverrides() });
    setBusy('');
    setAdminKey(''); setConfirmSync(false);
    if (!r.ok) { setActionMsg(`❌ ${data?.error || 'Sinkron gagal.'} ${data?.lazadaMessage || ''}`); return; }
    setActionMsg(`✅ ${data.message} — verifikasi di Seller Center.`);
  };

  // Simpan/muat profil isi-cepat dari browser (tidak dikirim ke server).
  const CFG_KEY = 'lazada-bulk-config-v1';
  const loadCfg = () => {
    try {
      const raw = localStorage.getItem(CFG_KEY);
      if (raw) { setCfg(JSON.parse(raw)); setCfgMsg('Profil tersimpan dimuat.'); }
      else setCfgMsg('Belum ada profil tersimpan.');
    } catch { setCfgMsg('Profil tidak bisa dibaca.'); }
  };
  const saveCfg = () => {
    try { localStorage.setItem(CFG_KEY, JSON.stringify(cfg)); setCfgMsg('✅ Profil isi-cepat disimpan di browser ini.'); }
    catch { setCfgMsg('❌ Gagal menyimpan profil.'); }
  };

  const fetchCategories = async (keyword = '') => {
    setCatBusy('load'); setCatMsg('');
    try {
      const r = await fetch(`/api/lazada/categories?leaf=1&refresh=1${keyword ? `&q=${encodeURIComponent(keyword)}` : ''}`, { cache: 'no-store' });
      const data = await r.json();
      if (!r.ok) { setCatMsg(`❌ ${data?.error || 'Gagal memuat kategori'} ${data?.lazadaMessage || ''}`); setCatList([]); return; }
      setCatList(data.categories || []);
      setCatMsg(`✅ ${data.shown} kategori daun dari Lazada (total ${data.total}).`);
    } catch (e: any) { setCatMsg(`❌ ${e?.message || e}`); }
    setCatBusy('');
  };

  const loadAllCategories = async (force = false) => {
    setCatBusy('all'); setCatMsg('');
    try {
      const r = await fetch(`/api/lazada/categories?leaf=1&limit=3500${force ? '&refresh=1' : ''}`, { cache: 'no-store' });
      const data = await r.json();
      if (!r.ok) {
        setCatMsg(`❌ ${data?.error || 'Gagal memuat kategori'} ${data?.lazadaMessage || data?.detail || ''}`);
        return;
      }
      setCatAll(data.categories || []);
      setCatMsg(`✅ ${data.categories?.length || 0} kategori Lazada siap dipilih. Ketik di kotak tiap jenis produk untuk mencari.`);
    } catch (e: any) { setCatMsg(`❌ ${e?.message || e}`); }
    setCatBusy('');
  };

  // Muat otomatis sekali saat kredensial sudah lengkap.
  useEffect(() => {
    if (status?.credentialsComplete && catAll.length === 0) loadAllCategories(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status?.credentialsComplete]);

  const catPathFor = (id: string) => {
    if (!id) return '';
    const found = catAll.find((c: any) => String(c.id) === String(id));
    return found ? found.path : id;
  };

  const setCatIdFor = (name: string, id: string) => {
    setCfg((prev: any) => ({ ...prev, categoryMap: { ...(prev.categoryMap || {}), [name]: id } }));
  };
  const setCatField = (name: string, field: string, value: string) => {
    setCfg((prev: any) => ({
      ...prev,
      perCategory: {
        ...(prev.perCategory || {}),
        [name]: { ...((prev.perCategory || {})[name] || {}), [field]: value },
      },
    }));
  };

  // Isi berat/ukuran dari perkiraan per jenis produk (hanya yang masih kosong).
  const applyDimensionPresets = () => {
    let filled = 0;
    let skipped = 0;
    setCfg((prev: any) => {
      const nextPer = { ...(prev.perCategory || {}) };
      for (const sc of sanityCats) {
        const p = presetFor(sc.name);
        if (!p) continue;
        const cur = nextPer[sc.name] || {};
        const hasAll = ['weightGrams', 'lengthCm', 'widthCm', 'heightCm'].every(
          (k) => String(cur[k] ?? '').trim() !== ''
        );
        if (hasAll) { skipped += 1; continue; }
        nextPer[sc.name] = {
          ...cur,
          weightGrams: String(cur.weightGrams ?? '').trim() || String(p.weightGrams),
          lengthCm: String(cur.lengthCm ?? '').trim() || String(p.lengthCm),
          widthCm: String(cur.widthCm ?? '').trim() || String(p.widthCm),
          heightCm: String(cur.heightCm ?? '').trim() || String(p.heightCm),
        };
        filled += 1;
      }
      return { ...prev, perCategory: nextPer };
    });
    setCatMsg(`✅ Berat & ukuran PERKIRAAN diisi untuk ${filled} jenis produk${skipped ? `, ${skipped} dilewati karena sudah lengkap` : ''}. Ini bukan hasil timbangan — ubah angkanya bila perlu, lalu klik "1. Hitung rencana".`);
  };

  // Isi peta kategori dari saran yang sudah dicek terhadap GetCategoryTree + nama produk Sanity.
  // Hanya mengisi yang masih kosong supaya isian manual admin tidak tertimpa.
  const applyCategoryPresets = () => {
    let filled = 0;
    let skipped = 0;
    setCfg((prev: any) => {
      const nextMap = { ...(prev.categoryMap || {}) };
      for (const sc of sanityCats) {
        if (String(nextMap[sc.name] || '').trim()) { skipped += 1; continue; }
        const p = presetFor(sc.name);
        if (p) { nextMap[sc.name] = p.categoryId; filled += 1; }
      }
      return { ...prev, categoryMap: nextMap };
    });
    setCatMsg(`✅ Saran diisi untuk ${filled} jenis produk${skipped ? `, ${skipped} dilewati karena sudah ada isinya` : ''}. Periksa dulu, lalu klik "1. Hitung rencana".`);
  };

  const handleBulkPlan = async () => {
    setBulkBusy('plan'); setBulkMsg(''); setBulkResults([]);
    const { r, data } = await callJson('/api/lazada/bulk', { action: 'plan', config: cfg });
    setBulkBusy('');
    if (!r.ok) { setBulkMsg(`❌ ${data?.error || 'Gagal menghitung rencana.'}`); return; }
    setBulkPlan(data);
    if (Array.isArray(data.config?.sanityCategories)) setSanityCats(data.config.sanityCategories);
    setBulkMsg(
      `Rencana: ${data.readyCount} produk siap dikirim, ${data.invalidCount} produk perlu diperbaiki. ` +
      `Dikirim ${data.batchSize} per putaran (butuh ${data.batchesNeeded} putaran). Tidak ada yang dikirim.`
    );
  };

  const handleBulkSend = async () => {
    if (!bulkPlan) { setBulkMsg('❌ Klik "Hitung rencana" dulu supaya Anda melihat jumlah siap vs bermasalah.'); return; }
    if (!bulkConfirm) { setBulkMsg('❌ Centang pernyataan persetujuan dulu.'); return; }
    if (!bulkAdminKey.trim()) { setBulkMsg('❌ Masukkan kunci admin (diketik per aksi, tidak disimpan).'); return; }

    // Hanya kirim ID dalam rencana, berurutan dalam putaran maksimal 5.
    // Produk tes Handle Grip telah terkirim lewat tombol satuan, jangan buat duplikat lagi.
    const pilotAlreadySent = new Set(['68e9c5c3-69c2-4fb4-8349-3bb670bda2f2']);
    let rememberedSent: string[] = [];
    let rememberedUncertain: string[] = [];
    try {
      const saved = JSON.parse(localStorage.getItem('lazada-bulk-sent-ids-v1') || '[]');
      if (Array.isArray(saved)) rememberedSent = saved.map(String);
      const uncertain = JSON.parse(localStorage.getItem('lazada-bulk-uncertain-ids-v1') || '[]');
      if (Array.isArray(uncertain)) rememberedUncertain = uncertain.map(String);
    } catch { /* abaikan */ }
    const sentSet = new Set([...rememberedSent, ...pilotAlreadySent]);
    const uncertainSet = new Set(rememberedUncertain);
    const allReadyIds = (bulkPlan.ready || []).map((x: any) => String(x.id)).filter(Boolean);
    const pendingIds = allReadyIds.filter((id: string) => !sentSet.has(id) && !uncertainSet.has(id));
    if (!pendingIds.length) {
      setBulkMsg(uncertainSet.size
        ? `Tidak ada produk aman tersisa: ${sentSet.size - pilotAlreadySent.size} sudah terkirim dan ${uncertainSet.size} perlu diperiksa di Seller Center.`
        : '✅ Tidak ada produk baru tersisa di rencana ini. Produk yang sudah terkirim dilewati.');
      return;
    }

    setBulkBusy('send'); setBulkResults([]);
    const key = bulkAdminKey.trim();
    const batchSize = Number(bulkPlan.batchSize) || 5;
    const totalBatches = Math.ceil(pendingIds.length / batchSize);
    let accumulated: any[] = [];
    let completed = 0;
    let halted = false;

    for (let offset = 0; offset < pendingIds.length; offset += batchSize) {
      const batch = pendingIds.slice(offset, offset + batchSize);
      const batchNo = Math.floor(offset / batchSize) + 1;
      setBulkMsg(`Mengirim putaran ${batchNo}/${totalBatches} — ${completed}/${pendingIds.length} terkirim. Jangan muat ulang halaman.`);
      try {
        const { r, data } = await callJson('/api/lazada/bulk', {
          action: 'send', confirm: true, adminKey: key, config: cfg, ids: batch,
        });
        if (!r.ok || !Array.isArray(data?.results)) {
          const blocked = [...new Set([...rememberedUncertain, ...batch])];
          rememberedUncertain = blocked;
          try { localStorage.setItem('lazada-bulk-uncertain-ids-v1', JSON.stringify(blocked)); } catch { /* catat best-effort */ }
          setBulkMsg(`⛔ Berhenti di putaran ${batchNo}/${totalBatches}: ${data?.error || 'hasil server tidak pasti'}. Putaran ini ditahan agar tidak duplikat; periksa Seller Center.`);
          halted = true;
          break;
        }
        const results = data.results;
        accumulated = [...accumulated, ...results];
        setBulkResults(accumulated);
        const okIds = results.filter((x: any) => x.ok).map((x: any) => String(x.id));
        if (okIds.length) {
          const updated = [...new Set([...sentSet, ...okIds])];
          try { localStorage.setItem('lazada-bulk-sent-ids-v1', JSON.stringify(updated)); } catch { /* lanjutkan sesi ini */ }
          okIds.forEach((id: string) => sentSet.add(id));
          completed += okIds.length;
        }
        const failed = results.filter((x: any) => !x.ok);
        if (failed.length || results.length !== batch.length) {
          const accounted = new Set(results.map((x: any) => String(x.id)));
          const blockedNow = [
            ...failed.map((x: any) => String(x.id)),
            ...batch.filter((id: string) => !accounted.has(id)),
          ].filter(Boolean);
          rememberedUncertain = [...new Set([...rememberedUncertain, ...blockedNow])];
          try { localStorage.setItem('lazada-bulk-uncertain-ids-v1', JSON.stringify(rememberedUncertain)); } catch { /* catat best-effort */ }
          setBulkMsg(`⛔ Berhenti setelah putaran ${batchNo}/${totalBatches}: ${completed} terkirim, ${failed.length} gagal/tidak pasti. Produk ragu ditahan agar tidak duplikat; cek Seller Center.`);
          halted = true;
          break;
        }
      } catch (e: any) {
        rememberedUncertain = [...new Set([...rememberedUncertain, ...batch])];
        try { localStorage.setItem('lazada-bulk-uncertain-ids-v1', JSON.stringify(rememberedUncertain)); } catch { /* catat best-effort */ }
        setBulkMsg(`⛔ Sambungan putus di putaran ${batchNo}/${totalBatches}; hasil putaran ini tidak pasti. Putaran ditahan agar tidak duplikat; cek Seller Center. ${e?.message || ''}`);
        halted = true;
        break;
      }
      if (offset + batchSize < pendingIds.length) await new Promise((resolve) => setTimeout(resolve, 700));
    }

    setBulkBusy('');
    setBulkAdminKey(''); setBulkConfirm(false);
    if (!halted) {
      setBulkMsg(`✅ Selesai: ${completed} produk baru terkirim bertahap (maks ${batchSize} per putaran). ${sentSet.size - pilotAlreadySent.size} produk sudah tercatat terkirim dan dilewati.`);
    }
  };

  const handleDownloadAll = async () => {
    setBulkMsg('Menyiapkan CSV…');
    try {
      const r = await fetch('/api/lazada/export-all', {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ config: cfg }),
      });
      if (!r.ok) {
        const d = await r.json().catch(() => ({}));
        setBulkMsg(`❌ ${d?.error || 'Gagal membuat CSV.'}`);
        return;
      }
      const blob = await r.blob();
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = `lazada-semua-produk-${new Date().toISOString().slice(0, 10)}.csv`;
      document.body.appendChild(a); a.click(); a.remove();
      setBulkMsg('📄 CSV semua produk diunduh (mencerminkan data isi-cepat, ada kolom status).');
    } catch (e: any) { setBulkMsg(`❌ ${e?.message || e}`); }
  };

  const selected = products.find((p) => p.id === selectedId);

  return (
    <div className="text-left max-h-[80vh] overflow-y-auto pr-1">
      <button onClick={onBack} className="flex items-center gap-1 text-xs font-bold text-gray-500 hover:text-gray-800 mb-3">
        <ArrowLeft size={14} /> Kembali ke menu admin
      </button>
      <h3 className="text-xl font-black mb-1">Sinkronisasi Lazada</h3>
      <p className="text-xs text-gray-500 mb-4">Satu produk per aksi • Pratinjau dulu • Tanpa tebakan data • Bulk hanya produk yang valid + konfirmasi</p>

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

      {/* KIRIM CEPAT 1 PRODUK — panel ringkas, dipakai kalau tidak mau scroll jauh */}
      <div className="rounded-2xl border-2 border-[#0F146D]/30 bg-slate-50 p-3 mb-3">
        <button onClick={() => setQuickOpen((v) => !v)} className="w-full flex items-center justify-between text-left">
          <span className="text-sm font-black">⚡ Kirim cepat 1 produk</span>
          <span className="text-[11px] font-bold text-[#0F146D]">{quickOpen ? 'Tutup' : 'Buka'}</span>
        </button>
        {quickOpen && (
          <div className="mt-2 space-y-2">
            <p className="text-[10px] text-gray-600">
              Pilih produk, isi stok bila perlu, centang, lalu kirim. Data lain terisi otomatis dari isian cepat + saran.
            </p>
            <select
              value={selectedId}
              onChange={(e) => { setSelectedId(e.target.value); setValidation(null); setPreview(null); setQuickMsg(''); }}
              className={inputCls}
            >
              <option value="">— pilih produk —</option>
              {products.map((p) => (
                <option key={p.id} value={p.id}>{p.name} — stok {p.stock ?? '?'} — {p.category || 'tanpa kategori'}</option>
              ))}
            </select>

            {selectedId && (
              <div className="grid grid-cols-3 gap-1.5">
                <div>
                  <label className="block text-[10px] font-bold text-gray-600 mb-0.5">Stok</label>
                  <input className={inputCls} inputMode="numeric" placeholder="0" value={ov.stock} onChange={(e) => setOv({ ...ov, stock: e.target.value })} />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-gray-600 mb-0.5">Kategori</label>
                  <input className={inputCls} placeholder="15445" value={ov.categoryId} onChange={(e) => setOv({ ...ov, categoryId: e.target.value })} />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-gray-600 mb-0.5">SKU</label>
                  <input className={inputCls} placeholder="TFS-0001" value={ov.sku} onChange={(e) => setOv({ ...ov, sku: e.target.value })} />
                </div>
              </div>
            )}

            {selectedId && (
              <p className="text-[10px] text-gray-600">
                Brand <b>{ov.brand || '—'}</b> · Berat <b>{ov.weightGrams || '—'} g</b> ·
                P/L/T <b>{ov.lengthCm || '—'}/{ov.widthCm || '—'}/{ov.heightCm || '—'} cm</b>
                {(!ov.brand || !ov.sku) && <span className="text-amber-700"> · masih ada yang kosong</span>}
              </p>
            )}

            <label className="flex items-start gap-2 text-[11px] font-bold text-gray-700">
              <input type="checkbox" checked={quickConfirm} onChange={(e) => setQuickConfirm(e.target.checked)} className="mt-0.5" />
              Saya menyetujui kirim 1 produk ini sebagai DRAFT.
            </label>
            <input
              type="password"
              className={inputCls}
              placeholder="Kunci admin"
              value={quickKey}
              onChange={(e) => setQuickKey(e.target.value)}
              autoComplete="off"
            />
            <button
              onClick={handleQuickSend}
              disabled={!!quickBusy || !selectedId || status?.syncBlocked}
              className="w-full bg-[#0F146D] text-white text-sm font-black py-2.5 rounded-xl disabled:opacity-40"
            >
              {quickBusy === 'validate' ? 'Memeriksa…' : quickBusy === 'send' ? 'Mengirim…' : 'Kirim 1 produk sekarang'}
            </button>
            {quickMsg && (
              <p className={`text-[11px] font-bold rounded-lg p-2 ${quickMsg.startsWith('✅') ? 'bg-green-50 text-green-800' : quickMsg.startsWith('❌') ? 'bg-red-50 text-red-700' : 'bg-gray-100 text-gray-700'}`}>
                {quickMsg}
              </p>
            )}
            <p className="text-[10px] text-gray-500">
              Tombol ini memvalidasi dulu; kalau ada data kurang, tidak ada yang dikirim.
            </p>
          </div>
        )}
      </div>

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

      <label className={labelCls}>2) Nilai yang akan dikirim (terisi otomatis, boleh diubah)</label>
      <div className="grid grid-cols-2 gap-2 mb-2">
        <div>
          <label className="block text-[10px] font-bold text-gray-600 mb-0.5">Kategori Lazada (category_id)</label>
          <input className={inputCls} placeholder="angka, mis. 15445" value={ov.categoryId} onChange={(e) => setOv({ ...ov, categoryId: e.target.value })} />
        </div>
        <div>
          <label className="block text-[10px] font-bold text-gray-600 mb-0.5">Brand (nama)</label>
          <input className={inputCls} placeholder="mis. No Brand" value={ov.brand} onChange={(e) => setOv({ ...ov, brand: e.target.value })} />
        </div>
        <div>
          <label className="block text-[10px] font-bold text-gray-600 mb-0.5">Brand ID</label>
          <input className={inputCls} placeholder="kosongkan bila pakai nama" value={ov.brandId} onChange={(e) => setOv({ ...ov, brandId: e.target.value })} />
        </div>
        <div>
          <label className="block text-[10px] font-bold text-gray-600 mb-0.5">SKU (SellerSku)</label>
          <input className={inputCls} placeholder="mis. TFS-0001" value={ov.sku} onChange={(e) => setOv({ ...ov, sku: e.target.value })} />
        </div>
        <div>
          <label className="block text-[10px] font-bold text-gray-600 mb-0.5">Stok</label>
          <input className={inputCls} placeholder="angka" inputMode="numeric" value={ov.stock} onChange={(e) => setOv({ ...ov, stock: e.target.value })} />
        </div>
        <div>
          <label className="block text-[10px] font-bold text-gray-600 mb-0.5">Berat paket (gram)</label>
          <input className={inputCls} placeholder="angka" inputMode="numeric" value={ov.weightGrams} onChange={(e) => setOv({ ...ov, weightGrams: e.target.value })} />
        </div>
        <div>
          <label className="block text-[10px] font-bold text-gray-600 mb-0.5">Panjang (cm)</label>
          <input className={inputCls} placeholder="angka" inputMode="numeric" value={ov.lengthCm} onChange={(e) => setOv({ ...ov, lengthCm: e.target.value })} />
        </div>
        <div>
          <label className="block text-[10px] font-bold text-gray-600 mb-0.5">Lebar (cm)</label>
          <input className={inputCls} placeholder="angka" inputMode="numeric" value={ov.widthCm} onChange={(e) => setOv({ ...ov, widthCm: e.target.value })} />
        </div>
        <div>
          <label className="block text-[10px] font-bold text-gray-600 mb-0.5">Tinggi (cm)</label>
          <input className={inputCls} placeholder="angka" inputMode="numeric" value={ov.heightCm} onChange={(e) => setOv({ ...ov, heightCm: e.target.value })} />
        </div>
      </div>
      {!String(ov.sku || '').trim() && (
        <p className="text-[10px] font-bold text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-2 py-1.5 mb-2">
          SKU masih kosong. Isi <b>Awalan SKU</b> (mis. TFS-) di bagian &ldquo;Isi cepat massal&rdquo; agar SKU terisi sendiri.
        </p>
      )}
      {!String(ov.brand || '').trim() && !String(ov.brandId || '').trim() && (
        <p className="text-[10px] font-bold text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-2 py-1.5 mb-2">
          Brand masih kosong. Isi <b>Brand</b> sekali di bagian &ldquo;Isi cepat massal&rdquo; (mis. No Brand) agar semua produk terisi.
        </p>
      )}
      <button onClick={fillOverridesFromCfg} disabled={!selectedId} className="w-full mb-3 bg-white border border-slate-300 text-slate-800 text-[11px] font-bold py-2 rounded-xl disabled:opacity-40">
        Isi ulang kolom dari isian cepat + saran
      </button>
      {ovMsg && <p className="text-[10px] font-bold text-blue-800 -mt-2 mb-2">{ovMsg}</p>}

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
        <button onClick={handleSync} disabled={!!busy || status?.syncBlocked} title={status?.syncBlocked ? 'Terkunci: kredensial/flag belum lengkap' : 'Kirim 1 produk ke Lazada'} className="bg-[#0F146D] text-white text-sm font-bold py-2.5 rounded-xl flex items-center justify-center gap-1.5 disabled:opacity-40">
          <Send size={15} /> {busy === 'sync' ? '…' : 'Sinkron 1'}
        </button>
      </div>

      {!status?.syncBlocked && (
        <div className="rounded-2xl border border-red-200 bg-red-50/50 p-3 mb-3 space-y-2">
          <label className="flex items-start gap-2 text-xs font-bold text-gray-700">
            <input type="checkbox" checked={confirmSync} onChange={(e) => setConfirmSync(e.target.checked)} className="mt-0.5" />
            Saya menyetujui pengiriman 1 produk ini ke Lazada (sebagai DRAFT, bukan massal).
          </label>
          <input type="password" className={inputCls} placeholder="Kunci admin (diketik per aksi)" value={adminKey} onChange={(e) => setAdminKey(e.target.value)} autoComplete="off" />
        </div>
      )}

      <div className="mt-4 rounded-2xl border-2 border-[#0F146D]/30 bg-slate-50 p-3">
        <p className="text-sm font-black mb-1">4) Kirim SEMUA produk sekaligus (bulk)</p>
        <p className="text-[11px] text-gray-600 mb-2">
          Produk yang datanya belum lengkap (SKU/berat/dimensi/stok/kategori/foto) <b>dilewati</b> dan dilaporkan —
          tidak ditebak. Sekali klik mengirim otomatis bertahap <b>maks 5 produk per putaran</b> dengan jeda aman. Handle Grip yang sudah dipakai untuk tes dilewati.
        </p>

        <div className="grid grid-cols-2 gap-2 mb-2">
          <button onClick={handleBulkPlan} disabled={!!bulkBusy} className="bg-slate-700 text-white text-sm font-bold py-2.5 rounded-xl disabled:opacity-50">
            {bulkBusy === 'plan' ? 'Menghitung…' : '1. Hitung rencana'}
          </button>
          <button onClick={handleDownloadAll} disabled={!!bulkBusy} className="bg-green-700 text-white text-sm font-bold py-2.5 rounded-xl disabled:opacity-50">
            Unduh CSV semua
          </button>
        </div>

        {bulkPlan && (
          <div className="text-[11px] bg-white border rounded-xl p-2 mb-2">
            <div className="font-bold mb-1">
              Total {bulkPlan.total} produk · <span className="text-green-700">siap {bulkPlan.readyCount}</span> ·{' '}
              <span className="text-red-700">perlu diperbaiki {bulkPlan.invalidCount}</span>
            </div>
            {Array.isArray(bulkPlan.config?.notes) && bulkPlan.config.notes.length > 0 && (
              <div className="text-[10px] text-blue-800 mt-1">
                {bulkPlan.config.notes.map((n: string, i: number) => <div key={i}>• {n}</div>)}
              </div>
            )}
            {bulkPlan.invalid?.length > 0 && (
              <div className="max-h-32 overflow-y-auto space-y-1 mt-1">
                {bulkPlan.invalid.slice(0, 20).map((x: any) => (
                  <div key={x.id} className="text-red-700">
                    • <b>{x.name || x.id}</b>: {x.reason}
                  </div>
                ))}
                {bulkPlan.invalid.length > 20 && <div className="text-gray-500">…dan {bulkPlan.invalid.length - 20} lainnya</div>}
              </div>
            )}
          </div>
        )}

        <div className="rounded-xl border border-blue-200 bg-blue-50/60 p-2 mb-3">
          <p className="text-xs font-black mb-1">Isi cepat massal (nilai dari Anda, bukan tebakan)</p>
          <p className="text-[10px] text-gray-600 mb-2">
            Dipakai hanya untuk kolom yang Anda isi. SKU otomatis hanya mengisi produk yang SKU-nya kosong.
          </p>
          <div className="grid grid-cols-2 gap-1.5 mb-1.5">
            <div>
              <label className="block text-[10px] font-bold text-gray-600 mb-0.5">Brand (nama)</label>
              <input className={inputCls} placeholder="mis. No Brand" value={cfg.brand ?? ''} onChange={(e) => setCfg({ ...cfg, brand: e.target.value })} />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-gray-600 mb-0.5">Awalan SKU</label>
              <input className={inputCls} placeholder="mis. TFS-" value={cfg.skuPrefix ?? ''} onChange={(e) => setCfg({ ...cfg, skuPrefix: e.target.value })} />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-gray-600 mb-0.5">Brand ID</label>
              <input className={inputCls} placeholder="kosongkan bila pakai nama" value={cfg.brandId ?? ''} onChange={(e) => setCfg({ ...cfg, brandId: e.target.value })} />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-gray-600 mb-0.5">Stok umum</label>
              <input className={inputCls} placeholder="kosongkan = pakai Sanity" inputMode="numeric" value={cfg.stock ?? ''} onChange={(e) => setCfg({ ...cfg, stock: e.target.value })} />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-gray-600 mb-0.5">Berat umum (gram)</label>
              <input className={inputCls} placeholder="angka" inputMode="numeric" value={cfg.weightGrams ?? ''} onChange={(e) => setCfg({ ...cfg, weightGrams: e.target.value })} />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-gray-600 mb-0.5">Panjang umum (cm)</label>
              <input className={inputCls} placeholder="angka" inputMode="numeric" value={cfg.lengthCm ?? ''} onChange={(e) => setCfg({ ...cfg, lengthCm: e.target.value })} />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-gray-600 mb-0.5">Lebar umum (cm)</label>
              <input className={inputCls} placeholder="angka" inputMode="numeric" value={cfg.widthCm ?? ''} onChange={(e) => setCfg({ ...cfg, widthCm: e.target.value })} />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-gray-600 mb-0.5">Tinggi umum (cm)</label>
              <input className={inputCls} placeholder="angka" inputMode="numeric" value={cfg.heightCm ?? ''} onChange={(e) => setCfg({ ...cfg, heightCm: e.target.value })} />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-gray-600 mb-0.5">Mulai nomor SKU</label>
              <input className={inputCls} placeholder="mis. 1" inputMode="numeric" value={cfg.skuStart ?? ''} onChange={(e) => setCfg({ ...cfg, skuStart: e.target.value })} />
            </div>
          </div>
          <div className="flex gap-1.5">
            <button onClick={saveCfg} className="flex-1 bg-white border text-[11px] font-bold py-1.5 rounded-lg">Simpan profil</button>
            <button onClick={loadCfg} className="flex-1 bg-white border text-[11px] font-bold py-1.5 rounded-lg">Muat profil</button>
          </div>
          {cfgMsg && <p className="text-[10px] font-bold text-blue-800 mt-1">{cfgMsg}</p>}
        </div>

        <div className="rounded-xl border border-purple-200 bg-purple-50/60 p-2 mb-3">
          <p className="text-xs font-black mb-1">Kategori Lazada per jenis produk</p>
          <div className="flex gap-1.5 mb-1.5">
            <button onClick={() => loadAllCategories(true)} disabled={!!catBusy || !status?.credentialsComplete} title={!status?.credentialsComplete ? 'Butuh App Key + Access Token di server' : 'Ambil daftar kategori asli dari Lazada'} className="flex-1 bg-purple-700 text-white text-[11px] font-bold py-2 rounded-xl disabled:opacity-40">
              {catBusy === 'all' ? 'Memuat…' : `Muat daftar kategori Lazada (${catAll.length || 0})`}
            </button>
            <button onClick={applyCategoryPresets} disabled={sanityCats.length === 0} title={sanityCats.length === 0 ? 'Klik "1. Hitung rencana" dulu' : 'Isi otomatis 9 jenis produk dengan kategori Lazada yang sudah dicocokkan'} className="bg-white border border-purple-400 text-purple-800 text-[11px] font-bold py-2 px-2 rounded-xl disabled:opacity-40 flex items-center gap-1 whitespace-nowrap">
              <Sparkles className="w-3 h-3" /> Isi saran
            </button>
          </div>
          <button onClick={applyDimensionPresets} disabled={sanityCats.length === 0} title={sanityCats.length === 0 ? 'Klik "1. Hitung rencana" dulu' : 'Isi berat & ukuran PERKIRAAN per jenis produk; bisa diubah'} className="w-full mt-1 bg-white border border-purple-400 text-purple-800 text-[11px] font-bold py-2 rounded-xl disabled:opacity-40 flex items-center justify-center gap-1">
            <Sparkles className="w-3 h-3" /> Isi berat &amp; ukuran perkiraan
          </button>
          {catMsg && <p className="text-[10px] font-bold text-purple-800 mb-1 mt-1">{catMsg}</p>}
          {catList.length > 0 && (
            <div className="max-h-28 overflow-y-auto bg-white border rounded-lg p-1 mb-2 space-y-0.5">
              {catList.map((c: any) => (
                <div key={c.id} className="text-[10px] text-gray-700 flex gap-1">
                  <code className="bg-gray-100 rounded px-1">{c.id}</code>
                  <span className="truncate">{c.path}</span>
                </div>
              ))}
            </div>
          )}
          <datalist id="lazada-cat-options">
            {catAll.map((c: any) => (
              <option key={c.id} value={c.path}>{c.id}</option>
            ))}
          </datalist>
          {sanityCats.length === 0 && <p className="text-[10px] text-gray-600">Klik "1. Hitung rencana" dulu agar daftar jenis produk Sanity muncul di sini.</p>}
          {sanityCats.map((sc) => {
            const per = (cfg.perCategory || {})[sc.name] || {};
            return (
              <div key={sc.name} className="bg-white border rounded-lg p-1.5 mb-1.5">
                <div className="text-[11px] font-bold mb-1">{sc.name} <span className="text-gray-400">({sc.count} produk)</span></div>
                <div className="grid grid-cols-2 gap-1">
                  <input
                    className={inputCls}
                    list="lazada-cat-options"
                    placeholder="ketik mis. treadmill lalu pilih"
                    value={catPathFor(cfg.categoryMap?.[sc.name] || '')}
                    onChange={(e) => {
                      const v = e.target.value;
                      const found = catAll.find((c: any) => c.path === v);
                      if (found) setCatIdFor(sc.name, String(found.id));
                      else if (/^\d+$/.test(v.trim())) setCatIdFor(sc.name, v.trim());
                      else setCatIdFor(sc.name, '');
                    }}
                  />
                  <input className={inputCls} placeholder="Berat jenis ini (gram)" inputMode="numeric" value={per.weightGrams ?? ''} onChange={(e) => setCatField(sc.name, 'weightGrams', e.target.value)} />
                  <input className={inputCls} placeholder="P (cm)" inputMode="numeric" value={per.lengthCm ?? ''} onChange={(e) => setCatField(sc.name, 'lengthCm', e.target.value)} />
                  <input className={inputCls} placeholder="L (cm)" inputMode="numeric" value={per.widthCm ?? ''} onChange={(e) => setCatField(sc.name, 'widthCm', e.target.value)} />
                  <input className={inputCls} placeholder="T (cm)" inputMode="numeric" value={per.heightCm ?? ''} onChange={(e) => setCatField(sc.name, 'heightCm', e.target.value)} />
                </div>
              </div>
            );
          })}
        </div>

        <label className="flex items-start gap-2 text-xs font-bold text-gray-700 mb-2">
          <input type="checkbox" checked={bulkConfirm} onChange={(e) => setBulkConfirm(e.target.checked)} className="mt-0.5" />
          Saya sudah melihat rencana di atas dan MENYETUJUI pengiriman semua produk yang siap ke Lazada (bertahap, maks 5 per putaran).
        </label>
        <input type="password" className={inputCls + ' mb-2'} placeholder="Kunci admin (diketik per aksi)"
          value={bulkAdminKey} onChange={(e) => setBulkAdminKey(e.target.value)} autoComplete="off" />
        <button onClick={handleBulkSend} disabled={!!bulkBusy || status?.syncBlocked}
          title={status?.syncBlocked ? 'Terkunci: flag/kredensial/kunci admin belum lengkap' : 'Kirim produk yang siap'}
          className="w-full bg-[#0F146D] text-white text-sm font-black py-3 rounded-xl disabled:opacity-40">
          {bulkBusy === 'send' ? 'Mengirim…' : '2. KIRIM semua produk yang siap'}
        </button>

        {bulkMsg && <p className="text-[11px] font-bold text-gray-800 bg-white border rounded-xl p-2 mt-2">{bulkMsg}</p>}
        {bulkResults.length > 0 && (
          <div className="mt-2 max-h-40 overflow-y-auto space-y-1">
            {bulkResults.map((r: any, i: number) => (
              <div key={i} className={`text-[11px] rounded-lg p-1.5 border ${r.ok ? 'bg-green-50 border-green-200 text-green-800' : 'bg-red-50 border-red-200 text-red-800'}`}>
                <b>{r.name || r.id}</b> — {r.ok ? 'terkirim' : (r.message || r.reason || 'gagal')}
              </div>
            ))}
          </div>
        )}
      </div>

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
          <label className={labelCls}>Pratinjau payload Lazada (dry-run, tidak dikirim)</label>
          <pre className="text-[11px] bg-gray-900 text-green-300 rounded-xl p-3 overflow-x-auto max-h-64 overflow-y-auto">{JSON.stringify(preview, null, 2)}</pre>
        </div>
      )}
    </div>
  );
}
