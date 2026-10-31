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
        brand: {
          50: '#fffbe1',
          100: '#fff4b8',
          200: '#ffe885',
          300: '#ffd647',
          400: '#ffbe1a',
          500: '#f59e0b', // Amber/Bit Gold primary
          600: '#d97706',
          700: '#b45309',
          800: '#92400e',
          900: '#78350f',
          accent: '#10B981', // Neon Emerald
        },
        dark: {
          bg: '#0A0D14',
          card: '#121824',
          hover: '#1B2436',
          border: '#2A364F',
          subtle: '#1E293B',
        },
        light: {
          bg: '#F8FAFC',
          card: '#FFFFFF',
          hover: '#F1F5F9',
          border: '#E2E8F0',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'Consolas', 'monospace'],
      },
      animation: {
        'ticker': 'ticker 35s linear infinite',
        'pulse-subtle': 'pulse-subtle 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'flash-green': 'flash-green 0.8s ease-out',
        'flash-red': 'flash-red 0.8s ease-out',
      },
      keyframes: {
        ticker: {
          '0%': { transform: 'translateX(0%)' },
          '100%': { transform: 'translateX(-50%)' },
        },
        'pulse-subtle': {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.6' },
        },
        'flash-green': {
          '0%': { backgroundColor: 'rgba(16, 185, 129, 0.35)', borderColor: '#10B981' },
          '100%': { backgroundColor: 'transparent' }
        },
        'flash-red': {
          '0%': { backgroundColor: 'rgba(239, 68, 68, 0.35)', borderColor: '#EF4444' },
          '100%': { backgroundColor: 'transparent' }
        }
      }
    },
  },
  plugins: [],
}
