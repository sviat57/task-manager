import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Download, X, Share, PlusSquare, Smartphone } from 'lucide-react';
import { useInstallPrompt } from '../../hooks/useInstallPrompt';
import { createPortal } from 'react-dom';

/**
 * InstallButton — кнопка «Установить приложение» для сайдбара.
 *
 * • Android/Chrome/Edge — вызывает нативный промпт.
 * • iOS Safari — открывает модалку с пошаговой инструкцией.
 * • Уже установлено (standalone) — скрывается полностью.
 */
export function InstallButton() {
  const { canInstall, isIOS, isInstalled, install } = useInstallPrompt();
  const [iosModal, setIosModal] = useState(false);

  // Если приложение уже установлено — ничего не показываем
  if (isInstalled) return null;

  // Если нет ни нативного промпта, ни iOS — кнопка не нужна
  if (!canInstall && !isIOS) return null;

  const handleClick = async () => {
    if (canInstall) {
      await install();
    } else if (isIOS) {
      setIosModal(true);
    }
  };

  return (
    <>
      <button
        onClick={handleClick}
        className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl
          text-sm font-medium transition-all duration-200 cursor-pointer
          text-theme-muted hover:text-primary hover:bg-theme-elevated group"
      >
        <Download size={17} className="transition-transform group-hover:scale-110" />
        <span>Установить</span>
        {isIOS && (
          <span className="ml-auto text-[10px] bg-theme-elevated border border-theme
            text-theme-muted px-1.5 py-0.5 rounded-full font-medium">
            iOS
          </span>
        )}
      </button>

      {/* ── ВЫНОСИМ МОДАЛКУ В КОРЕНЬ ДОКУМЕНТА (PORTAL) ─────────────── */}
      {typeof document !== 'undefined' && createPortal(
        <AnimatePresence>
          {iosModal && (
            <>
              {/* Backdrop — полноэкранный, под модалкой */}
              <motion.div
                className="fixed inset-0 z-[9998] bg-black/40 backdrop-blur-sm"
                onClick={() => setIosModal(false)}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              />

              {/* Контейнер модалки */}
              <div
                className="fixed inset-0 z-[9999] flex items-center justify-center px-4"
                style={{
                  paddingTop: 'env(safe-area-inset-top, 16px)',
                  paddingBottom: 'env(safe-area-inset-bottom, 16px)',
                }}
              >
                <motion.div
                  className="relative w-full max-w-sm bg-theme-surface
                    rounded-card shadow-modal border border-theme
                    flex flex-col overflow-hidden"
                  style={{
                    maxHeight: 'calc(100dvh - env(safe-area-inset-top, 0px) - env(safe-area-inset-bottom, 0px) - 2rem)',
                  }}
                  initial={{ opacity: 0, scale: 0.92, y: 24 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.92, y: 24 }}
                  transition={{ type: 'spring', damping: 24, stiffness: 320 }}
                >
                  {/* ... здесь остаётся всё содержимое модалки без изменений (Хедер, Шаги и т.д.) ... */}

                  {/* Хедер */}
                  <div className="flex items-center justify-between px-5 pt-5 pb-3 flex-shrink-0">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-violet-500 to-indigo-600
                        rounded-xl flex items-center justify-center shadow-card">
                        <Smartphone size={20} className="text-white" />
                      </div>
                      <div>
                        <h3 className="text-sm font-bold text-theme-main">
                          Установить TaskFlow
                        </h3>
                        <p className="text-xs text-theme-muted">на iPhone / iPad</p>
                      </div>
                    </div>
                    <button
                      onClick={() => setIosModal(false)}
                      className="p-1.5 rounded-lg hover:bg-theme-elevated
                        text-theme-muted cursor-pointer"
                    >
                      <X size={16} />
                    </button>
                  </div>

                  {/* Шаги ... */}
                  <div className="px-5 pb-5 space-y-4 overflow-y-auto flex-1 min-h-0">
                    <p className="text-xs text-theme-muted leading-relaxed">
                      iOS не поддерживает автоматическую установку.
                      Выполните 3 шага вручную:
                    </p>

                    <div className="space-y-3">
                      <Step
                        number={1}
                        icon={<Share size={14} />}
                        title="Нажмите «Поделиться»"
                        desc="Квадрат со стрелкой вверх — внизу Safari"
                      />
                      <Step
                        number={2}
                        icon={<PlusSquare size={14} />}
                        title="«На экран Домой»"
                        desc="Пролистайте список и нажмите эту кнопку"
                      />
                      <Step
                        number={3}
                        icon={<Download size={14} />}
                        title="Подтвердите «Добавить»"
                        desc="TaskFlow появится на рабочем столе"
                      />
                    </div>

                    <div className="pt-2 border-t border-theme">
                      <p className="text-[11px] text-theme-muted leading-relaxed">
                        💡 После установки включите уведомления в
                        <span className="font-semibold"> Настройки → TaskFlow → Уведомления</span>
                      </p>
                    </div>

                    <button
                      onClick={() => setIosModal(false)}
                      className="w-full py-2.5 rounded-xl text-sm font-semibold
                        bg-primary hover:bg-primary-hover text-primary-fg
                        cursor-pointer shadow-card transition-colors"
                    >
                      Понятно
                    </button>
                  </div>

                </motion.div>
              </div>
            </>
          )}
        </AnimatePresence>,
        document.body // <-- Цепляем модалку к body
      )}
    </>
  );
}

/** Шаг инструкции */
function Step({ number, icon, title, desc }) {
  return (
    <div className="flex items-start gap-3">
      <div className="flex-shrink-0 w-7 h-7 rounded-full bg-primary/10
        flex items-center justify-center text-primary text-xs font-bold">
        {number}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5">
          <span className="text-primary">{icon}</span>
          <span className="text-sm font-semibold text-theme-main">{title}</span>
        </div>
        <p className="text-xs text-theme-muted mt-0.5">{desc}</p>
      </div>
    </div>
  );
}
