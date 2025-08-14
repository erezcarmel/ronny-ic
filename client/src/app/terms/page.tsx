'use client';

import { useEffect, useState } from 'react';
import MainLayout from '@/components/layout/MainLayout';
import { useLocale } from '@/i18n/LocaleProvider';
import { getMessages } from '@/i18n/config';

export default function TermsPage() {
  const { locale } = useLocale();
  const [translations, setTranslations] = useState<any>(null);
  const [termsTranslations, setTermsTranslations] = useState<any>(null);
  const [isRtl, setIsRtl] = useState(false);
  
  useEffect(() => {
    const loadTranslations = async () => {
      const messages = await getMessages(locale);
      setTranslations(messages.common);
      
      try {
        // Load terms-specific translations
        const termsMessages = await import(`@/i18n/messages/${locale}/terms.json`);
        setTermsTranslations(termsMessages.default);
      } catch (error) {
        console.error('Error loading terms translations:', error);
        // Fall back to English if translations are not available
        const fallbackMessages = await import('@/i18n/messages/en/terms.json');
        setTermsTranslations(fallbackMessages.default);
      }
      
      setIsRtl(locale === 'he');
    };
    
    loadTranslations();
  }, [locale]);
  
  if (!translations || !termsTranslations) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }
  
  return (
    <MainLayout>
      <div className={`container-custom py-24 ${isRtl ? 'rtl text-right' : 'ltr text-left'}`}>
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-6">
          {termsTranslations.title}
        </h1>
        
        <div className="prose dark:prose-invert max-w-none">
          <p>
            {termsTranslations.intro}
          </p>
          
          <h2>{termsTranslations.agreementTitle}</h2>
          <p>
            {termsTranslations.agreementText}
          </p>
          
          <h2>{termsTranslations.intellectualPropertyTitle}</h2>
          <p>
            {termsTranslations.intellectualPropertyText}
          </p>
          
          <h2>{termsTranslations.userContentTitle}</h2>
          <p>
            {termsTranslations.userContentText}
          </p>
          
          <h2>{termsTranslations.linksTitle}</h2>
          <p>
            {termsTranslations.linksText}
          </p>
          
          <h2>{termsTranslations.terminationTitle}</h2>
          <p>
            {termsTranslations.terminationText}
          </p>
          
          <h2>{termsTranslations.indemnityTitle}</h2>
          <p>
            {termsTranslations.indemnityText}
          </p>
          
          <h2>{termsTranslations.disclaimerTitle}</h2>
          <p>
            {termsTranslations.disclaimerText}
          </p>
          
          <h2>{termsTranslations.limitationTitle}</h2>
          <p>
            {termsTranslations.limitationText}
          </p>
          
          <h2>{termsTranslations.governingLawTitle}</h2>
          <p>
            {termsTranslations.governingLawText}
          </p>
          
          <h2>{termsTranslations.changesTitle}</h2>
          <p>
            {termsTranslations.changesText}
          </p>
          
          <h2>{termsTranslations.contactTitle}</h2>
          <p>
            {termsTranslations.contactText}
          </p>
          
          <p>
            {termsTranslations.lastUpdated} {new Date().toLocaleDateString(locale === 'he' ? 'he-IL' : 'en-US')}.
          </p>
        </div>
      </div>
    </MainLayout>
  );
}
