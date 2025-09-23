'use client';

import { useTranslations } from 'next-intl';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { useLocale } from '@/i18n/LocaleProvider';
import { useState, useEffect } from 'react';
import Image from 'next/image';
import apiService from '@/lib/utils/api';
import { resolveImagePath } from '@/lib/utils/imageUtils';

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
  imageUrl?: string;
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

// Add custom CSS at the top of the component
const customStyles = `
  .fixed-image-container {
    position: relative;
    width: fit-content;
    height: 100%;
    max-height: 500px;
    min-height: 300px;
    overflow: hidden;
    border-radius: 0.5rem;
    box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
  }

  @media (min-width: 768px) {
    .fixed-image-container {
      position: sticky;
      top: 6rem;
    }
  }
  
  .animate-fadeIn {
    animation: fadeIn 0.3s ease-in-out;
  }
  
  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }
`;

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
  const [expandedCards, setExpandedCards] = useState<{[key: string]: boolean}>({});
  const [selectedSectionId, setSelectedSectionId] = useState<string | null>(null);
  
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
        
        // Initialize with the first card of each section selected
        if (data && data.contents && data.contents[0]?.content) {
          try {
            const parsedContent = JSON.parse(data.contents[0].content);
            const initialExpandedState: {[key: string]: boolean} = {};
            
            // Handle different content formats
            if (parsedContent && typeof parsedContent === 'object' && !Array.isArray(parsedContent)) {
              if (parsedContent.services && Array.isArray(parsedContent.services)) {
                // Multiple services format
                parsedContent.services.forEach((service: any, sIndex: number) => {
                  if (service.cards && service.cards.length > 0) {
                    const firstCardId = service.cards[0].id || `service-${data.id}-${sIndex}-item-0`;
                    initialExpandedState[firstCardId] = true;
                  }
                });
              } else if (parsedContent.cards && parsedContent.cards.length > 0) {
                // Single service format
                const firstCardId = parsedContent.cards[0].id || `${data.id}-item-0`;
                initialExpandedState[firstCardId] = true;
              }
            } else if (Array.isArray(parsedContent) && parsedContent.length > 0) {
              // Legacy array format
              parsedContent.forEach((section: any) => {
                if (section.cards && section.cards.length > 0) {
                  const firstCardId = section.cards[0].id || `${section.id}-item-0`;
                  initialExpandedState[firstCardId] = true;
                }
              });
            }
            
            // Update expanded cards state
            setExpandedCards(initialExpandedState);
          } catch (e) {
            console.error('Error setting initial expanded cards:', e);
          }
        }
        
        setError(null);
      } catch (error: unknown) {
        console.error('Error fetching services data:', error);
        if (error && typeof error === 'object' && 'response' in error && 
            error.response && typeof error.response === 'object' && 'status' in error.response && 
            error.response.status === 429) {
          setError('Too many requests. Please try again in a moment.');
        } else {
          setError('Failed to load services data');
        }
      } finally {
        setLoading(false);
      }
    };
    
    fetchSectionData();
    
    // Cleanup function
    return () => {
      // Any cleanup if needed
    };
  }, [locale]);

  // Function to handle image errors
  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    // Hide the image container when an error occurs
    const imgElement = e.currentTarget;
    if (imgElement.parentElement) {
      imgElement.parentElement.style.display = 'none';
    }
  };
  
  // Function to toggle card expansion
  const toggleCard = (cardId: string) => {
    setExpandedCards(prev => {
      // First, close all other cards
      const allClosed = Object.keys(prev).reduce((acc, key) => {
        acc[key] = false;
        return acc;
      }, {} as {[key: string]: boolean});
      
      // Then toggle the selected card
      return {
        ...allClosed,
        [cardId]: !prev[cardId]
      };
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
              // Ensure description is properly preserved as HTML
              description: service.description || '',
              cards: service.cards || [],
              imageUrl: service.imageUrl || sectionData.contents[0]?.imageUrl
            }));
          }
          
          // Old single service format
          if (parsedContent.title && parsedContent.description && Array.isArray(parsedContent.cards)) {
            return [{
              id: sectionData.id,
              title: parsedContent.title,
              // Ensure description is properly preserved as HTML
              description: parsedContent.description || '',
              cards: parsedContent.cards,
              imageUrl: parsedContent.imageUrl || sectionData.contents[0]?.imageUrl
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
            
            // Extract description from content
            let description = '';
            if (typeof section.content === 'string') {
              // If the content is already in HTML format, use it directly
              if (section.content.trim().startsWith('<')) {
                // Get the first paragraph or content before first h4 as description
                const tempDiv = document.createElement('div');
                tempDiv.innerHTML = section.content;
                
                // Get the first paragraph or first element if no paragraphs
                const firstParagraph = tempDiv.querySelector('p');
                if (firstParagraph) {
                  // Use the entire paragraph as HTML
                  description = firstParagraph.outerHTML;
                } else {
                  // If no paragraph, take content before first h4 tag or use all content
                  const h4Index = section.content.indexOf('<h4');
                  if (h4Index > 0) {
                    description = section.content.substring(0, h4Index);
                  } else {
                    description = section.content;
                  }
                }
              } else {
                // Plain text content, wrap in paragraph
                description = `<p>${section.content}</p>`;
              }
            }
            
            const result = {
              id: section.id,
              title: section.title,
              description: description,
              cards: cards,
              imageUrl: section.imageUrl || sectionData.contents[0]?.imageUrl
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
  
  // Ensure the first section is selected and the first card of that section is selected
  useEffect(() => {
    if (serviceSections.length > 0) {
      // Set the first section as selected if none is selected
      if (!selectedSectionId) {
        setSelectedSectionId(serviceSections[0].id);
      }
      
      // Set the first card of each section as expanded if none are expanded
      if (Object.keys(expandedCards).length === 0) {
        const initialState: {[key: string]: boolean} = {};
        
        serviceSections.forEach(section => {
          if (section.cards && section.cards.length > 0) {
            initialState[section.cards[0].id] = true;
          }
        });
        
        if (Object.keys(initialState).length > 0) {
          setExpandedCards(initialState);
        }
      }
    }
  }, [serviceSections, expandedCards, selectedSectionId]);
  
  return (
    <section id="services" className={`services-section w-full max-w-full mx-auto ${isRtl ? 'pb-0' : 'pb-8'}`}>
      <style dangerouslySetInnerHTML={{ __html: customStyles }} />
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
            className={`${isRtl ? 'rtl' : 'ltr'}`}
          > 
            <div>
              {content ? (
                <div dangerouslySetInnerHTML={{ __html: content }} />
              ) : (
                <>
                  {serviceSections.length > 0 ? (
                    <>
                      {/* Horizontal section titles */}
                      <div className="w-full max-w-screen-lg mx-auto px-8 py-4">
                        <div className="flex flex-wrap gap-4 justify-center mb-8">
                          {serviceSections.map((section) => (
                            <div 
                              key={`section-title-${section.id}`}
                              onClick={() => setSelectedSectionId(section.id)}
                              className={`cursor-pointer px-4 py-2 rounded-lg transition-all duration-300 ${
                                selectedSectionId === section.id 
                                  ? 'bg-[#DEE4FB] shadow-md font-bold' 
                                  : 'bg-white hover:bg-gray-100 border border-gray-200'
                              }`}
                            >
                              <h2 className="text-md m-0">{section.title}</h2>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Display selected section */}
                      {selectedSectionId && serviceSections.map((section) => (
                        section.id === selectedSectionId && (
                          <div key={section.id}>
                            <div className="w-full flex flex-col md:flex-row gap-4 max-w-screen-lg mx-auto pb-4" style={{ contain: 'paint layout' }}>
                              {/* Image Column */}
                              <div className="flex justify-center">
                                <div className="fixed-image-container">
                                  <Image
                                    src={resolveImagePath(section.imageUrl || t(`images.service${serviceSections.indexOf(section) + 1}` as any) || t('images.default'))}
                                    alt={section.title}
                                    width={500}
                                    height={500}
                                    className="w-full h-full object-cover max-h-[500px]"
                                    onError={handleImageError}
                                    unoptimized={process.env.NODE_ENV === 'production'}
                                    loading="lazy"
                                  />
                                </div>
                              </div>
                              
                              {/* Content Column - Description, Cards */}
                              <div className="md:w-3/4 px-8 md:px-0">
                                {section.description && section.description !== '<p><br></p>' && (
                                  <div className="text-sm text-gray-700 dark:text-gray-300 mb-6 max-w-6xl">
                                    <div dangerouslySetInnerHTML={{ __html: section.description }} />
                                  </div>
                                )}
                                
                                {section.cards && section.cards.length > 0 && (
                                  <div className="flex flex-col md:flex-row gap-6 w-full">
                                    {/* Left side: Vertical list of card titles */}
                                    <div className="w-full md:w-1/3 flex flex-col gap-2 pb-2">
                                      {section.cards.map((card) => (
                                        <div 
                                          key={card.id} 
                                          onClick={() => toggleCard(card.id)}
                                          className={`dark:bg-gray-800 rounded-lg shadow-md border p-2 cursor-pointer transition-all duration-300 ${expandedCards[card.id] ? 'bg-[#DEE4FB] shadow-lg' : 'bg-white border-gray-100 hover:shadow-md'}`}
                                        >
                                          <h3 className={`text-sm font-bold mb-0 ${isRtl ? 'text-right' : 'text-left'}`}>
                                            {card.title}
                                          </h3>
                                        </div>
                                      ))}
                                    </div>
                                    
                                    {/* Right side: Selected card content */}
                                    <div className="hidden md:block w-full dark:bg-gray-800 px-6">
                                      {section.cards.some(card => expandedCards[card.id]) ? (
                                        section.cards.map((card) => (
                                          expandedCards[card.id] && (
                                            <div key={`content-${card.id}`} className="animate-fadeIn">
                                              {card.imageUrl && card.imageUrl.trim() !== '' && (
                                                <div className="mb-4 overflow-hidden rounded-lg">
                                                  <Image
                                                    src={resolveImagePath(card.imageUrl)}
                                                    alt={card.title}
                                                    width={600}
                                                    height={300}
                                                    className="w-full object-contain"
                                                    onError={handleImageError}
                                                    unoptimized={process.env.NODE_ENV === 'production'}
                                                    loading="lazy"
                                                  />
                                                </div>
                                              )}
                                              <div className={`text-sm dark:prose-invert ${isRtl ? 'text-right' : 'text-left'} max-w-none`}>
                                                {typeof card.content === 'string' ? (
                                                  <div dangerouslySetInnerHTML={{ __html: card.content }} />
                                                ) : (
                                                  <p className="m-0">{card.content}</p>
                                                )}
                                              </div>
                                            </div>
                                          )
                                        ))
                                      ) : (
                                        <div className="h-full flex items-center justify-center text-gray-500">
                                          <p>{t('selectCard') || 'Select a card to view content'}</p>
                                        </div>
                                      )}
                                    </div>
                                    
                                    {/* Mobile view: Show expanded content below the card */}
                                    <div className="md:hidden w-full">
                                      {section.cards.map((card) => (
                                        expandedCards[card.id] && (
                                          <div 
                                            key={`mobile-content-${card.id}`} 
                                            className="p-4 mt-2"
                                          >
                                            {card.imageUrl && card.imageUrl.trim() !== '' && (
                                              <div className="mb-4 overflow-hidden rounded-lg">
                                                <Image
                                                  src={resolveImagePath(card.imageUrl)}
                                                  alt={card.title}
                                                  width={400}
                                                  height={200}
                                                  className="w-full object-contain"
                                                  onError={handleImageError}
                                                  unoptimized={process.env.NODE_ENV === 'production'}
                                                  loading="lazy"
                                                />
                                              </div>
                                            )}
                                            <div className={`prose dark:prose-invert ${isRtl ? 'text-right' : 'text-left'} max-w-none`}>
                                              {typeof card.content === 'string' ? (
                                                <div dangerouslySetInnerHTML={{ __html: card.content }} />
                                              ) : (
                                                <p>{card.content}</p>
                                              )}
                                            </div>
                                          </div>
                                        )
                                      ))}
                                    </div>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        )
                      ))}
                    </>
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