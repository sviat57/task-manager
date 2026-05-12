import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';
import { ArrowLeft, Trash2, RotateCcw, X } from 'lucide-react';
import { AlertModal } from './AlertModal';
import { Badge } from './Badge';
import { PRIORITIES, CATEGORIES } from '../../constants';
import { formatDeadline, getCategoryById, plural } from '../../utils/helpers';

// Принимаем onBack:
export function TrashPanel({
  trashed, onRestore, onPermanentDelete, onEmptyTrash, onBack
}) {
  const [confirmDelete, setConfirmDelete] = useState(null);

  return (
    <>
      <div className="space-y-4">

        {/* ── Шапка с кнопкой Назад ──────────────────────────────────── */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">

            {/* Кнопка Назад — очевидный выход из корзины */}
            <button
              onClick={onBack}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl
                bg-theme-surface border border-theme
                text-theme-muted hover:text-theme-main
                hover:bg-theme-elevated
                text-sm font-medium transition-colors cursor-pointer"
            >
              <ArrowLeft size={15} />
              Назад
            </button>

            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl
                bg-red-50 dark:bg-red-900/30
                flex items-center justify-center">
                <Trash2 size={16} className="text-red-500" />
              </div>
              <div>
                <h2 className="font-semibold text-theme-main text-sm">
                  Корзина
                </h2>
                <p className="text-xs text-theme-muted">
                  {trashed.length} {plural(trashed.length, 'задача', 'задачи', 'задач')}
                </p>
              </div>
            </div>
          </div>

          {/* Кнопка очистки — только если есть задачи */}
          {trashed.length > 0 && (
            <button
              onClick={() => setConfirmDelete('all')}
              className="text-xs font-medium text-red-500 hover:text-red-600
                px-3 py-1.5 rounded-xl
                hover:bg-red-50 dark:hover:bg-red-900/20
                transition-colors cursor-pointer"
            >
              Очистить всё
            </button>
          )}
        </div>

        {/* ── Список удалённых задач ──────────────────────────────────── */}
        <div className="space-y-2">
          <AnimatePresence mode="popLayout">
            {trashed.length === 0 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex flex-col items-center justify-center py-20 text-center"
              >
                <div className="w-14 h-14 rounded-2xl bg-theme-elevated
                  flex items-center justify-center mb-3">
                  <Trash2 size={24} className="text-theme-muted opacity-40" />
                </div>
                <p className="text-sm font-medium text-theme-muted">
                  Корзина пуста
                </p>
                <p className="text-xs text-theme-muted opacity-60 mt-1">
                  Удалённые задачи появятся здесь
                </p>
                {/* Кнопка назад в пустом состоянии — дополнительная точка выхода */}
                <button
                  onClick={onBack}
                  className="mt-6 flex items-center gap-2 px-4 py-2
                    bg-primary text-primary-fg text-sm font-medium
                    rounded-card transition-colors cursor-pointer
                    hover:bg-primary-hover"
                >
                  <ArrowLeft size={14} />
                  Вернуться к задачам
                </button>
              </motion.div>
            ) : (
              trashed.map(task => (
                <TrashedTaskRow
                  key={task.id}
                  task={task}
                  onRestore={() => onRestore(task.id)}
                  onDelete={() => setConfirmDelete(task.id)}
                />
              ))
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Подтверждение удаления */}
      <AlertModal
        isOpen={!!confirmDelete}
        title={confirmDelete === 'all' ? 'Очистить корзину?' : 'Удалить навсегда?'}
        message={
          confirmDelete === 'all'
            ? `Все ${trashed.length} задач будут удалены безвозвратно.`
            : 'Задача будет удалена без возможности восстановления.'
        }
        confirmLabel={confirmDelete === 'all' ? 'Очистить всё' : 'Удалить'}
        onConfirm={() => {
          if (confirmDelete === 'all') onEmptyTrash();
          else onPermanentDelete(confirmDelete);
          setConfirmDelete(null);
        }}
        onCancel={() => setConfirmDelete(null)}
      />
    </>
  );
}

/* ── TrashedTaskRow — строка удалённой задачи ────────────────────────────── */
function TrashedTaskRow({ task, onRestore, onDelete }) {
  const priority    = PRIORITIES[task.priority];
  const category    = getCategoryById(CATEGORIES, task.category);
  const deadline    = formatDeadline(task.deadline);
  const deletedLabel = task.deletedAt
    ? format(new Date(task.deletedAt), 'd MMM, HH:mm', { locale: ru })
    : null;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8  }}
      animate={{ opacity: 1, y: 0  }}
      exit={{   opacity: 0, x: 20  }}
      className="flex items-start gap-3 p-3 rounded-card
        bg-theme-surface border border-theme shadow-card"
    >
      <div className={`flex-shrink-0 w-1.5 h-1.5 rounded-full mt-2 ${priority?.dot}`} />

      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-theme-muted line-through truncate">
          {task.title || <span className="italic">Без названия</span>}
        </p>
        <div className="flex items-center gap-2 mt-1 flex-wrap">
          {category && (
            <Badge className={`${category.light} opacity-60`}>{category.label}</Badge>
          )}
          {deadline && (
            <span className="text-xs text-theme-muted">{deadline}</span>
          )}
          {deletedLabel && (
            <span className="text-xs text-theme-muted opacity-50">
              · удалено {deletedLabel}
            </span>
          )}
        </div>
      </div>

      <div className="flex items-center gap-1 flex-shrink-0">
        <button
          onClick={onRestore}
          title="Восстановить"
          className="p-1.5 rounded-lg text-theme-muted
            hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/20
            transition-colors cursor-pointer"
        >
          <RotateCcw size={14} />
        </button>
        <button
          onClick={onDelete}
          title="Удалить навсегда"
          className="p-1.5 rounded-lg text-theme-muted
            hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20
            transition-colors cursor-pointer"
        >
          <X size={14} />
        </button>
      </div>
    </motion.div>
  );
}