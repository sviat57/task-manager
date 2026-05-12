/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        theme: {
          base:     'var(--bg-base)',
          surface:  'var(--bg-surface)',
          elevated: 'var(--bg-elevated)',
          main:     'var(--color-text)',
          muted:    'var(--color-muted)',
          // ✅ ИСПРАВЛЕНО: 'border' вместо DEFAULT
          // Даёт классы: bg-theme-border, text-theme-border, border-theme-border
          // Но мы используем .border-theme из @layer utilities выше
          border:   'var(--color-border)',
        },
        primary: {
          DEFAULT: 'var(--color-primary)',
          hover:   'var(--color-primary-hover)',
          fg:      'var(--color-primary-fg)',
        },
      },

      fontFamily: {
        theme: ['var(--font-main)'],
      },

      borderRadius: {
        card: 'var(--radius-card)',
      },

      boxShadow: {
        card:       '0 1px 3px 0 rgb(0 0 0 / 0.08), 0 1px 2px -1px rgb(0 0 0 / 0.06)',
        'card-hover':'0 4px 12px 0 rgb(0 0 0 / 0.12), 0 2px 4px -1px rgb(0 0 0 / 0.08)',
        modal:      '0 20px 60px -10px rgb(0 0 0 / 0.3)',
      },
    },
  },
  plugins: [],
};