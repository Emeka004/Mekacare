/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx}',
    './contexts/**/*.{js,ts,jsx,tsx}',
    './*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: { DEFAULT: '#e91e8c', 50: '#fef0f8', 100: '#fce0f1', 500: '#e91e8c', 600: '#c7187a', 700: '#a51268' },
        rose:    { health: '#f43f5e' },
        teal:    { health: '#0d9488' },
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
      borderRadius: { xl: '1rem', '2xl': '1.5rem' },
    },
  },
  plugins: [],
};
