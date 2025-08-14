'use client';

import { useTranslations } from 'next-intl';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { useLocale } from '@/i18n/LocaleProvider';
import { useState, useRef } from 'react';

interface AboutProps {
  title?: string;
  content?: string;
  imageUrl?: string;
}

interface ExpandableSection {
  id: string;
  title: string;
  content: React.ReactNode;
}

export default function About({
  title,
  content,
  imageUrl = '/images/profile-placeholder.jpg',
}: AboutProps) {
  const t = useTranslations('about');
  const { locale } = useLocale();
  const isRtl = locale === 'he';
  
  // Animation when section comes into view
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });
  
  const variants = {
    hidden: { opacity: 0, y: 50 },
    visible: { opacity: 1, y: 0 },
  };

  // State to track which sections are expanded
  const [expandedSections, setExpandedSections] = useState<{[key: string]: boolean}>({
    therapy: false,
    diagnostics: false
  });

  // Refs for content heights
  const contentRefs = {
    therapy: useRef<HTMLDivElement>(null),
    diagnostics: useRef<HTMLDivElement>(null)
  };

  const toggleSection = (sectionId: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [sectionId]: !prev[sectionId]
    }));
  };
  
  const sections: ExpandableSection[] = [
    {
      id: 'therapy',
      title: t('sections.therapy.name'),
      content: (
        <>
          <p className={isRtl ? 'text-right' : 'text-left'}>
            {t('sections.therapy.title')}
          </p>

          <h4 className={`text-xl mb-4 font-bold ${isRtl ? 'text-right' : 'text-left'}`}>
            {t('sections.therapy.content1-title')}
          </h4>
          <p>
          {t('sections.therapy.content1-text')}
          </p>

          <h4 className={`text-xl mb-4 font-bold ${isRtl ? 'text-right' : 'text-left'}`}>
            {t('sections.therapy.content2-title')}
          </h4>
          <p>
            {t('sections.therapy.content2-text')}
          </p>

          <h4 className={`text-xl mb-4 font-bold ${isRtl ? 'text-right' : 'text-left'}`}>
            {t('sections.therapy.content3-title')}
          </h4>
          <p>
            {t('sections.therapy.content3-text')}
          </p>

          <h4 className={`text-xl mb-4 font-bold ${isRtl ? 'text-right' : 'text-left'}`}>
            {t('sections.therapy.content4-title')}
          </h4>
          <p>
            {t('sections.therapy.content4-text')}
          </p>
        </>
      )
    },
    {
      id: 'diagnostics',
      title: t('sections.diagnostics.name'),
      content: (
        <>
          <p>
            {t('sections.diagnostics.title')}
          </p>

          <h4 className={`text-xl mb-4 font-bold ${isRtl ? 'text-right' : 'text-left'}`}>
            {t('sections.diagnostics.content1-title')}
          </h4>
          <p>
            {t('sections.diagnostics.content1-text')}
          </p>

          <h4 className={`text-xl mb-4 font-bold ${isRtl ? 'text-right' : 'text-left'}`}>
            {t('sections.diagnostics.content2-title')}
          </h4>
          <p>
            {t('sections.diagnostics.content2-text')}
          </p>

          <h4 className={`text-xl mb-4 font-bold ${isRtl ? 'text-right' : 'text-left'}`}>
            {t('sections.diagnostics.content3-title')}
          </h4>
          <p>
            {t('sections.diagnostics.content3-text')}
          </p>
        </>
      )
    }
  ];
  
  return (
    <section id="about" className="section bg-gray-50 dark:bg-gray-900">
      <div className="container-custom">
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
              {title || t('title')}
            </h2>
          </div>
          
          <div className="grid grid-cols-1 gap-6">
            {content ? (
              <div dangerouslySetInnerHTML={{ __html: content }} />
            ) : (
              <>
                {sections.map((section) => (
                  <div key={section.id} className="border rounded-lg overflow-hidden shadow-md">
                    <button
                      onClick={() => toggleSection(section.id)}
                      className={`w-full p-4 text-left flex justify-between items-center bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors ${isRtl ? 'text-right' : 'text-left'}`}
                    >
                      <h3 className="text-2xl font-bold mb-0">{section.title}</h3>
                      <svg
                        className={`w-6 h-6 transform transition-transform duration-300 ${expandedSections[section.id] ? 'rotate-180' : ''}`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                      </svg>
                    </button>
                    
                    <div 
                      className="overflow-hidden transition-all duration-300 ease-in-out"
                      style={{
                        maxHeight: expandedSections[section.id] ? '2000px' : '0',
                        opacity: expandedSections[section.id] ? 1 : 0
                      }}
                    >
                      <div 
                        ref={contentRefs[section.id as keyof typeof contentRefs]} 
                        className="p-4 bg-white dark:bg-gray-800 border-t"
                      >
                        <div className="prose dark:prose-invert max-w-none">
                          {section.content}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </>
            )}
          </div>
        </motion.div>
      </div>
    </section>
  );
}