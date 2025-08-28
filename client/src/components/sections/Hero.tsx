'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useLocale } from '@/i18n/LocaleProvider';
import { getMessages } from '@/i18n/config';
import apiService from '@/lib/utils/api';

interface HeroProps {
  title?: string;
  subtitle?: string;
}

interface HeroContent {
  title: string;
  subtitle: string;
  content: string; // Button text
  imageUrl?: string;
}

interface HeroData {
  id: string;
  name: string;
  type: string;
  isPublished: boolean;
  contents: {
    id: string;
    language: string;
    title: string;
    subtitle: string;
    content: string;
    imageUrl?: string;
  }[];
}

export default function Hero({ title, subtitle }: HeroProps) {
  const { locale } = useLocale();
  const [translations, setTranslations] = useState<any>(null);
  const [isRtl, setIsRtl] = useState(false);
  const [heroData, setHeroData] = useState<HeroContent | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        
        // Fetch translations as fallback
        const messages = await getMessages(locale);
        setTranslations(messages.hero);
        setIsRtl(locale === 'he');
        
        // Fetch hero section from API
        const heroSection = await apiService.sections.getByType('hero', locale);
        
        if (heroSection && heroSection.contents && heroSection.contents.length > 0) {
          // Use the first content that matches the current language
          const content = heroSection.contents[0];
          setHeroData({
            title: content.title || '',
            subtitle: content.subtitle || '',
            content: content.content || 'Contact Me', // Button text
            imageUrl: content.imageUrl
          });
        }
      } catch (error) {
        console.error('Error fetching hero section:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, [locale]);
  
  if (isLoading || (!heroData && !translations)) {
    return <div className="min-h-[60vh] flex items-center justify-center">Loading...</div>;
  }
  
  // Set background image if provided in heroData
  const backgroundStyle = heroData?.imageUrl 
    ? { backgroundImage: `url(${heroData.imageUrl})` }
    : {};

  return (
    <section 
      className="min-h-[60vh] flex items-center justify-center bg-cover bg-center bg-header-bg relative" 
      style={backgroundStyle}
    >
      {/* Semi-transparent overlay */}
      <div className="absolute inset-0 bg-gray-50 opacity-70"></div>
      
      <div className="container-custom relative z-10 pt-12">
        <div className={`text-center ${isRtl ? 'rtl' : 'ltr'}`}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="text-4xl md:text-6xl font-varela font-bold text-gray-900 mb-4 text-shadow">
              {title || (heroData ? heroData.title : translations.title)}
            </h1>
            
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="text-xl md:text-2xl text-gray-800 text-shadow-sm max-w-xl mx-auto"
            >
              {subtitle || (heroData ? heroData.subtitle : translations.subtitle)}
            </motion.p>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
              className="mt-8"
            >
              <a
                href="#contact"
                className="btn btn-outline text-lg px-8 py-3 shadow-lg hover:bg-[#ffffff66] hover:border-[#ffffff66]"
                aria-label="Contact me"
              >
                {heroData ? heroData.content : (translations.contactMe || "Contact Me")}
              </a>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}