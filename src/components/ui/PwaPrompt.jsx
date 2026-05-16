import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Download, X, Smartphone, ChevronDown, ChevronUp } from 'lucide-react';

function isIOS() {
  return /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
}

function isAndroid() {
  return /Android/i.test(navigator.userAgent);
}

/**
 * Подсказка установки PWA + инструкции для iPhone и Android.
 */
export function PwaPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [visible, setVisible] = useState(false);
  const [showGuide, setShowGuide] = useState(false);

  useEffect(() => {
    const dismissed = localStorage.getItem('pwa_dismissed');
    if (dismissed && Date.now() - Number(dismissed) < 7 * 24 * 60 * 60 * 1000) {
      return;
    }

    const handler = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      if (window.innerWidth < 768) {
        setTimeout(() => setVisible(true), 3000);
      }
    };

    window.addEventListener('beforeinstallprompt', handler);
    window.addEventListener('appinstalled', () => setVisible(false));

    if (isIOS() && !window.matchMedia('(display-mode: standalone)').matches) {
      setTimeout(() => setVisible(true), 4000);
    }

    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) {
      setShowGuide(true);
      return;
    }
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setVisible(false);
      setDeferredPrompt(null);
    }
  };

  const handleDismiss = () => {
    setVisible(false);
    setShowGuide(false);
    localStorage.setItem('pwa_dismissed', String(Date.now()));
  };

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ type: 'spring', bounce: 0.3, duration: 0.5 }}
          className="fixed left-4 right-4 z-50 mx-auto max-w-sm"
          style={{ bottom: 'calc(1rem + env(safe-area-inset-bottom, 0px))' }}
        >
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl
            border border-slate-200 dark:border-slate-700 p-4">

            <div className="flex items-start gap-3">
              <motion.div className="flex-shrink-0 w-11 h-11 bg-gradient-to-br from-violet-500
                to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
                <Smartphone size={22} className="text-white" />
              </motion.div>

              <motion.div className="flex-1 min-w-0">
                <p className="font-semibold text-sm text-slate-900 dark:text-slate-100">
                  Установить TaskFlow
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 leading-relaxed">
                  PWA: офлайн-режим, уведомления о дедлайнах, быстрый запуск с экрана «Домой»
                </p>

                <motion.div className="flex gap-2 mt-3 flex-wrap">
                  {deferredPrompt && (
                    <button
                      onClick={handleInstall}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-violet-600
                        hover:bg-violet-700 text-white text-xs font-semibold rounded-xl cursor-pointer"
                    >
                      <Download size={12} />
                      Установить
                    </button>
                  )}
                  <button
                    onClick={() => setShowGuide(v => !v)}
                    className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium
                      text-violet-600 dark:text-violet-400 cursor-pointer"
                  >
                    {showGuide ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                    Как установить
                  </button>
                  <button
                    onClick={handleDismiss}
                    className="px-3 py-1.5 text-xs font-medium text-slate-500 cursor-pointer"
                  >
                    Не сейчас
                  </button>
                </motion.div>
              </motion.div>

              <button
                onClick={handleDismiss}
                className="flex-shrink-0 p-1 rounded-lg hover:bg-slate-100
                  dark:hover:bg-slate-800 text-slate-400 cursor-pointer"
              >
                <X size={14} />
              </button>
            </div>

            <AnimatePresence>
              {showGuide && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden"
                >
                  <motion.div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-700 space-y-3 text-xs text-slate-600 dark:text-slate-400">
                    {isIOS() && (
                      <motion.div>
                        <p className="font-semibold text-slate-800 dark:text-slate-200 mb-1">
                          iPhone (Safari)
                        </p>
                        <ol className="list-decimal list-inside space-y-1 leading-relaxed">
                          <li>Откройте TaskFlow в Safari</li>
                          <li>Нажмите «Поделиться» (квадрат со стрелкой)</li>
                          <li>Выберите «На экран Домой»</li>
                          <li>Подтвердите «Добавить»</li>
                        </ol>
                        <p className="mt-1 opacity-80">
                          Для push-уведомлений разрешите их в Настройки → TaskFlow после установки.
                        </p>
                      </motion.div>
                    )}
                    {isAndroid() && (
                      <motion.div>
                        <p className="font-semibold text-slate-800 dark:text-slate-200 mb-1">
                          Android (Chrome)
                        </p>
                        <ol className="list-decimal list-inside space-y-1 leading-relaxed">
                          <li>Меню браузера (⋮) → «Установить приложение» или «Добавить на главный экран»</li>
                          <li>Подтвердите установку</li>
                          <li>Разрешите уведомления при первом запросе</li>
                        </ol>
                      </motion.div>
                    )}
                    {!isIOS() && !isAndroid() && (
                      <p>
                        В Chrome/Edge нажмите иконку установки в адресной строке или используйте меню браузера.
                      </p>
                    )}
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
