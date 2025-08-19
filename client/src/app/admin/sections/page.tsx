'use client';

import { useEffect, useState } from 'react';
import { useLocale } from '@/i18n/LocaleProvider';
import { getMessages } from '@/i18n/config';
import AboutForm from '@/components/admin/AboutForm';
import ServicesForm from '@/components/admin/ServicesForm';
import apiService from '@/lib/utils/api';

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
  const [translations, setTranslations] = useState<any>(null);
  const [sections, setSections] = useState<Section[]>([
    { id: '1', name: 'Hero Section', type: 'hero', orderIndex: 1, published: true },
    { id: '2', name: 'About Section', type: 'about', orderIndex: 2, published: true },
    { id: '3', name: 'Services Section', type: 'services', orderIndex: 3, published: true }
  ]);
  
  // State for modal management
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState<'about' | 'services' | 'hero' | null>(null);
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
        console.log('Fetched sections:', data);
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
  
  const handleAddSection = () => {
    // For simplicity, we'll just open the About form for now
    setCurrentSection(null);
    setModalType('about');
    setIsModalOpen(true);
  };
  
  const handleEditSection = async (section: Section) => {
    setIsLoading(true);
    try {
      // Fetch the full section data with all language contents
      const sectionData = await apiService.sections.getById(section.id, undefined, true);
      console.log('Fetched section data:', sectionData);
      
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
        apiData = {
          name: currentSection.name,
          type: currentSection.type,
          orderIndex: currentSection.orderIndex,
          isPublished: formData.published,
          contents: [] as any[]
        };
        
        console.log('Updating existing section:', currentSection.id, currentSection.type);
        console.log('Form data:', formData);
        
        // Handle different section types
        if (currentSection.type === 'services') {
          // For services, use the contents directly from the form
          if (formData.contents) {
            apiData.contents = formData.contents;
            console.log('Using services contents from form:', apiData.contents);
          } else {
            console.warn('No contents found in form data for services!');
          }
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
        console.log('Updated section:', result);
        
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
        apiData = {
          name: modalType === 'about' ? 'About Section' : 'New Section',
          type: modalType || 'about',
          orderIndex: sections.length + 1,
          isPublished: formData.published,
          contents: [] as any[]
        };
        
        console.log('Creating new section with type:', modalType);
        console.log('Form data:', formData);
        
        // Handle different section types
        if (modalType === 'services') {
          // For services, use the contents directly from the form
          if (formData.contents) {
            apiData.contents = formData.contents;
            console.log('Using services contents from form:', apiData.contents);
          } else {
            console.warn('No contents found in form data for services!');
          }
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
        console.log('Created section:', result);
        
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
  
  if (!translations) {
    return <div>Loading...</div>;
  }
  
  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
      </div>
    );
  }
  
  return (
    <>
      <h1 className="text-2xl font-semibold text-gray-900 dark:text-white mb-6">
        {translations.title}
      </h1>
      
      <div className="mb-6">
        <button 
          onClick={handleAddSection}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md"
        >
          {translations.add}
        </button>
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
              {modalType === 'hero' && (
                <div>
                  <h2 className="text-xl font-semibold mb-6">Edit Hero Section</h2>
                  <p>Hero section editor not implemented yet.</p>
                  <div className="flex justify-end mt-6">
                    <button 
                      onClick={handleFormCancel}
                      className="bg-gray-300 hover:bg-gray-400 text-gray-800 px-4 py-2 rounded-md"
                    >
                      {translations.cancel}
                    </button>
                  </div>
                </div>
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