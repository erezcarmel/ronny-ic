import { createSharedPathnamesNavigation } from 'next-intl/navigation';

// Define supported locales
export const locales = ['en', 'he'] as const;
export type Locale = (typeof locales)[number];

// Default locale
export const defaultLocale: Locale = 'en';

// Create shared pathnames navigation
export const { Link, redirect, usePathname, useRouter } = createSharedPathnamesNavigation({ locales });

// Get direction based on locale
export function getLocaleDirection(locale: Locale): 'ltr' | 'rtl' {
  return locale === 'he' ? 'rtl' : 'ltr';
}

// Get locale text direction class
export function getLocaleDirectionClass(locale: Locale): string {
  return locale === 'he' ? 'rtl text-right' : 'ltr text-left';
}

// Get locale font class
export function getLocaleFontClass(locale: Locale): string {
  return locale === 'he' ? 'font-hebrew' : 'font-sans';
}