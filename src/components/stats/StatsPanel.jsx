import { useMemo, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, TrendingUp, Clock, Flame, Archive, X, AlertTriangle } from 'lucide-react';
import { TaskItem } from '../tasks/TaskItem';
import { completedToday, completedThisWeek } from '../../utils/helpers';
import { CATEGORIES } from '../../constants';

/**
 * StatsPanel — статистика с кликабельными карточками,
 * круговой диаграммой и свайпом между вкладками.
 */
export function StatsPanel({ tasks, onToggle, onDelete, onOpen, onToggleSubtask }) {
  const [activeModal, setActiveModal] = useState(null);
  const [tabIndex, setTabIndex] = useState(0);

  const todayDone   = useMemo(() => completedToday(tasks),    [tasks]);
  const weekDone    = useMemo(() => completedThisWeek(tasks), [tasks]);
  const activeTasks = useMemo(() => tasks.filter(t => !t.completed), [tasks]);
  const allDone     = useMemo(() => tasks.filter(t => t.completed),  [tasks]);
  const overdue     = useMemo(() => tasks.filter(t => !t.completed && t.deadline && new Date(t.deadline) < new Date()), [tasks]);

  const stats = [
    { icon: Flame, label: 'Выполнено сегодня', value: todayDone.length, color: 'bg-orange-500', chartColor: '#f97316', tasks: todayDone, empty: 'Сегодня задач не выполнено' },
    { icon: TrendingUp, label: 'За эту неделю', value: weekDone.length, color: 'bg-violet-500', chartColor: '#8b5cf6', tasks: weekDone, empty: 'На этой неделе задач не выполнено' },
    { icon: Clock, label: 'Активных задач', value: activeTasks.length, color: 'bg-blue-500', chartColor: '#3b82f6', tasks: activeTasks, empty: 'Нет активных задач' },
    { icon: CheckCircle2, label: 'Всего выполнено', value: allDone.length, color: 'bg-emerald-500', chartColor: '#10b981', tasks: allDone, empty: 'Нет выполненных задач' },
  ];

  const byCategory = useMemo(() =>
    CATEGORIES.map(cat => ({
      ...cat,
      total: tasks.filter(t => t.category === cat.id).length,
      done:  tasks.filter(t => t.category === cat.id && t.completed).length,
    })).filter(c => c.total > 0),
    [tasks]
  );

  // Данные для кольцевой диаграммы
  const donutData = useMemo(() => {
    const segments = [
      { label: 'Выполнено', value: allDone.length, color: '#10b981' },
      { label: 'Активные', value: activeTasks.length - overdue.length, color: '#3b82f6' },
      { label: 'Просрочено', value: overdue.length, color: '#ef4444' },
    ].filter(s => s.value > 0);
    return segments;
  }, [allDone, activeTasks, overdue]);

  // Свайп вкладок
  const TABS = ['Обзор', 'По категориям'];
  const touchRef = useRef({ x: 0, swiping: false });
  const handleTouchStart = (e) => { touchRef.current = { x: e.touches[0].clientX, swiping: false }; };
  const handleTouchMove = (e) => {
    const dx = Math.abs(e.touches[0].clientX - touchRef.current.x);
    if (dx > 20) touchRef.current.swiping = true;
  };
  const handleTouchEnd = (e) => {
    if (!touchRef.current.swiping) return;
    const dx = e.changedTouches[0].clientX - touchRef.current.x;
    if (dx < -50 && tabIndex < TABS.length - 1) setTabIndex(i => i + 1);
    if (dx > 50 && tabIndex > 0) setTabIndex(i => i - 1);
  };

  return (
    <div className="space-y-6">

      {/* ── Табы ──────────────────────────────────────────────────────────── */}
      <div className="flex gap-1 bg-theme-elevated rounded-xl p-1">
        {TABS.map((tab, i) => (
          <button
            key={tab}
            onClick={() => setTabIndex(i)}
            className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all cursor-pointer
              ${tabIndex === i
                ? 'bg-theme-surface text-theme-main shadow-card'
                : 'text-theme-muted hover:text-theme-main'
              }`}
          >
            {tab}
          </button>
        ))}
      </div>

      <div
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <AnimatePresence mode="wait" initial={false}>
          {tabIndex === 0 ? (
            <motion.div
              key="overview"
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 30 }}
              transition={{ duration: 0.2 }}
              className="space-y-6"
            >
              {/* ── Диаграмма + Карточки ──────────────────────────────────── */}
              <div className="flex flex-col sm:flex-row gap-4 items-center">
                {/* Кольцевая диаграмма */}
                <div className="flex-shrink-0">
                  <DonutChart data={donutData} total={tasks.length} />
                </div>

                {/* Карточки */}
                <div className="grid grid-cols-2 gap-3 flex-1 w-full">
                  {stats.map((stat, i) => (
                    <motion.button
                      key={stat.label}
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.05 }}
                      onClick={() => stat.tasks.length > 0 && setActiveModal(stat)}
                      className={`text-left p-4 rounded-2xl border transition-all duration-200
                        bg-theme-surface border-theme
                        ${stat.tasks.length > 0
                          ? 'hover:shadow-md cursor-pointer hover:-translate-y-0.5'
                          : 'cursor-default opacity-80'
                        }`}
                    >
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center mb-2 ${stat.color}`}>
                        <stat.icon size={16} className="text-white" />
                      </div>
                      <p className="text-xl font-bold text-theme-main">{stat.value}</p>
                      <p className="text-xs text-theme-muted mt-0.5">{stat.label}</p>
                    </motion.button>
                  ))}
                </div>
              </div>

              {/* Просроченные */}
              {overdue.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/40
                    rounded-2xl p-4"
                >
                  <div className="flex items-center gap-2 mb-3">
                    <AlertTriangle size={16} className="text-red-500" />
                    <h3 className="font-semibold text-red-700 dark:text-red-400 text-sm">
                      Просрочено: {overdue.length}
                    </h3>
                  </div>
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {overdue.map(task => (
                      <TaskItem
                        key={task.id}
                        task={task}
                        onToggle={onToggle}
                        onDelete={onDelete}
                        onOpen={onOpen}
                        onToggleSubtask={onToggleSubtask}
                      />
                    ))}
                  </div>
                </motion.div>
              )}

              {/* Архив */}
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.25 }}
              >
                <div className="flex items-center gap-2 mb-3">
                  <Archive size={16} className="text-theme-muted" />
                  <h3 className="font-semibold text-theme-main">Архив</h3>
                  <span className="text-xs text-theme-muted">({allDone.length})</span>
                </div>
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  <AnimatePresence>
                    {allDone.length === 0 ? (
                      <p className="text-center py-8 text-theme-muted text-sm">
                        Пока нет выполненных задач
                      </p>
                    ) : (
                      allDone.slice(0, 10).map(task => (
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
                  {allDone.length > 10 && (
                    <p className="text-center text-xs text-theme-muted py-2">
                      +{allDone.length - 10} ещё…
                    </p>
                  )}
                </div>
              </motion.div>
            </motion.div>
          ) : (
            <motion.div
              key="categories"
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -30 }}
              transition={{ duration: 0.2 }}
              className="space-y-4"
            >
              {/* ── Прогресс по категориям ────────────────────────────────── */}
              {byCategory.length > 0 ? (
                byCategory.map((cat, i) => (
                  <motion.div
                    key={cat.id}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="bg-theme-surface rounded-2xl p-4 border border-theme"
                  >
                    <div className="flex justify-between text-sm mb-2">
                      <span className="font-medium text-theme-main">{cat.label}</span>
                      <span className="text-theme-muted">{cat.done}/{cat.total}</span>
                    </div>
                    <div className="h-2.5 rounded-full bg-theme-elevated overflow-hidden">
                      <motion.div
                        className={`h-full rounded-full ${cat.color}`}
                        initial={{ width: 0 }}
                        animate={{ width: cat.total ? `${(cat.done / cat.total) * 100}%` : '0%' }}
                        transition={{ duration: 0.6, delay: 0.1 + i * 0.05, ease: 'easeOut' }}
                      />
                    </div>
                    <p className="text-xs text-theme-muted mt-1">
                      {cat.total > 0 ? `${Math.round((cat.done / cat.total) * 100)}% выполнено` : 'Нет задач'}
                    </p>
                  </motion.div>
                ))
              ) : (
                <p className="text-center py-12 text-theme-muted text-sm">Нет задач в категориях</p>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ── Модалка со списком задач ──────────────────────────────────────── */}
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

/* ── Кольцевая диаграмма (SVG) ──────────────────────────────────────────── */
function DonutChart({ data, total }) {
  const size = 140;
  const stroke = 18;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;

  let offset = 0;
  const segments = data.map(seg => {
    const pct = total > 0 ? seg.value / total : 0;
    const dashLen = circumference * pct;
    const dashOffset = circumference - offset;
    offset += dashLen;
    return { ...seg, pct, dashLen, dashOffset };
  });

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg viewBox={`0 0 ${size} ${size}`} className="transform -rotate-90">
        {/* Фон кольца */}
        <circle
          cx={size / 2} cy={size / 2} r={radius}
          fill="none" stroke="var(--bg-elevated)" strokeWidth={stroke}
        />
        {/* Сегменты */}
        {segments.map((seg, i) => (
          <motion.circle
            key={seg.label}
            cx={size / 2} cy={size / 2} r={radius}
            fill="none"
            stroke={seg.color}
            strokeWidth={stroke}
            strokeLinecap="round"
            strokeDasharray={`${seg.dashLen} ${circumference - seg.dashLen}`}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset: seg.dashOffset }}
            transition={{ duration: 0.8, delay: i * 0.15, ease: 'easeOut' }}
          />
        ))}
      </svg>
      {/* Центр */}
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-xl font-bold text-theme-main">{total}</span>
        <span className="text-[10px] text-theme-muted">задач</span>
      </div>
    </div>
  );
}

/* ── StatTasksModal ──────────────────────────────────────────────────────── */
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
      <div
        className="absolute inset-0 bg-black/30 backdrop-blur-sm"
        onClick={onClose}
      />

      <motion.div
        className="relative w-full max-w-lg bg-theme-surface rounded-2xl
          shadow-2xl border border-theme
          max-h-[80vh] flex flex-col overflow-hidden"
        initial={{ opacity: 0, y: 24, scale: 0.97 }}
        animate={{ opacity: 1, y: 0,  scale: 1    }}
        exit={{   opacity: 0, y: 24, scale: 0.97 }}
        transition={{ type: 'spring', duration: 0.35, bounce: 0.2 }}
      >
        <div className="flex items-center justify-between px-5 py-4
          border-b border-theme flex-shrink-0">
          <div>
            <h3 className="font-semibold text-theme-main">{title}</h3>
            <p className="text-xs text-theme-muted mt-0.5">
              {tasks.length} {tasks.length === 1 ? 'задача' : 'задач'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-theme-elevated
              text-theme-muted transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          {tasks.length === 0 ? (
            <p className="text-center py-8 text-sm text-theme-muted">{empty}</p>
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