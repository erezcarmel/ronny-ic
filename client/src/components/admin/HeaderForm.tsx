'use client';

import { useState, useEffect } from 'react';
import { useLocale } from '@/i18n/LocaleProvider';
import { getMessages } from '@/i18n/config';

interface HeaderFormProps {
  initialData?: any;
  onSubmit: (data: any) => void;
  onCancel: () => void;
}

export default function HeaderForm({ initialData, onSubmit, onCancel }: HeaderFormProps) {
  const { locale } = useLocale();
  const [translations, setTranslations] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  
  // Form state
  const [titleEn, setTitleEn] = useState('');
  const [titleHe, setTitleHe] = useState('');
  const [subtitleEn, setSubtitleEn] = useState('');
  const [subtitleHe, setSubtitleHe] = useState('');
  const [published, setPublished] = useState(true);
  const [logoImage, setLogoImage] = useState('');
  
  useEffect(() => {
    getMessages(locale).then(messages => {
      setTranslations(messages.admin.sections);
    });
    
    // Initialize form with existing data if provided
    if (initialData) {
      setPublished(initialData.isPublished);
      
      // Find English content
      const enContent = initialData.contents?.find((c: any) => c.language === 'en');
      if (enContent) {
        setTitleEn(enContent.title || '');
        setSubtitleEn(enContent.subtitle || '');
        if (enContent.imageUrl) {
          setLogoImage(enContent.imageUrl);
        }
      }
      
      // Find Hebrew content
      const heContent = initialData.contents?.find((c: any) => c.language === 'he');
      if (heContent) {
        setTitleHe(heContent.title || '');
        setSubtitleHe(heContent.subtitle || '');
      }
    }
  }, [initialData, locale]);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      // Prepare form data
      const formData = {
        published,
        contents: [
          {
            language: 'en',
            title: titleEn,
            subtitle: subtitleEn,
            imageUrl: logoImage,
          },
          {
            language: 'he',
            title: titleHe,
            subtitle: subtitleHe,
            imageUrl: logoImage,
          }
        ],
      };
      
      // Call parent's onSubmit
      await onSubmit(formData);
    } catch (error) {
      console.error('Error submitting header form:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  if (!translations) {
    return <div>Loading...</div>;
  }
  
  return (
    <div className="p-6">
      <h2 className="text-2xl font-semibold mb-6">
        {initialData ? 'Edit Header' : 'Add Header'}
      </h2>
      
      <form onSubmit={handleSubmit}>
        {/* Published status */}
        <div className="mb-6">
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={published}
              onChange={(e) => setPublished(e.target.checked)}
              className="form-checkbox h-5 w-5 text-blue-600"
            />
            <span className="ml-2 text-gray-700 dark:text-gray-300">Published</span>
          </label>
        </div>
        
        {/* Logo image */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Logo Image URL
          </label>
          
          <input
            type="text"
            value={logoImage}
            onChange={(e) => setLogoImage(e.target.value)}
            placeholder="Enter logo image URL"
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:border-gray-600 dark:text-white"
          />
          
          {logoImage && (
            <div className="mt-4">
              <img 
                src={logoImage} 
                alt="Logo preview" 
                className="h-20 object-contain rounded-md"
              />
            </div>
          )}
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          {/* English content */}
          <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
            <h3 className="font-medium mb-4">English Content</h3>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Title
              </label>
              <input
                type="text"
                value={titleEn}
                onChange={(e) => setTitleEn(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:border-gray-600 dark:text-white"
                placeholder="Ronny Iss-Carmel"
              />
            </div>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Subtitle
              </label>
              <input
                type="text"
                value={subtitleEn}
                onChange={(e) => setSubtitleEn(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:border-gray-600 dark:text-white"
                placeholder="Thoughts and Feelings Psychotherapy"
              />
            </div>
          </div>
          
          {/* Hebrew content */}
          <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
            <h3 className="font-medium mb-4">Hebrew Content</h3>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Title
              </label>
              <input
                type="text"
                value={titleHe}
                onChange={(e) => setTitleHe(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:border-gray-600 dark:text-white text-right"
                placeholder="רוני איס-כרמל"
                dir="rtl"
              />
            </div>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Subtitle
              </label>
              <input
                type="text"
                value={subtitleHe}
                onChange={(e) => setSubtitleHe(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:border-gray-600 dark:text-white text-right"
                placeholder="פסיכותרפיה מחשבות ורגשות"
                dir="rtl"
              />
            </div>
          </div>
        </div>
        
        {/* Form actions */}
        <div className="flex justify-end space-x-3">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
            disabled={isLoading}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-2 bg-blue-600 border border-transparent rounded-md shadow-sm text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:bg-blue-700 dark:hover:bg-blue-800"
            disabled={isLoading}
          >
            {isLoading ? 'Saving...' : 'Save'}
          </button>
        </div>
      </form>
    </div>
  );
}
