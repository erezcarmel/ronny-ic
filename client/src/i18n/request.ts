import { getRequestConfig } from 'next-intl/server';
import { locales } from './index';

export default getRequestConfig(async ({ locale }) => {
  // Validate that the incoming locale is supported
  if (!locales.includes(locale as any)) {
    throw new Error(`Locale '${locale}' is not supported`);
  }

  return {
    messages: (await import(`./messages/${locale}/common.json`)).default,
  };
});