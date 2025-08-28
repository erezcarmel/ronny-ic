'use client';

import { useTranslations } from 'next-intl';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { useLocale } from '@/i18n/LocaleProvider';
import { useState, useEffect } from 'react';
import Image from 'next/image';
import apiService from '@/lib/utils/api';

interface ServicesProps {
  title?: string;
  content?: string;
}

interface ServiceCard {
  id: string;
  title: string;
  content: string;
  imageUrl?: string;
}

interface ServiceSection {
  id: string;
  title: string;
  description: string;
  cards: ServiceCard[];
}

interface SectionContent {
  id: string;
  language: string;
  title?: string;
  subtitle?: string;
  content?: string;
  imageUrl?: string;
}

interface Section {
  id: string;
  name: string;
  type: string;
  contents: SectionContent[];
}

export default function Services({
  title,
  content,
}: ServicesProps) {
  const t = useTranslations('services');
  const { locale } = useLocale();
  const isRtl = locale === 'he';
  
  // State for section data from API
  const [sectionData, setSectionData] = useState<Section | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedSections, setExpandedSections] = useState<{[key: string]: boolean}>({ services: false });
  
  // Animation when section comes into view
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });
  
  const variants = {
    hidden: { opacity: 0, y: 50 },
    visible: { opacity: 1, y: 0 },
  };

  // Fetch section data from API
  useEffect(() => {
    const fetchSectionData = async () => {
      try {
        setLoading(true);
        const data = await apiService.sections.getByType('services', locale);
        setSectionData(data);
        
        if (data && data.id) {
          setExpandedSections(prev => ({
            ...prev,
            [data.id]: true
          }));
        }
        
        setError(null);
      } catch (error) {
        console.error('Error fetching services data:', error);
        setError('Failed to load services data');
      } finally {
        setLoading(false);
      }
    };
    
    fetchSectionData();
  }, [locale]);

  // Function to handle image errors
  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    // Hide the image container when an error occurs
    const imgElement = e.currentTarget;
    if (imgElement.parentElement) {
      imgElement.parentElement.style.display = 'none';
    }
  };
  
  // Function to toggle section expansion
  const toggleSection = (sectionId: string) => {
    setExpandedSections(prev => {
      const newState = {
        ...prev,
        [sectionId]: !prev[sectionId]
      };
      return newState;
    });
  };
  
  // Parse content from database if available, otherwise use translations
  const parseServiceSections = (): ServiceSection[] => {
    // If we have section data from the API with content
    if (sectionData?.contents?.[0]?.content) {
      try {
        // Try to parse the content as JSON
        const parsedContent = JSON.parse(sectionData.contents[0].content);
        
        // Check if the content is in the new format with services array
        if (parsedContent && typeof parsedContent === 'object' && !Array.isArray(parsedContent)) {
          
          // Check for new format with multiple services
          if (parsedContent.services && Array.isArray(parsedContent.services)) {
            return parsedContent.services.map((service: any, index: number) => ({
              id: `service-${sectionData.id}-${index}`,
              title: service.title,
              description: service.description,
              cards: service.cards || []
            }));
          }
          
          // Old single service format
          if (parsedContent.title && parsedContent.description && Array.isArray(parsedContent.cards)) {
            return [{
              id: sectionData.id,
              title: parsedContent.title,
              description: parsedContent.description,
              cards: parsedContent.cards
            }];
          }
        }
        
        // Handle legacy array format
        if (Array.isArray(parsedContent) && parsedContent.length > 0) {
          return parsedContent.map(section => {
            // If the content is already in the new format
            if (section.cards) {
              return section;
            }
            
            // Extract cards from HTML content
            const cards: ServiceCard[] = [];
            
            if (typeof section.content === 'string') {
              // Create a temporary div to parse HTML content
              const tempDiv = document.createElement('div');
              tempDiv.innerHTML = section.content;
              
              // Find all h4 elements which will be our card titles
              const h4Elements = tempDiv.querySelectorAll('h4');
              
              if (h4Elements.length === 0) {
                // If no h4 elements, create a single card with all content
                cards.push({
                  id: `${section.id}-item-1`,
                  title: section.title || 'Service',
                  content: section.content,
                  imageUrl: ''
                });
              } else {
                h4Elements.forEach((h4Element, index) => {
                  const title = h4Element.textContent || `Item ${index + 1}`;
                  let content = '';
                  let nextElement = h4Element.nextElementSibling;
                  
                  // Collect all content until the next h4 or end
                  while (nextElement && nextElement.tagName !== 'H4') {
                    content += nextElement.outerHTML;
                    nextElement = nextElement.nextElementSibling;
                  }
                                    
                  // Create a card for each h4 section
                  cards.push({
                    id: `${section.id}-item-${index + 1}`,
                    title: title,
                    content: content || '<p>No content available</p>',
                    imageUrl: ''
                  });
                });
              }
            }
            
            // Extract just the first paragraph for description
            let description = '';
            if (typeof section.content === 'string') {
              // Create a temporary div to parse HTML content
              const tempDiv = document.createElement('div');
              tempDiv.innerHTML = section.content;
              
              // Get the first paragraph or first element if no paragraphs
              const firstParagraph = tempDiv.querySelector('p');
              if (firstParagraph) {
                description = firstParagraph.innerHTML;
              } else {
                // If no paragraph, just take the first part of content
                description = section.content.split('</h4>')[0].replace(/<\/?[^>]+(>|$)/g, '');
              }
            }
            
            const result = {
              id: section.id,
              title: section.title,
              description: description,
              cards: cards
            };
            return result;
          });
        }
      } catch (e) {
        console.error('Error parsing services content:', e);
      }
    }
    
    // Return empty array if no services data available
    return [];
  };
  
  const serviceSections = parseServiceSections();
  
  // Debug each service section
  serviceSections.forEach((section, index) => {  
    // Check if cards is undefined or empty
    if (!section.cards || section.cards.length === 0) {
    } else {
      section.cards.forEach((card, cardIndex) => {
      });
    }
  });
  
  return (
    <section id="services" className={`services-section bg-white dark:bg-gray-800 w-full max-w-full pt-8 ${isRtl ? 'pb-0' : 'pb-8'}`}>
      <div className="w-full">
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
          </div>
        ) : error ? (
          <div className="text-center text-red-500 py-8">
            <p>{error}</p>
          </div>
        ) : (
          <motion.div
            ref={ref}
            initial="hidden"
            animate={inView ? 'visible' : 'hidden'}
            variants={variants}
            transition={{ duration: 0.6 }}
            className={`${isRtl ? 'rtl' : 'ltr'}`}
          > 
            <div>
              {content ? (
                <div dangerouslySetInnerHTML={{ __html: content }} />
              ) : (
                <>
                  {serviceSections.length > 0 ? (
                    serviceSections.map((section) => (
                      <div key={section.id}>
                        <div className="w-full px-8 sm:px-10 md:px-16 lg:px-24 xl:px-32 pt-8">
                          <h2 className={`text-center font-bold ${section.cards && section.cards.length > 0 ? 'text-3xl mb-4' : 'text-2xl mb-0'}`}>
                            {section.title}
                          </h2>
                          { section.description && (
                            <div className={`text-base text-center text-gray-700 dark:text-gray-300 mb-2 max-w-6xl mx-auto`}>
                              <div dangerouslySetInnerHTML={{ __html: section.description }} />
                            </div>
                          )}
                          
                          {section.cards && section.cards.length > 0 && (
                            <div className="flex justify-center">
                              <button
                                onClick={() => toggleSection(section.id)}
                                className="flex gap-2 btn text-md text-gray-700 hover:text-[#555599] px-8 py-3 rounded-full transition-all duration-300 flex items-center space-x-2 hover:bg-transparent"
                              >
                                <span>{expandedSections[section.id] ? t('showLess') : t('readMore')}</span>
                                <svg 
                                  className={`w-5 h-5 transition-transform duration-300 ${expandedSections[section.id] ? 'rotate-180' : ''}`} 
                                  fill="none" 
                                  stroke="currentColor" 
                                  viewBox="0 0 24 24" 
                                  xmlns="http://www.w3.org/2000/svg"
                                >
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                                </svg>
                              </button>
                            </div>
                          )}
                        </div>
                        
                        {section.cards && section.cards.length > 0 && (
                          <div 
                            className={`flex flex-nowrap justify-center md:flex-wrap overflow-x-auto md:overflow-visible pb-6 gap-6 snap-x snap-mandatory md:snap-none scrollbar-hide scroll-smooth -mx-4 sm:-mx-6 md:mx-0 px-8 sm:px-10 md:px-16 lg:px-24 xl:px-32 w-full transition-all duration-500 ease-in-out ${
                              expandedSections[section.id] 
                                ? 'max-h-[2000px] opacity-100 mt-8' 
                                : 'max-h-0 opacity-0 overflow-hidden'
                            }`}
                          >
                            {section.cards.map((card) => (
                              <div key={card.id} className="bg-white dark:bg-gray-800 rounded-lg overflow-hidden shadow-lg border border-gray-100 transition-transform duration-300 hover:shadow-xl hover:-translate-y-1 flex-shrink-0 min-w-[280px] w-[280px] sm:min-w-[320px] sm:w-[320px] md:w-[calc(50%-12px)] md:min-w-[calc(50%-12px)] lg:w-[calc(25%-18px)] lg:min-w-[calc(25%-18px)] snap-start">
                                {card.imageUrl && card.imageUrl.trim() !== '' && (
                                  <div className="h-48 overflow-hidden">
                                    <Image
                                      src={card.imageUrl}
                                      alt={card.title}
                                      width={300}
                                      height={300}
                                      className="w-full h-full object-cover"
                                      onError={handleImageError}
                                    />
                                  </div>
                                )}
                                <div className="p-4">
                                  <h3 className={`text-lg font-bold mb-3 ${isRtl ? 'text-right' : 'text-left'}`}>
                                    {card.title}
                                  </h3>
                                  <div className={`prose dark:prose-invert ${isRtl ? 'text-right' : 'text-left'}`}>
                                    {typeof card.content === 'string' ? (
                                      <div dangerouslySetInnerHTML={{ __html: card.content }} />
                                    ) : (
                                      <p>{card.content}</p>
                                    )}
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ))
                  ) : (
                    <div className="w-full text-center py-16">
                      <h2 className="text-2xl font-semibold mb-4">{t('title')}</h2>
                      <p className="text-gray-600 dark:text-gray-400">
                        {t('noServices')}
                      </p>
                    </div>
                  )}
                </>
              )}
            </div>
          </motion.div>
        )}
      </div>
    </section>
  );
}
