import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Download, X, Smartphone } from 'lucide-react';

/**
 * Компонент-подсказка для установки PWA.
 *
 * Логика:
 * 1. Ловим событие `beforeinstallprompt` — браузер сам решает когда его
 *    показать (обычно после нескольких визитов). Мы его перехватываем
 *    и сохраняем, чтобы показать в удобный момент.
 * 2. Показываем промпт только на мобильных (width < 768px).
 * 3. Если пользователь закрыл баннер — не показываем 7 дней (localStorage).
 * 4. После установки событие `appinstalled` скрывает баннер навсегда.
 */
export function PwaPrompt() {
  // deferredPrompt — нативный браузерный промпт, сохранённый для вызова позже
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Проверяем: не отклонял ли пользователь промпт недавно
    const dismissed = localStorage.getItem('pwa_dismissed');
    if (dismissed && Date.now() - Number(dismissed) < 7 * 24 * 60 * 60 * 1000) {
      return; // Ждём 7 дней после отклонения
    }

    const handler = (e) => {
      e.preventDefault(); // Блокируем дефолтный мини-инфобар браузера
      setDeferredPrompt(e);

      // Показываем только на мобильных устройствах
      if (window.innerWidth < 768) {
        // Небольшая задержка — не атакуем пользователя сразу при входе
        setTimeout(() => setVisible(true), 3000);
      }
    };

    window.addEventListener('beforeinstallprompt', handler);

    // Скрываем баннер после успешной установки
    window.addEventListener('appinstalled', () => setVisible(false));

    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  // Пользователь нажал "Установить"
  const handleInstall = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();                      // Показываем системный диалог
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setVisible(false);
      setDeferredPrompt(null);
    }
  };

  // Пользователь закрыл баннер
  const handleDismiss = () => {
    setVisible(false);
    localStorage.setItem('pwa_dismissed', String(Date.now()));
  };

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0,   opacity: 1 }}
          exit={{   y: 100, opacity: 0 }}
          transition={{ type: 'spring', bounce: 0.3, duration: 0.5 }}
          className="fixed bottom-4 left-4 right-4 z-50 mx-auto max-w-sm"
        >
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl
            border border-slate-200 dark:border-slate-700 p-4 flex items-start gap-3">

            {/* Иконка приложения */}
            <div className="flex-shrink-0 w-11 h-11 bg-gradient-to-br from-violet-500
              to-indigo-600 rounded-xl flex items-center justify-center shadow-lg
              shadow-violet-200 dark:shadow-violet-900">
              <Smartphone size={22} className="text-white" />
            </div>

            {/* Текст */}
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-sm text-slate-900 dark:text-slate-100">
                Добавить на главный экран
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 leading-relaxed">
                Установите TaskFlow как приложение — работает офлайн и запускается мгновенно
              </p>

              {/* Кнопки */}
              <div className="flex gap-2 mt-3">
                <button
                  onClick={handleInstall}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-violet-600
                    hover:bg-violet-700 text-white text-xs font-semibold rounded-xl
                    transition-colors duration-150 cursor-pointer"
                >
                  <Download size={12} />
                  Установить
                </button>
                <button
                  onClick={handleDismiss}
                  className="px-3 py-1.5 text-xs font-medium text-slate-500
                    hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200
                    transition-colors cursor-pointer"
                >
                  Не сейчас
                </button>
              </div>
            </div>

            {/* Крестик */}
            <button
              onClick={handleDismiss}
              className="flex-shrink-0 p-1 rounded-lg hover:bg-slate-100
                dark:hover:bg-slate-800 text-slate-400 transition-colors cursor-pointer"
            >
              <X size={14} />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}