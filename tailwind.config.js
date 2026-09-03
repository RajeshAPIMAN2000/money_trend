/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        primary: '#0F172A',
        secondary: '#2563EB',
        accent: '#10B981',
        bg: '#F8FAFC',
        ink: '#1E293B',
        gold: '#A68B5B',
      },
      fontFamily: {
        display: ['"Bricolage Grotesque"', 'sans-serif'],
        sans: ['"DM Sans"', 'sans-serif'],
        serif: ['"Playfair Display"', 'Georgia', 'serif'],
      },
      boxShadow: {
        card: '0 1px 3px rgba(15,23,42,0.06), 0 1px 2px rgba(15,23,42,0.04)',
        lift: '0 10px 25px -5px rgba(15,23,42,0.10), 0 4px 6px -2px rgba(15,23,42,0.05)',
      },
      borderRadius: { card: '12px', btn: '8px' },
      aspectRatio: { banner: '2092.2 / 691.9' },
      keyframes: {
        'fade-in': { '0%': { opacity: 0, transform: 'translateY(10px)' }, '100%': { opacity: 1, transform: 'translateY(0)' } },
        'slide-up': { '0%': { opacity: 0, transform: 'translateY(20px)' }, '100%': { opacity: 1, transform: 'translateY(0)' } },
        'scale-in': { '0%': { opacity: 0, transform: 'scale(.95)' }, '100%': { opacity: 1, transform: 'scale(1)' } },
        ticker: { '0%': { transform: 'translateX(0)' }, '100%': { transform: 'translateX(-50%)' } },
        'ken-burns': {
          '0%': { transform: 'scale(1) translate(0, 0)' },
          '100%': { transform: 'scale(1.08) translate(-1%, -1%)' },
        },
        'float-3d': {
          '0%, 100%': { transform: 'translateY(0) rotateX(0deg) rotateY(0deg)' },
          '50%': { transform: 'translateY(-20px) rotateX(8deg) rotateY(12deg)' },
        },
        'float-3d-delay': {
          '0%, 100%': { transform: 'translateY(0) rotateX(0deg) rotateY(0deg)' },
          '50%': { transform: 'translateY(16px) rotateX(-6deg) rotateY(-10deg)' },
        },
        'orbit-3d': {
          '0%': { transform: 'rotateY(0deg) rotateX(15deg) translateZ(0)' },
          '100%': { transform: 'rotateY(360deg) rotateX(15deg) translateZ(0)' },
        },
        'orbit-3d-reverse': {
          '0%': { transform: 'rotateY(360deg) rotateX(-12deg)' },
          '100%': { transform: 'rotateY(0deg) rotateX(-12deg)' },
        },
        'banner-slide-in-right': {
          '0%': { opacity: 0, transform: 'translateX(60px) rotateY(-12deg) scale(0.96)' },
          '100%': { opacity: 1, transform: 'translateX(0) rotateY(0) scale(1)' },
        },
        'banner-slide-in-left': {
          '0%': { opacity: 0, transform: 'translateX(-60px) rotateY(12deg) scale(0.96)' },
          '100%': { opacity: 1, transform: 'translateX(0) rotateY(0) scale(1)' },
        },
        'banner-3d-in': {
          '0%': { opacity: 0, transform: 'translateY(30px) rotateX(25deg)' },
          '100%': { opacity: 1, transform: 'translateY(0) rotateX(0)' },
        },
        'banner-fade-up': {
          '0%': { opacity: 0, transform: 'translateY(24px)' },
          '100%': { opacity: 1, transform: 'translateY(0)' },
        },
        'banner-stat-in': {
          '0%': { opacity: 0, transform: 'translateY(20px) rotateX(20deg)' },
          '100%': { opacity: 1, transform: 'translateY(0) rotateX(0)' },
        },
        'text-glow': {
          '0%, 100%': { textShadow: '0 0 20px rgba(16,185,129,0.4)' },
          '50%': { textShadow: '0 0 32px rgba(16,185,129,0.7)' },
        },
        'banner-progress': {
          '0%': { transform: 'scaleX(0)' },
          '100%': { transform: 'scaleX(1)' },
        },
      },
      animation: {
        'fade-in': 'fade-in .4s ease-out',
        'slide-up': 'slide-up .5s ease-out',
        'scale-in': 'scale-in .3s ease-out',
        ticker: 'ticker 30s linear infinite',
        'ken-burns': 'ken-burns 8s ease-out forwards',
        'float-3d': 'float-3d 6s ease-in-out infinite',
        'float-3d-delay': 'float-3d-delay 7s ease-in-out infinite',
        'orbit-3d': 'orbit-3d 12s linear infinite',
        'orbit-3d-reverse': 'orbit-3d-reverse 10s linear infinite',
        'banner-slide-in-right': 'banner-slide-in-right .7s cubic-bezier(0.22, 1, 0.36, 1) forwards',
        'banner-slide-in-left': 'banner-slide-in-left .7s cubic-bezier(0.22, 1, 0.36, 1) forwards',
        'banner-3d-in': 'banner-3d-in .6s cubic-bezier(0.22, 1, 0.36, 1) forwards',
        'banner-3d-in-delay': 'banner-3d-in .7s cubic-bezier(0.22, 1, 0.36, 1) .1s forwards both',
        'banner-fade-up': 'banner-fade-up .6s ease-out .15s forwards both',
        'banner-fade-up-delay': 'banner-fade-up .6s ease-out .25s forwards both',
        'banner-stat-in': 'banner-stat-in .5s ease-out forwards both',
        'text-glow': 'text-glow 3s ease-in-out infinite',
        'banner-progress': 'banner-progress 6s linear forwards',
      },
    },
  },
  plugins: [],
}
