import { useRef, useCallback } from 'react';

export const SWIPE_THRESHOLD = 50;
const DIRECTION_LOCK = 12;

/**
 * Нативный горизонтальный свайп (touch).
 * Игнорирует элементы с data-swipe-ignore или внутри excludeSelector.
 */
export function useSwipe({
  onSwipeLeft,
  onSwipeRight,
  enabled = true,
  excludeSelector = '[data-horizontal-scroll]',
} = {}) {
  const startX = useRef(null);
  const startY = useRef(null);
  const isHorizontal = useRef(false);

  const shouldIgnore = useCallback(
    (target) => {
      if (target?.closest?.('[data-swipe-ignore]')) return true;
      if (excludeSelector && target?.closest?.(excludeSelector)) return true;
      return false;
    },
    [excludeSelector]
  );

  const onTouchStart = useCallback(
    (e) => {
      if (!enabled || shouldIgnore(e.target)) return;
      startX.current = e.touches[0].clientX;
      startY.current = e.touches[0].clientY;
      isHorizontal.current = false;
    },
    [enabled, shouldIgnore]
  );

  const onTouchMove = useCallback((e) => {
    if (startX.current === null) return;
    const dx = Math.abs(e.touches[0].clientX - startX.current);
    const dy = Math.abs(e.touches[0].clientY - startY.current);
    if (!isHorizontal.current && dx > dy && dx > DIRECTION_LOCK) {
      isHorizontal.current = true;
    }
  }, []);

  const onTouchEnd = useCallback(
    (e) => {
      if (!isHorizontal.current || startX.current === null) {
        startX.current = null;
        startY.current = null;
        isHorizontal.current = false;
        return;
      }
      const dx = e.changedTouches[0].clientX - startX.current;
      if (dx < -SWIPE_THRESHOLD) onSwipeLeft?.();
      else if (dx > SWIPE_THRESHOLD) onSwipeRight?.();
      startX.current = null;
      startY.current = null;
      isHorizontal.current = false;
    },
    [onSwipeLeft, onSwipeRight]
  );

  return { onTouchStart, onTouchMove, onTouchEnd };
}
