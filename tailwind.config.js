/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Core space-dark palette
        space: {
          950: '#020408',
          900: '#050810',
          800: '#080d1a',
          700: '#0d1425',
          600: '#111b30',
          500: '#162038',
        },
        // Neon cyan — primary brand
        cyan: {
          neon: '#00d4ff',
          glow: '#00eeff',
          dim: '#0099bb',
          muted: 'rgba(0,212,255,0.15)',
        },
        // Neon purple — secondary
        violet: {
          neon: '#7c3aed',
          glow: '#9d5ff0',
          dim: '#5b21b6',
          muted: 'rgba(124,58,237,0.15)',
        },
        // Status colors
        status: {
          online: '#00ff88',
          warning: '#ffaa00',
          danger: '#ff3366',
          info: '#00d4ff',
          offline: '#6b7280',
        },
        // Panel backgrounds
        panel: {
          DEFAULT: 'rgba(8,13,26,0.85)',
          light: 'rgba(13,20,37,0.9)',
          dark: 'rgba(5,8,16,0.95)',
          glass: 'rgba(255,255,255,0.04)',
          glassBorder: 'rgba(255,255,255,0.08)',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'Menlo', 'Monaco', 'monospace'],
        display: ['Inter', 'system-ui', 'sans-serif'],
      },
      backgroundImage: {
        'grid-pattern':
          'linear-gradient(rgba(0,212,255,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(0,212,255,0.04) 1px, transparent 1px)',
        'grid-pattern-sm':
          'linear-gradient(rgba(0,212,255,0.025) 1px, transparent 1px), linear-gradient(90deg, rgba(0,212,255,0.025) 1px, transparent 1px)',
        'gradient-radial': 'radial-gradient(ellipse at center, var(--tw-gradient-stops))',
        'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
        'cyber-gradient': 'linear-gradient(135deg, rgba(0,212,255,0.1) 0%, rgba(124,58,237,0.1) 100%)',
        'neon-gradient': 'linear-gradient(90deg, #00d4ff, #7c3aed)',
        'danger-gradient': 'linear-gradient(90deg, #ff3366, #ff6600)',
        'success-gradient': 'linear-gradient(90deg, #00ff88, #00d4ff)',
      },
      backgroundSize: {
        'grid-40': '40px 40px',
        'grid-20': '20px 20px',
      },
      boxShadow: {
        'neon-cyan': '0 0 15px rgba(0,212,255,0.5), 0 0 30px rgba(0,212,255,0.25), 0 0 60px rgba(0,212,255,0.1)',
        'neon-violet': '0 0 15px rgba(124,58,237,0.5), 0 0 30px rgba(124,58,237,0.25), 0 0 60px rgba(124,58,237,0.1)',
        'neon-green': '0 0 15px rgba(0,255,136,0.5), 0 0 30px rgba(0,255,136,0.25)',
        'neon-red': '0 0 15px rgba(255,51,102,0.5), 0 0 30px rgba(255,51,102,0.25)',
        'panel': '0 4px 24px rgba(0,0,0,0.4), 0 1px 0 rgba(255,255,255,0.06) inset',
        'panel-lg': '0 8px 40px rgba(0,0,0,0.6), 0 1px 0 rgba(255,255,255,0.06) inset',
        'inner-glow': 'inset 0 0 20px rgba(0,212,255,0.05)',
        'card': '0 2px 12px rgba(0,0,0,0.4), 0 0 0 1px rgba(255,255,255,0.06)',
        'card-hover': '0 4px 24px rgba(0,0,0,0.5), 0 0 0 1px rgba(0,212,255,0.3), 0 0 20px rgba(0,212,255,0.1)',
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'pulse-fast': 'pulse 0.8s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'glow-pulse': 'glowPulse 2s ease-in-out infinite',
        'scan-line': 'scanLine 3s linear infinite',
        'radar-sweep': 'radarSweep 3s linear infinite',
        'data-flow': 'dataFlow 2s linear infinite',
        'slide-in-left': 'slideInLeft 0.3s ease-out',
        'slide-in-right': 'slideInRight 0.3s ease-out',
        'slide-in-up': 'slideInUp 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
        'fade-in': 'fadeIn 0.3s ease-out',
        'fade-in-up': 'fadeInUp 0.5s cubic-bezier(0.16, 1, 0.3, 1)',
        'scale-in': 'scaleIn 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
        'float': 'float 6s ease-in-out infinite',
        'shimmer': 'shimmer 2s linear infinite',
        'typing': 'typing 1.5s steps(20) infinite',
        'bar-grow': 'barGrow 1s ease-out forwards',
        'orbit': 'orbit 8s linear infinite',
        'signal': 'signal 1.5s ease-out infinite',
      },
      keyframes: {
        glowPulse: {
          '0%, 100%': { opacity: 1, filter: 'brightness(1)' },
          '50%': { opacity: 0.7, filter: 'brightness(1.3)' },
        },
        scanLine: {
          '0%': { transform: 'translateY(-100%)' },
          '100%': { transform: 'translateY(100vh)' },
        },
        radarSweep: {
          '0%': { transform: 'rotate(0deg)' },
          '100%': { transform: 'rotate(360deg)' },
        },
        dataFlow: {
          '0%': { strokeDashoffset: 1000 },
          '100%': { strokeDashoffset: 0 },
        },
        slideInLeft: {
          '0%': { transform: 'translateX(-100%)', opacity: 0 },
          '100%': { transform: 'translateX(0)', opacity: 1 },
        },
        slideInRight: {
          '0%': { transform: 'translateX(100%)', opacity: 0 },
          '100%': { transform: 'translateX(0)', opacity: 1 },
        },
        slideInUp: {
          '0%': { transform: 'translateY(20px)', opacity: 0 },
          '100%': { transform: 'translateY(0)', opacity: 1 },
        },
        fadeIn: {
          '0%': { opacity: 0 },
          '100%': { opacity: 1 },
        },
        fadeInUp: {
          '0%': { transform: 'translateY(30px)', opacity: 0 },
          '100%': { transform: 'translateY(0)', opacity: 1 },
        },
        scaleIn: {
          '0%': { transform: 'scale(0.9)', opacity: 0 },
          '100%': { transform: 'scale(1)', opacity: 1 },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        typing: {
          '0%, 90%, 100%': { opacity: 1 },
          '50%': { opacity: 0 },
        },
        barGrow: {
          '0%': { height: 0, opacity: 0 },
          '100%': { opacity: 1 },
        },
        orbit: {
          '0%': { transform: 'rotate(0deg) translateX(60px) rotate(0deg)' },
          '100%': { transform: 'rotate(360deg) translateX(60px) rotate(-360deg)' },
        },
        signal: {
          '0%': { transform: 'scale(0.8)', opacity: 1 },
          '100%': { transform: 'scale(2)', opacity: 0 },
        },
      },
      borderRadius: {
        card: '12px',
        panel: '16px',
        xl: '16px',
        '2xl': '20px',
        '3xl': '24px',
      },
    },
  },
  plugins: [],
}
