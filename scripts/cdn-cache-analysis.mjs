/**
 * تحلیل رفتار کش در لایه شبکه توزیع محتوا (CDN) و مقایسه با محیط محلی
 * ویژه فصل چهارم پایان‌نامه
 *
 * اجرا:  node scripts/cdn-cache-analysis.mjs
 */

import fs from 'node:fs';
import path from 'node:path';

// ─────────── تنظیمات: در صورت نیاز فقط این دو خط را عوض کنید ───────────
const PROD_URL  = 'https://spa-ssr-cache-seo-thesis.vercel.app';
const LOCAL_URL = 'http://localhost:3000';
// ───────────────────────────────────────────────────────────────────────

const ITERATIONS = 20;
const OUT_DIR = './cdn-results';

const ROUTES = [
  { key: 'no-cache',     name: 'SSR بدون کش',      path: '/experiment/no-cache' },
  { key: 'server-cache', name: 'SSR با کش سرور',   path: '/experiment/server-cache' },
  { key: 'edge-cache',   name: 'کش سرور + کش لبه', path: '/experiment/edge-cache' },
];

const SEO_HEADERS = {
  'User-Agent': 'Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)',
  'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
  'Accept-Encoding': 'gzip, deflate, br',
};

// ───────────────────────── توابع کمکی ─────────────────────────
const r2 = (n) => Math.round(n * 100) / 100;
const mean = (a) => (a.length ? a.reduce((x, y) => x + y, 0) / a.length : NaN);
const sd = (a) => {
  if (a.length < 2) return 0;
  const m = mean(a);
  return Math.sqrt(a.reduce((s, v) => s + (v - m) ** 2, 0) / (a.length - 1));
};
const median = (a) => {
  const s = [...a].sort((x, y) => x - y);
  const m = Math.floor(s.length / 2);
  return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2;
};
const pct = (a, p) => {
  const s = [...a].sort((x, y) => x - y);
  return s[Math.min(s.length - 1, Math.floor(s.length * p))];
};

