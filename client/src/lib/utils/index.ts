import { ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Combines class names with Tailwind CSS classes
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Format date to locale string
 */
export function formatDate(date: string | Date, locale: string = 'en-US') {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  
  return dateObj.toLocaleDateString(locale, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

/**
 * Truncate text to a specific length
 */
export function truncateText(text: string, maxLength: number = 100) {
  if (text.length <= maxLength) return text;
  return `${text.substring(0, maxLength)}...`;
}

/**
 * Check if the current environment is the browser
 */
export const isBrowser = typeof window !== 'undefined';

/**
 * Get current language from URL or localStorage
 */
export function getCurrentLanguage(): 'en' | 'he' {
  if (!isBrowser) return 'en';
  
  // Try to get from localStorage
  const storedLang = localStorage.getItem('language') as 'en' | 'he' | null;
  if (storedLang === 'en' || storedLang === 'he') return storedLang;
  
  // Try to get from URL
  const urlLang = window.location.pathname.startsWith('/he') ? 'he' : 'en';
  return urlLang;
}

/**
 * Check if text is RTL (for Hebrew)
 */
export function isRTL(text: string): boolean {
  const rtlChars = /[\u0591-\u07FF\u200F\u202B\u202E\uFB1D-\uFDFD\uFE70-\uFEFC]/;
  return rtlChars.test(text);
}

/**
 * Get direction based on language
 */
export function getDirection(language: string): 'ltr' | 'rtl' {
  return language === 'he' ? 'rtl' : 'ltr';
}

/**
 * Debounce function
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  
  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

/**
 * Scroll to element by ID with smooth behavior
 */
export function scrollToElement(elementId: string) {
  if (!isBrowser) return;
  
  const element = document.getElementById(elementId);
  if (element) {
    element.scrollIntoView({
      behavior: 'smooth',
      block: 'start',
    });
  }
}

/**
 * Parse and sanitize HTML content
 * Note: For production, consider using a proper sanitization library
 */
export function sanitizeHtml(html: string): string {
  if (typeof DOMParser !== 'undefined') {
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');
    return doc.body.textContent || '';
  }
  return html;
}