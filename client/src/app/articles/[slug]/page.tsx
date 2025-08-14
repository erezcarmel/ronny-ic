'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { formatDate } from '@/lib/utils';
import { useLocale } from '@/i18n/LocaleProvider';
import { getMessages } from '@/i18n/config';
import apiService from '@/lib/utils/api';

interface ArticleContent {
  id: string;
  title: string;
  excerpt?: string;
  content: string;
  imageUrl?: string;
  pdfUrl?: string;
}

interface Article {
  id: string;
  slug: string;
  isPublished: boolean;
  publishDate: string;
  contents: ArticleContent[];
}

export default function ArticleDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { locale } = useLocale();
  const [translations, setTranslations] = useState<any>(null);
  const [isRtl, setIsRtl] = useState(false);
  const [article, setArticle] = useState<Article | null>(null);
  const [articleContent, setArticleContent] = useState<ArticleContent | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const slug = params.slug as string;
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        // Fetch article data
        const articleData = await apiService.articles.getBySlug(slug, locale);
        console.log('Article data:', articleData);
        
        setArticle(articleData);
        
        // Get the content in the current language
        if (articleData.contents && articleData.contents.length > 0) {
          setArticleContent(articleData.contents[0]);
        }
        
        setIsLoading(false);
      } catch (error: any) {
        console.error('Error fetching article:', error);
        setError(error.message || 'Failed to load article');
        setIsLoading(false);
      }
    };
    
    getMessages(locale).then(messages => {
      setTranslations({
        articles: messages.articles,
        common: messages.common
      });
      setIsRtl(locale === 'he');
      
      // Only fetch article data after translations are loaded
      fetchData();
    });
  }, [locale, slug]);
  
  if (!translations) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }
  
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl text-gray-500 animate-pulse">
          {translations.common.loading || 'Loading...'}
        </div>
      </div>
    );
  }
  
  if (error || !article || !articleContent) {
    return (
      <div className="min-h-screen pt-20 pb-12">
        <div className="container-custom">
          <Link href="/#articles" className="inline-block mb-6 text-primary-600 hover:text-primary-800">
            ← {translations.common.back}
          </Link>
          
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 text-center">
            <h1 className="text-2xl font-bold text-red-600 mb-4">
              {error || translations.articles.notFound || 'Article not found'}
            </h1>
            <p className="text-gray-600 dark:text-gray-300">
              {translations.articles.tryAgain || 'Please try again later or check the URL.'}
            </p>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className={`min-h-screen pt-20 pb-12 ${isRtl ? 'rtl text-right' : 'ltr text-left'}`}>
      <div className="container-custom">
        <Link href="/#articles" className="inline-block mb-6 text-primary-600 hover:text-primary-800">
          ← {translations.common.back}
        </Link>
        
        <article className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden">
          {articleContent.imageUrl && (
            <div className="relative w-full h-64 md:h-96">
              <Image
                src={articleContent.imageUrl}
                alt={articleContent.title}
                fill
                className="object-cover"
              />
            </div>
          )}
          
          <div className="p-6 md:p-8">
            <h1 className="text-2xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              {articleContent.title}
            </h1>
            
            <div className="flex items-center text-gray-500 dark:text-gray-400 mb-6">
              {article.publishDate && (
                <span>{translations.articles.publishedOn}: {formatDate(article.publishDate, locale)}</span>
              )}
            </div>
            
            <div className="prose dark:prose-invert max-w-none">
              {articleContent.content && articleContent.content.split('\n\n').map((paragraph, i) => (
                <p key={i} className="mb-4 text-gray-700 dark:text-gray-300">
                  {paragraph}
                </p>
              ))}
            </div>
            
            {articleContent.pdfUrl && (
              <div className="mt-8">
                <a 
                  href={articleContent.pdfUrl} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="btn btn-secondary"
                >
                  {translations.articles.downloadPdf || 'Download PDF'}
                </a>
              </div>
            )}
          </div>
        </article>
      </div>
    </div>
  );
}