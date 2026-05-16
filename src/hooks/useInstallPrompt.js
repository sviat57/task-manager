import { useState, useEffect, useCallback } from 'react';

/**
 * useInstallPrompt — хук для управления установкой PWA.
 *
 * Возвращает:
 *  - canInstall:  true если можно вызвать нативную установку (Android/Chrome/Edge)
 *  - isIOS:       true если устройство iOS (нужна ручная инструкция)
 *  - isInstalled: true если приложение уже установлено (standalone)
 *  - install():   вызывает нативный промпт установки
 */
export function useInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isInstalled, setIsInstalled] = useState(false);

  const isIOS =
    typeof navigator !== 'undefined' &&
    /iPad|iPhone|iPod/.test(navigator.userAgent) &&
    !window.MSStream;

  useEffect(() => {
    // Проверяем, уже ли установлено
    const mq = window.matchMedia('(display-mode: standalone)');
    setIsInstalled(mq.matches || navigator.standalone === true);

    const handleChange = (e) => setIsInstalled(e.matches);
    mq.addEventListener('change', handleChange);

    // Перехватываем beforeinstallprompt
    const handlePrompt = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    // Если приложение установилось
    const handleInstalled = () => {
      setIsInstalled(true);
      setDeferredPrompt(null);
    };

    window.addEventListener('beforeinstallprompt', handlePrompt);
    window.addEventListener('appinstalled', handleInstalled);

    return () => {
      mq.removeEventListener('change', handleChange);
      window.removeEventListener('beforeinstallprompt', handlePrompt);
      window.removeEventListener('appinstalled', handleInstalled);
    };
  }, []);

  const install = useCallback(async () => {
    if (!deferredPrompt) return false;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setDeferredPrompt(null);
      setIsInstalled(true);
      return true;
    }
    return false;
  }, [deferredPrompt]);

  return {
    canInstall: !!deferredPrompt,
    isIOS,
    isInstalled,
    install,
  };
}
