/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"DM Sans"', 'system-ui', 'sans-serif'],
        display: ['Outfit', 'system-ui', 'sans-serif'],
      },
      colors: {
        brand: {
          50: '#f0f9ff',
          100: '#e0f2fe',
          200: '#bae6fd',
          300: '#7dd3fc',
          400: '#38bdf8',
          500: '#0ea5e9',
          600: '#0284c7',
        },
        mint: {
          50: '#ecfdf5',
          100: '#d1fae5',
          200: '#a7f3d0',
          300: '#6ee7b7',
          400: '#34d399',
          500: '#10b981',
        },
      },
      boxShadow: {
        soft: '0 4px 24px -4px rgba(14, 165, 233, 0.12), 0 8px 16px -8px rgba(15, 118, 110, 0.08)',
        card: '0 1px 3px rgba(0,0,0,0.04), 0 8px 24px rgba(14, 165, 233, 0.08)',
      },
    },
  },
  plugins: [],
}
