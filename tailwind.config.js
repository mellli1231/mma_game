/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './blocked.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: '#5B4BDB',
        ink: '#1F2033',
        muted: '#6B6F8A',
        bg: '#FFF8EC',
        surface: '#FFFFFF',
        fire: '#FF7A45',
        water: '#3BA3FF',
        grass: '#3FBF7F',
        'fp-gold': '#F5B700',
        danger: '#E5484D',
        'hp-high': '#3FBF7F',
        'hp-mid': '#F5B700',
        'hp-low': '#E5484D',
        'ring-track': '#EDE9FF',
      },
      fontFamily: {
        display: ['Fredoka', 'ui-rounded', 'sans-serif'],
        body: ['Nunito', 'ui-sans-serif', 'sans-serif'],
      },
      fontSize: {
        timer: ['96px', { lineHeight: '1', fontWeight: '600' }],
      },
      borderRadius: {
        card: '16px',
        pill: '999px',
      },
      minHeight: {
        tap: '44px',
      },
      minWidth: {
        tap: '44px',
      },
      boxShadow: {
        card: '0 8px 24px rgba(31, 32, 51, 0.08)',
      },
      transitionTimingFunction: {
        airy: 'cubic-bezier(0.22, 1, 0.36, 1)',
        bounce: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
        breathe: 'cubic-bezier(0.45, 0, 0.55, 1)',
      },
      transitionDuration: {
        micro: '150ms',
        short: '300ms',
        medium: '500ms',
        long: '900ms',
      },
    },
  },
  plugins: [],
}
