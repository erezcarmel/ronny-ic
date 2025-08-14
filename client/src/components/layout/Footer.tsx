'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useLocale } from '@/i18n/LocaleProvider';
import { getMessages } from '@/i18n/config';

export default function Footer() {
  const { locale } = useLocale();
  const [translations, setTranslations] = useState<any>(null);
  
  useEffect(() => {
    getMessages(locale).then(messages => {
      setTranslations(messages.common);
    });
  }, [locale]);
  
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };
  
  if (!translations) {
    return null;
  }
  
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="bg-gray-900 text-white py-8" role="contentinfo">
      <div className="container-custom">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="mb-4 md:mb-0">
            <p className="text-gray-300">
              &copy; {currentYear} {translations.title}. {translations.rights}
            </p>
          </div>
          
          <div className="flex gap-4">
            <Link href="/privacy" className="text-gray-300 hover:text-white transition-colors" aria-label="Privacy Policy">
              {translations.privacy}
            </Link>
            <Link href="/terms" className="text-gray-300 hover:text-white transition-colors" aria-label="Terms of Service">
              {translations.terms}
            </Link>
            <Link href="/accessibility" className="text-gray-300 hover:text-white transition-colors" aria-label="Accessibility Statement">
              {translations.accessibility}
            </Link>
          </div>
          
          <button
            onClick={scrollToTop}
            className="mt-4 md:mt-0 bg-gray-800 hover:bg-gray-700 text-white p-2 rounded-full transition-colors"
            aria-label={translations.backToTop}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
              <path fillRule="evenodd" d="M14.707 12.707a1 1 0 01-1.414 0L10 9.414l-3.293 3.293a1 1 0 01-1.414-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 010 1.414z" clipRule="evenodd" />
            </svg>
          </button>
        </div>
      </div>
    </footer>
  );
}