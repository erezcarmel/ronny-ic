'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import LanguageSwitcher from './LanguageSwitcher';
import { useLocale } from '@/i18n/LocaleProvider';
import { getMessages } from '@/i18n/config';
import { isSectionVisible } from '@/i18n/config/sections';

export default function Header() {
  const { locale } = useLocale();
  const [translations, setTranslations] = useState<any>(null);
  const pathname = usePathname();
  
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  useEffect(() => {
    getMessages(locale).then(messages => {
      setTranslations(messages.navigation);
    });
    
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [locale]);
  
  if (!translations) {
    return null;
  }
  
  // Navigation items - conditionally include articles based on locale
  const navItems = [
    { href: '/#about', label: translations.about },
    ...(isSectionVisible('articles', locale) ? [{ href: '/#articles', label: translations.articles }] : []),
    { href: '/#contact', label: translations.contact },
  ];

  return (
    <header
      className={cn(
        'fixed top-0 w-full z-50 transition-all duration-300',
        isScrolled
          ? 'bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm shadow-md py-2'
          : 'bg-transparent py-4'
      )}
      role="banner"
    >
      <div className="container-custom">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center">
            <Image 
              src="/images/logo.png" 
              alt="Ronny Iss-Carmel Logo" 
              width={50} 
              height={50} 
              className="mr-3"
            />
            <div className="flex flex-col gap-0">
              <span className="font-varela text-xl md:text-2xl font-bold text-gray-600">
                {translations.title}
              </span>
              <span className="font-varela md:text-sm font-bold text-gray-600 hidden sm:block">
                {translations.subtitle}
              </span>
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav className="flex items-center gap-4" aria-label="Main Navigation">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'hidden sm:block text-gray-600 hover:text-[#555599] transition-colors',
                  pathname === item.href && 'text-primary-800 font-medium'
                )}
                aria-current={pathname === item.href ? 'page' : undefined}
              >
                {item.label}
              </Link>
            ))}
            
            {/* Language Switcher */}
            <LanguageSwitcher />
          </nav>

          {/* Mobile Menu Button */}
          <button
            type="button"
            className="md:hidden text-gray-600 hover:text-primary-800"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-expanded={isMobileMenuOpen}
            aria-controls="mobile-menu"
            aria-label={isMobileMenuOpen ? "Close menu" : "Open menu"}
          >
            {isMobileMenuOpen ? (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <nav id="mobile-menu" className="md:hidden mt-4 pb-4" aria-label="Mobile Navigation">
            {navItems.map((item) => (
              <div key={item.href} className="block">
                <Link
                  href={item.href}
                  className={cn(
                    'block py-2 text-gray-600 hover:text-[#B4C4F7] transition-colors',
                    pathname === item.href && 'text-primary-800 font-medium'
                  )}
                  onClick={() => setIsMobileMenuOpen(false)}
                  aria-current={pathname === item.href ? 'page' : undefined}
                >
                  {item.label}
                </Link>
              </div>
            ))}
            
            {/* Language Switcher */}
            <div className="py-2">
              <LanguageSwitcher />
            </div>
          </nav>
        )}
      </div>
    </header>
  );
}