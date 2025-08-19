'use client';

import { useState, useEffect } from 'react';
import { useLocale } from '@/i18n/LocaleProvider';
import { getMessages } from '@/i18n/config';
import dynamic from 'next/dynamic';

// Dynamically import the rich text editor to avoid SSR issues
const ReactQuill = dynamic(() => import('react-quill'), { ssr: false });
import 'react-quill/dist/quill.snow.css';

interface AboutFormProps {
  initialData?: any;
  onSubmit: (data: any) => void;
  onCancel: () => void;
}

export default function AboutForm({ initialData, onSubmit, onCancel }: AboutFormProps) {
  const { locale } = useLocale();
  const [translations, setTranslations] = useState<any>(null);
  const [isRtl, setIsRtl] = useState(false);
  
  // Extract content from initialData if it exists
  const getInitialContent = (language: string) => {
    if (!initialData) return '';
    
    // Check if we have contents array (from API)
    if (initialData.contents && Array.isArray(initialData.contents)) {
      const content = initialData.contents.find((c: any) => c.language === language);
      return content?.content || '';
    }
    
    // Fallback to direct properties
    return language === 'en' ? initialData.contentEn || '' : initialData.contentHe || '';
  };
  
  // Extract image URL from initialData if it exists
  const getInitialImageUrl = () => {
    if (!initialData) return '/images/logo.png';
    
    // Check if we have contents array (from API)
    if (initialData.contents && Array.isArray(initialData.contents) && initialData.contents.length > 0) {
      return initialData.contents[0].imageUrl || '/images/logo.png';
    }
    
    // Fallback to direct property
    return initialData.imageUrl || '/images/logo.png';
  };
  
  const [formData, setFormData] = useState({
    id: initialData?.id || '',
    contentEn: getInitialContent('en'),
    contentHe: getInitialContent('he'),
    imageUrl: getInitialImageUrl(),
    published: initialData?.isPublished ?? initialData?.published ?? true,
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState<'en' | 'he'>('en');
  
  useEffect(() => {
    getMessages(locale).then(messages => {
      setTranslations(messages.admin.sections);
      setIsRtl(locale === 'he');
    });
  }, [locale]);
  
  const handleContentChange = (value: string, language: 'en' | 'he') => {
    if (language === 'en') {
      setFormData(prev => ({ ...prev, contentEn: value }));
    } else {
      setFormData(prev => ({ ...prev, contentHe: value }));
    }
  };
  
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      // In a real application, you would upload the file to a server
      // and get back a URL. For now, we'll just use a placeholder.
      setFormData(prev => ({ ...prev, imageUrl: URL.createObjectURL(e.target.files[0]) }));
    }
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      await onSubmit(formData);
    } catch (error) {
      console.error('Error submitting form:', error);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  if (!translations) {
    return <div>Loading...</div>;
  }
  
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
      <h2 className="text-xl font-semibold mb-6">
        {initialData?.id ? 'Edit About Section' : 'Add About Section'}
      </h2>
      
      <form onSubmit={handleSubmit}>
        <div className="mb-6">
          <label className="block text-gray-700 dark:text-gray-300 mb-2">
            Image
          </label>
          <div className="flex items-center space-x-4">
            <div className="w-24 h-24 relative">
              <img 
                src={formData.imageUrl} 
                alt="About section image" 
                className="w-full h-full object-cover rounded"
              />
            </div>
            <input 
              type="file" 
              accept="image/*"
              onChange={handleImageChange}
              className="form-input"
            />
          </div>
        </div>
        
        <div className="mb-4">
          <div className="flex border-b">
            <button
              type="button"
              className={`py-2 px-4 ${activeTab === 'en' ? 'border-b-2 border-blue-500' : ''}`}
              onClick={() => setActiveTab('en')}
            >
              English Content
            </button>
            <button
              type="button"
              className={`py-2 px-4 ${activeTab === 'he' ? 'border-b-2 border-blue-500' : ''}`}
              onClick={() => setActiveTab('he')}
            >
              Hebrew Content
            </button>
          </div>
          
          <div className={`mt-4 ${activeTab === 'en' ? 'block' : 'hidden'}`}>
            <label className="block text-gray-700 dark:text-gray-300 mb-2">
              English Content
            </label>
            <div className="prose-editor">
              <ReactQuill
                value={formData.contentEn}
                onChange={(value) => handleContentChange(value, 'en')}
                modules={{
                  toolbar: [
                    [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
                    ['bold', 'italic', 'underline', 'strike'],
                    [{ 'list': 'ordered'}, { 'list': 'bullet' }],
                    ['link', 'image'],
                    ['clean']
                  ],
                }}
              />
            </div>
          </div>
          
          <div className={`mt-4 ${activeTab === 'he' ? 'block' : 'hidden'}`}>
            <label className="block text-gray-700 dark:text-gray-300 mb-2">
              Hebrew Content
            </label>
            <div className="prose-editor" dir="rtl">
              <ReactQuill
                value={formData.contentHe}
                onChange={(value) => handleContentChange(value, 'he')}
                modules={{
                  toolbar: [
                    [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
                    ['bold', 'italic', 'underline', 'strike'],
                    [{ 'list': 'ordered'}, { 'list': 'bullet' }],
                    ['link', 'image'],
                    ['clean']
                  ],
                }}
              />
            </div>
          </div>
        </div>
        
        <div className="mb-6">
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={formData.published}
              onChange={(e) => setFormData(prev => ({ ...prev, published: e.target.checked }))}
              className="form-checkbox"
            />
            <span className="ml-2">Published</span>
          </label>
        </div>
        
        <div className="flex justify-end space-x-4">
          <button
            type="button"
            onClick={onCancel}
            className="btn btn-outline"
            disabled={isSubmitting}
          >
            {translations.cancel}
          </button>
          <button
            type="submit"
            className="btn btn-primary"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Saving...' : translations.save}
          </button>
        </div>
      </form>
    </div>
  );
}
