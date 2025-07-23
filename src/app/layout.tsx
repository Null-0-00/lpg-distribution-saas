import type { Metadata, Viewport } from 'next';
import './globals.css';
import { APP_CONFIG } from '@/lib/utils/constants';
import { SessionProvider } from '@/components/providers/SessionProvider';
import { ThemeProvider } from '@/providers/ThemeProvider';
import { SettingsProvider } from '@/contexts/SettingsContext';

export const metadata: Metadata = {
  title: {
    default: APP_CONFIG.name,
    template: `%s | ${APP_CONFIG.name}`,
  },
  description: APP_CONFIG.description,
  keywords: ['LPG', 'distributor', 'management', 'SaaS', 'inventory', 'sales'],
  authors: [{ name: 'LPG Distributor SaaS Team' }],
  creator: 'LPG Distributor SaaS',
  publisher: 'LPG Distributor SaaS',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL(APP_CONFIG.url),
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: APP_CONFIG.name,
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: APP_CONFIG.url,
    title: APP_CONFIG.name,
    description: APP_CONFIG.description,
    siteName: APP_CONFIG.name,
  },
  robots: {
    index: false,
    follow: false,
    googleBot: {
      index: false,
      follow: false,
    },
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: '#0ea5e9',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="LPG Distributor" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="msapplication-TileColor" content="#0ea5e9" />
        <meta name="msapplication-tap-highlight" content="no" />
        <link rel="apple-touch-icon" href="/images/icons/icon-192x192.png" />
        <link
          rel="icon"
          type="image/png"
          sizes="32x32"
          href="/images/icons/icon-32x32.png"
        />
        <link
          rel="icon"
          type="image/png"
          sizes="16x16"
          href="/images/icons/icon-16x16.png"
        />
        <link
          rel="mask-icon"
          href="/images/icons/safari-pinned-tab.svg"
          color="#0ea5e9"
        />
      </head>
      <body
        className={`font-sans antialiased`}
        suppressHydrationWarning
        data-suppress-hydration-warning
      >
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var theme = localStorage.getItem('theme') || 'system';
                  var systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
                  var effectiveTheme = theme === 'system' ? systemTheme : theme;
                  
                  document.documentElement.classList.remove('light', 'dark');
                  document.documentElement.classList.add(effectiveTheme);
                  document.documentElement.style.colorScheme = effectiveTheme;
                } catch (e) {
                  console.warn('Theme initialization failed:', e);
                }
              })();
            `,
          }}
        />
        <SessionProvider>
          <SettingsProvider>
            <ThemeProvider>{children}</ThemeProvider>
          </SettingsProvider>
        </SessionProvider>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator) {
                window.addEventListener('load', function() {
                  navigator.serviceWorker.register('/sw.js')
                    .then(function(registration) {
                      console.log('SW registered: ', registration);
                    })
                    .catch(function(registrationError) {
                      console.log('SW registration failed: ', registrationError);
                    });
                });
              }
            `,
          }}
        />
      </body>
    </html>
  );
}
