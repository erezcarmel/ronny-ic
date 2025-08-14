'use client';

import { useState } from 'react';
import { useRouter } from '@/i18n';
import { useTranslations } from 'next-intl';
import { useForm } from 'react-hook-form';
import { apiService } from '@/lib/utils/api';
import { useParams } from 'next/navigation';
import { Locale } from '@/i18n';

interface LoginFormData {
  email: string;
  password: string;
}

export default function LoginForm() {
  const t = useTranslations('admin.login');
  const router = useRouter();
  const { locale } = useParams() as { locale: Locale };
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>();
  
  const onSubmit = async (data: LoginFormData) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await apiService.auth.login(data.email, data.password);
      
      // Store tokens and user info
      localStorage.setItem('accessToken', response.accessToken);
      localStorage.setItem('refreshToken', response.refreshToken);
      localStorage.setItem('user', JSON.stringify(response.user));
      
      // Redirect to admin dashboard with locale
      router.push(`/${locale}/admin`);
    } catch (err) {
      setError(t('error'));
      console.error('Login error:', err);
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className="bg-white dark:bg-gray-800 shadow rounded-lg px-8 py-10">
      <div className="text-center">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white">{t('title')}</h2>
      </div>
      
      <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)}>
        {error && (
          <div className="bg-red-50 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
            <span className="block sm:inline">{error}</span>
          </div>
        )}
        
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            {t('email')}
          </label>
          <div className="mt-1">
            <input
              id="email"
              type="email"
              autoComplete="email"
              className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
              {...register('email', {
                required: true,
                pattern: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
              })}
            />
            {errors.email && (
              <p className="mt-1 text-sm text-red-600">
                {errors.email.type === 'required' ? 'Email is required' : 'Invalid email address'}
              </p>
            )}
          </div>
        </div>
        
        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            {t('password')}
          </label>
          <div className="mt-1">
            <input
              id="password"
              type="password"
              autoComplete="current-password"
              className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
              {...register('password', { required: true })}
            />
            {errors.password && (
              <p className="mt-1 text-sm text-red-600">Password is required</p>
            )}
          </div>
        </div>
        
        <div>
          <button
            type="submit"
            disabled={isLoading}
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50"
          >
            {isLoading ? '...' : t('submit')}
          </button>
        </div>
      </form>
    </div>
  );
}