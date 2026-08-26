import { Vazirmatn } from 'next/font/google';
import { getCachedDatabaseData } from '@/lib/experiment-data';

const vazirmatn = Vazirmatn({ subsets: ['arabic'], display: 'swap' });

export const dynamic = 'force-dynamic';

export default async function ServerCachePage() {
  const renderStartTime = Date.now();
  const data = await getCachedDatabaseData();
  const serverDuration = Date.now() - renderStartTime;

  return (
    <main dir="rtl" className={`${vazirmatn.className} min-h-screen bg-slate-50 px-4 py-16 text-slate-900 dark:bg-slate-950 dark:text-slate-100`}>
      <div className="mx-auto max-w-3xl">
        {/* هدر صفحه */}
        <div className="mb-8 text-center">
          <p className="mb-2 text-sm font-medium text-slate-500 dark:text-slate-400">آزمایش عملی پایان‌نامه</p>
          <h1 className="text-3xl font-black tracking-tight">مقایسهٔ عملکرد SSR</h1>
          <p className="mt-2 text-sm text-slate-500">ارزیابی تأثیر حافظهٔ نهان سرور بر زمان پاسخ‌دهی</p>
        </div>

        {/* کارت محتوا */}
        <div className="rounded-xl border border-emerald-500/30 bg-white p-6 shadow-sm dark:bg-slate-900">
          <div className="mb-4 inline-block rounded-md bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400">
            حالت ۲: SSR با حافظهٔ نهان سرور (Cached)
          </div>
          
          <h2 className="mb-3 text-2xl font-bold">صفحهٔ آزمایش TTFB — با کش</h2>
          <p className="mb-6 text-sm text-slate-600 dark:text-slate-400">
            در این حالت، داده‌ها از حافظهٔ نهان سرور خوانده می‌شوند. پس از اولین اجرا، زمان پاسخ‌دهی باید به طور قابل توجهی کاهش یابد.
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
                <span className="font-mono text-emerald-600 dark:text-emerald-400">{item.score}%</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </main>
  );
}
