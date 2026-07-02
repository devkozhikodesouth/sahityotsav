/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
    "node_modules/flowbite-react/lib/esm/**/*.js"
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#4A121A', // Deep Maroon
          light: '#6E1B28',
          dark: '#2D0A0F',
        },
        secondary: {
          DEFAULT: '#2C1417', // Dark Brown
          light: '#422125',
          dark: '#17090B',
        },
        accent: {
          DEFAULT: '#C5A059', // Antique Gold
          hover: '#A9833E',
        },
        background: '#F5EFE4', // Parchment Beige
        surface: '#FDFBF7', // Ivory
        olive: '#5D6346', // Muted Olive
        copper: '#C37351', // Aged Copper
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        heading: ['Cinzel', 'Playfair Display', 'serif'],
        poppins: ['Poppins', 'sans-serif'],
        montserrat: ['Montserrat', 'sans-serif'],
        serif: ['Lora', 'serif'],
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-out forwards',
        'slide-up': 'slideUp 0.6s ease-out forwards',
        'bounce-soft': 'bounceSoft 2s infinite ease-in-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        bounceSoft: {
          '0%, 100%': { transform: 'translateY(-5%)' },
          '50%': { transform: 'translateY(0)' },
        }
      },
      boxShadow: {
        'soft': '0 10px 25px -5px rgba(0, 0, 0, 0.05), 0 8px 10px -6px rgba(0, 0, 0, 0.01)',
        'glass': '0 4px 30px rgba(0, 0, 0, 0.1)',
      }
    },
  },
  plugins: [
    require('flowbite/plugin')
  ],
}
