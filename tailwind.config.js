/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        surface: '#141414',
        raised: '#1a1a1a',
        border: '#2a2a2a',
        primary: '#00c853',
        warning: '#ffab00',
        danger: '#ff1744',
        info: '#00b0ff',
      },
      fontFamily: {
        mono: ['"Share Tech Mono"', 'monospace'],
        sans: ['Inter', 'sans-serif'],
        display: ['Rajdhani', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
