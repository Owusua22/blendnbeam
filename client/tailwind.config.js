/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
extend: {
      colors: {
        // Fresh Light Green Palette
        mint: {
          50: '#F0FDF4',
          100: '#DCFCE7',
          200: '#BBF7D0',
          300: '#86EFAC',
          400: '#4ADE80',
          500: '#22C55E',
          600: '#16A34A',
          700: '#15803D',
          800: '#166534',
          900: '#14532D',
        },
        // Light Yellow/Butter Palette
        butter: {
          50: '#FEFCE8',
          100: '#FEF9C3',
          200: '#FEF08A',
          300: '#FDE047',
          400: '#FACC15',
          500: '#EAB308',
          600: '#CA8A04',
          700: '#A16207',
          800: '#854D0E',
          900: '#713F12',
        },
        // Accent Colors
        salon: {
          cream: '#FFFEF5',
          light: '#F7FEE7',
          text: '#1F2937',
          'text-light': '#4B5563',
          'text-muted': '#6B7280',
        }
      },
      fontFamily: {
        'jakarta': ['Plus Jakarta Sans', 'sans-serif'],
        'dm': ['DM Sans', 'sans-serif'],
        'space': ['Space Grotesk', 'sans-serif'],
      }
    },

  plugins: [],
}