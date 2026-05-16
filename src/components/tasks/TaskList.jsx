import { useState, useMemo, useCallback } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Plus, Search, SlidersHorizontal, CheckCircle2, LayoutList, LayoutGrid } from 'lucide-react';
import { TaskItem } from './TaskItem';
import { TodayTasksSection } from './TodayTasksSection';
import { PRIORITIES, CATEGORIES, SORT_OPTIONS } from '../../constants';
import { compareByDeadline } from '../../utils/deadlineHelpers';
import { useSwipe } from '../../hooks/useSwipe';

/**
 * TaskList — адаптивный список задач.
 * Свайп ←/→ по всей области переключает list ↔ grid (порог 50px).
 */
export function TaskList({ tasks, onAddTask, onToggle, onDelete, onOpen, onToggleSubtask }) {
  const [search,         setSearch]         = useState('');
  const [sortBy,         setSortBy]         = useState('deadline_asc');
  const [filterPriority, setFilterPriority] = useState('all');
  const [filterCategory, setFilterCategory] = useState('all');
  const [showFilters,    setShowFilters]    = useState(false);

  const [viewMode, setViewMode] = useState(
    () => localStorage.getItem('tm_listview') || 'list'
  );

  const handleViewMode = useCallback((mode) => {
    setViewMode(mode);
    localStorage.setItem('tm_listview', mode);
  }, []);

  const swipeHandlers = useSwipe({
    onSwipeLeft:  () => viewMode === 'list' && handleViewMode('grid'),
    onSwipeRight: () => viewMode === 'grid' && handleViewMode('list'),
  });

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
        case 'deadline_asc':   return compareByDeadline(a, b);
        case 'priority_desc':  return (PRIORITIES[b.priority]?.order||0) - (PRIORITIES[a.priority]?.order||0);
        case 'title_asc':      return a.title.localeCompare(b.title);
        default:               return new Date(b.createdAt) - new Date(a.createdAt);
      }
    });
  }, [tasks, search, sortBy, filterPriority, filterCategory]);

  return (
    <motion.div
      className="space-y-3 touch-pan-y"
      onTouchStart={swipeHandlers.onTouchStart}
      onTouchMove={swipeHandlers.onTouchMove}
      onTouchEnd={swipeHandlers.onTouchEnd}
    >
      <TodayTasksSection
        tasks={tasks}
        onOpen={onOpen}
        onToggle={onToggle}
        onAddTask={onAddTask}
      />

      {/* ── Тулбар ───────────────────────────────────────────────────────── */}
      <motion.div className="space-y-2" layout>
        <div className="flex gap-2">
          <motion.div className="relative flex-1 min-w-0" layout>
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-theme-muted" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Поиск задач..."
              className="w-full pl-9 pr-3 py-2 text-sm bg-theme-surface
                border border-theme rounded-xl outline-none
                text-theme-main placeholder:text-theme-muted transition-all"
            />
          </motion.div>

          <div className="hidden md:flex items-center bg-theme-elevated rounded-xl p-1 gap-0.5">
            <ViewToggleBtn active={viewMode==='list'} onClick={()=>handleViewMode('list')} title="Список">
              <LayoutList size={15} />
            </ViewToggleBtn>
            <ViewToggleBtn active={viewMode==='grid'} onClick={()=>handleViewMode('grid')} title="Сетка">
              <LayoutGrid size={15} />
            </ViewToggleBtn>
          </div>

          <button
            onClick={() => setShowFilters(v => !v)}
            className={`inline-flex items-center px-3 py-2 rounded-xl text-sm
              border transition-colors cursor-pointer
              ${showFilters
                ? 'bg-primary text-primary-fg border-primary'
                : 'bg-theme-surface text-theme-muted border-theme hover:bg-theme-elevated'
              }`}
          >
            <SlidersHorizontal size={14} />
          </button>

          <button
            onClick={onAddTask}
            className="inline-flex items-center gap-1 px-3 py-2 rounded-xl text-sm
              font-medium bg-primary hover:bg-primary-hover text-primary-fg
              transition-colors cursor-pointer shadow-card"
          >
            <Plus size={15} />
            <span className="hidden sm:inline">Задача</span>
          </button>
        </div>

        {/* Мобильный переключатель + индикатор режима */}
        <div className="flex md:hidden flex-col items-center gap-2">
          <motion.div className="flex gap-1" layout>
            <button
              onClick={() => handleViewMode('list')}
              className={`flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium
                transition-colors cursor-pointer
                ${viewMode==='list' ? 'bg-primary text-primary-fg' : 'bg-theme-elevated text-theme-muted'}`}
            >
              <LayoutList size={11} /> Список
            </button>
            <button
              onClick={() => handleViewMode('grid')}
              className={`flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium
                transition-colors cursor-pointer
                ${viewMode==='grid' ? 'bg-primary text-primary-fg' : 'bg-theme-elevated text-theme-muted'}`}
            >
              <LayoutGrid size={11} /> Плитки
            </button>
          </motion.div>
          <ViewModeDots mode={viewMode} />
          <span className="text-[10px] text-theme-muted opacity-60">← свайп для переключения →</span>
        </div>

        <div className="hidden md:flex justify-center">
          <ViewModeDots mode={viewMode} />
        </div>

        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{   opacity: 0, height: 0 }}
              className="overflow-hidden"
              data-swipe-ignore
            >
              <div className="flex gap-2 flex-wrap p-3 bg-theme-elevated rounded-xl border border-theme">
                <select value={sortBy} onChange={e=>setSortBy(e.target.value)}
                  className="text-xs bg-theme-surface border border-theme rounded-lg px-2 py-1.5 outline-none text-theme-main cursor-pointer flex-1 min-w-[130px]">
                  {SORT_OPTIONS.map(o=><option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
                <select value={filterPriority} onChange={e=>setFilterPriority(e.target.value)}
                  className="text-xs bg-theme-surface border border-theme rounded-lg px-2 py-1.5 outline-none text-theme-main cursor-pointer flex-1 min-w-[130px]">
                  <option value="all">Все приоритеты</option>
                  {Object.entries(PRIORITIES).map(([k,p])=><option key={k} value={k}>{p.label}</option>)}
                </select>
                <select value={filterCategory} onChange={e=>setFilterCategory(e.target.value)}
                  className="text-xs bg-theme-surface border border-theme rounded-lg px-2 py-1.5 outline-none text-theme-main cursor-pointer flex-1 min-w-[130px]">
                  <option value="all">Все категории</option>
                  {CATEGORIES.map(c=><option key={c.id} value={c.id}>{c.label}</option>)}
                </select>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* ── Список задач ─────────────────────────────────────────────────── */}
      <AnimatePresence mode="wait">
        <motion.div
          key={viewMode}
          initial={{ opacity: 0, x: viewMode === 'grid' ? 40 : -40 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: viewMode === 'grid' ? -40 : 40 }}
          transition={{ duration: 0.22, ease: 'easeOut' }}
          className={
            viewMode === 'grid'
              ? 'grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-2 md:gap-3'
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
                isGrid={viewMode==='grid'}
              />
            ))}
          </AnimatePresence>

          {processed.length === 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className={`text-center py-16 ${viewMode==='grid' ? 'col-span-full' : ''}`}
            >
              <CheckCircle2 size={36} className="mx-auto text-theme-muted opacity-20 mb-3" />
              <p className="text-theme-muted text-sm">
                {search ? 'Ничего не найдено' : 'Задач нет — самое время создать!'}
              </p>
            </motion.div>
          )}
        </motion.div>
      </AnimatePresence>
    </motion.div>
  );
}

