/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}", 
  ],
  theme: {
    extend: {
      colors: {
        gemNavy: '#0A192F',
        gemGold: '#D4AF37',
        gemEmerald: '#046A38',
        gemIvory: '#FDFBF7',
      },
    },
  },
  plugins: [],
}
