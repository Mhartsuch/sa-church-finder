import type { Config } from 'tailwindcss'

export default {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Inter"', '-apple-system', 'BlinkMacSystemFont', '"Segoe UI"', 'sans-serif'],
      },
      colors: {
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
        brand: {
          DEFAULT: '#FF385C',
          light: '#fff0f3',
          dark: '#D70466',
        },
        sage: {
          50: '#f5faf7',
          100: '#e2f0e6',
          200: '#c5e0cc',
          300: '#97c7a4',
          400: '#6aae7d',
          500: '#479460',
          600: '#37774d',
          700: '#2d5f3f',
          800: '#274c35',
          900: '#213f2d',
        },
      },
      borderRadius: {
        xl: '12px',
        '2xl': '16px',
        '3xl': '20px',
        '4xl': '28px',
        full: '9999px',
        lg: '8px',
        md: '6px',
        sm: '4px',
      },
      boxShadow: {
        'airbnb': '0 1px 3px rgba(0, 0, 0, 0.06), 0 6px 16px rgba(0, 0, 0, 0.08)',
        'airbnb-hover': '0 2px 6px rgba(0, 0, 0, 0.08), 0 8px 24px rgba(0, 0, 0, 0.14)',
        'airbnb-subtle': '0 1px 2px rgba(0, 0, 0, 0.05), 0 4px 12px rgba(0, 0, 0, 0.04)',
      },
      keyframes: {
        shimmer: {
          '100%': { transform: 'translateX(100%)' },
        },
        'fade-in': {
          '0%': { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'toast-in': {
          '0%': { opacity: '0', transform: 'translateX(100%)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        'toast-out': {
          '0%': { opacity: '1', transform: 'translateX(0)' },
          '100%': { opacity: '0', transform: 'translateX(100%)' },
        },
        'modal-overlay-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        'modal-slide-up': {
          '0%': { opacity: '0', transform: 'translateY(16px) scale(0.98)' },
          '100%': { opacity: '1', transform: 'translateY(0) scale(1)' },
        },
        'card-stagger-in': {
          '0%': { opacity: '0', transform: 'translateY(12px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'scale-pop': {
          '0%': { transform: 'scale(0.6)', opacity: '0' },
          '50%': { transform: 'scale(1.15)' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
      },
      animation: {
        'fade-in': 'fade-in 0.4s ease-out',
        'toast-in': 'toast-in 0.3s ease-out',
        'toast-out': 'toast-out 0.25s ease-in forwards',
        'modal-overlay': 'modal-overlay-in 0.2s ease-out',
        'modal-slide-up': 'modal-slide-up 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
        'card-in': 'card-stagger-in 0.4s ease-out both',
        'scale-pop': 'scale-pop 0.35s ease-out',
      },
    },
  },
  plugins: [],
} satisfies Config
