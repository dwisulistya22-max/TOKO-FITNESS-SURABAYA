// scripts/tokopedia-router-test.mjs — uji gating endpoint Phase 2 (offline-ish).
// Jalankan: node scripts/tokopedia-router-test.mjs
process.env.TOKOPEDIA_ADMIN_KEY = 'tf-tokofitness2026';
delete process.env.TOKOPEDIA_SYNC_ENABLED;
delete process.env.TOKOPEDIA_ACCESS_TOKEN;
delete process.env.TOKOPEDIA_REFRESH_TOKEN;

const { default: handler } = await import('../api/tokopedia/[action].js');

let pass = 0; let fail = 0;
const check = (name, cond, extra = '') => {
  if (cond) { pass++; console.log(`  ✅ ${name}`); }
  else { fail++; console.log(`  ❌ ${name}${extra ? ` — ${extra}` : ''}`); }
};

function mockRes() {
  return {
    statusCode: 0, headers: {}, body: undefined,
    setHeader(k, v) { this.headers[k] = v; },
    status(c) { this.statusCode = c; return this; },
    json(o) { this.body = o; return this; },
    send(o) { this.body = o; return this; },
    end() { return this; },
  };
}

async function call({ action, method = 'GET', query = {}, body = null, headers = {} }) {
  const req = { method, query: { action, ...query }, body, headers };
  const res = mockRes();
  await handler(req, res);
  return res;
}

const KEY = 'tf-tokofitness2026';

console.log('== Router gating test ==\n');

console.log('1) products (GET, tanpa adminKey — read-only):');
let r = await call({ action: 'products' });
check('bukan 401 (read-only)', r.statusCode !== 401, `status=${r.statusCode}`);
check('bukan 404 (action dikenal)', r.statusCode !== 404, JSON.stringify(r.body));
check('shape {ok, products}', r.body && typeof r.body.ok === 'boolean', JSON.stringify(r.body).slice(0, 120));

console.log('\n2) categories (GET, adminKey wajib):');
r = await call({ action: 'categories' });
check('tanpa adminKey → 401', r.statusCode === 401 && r.body.ok === false, `status=${r.statusCode}`);
r = await call({ action: 'categories', query: { adminKey: 'salah' } });
check('adminKey salah → 401', r.statusCode === 401);
r = await call({ action: 'categories', query: { adminKey: KEY } });
check('adminKey benar → lolos gate (bukan 401/404)', r.statusCode !== 401 && r.statusCode !== 404, `status=${r.statusCode} ${JSON.stringify(r.body).slice(0, 140)}`);

console.log('\n3) warehouses (GET, adminKey wajib):');
r = await call({ action: 'warehouses' });
check('tanpa adminKey → 401', r.statusCode === 401);
r = await call({ action: 'warehouses', query: { adminKey: KEY } });
check('adminKey benar → lolos gate', r.statusCode !== 401 && r.statusCode !== 404, `status=${r.statusCode}`);

console.log('\n4) dryrun (POST, adminKey wajib, TANPA lock sync):');
r = await call({ action: 'dryrun', method: 'POST', body: { id: 'x' } });
check('tanpa adminKey → 401', r.statusCode === 401);
r = await call({ action: 'dryrun', method: 'POST', body: { id: 'x', adminKey: KEY } });
check('adminKey benar → lolos gate (bukan 401/405)', r.statusCode !== 401 && r.statusCode !== 405, `status=${r.statusCode} ${JSON.stringify(r.body).slice(0, 140)}`);

// regresi: produk NYATA dari Sanity harus ditemukan (bug _id vs id pernah bikin 404 selalu)
try {
  const { fetchSanityProducts } = await import('../api/_lib/lazada.js');
  const sp = await fetchSanityProducts();
  const realId = (sp.products || []).find((p) => p.id)?.id || '';
  if (realId) {
    r = await call({ action: 'dryrun', method: 'POST', body: { id: realId, adminKey: KEY } });
    check('dryrun produk nyata → ok:true', r.statusCode === 200 && r.body.ok === true, `status=${r.statusCode} ${JSON.stringify(r.body).slice(0, 160)}`);
    check('dryrun tanpa kategori → wouldSync:false + previewError', r.body.wouldSync === false && Boolean(r.body.previewError), JSON.stringify(r.body).slice(0, 160));
  } else {
    check('dryrun produk nyata → ok:true', false, 'Sanity tidak mengembalikan produk');
  }
} catch (e) {
  check('dryrun produk nyata → ok:true', false, e.message);
}

console.log('\n5) sync (POST, adminKey + LOCK syncEnabled + confirm):');
r = await call({ action: 'sync', method: 'POST', body: { id: 'x', adminKey: KEY, confirm: true } });
check('flag mati → 409 (terkunci)', r.statusCode === 409 && /terkunci/i.test(r.body.error || ''), `status=${r.statusCode} ${r.body?.error}`);
r = await call({ action: 'sync', method: 'POST', body: { id: 'x' } });
check('tanpa adminKey → 401', r.statusCode === 401);

