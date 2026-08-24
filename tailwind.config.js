/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./index.html', './src/**/*.js'],
  darkMode: 'class',
  safelist: [
    'paper-texture',
    'reveal',
    'reveal.is-visible',
  ],
  theme: {
    extend: {
      colors: {
        paper: { DEFAULT: '#f5f1e8', dark: '#221f1a' },
        ink: { DEFAULT: '#2b2620', dark: '#e8e0d0' },
        accent: { DEFAULT: '#8b6f47', dark: '#c9a876' },
      },
      fontFamily: {
        serif: ['"Noto Serif"', '"Noto Serif SC"', 'serif'],
      },
    },
  },
  plugins: [],
};
