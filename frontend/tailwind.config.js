/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: '#09090B',
        surface: '#18181B',
        primary: '#00E676',
        secondary: '#00C853',
        accent: '#FFD600',
        text: '#FFFFFF',
        muted: '#A1A1AA',
        danger: '#EF4444',
        success: '#22C55E',
        warning: '#FACC15'
      },
      fontFamily: {
        inter: ['Inter', 'sans-serif'],
        jakarta: ['Plus Jakarta Sans', 'sans-serif'],
        space: ['Space Grotesk', 'sans-serif']
      }
    },
  },
  plugins: [],
}
