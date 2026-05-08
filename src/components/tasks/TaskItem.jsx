import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Trash2, ChevronRight, Clock,
  Flag, Tag, CheckCircle2, Pencil, X, Calendar
} from 'lucide-react';
import { Badge }       from '../ui/Badge';
import { ProgressBar } from '../ui/ProgressBar';
import { PRIORITIES, CATEGORIES } from '../../constants';
import {
  formatDeadline, isOverdue,
  getSubtaskProgress, getCategoryById
} from '../../utils/helpers';

/**
 * TaskItem — карточка задачи с единой логикой для List и Grid.
 *
 * Взаимодействия (одинаковые в обоих режимах):
 *  • Клик по телу карточки        → SlideOver с деталями
 *  • Клик по круглому чекбоксу    → отметить задачу выполненной (onToggle)
 *  • Клик по чекбоксу подзадачи   → onToggleSubtask + e.stopPropagation()
 *  • Клик по иконке корзины       → onDelete + e.stopPropagation()
 *  • Кнопка "Изменить" в SlideOver → onOpen (TaskModal)
 *  • Кнопка "Выполнено" в SlideOver → onToggle
 *
 * Визуальные различия List vs Grid:
 *  • List: горизонтальный layout, описание truncate, подзадачи за стрелкой
 *  • Grid: вертикальный layout, описание line-clamp-2, подзадачи видны сразу
 */
