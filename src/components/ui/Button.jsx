import { motion } from 'framer-motion';

const variants = {
  primary: 'bg-primary hover:bg-primary-hover text-primary-fg shadow-sm shadow-violet-200 dark:shadow-violet-900',
  ghost:   'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400',
  danger:  'hover:bg-red-50 dark:hover:bg-red-900/20 text-red-500',
  outline: 'border border-theme hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300',
};

export function Button({ children, variant = 'ghost', className = '', ...props }) {
  return (
    <motion.button
      whileTap={{ scale: 0.96 }}
      className={`inline-flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-sm font-medium
        transition-colors duration-150 cursor-pointer disabled:opacity-40 ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </motion.button>
  );
}