'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { useLocale } from '@/i18n/LocaleProvider';
import { getMessages } from '@/i18n/config';
import apiService from '@/lib/utils/api';

interface ContactProps {
  title?: string;
}

interface ContactInfo {
  id?: string;
  language: string;
  phone?: string;
  email?: string;
  whatsapp?: string;
  instagram?: string;
  address?: string;
  mapUrl?: string;
}

export default function Contact({ title }: ContactProps) {
  const { locale } = useLocale();
  const [translations, setTranslations] = useState<any>(null);
  const [isRtl, setIsRtl] = useState(false);
  
  // Contact info state
  const [contactInfo, setContactInfo] = useState<ContactInfo | null>(null);
  const [isLoadingContact, setIsLoadingContact] = useState(true);
  
  // Form state
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  
  useEffect(() => {
    const loadData = async () => {
      try {
        // Load translations
        const messages = await getMessages(locale);
        setTranslations(messages.contact);
        setIsRtl(locale === 'he');
        
        // Load contact info from API
        setIsLoadingContact(true);
        const data = await apiService.contact.getInfo(locale);
        setContactInfo(data);
      } catch (error) {
        console.error('Error loading contact info:', error);
        // If there's an error, we'll use fallback values in the UI
      } finally {
        setIsLoadingContact(false);
      }
    };
    
    loadData();
  }, [locale]);
  
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!translations) return;
    
    // Form validation
    if (!name || !email || !message) {
      setErrorMessage('Please fill in all required fields');
      return;
    }
    
    setIsSubmitting(true);
    setSubmitStatus('idle');
    setErrorMessage('');
    
    try {
      // Send message via API
      await apiService.contact.sendMessage({
        name,
        email,
        subject,
        message
      });
      
      // Reset form
      setName('');
      setEmail('');
      setSubject('');
      setMessage('');
      setSubmitStatus('success');
      
      // Reset success status after 3 seconds
      setTimeout(() => {
        setSubmitStatus('idle');
      }, 3000);
    } catch (error) {
      console.error('Error submitting form:', error);
      setSubmitStatus('error');
      setErrorMessage(translations.form.error);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  if (!translations) {
    return <div className="section">Loading...</div>;
  }
  
  return (
    <section id="contact" className="section contact-section">
      <div className="container-custom">
        <div className={`text-center mb-12 ${isRtl ? 'rtl' : 'ltr'}`}>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white">
            {title || translations.title}
          </h2>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Contact Information */}
          <motion.div
            ref={ref}
            initial={{ opacity: 0, y: 20 }}
            animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
            transition={{ duration: 0.5 }}
            className={`bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 max-h-fit ${isRtl ? 'rtl text-right' : 'ltr text-left'}`}
          >
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
              {translations.title}
            </h3>
            
            <ul className="space-y-4">
              {contactInfo?.phone && (
                <li className="flex items-start">
                  <div className="flex-shrink-0 text-primary-600">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="#555599" aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                  </div>
                  <div className="ml-3" dir="ltr">
                    <p className="text-gray-900 dark:text-white font-medium">{translations.phone}</p>
                    <a 
                      href={`tel:${contactInfo.phone.replace(/\D/g, '')}`} 
                      className="hover:underline"
                      target="_blank" 
                      rel="noopener noreferrer"
                    >
                      {contactInfo.phone}
                    </a>
                  </div>
                </li>
              )}
              
              {contactInfo?.email && (
                <li className="flex items-start">
                  <div className="flex-shrink-0 text-primary-600">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="#555599" aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div className="ml-3 rtl:mr-3 rtl:ml-0" dir="ltr">
                    <p className="text-gray-900 dark:text-white font-medium">{translations.email}</p>
                    <a href={`mailto:${contactInfo.email}`} className="text-gray-900 hover:underline">{contactInfo.email}</a>
                  </div>
                </li>
              )}
              
              {contactInfo?.address && (
                <li className="flex items-start">
                  <div className="flex-shrink-0 text-primary-600">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="#555599" aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </div>
                  <div className="ml-3 rtl:mr-3 rtl:ml-0" dir="ltr">
                    <p className="text-gray-900 dark:text-white font-medium">{translations.address}</p>
                    <p className="text-gray-900 dark:text-gray-300">{contactInfo.address}</p>
                  </div>
                </li>
              )}
              
              {contactInfo?.whatsapp && (
                <li className="flex items-start">
                  <div className="flex-shrink-0 text-primary-600">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="#555599" aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                  </div>
                  <div className="ml-3 rtl:mr-3 rtl:ml-0" dir="ltr">
                    <p className="text-gray-900 dark:text-white font-medium">{translations.whatsapp}</p>
                    <a 
                      href={`https://wa.me/${contactInfo.whatsapp.replace(/\D/g, '')}`} 
                      className="text-gray-900 hover:underline"
                      target="_blank" 
                      rel="noopener noreferrer"
                    >
                      {contactInfo.whatsapp}
                    </a>
                  </div>
                </li>
              )}
              
              {contactInfo?.instagram && (
                <li className="flex items-start">
                  <div className="flex-shrink-0 text-primary-600">
                    <img src="/images/instagram.svg" alt="Instagram" width={22} height={22} />
                  </div>
                  <div className="ml-3 rtl:mr-3 rtl:ml-0" dir="ltr">
                    <p className="text-gray-900 dark:text-white font-medium">Instagram</p>
                    <a 
      href={contactInfo.instagram.startsWith('http') ? contactInfo.instagram : `https://instagram.com/${contactInfo.instagram.replace('@', '')}`}
                      className="text-gray-900 hover:underline"
                      target="_blank" 
                      rel="noopener noreferrer"
                    >
                      {`@${contactInfo.instagram}`}
                    </a>
                  </div>
                </li>
              )}
              
              {/* Fallback if no contact info is available */}
              {isLoadingContact && (
                <li className="py-4 text-center">
                  <p className="text-gray-900 dark:text-gray-400">{translations.loading || "Loading contact information..."}</p>
                </li>
              )}
              
              {!isLoadingContact && !contactInfo && (
                <li className="py-4 text-center">
                  <p className="text-gray-900 dark:text-gray-400">Contact information not available</p>
                </li>
              )}
            </ul>
            
            {/* Google Maps embed if mapUrl is provided */}
            {contactInfo?.mapUrl && (
              <div className="mt-6">
                <iframe
                  src={contactInfo.mapUrl}
                  width="100%"
                  height="300"
                  style={{ border: 0 }}
                  allowFullScreen={false}
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  title="Google Maps"
                  className="rounded-lg"
                />
              </div>
            )}
          </motion.div>
          
          {/* Contact Form */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className={`bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 ${isRtl ? 'rtl text-right' : 'ltr text-left'}`}
          >
            <form onSubmit={handleSubmit} noValidate>
              <div className="form-group">
                <label htmlFor="name" className="form-label">
                  {translations.form.name} <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="form-input"
                  required
                  aria-required="true"
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="email" className="form-label">
                  {translations.form.email} <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="form-input"
                  required
                  aria-required="true"
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="subject" className="form-label">
                  {translations.form.subject}
                </label>
                <input
                  type="text"
                  id="subject"
                  name="subject"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="form-input"
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="message" className="form-label">
                  {translations.form.message} <span className="text-red-500">*</span>
                </label>
                <textarea
                  id="message"
                  name="message"
                  rows={4}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="form-input"
                  required
                  aria-required="true"
                />
              </div>
              
              {submitStatus === 'success' && (
                <div className="success-message mb-4" role="alert">
                  {translations.form.success}
                </div>
              )}
              
              {submitStatus === 'error' && (
                <div className="error-message mb-4" role="alert">
                  {errorMessage || translations.form.error}
                </div>
              )}
              
              <button
                type="submit"
                disabled={isSubmitting}
                className="btn w-full bg-[#DEE4FB] hover:bg-gray-100"
                aria-label={isSubmitting ? translations.form.sending : translations.form.send}
              >
                {isSubmitting ? translations.form.sending : translations.form.send}
              </button>
            </form>
          </motion.div>
        </div>
      </div>
    </section>
  );
}