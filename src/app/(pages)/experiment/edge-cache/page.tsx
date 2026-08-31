import type { Metadata } from 'next';

export const revalidate = 60;

export const metadata: Metadata = {
  title: 'آزمایش C2: رندر با حافظه نهان CDN و لبه شبکه (Edge Cache)',
  description: 'تحلیل تحویل محتوا از لایه لبه شبکه (Edge/CDN) و بررسی تأثیر آن بر شاخص‌های حیاتی وب و بهینه‌سازی سئو.',
};

import { Vazirmatn } from 'next/font/google';
import { getCachedDatabaseData } from '@/lib/experiment-data';

const vazirmatn = Vazirmatn({ subsets: ['arabic'], display: 'swap' });

// حالت ۳: کش سرور + کش لبه (CDN)
// به‌جای force-dynamic از revalidate استفاده می‌شود تا پاسخ در شبکه توزیع محتوا نگهداری شود
export default async function EdgeCachePage() {
  const renderStartTime = Date.now();
  const data = await getCachedDatabaseData();
  const serverDuration = Date.now() - renderStartTime;

  return (
    <main dir="rtl" className={`${vazirmatn.className} min-h-screen bg-slate-50 px-4 py-16 text-slate-900 dark:bg-slate-950 dark:text-slate-100`}>
      <div className="mx-auto max-w-3xl">
        <div className="mb-8 text-center">
          <p className="mb-2 text-sm font-medium text-slate-500 dark:text-slate-400">آزمایش عملی پایان‌نامه</p>
          <h1 className="text-3xl font-black tracking-tight">مقایسهٔ عملکرد SSR</h1>
          <p className="mt-2 text-sm text-slate-500">ارزیابی تأثیر کش لبه بر زمان پاسخ‌دهی</p>
        </div>

        <div className="rounded-xl border border-sky-500/30 bg-white p-6 shadow-sm dark:bg-slate-900">
          <div className="mb-4 inline-block rounded-md bg-sky-100 px-3 py-1 text-xs font-semibold text-sky-700 dark:bg-sky-900/30 dark:text-sky-400">
            حالت ۳: کش سرور به‌همراه کش لبه (Server + CDN Cache)
          </div>

          <h2 className="mb-3 text-2xl font-bold">صفحهٔ آزمایش TTFB — کش لبه</h2>
          <p className="mb-6 text-sm text-slate-600 dark:text-slate-400">
            در این حالت پاسخ رندرشده در شبکهٔ توزیع محتوا نگهداری می‌شود و درخواست‌های بعدی
            بدون رسیدن به سرور اصلی، از نزدیک‌ترین نقطهٔ لبه پاسخ داده می‌شوند.
          </p>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 mb-6">
            <div className="rounded-lg border bg-slate-50 p-4 dark:bg-slate-800">
              <span className="text-xs text-slate-500">زمان رندر و واکشی:</span>
              <p className="text-xl font-bold">{serverDuration} ms</p>
            </div>
            <div className="rounded-lg border bg-slate-50 p-4 dark:bg-slate-800">
              <span className="text-xs text-slate-500">زمان تولید اولیهٔ داده:</span>
              <p className="text-xl font-bold">{data.generatedAt.slice(11, 19)}</p>
            </div>
          </div>

          <h3 className="font-semibold mb-3 text-sm">داده‌های رندرشده:</h3>
          <ul className="space-y-2">
            {data.items.map((item) => (
              <li key={item.id} className="flex justify-between rounded border border-slate-100 p-3 text-sm dark:border-slate-800">
                <span>{item.title}</span>
                <span className="font-mono text-sky-600 dark:text-sky-400">{item.score}%</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </main>
  );
}
