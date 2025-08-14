'use client';

import { useEffect, useState } from 'react';
import MainLayout from '@/components/layout/MainLayout';
import { useLocale } from '@/i18n/LocaleProvider';
import { getMessages } from '@/i18n/config';

export default function PrivacyPage() {
  const { locale } = useLocale();
  const [translations, setTranslations] = useState<any>(null);
  const [isRtl, setIsRtl] = useState(false);
  
  const [privacyTranslations, setPrivacyTranslations] = useState<any>(null);
  
  useEffect(() => {
    const loadTranslations = async () => {
      const messages = await getMessages(locale);
      setTranslations(messages.common);
      
      try {
        // Load privacy-specific translations
        const privacyMessages = await import(`@/i18n/messages/${locale}/privacy.json`);
        setPrivacyTranslations(privacyMessages.default);
      } catch (error) {
        console.error('Error loading privacy translations:', error);
        // Fall back to English if translations are not available
        const fallbackMessages = await import('@/i18n/messages/en/privacy.json');
        setPrivacyTranslations(fallbackMessages.default);
      }
      
      setIsRtl(locale === 'he');
    };
    
    loadTranslations();
  }, [locale]);
  
  if (!translations || !privacyTranslations) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }
  
  return (
    <MainLayout>
      <div className={`container-custom py-24 ${isRtl ? 'rtl text-right' : 'ltr text-left'}`}>
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-6">
          {privacyTranslations.title}
        </h1>
        
        <div className="prose dark:prose-invert max-w-none">
          <p>
            {privacyTranslations.intro}
          </p>
          
          <h2>{privacyTranslations.personalInfoTitle}</h2>
          <p>
            {privacyTranslations.personalInfoText}
          </p>
          
          <h3>{privacyTranslations.collectMethodsTitle}</h3>
          <ul>
            <li>{privacyTranslations.cookiesText}</li>
            <li>{privacyTranslations.logFilesText}</li>
            <li>{privacyTranslations.webBeaconsText}</li>
          </ul>
          
          <p>
            {privacyTranslations.contactInfoText}
          </p>
          
          <p>
            {privacyTranslations.personalInfoDefText}
          </p>
          
          <h2>{privacyTranslations.howWeUseTitle}</h2>
          <p>
            {privacyTranslations.howWeUseText}
          </p>
          <ul>
            <li>{privacyTranslations.communicateText}</li>
            <li>{privacyTranslations.provideInfoText}</li>
            <li>{privacyTranslations.processRequestsText}</li>
          </ul>
          
          <p>
            {privacyTranslations.deviceInfoUseText}
          </p>
          
          <h2>{privacyTranslations.sharingTitle}</h2>
          <p>
            {privacyTranslations.sharingText}
          </p>
          
          <p>
            {privacyTranslations.legalSharingText}
          </p>
          
          <h2>{privacyTranslations.doNotTrackTitle}</h2>
          <p>
            {privacyTranslations.doNotTrackText}
          </p>
          
          <h2>{privacyTranslations.yourRightsTitle}</h2>
          <p>
            {privacyTranslations.europeanRightsText}
          </p>
          
          <p>
            {privacyTranslations.dataTransferText}
          </p>
          
          <h2>{privacyTranslations.dataRetentionTitle}</h2>
          <p>
            {privacyTranslations.dataRetentionText}
          </p>
          
          <h2>{privacyTranslations.changesTitle}</h2>
          <p>
            {privacyTranslations.changesText}
          </p>
          
          <h2>{privacyTranslations.contactUsTitle}</h2>
          <p>
            {privacyTranslations.contactUsText}
          </p>
          
          <p>
            {privacyTranslations.lastUpdated} {new Date().toLocaleDateString(locale === 'he' ? 'he-IL' : 'en-US')}.
          </p>
        </div>
      </div>
    </MainLayout>
  );
}
