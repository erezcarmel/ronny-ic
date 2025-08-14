'use client';

import { useEffect, useState } from 'react';
import { Locale, locales } from '@/i18n';
import { cn } from '@/lib/utils';
import { useLocale } from '@/i18n/LocaleProvider';
import { getMessages } from '@/i18n/config';

export default function LanguageSwitcher() {
  const { locale, setLocale } = useLocale();
  const [translations, setTranslations] = useState<any>(null);
  
  useEffect(() => {
    getMessages(locale).then(messages => {
      setTranslations(messages.common);
    });
  }, [locale]);
  
  if (!translations) {
    return null;
  }
  
  return (
    <div className="flex items-center space-x-2 rtl:space-x-reverse">
      <div className="flex items-center space-x-1 rtl:space-x-reverse">
        {locales.map((loc) => (
          <button
            key={loc}
            onClick={() => setLocale(loc)}
            className={cn(
              'px-2 py-1 text-sm rounded-md transition-colors text-gray-600',
              locale === loc
                ? 'font-medium border border-[#B4C4F7]'
                : 'hover:text-[#B4C4F7]'
            )}
          >
            {loc === 'en' ? translations.english : translations.hebrew}
          </button>
        ))}
      </div>
    </div>
  );
}