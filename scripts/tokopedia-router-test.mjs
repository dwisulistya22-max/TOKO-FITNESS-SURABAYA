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

console.log(`\n== Hasil: ${pass} lolos, ${fail} gagal ==`);
if (fail > 0) process.exit(1);
console.log('Router test HIJAU.');
