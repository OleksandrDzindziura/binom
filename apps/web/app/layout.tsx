import type { Metadata } from 'next';
import Script from 'next/script';
import { Montserrat, Archivo } from 'next/font/google';
import { QueryProvider } from '@/providers/query-provider';
import { I18nProvider } from '@/providers/i18n-provider';
import { TooltipProvider } from '@/components/ui/tooltip';
import { Toaster } from 'sonner';
import './globals.css';

const fontSans = Montserrat({
  subsets: ['latin', 'cyrillic'],
  variable: '--font-sans',
});

const fontDisplay = Archivo({
  subsets: ['latin'],
  variable: '--font-mono',
});

export const metadata: Metadata = {
  metadataBase: new URL('https://binom-mebli.com'),

  title: {
    default: 'Binom Mebli — Кухні та меблі на замовлення',
    template: '%s — Binom Mebli',
  },

  description:
    'Binom Mebli — виготовлення та встановлення кухонь, шаф та меблів на замовлення.',

  manifest: '/site.webmanifest',

  themeColor: '#ffffff',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Binom Mebli',
  },

  icons: {
    icon: [
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
    ],
    apple: '/apple-touch-icon.png',
  },

  openGraph: {
    siteName: 'Binom Mebli',
    locale: 'uk_UA',
    type: 'website',
  },

  twitter: {
    card: 'summary_large_image',
  },
};

const gaId = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;

const organizationJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'Binom Mebli',
  url: 'https://binom-mebli.com',
};

const websiteJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: 'Binom Mebli',
  url: 'https://binom-mebli.com',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="uk" suppressHydrationWarning>
      <body
        className={`${fontSans.variable} ${fontDisplay.variable} antialiased`}
        suppressHydrationWarning
      >
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd) }}
        />
        <I18nProvider>
          <QueryProvider>
            <TooltipProvider>{children}</TooltipProvider>
          </QueryProvider>
        </I18nProvider>
        <Toaster richColors position="top-right" />
        {gaId && (
          <>
            <Script
              src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`}
              strategy="afterInteractive"
            />
            <Script id="ga4-init" strategy="afterInteractive">
              {`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','${gaId}');`}
            </Script>
          </>
        )}
      </body>
    </html>
  );
}
