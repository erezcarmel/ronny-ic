// Configuration for section visibility by locale
export const sectionVisibility = {
  en: {
    hero: true,
    about: true,
    articles: false,
    contact: true
  },
  he: {
    hero: true,
    about: true,
    articles: false,
    contact: true
  }
};

// Helper function to check if a section should be visible for a given locale
export function isSectionVisible(sectionName: string, locale: string): boolean {
  const localeConfig = sectionVisibility[locale as keyof typeof sectionVisibility];
  if (!localeConfig) return true; // Default to visible if locale config not found
  
  return localeConfig[sectionName as keyof typeof localeConfig] ?? true; // Default to visible if section config not found
}
