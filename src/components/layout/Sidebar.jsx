import { motion } from 'framer-motion';
import { LayoutList, Kanban, BarChart2, CheckSquare, Trash2 } from 'lucide-react';
import { VIEWS } from '../../constants';
import { ThemeSwitcher } from '../ui/ThemeSwitcher';

const navItems = [
  { id: VIEWS.LIST,   icon: LayoutList, label: 'Список'     },
  { id: VIEWS.KANBAN, icon: Kanban,     label: 'Канбан'     },
  { id: VIEWS.STATS,  icon: BarChart2,  label: 'Статистика' },
];

// ✅ ИСПРАВЛЕНО: убраны неиспользуемые пропсы theme и onToggleTheme
export function Sidebar({ activeView, onViewChange, taskCount, trashCount }) {
  return (
    // ✅ ИСПРАВЛЕНО: убран h-screen (вызывал overflow-проблемы)
    // sticky top-0 + min-h-screen даёт правильное поведение
    <aside className="flex flex-col w-56 flex-shrink-0
      bg-theme-surface border-r border-theme
      sticky top-0 min-h-screen px-2 py-6">

      {/* Лого */}
      <div className="flex items-center gap-2.5 px-3 py-2 mb-6">
        <div className="w-8 h-8 bg-primary rounded-xl
          flex items-center justify-center shadow-card">
          <CheckSquare size={16} className="text-primary-fg" />
        </div>
        <span className="font-bold text-theme-main text-sm">TaskFlow</span>
      </div>

      {/* Основная навигация */}
      <nav className="flex-1 space-y-0.5">
        {navItems.map(item => {
          const active = activeView === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onViewChange(item.id)}
              className={`
                w-full flex items-center gap-3 px-3 py-2.5 rounded-xl
                text-sm font-medium transition-all duration-200
                cursor-pointer relative
                ${active
                  ? 'text-primary'
                  : 'text-theme-muted hover:text-theme-main hover:bg-theme-elevated'
                }
              `}
            >
              {active && (
                <motion.div
                  layoutId="sidebar-active"
                  className="absolute inset-0 bg-theme-elevated rounded-xl"
                  transition={{ type: 'spring', bounce: 0.2, duration: 0.4 }}
                />
              )}
              <item.icon size={17} className="relative z-10" />
              <span className="relative z-10">{item.label}</span>

              {/* Счётчик активных задач */}
              {item.id === VIEWS.LIST && taskCount > 0 && (
                <span className="relative z-10 ml-auto text-xs
                  bg-theme-base text-theme-muted
                  rounded-full px-1.5 py-0.5 font-medium">
                  {taskCount}
                </span>
              )}
            </button>
          );
        })}

        {/* Разделитель */}
        <div className="h-px bg-theme-elevated my-2" />

        {/* Корзина */}
        <button
          onClick={() => onViewChange(VIEWS.TRASH)}
          className={`
            w-full flex items-center gap-3 px-3 py-2.5 rounded-xl
            text-sm font-medium transition-all duration-200
            cursor-pointer relative
            ${activeView === VIEWS.TRASH
              ? 'text-red-500'
              : 'text-theme-muted hover:text-red-500 hover:bg-theme-elevated'
            }
          `}
        >
          {activeView === VIEWS.TRASH && (
            <motion.div
              layoutId="sidebar-active"
              className="absolute inset-0 bg-theme-elevated rounded-xl"
              transition={{ type: 'spring', bounce: 0.2, duration: 0.4 }}
            />
          )}
          <Trash2 size={17} className="relative z-10" />
          <span className="relative z-10">Корзина</span>

          {/* Счётчик корзины */}
          {trashCount > 0 && (
            <span className="relative z-10 ml-auto text-xs
              bg-red-100 dark:bg-red-900/30 text-red-500
              rounded-full px-1.5 py-0.5 font-medium">
              {trashCount}
            </span>
          )}
        </button>
      </nav>

      {/* Переключатель темы — прибит к низу */}
      <div className="border-t border-theme pt-3 mt-3">
        <ThemeSwitcher />
      </div>
    </aside>
  );
}