import { motion } from 'framer-motion';

export function ProgressBar({ value = 0, className = '' }) {
  return (
    <div className={`h-1.5 rounded-full bg-slate-100 dark:bg-slate-700 overflow-hidden ${className}`}>
      <motion.div
        className="h-full rounded-full bg-gradient-to-r from-violet-500 to-blue-500"
        initial={{ width: 0 }}
        animate={{ width: `${value}%` }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
      />
    </div>
  );
}