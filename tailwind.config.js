/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'Menlo', 'monospace'],
      },
      colors: {
        surface: {
          50:  '#f8fafc',
          900: '#0f1117',
          950: '#080b10',
        },
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      boxShadow: {
        'glow-red':    '0 0 20px rgba(239,68,68,0.15)',
        'glow-amber':  '0 0 20px rgba(245,158,11,0.15)',
        'glow-indigo': '0 0 20px rgba(99,102,241,0.15)',
      },
    },
  },
  plugins: [],
};
