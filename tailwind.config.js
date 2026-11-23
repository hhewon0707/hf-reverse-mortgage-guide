/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Pretendard Variable', 'Pretendard', 'Noto Sans KR', 'system-ui', 'sans-serif'],
      },
      colors: {
        brand: {
          50: '#eef4ff',
          100: '#dce8ff',
          200: '#b9d0ff',
          300: '#8bb0f5',
          400: '#4f82dc',
          500: '#2a5fc2',
          600: '#1a4aa6',
          700: '#12388a',
          800: '#0d2b6b',
          900: '#0a2150',
        },
        warm: {
          50: '#fff6ed',
          100: '#ffe8d1',
          400: '#ff9a4d',
          500: '#f97316',
          600: '#e05f0a',
        },
        safe: {
          50: '#ecfdf3',
          100: '#d1fadf',
          500: '#16a34a',
          600: '#12823b',
        },
        surface: '#f6f7fa',
        hf: { blue: '#12388a', lightblue: '#1a4aa6', gold: '#c8a84b' },
      },
      boxShadow: {
        card: '0 2px 6px rgba(16, 40, 90, 0.05), 0 12px 32px rgba(16, 40, 90, 0.07)',
        pop: '0 8px 28px rgba(249, 115, 22, 0.28)',
      },
      borderRadius: {
        '4xl': '2rem',
      },
    },
  },
  plugins: [],
}
