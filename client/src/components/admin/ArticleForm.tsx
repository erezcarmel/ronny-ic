'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import apiService from '@/lib/utils/api';
import { useLocale } from '@/i18n/LocaleProvider';
import { getMessages } from '@/i18n/config';

interface ArticleFormProps {
  articleId?: string;
  onCancel: () => void;
  onSuccess: () => void;
}

interface ArticleContent {
  id?: string;
  language: string;
  title: string;
  excerpt: string;
  content: string;
  imageUrl?: string;
  pdfUrl?: string;
}

interface ArticleFormData {
  slug: string;
  isPublished: boolean;
  publishDate: string;
  contents: ArticleContent[];
}

export default function ArticleForm({ articleId, onCancel, onSuccess }: ArticleFormProps) {
  const router = useRouter();
  const { locale } = useLocale();
  const [translations, setTranslations] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  
  const [formData, setFormData] = useState<ArticleFormData>({
    slug: '',
    isPublished: false,
    publishDate: new Date().toISOString().split('T')[0],
    contents: [
      {
        language: 'he',
        title: '',
        excerpt: '',
        content: '',
      },
      {
        language: 'en',
        title: '',
        excerpt: '',
        content: '',
      }
    ]
  });
  
  // Load translations
  useEffect(() => {
    getMessages(locale).then(messages => {
      // Check if articleForm exists, otherwise fall back to admin.articles
      if (messages.articleForm) {
        setTranslations(messages.articleForm);
      } else {
        console.log('Falling back to admin.articles translations');
        setTranslations(messages.admin.articleForm);
      }
    });
  }, [locale]);
  
  // Fetch article data if editing
  useEffect(() => {
    if (articleId) {
      fetchArticleData();
    }
  }, [articleId]);
  
  const fetchArticleData = async () => {
    try {
      setIsLoading(true);
      const article = await apiService.articles.getById(articleId as string);
      
      // Prepare form data from article
      const contents = article.contents || [];
      
      // Ensure we have both languages
      const hasEnglish = contents.some((content: any) => content.language === 'en');
      const hasHebrew = contents.some((content: any) => content.language === 'he');
      
      if (!hasEnglish) {
        contents.push({
          language: 'en',
          title: '',
          excerpt: '',
          content: '',
        });
      }
      
      if (!hasHebrew) {
        contents.push({
          language: 'he',
          title: '',
          excerpt: '',
          content: '',
        });
      }
      
      // Set image preview if available
      const hebrewContent = contents.find((content: any) => content.language === 'he');
      const englishContent = contents.find((content: any) => content.language === 'en');
      
      // Prefer Hebrew content's image URL, fall back to English if needed
      if (hebrewContent?.imageUrl) {
        setImagePreview(hebrewContent.imageUrl);
      } else if (englishContent?.imageUrl) {
        setImagePreview(englishContent.imageUrl);
      }
      
      setFormData({
        slug: article.slug,
        isPublished: article.isPublished,
        publishDate: article.publishDate ? new Date(article.publishDate).toISOString().split('T')[0] : '',
        contents,
      });
      
      setIsLoading(false);
    } catch (error) {
      console.error('Error fetching article:', error);
      setError('Failed to load article data');
      setIsLoading(false);
    }
  };
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    if (name === 'slug') {
      setFormData({ ...formData, slug: value });
    } else if (name === 'isPublished') {
      setFormData({ ...formData, isPublished: (e.target as HTMLInputElement).checked });
    } else if (name === 'publishDate') {
      setFormData({ ...formData, publishDate: value });
    }
  };
  
  const handleContentChange = (language: string, field: string, value: string) => {
    const updatedContents = formData.contents.map(content => {
      if (content.language === language) {
        return { ...content, [field]: value };
      }
      return content;
    });
    
    setFormData({ ...formData, contents: updatedContents });
  };
  
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImageFile(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onload = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };
  
  const handlePdfChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setPdfFile(e.target.files[0]);
    }
  };
  
  const uploadFile = async (file: File) => {
    try {
      const result = await apiService.articles.uploadFile(file);
      return result.url;
    } catch (error) {
      console.error('Error uploading file:', error);
      throw new Error('Failed to upload file');
    }
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setIsLoading(true);
      setError(null);
      
      // Log a summary of the form data instead of the full content to avoid console truncation
      console.log('Submitting form data:', {
        slug: formData.slug,
        isPublished: formData.isPublished,
        publishDate: formData.publishDate,
        contents: formData.contents.map(c => ({
          language: c.language,
          title: c.title,
          excerpt: c.excerpt ? `${c.excerpt.substring(0, 50)}...` : '',
          contentLength: c.content ? c.content.length : 0
        }))
      });
      
      // Upload image if selected
      let imageUrl: string | undefined;
      if (imageFile) {
        console.log('Uploading image file:', imageFile.name);
        imageUrl = await uploadFile(imageFile);
      }
      
      // Upload PDF if selected
      let pdfUrl: string | undefined;
      if (pdfFile) {
        console.log('Uploading PDF file:', pdfFile.name);
        pdfUrl = await uploadFile(pdfFile);
      }
      
      // Get Hebrew content for fallback
      const hebrewContent = formData.contents.find(c => c.language === 'he');
      const englishContent = formData.contents.find(c => c.language === 'en');
      
      // Validate that Hebrew content is provided (required)
      if (!hebrewContent?.title || !hebrewContent?.excerpt || !hebrewContent?.content) {
        throw new Error('Please provide all required Hebrew content (title, excerpt, and content)');
      }
      
      // Update contents with file URLs and apply fallback logic
      const updatedContents = formData.contents.map(content => {
        if (content.language === 'en') {
          // Always use Hebrew content as fallback for any empty English fields
          return {
            ...content,
            title: content.title || hebrewContent?.title || '',
            excerpt: content.excerpt || hebrewContent?.excerpt || '',
            content: content.content || hebrewContent?.content || '',
            imageUrl: imageUrl || content.imageUrl || hebrewContent?.imageUrl,
            pdfUrl: pdfUrl || content.pdfUrl || hebrewContent?.pdfUrl,
          };
        } else {
          // Hebrew content (required)
          return {
            ...content,
            imageUrl: imageUrl || content.imageUrl,
            pdfUrl: pdfUrl || content.pdfUrl,
          };
        }
      });
      
      // Keep all content entries
      const validContents = updatedContents;
      
      const dataToSubmit = {
        ...formData,
        contents: validContents,
      };
      
      let result;
      if (articleId) {
        // Update existing article
        console.log('Updating article:', articleId);
        result = await apiService.articles.update(articleId, dataToSubmit);
        console.log('Update result:', result);
      } else {
        // Create new article
        console.log('Creating new article');
        result = await apiService.articles.create(dataToSubmit);
        console.log('Create result:', result);
      }
      
      setIsLoading(false);
      onSuccess();
    } catch (error: any) {
      console.error('Error saving article:', error);
      setError(error.message || 'Failed to save article');
      setIsLoading(false);
    }
  };
  
  if (!translations) {
    return <div>Loading...</div>;
  }
  
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
      <h2 className="text-xl font-semibold mb-6">
        {articleId ? translations.editArticle : translations.addArticle}
      </h2>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}
      
      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div>
            <label htmlFor="slug" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              {translations.slug}
            </label>
            <input
              type="text"
              id="slug"
              name="slug"
              value={formData.slug}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
            <p className="text-xs text-gray-500 mt-1">{translations.slugHelp}</p>
          </div>
          
          <div>
            <label htmlFor="publishDate" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              {translations.publishDate}
            </label>
            <input
              type="date"
              id="publishDate"
              name="publishDate"
              value={formData.publishDate}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
        
        <div className="mb-6">
          <div className="flex items-center">
            <input
              type="checkbox"
              id="isPublished"
              name="isPublished"
              checked={formData.isPublished}
              onChange={handleInputChange}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label htmlFor="isPublished" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
              {translations.published}
            </label>
          </div>
        </div>
        
        <div className="mb-6">
          <h3 className="text-lg font-medium mb-4">{translations.hebrewContent}</h3>
          
          <div className="mb-4">
            <label htmlFor="he-title" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              {translations.title}
            </label>
            <input
              type="text"
              id="he-title"
              value={formData.contents.find(c => c.language === 'he')?.title || ''}
              onChange={(e) => handleContentChange('he', 'title', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              dir="rtl"
              required
            />
          </div>
          
          <div className="mb-4">
            <label htmlFor="he-excerpt" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              {translations.excerpt}
            </label>
            <textarea
              id="he-excerpt"
              value={formData.contents.find(c => c.language === 'he')?.excerpt || ''}
              onChange={(e) => handleContentChange('he', 'excerpt', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={3}
              dir="rtl"
              required
            />
          </div>
          
          <div className="mb-4">
            <label htmlFor="he-content" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              {translations.content}
            </label>
            <textarea
              id="he-content"
              value={formData.contents.find(c => c.language === 'he')?.content || ''}
              onChange={(e) => handleContentChange('he', 'content', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={10}
              dir="rtl"
              required
            />
          </div>
        </div>
        
        <div className="mb-6">
          <h3 className="text-lg font-medium mb-4">{translations.englishContent}</h3>
          
          <div className="mb-4">
            <label htmlFor="en-title" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              {translations.title}
            </label>
            <input
              type="text"
              id="en-title"
              value={formData.contents.find(c => c.language === 'en')?.title || ''}
              onChange={(e) => handleContentChange('en', 'title', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <div className="mb-4">
            <label htmlFor="en-excerpt" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              {translations.excerpt}
            </label>
            <textarea
              id="en-excerpt"
              value={formData.contents.find(c => c.language === 'en')?.excerpt || ''}
              onChange={(e) => handleContentChange('en', 'excerpt', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={3}
            />
          </div>
          
          <div className="mb-4">
            <label htmlFor="en-content" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              {translations.content}
            </label>
            <textarea
              id="en-content"
              value={formData.contents.find(c => c.language === 'en')?.content || ''}
              onChange={(e) => handleContentChange('en', 'content', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={10}
            />
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div>
            <label htmlFor="image" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              {translations.featuredImage}
            </label>
            <input
              type="file"
              id="image"
              accept="image/*"
              onChange={handleImageChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {imagePreview && (
              <div className="mt-2">
                <img src={imagePreview} alt="Preview" className="h-32 object-contain" />
              </div>
            )}
          </div>
          
          <div>
            <label htmlFor="pdf" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              {translations.pdfAttachment}
            </label>
            <input
              type="file"
              id="pdf"
              accept=".pdf"
              onChange={handlePdfChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {(formData.contents.find(c => c.language === 'he')?.pdfUrl || formData.contents.find(c => c.language === 'en')?.pdfUrl) && (
              <div className="mt-2">
                <a 
                  href={formData.contents.find(c => c.language === 'he')?.pdfUrl || formData.contents.find(c => c.language === 'en')?.pdfUrl || ''} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="text-blue-600 hover:underline"
                >
                  {translations.viewCurrentPdf}
                </a>
              </div>
            )}
          </div>
        </div>
        
        <div className="flex justify-end space-x-3">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
            disabled={isLoading}
          >
            {translations.cancel}
          </button>
          <button
            type="submit"
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={isLoading}
          >
            {isLoading ? translations.saving : (articleId ? translations.updateArticle : translations.createArticle)}
          </button>
        </div>
      </form>
    </div>
  );
}
