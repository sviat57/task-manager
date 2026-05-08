import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trash2, ChevronRight, Calendar, ChevronDown } from 'lucide-react';
import { Badge }       from '../ui/Badge';
import { ProgressBar } from '../ui/ProgressBar';
import { PRIORITIES, CATEGORIES } from '../../constants';
import { formatDeadline, isOverdue, getSubtaskProgress, getCategoryById } from '../../utils/helpers';

/**
 * TaskItem — карточка задачи.
 *
 * Два режима клика:
 *  • Клик на стрелку (ChevronRight/Down) → раскрыть инлайн-подзадачи
 *  • Клик на остальную карточку → открыть модалку (onOpen)
 *
 * Пропсы:
 *  @param {object}   task
 *  @param {function} onToggle          — отметить задачу выполненной
 *  @param {function} onDelete
 *  @param {function} onOpen            — открыть TaskModal
 *  @param {function} onToggleSubtask   — переключить подзадачу инлайн
 *  @param {boolean}  isGrid            — режим сетки (меняет layout)
 */
export function TaskItem({ task, onToggle, onDelete, onOpen, onToggleSubtask, isGrid = false }) {
  const [hovered,  setHovered]  = useState(false);
  // expanded — показывать ли подзадачи прямо в карточке
  const [expanded, setExpanded] = useState(false);

  const priority = PRIORITIES[task.priority];
  const category = getCategoryById(CATEGORIES, task.category);
  const progress  = getSubtaskProgress(task.subtasks);
  const overdue   = !task.completed && isOverdue(task.deadline);
  const deadline  = formatDeadline(task.deadline);
  const hasSubtasks = task.subtasks?.length > 0;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0  }}
      exit={{   opacity: 0, x: -20, transition: { duration: 0.2 } }}
      whileHover={{ y: isGrid ? 0 : -1 }}
      onHoverStart={() => setHovered(true)}
      onHoverEnd={()   => setHovered(false)}
      className={`group relative bg-white dark:bg-slate-900 rounded-2xl
        border transition-all duration-200 select-none
        ${task.completed
          ? 'border-slate-100 dark:border-slate-800 opacity-70'
          : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 hover:shadow-md dark:hover:shadow-slate-950'
        }
        ${isGrid ? 'p-4 flex flex-col gap-3 cursor-default' : 'p-4 cursor-pointer'}
      `}
      // В режиме Grid клик по карточке открывает модалку
      // В режиме List кликабельна только специальная кнопка (чтобы стрелка не конфликтовала)
      onClick={() => isGrid && onOpen(task)}
    >
      {/* Цветная полоска приоритета слева */}
      <div className={`absolute left-0 top-3 bottom-3 w-0.5 rounded-full ${priority?.dot}`} />

      {/* ── Верхняя строка ─────────────────────────────────────────────────── */}
      <div
        className={`flex items-start gap-3 ml-2 ${!isGrid ? 'cursor-pointer' : ''}`}
        onClick={() => !isGrid && onOpen(task)}
      >
        {/* Чекбокс задачи */}
        <button
          onClick={(e) => { e.stopPropagation(); onToggle(task.id); }}
          className={`flex-shrink-0 mt-0.5 w-5 h-5 rounded-full border-2
            transition-all duration-300 flex items-center justify-center cursor-pointer
            ${task.completed
              ? 'bg-violet-500 border-violet-500'
              : 'border-slate-300 dark:border-slate-600 hover:border-violet-400'
            }`}
        >
          {task.completed && (
            <motion.svg
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              viewBox="0 0 12 12" fill="none" className="w-3 h-3"
            >
              <path d="M2 6l3 3 5-5" stroke="white" strokeWidth="2.2"
                strokeLinecap="round" strokeLinejoin="round"/>
            </motion.svg>
          )}
        </button>

        {/* Текст + мета */}
        <div className="flex-1 min-w-0">
          {/* Заголовок */}
          <p className={`font-medium text-sm leading-snug transition-all duration-300
            ${task.completed
              ? 'line-through text-slate-400 dark:text-slate-600'
              : 'text-slate-800 dark:text-slate-200'
            }`}
          >
            {task.title || <span className="text-slate-400 italic">Без названия</span>}
          </p>

          {/* Описание */}
          {task.description && (
            <p className={`text-xs text-slate-400 dark:text-slate-500 mt-0.5
              ${isGrid ? 'line-clamp-2' : 'truncate'}`}>
              {task.description}
            </p>
          )}

          {/* Теги и дедлайн */}
          <div className="flex items-center gap-2 mt-2 flex-wrap">
            {category && (
              <Badge className={category.light}>{category.label}</Badge>
            )}
            {deadline && (
              <span className={`flex items-center gap-1 text-xs
                ${overdue ? 'text-red-500' : 'text-slate-400 dark:text-slate-500'}`}
              >
                <Calendar size={10} />
                {deadline}
              </span>
            )}
          </div>

          {/* Прогресс-бар подзадач (всегда виден) */}
          {hasSubtasks && (
            <div className="mt-2.5">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs text-slate-400">
                  {task.subtasks.filter(s => s.completed).length}/{task.subtasks.length} подзадач
                </span>
                <span className="text-xs text-slate-400">{progress}%</span>
              </div>
              <ProgressBar value={progress} />
            </div>
          )}
        </div>

        {/* ── Кнопки справа ──────────────────────────────────────────────── */}
        <div
          className={`flex items-center gap-1 flex-shrink-0 transition-opacity duration-200
            ${hovered ? 'opacity-100' : 'opacity-0'}`}
          onClick={e => e.stopPropagation()}
        >
          <button
            onClick={() => onDelete(task.id)}
            className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20
              text-slate-400 hover:text-red-500 transition-colors cursor-pointer"
          >
            <Trash2 size={14} />
          </button>

          {/* Стрелка — раскрыть инлайн-подзадачи (только в List-режиме) */}
          {!isGrid && hasSubtasks && (
            <button
              onClick={(e) => { e.stopPropagation(); setExpanded(v => !v); }}
              className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800
                text-slate-400 transition-colors cursor-pointer"
            >
              <motion.div
                animate={{ rotate: expanded ? 90 : 0 }}
                transition={{ duration: 0.2 }}
              >
                <ChevronRight size={16} />
              </motion.div>
            </button>
          )}

          {/* В режиме Grid — кнопка «открыть модалку» вместо стрелки */}
          {isGrid && (
            <button
              onClick={() => onOpen(task)}
              className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800
                text-slate-400 transition-colors cursor-pointer"
            >
              <ChevronRight size={16} />
            </button>
          )}
        </div>
      </div>

      {/* ── Инлайн-подзадачи (раскрываются в List-режиме) ─────────────────── */}
      <AnimatePresence initial={false}>
        {!isGrid && expanded && hasSubtasks && (
          <motion.div
            key="subtasks"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{   opacity: 0, height: 0 }}
            transition={{ duration: 0.25, ease: 'easeInOut' }}
            className="overflow-hidden"
          >
            <div className="ml-10 mt-3 space-y-2 pb-1
              border-t border-slate-100 dark:border-slate-800 pt-3">
              {task.subtasks.map(subtask => (
                <InlineSubtask
                  key={subtask.id}
                  subtask={subtask}
                  onToggle={() => onToggleSubtask?.(task.id, subtask.id)}
                />
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── В Grid-режиме подзадачи видны всегда (компактно) ──────────────── */}
      {isGrid && hasSubtasks && (
        <div className="ml-2 space-y-1.5 border-t border-slate-100
          dark:border-slate-800 pt-3">
          {task.subtasks.slice(0, 3).map(subtask => (
            <InlineSubtask
              key={subtask.id}
              subtask={subtask}
              onToggle={(e) => { e.stopPropagation(); onToggleSubtask?.(task.id, subtask.id); }}
            />
          ))}
          {/* Если подзадач больше 3 — показываем счётчик */}
          {task.subtasks.length > 3 && (
            <p className="text-xs text-slate-400 pl-6">
              +{task.subtasks.length - 3} ещё...
            </p>
          )}
        </div>
      )}
    </motion.div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   InlineSubtask — мини-компонент подзадачи внутри карточки.
   Отдельный компонент чтобы не загромождать TaskItem.
   ───────────────────────────────────────────────────────────────────────────── */
function InlineSubtask({ subtask, onToggle }) {
  return (
    <motion.div
      layout
      className="flex items-center gap-2 group/sub"
    >
      <button
        onClick={onToggle}
        className={`flex-shrink-0 w-3.5 h-3.5 rounded border-2 transition-all duration-200
          cursor-pointer flex items-center justify-center
          ${subtask.completed
            ? 'bg-violet-500 border-violet-500'
            : 'border-slate-300 dark:border-slate-600 hover:border-violet-400'
          }`}
      >
        {subtask.completed && (
          <svg viewBox="0 0 12 12" fill="none" className="w-full h-full p-px">
            <path d="M2 6l3 3 5-5" stroke="white" strokeWidth="2.5"
              strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        )}
      </button>
      <span className={`text-xs transition-all duration-200
        ${subtask.completed
          ? 'line-through text-slate-400 dark:text-slate-600'
          : 'text-slate-600 dark:text-slate-400'
        }`}
      >
        {subtask.title}
      </span>
    </motion.div>
  );
}