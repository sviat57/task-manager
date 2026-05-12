import { createContext, useContext, useEffect, useState, useRef } from 'react';
import { THEME_MAP, THEMES } from './index';

const ThemeContext = createContext(null);

export function ThemeProvider({ children }) {
  const [themeId, setThemeIdState] = useState(
    () => localStorage.getItem('tm_theme_id') || 'light'
  );

  const fontLinkRef = useRef(null);

  const applyTheme = (id) => {
    const theme = THEME_MAP[id] || THEME_MAP['light'];
    const root  = document.documentElement;
    const body  = document.body;

    // 1. CSS-переменные на <html>
    Object.entries(theme.vars).forEach(([prop, val]) => {
      root.style.setProperty(prop, val);
    });

    // 2. data-theme атрибут — для возможных CSS селекторов
    root.setAttribute('data-theme', id);

    // 3. dark-класс для Tailwind dark: вариантов
    root.classList.toggle('dark', theme.dark);

    // 4. Фон и цвет напрямую на body (перекрывает всё)
    body.style.backgroundColor = theme.vars['--bg-base'];
    body.style.color            = theme.vars['--color-text'];
    body.style.fontFamily       = theme.vars['--font-main'];

    // 5. Google Font
    if (!fontLinkRef.current) {
      // Проверяем нет ли уже тега
      const existing = document.getElementById('theme-font-link');
      if (existing) {
        fontLinkRef.current = existing;
      } else {
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.id  = 'theme-font-link';
        document.head.appendChild(link);
        fontLinkRef.current = link;
      }
    }
    fontLinkRef.current.href = theme.font.url;
  };

  // При первом рендере
  useEffect(() => {
    applyTheme(themeId);
  }, []); // eslint-disable-line

  const setThemeId = (id) => {
    setThemeIdState(id);
    localStorage.setItem('tm_theme_id', id);
    applyTheme(id);
  };

  const theme = THEME_MAP[themeId] || THEME_MAP['light'];

  return (
    <ThemeContext.Provider value={{ themeId, setThemeId, theme, themes: THEMES }}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used inside ThemeProvider');
  return ctx;
};