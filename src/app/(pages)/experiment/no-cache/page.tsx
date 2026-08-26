import { Vazirmatn } from 'next/font/google';
import { getMockDatabaseData } from '@/lib/experiment-data';

const vazirmatn = Vazirmatn({ subsets: ['arabic'], display: 'swap' });

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function NoCachePage() {
  const renderStartTime = Date.now();
  const data = await getMockDatabaseData();
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
        <div className="rounded-xl border border-red-500/30 bg-white p-6 shadow-sm dark:bg-slate-900">
          <div className="mb-4 inline-block rounded-md bg-red-100 px-3 py-1 text-xs font-semibold text-red-700 dark:bg-red-900/30 dark:text-red-400">
            حالت ۱: SSR بدون کش (No-Cache)
          </div>
          
          <h2 className="mb-3 text-2xl font-bold">صفحهٔ آزمایش TTFB — بدون کش</h2>
          <p className="mb-6 text-sm text-slate-600 dark:text-slate-400">
            در این حالت، سرور در هر درخواست مجدداً عملیات واکشی را انجام می‌دهد و تأخیر دیتابیس را به طور کامل تجربه می‌کند.
          </p>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 mb-6">
            <div className="rounded-lg border bg-slate-50 p-4 dark:bg-slate-800">
              <span className="text-xs text-slate-500">زمان رندر سمت سرور:</span>
              <p className="text-xl font-bold">{serverDuration} ms</p>
            </div>
            <div className="rounded-lg border bg-slate-50 p-4 dark:bg-slate-800">
              <span className="text-xs text-slate-500">زمان تولید داده:</span>
              <p className="text-xl font-bold">{data.generatedAt.slice(11, 19)}</p>
            </div>
          </div>

          <h3 className="font-semibold mb-3 text-sm">داده‌های رندرشده:</h3>
          <ul className="space-y-2">
            {data.items.map((item) => (
              <li key={item.id} className="flex justify-between rounded border border-slate-100 p-3 text-sm dark:border-slate-800">
                <span>{item.title}</span>
                <span className="font-mono text-red-600 dark:text-red-400">{item.score}%</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </main>
  );
}
