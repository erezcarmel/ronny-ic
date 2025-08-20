'use client';

import { useTranslations } from 'next-intl';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { useLocale } from '@/i18n/LocaleProvider';
import { useState, useRef, useEffect } from 'react';
import apiService from '@/lib/utils/api';

interface AboutProps {
  title?: string;
  content?: string;
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

export default function About({
  title,
  content,
  imageUrl,
}: AboutProps) {
  const t = useTranslations('about');
  const { locale } = useLocale();
  const isRtl = locale === 'he';
  
  const [sectionData, setSectionData] = useState<Section | null>(null);
  const [loading, setLoading] = useState(true);
  
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
        const data = await apiService.sections.getByType('about', locale);
        setSectionData(data);
      } catch (error) {
        console.error('Error fetching About section data:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchSectionData();
  }, [locale]);
  
  // Get content from section data or fallback to props
  const sectionContent = sectionData?.contents?.[0]?.content || content || t('content');
  const sectionTitle = sectionData?.contents?.[0]?.title || title || t('title');
  const sectionImage = sectionData?.contents?.[0]?.imageUrl || imageUrl || '/images/logo.png';
  
  return (
    <section id="about" className="section bg-gray-50 dark:bg-gray-900">
      <div className="container-custom">
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
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
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white">
                {sectionTitle}
              </h2>
            </div>
            
            <div className="flex flex-col md:flex-row gap-8 items-center">
              <div className={`${isRtl ? 'order-2' : 'order-1'}`}>
                <div className="prose dark:prose-invert max-w-none">
                  {sectionContent ? (
                    <div dangerouslySetInnerHTML={{ __html: sectionContent }} />
                  ) : (
                    <p>{t('content')}</p>
                  )}
                </div>
              </div>
              
              <div className="rounded-lg overflow-hidden shadow-lg">
                <Image 
                  src={sectionImage} 
                  alt={sectionTitle}
                  width={200}
                  height={200}
                  className="w-full h-auto object-cover max-h-[200px]"
                  priority
                />
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </section>
  );
}