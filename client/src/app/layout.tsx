'use client';

import { ReactNode, useEffect, useState } from 'react';
import { Inter, Playfair_Display, Varela_Round } from 'next/font/google';
import { NextIntlClientProvider } from 'next-intl';
import { getLocaleDirection, defaultLocale, Locale, locales } from '@/i18n';
import { LocaleProvider } from '@/i18n/LocaleProvider';

// Import CSS
import '@/app/globals.css';

// Font configuration
const inter = Inter({ 
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
});

const playfair = Playfair_Display({ 
  subsets: ['latin'],
  variable: '--font-serif',
  display: 'swap',
});

// Varela Round font for both English and Hebrew
const varelaRound = Varela_Round({ 
  weight: '400',
  subsets: ['latin', 'hebrew'],
  variable: '--font-varela',
  display: 'swap',
});

export default function RootLayout({
  children,
}: {
  children: ReactNode;
}) {
  const [isClient, setIsClient] = useState(false);
  const [locale, setLocale] = useState<Locale>(defaultLocale);
  const [messages, setMessages] = useState<any>(null);

  useEffect(() => {
    setIsClient(true);
    
    // Get locale from localStorage
    const savedLocale = localStorage.getItem('locale') as Locale;
    const currentLocale = savedLocale && locales.includes(savedLocale) ? savedLocale : defaultLocale;
    setLocale(currentLocale);
    
    // Load messages for the locale
    import(`@/i18n/messages/${currentLocale}/common.json`)
      .then((module) => {
        setMessages(module.default);
      })
      .catch((error) => {
        console.error('Failed to load messages:', error);
      });
      
    // Add skip to main content functionality
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Tab' && !e.shiftKey) {
        const skipLink = document.getElementById('skip-to-content');
        if (skipLink && document.activeElement === skipLink) {
          skipLink.classList.remove('sr-only');
          skipLink.classList.add('skip-link');
        }
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  // Get direction based on locale
  const dir = getLocaleDirection(locale);

  if (!isClient || !messages) {
    return (
      <html lang={defaultLocale} dir="ltr">
        <body className={`${inter.variable} ${playfair.variable} ${varelaRound.variable} font-varela bg-gray-50`}>
          <div className="flex items-center justify-center min-h-screen">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
          </div>
        </body>
      </html>
    );
  }

  return (
    <html lang={locale} dir={dir} suppressHydrationWarning>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <meta name="description" content="Professional website of Ronny Iss-Carmel, Clinical Psychologist" />
      </head>
      <body className={`${inter.variable} ${playfair.variable} ${varelaRound.variable} font-varela bg-gray-50`}>
        <a id="skip-to-content" href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-primary-600 focus:text-white focus:rounded">
          Skip to main content
        </a>
        <NextIntlClientProvider locale={locale} messages={messages}>
          <LocaleProvider>
            {children}
          </LocaleProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}