// nyalakan flag + token palsu agar lolos lock, lalu uji confirm
process.env.TOKOPEDIA_SYNC_ENABLED = 'true';
process.env.TOKOPEDIA_APP_KEY = 'k';
process.env.TOKOPEDIA_APP_SECRET = 's';
process.env.TOKOPEDIA_ACCESS_TOKEN = 't';
process.env.TOKOPEDIA_REFRESH_TOKEN = 'r';

r = await call({ action: 'sync', method: 'POST', body: { id: 'x', adminKey: KEY } });
check('flag on tanpa confirm → 400', r.statusCode === 400 && /confirm/i.test(r.body.error || ''), `status=${r.statusCode} ${r.body?.error}`);
r = await call({ action: 'sync', method: 'POST', body: { id: 'x', adminKey: KEY, confirm: true } });
check('confirm on tapi id tak ada → 404/502 (bukan 401/409)', r.statusCode === 404 || r.statusCode === 502, `status=${r.statusCode} ${JSON.stringify(r.body).slice(0, 160)}`);

console.log('\n6) inventory (POST, adminKey + LOCK + confirm):');
r = await call({ action: 'inventory', method: 'POST', body: { productId: 'p', skuId: 's', quantity: 1 } });
check('tanpa adminKey → 401', r.statusCode === 401);
r = await call({ action: 'inventory', method: 'POST', body: { productId: 'p', skuId: 's', quantity: 1, adminKey: KEY } });
check('flag on tanpa confirm → 400', r.statusCode === 400 && /confirm/i.test(r.body.error || ''), `status=${r.statusCode}`);
r = await call({ action: 'inventory', method: 'POST', body: { productId: 'p', skuId: 's', quantity: 1.5, adminKey: KEY, confirm: true } });
check('quantity non-bulat → 400', r.statusCode === 400 && /bulat/i.test(r.body.error || ''), `status=${r.statusCode} ${r.body?.error}`);

// kembalikan lock seperti semula
delete process.env.TOKOPEDIA_SYNC_ENABLED;
delete process.env.TOKOPEDIA_APP_KEY;
delete process.env.TOKOPEDIA_APP_SECRET;
delete process.env.TOKOPEDIA_ACCESS_TOKEN;
delete process.env.TOKOPEDIA_REFRESH_TOKEN;

console.log('\n7) aksi tak dikenal & method salah:');
r = await call({ action: 'nonsense' });
check('action tak dikenal → 404 + daftar', r.statusCode === 404 && /products, categories, warehouses, dryrun, sync, inventory/.test(r.body.error || ''), JSON.stringify(r.body));
r = await call({ action: 'sync', method: 'GET' });
check('sync GET → 405 (sebelum gate)', r.statusCode === 405, `status=${r.statusCode}`);
r = await call({ action: 'refresh', method: 'GET' });
check('refresh lama tetap ada', r.statusCode !== 404, `status=${r.statusCode}`);

console.log('\n8) callback: state hilang -> cookie cadangan + diagnosa:');
process.env.TOKOPEDIA_APP_KEY = 'k';
process.env.TOKOPEDIA_APP_SECRET = 's';
const { makeState } = await import('../api/_lib/tokopedia.js');

r = await call({ action: 'callback', query: { code: 'fake-code-1' } });
check('tanpa state -> 400 + penyebab "state tidak ada"',
  r.statusCode === 400 && /state tidak ada di URL/.test(String(r.body)),
  `status=${r.statusCode} ${String(r.body).slice(0, 180)}`);

const oldState = `${Math.floor(Date.now() / 1000) - 3600}.c2ln`;
r = await call({ action: 'callback', query: { code: 'fake-code-2', state: oldState } });
check('state tua -> 400 + penyebab "kedaluwarsa"',
  r.statusCode === 400 && /kedaluwarsa/.test(String(r.body)),
  `status=${r.statusCode} ${String(r.body).slice(0, 180)}`);

const fresh = makeState();
r = await call({
  action: 'callback',
  query: { code: 'fake-code-xyz' },
  headers: { cookie: `tts_state=${encodeURIComponent(fresh)}` },
});
check('cookie cadangan diterima (lolos state, gagal di penukaran code palsu)',
  !/State tidak valid/.test(String(r.body)),
  `status=${r.statusCode} ${String(r.body).slice(0, 180)}`);

console.log('\n9) auth-go: redirect + cookie (satu link untuk browser):');
process.env.TOKOPEDIA_APP_KEY = 'k';
process.env.TOKOPEDIA_APP_SECRET = 's';

r = await call({ action: 'auth-go', query: {} });
check('tanpa adminKey -> 401', r.statusCode === 401, `status=${r.statusCode}`);

r = await call({ action: 'auth-go', query: { adminKey: KEY } });
check('adminKey -> 302', r.statusCode === 302, `status=${r.statusCode}`);
check('ada Location authorize', String(r.headers.Location || '').includes('services.tiktokshop.com/open/authorize'), String(r.headers.Location));
check('ada state di Location', /state=\d+\./.test(String(r.headers.Location || '')));
check('tanam cookie tts_state', String(r.headers['Set-Cookie'] || '').includes('tts_state='), String(r.headers['Set-Cookie']));

console.log(`\n== Hasil: ${pass} lolos, ${fail} gagal ==`);
if (fail > 0) process.exit(1);
console.log('Router test HIJAU.');
