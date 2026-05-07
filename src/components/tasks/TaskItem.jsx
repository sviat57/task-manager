import { useState } from 'react';
import { motion } from 'framer-motion';
import { Trash2, ChevronRight, Calendar, MoreHorizontal } from 'lucide-react';
import { Badge } from '../ui/Badge';
import { ProgressBar } from '../ui/ProgressBar';
import { PRIORITIES, CATEGORIES } from '../../constants';
import { formatDeadline, isOverdue, getSubtaskProgress, getCategoryById } from '../../utils/helpers';

export function TaskItem({ task, onToggle, onDelete, onOpen }) {
  const [hovered, setHovered] = useState(false);

  const priority = PRIORITIES[task.priority];
  const category = getCategoryById(CATEGORIES, task.category);
  const progress  = getSubtaskProgress(task.subtasks);
  const overdue   = !task.completed && isOverdue(task.deadline);
  const deadline  = formatDeadline(task.deadline);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0  }}
      exit={{   opacity: 0, x: -20, transition: { duration: 0.2 } }}
      whileHover={{ y: -1 }}
      onHoverStart={() => setHovered(true)}
      onHoverEnd={()   => setHovered(false)}
      className={`group relative bg-white dark:bg-slate-900 rounded-2xl p-4
        border transition-all duration-200 cursor-pointer select-none
        ${task.completed
          ? 'border-slate-100 dark:border-slate-800 opacity-70'
          : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 hover:shadow-md dark:hover:shadow-slate-950'
        }`}
      onClick={() => onOpen(task)}
    >
      {/* Цветная полоска приоритета слева */}
      <div className={`absolute left-0 top-3 bottom-3 w-0.5 rounded-full ${priority?.dot}`} />

      <div className="flex items-start gap-3 ml-2">
        {/* Чекбокс */}
        <button
          onClick={(e) => { e.stopPropagation(); onToggle(task.id); }}
          className={`flex-shrink-0 mt-0.5 w-5 h-5 rounded-full border-2 transition-all duration-300
            flex items-center justify-center cursor-pointer
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
              <path d="M2 6l3 3 5-5" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
            </motion.svg>
          )}
        </button>

        <div className="flex-1 min-w-0">
          {/* Заголовок задачи */}
          <p className={`font-medium text-sm leading-snug transition-all duration-300
            ${task.completed
              ? 'line-through text-slate-400 dark:text-slate-600'
              : 'text-slate-800 dark:text-slate-200'
            }`}
          >
            {task.title || <span className="text-slate-400 italic">Без названия</span>}
          </p>

          {/* Описание (если есть) */}
          {task.description && (
            <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5 truncate">
              {task.description}
            </p>
          )}

          {/* Мета-данные: теги, дедлайн */}
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

          {/* Прогресс-бар подзадач */}
          {task.subtasks?.length > 0 && (
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

        {/* Кнопка "открыть деталь" */}
        <div className={`flex items-center gap-1 transition-opacity duration-200
          ${hovered ? 'opacity-100' : 'opacity-0'}`}
        >
          <button
            onClick={(e) => { e.stopPropagation(); onDelete(task.id); }}
            className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20
              text-slate-400 hover:text-red-500 transition-colors cursor-pointer"
          >
            <Trash2 size={14} />
          </button>
          <ChevronRight size={16} className="text-slate-400" />
        </div>
      </div>
    </motion.div>
  );
}