/**
 * Каждая тема определяет:
 *  - CSS-переменные (применяются напрямую на <html>)
 *  - Google Fonts URL (подгружается динамически)
 *  - preview: два цвета для кружка в ThemeSwitcher
 *
 * Переменные:
 *  --bg-base      фон страницы
 *  --bg-surface   фон карточек / сайдбара / модалок
 *  --bg-elevated  чуть светлее surface (hover, inputs)
 *  --color-primary    акцентный цвет (кнопки, чекбоксы, активные элементы)
 *  --color-primary-hover
 *  --color-primary-fg белый/тёмный текст поверх primary
 *  --color-text   основной текст
 *  --color-muted  приглушённый текст
 *  --color-border граница
 *  --font-main    семейство шрифтов
 *  --radius-card  скругление карточек
 */
export const THEMES = [
  // ── Стандартные ────────────────────────────────────────────────────────────
  {
    id: 'light',
    label: 'Светлая',
    group: 'Стандартные',
    preview: ['#6d28d9', '#f8fafc'],
    dark: false,
    font: { name: 'DM Sans', url: 'https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&display=swap' },
    vars: {
      '--bg-base':             '#f8fafc',
      '--bg-surface':          '#ffffff',
      '--bg-elevated':         '#f1f5f9',
      '--color-primary':       '#6d28d9',
      '--color-primary-hover': '#5b21b6',
      '--color-primary-fg':    '#ffffff',
      '--color-text':          '#0f172a',
      '--color-muted':         '#64748b',
      '--color-border':        '#e2e8f0',
      '--font-main':           "'DM Sans', sans-serif",
      '--radius-card':         '1rem',
    },
  },
  {
    id: 'dark',
    label: 'Тёмная',
    group: 'Стандартные',
    preview: ['#818cf8', '#0f172a'],
    dark: true,
    font: { name: 'DM Sans', url: 'https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&display=swap' },
    vars: {
      '--bg-base':             '#0f172a',
      '--bg-surface':          '#1e293b',
      '--bg-elevated':         '#334155',
      '--color-primary':       '#818cf8',
      '--color-primary-hover': '#6366f1',
      '--color-primary-fg':    '#ffffff',
      '--color-text':          '#f1f5f9',
      '--color-muted':         '#94a3b8',
      '--color-border':        '#334155',
      '--font-main':           "'DM Sans', sans-serif",
      '--radius-card':         '1rem',
    },
  },

  // ── Кастомные ──────────────────────────────────────────────────────────────
  {
    id: 'midnight-ink',
    label: 'Midnight Ink',
    group: 'Кастомные',
    preview: ['#111111', '#f4ede4'],
    dark: false,
    // Классический серифный шрифт — подчёркивает элегантность чёрно-бежевой темы
    font: { name: 'Playfair Display', url: 'https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;500;600;700&display=swap' },
    vars: {
      '--bg-base':             '#f4ede4',
      '--bg-surface':          '#fdf8f2',
      '--bg-elevated':         '#ede6dc',
      '--color-primary':       '#111111',
      '--color-primary-hover': '#2a2a2a',
      '--color-primary-fg':    '#f4ede4',
      '--color-text':          '#111111',
      '--color-muted':         '#7a6e63',
      '--color-border':        '#d9d0c5',
      '--font-main':           "'Playfair Display', serif",
      '--radius-card':         '0.5rem',
    },
  },
  {
    id: 'royal-storm',
    label: 'Royal Storm',
    group: 'Кастомные',
    preview: ['#ffd60a', '#120a24'],
    dark: true,
    // Геометричный, смелый — идеален для фиолетово-жёлтого контраста
    font: { name: 'Space Grotesk', url: 'https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&display=swap' },
    vars: {
      '--bg-base':             '#120a24',
      '--bg-surface':          '#1e1035',
      '--bg-elevated':         '#2d1a50',
      '--color-primary':       '#ffd60a',
      '--color-primary-hover': '#f5c800',
      '--color-primary-fg':    '#120a24',
      '--color-text':          '#f5f0ff',
      '--color-muted':         '#a78bfa',
      '--color-border':        '#3b2068',
      '--font-main':           "'Space Grotesk', sans-serif",
      '--radius-card':         '0.75rem',
    },
  },
  {
    id: 'forest-gold',
    label: 'Forest Gold',
    group: 'Кастомные',
    preview: ['#023020', '#d4a373'],
    dark: false,
    // Классический serif — природный, органичный
    font: { name: 'Lora', url: 'https://fonts.googleapis.com/css2?family=Lora:wght@400;500;600;700&display=swap' },
    vars: {
      '--bg-base':             '#f0ebe0',
      '--bg-surface':          '#faf6ec',
      '--bg-elevated':         '#e8e0d0',
      '--color-primary':       '#023020',
      '--color-primary-hover': '#034a30',
      '--color-primary-fg':    '#d4a373',
      '--color-text':          '#022015',
      '--color-muted':         '#5a6e5a',
      '--color-border':        '#c8bfa8',
      '--font-main':           "'Lora', serif",
      '--radius-card':         '0.75rem',
    },
  },
  {
    id: 'crimson-cream',
    label: 'Crimson Cream',
    group: 'Кастомные',
    preview: ['#d62828', '#fff3e0'],
    dark: false,
    // Выразительный заголовочный — подходит к красно-кремовой теме
    font: { name: 'Fraunces', url: 'https://fonts.googleapis.com/css2?family=Fraunces:wght@400;500;600;700&display=swap' },
    vars: {
      '--bg-base':             '#fff3e0',
      '--bg-surface':          '#fff9f0',
      '--bg-elevated':         '#ffe8c8',
      '--color-primary':       '#d62828',
      '--color-primary-hover': '#b82222',
      '--color-primary-fg':    '#ffffff',
      '--color-text':          '#2d0a0a',
      '--color-muted':         '#9a5a5a',
      '--color-border':        '#f0d0b8',
      '--font-main':           "'Fraunces', serif",
      '--radius-card':         '1rem',
    },
  },
  {
    id: 'aqua-night',
    label: 'Aqua Night',
    group: 'Кастомные',
    preview: ['#2ec4b6', '#1a1a2e'],
    dark: true,
    // Технологичный моно — подчёркивает бирюзово-тёмный киберпанк
    font: { name: 'JetBrains Mono', url: 'https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;600;700&display=swap' },
    vars: {
      '--bg-base':             '#1a1a2e',
      '--bg-surface':          '#16213e',
      '--bg-elevated':         '#0f3460',
      '--color-primary':       '#2ec4b6',
      '--color-primary-hover': '#20a89c',
      '--color-primary-fg':    '#1a1a2e',
      '--color-text':          '#e0f7f5',
      '--color-muted':         '#60a8a2',
      '--color-border':        '#1e3a5f',
      '--font-main':           "'JetBrains Mono', monospace",
      '--radius-card':         '0.5rem',
    },
  },
  {
    id: 'copper-mist',
    label: 'Copper Mist',
    group: 'Кастомные',
    preview: ['#a0430a', '#dfe8e6'],
    dark: false,
    // Нейтральный гуманистический sans — мягкость морского тумана
    font: { name: 'Nunito', url: 'https://fonts.googleapis.com/css2?family=Nunito:wght@400;500;600;700&display=swap' },
    vars: {
      '--bg-base':             '#dfe8e6',
      '--bg-surface':          '#edf3f2',
      '--bg-elevated':         '#d0dedd',
      '--color-primary':       '#a0430a',
      '--color-primary-hover': '#883808',
      '--color-primary-fg':    '#ffffff',
      '--color-text':          '#1e2e2c',
      '--color-muted':         '#5a7a76',
      '--color-border':        '#b8ceca',
      '--font-main':           "'Nunito', sans-serif",
      '--radius-card':         '1.25rem',
    },
  },
  {
  id: 'cherry-smoke',
  label: 'Cherry Smoke',
  group: 'Кастомные',
  preview: ['#faf9f6', '#d2042d'],  // ← поменяли порядок превью
  dark: false,
  font: { name: 'DM Serif Display', url: 'https://fonts.googleapis.com/css2?family=DM+Serif+Display&display=swap' },
  vars: {
    '--bg-base':             '#c8021f',   // ← красный фон страницы
    '--bg-surface':          '#d2042d',   // ← чуть светлее красный для карточек
    '--bg-elevated':         '#e0153e',   // ← hover, inputs
    '--color-primary':       '#faf9f6',   // ← белый акцент (кнопки)
    '--color-primary-hover': '#e8e6e2',
    '--color-primary-fg':    '#d2042d',   // ← текст на белой кнопке — красный
    '--color-text':          '#fff5f5',   // ← белый текст
    '--color-muted':         '#ffb3be',   // ← розоватый мuted
    '--color-border':        '#e8153a',   // ← граница
    '--font-main':           "'DM Serif Display', serif",
    '--radius-card':         '0.25rem',
  },
},
  {
    id: 'ember-sand',
    label: 'Ember Sand',
    group: 'Кастомные',
    preview: ['#ff6f3c', '#f5ebdf'],
    dark: false,
    // Дружелюбный округлый — тёплые тона
    font: { name: 'Nunito', url: 'https://fonts.googleapis.com/css2?family=Nunito:wght@400;500;600;700&display=swap' },
    vars: {
      '--bg-base':             '#f5ebdf',
      '--bg-surface':          '#fdf5ec',
      '--bg-elevated':         '#edddd0',
      '--color-primary':       '#ff6f3c',
      '--color-primary-hover': '#e85c28',
      '--color-primary-fg':    '#ffffff',
      '--color-text':          '#2d1206',
      '--color-muted':         '#9a6a50',
      '--color-border':        '#e0ccb8',
      '--font-main':           "'Nunito', sans-serif",
      '--radius-card':         '1.5rem',
    },
  },
  {
    id: 'peach-ocean',
    label: 'Peach Ocean',
    group: 'Кастомные',
    preview: ['#eea47f', '#00539c'],
    dark: true,
    // Элегантный тонкий sans — контраст персика и синего океана
    font: { name: 'Outfit', url: 'https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700&display=swap' },
    vars: {
      '--bg-base':             '#003270',
      '--bg-surface':          '#004090',
      '--bg-elevated':         '#0a52a8',
      '--color-primary':       '#eea47f',
      '--color-primary-hover': '#d88c65',
      '--color-primary-fg':    '#003270',
      '--color-text':          '#ffeee4',
      '--color-muted':         '#a8c4e0',
      '--color-border':        '#1460a8',
      '--font-main':           "'Outfit', sans-serif",
      '--radius-card':         '1rem',
    },
  },
  {
    id: 'mint-smoke',
    label: 'Mint Smoke',
    group: 'Кастомные',
    preview: ['#69a481', '#e7edeb'],
    dark: false,
    // Чистый геометричный sans — свежесть и воздух
    font: { name: 'Plus Jakarta Sans', url: 'https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap' },
    vars: {
      '--bg-base':             '#e7edeb',
      '--bg-surface':          '#f2f6f4',
      '--bg-elevated':         '#dae4e0',
      '--color-primary':       '#69a481',
      '--color-primary-hover': '#52906c',
      '--color-primary-fg':    '#ffffff',
      '--color-text':          '#122218',
      '--color-muted':         '#4a7060',
      '--color-border':        '#b8d0c8',
      '--font-main':           "'Plus Jakarta Sans', sans-serif",
      '--radius-card':         '1.25rem',
    },
  },
];

export const THEME_MAP = Object.fromEntries(THEMES.map(t => [t.id, t]));