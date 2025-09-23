'use client';

import { useEffect, useState } from 'react';
import { useLocale } from '@/i18n/LocaleProvider';
import { getMessages } from '@/i18n/config';
import AboutForm from '@/components/admin/AboutForm';
import ServicesForm from '@/components/admin/ServicesForm';
import HeroForm from '@/components/admin/HeroForm';
import HeaderForm from '@/components/admin/HeaderForm';
import apiService from '@/lib/utils/api';
import useAuthProtection from '@/lib/hooks/useAuthProtection';

// Define section types
interface Section {
  id: string;
  name: string;
  type: string;
  orderIndex: number;
  published: boolean;
  content?: any;
}

export default function SectionsPage() {
  const { locale } = useLocale();
  const { isAuthenticated, isLoading: authLoading } = useAuthProtection();
  const [translations, setTranslations] = useState<any>(null);
  const [sections, setSections] = useState<Section[]>([
    { id: '1', name: 'Header', type: 'header', orderIndex: 0, published: true },
    { id: '2', name: 'Hero Section', type: 'hero', orderIndex: 1, published: true },
    { id: '3', name: 'About Section', type: 'about', orderIndex: 2, published: true },
    { id: '4', name: 'Services Section', type: 'services', orderIndex: 3, published: true }
  ]);
  
  // State for modal management
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState<'about' | 'services' | 'hero' | 'header' | null>(null);
  const [currentSection, setCurrentSection] = useState<Section | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [sectionToDelete, setSectionToDelete] = useState<Section | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  
  useEffect(() => {
    getMessages(locale).then(messages => {
      setTranslations(messages.admin.sections);
    });
    
    // Fetch sections from the API
    setIsLoading(true);
    apiService.sections.getAll()
      .then(data => {
        if (Array.isArray(data)) {
          setSections(data.map(section => ({
            id: section.id,
            name: section.name,
            type: section.type,
            orderIndex: section.orderIndex,
            published: section.isPublished,
            content: section
          })));
        }
      })
      .catch(error => console.error('Error fetching sections:', error))
      .finally(() => setIsLoading(false));
  }, [locale]);
  
  // This function is no longer used - we're using the dropdown buttons instead
  const handleAddSection = () => {
    document.getElementById('sectionDropdown')?.classList.toggle('hidden');
  };
  
  const handleEditSection = async (section: Section) => {
    setIsLoading(true);
    try {
      // Fetch the full section data with all language contents
      const sectionData = await apiService.sections.getById(section.id, undefined, true);
      
      setCurrentSection({
        ...section,
        content: sectionData
      });
      setModalType(section.type as 'about' | 'services' | 'hero');
      setIsModalOpen(true);
    } catch (error) {
      console.error('Error fetching section data:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleDeleteClick = (section: Section) => {
    setSectionToDelete(section);
    setIsDeleteModalOpen(true);
  };
  
  const handleDeleteConfirm = async () => {
    if (!sectionToDelete) return;
    
    setIsLoading(true);
    try {
      // In a real application, you would call the API
      // await apiService.sections.delete(sectionToDelete.id);
      
      // For now, we'll just update the local state
      setSections(sections.filter(s => s.id !== sectionToDelete.id));
      setIsDeleteModalOpen(false);
      setSectionToDelete(null);
    } catch (error) {
      console.error('Error deleting section:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleFormSubmit = async (formData: any) => {
    setIsLoading(true);
    try {
      // Prepare the data for API
      let apiData;
      
      if (currentSection) {
        // Update existing section
        let sectionName = currentSection.name;
        
        // Ensure header sections always have the correct name
        if (currentSection.type === 'header' && sectionName !== 'Header') {
          sectionName = 'Header';
        }
        
        apiData = {
          name: sectionName,
          type: currentSection.type,
          orderIndex: currentSection.orderIndex,
          isPublished: formData.published,
          contents: [] as any[]
        };
        
        // Handle different section types
        if (currentSection.type === 'services') {
          // For services, use the contents directly from the form
          if (formData.contents) {
            apiData.contents = formData.contents;
          } else {
            console.warn('No contents found in form data for services!');
          }
        } else if (currentSection.type === 'hero') {
          // For hero section, use the hero-specific format
          apiData.contents = formData.contents || [
            {
              language: 'en',
              title: formData.titleEn || 'Hero Title',
              subtitle: formData.subtitleEn || 'Hero Subtitle',
              bottomSubtitle: formData.bottomSubtitleEn || '',
              content: formData.buttonTextEn || 'Contact Me',
              imageUrl: formData.imageUrl
            },
            {
              language: 'he',
              title: formData.titleHe || 'כותרת ראשית',
              subtitle: formData.subtitleHe || 'כותרת משנה',
              bottomSubtitle: formData.bottomSubtitleHe || '',
              content: formData.buttonTextHe || 'צור קשר',
              imageUrl: formData.imageUrl
            }
          ];
        } else if (currentSection.type === 'header') {
          // For header section
          apiData.contents = formData.contents || [
            {
              language: 'en',
              title: formData.titleEn || 'Ronny Iss-Carmel',
              subtitle: formData.subtitleEn || 'Thoughts and Feelings Psychotherapy',
              imageUrl: formData.imageUrl
            },
            {
              language: 'he',
              title: formData.titleHe || 'רוני איס-כרמל',
              subtitle: formData.subtitleHe || 'פסיכותרפיה מחשבות ורגשות',
              imageUrl: formData.imageUrl
            }
          ];
        } else {
          // For other section types, use the old format
          apiData.contents = [
            {
              language: 'en',
              title: currentSection.type === 'about' ? 'About Me' : currentSection.name,
              content: formData.contentEn,
              imageUrl: formData.imageUrl
            },
            {
              language: 'he',
              title: currentSection.type === 'about' ? 'קצת עליי' : currentSection.name,
              content: formData.contentHe,
              imageUrl: formData.imageUrl
            }
          ];
        }
        
        // Call the API
        const result = await apiService.sections.update(currentSection.id, apiData);
        
        // Update local state
        setSections(sections.map(s => 
          s.id === currentSection.id ? {
            ...s,
            published: formData.published,
            content: result
          } : s
        ));
      } else {
        // Create new section
        let sectionName = 'New Section';
        if (modalType === 'about') sectionName = 'About Section';
        if (modalType === 'hero') sectionName = 'Hero Section';
        if (modalType === 'services') sectionName = 'Services Section';
        if (modalType === 'header') sectionName = 'Header';
        
        apiData = {
          name: sectionName,
          type: modalType || 'about',
          orderIndex: sections.length + 1,
          isPublished: formData.published,
          contents: [] as any[]
        };
        
        // Handle different section types
        if (modalType === 'services') {
          // For services, use the contents directly from the form
          if (formData.contents) {
            apiData.contents = formData.contents;
          } else {
            console.warn('No contents found in form data for services!');
          }
        } else if (modalType === 'hero') {
          // For hero section, use the hero-specific format
          apiData.contents = formData.contents || [
            {
              language: 'en',
              title: formData.titleEn || 'Hero Title',
              subtitle: formData.subtitleEn || 'Hero Subtitle',
              bottomSubtitle: formData.bottomSubtitleEn || '',
              content: formData.buttonTextEn || 'Contact Me',
              imageUrl: formData.imageUrl
            },
            {
              language: 'he',
              title: formData.titleHe || 'כותרת ראשית',
              subtitle: formData.subtitleHe || 'כותרת משנה',
              bottomSubtitle: formData.bottomSubtitleHe || '',
              content: formData.buttonTextHe || 'צור קשר',
              imageUrl: formData.imageUrl
            }
          ];
        } else if (modalType === 'header') {
          // For header section
          apiData.contents = formData.contents || [
            {
              language: 'en',
              title: formData.titleEn || 'Ronny Iss-Carmel',
              subtitle: formData.subtitleEn || 'Thoughts and Feelings Psychotherapy',
              imageUrl: formData.imageUrl
            },
            {
              language: 'he',
              title: formData.titleHe || 'רוני איס-כרמל',
              subtitle: formData.subtitleHe || 'פסיכותרפיה מחשבות ורגשות',
              imageUrl: formData.imageUrl
            }
          ];
        } else {
          // For other section types, use the old format
          apiData.contents = [
            {
              language: 'en',
              title: modalType === 'about' ? 'About Me' : 'New Section',
              content: formData.contentEn,
              imageUrl: formData.imageUrl
            },
            {
              language: 'he',
              title: modalType === 'about' ? 'קצת עליי' : 'מקטע חדש',
              content: formData.contentHe,
              imageUrl: formData.imageUrl
            }
          ];
        }
        
        // Call the API
        const result = await apiService.sections.create(apiData);
        
        // Update local state
        const newSection = {
          id: result.id,
          name: result.name,
          type: result.type,
          orderIndex: result.orderIndex,
          published: result.isPublished,
          content: result
        };
        setSections([...sections, newSection]);
      }
      
      setIsModalOpen(false);
      setCurrentSection(null);
    } catch (error) {
      console.error('Error saving section:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleFormCancel = () => {
    setIsModalOpen(false);
    setCurrentSection(null);
  };
  
  // Show loading state while checking auth or loading translations
  if (authLoading || !translations || isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
      </div>
    );
  }
  
  // If not authenticated, the useAuthProtection hook will redirect to login
  
  return (
    <>
      <h1 className="text-2xl font-semibold text-gray-900 dark:text-white mb-6">
        {translations.title}
      </h1>
      
      <div className="mb-6 flex space-x-3">
        <div className="dropdown relative">
          <button 
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md flex items-center"
            onClick={() => {
              const dropdown = document.getElementById('sectionDropdown');
              if (dropdown) {
                dropdown.classList.toggle('hidden');
              }
            }}
          >
            {translations.add} <span className="ml-1">▼</span>
          </button>
          <div 
            id="sectionDropdown" 
            className="hidden absolute z-10 mt-1 w-48 bg-white dark:bg-gray-800 rounded-md shadow-lg py-1"
          >
                          <button 
              onClick={() => {
                document.getElementById('sectionDropdown')?.classList.add('hidden');
                setCurrentSection(null);
                setModalType('header');
                setIsModalOpen(true);
              }}
              className="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              Header
            </button>
            <button 
              onClick={() => {
                document.getElementById('sectionDropdown')?.classList.add('hidden');
                setCurrentSection(null);
                setModalType('hero');
                setIsModalOpen(true);
              }}
              className="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              Hero Section
            </button>
            <button 
              onClick={() => {
                document.getElementById('sectionDropdown')?.classList.add('hidden');
                setCurrentSection(null);
                setModalType('about');
                setIsModalOpen(true);
              }}
              className="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              About Section
            </button>
            <button 
              onClick={() => {
                document.getElementById('sectionDropdown')?.classList.add('hidden');
                setCurrentSection(null);
                setModalType('services');
                setIsModalOpen(true);
              }}
              className="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              Services Section
            </button>
          </div>
        </div>
      </div>
      
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-700">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                {translations.name}
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                {translations.type}
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                {translations.orderIndex}
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                {translations.published}
              </th>
              <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
            {sections.map(section => (
              <tr key={section.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                  {section.name}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                  {section.type}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                  {section.orderIndex}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                    section.published 
                      ? 'bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100' 
                      : 'bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-100'
                  }`}>
                    {section.published ? 'Yes' : 'No'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button 
                    onClick={() => handleEditSection(section)}
                    className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300 mx-3"
                  >
                    {translations.edit}
                  </button>
                  <button 
                    onClick={() => handleDeleteClick(section)}
                    className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                  >
                    {translations.delete}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      {/* Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              {modalType === 'about' && (
                <AboutForm 
                  initialData={currentSection?.content} 
                  onSubmit={handleFormSubmit} 
                  onCancel={handleFormCancel} 
                />
              )}
              {modalType === 'services' && (
                <ServicesForm 
                  initialData={currentSection?.content} 
                  onSubmit={handleFormSubmit} 
                  onCancel={handleFormCancel} 
                />
              )}
              {modalType === 'header' && (
                <HeaderForm 
                  initialData={currentSection?.content} 
                  onSubmit={handleFormSubmit} 
                  onCancel={handleFormCancel} 
                />
              )}
              {modalType === 'hero' && (
                <HeroForm 
                  initialData={currentSection?.content} 
                  onSubmit={handleFormSubmit} 
                  onCancel={handleFormCancel} 
                />
              )}
            </div>
          </div>
        </div>
      )}
      
      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full p-6">
            <h3 className="text-lg font-medium mb-4">
              {translations.confirmDelete}
            </h3>
            <p className="mb-6">
              Are you sure you want to delete {sectionToDelete?.name}? This action cannot be undone.
            </p>
            <div className="flex justify-end space-x-4">
              <button
                onClick={() => setIsDeleteModalOpen(false)}
                className="bg-gray-300 hover:bg-gray-400 text-gray-800 px-4 py-2 rounded-md"
                disabled={isLoading}
              >
                {translations.cancel}
              </button>
              <button
                onClick={handleDeleteConfirm}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md"
                disabled={isLoading}
              >
                {isLoading ? 'Deleting...' : translations.delete}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}