/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        arcade: {
          cream: '#f5f0e8',
          sand: '#eee6d8',
          border: '#e4dacf',
          darkText: '#181a1f',
          red: '#c0392b',
          blue: '#1e5bb5',
          orange: '#b85412',
          black: '#0a0d12',
        },
        brand: {
          50: '#eef2ff',
          100: '#e0e7ff',
          200: '#c7d2fe',
          300: '#a5b4fc',
          400: '#818cf8',
          500: '#6366f1',
          600: '#4f46e5',
          700: '#4338ca',
          800: '#3730a3',
          900: '#312e81',
          950: '#1e1b4b',
        },
      },
      fontFamily: {
        space: ['Space Grotesk', 'Outfit', 'sans-serif'],
        display: ['Space Grotesk', 'Outfit', 'sans-serif'],
        headline: ['Space Grotesk', 'Outfit', 'sans-serif'],
        serif: ['Space Grotesk', 'Outfit', 'sans-serif'],
        editorial: ['Space Grotesk', 'Outfit', 'sans-serif'],
        sans: ['Outfit', 'Plus Jakarta Sans', 'system-ui', 'sans-serif'],
        condensed: ['Space Grotesk', 'Outfit', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      animation: {
        'pulse-subtle': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
    },
  },
  plugins: [],
};