export function TaskItem({
  task,
  onToggle,
  onDelete,
  onOpen,
  onToggleSubtask,
  isGrid = false,
}) {
  const [hovered,   setHovered]   = useState(false);
  const [expanded,  setExpanded]  = useState(false);
  const [slideOver, setSlideOver] = useState(false);

  const priority    = PRIORITIES[task.priority];
  const category    = getCategoryById(CATEGORIES, task.category);
  const progress    = getSubtaskProgress(task.subtasks);
  const overdue     = !task.completed && isOverdue(task.deadline);
  const deadline    = formatDeadline(task.deadline);
  const hasSubtasks = task.subtasks?.length > 0;

  // ── Единый обработчик клика по телу карточки ────────────────────────────────
  const handleCardClick = () => setSlideOver(true);

  // ── Стоп-пропагация для всех интерактивных элементов внутри карточки ────────
  const stop = (fn) => (e) => { e.stopPropagation(); fn?.(e); };

  return (
    <>
      <motion.div
        layout
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0  }}
        exit={{   opacity: 0, x: -20, transition: { duration: 0.2 } }}
        onHoverStart={() => setHovered(true)}
        onHoverEnd={()   => setHovered(false)}
        onClick={handleCardClick}
        className={`
          group relative cursor-pointer select-none
          bg-white dark:bg-slate-900
          border rounded-2xl
          transition-all duration-200
          ${task.completed
            ? 'border-slate-100 dark:border-slate-800 opacity-60'
            : `border-slate-200 dark:border-slate-800
               hover:border-slate-300 dark:hover:border-slate-600
               hover:bg-slate-50/80 dark:hover:bg-slate-800/60
               hover:shadow-md dark:hover:shadow-slate-950/60`
          }
          ${isGrid ? 'p-4 flex flex-col gap-3' : 'p-4'}
        `}
      >
        {/* Цветная полоска приоритета слева */}
        <div className={`absolute left-0 top-3 bottom-3 w-0.5 rounded-full ${priority?.dot}`} />

        {/* ── Основной контент ───────────────────────────────────────────── */}
        <div className={`flex items-start gap-3 ml-2 ${isGrid ? 'flex-1' : ''}`}>

          {/* Чекбокс задачи */}
          <button
            onClick={stop(() => onToggle(task.id))}
            className={`
              flex-shrink-0 mt-0.5 w-5 h-5 rounded-full border-2
              transition-all duration-300 flex items-center justify-center cursor-pointer
              ${task.completed
                ? 'bg-violet-500 border-violet-500'
                : 'border-slate-300 dark:border-slate-600 hover:border-violet-400'
              }
            `}
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
            <p className={`
              font-medium text-sm leading-snug transition-all duration-300
              ${task.completed
                ? 'line-through text-slate-400 dark:text-slate-600'
                : 'text-slate-800 dark:text-slate-200'
              }
            `}>
              {task.title || (
                <span className="text-slate-400 dark:text-slate-600 italic">
                  Без названия
                </span>
              )}
            </p>

            {/* Описание */}
            {task.description && (
              <p className={`
                text-xs text-slate-400 dark:text-slate-500 mt-0.5
                ${isGrid ? 'line-clamp-2' : 'truncate'}
              `}>
                {task.description}
              </p>
            )}

            {/* Категория + Дедлайн — одинаково в обоих режимах */}
            <div className="flex items-center gap-2 mt-2 flex-wrap">
              {category && (
                <Badge className={category.light}>{category.label}</Badge>
              )}
              {deadline && (
                <span className={`
                  flex items-center gap-1 text-xs font-medium
                  ${overdue
                    ? 'text-red-500 dark:text-red-400'
                    : 'text-slate-400 dark:text-slate-500'
                  }
                `}>
                  <Clock size={10} />
                  {deadline}
                  {overdue && (
                    <span className="font-normal opacity-75">· просрочено</span>
                  )}
                </span>
              )}
            </div>

            {/* Прогресс подзадач */}
            {hasSubtasks && (
              <div className="mt-2.5">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs text-slate-400">
                    {task.subtasks.filter(s => s.completed).length}
                    /{task.subtasks.length} подзадач
                  </span>
                  <span className="text-xs text-slate-400">{progress}%</span>
                </div>
                <ProgressBar value={progress} />
              </div>
            )}
          </div>

          {/* ── Кнопки справа (удалить + раскрыть подзадачи в List) ───────── */}
          <div
            className={`
              flex items-center gap-1 flex-shrink-0 self-start
              transition-opacity duration-150
              ${hovered ? 'opacity-100' : 'opacity-0'}
            `}
            onClick={stop()} /* блокируем всплытие чтобы не открывать SlideOver */
          >
            <button
              onClick={stop(() => onDelete(task.id))}
              className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20
                text-slate-400 hover:text-red-500 transition-colors cursor-pointer"
            >
              <Trash2 size={14} />
            </button>

            {/* Стрелка раскрытия подзадач — только в List-режиме */}
            {!isGrid && hasSubtasks && (
              <button
                onClick={stop(() => setExpanded(v => !v))}
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
          </div>
        </div>

        {/* ── Инлайн-подзадачи в List-режиме (раскрываются стрелкой) ─────── */}
        <AnimatePresence initial={false}>
          {!isGrid && expanded && hasSubtasks && (
            <motion.div
              key="subtasks-inline"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{   opacity: 0, height: 0 }}
              transition={{ duration: 0.22, ease: 'easeInOut' }}
              className="overflow-hidden"
            >
              <div className="ml-10 mt-3 space-y-2
                border-t border-slate-100 dark:border-slate-800 pt-3">
                {task.subtasks.map(subtask => (
                  <InlineSubtask
                    key={subtask.id}
                    subtask={subtask}
                    onToggle={stop(() => onToggleSubtask?.(task.id, subtask.id))}
                  />
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Подзадачи в Grid-режиме (видны сразу, первые 3) ────────────── */}
        {isGrid && hasSubtasks && (
          <div
            className="ml-2 space-y-1.5 border-t border-slate-100
              dark:border-slate-800 pt-3"
            onClick={stop()} /* чтобы клик по зоне подзадач не открывал SlideOver */
          >
            {task.subtasks.slice(0, 3).map(subtask => (
              <InlineSubtask
                key={subtask.id}
                subtask={subtask}
                onToggle={stop(() => onToggleSubtask?.(task.id, subtask.id))}
              />
            ))}
            {task.subtasks.length > 3 && (
              <p className="text-xs text-slate-400 dark:text-slate-600 pl-6">
                +{task.subtasks.length - 3} ещё...
              </p>
            )}
          </div>
        )}
      </motion.div>

      {/* ── SlideOver: выдвижная панель деталей ─────────────────────────────── */}
      <AnimatePresence>
        {slideOver && (
          <TaskSlideOver
            task={task}
            priority={priority}
            category={category}
            deadline={deadline}
            overdue={overdue}
            progress={progress}
            onClose={() => setSlideOver(false)}
            onEdit={() => { setSlideOver(false); onOpen(task); }}
            onToggle={() => { onToggle(task.id); setSlideOver(false); }}
            onToggleSubtask={onToggleSubtask}
          />
        )}
      </AnimatePresence>
    </>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   InlineSubtask — кликабельный чекбокс подзадачи внутри карточки.
   onToggle уже обёрнут в stop() на уровне выше.
   ───────────────────────────────────────────────────────────────────────────── */
function InlineSubtask({ subtask, onToggle }) {
  return (
    <motion.div layout className="flex items-center gap-2">
      <button
        onClick={onToggle}
        className={`
          flex-shrink-0 w-3.5 h-3.5 rounded border-2
          transition-all duration-200 cursor-pointer
          flex items-center justify-center
          ${subtask.completed
            ? 'bg-violet-500 border-violet-500'
            : 'border-slate-300 dark:border-slate-600 hover:border-violet-400'
          }
        `}
      >
        {subtask.completed && (
          <svg viewBox="0 0 12 12" fill="none" className="w-full h-full p-px">
            <path d="M2 6l3 3 5-5" stroke="white" strokeWidth="2.5"
              strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        )}
      </button>
      <span className={`
        text-xs select-none transition-all duration-200
        ${subtask.completed
          ? 'line-through text-slate-400 dark:text-slate-600'
          : 'text-slate-600 dark:text-slate-400'
        }
      `}>
        {subtask.title}
      </span>
    </motion.div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   TaskSlideOver — выдвижная панель с полной информацией.
   Одинакова для List и Grid — SlideOver не знает откуда был вызван.
   ───────────────────────────────────────────────────────────────────────────── */
function TaskSlideOver({
  task, priority, category, deadline, overdue, progress,
  onClose, onEdit, onToggle, onToggleSubtask,
}) {
  return (
    <motion.div
      className="fixed inset-0 z-50 flex justify-end"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{   opacity: 0 }}
      transition={{ duration: 0.2 }}
    >
      {/* Затемнение фона */}
      <motion.div
        className="absolute inset-0 bg-black/30 dark:bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Панель */}
      <motion.div
        className="relative w-full max-w-md h-full bg-white dark:bg-slate-900
          shadow-2xl flex flex-col overflow-hidden"
        initial={{ x: '100%' }}
        animate={{ x: 0 }}
        exit={{   x: '100%' }}
        transition={{ type: 'spring', damping: 28, stiffness: 300 }}
      >
        {/* Шапка */}
        <div className="flex items-center justify-between px-6 pt-6 pb-4
          border-b border-slate-100 dark:border-slate-800 flex-shrink-0">
          <div className="flex items-center gap-2">
            <span className={`w-2 h-2 rounded-full ${priority?.dot}`} />
            <span className={`text-xs font-semibold ${priority?.color}`}>
              {priority?.label}
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800
              text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Скроллируемый контент */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">

          {/* Заголовок */}
          <div>
            <h2 className={`text-xl font-bold leading-snug
              ${task.completed
                ? 'line-through text-slate-400 dark:text-slate-600'
                : 'text-slate-900 dark:text-slate-100'
              }`}
            >
              {task.title || (
                <span className="italic text-slate-400">Без названия</span>
              )}
            </h2>
            {task.completed && (
              <span className="inline-flex items-center gap-1 mt-2 text-xs font-medium
                text-emerald-600 dark:text-emerald-400
                bg-emerald-50 dark:bg-emerald-900/30 px-2 py-1 rounded-full">
                <CheckCircle2 size={11} />
                Выполнено
              </span>
            )}
          </div>

          {/* Описание */}
          {task.description && (
            <div className="bg-slate-50 dark:bg-slate-800/60 rounded-2xl p-4">
              <p className="text-sm text-slate-600 dark:text-slate-300
                leading-relaxed whitespace-pre-wrap">
                {task.description}
              </p>
            </div>
          )}

          {/* Мета-блоки */}
          <div className="grid grid-cols-2 gap-3">
            {deadline && (
              <MetaBlock
                icon={<Calendar size={14} />}
                label="Дедлайн"
                value={deadline}
                accent={overdue
                  ? 'text-red-500 dark:text-red-400'
                  : 'text-slate-700 dark:text-slate-300'
                }
                bg={overdue
                  ? 'bg-red-50 dark:bg-red-900/20 border-red-100 dark:border-red-900/40'
                  : 'bg-slate-50 dark:bg-slate-800/60 border-slate-100 dark:border-slate-800'
                }
              />
            )}
            {category && (
              <MetaBlock
                icon={<Tag size={14} />}
                label="Категория"
                value={category.label}
                accent="text-slate-700 dark:text-slate-300"
                bg="bg-slate-50 dark:bg-slate-800/60 border-slate-100 dark:border-slate-800"
              />
            )}
            <MetaBlock
              icon={<Flag size={14} />}
              label="Приоритет"
              value={priority?.label}
              accent={priority?.color}
              bg={`${priority?.bg} ${priority?.border}`}
            />
          </div>

          {/* Подзадачи в SlideOver — тоже кликабельны */}
          {task.subtasks?.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-semibold
                  text-slate-700 dark:text-slate-300">
                  Подзадачи
                </span>
                <span className="text-xs text-slate-400">
                  {task.subtasks.filter(s => s.completed).length}
                  /{task.subtasks.length}
                </span>
              </div>
              <ProgressBar value={progress} className="mb-3" />
              <div className="space-y-2.5">
                {task.subtasks.map(subtask => (
                  <motion.div
                    key={subtask.id}
                    layout
                    className="flex items-center gap-3"
                  >
                    <button
                      onClick={() => onToggleSubtask?.(task.id, subtask.id)}
                      className={`
                        flex-shrink-0 w-4 h-4 rounded border-2
                        transition-all duration-200 cursor-pointer
                        flex items-center justify-center
                        ${subtask.completed
                          ? 'bg-violet-500 border-violet-500'
                          : 'border-slate-300 dark:border-slate-600 hover:border-violet-400'
                        }
                      `}
                    >
                      {subtask.completed && (
                        <svg viewBox="0 0 12 12" fill="none"
                          className="w-full h-full p-0.5">
                          <path d="M2 6l3 3 5-5" stroke="white" strokeWidth="2.2"
                            strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      )}
                    </button>
                    <span className={`
                      text-sm transition-all duration-200
                      ${subtask.completed
                        ? 'line-through text-slate-400 dark:text-slate-600'
                        : 'text-slate-700 dark:text-slate-300'
                      }
                    `}>
                      {subtask.title}
                    </span>
                  </motion.div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Две кнопки снизу */}
        <div className="flex-shrink-0 flex gap-3 px-6 py-5
          border-t border-slate-100 dark:border-slate-800">
          <button
            onClick={onEdit}
            className="flex-1 flex items-center justify-center gap-2 py-3
              bg-slate-100 dark:bg-slate-800
              hover:bg-slate-200 dark:hover:bg-slate-700
              text-slate-700 dark:text-slate-300
              text-sm font-semibold rounded-2xl
              transition-colors duration-150 cursor-pointer"
          >
            <Pencil size={15} />
            Изменить
          </button>
          <button
            onClick={onToggle}
            className={`
              flex-1 flex items-center justify-center gap-2 py-3
              text-sm font-semibold rounded-2xl
              transition-colors duration-150 cursor-pointer
              ${task.completed
                ? `bg-slate-200 dark:bg-slate-700
                   hover:bg-slate-300 dark:hover:bg-slate-600
                   text-slate-600 dark:text-slate-300`
                : `bg-violet-600 hover:bg-violet-700 text-white
                   shadow-md shadow-violet-200 dark:shadow-violet-900`
              }
            `}
          >
            <CheckCircle2 size={15} />
            {task.completed ? 'Вернуть' : 'Выполнено'}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   MetaBlock — плашка с иконкой, лейблом и значением в SlideOver
   ───────────────────────────────────────────────────────────────────────────── */
function MetaBlock({ icon, label, value, accent, bg }) {
  return (
    <div className={`rounded-xl border p-3 ${bg}`}>
      <div className="flex items-center gap-1.5 text-slate-400 mb-1">
        {icon}
        <span className="text-xs">{label}</span>
      </div>
      <p className={`text-sm font-semibold ${accent}`}>{value}</p>
    </div>
  );
}