function ViewModeDots({ mode }) {
  return (
    <div className="flex items-center gap-1.5" role="tablist" aria-label="Режим отображения">
      <span
        role="tab"
        aria-selected={mode === 'list'}
        className={`h-1.5 rounded-full transition-all duration-200
          ${mode === 'list' ? 'w-5 bg-primary' : 'w-1.5 bg-theme-muted/35'}`}
      />
      <span
        role="tab"
        aria-selected={mode === 'grid'}
        className={`h-1.5 rounded-full transition-all duration-200
          ${mode === 'grid' ? 'w-5 bg-primary' : 'w-1.5 bg-theme-muted/35'}`}
      />
    </div>
  );
}

function ViewToggleBtn({ active, onClick, children, title }) {
  return (
    <button onClick={onClick} title={title}
      className={`relative p-1.5 rounded-lg transition-colors duration-150 cursor-pointer
        ${active ? 'text-theme-main' : 'text-theme-muted hover:text-theme-main'}`}>
      {active && (
        <motion.div layoutId="view-toggle-bg"
          className="absolute inset-0 bg-theme-surface rounded-lg shadow-card"
          transition={{ type:'spring', bounce:0.2, duration:0.35 }} />
      )}
      <span className="relative z-10">{children}</span>
    </button>
  );
}
