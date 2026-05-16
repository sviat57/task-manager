import { useMemo, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CheckCircle2, TrendingUp, Clock, Flame, Archive, X,
  AlertTriangle, Tag, BarChart3,
} from 'lucide-react';
import { TaskItem } from '../tasks/TaskItem';
import { completedToday, completedThisWeek } from '../../utils/helpers';
import { CATEGORIES, PRIORITIES } from '../../constants';
import { groupTasksByDeadlineDay } from '../../utils/deadlineHelpers';
import { useSwipe } from '../../hooks/useSwipe';
import { isPast, isToday } from 'date-fns';

const TABS = [
  { id: 'overview',  label: 'Общая',           icon: BarChart3 },
  { id: 'priority',  label: 'Приоритеты',      icon: Flame },
  { id: 'deadlines', label: 'Дедлайны',        icon: Clock },
  { id: 'tags',      label: 'Теги',            icon: Tag },
  { id: 'completed', label: 'Выполнено',       icon: CheckCircle2 },
];

export function StatsPanel({ tasks, onToggle, onDelete, onOpen, onToggleSubtask }) {
  const [activeTab, setActiveTab] = useState('overview');
  const [activeModal, setActiveModal] = useState(null);

  const tabIndex = TABS.findIndex(t => t.id === activeTab);
  const goTab = useCallback((index) => {
    const next = TABS[Math.max(0, Math.min(TABS.length - 1, index))];
    setActiveTab(next.id);
  }, []);

  const swipeHandlers = useSwipe({
    onSwipeLeft:  () => goTab(tabIndex + 1),
    onSwipeRight: () => goTab(tabIndex - 1),
  });

  const todayDone   = useMemo(() => completedToday(tasks),    [tasks]);
  const weekDone    = useMemo(() => completedThisWeek(tasks), [tasks]);
  const activeTasks = useMemo(() => tasks.filter(t => !t.completed), [tasks]);
  const allDone     = useMemo(() => tasks.filter(t => t.completed),  [tasks]);
  const overdueTasks = useMemo(
    () => activeTasks.filter(t => t.deadline && isPast(new Date(t.deadline)) && !isToday(new Date(t.deadline))),
    [activeTasks]
  );
  const inProgressTasks = useMemo(
    () => activeTasks.filter(t => {
      if (!t.deadline) return true;
      const dl = new Date(t.deadline);
      return !isPast(dl) || isToday(dl);
    }),
    [activeTasks]
  );

  const statusSlices = useMemo(() => [
    { id: 'done',      label: 'Выполнено',   value: allDone.length,       color: '#10b981', tasks: allDone },
    { id: 'progress',  label: 'В процессе',  value: inProgressTasks.length, color: '#3b82f6', tasks: inProgressTasks },
    { id: 'overdue',   label: 'Просрочено',  value: overdueTasks.length,  color: '#ef4444', tasks: overdueTasks },
  ], [allDone, inProgressTasks, overdueTasks]);

  const stats = [
    {
      icon: Flame,
      label: 'Выполнено сегодня',
      value: todayDone.length,
      color: 'bg-orange-500',
      tasks: todayDone,
      empty: 'Сегодня задач не выполнено',
    },
    {
      icon: TrendingUp,
      label: 'За эту неделю',
      value: weekDone.length,
      color: 'bg-violet-500',
      tasks: weekDone,
      empty: 'На этой неделе задач не выполнено',
    },
    {
      icon: Clock,
      label: 'Активных задач',
      value: activeTasks.length,
      color: 'bg-blue-500',
      tasks: activeTasks,
      empty: 'Нет активных задач',
    },
    {
      icon: CheckCircle2,
      label: 'Всего выполнено',
      value: allDone.length,
      color: 'bg-emerald-500',
      tasks: allDone,
      empty: 'Нет выполненных задач',
    },
  ];

  const byPriority = useMemo(() =>
    Object.entries(PRIORITIES).map(([key, p]) => ({
      key,
      ...p,
      total: tasks.filter(t => t.priority === key).length,
      done:  tasks.filter(t => t.priority === key && t.completed).length,
      tasks: tasks.filter(t => t.priority === key),
    })).filter(p => p.total > 0),
    [tasks]
  );

  const deadlineBuckets = useMemo(() => groupTasksByDeadlineDay(tasks), [tasks]);

  const byCategory = useMemo(() =>
    CATEGORIES.map(cat => ({
      ...cat,
      total: tasks.filter(t => t.category === cat.id).length,
      done:  tasks.filter(t => t.category === cat.id && t.completed).length,
      tasks: tasks.filter(t => t.category === cat.id),
    })).filter(c => c.total > 0),
    [tasks]
  );

  const openModal = (title, taskList, empty) => {
    if (!taskList.length) return;
    setActiveModal({ label: title, tasks: taskList, empty });
  };

  return (
    <div
      className="space-y-4 touch-pan-y"
      onTouchStart={swipeHandlers.onTouchStart}
      onTouchMove={swipeHandlers.onTouchMove}
      onTouchEnd={swipeHandlers.onTouchEnd}
    >
      {/* Вкладки */}
      <div className="flex gap-1 overflow-x-auto pb-1 -mx-1 px-1 scrollbar-none" data-swipe-ignore>
        {TABS.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id)}
            className={`
              flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium
              whitespace-nowrap transition-colors cursor-pointer flex-shrink-0
              ${activeTab === tab.id
                ? 'bg-primary text-primary-fg'
                : 'bg-theme-elevated text-theme-muted hover:text-theme-main'
              }
            `}
          >
            <tab.icon size={12} />
            {tab.label}
          </button>
        ))}
      </div>

      <TabDots count={TABS.length} active={tabIndex} />

      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, x: 24 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -24 }}
          transition={{ duration: 0.2 }}
        >
          {activeTab === 'overview' && (
            <OverviewTab
              stats={stats}
              statusSlices={statusSlices}
              onOpenModal={openModal}
            />
          )}
          {activeTab === 'priority' && (
            <PriorityTab items={byPriority} onOpenModal={openModal} />
          )}
          {activeTab === 'deadlines' && (
            <DeadlinesTab buckets={deadlineBuckets} onOpenModal={openModal} />
          )}
          {activeTab === 'tags' && (
            <TagsTab items={byCategory} onOpenModal={openModal} />
          )}
          {activeTab === 'completed' && (
            <CompletedTab
              tasks={allDone}
              onToggle={onToggle}
              onDelete={onDelete}
              onOpen={onOpen}
              onToggleSubtask={onToggleSubtask}
            />
          )}
        </motion.div>
      </AnimatePresence>

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

