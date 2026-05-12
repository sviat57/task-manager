import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Palette, Check } from 'lucide-react';
import { useTheme } from '../../themes/ThemeContext';

export function ThemeSwitcher() {
  const { themeId, setThemeId, themes } = useTheme();
  const [open, setOpen] = useState(false);
  const ref  = useRef(null);

  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const groups = themes.reduce((acc, t) => {
    (acc[t.group] = acc[t.group] || []).push(t);
    return acc;
  }, {});

  const current = themes.find(t => t.id === themeId);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(v => !v)}
        className="flex items-center gap-2 px-3 py-2.5 rounded-xl w-full
          text-theme-muted hover:text-theme-main hover:bg-theme-elevated
          transition-colors cursor-pointer text-sm font-medium"
      >
        <Palette size={17} />
        <span>Тема</span>
        {/* Превью текущей темы */}
        <div className="ml-auto flex gap-1">
          {current?.preview.map((c, i) => (
            <span
              key={i}
              className="w-3 h-3 rounded-full border border-black/10"
              style={{ backgroundColor: c }}
            />
          ))}
        </div>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 6, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1    }}
            exit={{   opacity: 0, y: 6, scale: 0.97 }}
            transition={{ duration: 0.18 }}
            className="absolute bottom-full left-0 mb-2 w-64
              bg-theme-surface border border-theme
              rounded-card shadow-modal overflow-hidden z-50 p-3"
          >
            {Object.entries(groups).map(([groupName, groupThemes]) => (
              <div key={groupName} className="mb-3 last:mb-0">
                <p className="text-xs font-semibold text-theme-muted
                  uppercase tracking-wide mb-2 px-1">
                  {groupName}
                </p>
                <div className="flex flex-wrap gap-2 px-1">
                  {groupThemes.map(t => (
                    <ThemeButton
                      key={t.id}
                      theme={t}
                      active={themeId === t.id}
                      onClick={() => { setThemeId(t.id); setOpen(false); }}
                    />
                  ))}
                </div>
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function ThemeButton({ theme, active, onClick }) {
  const [hovered, setHovered] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={onClick}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        title={theme.label}
        className="w-8 h-8 rounded-full border-2 transition-all duration-150
          cursor-pointer flex items-center justify-center hover:scale-110"
        style={{
          background: `linear-gradient(135deg, ${theme.preview[0]} 50%, ${theme.preview[1]} 50%)`,
          borderColor: active ? theme.preview[0] : 'transparent',
          outline: active ? `2px solid ${theme.preview[0]}` : 'none',
          outlineOffset: '2px',
        }}
      >
        {active && (
          <Check
            size={12}
            style={{
              color: theme.dark ? theme.preview[1] : '#fff',
              filter: 'drop-shadow(0 1px 1px rgba(0,0,0,0.4))',
            }}
          />
        )}
      </button>

      <AnimatePresence>
        {hovered && (
          <motion.div
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{   opacity: 0, y: 4 }}
            transition={{ duration: 0.12 }}
            className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2
              bg-theme-main text-theme-base
              text-xs font-medium px-2 py-1 rounded-lg
              whitespace-nowrap pointer-events-none z-10"
            style={{
              backgroundColor: 'var(--color-text)',
              color: 'var(--bg-base)',
            }}
          >
            {theme.label}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}