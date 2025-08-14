/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      backgroundImage: {
        'header-bg': "url('/images/bg3.jpg')",
      },
      textShadow: {
        DEFAULT: '0 2px 4px rgba(0,0,0,0.5)',
        'sm': '0 1px 2px rgba(0,0,0,0.4)',
      },
      colors: {
        primary: {
          50: '#f0f9ff',
          100: '#e0f2fe',
          200: '#bae6fd',
          300: '#7dd3fc',
          400: '#38bdf8',
          500: '#0ea5e9',
          600: '#0284c7',
          700: '#0369a1',
          800: '#075985',
          900: '#0c4a6e',
          950: '#082f49',
        },
      },
      fontFamily: {
        sans: ['var(--font-sans)'],
        serif: ['var(--font-serif)'],
        varela: ['var(--font-varela)'],
      },
      typography: (theme) => ({
        DEFAULT: {
          css: {
            color: theme('colors.gray.700'),
            a: {
              color: theme('colors.primary.600'),
              '&:hover': {
                color: theme('colors.primary.700'),
              },
            },
            'h1, h2, h3, h4, h5, h6': {
              fontFamily: 'var(--font-varela)',
            },
          },
        },
        dark: {
          css: {
            color: theme('colors.gray.300'),
            a: {
              color: theme('colors.primary.400'),
              '&:hover': {
                color: theme('colors.primary.300'),
              },
            },
          },
        },
      }),
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
    function({ addUtilities, theme }) {
      const textShadows = theme('textShadow');
      const newUtilities = {};
      
      Object.entries(textShadows).forEach(([key, value]) => {
        const className = key === 'DEFAULT' ? '.text-shadow' : `.text-shadow-${key}`;
        newUtilities[className] = {
          textShadow: value,
        };
      });
      
      addUtilities(newUtilities);
    },
  ],
}