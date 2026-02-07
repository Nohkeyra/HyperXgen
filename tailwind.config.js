
// tailwind.config.js
module.exports = {
  darkMode: 'class', // Enable dark mode based on 'class'
  theme: {
    extend: {
      screens: { 'xs': '375px' },
      colors: {
        brandRed: '#FD1E4A',
        brandRedHigh: '#E61943',
        brandCharcoal: 'var(--color-text-primary)',
        brandCharcoalMuted: 'var(--color-text-secondary)',
        brandCharcoalSoft: 'var(--color-text-soft)',
        brandYellow: '#FABD0D',
        brandYellowDark: '#B38600',
        brandNeutral: 'var(--color-primary-bg)',
        brandDeep: 'var(--color-secondary-bg)'
      },
      fontFamily: { sans: ['Inter', 'sans-serif'] },
      spacing: {
        '8px': '8px',
        '16px': '16px',
        '24px': '24px',
        '32px': '32px',
        '40px': '40px',
        '48px': '48px',
        '56px': '56px',
        '64px': '64px',
      },
      keyframes: {
        'fade-in': { '0%': { opacity: '0' }, '100%': { opacity: '1' } },
        'slide-in-up': { '0%': { transform: 'translateY(10px)', opacity: '0' }, '100%': { transform: 'translateY(0)', opacity: '1' } },
        'slide-in-right': { '0%': { transform: 'translateX(20px)', opacity: '0' }, '100%': { transform: 'translateX(0)', opacity: '1' } },
        'slide-in-left': { '0%': { transform: 'translateX(-20px)', opacity: '0' }, '100%': { transform: 'translateX(0)', opacity: '1' } },
        'zoom-in': { '0%': { transform: 'scale(0.98)', opacity: '0' }, '100%': { transform: 'scale(1)', opacity: '1' } },
        'scan': { '0%': { top: '-10%' }, '100%': { top: '110%' } },
        'shimmer': { '0%': { transform: 'translateX(-100%)' }, '100%': { transform: 'translateX(100%)' } },
        'spin-slow': { '0%': { transform: 'rotate(0deg)' }, '100%': { transform: 'rotate(360deg)' } },
        'spin-reverse-slow': { '0%': { transform: 'rotate(360deg)' }, '100%': { transform: 'rotate(0deg)' } }
      },
      animation: {
        'fade-in': 'fade-in 0.2s ease-out forwards',
        'slide-in-up': 'slide-in-up 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'slide-in-right': 'slide-in-right 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'slide-in-left': 'slide-in-left 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'zoom-in': 'zoom-in 0.2s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'scan': 'scan 2s infinite linear',
        'shimmer': 'shimmer 1.5s infinite',
        'spin-slow': 'spin-slow 2s linear infinite',
        'spin-reverse-slow': 'spin-reverse-slow 1.5s linear infinite'
      }
    }
  }
};