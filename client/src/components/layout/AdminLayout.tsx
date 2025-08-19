'use client';

import { ReactNode, useEffect, useState } from 'react';
import Link from 'next/link';
import { useLocale } from '@/i18n/LocaleProvider';
import { getMessages } from '@/i18n/config';
import LanguageSwitcher from './LanguageSwitcher';

interface AdminLayoutProps {
  children: ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const { locale } = useLocale();
  const [dashboardTranslations, setDashboardTranslations] = useState<any>(null);
  const [commonTranslations, setCommonTranslations] = useState<any>(null);
  
  useEffect(() => {
    getMessages(locale).then(messages => {
      setDashboardTranslations(messages.admin.dashboard);
      setCommonTranslations(messages.common);
    });
  }, [locale]);
  
  if (!dashboardTranslations || !commonTranslations) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }
  
  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
      {/* Admin Header */}
      <header className="bg-white dark:bg-gray-800 shadow">
        <div className="container-custom py-4 flex items-center justify-between">
          <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
            {dashboardTranslations.title}
          </h1>
          
          <div className="flex gap-4 items-center">
            <LanguageSwitcher />
            
            <Link 
              href="/"
              className="text-gray-600 dark:text-gray-300 hover:text-primary-800 dark:hover:text-primary-400"
            >
              {commonTranslations.back}
            </Link>
            
            <button 
              className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
              onClick={() => {
                // Handle logout
                if (typeof window !== 'undefined') {
                  localStorage.removeItem('accessToken');
                  localStorage.removeItem('refreshToken');
                  localStorage.removeItem('user');
                  window.location.href = `/admin/login`;
                }
              }}
            >
              {dashboardTranslations.logout}
            </button>
          </div>
        </div>
      </header>
      
      {/* Admin Content */}
      <div className="max-w-fit mx-auto py-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {/* Sidebar */}
          <aside className="md:col-span-1">
            <nav className="bg-white dark:bg-gray-800 shadow rounded-lg p-4">
              <ul className="space-y-2">
                <li>
                  <Link 
                    href="/admin"
                    className="block px-4 py-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700"
                  >
                    {dashboardTranslations.dashboard}
                  </Link>
                </li>
                <li>
                  <Link 
                    href="/admin/sections"
                    className="block px-4 py-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700"
                  >
                    {dashboardTranslations.sections}
                  </Link>
                </li>
                <li>
                  <Link 
                    href="/admin/articles"
                    className="block px-4 py-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700"
                  >
                    {dashboardTranslations.articles}
                  </Link>
                </li>
                <li>
                  <Link 
                    href="/admin/contact"
                    className="block px-4 py-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700"
                  >
                    {dashboardTranslations.contact}
                  </Link>
                </li>
              </ul>
            </nav>
          </aside>
          
          {/* Main Content */}
          <main className="md:col-span-3 bg-white dark:bg-gray-800 shadow rounded-lg p-6">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}