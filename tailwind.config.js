/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx}",
  ],
  theme: {
    extend: {
      colors: {
        police: {
          navy: '#1B2B4D',
          blue: '#233876',
          gold: '#C6A44B',
          brass: '#A68A3C',
          red: '#9B2C2C',
          gray: '#2D3748',
          light: '#E2E8F0',
          accent: '#4A5568',
          'dark-blue': '#0F172A',
          'light-blue': '#2C4187'
        }
      },
      backgroundColor: {
        'police-gradient': '#1B2B4D',
        'gold-gradient': '#C6A44B',
        'dark-gradient': '#1a1f2c',
      },
      animation: {
        'badge-pulse': 'badge-pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'slide-up': 'slide-up 0.5s ease-out',
        'slide-down': 'slide-down 0.5s ease-out',
        'fade-in': 'fade-in 0.3s ease-out',
        'shimmer': 'shimmer 2s infinite'
      },
      keyframes: {
        'badge-pulse': {
          '0%, 100%': { opacity: 1, transform: 'scale(1)' },
          '50%': { opacity: 0.8, transform: 'scale(1.05)' }
        },
        'slide-up': {
          '0%': { transform: 'translateY(20px)', opacity: 0 },
          '100%': { transform: 'translateY(0)', opacity: 1 }
        },
        'slide-down': {
          '0%': { transform: 'translateY(-20px)', opacity: 0 },
          '100%': { transform: 'translateY(0)', opacity: 1 }
        },
        'fade-in': {
          '0%': { opacity: 0 },
          '100%': { opacity: 1 }
        },
        'shimmer': {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(100%)' }
        }
      },
      boxShadow: {
        'police': '0 0 20px rgba(198, 164, 75, 0.15)',
        'police-hover': '0 0 30px rgba(198, 164, 75, 0.25)',
        'card': '0 4px 6px -1px rgba(27, 43, 77, 0.1), 0 2px 4px -1px rgba(27, 43, 77, 0.06)'
      }
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
    require('@tailwindcss/typography'),
    require('@tailwindcss/aspect-ratio'),
  ],
}