import { unstable_cache } from 'next/cache'

// تابع شبیه‌سازی واکشی داده‌های سنگین از دیتابیس
export async function getMockDatabaseData() {
  const startTime = Date.now()
  
  // شبیه‌سازی تأخیر شبکه یا دیتابیس (۲۵۰ میلی‌ثانیه)
  await new Promise((resolve) => setTimeout(resolve, 250))
  
  const executionTime = Date.now() - startTime
  const timestamp = new Date().toISOString()
  
  return {
    items: [
      { id: 1, title: 'تحلیل عملکرد معماری تک‌صفحه‌ای (SPA)', score: 98 },
      { id: 2, title: 'بهینه‌سازی زمان تا اولین بایت (TTFB)', score: 94 },
      { id: 3, title: 'تأثیر حافظه نهان بر رندرینگ سمت سرور (SSR)', score: 99 },
    ],
    generatedAt: timestamp,
    executionTimeMs: executionTime,
  }
}

// همان تابع با لایه Server Cache (اعتبار ۱ ساعت)
export const getCachedDatabaseData = unstable_cache(
  async () => getMockDatabaseData(),
  ['experiment-server-cache-key'],
  {
    revalidate: 3600, // کش ۱ ساعته
    tags: ['experiment-cache'],
  }
)
