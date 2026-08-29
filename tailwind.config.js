/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        background: '#FDFBF7',
        surface: '#FFFFFF',
        'surface-subtle': '#F9F7F3',
        'surface-hover': '#F3F0EA',
        primary: {
          DEFAULT: '#181919',
          hover: '#2D2D2D',
          light: '#444748',
        },
        olive: {
          DEFAULT: '#536347',
          light: '#D4E6C2',
          dark: '#3C4B31',
          bg: '#F2F7EE',
        },
        border: {
          DEFAULT: '#F5F2ED',
          darker: '#E4E2E2',
        },
        muted: '#747878',
      },
      fontFamily: {
        sans: ['Geist', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      borderRadius: {
        'xs': '0.25rem',
        'sm': '0.375rem',
        'DEFAULT': '0.5rem',
        'md': '0.75rem',
        'lg': '1rem',
        'xl': "1.25rem",
        '2xl': '1.5rem',
      },
      boxShadow: {
        'subtle': '0 1px 3px rgba(0, 0, 0, 0.04)',
        'card': '0 2px 8px -2px rgba(0, 0, 0, 0.05)',
        'floating': '0 12px 32px -4px rgba(0, 0, 0, 0.08)',
      }
    },
  },
  plugins: [],
}