function TabDots({ count, active }) {
  return (
    <motion.div className="flex justify-center gap-1.5" layout>
      {Array.from({ length: count }).map((_, i) => (
        <span
          key={i}
          className={`h-1.5 rounded-full transition-all duration-200
            ${i === active ? 'w-4 bg-primary' : 'w-1.5 bg-theme-muted/35'}`}
        />
      ))}
    </motion.div>
  );
}

function OverviewTab({ stats, statusSlices, onOpenModal }) {
  const total = statusSlices.reduce((s, x) => s + x.value, 0) || 1;

  return (
    <div className="space-y-4 md:grid md:grid-cols-2 md:gap-4 md:space-y-0">
      <div className="space-y-3 md:col-span-2">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {stats.map((stat, i) => (
            <motion.button
              key={stat.label}
              type="button"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
              onClick={() => onOpenModal(stat.label, stat.tasks, stat.empty)}
              className={`
                text-left p-4 rounded-2xl border transition-all duration-200
                bg-theme-surface border-theme
                ${stat.tasks.length > 0
                  ? 'hover:shadow-card-hover cursor-pointer hover:-translate-y-0.5'
                  : 'cursor-default opacity-80'
                }
              `}
            >
              <motion.div className={`w-9 h-9 rounded-xl flex items-center justify-center mb-2 ${stat.color}`} layout>
                <stat.icon size={18} className="text-white" />
              </motion.div>
              <p className="text-2xl font-bold text-theme-main">{stat.value}</p>
              <p className="text-xs text-theme-muted mt-0.5">{stat.label}</p>
              {stat.tasks.length > 0 && (
                <p className="text-[10px] text-theme-muted/70 mt-1">Нажми → список</p>
              )}
            </motion.button>
          ))}
        </div>
      </div>

      <div className="bg-theme-surface rounded-2xl p-5 border border-theme">
        <h3 className="font-semibold text-theme-main mb-4 flex items-center gap-2">
          <BarChart3 size={16} />
          По статусам
        </h3>
        <div className="flex flex-col sm:flex-row items-center gap-6">
          <StatusPieChart slices={statusSlices} total={total} />
          <div className="flex-1 w-full space-y-2">
            {statusSlices.map((slice) => (
              <button
                key={slice.id}
                type="button"
                onClick={() => onOpenModal(slice.label, slice.tasks, `Нет задач: ${slice.label.toLowerCase()}`)}
                disabled={!slice.value}
                className={`
                  w-full flex items-center justify-between text-sm py-1.5 px-2 rounded-lg
                  transition-colors
                  ${slice.value ? 'hover:bg-theme-elevated cursor-pointer' : 'opacity-50 cursor-default'}
                `}
              >
                <span className="flex items-center gap-2 text-theme-muted">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ background: slice.color }} />
                  {slice.label}
                </span>
                <span className="font-semibold text-theme-main">{slice.value}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      <motion.div className="bg-theme-surface rounded-2xl p-5 border border-theme" layout>
        <h3 className="font-semibold text-theme-main mb-3 flex items-center gap-2">
          <AlertTriangle size={16} className="text-red-500" />
          Быстрый обзор
        </h3>
        <p className="text-sm text-theme-muted">
          Свайп влево/вправо переключает вкладки статистики. Нажмите на цифру, чтобы увидеть список задач.
        </p>
      </motion.div>
    </div>
  );
}

function StatusPieChart({ slices, total }) {
  const radius = 52;
  const cx = 60;
  const cy = 60;
  let cumulative = 0;

  const arcs = slices.map((slice) => {
    const pct = slice.value / total;
    const startAngle = cumulative * 2 * Math.PI - Math.PI / 2;
    cumulative += pct;
    const endAngle = cumulative * 2 * Math.PI - Math.PI / 2;
    const x1 = cx + radius * Math.cos(startAngle);
    const y1 = cy + radius * Math.sin(startAngle);
    const x2 = cx + radius * Math.cos(endAngle);
    const y2 = cy + radius * Math.sin(endAngle);
    const large = pct > 0.5 ? 1 : 0;
    const d = pct >= 0.999
      ? `M ${cx} ${cy - radius} A ${radius} ${radius} 0 1 1 ${cx - 0.01} ${cy - radius}`
      : `M ${cx} ${cy} L ${x1} ${y1} A ${radius} ${radius} 0 ${large} 1 ${x2} ${y2} Z`;
    return { ...slice, d, pct };
  });

  return (
    <svg width="120" height="120" viewBox="0 0 120 120" className="flex-shrink-0">
      <circle cx={cx} cy={cy} r={radius} fill="var(--bg-elevated)" />
      {arcs.map((arc) => arc.pct > 0 && (
        <path key={arc.id} d={arc.d} fill={arc.color} className="transition-all duration-500" />
      ))}
      <circle cx={cx} cy={cy} r={32} fill="var(--bg-surface)" />
      <text x={cx} y={cy} textAnchor="middle" dominantBaseline="middle"
        className="fill-theme-main text-lg font-bold" style={{ fontSize: 14 }}>
        {total}
      </text>
    </svg>
  );
}

function PriorityTab({ items, onOpenModal }) {
  return (
    <motion.div className="space-y-3" layout>
      {items.length === 0 ? (
        <EmptyHint text="Нет задач с приоритетами" />
      ) : (
        items.map((p) => (
          <button
            key={p.key}
            type="button"
            onClick={() => onOpenModal(p.label, p.tasks, 'Нет задач')}
            className="w-full text-left p-4 rounded-xl border border-theme bg-theme-surface
              hover:bg-theme-elevated transition-colors cursor-pointer"
          >
            <div className="flex justify-between text-sm mb-2">
              <span className={`font-semibold ${p.color}`}>{p.label}</span>
              <span className="text-theme-muted">{p.done}/{p.total}</span>
            </div>
            <motion.div className="h-2 rounded-full bg-theme-elevated overflow-hidden" layout>
              <motion.div
                className={`h-full rounded-full ${p.dot.replace('bg-', 'bg-')}`}
                style={{ width: `${p.total ? (p.done / p.total) * 100 : 0}%` }}
                initial={{ width: 0 }}
                animate={{ width: `${p.total ? (p.done / p.total) * 100 : 0}%` }}
              />
            </motion.div>
          </button>
        ))
      )}
    </motion.div>
  );
}

function DeadlinesTab({ buckets, onOpenModal }) {
  return (
    <motion.div className="space-y-3" layout>
      {buckets.length === 0 ? (
        <EmptyHint text="Нет задач с дедлайнами" />
      ) : (
        buckets.map((bucket) => (
          <button
            key={bucket.id}
            type="button"
            onClick={() => onOpenModal(bucket.label, bucket.tasks, 'Пусто')}
            className={`
              w-full flex items-center justify-between p-4 rounded-xl border
              bg-theme-surface border-theme hover:bg-theme-elevated
              transition-colors cursor-pointer text-left
              ${bucket.id === 'overdue' ? 'border-red-300/50 dark:border-red-800/50' : ''}
            `}
          >
            <span className="font-medium text-theme-main">{bucket.label}</span>
            <span className="text-lg font-bold text-theme-main">{bucket.tasks.length}</span>
          </button>
        ))
      )}
    </motion.div>
  );
}

function TagsTab({ items, onOpenModal }) {
  return (
    <motion.div className="space-y-3 md:grid md:grid-cols-2 md:gap-3 md:space-y-0" layout>
      {items.length === 0 ? (
        <EmptyHint text="Нет задач с тегами" />
      ) : (
        items.map((cat) => (
          <button
            key={cat.id}
            type="button"
            onClick={() => onOpenModal(cat.label, cat.tasks, 'Пусто')}
            className="w-full text-left p-4 rounded-xl border border-theme bg-theme-surface
              hover:bg-theme-elevated transition-colors cursor-pointer"
          >
            <motion.div className="flex justify-between text-sm mb-2" layout>
              <span className="text-theme-main font-medium">{cat.label}</span>
              <span className="text-theme-muted">{cat.done}/{cat.total}</span>
            </motion.div>
            <motion.div className="h-2 rounded-full bg-theme-elevated overflow-hidden" layout>
              <motion.div
                className={`h-full rounded-full ${cat.color}`}
                initial={{ width: 0 }}
                animate={{ width: `${cat.total ? (cat.done / cat.total) * 100 : 0}%` }}
              />
            </motion.div>
          </button>
        ))
      )}
    </motion.div>
  );
}

function CompletedTab({ tasks, onToggle, onDelete, onOpen, onToggleSubtask }) {
  return (
    <motion.div layout className="space-y-3">
      <div className="flex items-center gap-2">
        <Archive size={16} className="text-theme-muted" />
        <h3 className="font-semibold text-theme-main">
          Выполнено ({tasks.length})
        </h3>
      </div>
      <div
        className="max-h-[min(60vh,480px)] overflow-y-auto space-y-2 pr-1
          md:max-h-none md:grid md:grid-cols-2 lg:grid-cols-3 md:gap-3 md:space-y-0"
      >
        {tasks.length === 0 ? (
          <p className="text-center py-12 text-theme-muted text-sm col-span-full">
            Пока нет выполненных задач
          </p>
        ) : (
          tasks.map(task => (
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
      </div>
    </motion.div>
  );
}

function EmptyHint({ text }) {
  return <p className="text-center py-12 text-theme-muted text-sm">{text}</p>;
}

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
      exit={{ opacity: 0 }}
      onClick={e => e.target === e.currentTarget && onClose()}
    >
      <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={onClose} />

      <motion.div
        className="relative w-full max-w-lg bg-theme-surface rounded-2xl
          shadow-modal border border-theme max-h-[80vh] flex flex-col overflow-hidden"
        initial={{ opacity: 0, y: 24, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 24, scale: 0.97 }}
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
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-theme-elevated
              text-theme-muted transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        <motion.div className="flex-1 overflow-y-auto p-4 space-y-2" layout>
          {tasks.length === 0 ? (
            <p className="text-center py-8 text-sm text-theme-muted">{empty}</p>
          ) : (
            tasks.map(task => (
              <TaskItem
                key={task.id}
                task={task}
                onToggle={(id) => onToggle(id)}
                onDelete={onDelete}
                onOpen={onOpen}
                onToggleSubtask={onToggleSubtask}
              />
            ))
          )}
        </motion.div>
      </motion.div>
    </motion.div>
  );
}
