import type { Config } from 'tailwindcss'

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: '#FF6B35',
        secondary: '#14213D'
      }
    }
  },
  plugins: []
} satisfies Config
