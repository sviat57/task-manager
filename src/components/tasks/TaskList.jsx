import { useState, useMemo } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Plus, Search, SlidersHorizontal, CheckCircle2, LayoutList, LayoutGrid } from 'lucide-react';
import { TaskItem }  from './TaskItem';
import { Button }    from '../ui/Button';
import { PRIORITIES, CATEGORIES, SORT_OPTIONS } from '../../constants';
 
export function TaskList({ tasks, onAddTask, onToggle, onDelete, onOpen, onToggleSubtask }) {
  const [search,         setSearch]         = useState('');
  const [sortBy,         setSortBy]         = useState('createdAt_desc');
  const [filterPriority, setFilterPriority] = useState('all');
  const [filterCategory, setFilterCategory] = useState('all');
  const [showFilters,    setShowFilters]    = useState(false);
 
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
 
      {/* ── Тулбар ───────────────────────────────────────────────────────── */}
      <div className="space-y-3">
        <div className="flex gap-2">
 
          {/* Поиск */}
          <div className="relative flex-1">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-theme-muted" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Поиск задач..."
              className="w-full pl-9 pr-4 py-2 text-sm
                bg-theme-surface border border-theme rounded-xl outline-none
                text-theme-main placeholder:text-theme-muted
                transition-all"
              style={{ fontFamily: 'var(--font-main)' }}
            />
          </div>
 
          {/* Переключатель List / Grid */}
          <div className="flex items-center bg-theme-elevated rounded-xl p-1 gap-0.5">
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
 
          {/* Кнопка фильтров */}
          <button
            onClick={() => setShowFilters(v => !v)}
            className={`
              inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm font-medium
              border border-theme transition-colors duration-150 cursor-pointer
              ${showFilters
                ? 'bg-primary text-primary-fg border-primary'
                : 'bg-theme-surface text-theme-muted hover:bg-theme-elevated hover:text-theme-main'
              }
            `}
          >
            <SlidersHorizontal size={14} />
          </button>
 
          {/* Кнопка новой задачи */}
          <button
            onClick={onAddTask}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm
              font-medium bg-primary hover:bg-primary-hover text-primary-fg
              transition-colors duration-150 cursor-pointer shadow-card"
          >
            <Plus size={15} />
            <span className="hidden sm:inline">Задача</span>
          </button>
        </div>
 
        {/* Панель фильтров */}
        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{   opacity: 0, height: 0 }}
              className="overflow-hidden"
            >
              <div className="flex gap-3 flex-wrap p-3 bg-theme-elevated
                rounded-xl border border-theme">
 
                {/* Сортировка */}
                <select
                  value={sortBy}
                  onChange={e => setSortBy(e.target.value)}
                  className="text-xs bg-theme-surface border border-theme
                    rounded-lg px-2 py-1.5 outline-none
                    text-theme-main cursor-pointer"
                  style={{ fontFamily: 'var(--font-main)' }}
                >
                  {SORT_OPTIONS.map(o => (
                    <option key={o.value} value={o.value}>{o.label}</option>
                  ))}
                </select>
 
                {/* Приоритет */}
                <select
                  value={filterPriority}
                  onChange={e => setFilterPriority(e.target.value)}
                  className="text-xs bg-theme-surface border border-theme
                    rounded-lg px-2 py-1.5 outline-none
                    text-theme-main cursor-pointer"
                  style={{ fontFamily: 'var(--font-main)' }}
                >
                  <option value="all">Все приоритеты</option>
                  {Object.entries(PRIORITIES).map(([k, p]) => (
                    <option key={k} value={k}>{p.label}</option>
                  ))}
                </select>
 
                {/* Категория */}
                <select
                  value={filterCategory}
                  onChange={e => setFilterCategory(e.target.value)}
                  className="text-xs bg-theme-surface border border-theme
                    rounded-lg px-2 py-1.5 outline-none
                    text-theme-main cursor-pointer"
                  style={{ fontFamily: 'var(--font-main)' }}
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
 
      {/* ── Задачи ───────────────────────────────────────────────────────── */}
      <AnimatePresence mode="wait">
        <motion.div
          key={viewMode}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{   opacity: 0 }}
          transition={{ duration: 0.18 }}
          className={
            viewMode === 'grid'
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
              className={`text-center py-16 ${viewMode === 'grid' ? 'col-span-full' : ''}`}
            >
              <CheckCircle2 size={40} className="mx-auto text-theme-muted opacity-30 mb-3" />
              <p className="text-theme-muted text-sm font-medium">
                {search ? 'Ничего не найдено' : 'Задач нет — самое время создать!'}
              </p>
            </motion.div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
 
/* ── ViewToggleBtn ───────────────────────────────────────────────────────── */
function ViewToggleBtn({ active, onClick, children, title }) {
  return (
    <button
      onClick={onClick}
      title={title}
      className={`relative p-1.5 rounded-lg transition-colors duration-150 cursor-pointer
        ${active ? 'text-theme-main' : 'text-theme-muted hover:text-theme-main'}`}
    >
      {active && (
        <motion.div
          layoutId="view-toggle-bg"
          className="absolute inset-0 bg-theme-surface rounded-lg shadow-card"
          transition={{ type: 'spring', bounce: 0.2, duration: 0.35 }}
        />
      )}
      <span className="relative z-10">{children}</span>
    </button>
  );
}
