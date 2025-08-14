'use client';

import { useEffect, useState } from 'react';
import { useLocale } from '@/i18n/LocaleProvider';
import { getMessages } from '@/i18n/config';
import apiService from '@/lib/utils/api';

interface ContactInfoData {
  id?: string;
  language: string;
  phone: string;
  email: string;
  whatsapp: string;
  address: string;
  mapUrl?: string;
}

export default function ContactPage() {
  const { locale } = useLocale();
  const [contactTranslations, setContactTranslations] = useState<any>(null);
  const [adminTranslations, setAdminTranslations] = useState<any>(null);
  const [commonTranslations, setCommonTranslations] = useState<any>(null);
  
  // Contact info state
  const [contactInfo, setContactInfo] = useState<ContactInfoData>({
    language: locale,
    phone: '',
    email: '',
    whatsapp: '',
    address: '',
    mapUrl: ''
  });
  
  // Form state
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  
  // Load translations and contact data
  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        
        // Load translations
        const messages = await getMessages(locale);
        setContactTranslations(messages.contact);
        setAdminTranslations(messages.admin.dashboard);
        setCommonTranslations(messages.common);
        
        // Load contact info
        const data = await apiService.contact.getInfo(locale);
        if (data) {
          setContactInfo({
            id: data.id,
            language: data.language || locale,
            phone: data.phone || '',
            email: data.email || '',
            whatsapp: data.whatsapp || '',
            address: data.address || '',
            mapUrl: data.mapUrl || ''
          });
        }
      } catch (error) {
        console.error('Error loading contact info:', error);
        // If contact info doesn't exist yet, we'll create it when saving
      } finally {
        setIsLoading(false);
      }
    };
    
    loadData();
  }, [locale]);
  
  // Handle form input changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setContactInfo(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setIsSaving(true);
      setSaveStatus('idle');
      setErrorMessage('');
      
      // Update contact info via API
      await apiService.contact.updateInfo({
        ...contactInfo,
        language: locale
      });
      
      setSaveStatus('success');
    } catch (error) {
      console.error('Error saving contact info:', error);
      setSaveStatus('error');
      setErrorMessage(error instanceof Error ? error.message : 'Failed to save contact information');
    } finally {
      setIsSaving(false);
      
      // Reset success status after 3 seconds
      if (saveStatus === 'success') {
        setTimeout(() => {
          setSaveStatus('idle');
        }, 3000);
      }
    }
  };
  
  if (!contactTranslations || !adminTranslations || !commonTranslations) {
    return <div className="flex justify-center items-center h-64">Loading...</div>;
  }
  
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-pulse text-xl text-gray-500">
          {commonTranslations.loading}
        </div>
      </div>
    );
  }
  
  return (
    <>
      <h1 className="text-2xl font-semibold text-gray-900 dark:text-white mb-6">
        {adminTranslations.contact}
      </h1>
      
      <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
        <form className="space-y-6" onSubmit={handleSubmit}>
          <div>
            <label htmlFor="phone" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              {contactTranslations.phone}
            </label>
            <input
              type="tel"
              id="phone"
              name="phone"
              value={contactInfo.phone}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            />
          </div>
          
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              {contactTranslations.email}
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={contactInfo.email}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            />
          </div>
          
          <div>
            <label htmlFor="whatsapp" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              {contactTranslations.whatsapp}
            </label>
            <input
              type="tel"
              id="whatsapp"
              name="whatsapp"
              value={contactInfo.whatsapp}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            />
          </div>
          
          <div>
            <label htmlFor="address" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              {contactTranslations.address}
            </label>
            <textarea
              id="address"
              name="address"
              rows={3}
              value={contactInfo.address}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            />
          </div>
          
          <div>
            <label htmlFor="mapUrl" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Google Maps URL
            </label>
            <input
              type="url"
              id="mapUrl"
              name="mapUrl"
              value={contactInfo.mapUrl || ''}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              placeholder="https://maps.google.com/..."
            />
          </div>
          
          {saveStatus === 'success' && (
            <div className="bg-green-50 dark:bg-green-900 border border-green-400 text-green-700 dark:text-green-300 px-4 py-3 rounded relative" role="alert">
              <span className="block sm:inline">{commonTranslations.save} {commonTranslations.success || 'successful'}!</span>
            </div>
          )}
          
          {saveStatus === 'error' && (
            <div className="bg-red-50 dark:bg-red-900 border border-red-400 text-red-700 dark:text-red-300 px-4 py-3 rounded relative" role="alert">
              <span className="block sm:inline">{errorMessage || commonTranslations.error}</span>
            </div>
          )}
          
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={isSaving}
              className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50"
            >
              {isSaving ? commonTranslations.saving || 'Saving...' : commonTranslations.save || 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </>
  );
}