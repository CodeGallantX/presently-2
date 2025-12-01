/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['Figtree', 'system-ui', 'sans-serif'],
      },
      colors: {
        primary: {
          DEFAULT: '#ffca0d',
          hover: '#e6b60b',
          foreground: '#000000',
        },
        background: '#09090b',
        surface: '#18181b',
      }
    },
  },
  plugins: [],
}
