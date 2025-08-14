'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { formatDate } from '@/lib/utils';
import { useLocale } from '@/i18n/LocaleProvider';
import { getMessages } from '@/i18n/config';
import apiService from '@/lib/utils/api';

interface Article {
  id: string;
  slug?: string;
  title: string;
  excerpt?: string;
  imageUrl?: string;
  pdfUrl?: string;
  publishDate?: string;
}

interface ArticlesProps {
  title?: string;
  articles?: Article[];
}

export default function Articles({ title, articles = [] }: ArticlesProps) {
  const { locale } = useLocale();
  const [translations, setTranslations] = useState<any>(null);
  const [isRtl, setIsRtl] = useState(false);
  
  const [loadedArticles, setLoadedArticles] = useState<Article[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Carousel state
  const [currentIndex, setCurrentIndex] = useState(0);
  const [visibleCount, setVisibleCount] = useState(3);
  const carouselRef = useRef<HTMLDivElement>(null);
  
  // Update visible count based on screen size
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 640) {
        setVisibleCount(1); // Mobile: 1 article
      } else if (window.innerWidth < 1024) {
        setVisibleCount(2); // Tablet: 2 articles
      } else {
        setVisibleCount(3); // Desktop: 3 articles
      }
      
      // Reset current index when screen size changes to prevent empty views
      setCurrentIndex(0);
    };
    
    // Set initial value
    handleResize();
    
    // Add event listener
    window.addEventListener('resize', handleResize);
    
    // Clean up
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    getMessages(locale).then(messages => {
      setTranslations({
        articles: messages.articles,
        common: messages.common
      });
      setIsRtl(locale === 'he');
    });
    
    // Fetch articles from API
    const fetchArticles = async () => {
      try {
        setIsLoading(true);
        console.log('Fetching articles from API...');
        
        // Only fetch published articles for the public website
        const data = await apiService.articles.getAll(locale, true);
        console.log('API response:', data);
        
        // Log the structure of the first article to understand its format
        if (data && data.length > 0) {
          console.log('First article structure:', JSON.stringify(data[0], null, 2));
          console.log('Article contents array:', data[0].contents);
        }
        
        if (!data || data.length === 0) {
          console.log('No articles returned from API');
          setLoadedArticles([]);
          setIsLoading(false);
          return;
        }
        
        // Transform data to match the Article interface
        const formattedArticles = data.map((article: any) => {
          // Find content in the current language, or fallback to the first content
          const content = article.contents.find((c: any) => c.language === locale) || article.contents[0] || {};
          
          console.log('Article content found:', content);
          
          const formattedArticle = {
            id: article.id,
            slug: article.slug,
            title: content.title || '',
            excerpt: content.excerpt || '',
            imageUrl: content.imageUrl,
            pdfUrl: content.pdfUrl,
            publishDate: article.publishDate,
          };
          console.log('Formatted article:', formattedArticle);
          return formattedArticle;
        });
        
        console.log('All formatted articles:', formattedArticles);
        setLoadedArticles(formattedArticles);
        setIsLoading(false);
      } catch (error) {
        console.error('Error fetching articles:', error);
        setError('Failed to load articles');
        setIsLoading(false);
      }
    };
    
    fetchArticles();
  }, [locale]);
  
  // Remove useInView as we're not using it anymore
  
  // Log what articles are available
  console.log('Articles from props:', articles);
  console.log('Articles from API:', loadedArticles);
  
  // Use provided articles first, then loaded articles from API
  let displayedArticles: Article[] = [];
  if (articles.length > 0) {
    // Use explicitly provided articles (highest priority)
    displayedArticles = articles;
    console.log('Using explicitly provided articles');
  } else if (loadedArticles.length > 0) {
    // Use articles loaded from API (second priority)
    displayedArticles = loadedArticles;
    console.log('Using articles loaded from API');
  } else {
    // No articles available
    displayedArticles = [];
    console.log('No articles available');
  }
  
  // Navigation functions for the carousel - move one article at a time
  const nextSlide = () => {
    // Always move exactly one article, with infinite scrolling
    setCurrentIndex((prevIndex) => {
      // Increment by 1 and use modulo to ensure infinite scrolling
      return (prevIndex + 1) % displayedArticles.length;
    });
  };
  
  const prevSlide = () => {
    // Always move exactly one article, with infinite scrolling
    setCurrentIndex((prevIndex) => {
      // Decrement by 1 and use modulo with length adjustment to ensure infinite scrolling
      return (prevIndex - 1 + displayedArticles.length) % displayedArticles.length;
    });
  };
  
  // Ensure currentIndex is valid when articles change
  useEffect(() => {
    if (displayedArticles.length > 0 && currentIndex >= displayedArticles.length) {
      setCurrentIndex(0);
    }
  }, [displayedArticles.length, currentIndex]);
  
  // Animation variants removed
  
  if (!translations) {
    return <div className="section bg-white dark:bg-gray-800">Loading...</div>;
  }
  
  // Show loading state while fetching articles
  if (isLoading && articles.length === 0) {
    return (
      <section id="articles" className="section article-section bg-white dark:bg-gray-800">
        <div className="container-custom">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-12">
            {title || (translations.articles ? translations.articles.title : 'Articles')}
          </h2>
          <div className="flex justify-center items-center min-h-[40vh]">
            <div className="animate-pulse text-xl text-gray-500">
              {translations.common ? translations.common.loading : 'Loading...'}
            </div>
          </div>
        </div>
      </section>
    );
  }
  
  // Show error message if there was an error fetching articles
  if (error && articles.length === 0 && loadedArticles.length === 0) {
    console.error('Error loading articles:', error);
  }
  
  return (
    <section id="articles" className="section article-section bg-white dark:bg-gray-800">
      <div className="container-custom">
        <div className={`text-center mb-12 ${isRtl ? 'rtl' : 'ltr'}`}>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white">
            {title || translations.articles.title}
          </h2>
        </div>
        
        {displayedArticles.length > 0 ? (
          <div className="relative">
            {/* Navigation arrows */}
            {displayedArticles.length > 1 && (
              <>
                <button 
                  onClick={prevSlide}
                  className="absolute left-0 top-1/2 transform -translate-y-1/2 z-10 bg-white dark:bg-gray-800 rounded-full p-3 shadow-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-all hover:scale-110"
                  aria-label="Previous"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-700 dark:text-gray-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                
                <button 
                  onClick={nextSlide}
                  className="absolute right-0 top-1/2 transform -translate-y-1/2 z-10 bg-white dark:bg-gray-800 rounded-full p-3 shadow-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-all hover:scale-110"
                  aria-label="Next"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-700 dark:text-gray-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </>
            )}
            
            {/* Carousel container */}
            <div className="overflow-hidden px-6" ref={carouselRef}>
              <div 
                className="flex transition-transform duration-300 ease-in-out"
                style={{ 
                  transform: `translateX(-${(currentIndex % displayedArticles.length) * (100 / visibleCount)}%)`,
                }}
              >
                {displayedArticles.map((article) => (
                  <div
                    key={article.id}
                    className="h-full px-2"
                    style={{ 
                      flex: `0 0 ${100 / visibleCount}%`,
                      maxWidth: `${100 / visibleCount}%`,
                    }}
                  >
                    <div className={`bg-gray-50 dark:bg-gray-700 rounded-lg overflow-hidden shadow-md h-full ${isRtl ? 'rtl text-right' : 'ltr text-left'}`}>
                      {article.imageUrl && (
                        <div className="relative h-48 w-full">
                          <Image
                            src={article.imageUrl}
                            alt={article.title}
                            fill
                            className="object-cover"
                          />
                        </div>
                      )}
                      
                      <div className="p-6">
                        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                          {article.title}
                        </h3>
                        
                        {article.publishDate && (
                          <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">
                            {translations.articles.publishedOn}: {formatDate(article.publishDate, locale)}
                          </p>
                        )}
                        
                        {article.excerpt && (
                          <p className="text-gray-600 dark:text-gray-300 mb-4">
                            {article.excerpt}
                          </p>
                        )}
                        
                        <div className="flex justify-start space-x-3 rtl:space-x-reverse">
                          <Link 
                            href={`/articles/${article.slug || article.id}`}
                            className="btn btn-secondary text-sm"
                          >
                            {translations.articles.readMore}
                          </Link>
                          
                          {article.pdfUrl && (
                            <a 
                              href={article.pdfUrl} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="btn btn-secondary text-sm"
                            >
                              {translations.articles.downloadPdf}
                            </a>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Pagination dots */}
            {displayedArticles.length > 1 && (
              <div className="flex justify-center mt-4 space-x-2">
                {displayedArticles.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentIndex(index)}
                    className={`h-2 w-2 rounded-full ${currentIndex % displayedArticles.length === index ? 'bg-blue-600' : 'bg-gray-300'}`}
                    aria-label={`Go to slide ${index + 1}`}
                  />
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-16">
            <p className="text-xl text-gray-500 dark:text-gray-400">
              {translations.articles.noArticles || "No articles available"}
            </p>
          </div>
        )}
      </div>
    </section>
  );
}