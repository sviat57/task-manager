import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle } from 'lucide-react';
 
export function AlertModal({
  isOpen,
  title        = 'Вы уверены?',
  message      = 'Это действие нельзя отменить.',
  confirmLabel = 'Удалить',
  onConfirm,
  onCancel,
}) {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-[60] flex items-center justify-center"
          style={{
            padding: 'calc(1rem + env(safe-area-inset-top, 0px)) calc(1rem + env(safe-area-inset-right, 0px)) calc(1rem + env(safe-area-inset-bottom, 0px)) calc(1rem + env(safe-area-inset-left, 0px))',
          }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{   opacity: 0 }}
        >
          {/* Оверлей */}
          <motion.div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={onCancel}
          />
 
          {/* Карточка */}
          <motion.div
            className="relative w-full max-w-sm bg-theme-surface
              rounded-card shadow-modal border border-theme overflow-hidden"
            initial={{ opacity: 0, scale: 0.92, y: 12 }}
            animate={{ opacity: 1, scale: 1,    y: 0  }}
            exit={{   opacity: 0, scale: 0.92, y: 12 }}
            transition={{ type: 'spring', duration: 0.3, bounce: 0.25 }}
          >
            {/* Красная полоска */}
            <div className="h-1 bg-gradient-to-r from-red-500 to-rose-500" />
 
            <div className="p-6">
              {/* Иконка */}
              <div className="w-11 h-11 rounded-2xl bg-red-50 dark:bg-red-900/30
                flex items-center justify-center mb-4">
                <AlertTriangle size={22} className="text-red-500" />
              </div>
 
              {/* Текст */}
              <h3 className="text-base font-bold text-theme-main mb-1">
                {title}
              </h3>
              <p className="text-sm text-theme-muted leading-relaxed">
                {message}
              </p>
            </div>
 
            {/* Кнопки */}
            <div className="flex gap-3 px-6 pb-6">
              <button
                onClick={onCancel}
                className="flex-1 py-2.5 rounded-xl text-sm font-semibold
                  bg-theme-elevated hover:bg-theme-base
                  text-theme-main border border-theme
                  transition-colors duration-150 cursor-pointer"
              >
                Отмена
              </button>
              <button
                onClick={onConfirm}
                className="flex-1 py-2.5 rounded-xl text-sm font-semibold
                  bg-red-500 hover:bg-red-600 active:bg-red-700
                  text-white transition-colors duration-150 cursor-pointer"
              >
                {confirmLabel}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
