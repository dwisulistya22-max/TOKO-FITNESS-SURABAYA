// /api/tokopedia/[action] — SATU dynamic route untuk 4 endpoint Tokopedia & TikTok Shop.
//
// Kenapa digabung: plan Vercel Hobby dibatasi maks 12 Serverless Functions per
// deployment. Empat file terpisah membuat total 16 → ERROR exceeded_serverless_functions_per_deployment.
// Dynamic route [action] tetap melayani URL yang sama persis:
//   GET      /api/tokopedia/status      → bendera status env (tanpa rahasia)
//   GET      /api/tokopedia/auth-link   → link otorisasi + state HMAC (wajib adminKey)
//   GET      /api/tokopedia/callback    → redirect Partner Center: tukar auth_code → tampilkan token
//   GET/POST /api/tokopedia/refresh     → perpanjang access_token (wajib adminKey)
//
// Keamanan tidak berubah: adminKey di semua endpoint tulis, token & App Secret
// hanya di server (env Vercel), state CSRF HMAC-SHA256 stateless 30 menit.
import {
  envStatus,
  checkAdminKey,
  makeState,
  verifyState,
  exchangeAuthCode,
  refreshAccessToken,
  renderTokensPage,
  AUTH_BASE,
} from '../_lib/tokopedia.js';

/* ── status ─────────────────────────────────────────────────────────── */
async function handleStatus(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  res.setHeader('Access-Control-Allow-Origin', '*');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'GET') return res.status(405).json({ error: 'Gunakan GET.' });

  const gate = checkAdminKey(req, null);
  if (!gate.ok) return res.status(gate.code).json({ ok: false, error: gate.error });

  const s = envStatus();
  return res.status(200).json({
    ok: true,
    checkedAt: new Date().toISOString(),
    ...s,
    message: s.connected
      ? `Terhubung. Token kedaluwarsa ${s.daysLeft !== null ? `±${s.daysLeft} hari lagi` : '(tanggal tidak diisi)'}.`
      : s.credentialsComplete
        ? 'Kredensial App lengkap — jalankan otorisasi dari panel.'
        : 'Lengkapi TOKOPEDIA_APP_KEY + TOKOPEDIA_APP_SECRET di Vercel (Partner Center → App & Service).',
  });
}

/* ── auth-link ──────────────────────────────────────────────────────── */
async function handleAuthLink(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'GET') return res.status(405).json({ error: 'Gunakan GET.' });

  const gate = checkAdminKey(req, null);
  if (!gate.ok) return res.status(gate.code).json({ ok: false, error: gate.error });

  const s = envStatus();
  if (!s.credentialsComplete) {
    return res.status(409).json({
      ok: false,
      error: 'App Key/Secret belum lengkap di Vercel. Isi TOKOPEDIA_APP_KEY dan TOKOPEDIA_APP_SECRET dulu.',
    });
  }

  const state = makeState();
  const url = `${AUTH_BASE}?service_id=${encodeURIComponent(s.effectiveServiceId)}&state=${encodeURIComponent(state)}`;
  return res.status(200).json({
    ok: true,
    url,
    serviceIdUsed: s.hasExplicitServiceId ? 'TOKOPEDIA_SERVICE_ID' : 'TOKOPEDIA_APP_KEY (fallback)',
    note: 'Buka link ini di browser yang login ke Seller Center toko. Setelah menyetujui, Anda diarahkan ke callback dan diminta adminKey.',
  });
}

