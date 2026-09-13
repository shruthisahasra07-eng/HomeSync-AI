/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'navy-primary': '#12304A',
        'teal-primary': '#18A999',
        'warm-bg': '#F7F9F8',
        'warm-card': '#FFFFFF',
        'charcoal': '#17212B',
        'slate-gray': '#667085',
        'theme-border': '#E4E9ED',
        semantic: {
          success: '#22A06B',
          warning: '#E8A317',
          error: '#D64545',
          green: '#22A06B',
          amber: '#E8A317',
          red: '#D64545',
        },
        navy: {
          DEFAULT: '#12304A',
          50: '#F0F4F8',
          100: '#D9E2EC',
          200: '#BCCCDC',
          300: '#9FB3C8',
          400: '#627D98',
          500: '#334E68',
          600: '#243B53',
          700: '#182E44',
          800: '#12304A',
          900: '#0B1D2D',
          950: '#07131D',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      boxShadow: {
        subtle: '0 1px 3px 0 rgba(18, 48, 74, 0.05), 0 1px 2px -1px rgba(18, 48, 74, 0.05)',
        card: '0 2px 6px 0 rgba(18, 48, 74, 0.06), 0 1px 3px 0 rgba(18, 48, 74, 0.04)',
        hover: '0 8px 16px -2px rgba(18, 48, 74, 0.08), 0 4px 6px -2px rgba(18, 48, 74, 0.04)',
      }
    },
  },
  plugins: [],
}
