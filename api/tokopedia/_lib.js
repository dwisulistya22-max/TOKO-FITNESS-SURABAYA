// Lib bersama integrasi Tokopedia & TikTok Shop (Partner Center).
// Docs: https://partner.tiktokshop.com/docv2/page/authorization-overview-202407
//
// Aturan keamanan (WAJIB):
// - App Secret & token HANYA di server (env Vercel), tidak pernah dirender ke browser
//   selain halaman hasil milik admin yang sudah lolos adminKey.
// - Semua endpoint wajib adminKey (TOKOPEDIA_ADMIN_KEY, fallback LAZADA_ADMIN_KEY).
// - auth_code hanya berlaku 30 menit, sekali pakai.

import crypto from 'node:crypto';

export const AUTH_BASE = 'https://services.tiktokshop.com/open/authorize'; // market ROW (ID)
export const TOKEN_GET = 'https://auth.tiktok-shops.com/api/v2/token/get';
export const TOKEN_REFRESH = 'https://auth.tiktok-shops.com/api/v2/token/refresh';

export const escapeHtml = (s) =>
  String(s ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');

export function envStatus() {
  const env = process.env;
  const appKey = (env.TOKOPEDIA_APP_KEY || '').trim();
  const appSecret = (env.TOKOPEDIA_APP_SECRET || '').trim();
  const serviceId = (env.TOKOPEDIA_SERVICE_ID || '').trim();
  const accessToken = (env.TOKOPEDIA_ACCESS_TOKEN || '').trim();
  const refreshToken = (env.TOKOPEDIA_REFRESH_TOKEN || '').trim();
  const expireIn = Number(env.TOKOPEDIA_ACCESS_TOKEN_EXPIRE_IN || 0);
  const adminKey = (env.TOKOPEDIA_ADMIN_KEY || env.LAZADA_ADMIN_KEY || '').trim();
  const now = Math.floor(Date.now() / 1000);
  return {
    hasAppKey: !!appKey,
    hasAppSecret: !!appSecret,
    hasExplicitServiceId: !!serviceId,
    effectiveServiceId: serviceId || appKey || null,
    hasAccessToken: !!accessToken,
    hasRefreshToken: !!refreshToken,
    adminKeyConfigured: !!adminKey,
    adminKeySource: env.TOKOPEDIA_ADMIN_KEY ? 'TOKOPEDIA_ADMIN_KEY' : (adminKey ? 'LAZADA_ADMIN_KEY' : 'none'),
    tokenExpiresAt: expireIn > 0 ? new Date(expireIn * 1000).toISOString() : null,
    daysLeft: expireIn > 0 ? Math.ceil((expireIn - now) / 86400) : null,
    credentialsComplete: !!(appKey && appSecret),
    connected: !!(appKey && appSecret && accessToken && refreshToken),
    shopCode: (env.TOKOPEDIA_SHOP_CODE || '').trim() || null,
  };
}

// adminKey: body.adminKey | header x-admin-key | query.adminKey (hash dulu → timing-safe)
export function checkAdminKey(req, body) {
  const expected = (process.env.TOKOPEDIA_ADMIN_KEY || process.env.LAZADA_ADMIN_KEY || '').trim();
  if (!expected) {
    return { ok: false, code: 503, error: 'TOKOPEDIA_ADMIN_KEY (atau LAZADA_ADMIN_KEY) belum diatur di Vercel.' };
  }
  const given = String(
    (body && body.adminKey) || req.headers['x-admin-key'] || (req.query && req.query.adminKey) || '',
  ).trim();
  if (!given) return { ok: false, code: 401, error: 'adminKey wajib (body, header x-admin-key, atau query).' };
  const a = crypto.createHash('sha256').update(given).digest();
  const b = crypto.createHash('sha256').update(expected).digest();
  if (!crypto.timingSafeEqual(a, b)) return { ok: false, code: 401, error: 'adminKey salah.' };
  return { ok: true };
}

// state = "<ts>.<hmac>" — divalidasi callback/auth tanpa penyimpanan server (stateless).
const stateKey = () => String(process.env.TOKOPEDIA_APP_SECRET || '').trim();

export function makeState() {
  const ts = Date.now();
  const sig = crypto.createHmac('sha256', stateKey()).update(`tokopedia:${ts}`).digest('base64url');
  return `${ts}.${sig}`;
}

export function verifyState(state) {
  const raw = String(state || '');
  const dot = raw.indexOf('.');
  if (dot < 1) return false;
  const ts = Number(raw.slice(0, dot));
  if (!Number.isFinite(ts)) return false;
  if (Math.abs(Date.now() - ts) > 30 * 60 * 1000) return false; // jendela 30 menit
  const expect = crypto.createHmac('sha256', stateKey()).update(`tokopedia:${ts}`).digest('base64url');
  const a = crypto.createHash('sha256').update(raw.slice(dot + 1)).digest();
  const b = crypto.createHash('sha256').update(expect).digest();
  return crypto.timingSafeEqual(a, b);
}

function readBody(req) {
  if (req.body && typeof req.body === 'object') return req.body;
  return {};
}

// Tukar auth_code → access_token + refresh_token (grant_type WAJIB "authorized_code").
export async function exchangeAuthCode(code) {
  const env = process.env;
  const u = new URL(TOKEN_GET);
  u.searchParams.set('app_key', String(env.TOKOPEDIA_APP_KEY || '').trim());
  u.searchParams.set('app_secret', String(env.TOKOPEDIA_APP_SECRET || '').trim());
  u.searchParams.set('auth_code', String(code || ''));
  u.searchParams.set('grant_type', 'authorized_code');
  const r = await fetch(u, { headers: { accept: 'application/json' } });
  const j = await r.json().catch(() => null);
  if (!j || j.code !== 0) {
    throw new Error(`Gagal menukar auth_code: ${j ? `${j.code} ${j.message}` : `HTTP ${r.status}`}`);
  }
  return j.data;
}

// Perpanjang access_token memakai refresh_token dari env.
export async function refreshAccessToken() {
  const env = process.env;
  const u = new URL(TOKEN_REFRESH);
  u.searchParams.set('app_key', String(env.TOKOPEDIA_APP_KEY || '').trim());
  u.searchParams.set('app_secret', String(env.TOKOPEDIA_APP_SECRET || '').trim());
  u.searchParams.set('refresh_token', String(env.TOKOPEDIA_REFRESH_TOKEN || '').trim());
  u.searchParams.set('grant_type', 'refresh_token');
  const r = await fetch(u, { headers: { accept: 'application/json' } });
  const j = await r.json().catch(() => null);
  if (!j || j.code !== 0) {
    throw new Error(`Gagal refresh token: ${j ? `${j.code} ${j.message}` : `HTTP ${r.status}`}`);
  }
  return j.data;
}

// Halaman hasil untuk admin (token disalin ke env Vercel, lalu Redeploy).
export function renderTokensPage({ ok, title, data, note, error }) {
  const rows = [];
  if (data) {
    if (data.access_token) rows.push(['TOKOPEDIA_ACCESS_TOKEN', data.access_token]);
    if (data.refresh_token) rows.push(['TOKOPEDIA_REFRESH_TOKEN', data.refresh_token]);
    if (data.access_token_expire_in) {
      rows.push(['TOKOPEDIA_ACCESS_TOKEN_EXPIRE_IN', String(data.access_token_expire_in)]);
    }
  }
  const body = rows
    .map(
      ([label, value]) => `
      <div class="row">
        <div class="label">${escapeHtml(label)}</div>
        <textarea readonly rows="2" onclick="this.select()">${escapeHtml(value)}</textarea>
      </div>`,
    )
    .join('');
  const info = data
    ? `<ul>
        <li><b>Nama seller:</b> ${escapeHtml(data.seller_name || '-')}</li>
        <li><b>Berlaku s/d:</b> ${escapeHtml(data.access_token_expire_in ? new Date(Number(data.access_token_expire_in) * 1000).toLocaleString('id-ID') : '-')}</li>
        <li><b>Scope:</b> ${escapeHtml(Array.isArray(data.granted_scopes) ? data.granted_scopes.join(', ') : '-')}</li>
      </ul>`
    : '';
  return `<!doctype html><html lang="id"><head><meta charset="utf-8" />
<meta name="viewport" content="width=device-width,initial-scale=1" />
<meta name="robots" content="noindex,nofollow" />
<title>${escapeHtml(title)}</title>
<style>
  body{font-family:system-ui,-apple-system,Segoe UI,Roboto,sans-serif;background:#f6f7f9;margin:0;padding:28px;color:#111}
  .card{max-width:760px;margin:0 auto;background:#fff;border-radius:16px;padding:26px;box-shadow:0 10px 30px rgba(0,0,0,.08)}
  h1{font-size:20px;margin:0 0 6px}
  .ok{color:#0a7d33}.bad{color:#b00020}
  .row{margin:16px 0}
  .label{font-size:11px;font-weight:700;letter-spacing:.06em;text-transform:uppercase;color:#6b7280;margin-bottom:6px}
  textarea{width:100%;box-sizing:border-box;font-family:ui-monospace,Menlo,Consolas,monospace;font-size:12px;padding:10px;border:1px solid #dfe3e8;border-radius:10px;background:#fbfcfd;resize:vertical;word-break:break-all}
  .note{margin-top:18px;font-size:13px;line-height:1.7;background:#fff8e6;border:1px solid #f2d38b;border-radius:10px;padding:12px}
  ul{font-size:13px;line-height:1.8;padding-left:18px}
  .steps{font-size:13px;line-height:1.8;background:#eef4ff;border:1px solid #c7d7fe;border-radius:10px;padding:12px 12px 12px 30px}
  a{color:#1d4ed8}
</style></head><body><div class="card">
  <h1 class="${ok ? 'ok' : 'bad'}">${ok ? '✅' : '❌'} ${escapeHtml(title)}</h1>
  ${error ? `<p class="bad">${escapeHtml(error)}</p>` : ''}
  ${info}
  ${body}
  ${note ? `<div class="note">${note}</div>` : ''}
  <div class="steps"><b>Cara pakai:</b> salin nilai di atas → buka Vercel → Project <b>toko-fitness-surabaya</b> → Settings → Environment Variables → tempel (buat bila belum ada) → <b>Redeploy</b>.<br />
  Kembali ke panel: <a href="/">&gt;&gt; Toko Fitness Surabaya</a></div>
</div></body></html>`;
}

export { readBody };
