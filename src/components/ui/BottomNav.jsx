/**
 * Мобильные правки для App.jsx
 * 
 * Замени в своём App.jsx следующие блоки:
 */

// ── 1. Мобильная нижняя навигация (Bottom Navigation Bar) ────────────────
// Добавь этот компонент и вставь в JSX перед закрывающим </div>

export function BottomNav({ activeView, onViewChange, trashCount }) {
  const items = [
    { id: 'list',   icon: '☑️',  label: 'Задачи'  },
    { id: 'kanban', icon: '📋',  label: 'Канбан'  },
    { id: 'stats',  icon: '📊',  label: 'Статистика' },
    { id: 'trash',  icon: '🗑️', label: 'Корзина', badge: trashCount },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-30 md:hidden
      bg-theme-surface border-t border-theme
      flex items-stretch"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
    >
      {items.map(item => {
        const active = activeView === item.id;
        return (
          <button
            key={item.id}
            onClick={() => onViewChange(item.id)}
            className={`flex-1 flex flex-col items-center justify-center py-2 gap-0.5
              text-xs font-medium transition-colors cursor-pointer relative
              ${active ? 'text-primary' : 'text-theme-muted'}`}
          >
            {active && (
              <span
                className="absolute top-0 left-1/4 right-1/4 h-0.5 rounded-full bg-primary"
              />
            )}
            <span className="text-base leading-none relative">
              {item.icon}
              {item.badge > 0 && (
                <span className="absolute -top-1 -right-2 w-3.5 h-3.5
                  bg-red-500 text-white text-[9px] font-bold
                  rounded-full flex items-center justify-center">
                  {item.badge > 9 ? '9+' : item.badge}
                </span>
              )}
            </span>
            <span className="text-[10px]">{item.label}</span>
          </button>
        );
      })}
    </nav>
  );
}