/** متن قابل مشاهده برای خزنده را از HTML استخراج می‌کند (بدون اجرای جاوااسکریپت) */
function extractVisibleText(html) {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

async function measure(url) {
  const start = performance.now();
  let res;
  try {
    res = await fetch(url, { headers: SEO_HEADERS, cache: 'no-store', redirect: 'follow' });
  } catch (e) {
    return { error: e.message };
  }
  const ttfb = performance.now() - start;
  const html = await res.text();
  const total = performance.now() - start;

  const h = (n) => res.headers.get(n);
  return {
    status: res.status,
    ttfb,
    total,
    bytes: Buffer.byteLength(html, 'utf8'),
    textChars: extractVisibleText(html).length,
    hasH1: /<h1[\s>]/i.test(html),
    hasTitle: /<title[^>]*>[^<]{3,}<\/title>/i.test(html),
    vercelCache: h('x-vercel-cache') || '—',
    cacheControl: h('cache-control') || '—',
    age: h('age') || '—',
    etag: h('etag') ? 'دارد' : '—',
    server: h('server') || h('x-powered-by') || '—',
  };
}

async function profileRoute(baseUrl, route, env) {
  const url = `${baseUrl}${route.path}`;
  process.stdout.write(`  ${route.name.padEnd(20)} `);

  // اندازه‌گیری نخست: نماینده حالت کش سرد
  const cold = await measure(url);
  if (cold.error) {
    console.log(`دسترسی ممکن نشد (${cold.error})`);
    return null;
  }

  const samples = [];
  const cacheStates = [];
  for (let i = 0; i < ITERATIONS; i++) {
    const m = await measure(url);
    if (m.error) continue;
    samples.push(m);
    cacheStates.push(m.vercelCache);
  }
  if (!samples.length) { console.log('نمونه معتبری ثبت نشد'); return null; }

  const ttfbs = samples.map((s) => s.ttfb);
  const totals = samples.map((s) => s.total);
  const last = samples[samples.length - 1];

  const hits = cacheStates.filter((s) => /HIT/i.test(s)).length;
  const hitRatio = cacheStates.length ? (hits / cacheStates.length) * 100 : 0;

  console.log(
    `TTFB میانه ${String(r2(median(ttfbs))).padStart(8)} ms  |  ` +
    `کش لبه ${last.vercelCache.padEnd(6)}  |  نرخ HIT ${r2(hitRatio)}%`
  );

  return {
    'محیط': env,
    'مسیر': route.name,
    'TTFB کش سرد (ms)': r2(cold.ttfb),
    'TTFB میانه (ms)': r2(median(ttfbs)),
    'TTFB میانگین (ms)': r2(mean(ttfbs)),
    'انحراف معیار (ms)': r2(sd(ttfbs)),
    'کمینه (ms)': r2(Math.min(...ttfbs)),
    'بیشینه (ms)': r2(Math.max(...ttfbs)),
    'صدک ۹۵ (ms)': r2(pct(ttfbs, 0.95)),
    'زمان کل میانه (ms)': r2(median(totals)),
    'وضعیت کش لبه': last.vercelCache,
    'نرخ HIT (%)': r2(hitRatio),
    'Cache-Control': last.cacheControl,
    'Age': last.age,
    'حجم HTML (بایت)': last.bytes,
    'متن قابل خزش (کاراکتر)': last.textChars,
    'تگ H1': last.hasH1 ? 'دارد' : 'ندارد',
    'تگ Title': last.hasTitle ? 'دارد' : 'ندارد',
    'کد وضعیت': last.status,
  };
}

async function isUp(baseUrl) {
  try {
    const c = new AbortController();
    const t = setTimeout(() => c.abort(), 8000);
    const r = await fetch(baseUrl, { signal: c.signal, cache: 'no-store' });
    clearTimeout(t);
    return r.status < 500;
  } catch { return false; }
}

async function main() {
  fs.mkdirSync(OUT_DIR, { recursive: true });
  console.log('\n══════════════════════════════════════════════════════');
  console.log('تحلیل رفتار کش در لایه CDN و مقایسه محیط محلی با تولید');
  console.log(`تعداد تکرار در هر مسیر: ${ITERATIONS}`);
  console.log('══════════════════════════════════════════════════════\n');

  const rows = [];
  const envs = [
    { label: 'محلی (بدون CDN)', base: LOCAL_URL },
    { label: 'تولید (Vercel + CDN)', base: PROD_URL },
  ];

  for (const env of envs) {
    console.log(`▸ محیط: ${env.label}  —  ${env.base}`);
    if (!(await isUp(env.base))) {
      console.log('  در دسترس نیست؛ از این محیط صرف‌نظر شد.\n');
      continue;
    }
        // گرم‌کردن تابع بدون‌سرور تا هزینه راه‌اندازی سرد فقط به مسیر نخست تحمیل نشود
    for (const r of ROUTES) { try { await fetch(`${env.base}${r.path}`, { cache: 'no-store' }); } catch {} }
    await new Promise((s) => setTimeout(s, 2000));
    for (const route of ROUTES) {
      const row = await profileRoute(env.base, route, env.label);
      if (row) rows.push(row);
    }
    console.log('');
  }

  if (!rows.length) { console.log('هیچ داده‌ای ثبت نشد.'); return; }

  console.log('جدول نتایج (آماده درج در فصل چهارم):\n');
  console.table(
    rows.map((r) => ({
      'محیط': r['محیط'],
      'مسیر': r['مسیر'],
      'TTFB سرد': r['TTFB کش سرد (ms)'],
      'TTFB میانه': r['TTFB میانه (ms)'],
      'صدک ۹۵': r['صدک ۹۵ (ms)'],
      'کش لبه': r['وضعیت کش لبه'],
      'نرخ HIT %': r['نرخ HIT (%)'],
      'متن قابل خزش': r['متن قابل خزش (کاراکتر)'],
    }))
  );

  console.log('\nجزئیات هدرهای کش:\n');
  console.table(
    rows.map((r) => ({
      'محیط': r['محیط'],
      'مسیر': r['مسیر'],
      'Cache-Control': r['Cache-Control'],
      'Age': r['Age'],
      'حجم HTML': r['حجم HTML (بایت)'],
      'H1': r['تگ H1'],
      'Title': r['تگ Title'],
    }))
  );

  const headers = Object.keys(rows[0]);
  const csv = [headers.join(','), ...rows.map((r) =>
    headers.map((h) => `"${String(r[h]).replace(/"/g, '""')}"`).join(',')
  )].join('\n');
  fs.writeFileSync(path.join(OUT_DIR, 'cdn-cache-analysis.csv'), '\uFEFF' + csv, 'utf8');
  fs.writeFileSync(path.join(OUT_DIR, 'cdn-cache-analysis.json'), JSON.stringify(rows, null, 2), 'utf8');

  console.log(`\nخروجی ذخیره شد در: ${path.resolve(OUT_DIR)}`);
  console.log('  cdn-cache-analysis.csv   → قابل باز شدن در Excel');
  console.log('  cdn-cache-analysis.json  → داده خام\n');
}

main().catch((e) => { console.error('خطا:', e); process.exit(1); });
