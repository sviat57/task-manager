import { motion } from 'framer-motion';
import { Trash2 } from 'lucide-react';

export function SubtaskItem({ subtask, onToggle, onDelete }) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: -8 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 8 }}
      className="flex items-center gap-2 group"
    >
      {/* Чекбокс подзадачи */}
      <button
        onClick={onToggle}
        className={`flex-shrink-0 w-4 h-4 rounded border-2 transition-all duration-200 cursor-pointer
          ${subtask.completed
            ? 'bg-violet-500 border-violet-500'
            : 'border-slate-300 dark:border-slate-600 hover:border-violet-400'
          }`}
      >
        {subtask.completed && (
          <svg viewBox="0 0 12 12" fill="none" className="w-full h-full p-0.5">
            <path d="M2 6l3 3 5-5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        )}
      </button>

      <span className={`flex-1 text-sm transition-all duration-300
        ${subtask.completed
          ? 'line-through text-slate-400 dark:text-slate-600'
          : 'text-slate-700 dark:text-slate-300'
        }`}
      >
        {subtask.title}
      </span>

      {/* Кнопка удаления — видна при hover */}
      <button
        onClick={onDelete}
        className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-red-500
          transition-all duration-150 cursor-pointer"
      >
        <Trash2 size={12} />
      </button>
    </motion.div>
  );
}