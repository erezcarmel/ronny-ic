'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useLocale } from '@/i18n/LocaleProvider';
import { getMessages } from '@/i18n/config';

interface HeroProps {
  title?: string;
  subtitle?: string;
}

export default function Hero({ title, subtitle }: HeroProps) {
  const { locale } = useLocale();
  const [translations, setTranslations] = useState<any>(null);
  const [isRtl, setIsRtl] = useState(false);
  
  useEffect(() => {
    getMessages(locale).then(messages => {
      setTranslations(messages.hero);
      setIsRtl(locale === 'he');
    });
  }, [locale]);
  
  if (!translations) {
    return <div className="min-h-[70vh] flex items-center justify-center">Loading...</div>;
  }
  
  return (
    <section className="min-h-[70vh] flex items-center justify-center bg-cover bg-center bg-header-bg relative">
      {/* Semi-transparent overlay */}
      <div className="absolute inset-0 bg-gray-50 opacity-70"></div>
      
      <div className="container-custom relative z-10">
        <div className={`text-center ${isRtl ? 'rtl' : 'ltr'}`}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="text-4xl md:text-6xl font-varela font-bold text-gray-900 mb-4 text-shadow">
              {title || translations.title}
            </h1>
            
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="text-xl md:text-2xl text-gray-800 text-shadow-sm max-w-xl mx-auto"
            >
              {subtitle || translations.subtitle}
            </motion.p>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
              className="mt-8"
            >
              <a
                href="#contact"
                className="btn btn-outline text-lg px-8 py-3 hover:bg-transparent hover:border-[#555599]"
                aria-label="Contact me"
              >
                {translations.contactMe || "Contact Me"}
              </a>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}