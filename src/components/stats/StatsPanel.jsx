import { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, TrendingUp, Clock, Flame, Archive, X } from 'lucide-react';
import { TaskItem } from '../tasks/TaskItem';
import { completedToday, completedThisWeek } from '../../utils/helpers';
import { CATEGORIES } from '../../constants';

/**
 * StatsPanel — статистика с кликабельными карточками.
 *
 * При клике на карточку открывается StatTasksModal со списком
 * конкретных задач, формирующих эту цифру.
 */
export function StatsPanel({ tasks, onToggle, onDelete, onOpen, onToggleSubtask }) {
  // activeModal: { title, tasks[] } | null
  const [activeModal, setActiveModal] = useState(null);

  const todayDone   = useMemo(() => completedToday(tasks),    [tasks]);
  const weekDone    = useMemo(() => completedThisWeek(tasks), [tasks]);
  const activeTasks = useMemo(() => tasks.filter(t => !t.completed), [tasks]);
  const allDone     = useMemo(() => tasks.filter(t => t.completed),  [tasks]);

  const stats = [
    {
      icon: Flame,
      label: 'Выполнено сегодня',
      value: todayDone.length,
      color: 'bg-orange-500',
      light: 'bg-orange-50 dark:bg-orange-900/20',
      tasks: todayDone,
      empty: 'Сегодня задач не выполнено',
    },
    {
      icon: TrendingUp,
      label: 'За эту неделю',
      value: weekDone.length,
      color: 'bg-violet-500',
      light: 'bg-violet-50 dark:bg-violet-900/20',
      tasks: weekDone,
      empty: 'На этой неделе задач не выполнено',
    },
    {
      icon: Clock,
      label: 'Активных задач',
      value: activeTasks.length,
      color: 'bg-blue-500',
      light: 'bg-blue-50 dark:bg-blue-900/20',
      tasks: activeTasks,
      empty: 'Нет активных задач',
    },
    {
      icon: CheckCircle2,
      label: 'Всего выполнено',
      value: allDone.length,
      color: 'bg-emerald-500',
      light: 'bg-emerald-50 dark:bg-emerald-900/20',
      tasks: allDone,
      empty: 'Нет выполненных задач',
    },
  ];

  // Статистика по категориям
  const byCategory = useMemo(() =>
    CATEGORIES.map(cat => ({
      ...cat,
      total: tasks.filter(t => t.category === cat.id).length,
      done:  tasks.filter(t => t.category === cat.id && t.completed).length,
    })).filter(c => c.total > 0),
    [tasks]
  );

  return (
    <div className="space-y-6">

      {/* ── Кликабельные карточки статистики ──────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {stats.map((stat, i) => (
          <motion.button
            key={stat.label}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0  }}
            transition={{ delay: i * 0.05 }}
            onClick={() => stat.tasks.length > 0 && setActiveModal(stat)}
            className={`
              text-left p-5 rounded-2xl border transition-all duration-200
              bg-theme-surface
              border-slate-200 dark:border-slate-800
              ${stat.tasks.length > 0
                ? 'hover:shadow-md hover:border-slate-300 dark:hover:border-slate-700 cursor-pointer hover:-translate-y-0.5'
                : 'cursor-default opacity-80'
              }
            `}
          >
            <div className={`w-10 h-10 rounded-xl flex items-center
              justify-center mb-3 ${stat.color}`}>
              <stat.icon size={20} className="text-white" />
            </div>
            <p className="text-2xl font-bold text-slate-800 dark:text-slate-200">
              {stat.value}
            </p>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
              {stat.label}
            </p>
            {/* Подсказка "кликни" если есть задачи */}
            {stat.tasks.length > 0 && (
              <p className="text-xs text-slate-300 dark:text-slate-600 mt-1">
                Нажми чтобы посмотреть →
              </p>
            )}
          </motion.button>
        ))}
      </div>

      {/* ── Прогресс по категориям ─────────────────────────────────────────── */}
      {byCategory.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0  }}
          transition={{ delay: 0.2 }}
          className="bg-theme-surface rounded-2xl p-5
            border border-slate-200 dark:border-slate-800"
        >
          <h3 className="font-semibold text-slate-800 dark:text-slate-200 mb-4">
            По категориям
          </h3>
          <div className="space-y-3">
            {byCategory.map(cat => (
              <div key={cat.id}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-slate-600 dark:text-slate-400">{cat.label}</span>
                  <span className="text-slate-400">{cat.done}/{cat.total}</span>
                </div>
                <div className="h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                  <motion.div
                    className={`h-full rounded-full ${cat.color}`}
                    initial={{ width: 0 }}
                    animate={{ width: cat.total ? `${(cat.done / cat.total) * 100}%` : '0%' }}
                    transition={{ duration: 0.6, delay: 0.3, ease: 'easeOut' }}
                  />
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* ── Архив выполненных ─────────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0  }}
        transition={{ delay: 0.25 }}
      >
        <div className="flex items-center gap-2 mb-3">
          <Archive size={16} className="text-slate-400" />
          <h3 className="font-semibold text-slate-800 dark:text-slate-200">Архив</h3>
        </div>
        <div className="space-y-2">
          <AnimatePresence>
            {allDone.length === 0 ? (
              <p className="text-center py-8 text-slate-400 text-sm">
                Пока нет выполненных задач
              </p>
            ) : (
              allDone.map(task => (
                <TaskItem
                  key={task.id}
                  task={task}
                  onToggle={onToggle}
                  onDelete={onDelete}
                  onOpen={onOpen}
                  onToggleSubtask={onToggleSubtask}
                />
              ))
            )}
          </AnimatePresence>
        </div>
      </motion.div>

      {/* ── Модалка со списком задач по карточке ──────────────────────────── */}
      <AnimatePresence>
        {activeModal && (
          <StatTasksModal
            title={activeModal.label}
            tasks={activeModal.tasks}
            empty={activeModal.empty}
            onClose={() => setActiveModal(null)}
            onToggle={onToggle}
            onDelete={onDelete}
            onOpen={onOpen}
            onToggleSubtask={onToggleSubtask}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   StatTasksModal — модалка со списком задач, открывается по клику на карточку.
   ───────────────────────────────────────────────────────────────────────────── */
function StatTasksModal({
  title, tasks, empty, onClose,
  onToggle, onDelete, onOpen, onToggleSubtask,
}) {
  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center"
      style={{
        padding: 'calc(1rem + env(safe-area-inset-top, 0px)) calc(1rem + env(safe-area-inset-right, 0px)) calc(1rem + env(safe-area-inset-bottom, 0px)) calc(1rem + env(safe-area-inset-left, 0px))',
      }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{   opacity: 0 }}
      onClick={e => e.target === e.currentTarget && onClose()}
    >
      {/* Оверлей */}
      <div
        className="absolute inset-0 bg-black/30 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Карточка */}
      <motion.div
        className="relative w-full max-w-lg bg-theme-surface rounded-2xl
          shadow-2xl border border-slate-200 dark:border-slate-700
          max-h-[80vh] flex flex-col overflow-hidden"
        initial={{ opacity: 0, y: 24, scale: 0.97 }}
        animate={{ opacity: 1, y: 0,  scale: 1    }}
        exit={{   opacity: 0, y: 24, scale: 0.97 }}
        transition={{ type: 'spring', duration: 0.35, bounce: 0.2 }}
      >
        {/* Шапка */}
        <div className="flex items-center justify-between px-5 py-4
          border-b border-slate-100 dark:border-slate-800 flex-shrink-0">
          <div>
            <h3 className="font-semibold text-slate-900 dark:text-slate-100">
              {title}
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              {tasks.length} {tasks.length === 1 ? 'задача' : 'задач'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800
              text-slate-400 transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Список задач */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          {tasks.length === 0 ? (
            <p className="text-center py-8 text-sm text-slate-400">{empty}</p>
          ) : (
            tasks.map(task => (
              <TaskItem
                key={task.id}
                task={task}
                onToggle={(id) => { onToggle(id); }}
                onDelete={onDelete}
                onOpen={onOpen}
                onToggleSubtask={onToggleSubtask}
              />
            ))
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}