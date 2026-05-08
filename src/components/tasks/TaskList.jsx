import { useState, useMemo } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Plus, Search, SlidersHorizontal, CheckCircle2, LayoutList, LayoutGrid } from 'lucide-react';
import { TaskItem }  from './TaskItem';
import { Button }    from '../ui/Button';
import { PRIORITIES, CATEGORIES, SORT_OPTIONS } from '../../constants';

/**
 * TaskList — список задач с поиском, фильтрами, сортировкой и
 * переключателем List / Grid.
 *
 * Новый пропс: onToggleSubtask — передаём в TaskItem для инлайн-чекбоксов.
 */
export function TaskList({ tasks, onAddTask, onToggle, onDelete, onOpen, onToggleSubtask }) {
  const [search,         setSearch]         = useState('');
  const [sortBy,         setSortBy]         = useState('createdAt_desc');
  const [filterPriority, setFilterPriority] = useState('all');
  const [filterCategory, setFilterCategory] = useState('all');
  const [showFilters,    setShowFilters]    = useState(false);

  // 'list' | 'grid' — сохраняем в localStorage чтобы помнить выбор
  const [viewMode, setViewMode] = useState(
    () => localStorage.getItem('tm_listview') || 'list'
  );

  const handleViewMode = (mode) => {
    setViewMode(mode);
    localStorage.setItem('tm_listview', mode);
  };

  const processed = useMemo(() => {
    let result = tasks.filter(t => !t.completed);

    if (search) {
      const q = search.toLowerCase();
      result = result.filter(t =>
        t.title.toLowerCase().includes(q) ||
        t.description?.toLowerCase().includes(q)
      );
    }
    if (filterPriority !== 'all') result = result.filter(t => t.priority === filterPriority);
    if (filterCategory !== 'all') result = result.filter(t => t.category === filterCategory);

    return [...result].sort((a, b) => {
      switch (sortBy) {
        case 'createdAt_asc':  return new Date(a.createdAt) - new Date(b.createdAt);
        case 'deadline_asc':   return (a.deadline || 'z').localeCompare(b.deadline || 'z');
        case 'priority_desc':  return (PRIORITIES[b.priority]?.order || 0) - (PRIORITIES[a.priority]?.order || 0);
        case 'title_asc':      return a.title.localeCompare(b.title);
        default:               return new Date(b.createdAt) - new Date(a.createdAt);
      }
    });
  }, [tasks, search, sortBy, filterPriority, filterCategory]);

  return (
    <div className="space-y-4">

      {/* ── Тулбар: поиск + переключатель вида + кнопки ─────────────────── */}
      <div className="space-y-3">
        <div className="flex gap-2">
          {/* Поиск */}
          <div className="relative flex-1">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Поиск задач..."
              className="w-full pl-9 pr-4 py-2 text-sm bg-white dark:bg-slate-900
                border border-slate-200 dark:border-slate-700 rounded-xl outline-none
                text-slate-700 dark:text-slate-300 placeholder:text-slate-400
                focus:ring-2 focus:ring-violet-500/30 transition-all"
            />
          </div>

          {/* ── Переключатель List / Grid ──────────────────────────────── */}
          <div className="flex items-center bg-slate-100 dark:bg-slate-800
            rounded-xl p-1 gap-0.5">
            <ViewToggleBtn
              active={viewMode === 'list'}
              onClick={() => handleViewMode('list')}
              title="Список"
            >
              <LayoutList size={15} />
            </ViewToggleBtn>
            <ViewToggleBtn
              active={viewMode === 'grid'}
              onClick={() => handleViewMode('grid')}
              title="Сетка"
            >
              <LayoutGrid size={15} />
            </ViewToggleBtn>
          </div>

          <Button variant="outline" onClick={() => setShowFilters(v => !v)}>
            <SlidersHorizontal size={14} />
          </Button>

          <Button variant="primary" onClick={onAddTask}>
            <Plus size={15} />
            <span className="hidden sm:inline">Задача</span>
          </Button>
        </div>

        {/* Фильтры */}
        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{   opacity: 0, height: 0 }}
              className="overflow-hidden"
            >
              <div className="flex gap-3 flex-wrap p-3 bg-slate-50 dark:bg-slate-800/50
                rounded-xl border border-slate-200 dark:border-slate-700">
                <select
                  value={sortBy}
                  onChange={e => setSortBy(e.target.value)}
                  className="text-xs bg-white dark:bg-slate-800 border border-slate-200
                    dark:border-slate-700 rounded-lg px-2 py-1.5 outline-none
                    text-slate-700 dark:text-slate-300 cursor-pointer"
                >
                  {SORT_OPTIONS.map(o => (
                    <option key={o.value} value={o.value}>{o.label}</option>
                  ))}
                </select>
                <select
                  value={filterPriority}
                  onChange={e => setFilterPriority(e.target.value)}
                  className="text-xs bg-white dark:bg-slate-800 border border-slate-200
                    dark:border-slate-700 rounded-lg px-2 py-1.5 outline-none
                    text-slate-700 dark:text-slate-300 cursor-pointer"
                >
                  <option value="all">Все приоритеты</option>
                  {Object.entries(PRIORITIES).map(([k, p]) => (
                    <option key={k} value={k}>{p.label}</option>
                  ))}
                </select>
                <select
                  value={filterCategory}
                  onChange={e => setFilterCategory(e.target.value)}
                  className="text-xs bg-white dark:bg-slate-800 border border-slate-200
                    dark:border-slate-700 rounded-lg px-2 py-1.5 outline-none
                    text-slate-700 dark:text-slate-300 cursor-pointer"
                >
                  <option value="all">Все категории</option>
                  {CATEGORIES.map(c => (
                    <option key={c.id} value={c.id}>{c.label}</option>
                  ))}
                </select>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ── Список задач ─────────────────────────────────────────────────── */}
      <AnimatePresence mode="wait">
        <motion.div
          key={viewMode}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{   opacity: 0 }}
          transition={{ duration: 0.18 }}
          className={
            viewMode === 'grid'
              // Адаптивная сетка: 1 колонка на мобиле, 2 на md, 3 на xl
              ? 'grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3'
              : 'space-y-2'
          }
        >
          <AnimatePresence mode="popLayout">
            {processed.map(task => (
              <TaskItem
                key={task.id}
                task={task}
                onToggle={onToggle}
                onDelete={onDelete}
                onOpen={onOpen}
                onToggleSubtask={onToggleSubtask}
                isGrid={viewMode === 'grid'}
              />
            ))}
          </AnimatePresence>

          {/* Пустое состояние */}
          {processed.length === 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className={`text-center py-16
                ${viewMode === 'grid' ? 'col-span-full' : ''}`}
            >
              <CheckCircle2 size={40}
                className="mx-auto text-slate-200 dark:text-slate-700 mb-3" />
              <p className="text-slate-400 dark:text-slate-600 text-sm font-medium">
                {search ? 'Ничего не найдено' : 'Задач нет — самое время создать!'}
              </p>
            </motion.div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   ViewToggleBtn — кнопка переключения режима с анимацией активного состояния
   ───────────────────────────────────────────────────────────────────────────── */
function ViewToggleBtn({ active, onClick, children, title }) {
  return (
    <button
      onClick={onClick}
      title={title}
      className={`relative p-1.5 rounded-lg transition-colors duration-150 cursor-pointer
        ${active
          ? 'text-slate-700 dark:text-slate-200'
          : 'text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300'
        }`}
    >
      {/* Фоновый пиль активного состояния с layoutId для плавного перехода */}
      {active && (
        <motion.div
          layoutId="view-toggle-bg"
          className="absolute inset-0 bg-white dark:bg-slate-700 rounded-lg shadow-sm"
          transition={{ type: 'spring', bounce: 0.2, duration: 0.35 }}
        />
      )}
      <span className="relative z-10">{children}</span>
    </button>
  );
}