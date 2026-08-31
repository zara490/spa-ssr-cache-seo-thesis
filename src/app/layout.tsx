import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://spa-ssr-cache-seo-thesis-p3be.vercel.app'),
  title: {
    default: 'ارزیابی تأثیر حافظه نهان بر سئو در برنامه‌های تک‌صفحه‌ای (SSR)',
    template: '%s | ارزیابی کش در SSR',
  },
  description: 'پایان‌نامه کارشناسی ارشد: ارزیابی تجربی و بهبود پارامترهای سئوی فنی و زمان پاسخ در برنامه‌های تک‌صفحه‌ای با استفاده از حافظه نهان سرور و CDN.',
  keywords: ['سئو', 'رندرینگ سمت سرور', 'حافظه نهان', 'Next.js', 'SSR Cache', 'CDN Cache', 'سئوی فنی', 'TTFB'],
  authors: [{ name: 'زهرا علیدوستی' }],
  creator: 'زهرا علیدوستی',
  publisher: 'دانشگاه',
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    type: 'website',
    locale: 'fa_IR',
    url: '/',
    title: 'ارزیابی تأثیر حافظه نهان بر شاخص‌های سئو در SSR',
    description: 'پایان‌نامه ارزیابی بهبود سئو و کاهش تأخیر در رندرینگ سمت سرور با حافظه نهان چندلایه‌ای.',
    siteName: 'پایان‌نامه ارزیابی کش و سئو',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fa" dir="rtl">
      <body className="font-sans antialiased min-h-screen bg-slate-50 text-slate-900">
        {children}
      </body>
    </html>
  );
}
