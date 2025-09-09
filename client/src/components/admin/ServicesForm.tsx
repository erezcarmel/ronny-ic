'use client';

import { useState, useEffect } from 'react';
import { useLocale } from '@/i18n/LocaleProvider';
import { getMessages } from '@/i18n/config';
import dynamic from 'next/dynamic';
import Image from 'next/image';
import apiService from '@/lib/utils/api';

// Dynamically import the rich text editor to avoid SSR issues
const ReactQuill = dynamic(() => import('react-quill'), { ssr: false });
import 'react-quill/dist/quill.snow.css';

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

interface ServicesFormProps {
  initialData?: any;
  onSubmit: (data: any) => void;
  onCancel: () => void;
}

export default function ServicesForm({ initialData, onSubmit, onCancel }: ServicesFormProps) {
  const { locale } = useLocale();
  const [translations, setTranslations] = useState<any>(null);
  const [isRtl, setIsRtl] = useState(false);
  
  useEffect(() => {
    if (initialData?.contents) {
      initialData.contents.forEach((content: any, index: number) => {
        if (content.content) {
          try {
            const parsedContent = JSON.parse(content.content);
          } catch (e) {
            console.error(`Error parsing content ${index}:`, e);
          }
        }
      });
    }
  }, [initialData]);
  
  // Default sections if none provided
  const defaultSections = {
    en: [
      {
        id: 'therapy',
        title: 'Therapy Services',
        description: 'Our therapy services include various approaches tailored to your needs.',
        cards: [
          {
            id: 'therapy-1',
            title: 'Individual Therapy',
            content: '<p>One-on-one therapy sessions focused on your specific needs.</p>',
            imageUrl: ''
          },
          {
            id: 'therapy-2',
            title: 'Group Therapy',
            content: '<p>Supportive group environment for shared experiences.</p>',
            imageUrl: ''
          }
        ]
      },
      {
        id: 'diagnostics',
        title: 'Diagnostics Services',
        description: 'Comprehensive diagnostic services to identify your needs.',
        cards: [
          {
            id: 'diagnostics-1',
            title: 'Psychological Assessment',
            content: '<p>Complete psychological evaluation and testing.</p>',
            imageUrl: ''
          },
          {
            id: 'diagnostics-2',
            title: 'Educational Assessment',
            content: '<p>Assessment of learning abilities and challenges.</p>',
            imageUrl: ''
          }
        ]
      }
    ],
    he: [
      {
        id: 'therapy',
        title: 'שירותי טיפול',
        description: 'שירותי הטיפול שלנו כוללים גישות שונות המותאמות לצרכים שלך.',
        cards: [
          {
            id: 'therapy-1',
            title: 'טיפול אישי',
            content: '<p>פגישות טיפול אישיות המתמקדות בצרכים הספציפיים שלך.</p>',
            imageUrl: ''
          },
          {
            id: 'therapy-2',
            title: 'טיפול קבוצתי',
            content: '<p>סביבה קבוצתית תומכת לחוויות משותפות.</p>',
            imageUrl: ''
          }
        ]
      },
      {
        id: 'diagnostics',
        title: 'שירותי אבחון',
        description: 'שירותי אבחון מקיפים לזיהוי הצרכים שלך.',
        cards: [
          {
            id: 'diagnostics-1',
            title: 'הערכה פסיכולוגית',
            content: '<p>הערכה פסיכולוגית מלאה ובדיקות.</p>',
            imageUrl: ''
          },
          {
            id: 'diagnostics-2',
            title: 'הערכה חינוכית',
            content: '<p>הערכה של יכולות למידה ואתגרים.</p>',
            imageUrl: ''
          }
        ]
      }
    ]
  };
  
  // Parse content from initialData if it exists
  const parseServiceSections = (language: string) => {
    if (!initialData) return language === 'en' ? defaultSections.en : defaultSections.he;
    
    // Check if we have contents array (from API)
    if (initialData.contents && Array.isArray(initialData.contents)) {
      const content = initialData.contents.find((c: any) => c.language === language);
      if (content?.content) {
        try {
          const parsedContent = JSON.parse(content.content);
          
          // Check if the content is in the new format with services array
          if (parsedContent && typeof parsedContent === 'object' && !Array.isArray(parsedContent)) {
            // New format with multiple services
            if (parsedContent.services && Array.isArray(parsedContent.services)) {
              return parsedContent.services.map((service: any, index: number) => ({
                id: `service-${initialData.id}-${index}` || `service-${Date.now()}-${index}`,
                title: service.title,
                description: service.description,
                cards: service.cards || []
              }));
            }
            
            // Old single service format
            if (parsedContent.title && parsedContent.description && Array.isArray(parsedContent.cards)) {
              return [{
                id: initialData.id || `service-${Date.now()}`,
                title: parsedContent.title,
                description: parsedContent.description,
                cards: parsedContent.cards
              }];
            }
          }
          
          // Check if the parsed content is an array with the new structure with cards
          if (Array.isArray(parsedContent) && parsedContent.length > 0) {
            if (parsedContent[0].cards) {
              return parsedContent;
            }
            
            // Convert old format to new format
            return parsedContent.map((section: any) => {
              // Extract sub-items from content if it's HTML
              const subItems = [];
              if (typeof section.content === 'string' && section.content.includes('<h4')) {
                const tempDiv = document.createElement('div');
                tempDiv.innerHTML = section.content;
                
                const h4Elements = tempDiv.querySelectorAll('h4');
                h4Elements.forEach((h4, index) => {
                  const title = h4.textContent || `Item ${index + 1}`;
                  let content = '';
                  
                  // Get content after this h4 until the next h4 or end
                  let currentNode = h4.nextSibling;
                  while (currentNode && currentNode.nodeName !== 'H4') {
                    if (currentNode.nodeType === Node.ELEMENT_NODE) {
                      content += (currentNode as Element).outerHTML;
                    } else if (currentNode.nodeType === Node.TEXT_NODE) {
                      content += currentNode.textContent;
                    }
                    currentNode = currentNode.nextSibling;
                  }
                  
                  subItems.push({
                    id: `${section.id}-item-${index + 1}`,
                    title,
                    content,
                    imageUrl: ''
                  });
                });
              }
              
              // If no sub-items were found, create a default one
              if (subItems.length === 0) {
                subItems.push({
                  id: `${section.id}-item-1`,
                  title: section.title,
                  content: typeof section.content === 'string' ? section.content : '<p>No content</p>',
                  imageUrl: ''
                });
              }
              
              return {
                id: section.id,
                title: section.title,
                description: typeof section.content === 'string' 
                  ? section.content.split('</p>')[0].replace(/<\/?[^>]+(>|$)/g, '') 
                  : '',
                cards: subItems
              };
            });
          }
        } catch (e) {
          console.error('Error parsing services content:', e);
        }
      }
    }
    
    // Fallback to direct properties
    const fallback = language === 'en' 
      ? (initialData.sectionsEn || defaultSections.en) 
      : (initialData.sectionsHe || defaultSections.he);
    return fallback;
  };
  
  const [formData, setFormData] = useState({
    id: initialData?.id || '',
    sectionsEn: parseServiceSections('en'),
    sectionsHe: parseServiceSections('he'),
    published: initialData?.isPublished ?? initialData?.published ?? true,
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState<'en' | 'he'>('en');
  const [activeSectionIndex, setActiveSectionIndex] = useState(0);
  const [activeCardIndex, setActiveCardIndex] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  
  useEffect(() => {
    getMessages(locale).then(messages => {
      setTranslations(messages.admin.sections);
      setIsRtl(locale === 'he');
    });
  }, [locale]);
  
  const handleSectionChange = (sectionIndex: number, field: string, value: string) => {
    const currentLang = activeTab;
    const sections = currentLang === 'en' ? [...formData.sectionsEn] : [...formData.sectionsHe];
    
    sections[sectionIndex] = {
      ...sections[sectionIndex],
      [field]: value
    };
    
    if (currentLang === 'en') {
      setFormData(prev => ({ ...prev, sectionsEn: sections }));
    } else {
      setFormData(prev => ({ ...prev, sectionsHe: sections }));
    }
  };
  
  const handleAddSection = () => {
    const currentLang = activeTab;
    const sections = currentLang === 'en' ? [...formData.sectionsEn] : [...formData.sectionsHe];
    
    const newSection = {
      id: `section-${Date.now()}`,
      title: currentLang === 'en' ? 'New Section' : 'מקטע חדש',
      description: currentLang === 'en' ? 'Section description' : 'תיאור המקטע',
      cards: [
        {
          id: `card-${Date.now()}`,
          title: currentLang === 'en' ? 'New Card' : 'כרטיס חדש',
          content: '<p>Content goes here</p>',
          imageUrl: ''
        }
      ]
    };
    
    sections.push(newSection);
    
    if (currentLang === 'en') {
      setFormData(prev => ({ ...prev, sectionsEn: sections }));
    } else {
      setFormData(prev => ({ ...prev, sectionsHe: sections }));
    }
    
    // Set the new section as active
    setActiveSectionIndex(sections.length - 1);
    setActiveCardIndex(0);
  };
  
  const handleRemoveSection = (sectionIndex: number) => {
    const currentLang = activeTab;
    const sections = currentLang === 'en' ? [...formData.sectionsEn] : [...formData.sectionsHe];
    
    if (sections.length <= 1) {
      alert('You must have at least one section');
      return;
    }
    
    sections.splice(sectionIndex, 1);
    
    if (currentLang === 'en') {
      setFormData(prev => ({ ...prev, sectionsEn: sections }));
    } else {
      setFormData(prev => ({ ...prev, sectionsHe: sections }));
    }
    
    // Adjust active section index if needed
    if (activeSectionIndex >= sections.length) {
      setActiveSectionIndex(sections.length - 1);
    }
    setActiveCardIndex(0);
  };
  
  const handleAddCard = () => {
    const currentLang = activeTab;
    const sections = currentLang === 'en' ? [...formData.sectionsEn] : [...formData.sectionsHe];
    const section = sections[activeSectionIndex];
    
    if (!section.cards) {
      section.cards = [];
    }
    
    const newCard = {
      id: `card-${Date.now()}`,
      title: currentLang === 'en' ? 'New Card' : 'כרטיס חדש',
      content: '<p>Content goes here</p>',
      imageUrl: ''
    };
    
    section.cards.push(newCard);
    
    if (currentLang === 'en') {
      setFormData(prev => ({ ...prev, sectionsEn: sections }));
    } else {
      setFormData(prev => ({ ...prev, sectionsHe: sections }));
    }
    
    // Set the new card as active
    setActiveCardIndex(section.cards.length - 1);
  };
  
  const handleRemoveCard = (cardIndex: number) => {
    const currentLang = activeTab;
    const sections = currentLang === 'en' ? [...formData.sectionsEn] : [...formData.sectionsHe];
    const section = sections[activeSectionIndex];
    
    if (!section.cards) {
      return;
    }
    
    // Remove the card
    section.cards.splice(cardIndex, 1);
    
    if (currentLang === 'en') {
      setFormData(prev => ({ ...prev, sectionsEn: sections }));
    } else {
      setFormData(prev => ({ ...prev, sectionsHe: sections }));
    }
    
    // Adjust active card index if needed
    if (section.cards.length === 0) {
      setActiveCardIndex(-1); // No cards left
    } else if (activeCardIndex >= section.cards.length) {
      setActiveCardIndex(section.cards.length - 1);
    }
  };
  
  const handleCardChange = (cardIndex: number, field: string, value: string) => {
    const currentLang = activeTab;
    const sections = currentLang === 'en' ? [...formData.sectionsEn] : [...formData.sectionsHe];
    const section = sections[activeSectionIndex];
    
    if (!section.cards) {
      section.cards = [];
      return;
    }
    
    section.cards[cardIndex] = {
      ...section.cards[cardIndex],
      [field]: value
    };
    
    if (currentLang === 'en') {
      setFormData(prev => ({ ...prev, sectionsEn: sections }));
    } else {
      setFormData(prev => ({ ...prev, sectionsHe: sections }));
    }
  };
  
  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    setIsUploading(true);
    
    try {
      const response = await apiService.sections.uploadFile(file);
      
      if (response && response.url) {
        // Update the card with the new image URL
        handleCardChange(activeCardIndex, 'imageUrl', response.url);
      }
    } catch (error) {
      console.error('Error uploading image:', error);
      alert('Failed to upload image. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };
  
  const handleRemoveImage = () => {
    handleCardChange(activeCardIndex, 'imageUrl', '');
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      // Format the data for the API with the new structure
      const apiData = {
        id: formData.id,
        published: formData.published,
        contents: [
          {
            language: 'en',
            title: 'Services',
            subtitle: 'Our Services',
            content: JSON.stringify({
              title: 'Services',
              description: 'Our Services',
              services: formData.sectionsEn.map((section: ServiceSection) => ({
                title: section.title,
                description: section.description,
                cards: section.cards || []
              }))
            })
          },
          {
            language: 'he',
            title: 'שירותים',
            subtitle: 'השירותים שלנו',
            content: JSON.stringify({
              title: 'שירותים',
              description: 'השירותים שלנו',
              services: formData.sectionsHe.map((section: ServiceSection) => ({
                title: section.title,
                description: section.description,
                cards: section.cards || []
              }))
            })
          }
        ]
      };
      
      await onSubmit(apiData);
    } catch (error) {
      console.error('Error submitting form:', error);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const currentSections = activeTab === 'en' ? formData.sectionsEn : formData.sectionsHe;
  
  if (!translations) {
    return <div>Loading...</div>;
  }
  
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
      <h2 className="text-xl font-semibold mb-6">
        {initialData?.id ? 'Edit Services Section' : 'Add Services Section'}
      </h2>
      
      <form onSubmit={handleSubmit}>
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
        </div>
        
        {/* General Section Information */}
        <div className="mb-8 border-b pb-6">
          <h3 className="text-lg font-medium mb-4">General Section Information</h3>
          <div className="mb-4">
            <label className="block text-gray-700 dark:text-gray-300 mb-2">
              Section Title
            </label>
            <input
              type="text"
              value={activeTab === 'en' ? 'Services' : 'שירותים'}
              disabled
              className="form-input w-full bg-gray-100"
            />
            <p className="text-sm text-gray-500 mt-1">This is the main section title that appears on the page.</p>
          </div>
          
          <div className="mb-4">
            <label className="block text-gray-700 dark:text-gray-300 mb-2">
              Section Description
            </label>
            <textarea
              value={activeTab === 'en' ? 'Our Services' : 'השירותים שלנו'}
              disabled
              className="form-textarea w-full bg-gray-100"
              rows={2}
            />
            <p className="text-sm text-gray-500 mt-1">This is the general description for the services section.</p>
          </div>
        </div>
        
        <div className="grid grid-cols-12 gap-6">
          {/* Sidebar with service navigation */}
          <div className="col-span-3 border-r">
            <div className="flex justify-between items-center mb-2">
              <h3 className="font-medium">Services</h3>
              <button
                type="button"
                onClick={handleAddSection}
                className="text-sm text-blue-600 hover:text-blue-800"
              >
                + Add Service
              </button>
            </div>
            <ul className="space-y-2">
              {currentSections.map((section: ServiceSection, index: number) => (
                <li key={section.id} className="flex justify-between items-center">
                  <button
                    type="button"
                    className={`text-left px-3 py-2 rounded flex-grow ${activeSectionIndex === index ? 'bg-blue-100 dark:bg-blue-900' : 'hover:bg-gray-100 dark:hover:bg-gray-700'}`}
                    onClick={() => setActiveSectionIndex(index)}
                  >
                    {section.title}
                  </button>
                  <button
                    type="button"
                    onClick={() => handleRemoveSection(index)}
                    className="text-red-500 hover:text-red-700 ml-2"
                  >
                    &times;
                  </button>
                </li>
              ))}
            </ul>
          </div>
          
          {/* Main content editor */}
          <div className="col-span-9">
            {currentSections[activeSectionIndex] && (
              <div>
                {/* Service Title and Description */}
                <div className="mb-4">
                  <label className="block text-gray-700 dark:text-gray-300 mb-2">
                    Service Title
                  </label>
                  <input
                    type="text"
                    value={currentSections[activeSectionIndex].title}
                    onChange={(e) => handleSectionChange(activeSectionIndex, 'title', e.target.value)}
                    className="form-input w-full"
                    placeholder="Enter service title"
                  />
                </div>
                
                <div className="mb-6">
                  <label className="block text-gray-700 dark:text-gray-300 mb-2">
                    Service Description
                  </label>
                  <div className="prose-editor" dir={activeTab === 'he' ? 'rtl' : 'ltr'}>
                    <ReactQuill
                      value={currentSections[activeSectionIndex].description || ''}
                      onChange={(value) => handleSectionChange(activeSectionIndex, 'description', value)}
                      modules={{
                        toolbar: [
                          [{ 'header': [1, 2, 3, false] }],
                          ['bold', 'italic', 'underline'],
                          [{ 'list': 'ordered'}, { 'list': 'bullet' }],
                          ['link'],
                          ['clean']
                        ],
                      }}
                      placeholder="Enter service description"
                    />
                  </div>
                  <p className="text-sm text-gray-500 mt-1">This description will appear at the top of the service section.</p>
                </div>
                
                <hr className="my-6" />
                
                {/* Cards Management */}
                <div className="mb-4">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-medium">Service Cards</h3>
                    <button
                      type="button"
                      onClick={handleAddCard}
                      className="text-sm text-blue-600 hover:text-blue-800"
                    >
                      + Add Card
                    </button>
                  </div>
                  
                  {/* Cards Navigation */}
                  {currentSections[activeSectionIndex].cards && currentSections[activeSectionIndex].cards.length > 0 ? (
                    <div className="flex flex-wrap gap-2 mb-4">
                      {currentSections[activeSectionIndex].cards.map((card: ServiceCard, index: number) => (
                        <button
                          key={card.id}
                          type="button"
                          className={`px-3 py-1 text-sm rounded ${
                            activeCardIndex === index 
                              ? 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200' 
                              : 'bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600'
                          }`}
                          onClick={() => setActiveCardIndex(index)}
                        >
                          {card.title || `Card ${index + 1}`}
                        </button>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500 dark:text-gray-400 mb-4">No cards yet. Cards are optional - you can add cards or leave this service with just a title and description.</p>
                  )}
                  
                  {/* Active Card Editor */}
                  {currentSections[activeSectionIndex].cards && 
                   currentSections[activeSectionIndex].cards.length > 0 &&
                   currentSections[activeSectionIndex].cards[activeCardIndex] && (
                    <div className="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                      <div className="mb-4">
                        <div className="flex justify-between items-center mb-2">
                          <label className="block text-gray-700 dark:text-gray-300">
                            Card Title
                          </label>
                          <button
                            type="button"
                            onClick={() => handleRemoveCard(activeCardIndex)}
                            className="text-red-500 hover:text-red-700"
                          >
                            Remove Card
                          </button>
                        </div>
                        <input
                          type="text"
                          value={currentSections[activeSectionIndex].cards[activeCardIndex].title}
                          onChange={(e) => handleCardChange(activeCardIndex, 'title', e.target.value)}
                          className="form-input w-full"
                        />
                      </div>
                      
                      {/* Image Upload */}
                      <div className="mb-4">
                        <label className="block text-gray-700 dark:text-gray-300 mb-2">
                          Card Image
                        </label>
                        {currentSections[activeSectionIndex].cards[activeCardIndex].imageUrl ? (
                          <div className="mb-2">
                            <div className="relative w-full h-40 bg-gray-100 dark:bg-gray-700 rounded overflow-hidden mb-2">
                              <Image
                                src={currentSections[activeSectionIndex].cards[activeCardIndex].imageUrl}
                                alt={currentSections[activeSectionIndex].cards[activeCardIndex].title}
                                fill
                                className="object-cover"
                              />
                            </div>
                            <button
                              type="button"
                              onClick={handleRemoveImage}
                              className="text-red-500 hover:text-red-700 text-sm"
                            >
                              Remove Image
                            </button>
                          </div>
                        ) : (
                          <div className="flex items-center justify-center w-full">
                            <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 dark:hover:bg-gray-700 hover:bg-gray-100 dark:border-gray-600 dark:bg-gray-700">
                              <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                <svg className="w-8 h-8 mb-3 text-gray-500 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                                </svg>
                                <p className="mb-1 text-sm text-gray-500 dark:text-gray-400">
                                  {isUploading ? 'Uploading...' : 'Click to upload image'}
                                </p>
                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                  PNG, JPG or GIF
                                </p>
                              </div>
                              <input 
                                type="file" 
                                className="hidden" 
                                accept="image/*" 
                                onChange={handleImageUpload}
                                disabled={isUploading}
                              />
                            </label>
                          </div>
                        )}
                      </div>
                      
                      {/* Card Content */}
                      <div className="mb-4">
                        <label className="block text-gray-700 dark:text-gray-300 mb-2">
                          Card Content
                        </label>
                        <div className="prose-editor" dir={activeTab === 'he' ? 'rtl' : 'ltr'}>
                          <ReactQuill
                            value={currentSections[activeSectionIndex].cards[activeCardIndex].content}
                            onChange={(value) => handleCardChange(activeCardIndex, 'content', value)}
                            modules={{
                              toolbar: [
                                [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
                                ['bold', 'italic', 'underline', 'strike'],
                                [{ 'list': 'ordered'}, { 'list': 'bullet' }],
                                ['link'],
                                ['clean']
                              ],
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
        
        <div className="mt-6 mb-6">
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
