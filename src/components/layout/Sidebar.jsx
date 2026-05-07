import { motion } from 'framer-motion';
import { LayoutList, Kanban, BarChart2, Sun, Moon, CheckSquare } from 'lucide-react';
import { VIEWS } from '../../constants';

const navItems = [
  { id: VIEWS.LIST,   icon: LayoutList, label: 'Список'   },
  { id: VIEWS.KANBAN, icon: Kanban,     label: 'Канбан'   },
  { id: VIEWS.STATS,  icon: BarChart2,  label: 'Статистика'},
];

export function Sidebar({ activeView, onViewChange, theme, onToggleTheme, taskCount }) {
  return (
    <aside className="flex flex-col w-56 flex-shrink-0">
      {/* Лого */}
      <div className="flex items-center gap-2.5 px-3 py-2 mb-6">
        <div className="w-8 h-8 bg-gradient-to-br from-violet-500 to-indigo-600
          rounded-xl flex items-center justify-center shadow-lg shadow-violet-200 dark:shadow-violet-900">
          <CheckSquare size={16} className="text-white" />
        </div>
        <span className="font-bold text-slate-800 dark:text-slate-200 text-sm">TaskFlow</span>
      </div>

      {/* Навигация */}
      <nav className="flex-1 space-y-1">
        {navItems.map(item => {
          const active = activeView === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onViewChange(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl
                text-sm font-medium transition-all duration-200 cursor-pointer relative
                ${active
                  ? 'text-violet-700 dark:text-violet-400'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
            >
              {active && (
                <motion.div
                  layoutId="sidebar-active"
                  className="absolute inset-0 bg-violet-50 dark:bg-violet-900/20 rounded-xl"
                  transition={{ type: 'spring', bounce: 0.2, duration: 0.4 }}
                />
              )}
              <item.icon size={17} className="relative z-10" />
              <span className="relative z-10">{item.label}</span>

              {/* Счётчик активных задач для списка */}
              {item.id === VIEWS.LIST && taskCount > 0 && (
                <span className="relative z-10 ml-auto text-xs bg-violet-100 dark:bg-violet-900/40
                  text-violet-600 dark:text-violet-400 rounded-full px-1.5 py-0.5">
                  {taskCount}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Переключатель темы */}
      <button
        onClick={onToggleTheme}
        className="flex items-center gap-3 px-3 py-2.5 rounded-xl
          text-sm font-medium text-slate-500 dark:text-slate-400
          hover:text-slate-800 dark:hover:text-slate-200
          hover:bg-slate-100 dark:hover:bg-slate-800
          transition-all duration-200 cursor-pointer"
      >
        <motion.div
          animate={{ rotate: theme === 'dark' ? 180 : 0 }}
          transition={{ duration: 0.4 }}
        >
          {theme === 'dark' ? <Sun size={17} /> : <Moon size={17} />}
        </motion.div>
        {theme === 'dark' ? 'Светлая тема' : 'Тёмная тема'}
      </button>
    </aside>
  );
}