'use client';

import { useEffect, useState } from 'react';
import MainLayout from '@/components/layout/MainLayout';
import { useLocale } from '@/i18n/LocaleProvider';
import { isSectionVisible } from '@/i18n/config/sections';

// Import section components
import Hero from '@/components/sections/Hero';
import About from '@/components/sections/About';
import Services from '@/components/sections/Services';
import Articles from '@/components/sections/Articles';
import Contact from '@/components/sections/Contact';

export default function Home() {
  const { locale } = useLocale();
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    // This is just to ensure the locale is loaded before rendering
    if (locale) {
      setIsLoading(false);
    }
  }, [locale]);
  
  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }
  
  return (
    <MainLayout>
      {/* Hero Section */}
      <Hero />

      {/* Services Section */}
      <Services />

      {/* About Section */}
      <About />
      
      
      {/* Articles Section - conditionally rendered based on locale */}
      {isSectionVisible('articles', locale) && <Articles />}
      
      {/* Contact Section */}
      <Contact />
    </MainLayout>
  );
}