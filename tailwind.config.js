/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './*.html',
    './assets/js/*.js',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Poppins', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        serif: ['"Playfair Display"', 'Georgia', 'serif'],
      },
      colors: {
        maroon: { DEFAULT: '#5c1616', dark: '#3f0e0e', light: '#7a2222', 50: '#fdf3f3' },
        gold: { DEFAULT: '#c19a3d', dark: '#a37f2c', light: '#d9b969', soft: '#e7d4a3' },
        cream: { DEFAULT: '#faf5ec', dark: '#f2e8d6' },
      },
      boxShadow: {
        card: '0 4px 20px -6px rgba(92, 22, 22, 0.12)',
      },
      maxWidth: {
        '8xl': '88rem',
      },
    },
  },
  plugins: [],
}
