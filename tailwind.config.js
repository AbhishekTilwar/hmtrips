/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        display: ['Cormorant Garamond', 'Georgia', 'serif'],
        body: ['Outfit', 'system-ui', 'sans-serif'],
      },
      colors: {
        brand: {
          blue: '#1e40af',
          'blue-mid': '#2563eb',
          sky: '#0ea5e9',
          cyan: '#06b6d4',
        },
        neutral: {
          950: '#1a1a2e',
          800: '#2d2d44',
          600: '#64748b',
          400: '#94a3b8',
        },
      },
      backgroundImage: {
        'gradient-brand': 'linear-gradient(135deg, #1e40af 0%, #2563eb 50%, #0ea5e9 100%)',
        'gradient-brand-hover': 'linear-gradient(135deg, #2563eb 0%, #3b82f6 50%, #38bdf8 100%)',
        'sidebar-card': 'linear-gradient(180deg, #eff6ff 0%, #ffffff 100%)',
        'hero-overlay': 'linear-gradient(180deg, transparent 20%, rgba(26, 26, 46, 0.9) 100%)',
      },
      boxShadow: {
        'card': '0 4px 6px -1px rgba(0, 0, 0, 0.08), 0 2px 4px -2px rgba(0, 0, 0, 0.05)',
        'card-hover': '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.08)',
      },
      animation: {
        'fade-in': 'fadeIn 0.6s ease-out forwards',
        'slide-up': 'slideUp 0.5s ease-out forwards',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(24px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
}
