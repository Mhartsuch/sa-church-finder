import type { Config } from 'tailwindcss';

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Inter"', '-apple-system', 'BlinkMacSystemFont', '"Segoe UI"', 'sans-serif'],
      },
      colors: {
        brand: { DEFAULT: '#FF385C', dark: '#D70466' },
      },
      backgroundImage: {
        'brand-gradient': 'linear-gradient(to right, #E61E4D 0%, #E31C5F 50%, #D70466 100%)',
      },
      keyframes: {
        fade: { from: { opacity: '0' }, to: { opacity: '1' } },
        rise: {
          from: { opacity: '0', transform: 'translateY(16px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
      },
      animation: {
        fade: 'fade 0.2s ease-out',
        rise: 'rise 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
      },
    },
  },
  plugins: [],
} satisfies Config;
