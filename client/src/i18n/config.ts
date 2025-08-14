import { createSharedPathnamesNavigation } from 'next-intl/navigation';
import { locales, defaultLocale } from './index';

export const { Link, redirect, usePathname, useRouter } = createSharedPathnamesNavigation({
  locales,
  defaultLocale
});

export function getMessages(locale: string) {
  return import(`./messages/${locale}/common.json`).then(module => module.default);
}