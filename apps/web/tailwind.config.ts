import type { Config } from 'tailwindcss'
export default {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: { 50:'#f5f3ff',100:'#ede9fe',200:'#ddd6fe',300:'#c4b5fd',400:'#a78bfa',500:'#8b5cf6',600:'#7c3aed',700:'#6d28d9',800:'#5b21b6',900:'#4c1d95' },
        surface: { 50:'#fafaff',100:'#f3f1fa',200:'#ebe7f5',300:'#ddd8eb' },
        ink: { DEFAULT:'#1a1130',muted:'#6b5f82',dim:'#9b8fc2' },
      },
    }
  },
  plugins: []
} satisfies Config
