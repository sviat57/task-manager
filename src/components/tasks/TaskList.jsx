import { useState, useMemo } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Plus, Search, SlidersHorizontal, CheckCircle2 } from 'lucide-react';
import { TaskItem } from './TaskItem';
import { Button } from '../ui/Button';
import { PRIORITIES, CATEGORIES, SORT_OPTIONS } from '../../constants';

export function TaskList({ tasks, onAddTask, onToggle, onDelete, onOpen }) {
  const [search,   setSearch]   = useState('');
  const [sortBy,   setSortBy]   = useState('createdAt_desc');
  const [filterPriority, setFilterPriority] = useState('all');
  const [filterCategory, setFilterCategory] = useState('all');
  const [showFilters, setShowFilters] = useState(false);

  // Фильтрация и сортировка выполняется без обращения к бэку,
  // используем useMemo чтобы не пересчитывать при каждом рендере
  const processed = useMemo(() => {
    let result = tasks.filter(t => !t.completed);

    // Поиск по названию и описанию
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(t =>
        t.title.toLowerCase().includes(q) ||
        t.description?.toLowerCase().includes(q)
      );
    }

    // Фильтр по приоритету
    if (filterPriority !== 'all') {
      result = result.filter(t => t.priority === filterPriority);
    }

    // Фильтр по категории
    if (filterCategory !== 'all') {
      result = result.filter(t => t.category === filterCategory);
    }

    // Сортировка
    result = [...result].sort((a, b) => {
      switch (sortBy) {
        case 'createdAt_asc':  return new Date(a.createdAt) - new Date(b.createdAt);
        case 'deadline_asc':   return (a.deadline || 'z').localeCompare(b.deadline || 'z');
        case 'priority_desc':  return (PRIORITIES[b.priority]?.order || 0) - (PRIORITIES[a.priority]?.order || 0);
        case 'title_asc':      return a.title.localeCompare(b.title);
        default:               return new Date(b.createdAt) - new Date(a.createdAt);
      }
    });

    return result;
  }, [tasks, search, sortBy, filterPriority, filterCategory]);

  return (
    <div className="space-y-4">
      {/* Поиск + Фильтры */}
      <div className="space-y-3">
        <div className="flex gap-2">
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
          <Button variant="outline" onClick={() => setShowFilters(v => !v)}>
            <SlidersHorizontal size={14} />
          </Button>
          <Button variant="primary" onClick={onAddTask}>
            <Plus size={15} /> Задача
          </Button>
        </div>

        {/* Панель фильтров с анимацией */}
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
                {/* Сортировка */}
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

                {/* Приоритет */}
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

                {/* Категория */}
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

      {/* Список задач */}
      <div className="space-y-2">
        <AnimatePresence mode="popLayout">
          {processed.map(task => (
            <TaskItem
              key={task.id}
              task={task}
              onToggle={onToggle}
              onDelete={onDelete}
              onOpen={onOpen}
            />
          ))}
        </AnimatePresence>

        {/* Пустое состояние */}
        {processed.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-16"
          >
            <CheckCircle2 size={40} className="mx-auto text-slate-200 dark:text-slate-700 mb-3" />
            <p className="text-slate-400 dark:text-slate-600 text-sm font-medium">
              {search ? 'Ничего не найдено' : 'Задач нет — самое время создать!'}
            </p>
          </motion.div>
        )}
      </div>
    </div>
  );
}