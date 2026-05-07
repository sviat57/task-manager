import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2, TrendingUp, Clock, Flame, Archive } from 'lucide-react';
import { AnimatePresence } from 'framer-motion';
import { TaskItem } from '../tasks/TaskItem';
import { completedToday, completedThisWeek } from '../../utils/helpers';
import { CATEGORIES } from '../../constants';

function StatCard({ icon: Icon, label, value, color, delay = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className="bg-white dark:bg-slate-900 rounded-2xl p-5
        border border-slate-200 dark:border-slate-800 shadow-sm"
    >
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${color}`}>
        <Icon size={20} className="text-white" />
      </div>
      <p className="text-2xl font-bold text-slate-800 dark:text-slate-200">{value}</p>
      <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">{label}</p>
    </motion.div>
  );
}

export function StatsPanel({ tasks, onToggle, onDelete, onOpen }) {
  const todayDone   = useMemo(() => completedToday(tasks), [tasks]);
  const weekDone    = useMemo(() => completedThisWeek(tasks), [tasks]);
  const totalActive = tasks.filter(t => !t.completed).length;
  const allDone     = tasks.filter(t => t.completed);

  // Статистика по категориям
  const byCategory = useMemo(() => {
    return CATEGORIES.map(cat => ({
      ...cat,
      total: tasks.filter(t => t.category === cat.id).length,
      done:  tasks.filter(t => t.category === cat.id && t.completed).length,
    })).filter(c => c.total > 0);
  }, [tasks]);

  return (
    <div className="space-y-6">
      {/* Карточки статистики */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard icon={Flame}       label="Выполнено сегодня"   value={todayDone.length}   color="bg-orange-500" delay={0}    />
        <StatCard icon={TrendingUp}  label="За эту неделю"       value={weekDone.length}    color="bg-violet-500" delay={0.05} />
        <StatCard icon={Clock}       label="Активных задач"       value={totalActive}        color="bg-blue-500"   delay={0.1}  />
        <StatCard icon={CheckCircle2}label="Всего выполнено"      value={allDone.length}     color="bg-emerald-500"delay={0.15} />
      </div>

      {/* Прогресс по категориям */}
      {byCategory.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white dark:bg-slate-900 rounded-2xl p-5
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

      {/* Архив выполненных задач */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
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
                />
              ))
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
}