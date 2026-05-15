import { useState, useMemo, useRef } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Plus, Search, SlidersHorizontal, CheckCircle2, LayoutList, LayoutGrid } from 'lucide-react';
import { TaskItem }  from './TaskItem';
import { PRIORITIES, CATEGORIES, SORT_OPTIONS } from '../../constants';
 
/**
 * TaskList — адаптивный список задач.
 *
 * Мобиле:
 *  • Свайп ← переключает list → grid
 *  • Свайп → переключает grid → list
 *  • Grid: 2 компактные колонки
 *
 * Десктоп:
 *  • Кнопки переключения в тулбаре
 *  • Grid: 3 полные колонки
 */
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
 
  // ── Свайп между list/grid на мобиле ──────────────────────────────────────
  const touchStartX = useRef(null);
  const touchStartY = useRef(null);
  const isSwipingH  = useRef(false);
 
  const handleTouchStart = (e) => {
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
    isSwipingH.current  = false;
  };
 
  const handleTouchMove = (e) => {
    if (touchStartX.current === null) return;
    const dx = Math.abs(e.touches[0].clientX - touchStartX.current);
    const dy = Math.abs(e.touches[0].clientY - touchStartY.current);
    if (!isSwipingH.current && dx > dy && dx > 12) {
      isSwipingH.current = true;
    }
  };
 
  const handleTouchEnd = (e) => {
    if (!isSwipingH.current) return;
    const dx = e.changedTouches[0].clientX - touchStartX.current;
    const THRESHOLD = 60;
    if (dx < -THRESHOLD && viewMode === 'list') handleViewMode('grid');
    if (dx > THRESHOLD  && viewMode === 'grid') handleViewMode('list');
    touchStartX.current = null;
    isSwipingH.current  = false;
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
        case 'priority_desc':  return (PRIORITIES[b.priority]?.order||0) - (PRIORITIES[a.priority]?.order||0);
        case 'title_asc':      return a.title.localeCompare(b.title);
        default:               return new Date(b.createdAt) - new Date(a.createdAt);
      }
    });
  }, [tasks, search, sortBy, filterPriority, filterCategory]);
 
  return (
    <div className="space-y-3">
 
      {/* ── Тулбар ───────────────────────────────────────────────────────── */}
      <div className="space-y-2">
        <div className="flex gap-2">
          {/* Поиск */}
          <div className="relative flex-1 min-w-0">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-theme-muted" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Поиск задач..."
              className="w-full pl-9 pr-3 py-2 text-sm bg-theme-surface
                border border-theme rounded-xl outline-none
                text-theme-main placeholder:text-theme-muted transition-all"
            />
          </div>
 
          {/* Переключатель — только на md+ */}
          <div className="hidden md:flex items-center bg-theme-elevated rounded-xl p-1 gap-0.5">
            <ViewToggleBtn active={viewMode==='list'} onClick={()=>handleViewMode('list')} title="Список">
              <LayoutList size={15} />
            </ViewToggleBtn>
            <ViewToggleBtn active={viewMode==='grid'} onClick={()=>handleViewMode('grid')} title="Сетка">
              <LayoutGrid size={15} />
            </ViewToggleBtn>
          </div>
 
          {/* Фильтры */}
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
 
          {/* Добавить задачу */}
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
 
        {/* Мобильный переключатель + подсказка */}
        <div className="flex md:hidden items-center justify-between">
          <div className="flex gap-1">
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
          </div>
          <span className="text-xs text-theme-muted opacity-50">← свайп →</span>
        </div>
 
        {/* Фильтры панель */}
        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{   opacity: 0, height: 0 }}
              className="overflow-hidden"
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
      </div>
 
      {/* ── Список задач со свайпом ───────────────────────────────────────── */}
      <div
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={viewMode}
            initial={{ opacity: 0, x: viewMode==='grid' ? 24 : -24 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{   opacity: 0 }}
            transition={{ duration: 0.18 }}
            className={
              viewMode === 'grid'
                // Мобиле: 2 колонки | Десктоп: 3 колонки
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
      </div>
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