/* ── callback (Redirect URL terdaftar di Partner Center) ─────────────── */
async function handleCallback(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  res.setHeader('X-Robots-Tag', 'noindex, nofollow, noarchive');
  if (req.method !== 'GET') return res.status(405).send('Gunakan GET.');

  const q = req.query || {};
  const s = envStatus();

  if (!s.credentialsComplete) {
    return res.status(409).send(
      renderTokensPage({
        ok: false,
        title: 'Konfigurasi belum lengkap',
        error: 'TOKOPEDIA_APP_KEY / TOKOPEDIA_APP_SECRET belum diatur di Vercel.',
      }),
    );
  }

  if (q.error) {
    return res.status(200).send(
      renderTokensPage({
        ok: false,
        title: 'Otorisasi dibatalkan',
        error: `Anda menolak/membatalkan otorisasi (${String(q.error)}). Buka lagi link otorisasi dari panel bila ingin mencoba.`,
      }),
    );
  }

  const code = String(q.code || '').trim();
  const state = String(q.state || '').trim();
  if (!code) {
    return res.status(400).send(
      renderTokensPage({ ok: false, title: 'Code tidak ditemukan', error: 'Parameter code kosong. Mulailah dari panel admin.' }),
    );
  }
  if (!verifyState(state)) {
    return res.status(400).send(
      renderTokensPage({
        ok: false,
        title: 'State tidak valid',
        error: 'Link kedaluwarsa (>30 menit) atau tidak dibuat dari panel. Buka lagi link otorisasi dari panel admin.',
      }),
    );
  }

  try {
    const data = await exchangeAuthCode(code);
    return res.status(200).send(
      renderTokensPage({
        ok: true,
        title: 'Otorisasi berhasil — salin token ini',
        data,
        note: 'Token ini <b>tidak disimpan server</b> — <b>wajib</b> Anda tempel ke env Vercel (lihat langkah di bawah), lalu <b>Redeploy</b>, agar koneksi awet. Auth code sudah terpakai (sekali pakai).',
      }),
    );
  } catch (e) {
    return res.status(502).send(
      renderTokensPage({ ok: false, title: 'Penukaran token gagal', error: String(e?.message || e) }),
    );
  }
}

/* ── refresh ────────────────────────────────────────────────────────── */
async function handleRefresh(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  res.setHeader('X-Robots-Tag', 'noindex, nofollow, noarchive');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'GET' && req.method !== 'POST') return res.status(405).json({ error: 'Gunakan GET atau POST.' });

  const gate = checkAdminKey(req, req.body);
  if (!gate.ok) {
    if (String(req.headers.accept || '').includes('text/html')) {
      return res.status(gate.code).send(renderTokensPage({ ok: false, title: 'adminKey salah', error: gate.error }));
    }
    return res.status(gate.code).json({ ok: false, error: gate.error });
  }

  const s = envStatus();
  if (!s.credentialsComplete || !s.hasRefreshToken) {
    const msg = 'Kredensial belum lengkap: butuh TOKOPEDIA_APP_KEY, TOKOPEDIA_APP_SECRET, dan TOKOPEDIA_REFRESH_TOKEN di Vercel.';
    if (String(req.headers.accept || '').includes('text/html')) {
      return res.status(409).send(renderTokensPage({ ok: false, title: 'Belum siap', error: msg }));
    }
    return res.status(409).json({ ok: false, error: msg });
  }

  try {
    const data = await refreshAccessToken();
    if (String(req.headers.accept || '').includes('text/html') || req.method === 'GET') {
      return res.status(200).send(
        renderTokensPage({
          ok: true,
          title: 'Token diperpanjang — salin yang baru',
          data,
          note: 'Perbarui env <b>TOKOPEDIA_ACCESS_TOKEN</b> (dan expire-in) di Vercel dengan nilai baru di atas, lalu <b>Redeploy</b>. Refresh token lama masih berlaku sampai masa otorisasi habis.',
        }),
      );
    }
    return res.status(200).json({
      ok: true,
      accessTokenExpiresAt: data.access_token_expire_in
        ? new Date(Number(data.access_token_expire_in) * 1000).toISOString()
        : null,
      note: 'Akses token baru dibuat. Simpan ke env TOKOPEDIA_ACCESS_TOKEN lalu Redeploy.',
      // Token TIDAK dikirim dalam JSON — hanya halaman HTML admin (di atas) yang menampilkannya,
      // agar tidak bocor ke log/riwayat respons API panel.
    });
  } catch (e) {
    const msg = String(e?.message || e);
    if (String(req.headers.accept || '').includes('text/html') || req.method === 'GET') {
      return res.status(502).send(renderTokensPage({ ok: false, title: 'Refresh gagal', error: msg }));
    }
    return res.status(502).json({ ok: false, error: msg });
  }
}

/* ── router ─────────────────────────────────────────────────────────── */
export default async function handler(req, res) {
  const action = String((req.query && req.query.action) || '').toLowerCase();
  switch (action) {
    case 'status':
      return handleStatus(req, res);
    case 'auth-link':
      return handleAuthLink(req, res);
    case 'callback':
      return handleCallback(req, res);
    case 'refresh':
      return handleRefresh(req, res);
    default:
      res.setHeader('Cache-Control', 'no-store');
      return res.status(404).json({
        ok: false,
        error: `Endpoint /api/tokopedia/${action || '?'} tidak dikenal. Tersedia: status, auth-link, callback, refresh.`,
      });
  }
}
