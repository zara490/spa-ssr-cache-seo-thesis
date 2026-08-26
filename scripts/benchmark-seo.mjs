/**
 * اسکریپت ارزیابی آماری زمان پاسخ‌دهی (TTFB) و شبیه‌سازی خزشگرهای سئو
 * ویژه ارزیابی فصل ۴ پایان‌نامه کارشناسی ارشد
 */

const BASE_URL = 'http://localhost:3000';
const ITERATIONS = 30; // تعداد تکرار هر تست برای دقت آماری

const ROUTES = [
  { name: 'SSR بدون کش (No-Cache)', path: '/experiment/no-cache' },
  { name: 'SSR با کش سرور (Server-Cache)', path: '/experiment/server-cache' },
];

// شبیه‌سازی هدرهای ربات‌های موتور جستجو (Googlebot / SeobilityBot)
const SEO_HEADERS = {
  'User-Agent': 'Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)',
  'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
  'Accept-Encoding': 'gzip, deflate, br',
};

async function measureRequest(url) {
  const start = performance.now();
  const res = await fetch(url, { headers: SEO_HEADERS, cache: 'no-store' });
  const ttfb = performance.now() - start;
  await res.text(); // خواندن کامل بادی صفحه
  const totalTime = performance.now() - start;
  return { ttfb, totalTime, status: res.status };
}

function calculateStats(numbers) {
  const sum = numbers.reduce((a, b) => a + b, 0);
  const avg = sum / numbers.length;
  const min = Math.min(...numbers);
  const max = Math.max(...numbers);
  const sorted = [...numbers].sort((a, b) => a - b);
  const p95 = sorted[Math.floor(sorted.length * 0.95)];
  return { avg: avg.toFixed(2), min: min.toFixed(2), max: max.toFixed(2), p95: p95.toFixed(2) };
}

async function runBenchmark() {
  console.log('\n======================================================');
  console.log('🚀 آغاز ارزیابی آماری عملکرد SSR و تأثیر کشینگ بر سئو');
  console.log(`تعداد تکرار در هر حالت: ${ITERATIONS} درخواست متوالی`);
  console.log('User-Agent شبیه‌سازی‌شده: Googlebot / SEO Crawler');
  console.log('======================================================\n');

  const summary = [];

  for (const route of ROUTES) {
    const fullUrl = `${BASE_URL}${route.path}`;
    console.log(`⏳ در حال تست روت: ${route.name} ...`);

    // یک درخواست اولیه برای اطمینان از گرم شدن کش سرور (Warm-up)
    await measureRequest(fullUrl);

    const ttfbList = [];
    const totalTimeList = [];

    for (let i = 0; i < ITERATIONS; i++) {
      try {
        const { ttfb, totalTime } = await measureRequest(fullUrl);
        ttfbList.push(ttfb);
        totalTimeList.push(totalTime);
      } catch (err) {
        console.error(`خطا در درخواست ${i + 1}:`, err.message);
      }
    }

    const ttfbStats = calculateStats(ttfbList);
    const totalStats = calculateStats(totalTimeList);

    summary.push({
      'معماری رندر': route.name,
      'میانگین TTFB (ms)': Number(ttfbStats.avg),
      'کمترین TTFB (ms)': Number(ttfbStats.min),
      'بیشترین TTFB (ms)': Number(ttfbStats.max),
      'صدک ۹۵ام P95 (ms)': Number(ttfbStats.p95),
      'زمان کل پاسخ (ms)': Number(totalStats.avg),
    });
  }

  console.log('\n📊 جدول نتایج نهایی (مناسب برای مستندسازی در فصل ۴):');
  console.table(summary);

  // محاسبه درصد بهبود
  const noCacheTTFB = summary[0]['میانگین TTFB (ms)'];
  const cacheTTFB = summary[1]['میانگین TTFB (ms)'];
  const improvement = (((noCacheTTFB - cacheTTFB) / noCacheTTFB) * 100).toFixed(1);

  console.log('------------------------------------------------------');
  console.log(`✨ درصد بهبود زمان پاسخ‌دهی اولیه (TTFB): %${improvement} کاهش تأخیر`);
  console.log('======================================================\n');
}

runBenchmark();
