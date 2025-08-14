'use client';

import { useEffect, useState } from 'react';
import { useLocale } from '@/i18n/LocaleProvider';
import { getMessages } from '@/i18n/config';
import apiService from '@/lib/utils/api';
import ArticleForm from '@/components/admin/ArticleForm';

interface Article {
  id: string;
  slug: string;
  isPublished: boolean;
  publishDate: string;
  contents: Array<{
    id: string;
    language: string;
    title: string;
    excerpt: string;
    content: string;
    imageUrl?: string;
    pdfUrl?: string;
  }>;
}

export default function ArticlesPage() {
  const { locale } = useLocale();
  const [translations, setTranslations] = useState<any>(null);
  const [articles, setArticles] = useState<Article[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingArticleId, setEditingArticleId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  
  useEffect(() => {
    getMessages(locale).then(messages => {
      setTranslations(messages.admin.articles);
    });
  }, [locale]);
  
  useEffect(() => {
    fetchArticles();
  }, []);
  
  const fetchArticles = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Fetch all articles, regardless of published state
      // Pass undefined for the published parameter to get all articles
      const response = await apiService.articles.getAll(locale, undefined);
      setArticles(response);
      
      setIsLoading(false);
    } catch (error: any) {
      console.error('Error fetching articles:', error);
      setError(error.message || 'Failed to load articles');
      setIsLoading(false);
    }
  };
  
  const handleAddArticle = () => {
    setEditingArticleId(null);
    setShowForm(true);
  };
  
  const handleEditArticle = (id: string) => {
    setEditingArticleId(id);
    setShowForm(true);
  };
  
  const handleDeleteArticle = async (id: string) => {
    if (window.confirm(translations.confirmDelete)) {
      try {
        setIsDeleting(true);
        await apiService.articles.delete(id);
        await fetchArticles();
        setIsDeleting(false);
      } catch (error: any) {
        console.error('Error deleting article:', error);
        setError(error.message || 'Failed to delete article');
        setIsDeleting(false);
      }
    }
  };
  
  const handleTogglePublished = async (article: Article) => {
    try {
      setIsLoading(true);
      // Toggle the published state
      await apiService.articles.update(article.id, {
        isPublished: !article.isPublished
      });
      await fetchArticles();
      setIsLoading(false);
    } catch (error: any) {
      console.error('Error toggling published state:', error);
      setError(error.message || 'Failed to update article');
      setIsLoading(false);
    }
  };
  
  const handleFormSuccess = () => {
    setShowForm(false);
    setEditingArticleId(null);
    fetchArticles();
  };
  
  const handleFormCancel = () => {
    setShowForm(false);
    setEditingArticleId(null);
  };
  
  if (!translations) {
    return <div>Loading...</div>;
  }
  
  return (
    <>
      <h1 className="text-2xl font-semibold text-gray-900 dark:text-white mb-6">
        {translations.title}
      </h1>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}
      
      {showForm ? (
        <ArticleForm 
          articleId={editingArticleId || undefined}
          onCancel={handleFormCancel}
          onSuccess={handleFormSuccess}
        />
      ) : (
        <>
          <div className="mb-6">
            <button 
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md"
              onClick={handleAddArticle}
            >
              {translations.add}
            </button>
          </div>
          
          {isLoading ? (
            <div className="text-center py-8">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-gray-300 border-t-blue-600"></div>
              <p className="mt-2 text-gray-500">{translations.loading}</p>
            </div>
          ) : articles.length === 0 ? (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-8 text-center">
              <p className="text-gray-500 dark:text-gray-400">{translations.noArticles}</p>
            </div>
          ) : (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      {translations.title}
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      {translations.slug}
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      {translations.publishDate}
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
                  {articles.map((article) => {
                    const content = article.contents.find(c => c.language === locale) || article.contents[0];
                    return (
                      <tr key={article.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                          <div className="flex items-center">
                            {content?.title || '—'}
                            {article.isPublished && (
                              <span className="ml-2 px-2 py-0.5 text-xs font-medium bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100 rounded-full">
                                Published
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                          {article.slug}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                          {article.publishDate ? new Date(article.publishDate).toLocaleDateString() : '—'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                          <button 
                            onClick={() => handleTogglePublished(article)}
                            className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                              article.isPublished 
                                ? 'bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100 hover:bg-green-200' 
                                : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300 hover:bg-gray-200'
                            } cursor-pointer`}
                            title={article.isPublished ? 'Click to unpublish' : 'Click to publish'}
                          >
                            {article.isPublished ? translations.yes : translations.no}
                          </button>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex gap-2 items-center">
                            <button 
                              className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300 mr-3"
                              onClick={() => handleEditArticle(article.id)}
                              disabled={isDeleting}
                            >
                              {translations.edit}
                            </button>
                            <button 
                              className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                              onClick={() => handleDeleteArticle(article.id)}
                              disabled={isDeleting}
                            >
                              {translations.delete}
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}
    </>
  );
}