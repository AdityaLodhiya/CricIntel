/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: '#030305',
        surface: '#0A0B10',
        elevated: '#111318',
        primary: '#3B82F6', // blue-500
        secondary: '#6366F1', // indigo-500
        accent: '#0EA5E9', // sky-500
        text: '#FFFFFF',
        muted: '#A1A1AA',
        danger: '#EF4444',
        success: '#10B981', // Keeping standard green solely for valid success states
        warning: '#F59E0B',
        neon: {
          green: '#00E676',
          blue: '#3B82F6',
          purple: '#8B5CF6',
          amber: '#F59E0B',
          rose: '#F43F5E',
          cyan: '#06B6D4',
        }
      },
      fontFamily: {
        inter: ['Inter', 'system-ui', 'sans-serif'],
        jakarta: ['Plus Jakarta Sans', 'sans-serif'],
        space: ['Space Grotesk', 'sans-serif'],
      },
      borderRadius: {
        '4xl': '2rem',
      },
      backdropBlur: {
        '3xl': '64px',
      },
      boxShadow: {
        'neon-green': '0 0 20px rgba(59,130,246,0.3), 0 0 60px rgba(59,130,246,0.1)', // Mapped to blue
        'neon-green-lg': '0 0 30px rgba(59,130,246,0.4), 0 0 80px rgba(59,130,246,0.15)', // Mapped to blue
        'neon-blue': '0 0 20px rgba(14,165,233,0.3), 0 0 60px rgba(14,165,233,0.1)',
        'neon-purple': '0 0 20px rgba(139,92,246,0.3), 0 0 60px rgba(139,92,246,0.1)',
        'neon-amber': '0 0 20px rgba(245,158,11,0.3), 0 0 60px rgba(245,158,11,0.1)',
        'glass': '0 8px 32px rgba(0,0,0,0.4)',
        'glass-lg': '0 16px 64px rgba(0,0,0,0.5)',
      },
      animation: {
        'shimmer': 'shimmer 2s infinite linear',
        'glow-pulse': 'glow-pulse 2s infinite ease-in-out',
        'float': 'float 6s infinite ease-in-out',
        'spin-slow': 'spin 8s linear infinite',
        'gradient-shift': 'gradient-shift 3s ease infinite',
        'fade-in-up': 'fade-in-up 0.5s ease-out',
        'slide-in-right': 'slide-in-right 0.4s ease-out',
        'scale-in': 'scale-in 0.3s ease-out',
        'border-spin': 'border-spin 4s linear infinite',
      },
      keyframes: {
        shimmer: {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(100%)' },
        },
        'glow-pulse': {
          '0%, 100%': { opacity: '0.4' },
          '50%': { opacity: '0.8' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-20px)' },
        },
        'gradient-shift': {
          '0%, 100%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
        },
        'fade-in-up': {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'slide-in-right': {
          '0%': { opacity: '0', transform: 'translateX(-20px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        'scale-in': {
          '0%': { opacity: '0', transform: 'scale(0.95)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        'border-spin': {
          '0%': { transform: 'rotate(0deg)' },
          '100%': { transform: 'rotate(360deg)' },
        },
      },
    },
  },
  plugins: [],
}
