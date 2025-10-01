'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { useLocale } from '@/i18n/LocaleProvider';
import { getMessages } from '@/i18n/config';

const ReactQuill = dynamic(() => import('react-quill'), { ssr: false });
import 'react-quill/dist/quill.snow.css';

interface HeroFormProps {
  initialData?: any;
  onSubmit: (data: any) => void;
  onCancel: () => void;
}

export default function HeroForm({ initialData, onSubmit, onCancel }: HeroFormProps) {
  const { locale } = useLocale();
  const [translations, setTranslations] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  
  // Form state
  const [titleEn, setTitleEn] = useState('');
  const [titleHe, setTitleHe] = useState('');
  const [subtitleEn, setSubtitleEn] = useState('');
  const [subtitleHe, setSubtitleHe] = useState('');
  const [bottomSubtitleEn, setBottomSubtitleEn] = useState('');
  const [bottomSubtitleHe, setBottomSubtitleHe] = useState('');
  const [buttonTextEn, setButtonTextEn] = useState('');
  const [buttonTextHe, setButtonTextHe] = useState('');
  const [published, setPublished] = useState(true);
  const [backgroundImage, setBackgroundImage] = useState('');
  
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
        setBottomSubtitleEn(enContent.bottomSubtitle || '');
        setButtonTextEn(enContent.content || 'Contact Me');
        if (enContent.imageUrl) {
          setBackgroundImage(enContent.imageUrl);
        }
      }
      
      // Find Hebrew content
      const heContent = initialData.contents?.find((c: any) => c.language === 'he');
      if (heContent) {
        setTitleHe(heContent.title || '');
        setSubtitleHe(heContent.subtitle || '');
        setBottomSubtitleHe(heContent.bottomSubtitle || '');
        setButtonTextHe(heContent.content || 'צור קשר');
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
            bottomSubtitle: bottomSubtitleEn,
            content: buttonTextEn, // Store button text in content field
            imageUrl: backgroundImage,
          },
          {
            language: 'he',
            title: titleHe,
            subtitle: subtitleHe,
            bottomSubtitle: bottomSubtitleHe,
            content: buttonTextHe, // Store button text in content field
            imageUrl: backgroundImage,
          }
        ],
      };
      
      // Call parent's onSubmit
      await onSubmit(formData);
    } catch (error) {
      console.error('Error submitting hero form:', error);
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
        {initialData ? 'Edit Hero Section' : 'Add Hero Section'}
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
        
        {/* Background image */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Background Image URL
          </label>
          
          <input
            type="text"
            value={backgroundImage}
            onChange={(e) => setBackgroundImage(e.target.value)}
            placeholder="Enter background image URL"
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:border-gray-600 dark:text-white"
          />
          
          {backgroundImage && (
            <div className="mt-4">
              <img 
                src={backgroundImage} 
                alt="Background preview" 
                className="h-40 object-cover rounded-md"
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
                placeholder="Hero Title"
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
                placeholder="Hero Subtitle"
              />
            </div>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Bottom Subtitle
              </label>
              <div className="prose-editor">
                <ReactQuill
                  value={bottomSubtitleEn}
                  onChange={setBottomSubtitleEn}
                  modules={{
                    toolbar: [
                      ['bold', 'italic', 'underline'],
                      ['link'],
                      ['clean']
                    ],
                  }}
                  placeholder="Small text at bottom"
                />
              </div>
            </div>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Button Text
              </label>
              <input
                type="text"
                value={buttonTextEn}
                onChange={(e) => setButtonTextEn(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:border-gray-600 dark:text-white"
                placeholder="Contact Me"
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
                placeholder="כותרת ראשית"
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
                placeholder="כותרת משנה"
                dir="rtl"
              />
            </div>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Bottom Subtitle
              </label>
              <div className="prose-editor" dir="rtl">
                <ReactQuill
                  value={bottomSubtitleHe}
                  onChange={setBottomSubtitleHe}
                  modules={{
                    toolbar: [
                      ['bold', 'italic', 'underline'],
                      ['link'],
                      ['clean']
                    ],
                  }}
                  placeholder="טקסט קטן בתחתית"
                />
              </div>
            </div>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Button Text
              </label>
              <input
                type="text"
                value={buttonTextHe}
                onChange={(e) => setButtonTextHe(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:border-gray-600 dark:text-white text-right"
                placeholder="צור קשר"
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
