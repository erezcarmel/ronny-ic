'use client';

import { useEffect, useState } from 'react';
import { useLocale } from '@/i18n/LocaleProvider';
import { getMessages } from '@/i18n/config';

export default function AdminDashboardPage() {
  const { locale } = useLocale();
  const [translations, setTranslations] = useState<any>(null);
  
  useEffect(() => {
    getMessages(locale).then(messages => {
      setTranslations(messages.admin.dashboard);
    });
  }, [locale]);
  
  if (!translations) {
    return <div>Loading...</div>;
  }
  
  return (
    <>
      <h1 className="text-2xl font-semibold text-gray-900 dark:text-white mb-6">
        {translations.title}
      </h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-gray-700 shadow rounded-lg p-6 border-l-4 border-blue-500">
          <h2 className="text-lg font-medium text-gray-900 dark:text-white">{translations.sections}</h2>
          <p className="mt-2 text-gray-600 dark:text-gray-300">Manage website sections</p>
        </div>
        
        <div className="bg-white dark:bg-gray-700 shadow rounded-lg p-6 border-l-4 border-green-500">
          <h2 className="text-lg font-medium text-gray-900 dark:text-white">{translations.articles}</h2>
          <p className="mt-2 text-gray-600 dark:text-gray-300">Manage articles and blog posts</p>
        </div>
        
        <div className="bg-white dark:bg-gray-700 shadow rounded-lg p-6 border-l-4 border-purple-500">
          <h2 className="text-lg font-medium text-gray-900 dark:text-white">{translations.contact}</h2>
          <p className="mt-2 text-gray-600 dark:text-gray-300">Update contact information</p>
        </div>
      </div>
    </>
  );
}