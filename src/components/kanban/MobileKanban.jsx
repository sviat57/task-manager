import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { TaskItem } from '../tasks/TaskItem';
import { KANBAN_COLUMNS } from '../../constants';

/**
 * MobileKanban — мобильная канбан-доска с:
 *  • Циклическим свайпом между колонками (бесконечная карусель)
 *  • Touch drag-and-drop задач между колонками
 *  • Автоскроллом к соседней колонке при drag к краю
 *  • Индикатором текущей колонки (точки снизу)
 */
export function MobileKanban({
  tasks, onAddTask, onToggle, onDelete,
  onOpen, onChangeStatus, onToggleSubtask
}) {
  const [colIndex, setColIndex] = useState(0);
  const totalCols = KANBAN_COLUMNS.length;

  // Drag state для touch drag-and-drop задач
  const [draggingTask, setDraggingTask] = useState(null); // { taskId, startCol }
  const [dragPos, setDragPos]           = useState({ x: 0, y: 0 });
  const [dragOverCol, setDragOverCol]   = useState(null);
  const autoScrollTimer = useRef(null);
  const containerRef    = useRef(null);

  // Long-press state
  const longPressTimer = useRef(null);
  const longPressTriggered = useRef(false);
  const touchStartPos = useRef({ x: 0, y: 0 });

  // Ref для текущего colIndex (для доступа из коллбэков без зависимостей)
  const colIndexRef = useRef(colIndex);
  useEffect(() => { colIndexRef.current = colIndex; }, [colIndex]);

  // Направление анимации свайпа
  const [swipeDir, setSwipeDir] = useState(1);

  // Группируем задачи
  const grouped = KANBAN_COLUMNS.reduce((acc, col) => {
    acc[col.id] = tasks.filter(t => {
      if (col.id === 'done')       return t.completed || t.status === 'done';
      if (col.id === 'inprogress') return !t.completed && t.status === 'inprogress';
      return !t.completed && (t.status === 'todo' || !t.status);
    });
    return acc;
  }, {});

  // ── Циклическая навигация ─────────────────────────────────────────────────
  const goTo = useCallback((idx, dir) => {
    const newIdx = ((idx % totalCols) + totalCols) % totalCols;
    if (dir !== undefined) setSwipeDir(dir);
    else setSwipeDir(idx > colIndexRef.current ? 1 : -1);
    setColIndex(newIdx);
  }, [totalCols]);

  const goNext = useCallback(() => goTo(colIndexRef.current + 1, 1), [goTo]);
  const goPrev = useCallback(() => goTo(colIndexRef.current - 1, -1), [goTo]);

  // ── Свайп жест ────────────────────────────────────────────────────────────
  const swipeStartX = useRef(null);
  const swipeStartY = useRef(null);
  const isSwiping   = useRef(false);

  const handleSwipeStart = (e) => {
    if (draggingTask) return;
    swipeStartX.current = e.touches[0].clientX;
    swipeStartY.current = e.touches[0].clientY;
    isSwiping.current   = false;
  };

  const handleSwipeMove = (e) => {
    if (draggingTask || swipeStartX.current === null) return;
    const dx = e.touches[0].clientX - swipeStartX.current;
    const dy = e.touches[0].clientY - swipeStartY.current;
    if (!isSwiping.current && Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 10) {
      isSwiping.current = true;
    }
  };

  const handleSwipeEnd = (e) => {
    if (draggingTask || !isSwiping.current || swipeStartX.current === null) return;
    const dx = e.changedTouches[0].clientX - swipeStartX.current;
    const THRESHOLD = 50;
    if (dx < -THRESHOLD) goNext();
    else if (dx > THRESHOLD) goPrev();
    swipeStartX.current = null;
    swipeStartY.current = null;
    isSwiping.current   = false;
  };

  // ── Touch Long-Press Drag-and-Drop задач ──────────────────────────────────
  const handleTaskTouchStart = (e, taskId) => {
    // Запоминаем позицию для определения что палец не двигался
    const touch = e.touches[0];
    touchStartPos.current = { x: touch.clientX, y: touch.clientY };
    longPressTriggered.current = false;

    // Запускаем таймер long-press: 1 секунда
    longPressTimer.current = setTimeout(() => {
      longPressTriggered.current = true;
      // Вибрация для тактильной обратной связи
      if (navigator.vibrate) navigator.vibrate(50);
      setDraggingTask({ taskId, startCol: colIndexRef.current });
      setDragPos({ x: touch.clientX, y: touch.clientY });
      setDragOverCol(colIndexRef.current);
    }, 1000);
  };

  const handleTaskTouchMoveForLongPress = (e) => {
    // Если палец сдвинулся более чем на 10px — отменяем long-press
    if (longPressTimer.current && !longPressTriggered.current) {
      const touch = e.touches[0];
      const dx = Math.abs(touch.clientX - touchStartPos.current.x);
      const dy = Math.abs(touch.clientY - touchStartPos.current.y);
      if (dx > 10 || dy > 10) {
        clearTimeout(longPressTimer.current);
        longPressTimer.current = null;
      }
    }
  };

  const handleTaskTouchEnd = () => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }
  };

  // ── Глобальные обработчики drag задачи ────────────────────────────────────
  const handleDragTouchMove = useCallback((e) => {
    if (!draggingTask) return;
    e.preventDefault();
    const touch = e.touches[0];
    setDragPos({ x: touch.clientX, y: touch.clientY });

    const container = containerRef.current;
    if (!container) return;
    const rect = container.getBoundingClientRect();
    const relX = touch.clientX - rect.left;
    const width = rect.width;
    const EDGE = width * 0.18;

    if (relX < EDGE) {
      if (!autoScrollTimer.current) {
        autoScrollTimer.current = setTimeout(() => {
          const prevCol = ((colIndexRef.current - 1) + totalCols) % totalCols;
          setSwipeDir(-1);
          setColIndex(prevCol);
          setDragOverCol(prevCol);
          autoScrollTimer.current = null;
        }, 600);
      }
    } else if (relX > width - EDGE) {
      if (!autoScrollTimer.current) {
        autoScrollTimer.current = setTimeout(() => {
          const nextCol = (colIndexRef.current + 1) % totalCols;
          setSwipeDir(1);
          setColIndex(nextCol);
          setDragOverCol(nextCol);
          autoScrollTimer.current = null;
        }, 600);
      }
    } else {
      if (autoScrollTimer.current) {
        clearTimeout(autoScrollTimer.current);
        autoScrollTimer.current = null;
      }
    }
  }, [draggingTask, totalCols]);

  const handleDragTouchEnd = useCallback(() => {
    if (!draggingTask) return;
    if (autoScrollTimer.current) {
      clearTimeout(autoScrollTimer.current);
      autoScrollTimer.current = null;
    }

    const targetColId = KANBAN_COLUMNS[dragOverCol]?.id;
    if (targetColId && targetColId !== KANBAN_COLUMNS[draggingTask.startCol]?.id) {
      onChangeStatus(draggingTask.taskId, targetColId);
    }

    setDraggingTask(null);
    setDragOverCol(null);
  }, [draggingTask, dragOverCol, onChangeStatus]);

  // Вешаем глобальные touch-обработчики пока идёт drag
  useEffect(() => {
    if (!draggingTask) return;
    const opts = { passive: false };
    window.addEventListener('touchmove',   handleDragTouchMove,  opts);
    window.addEventListener('touchend',    handleDragTouchEnd);
    window.addEventListener('touchcancel', handleDragTouchEnd);
    return () => {
      window.removeEventListener('touchmove',   handleDragTouchMove);
      window.removeEventListener('touchend',    handleDragTouchEnd);
      window.removeEventListener('touchcancel', handleDragTouchEnd);
    };
  }, [draggingTask, handleDragTouchMove, handleDragTouchEnd]);

  const currentCol   = KANBAN_COLUMNS[colIndex];
  const currentTasks = grouped[currentCol.id] || [];

  const accentColor = {
    todo:       'var(--color-muted)',
    inprogress: '#3b82f6',
    done:       '#10b981',
  }[currentCol.id];

  // Анимация: направление свайпа
  const variants = {
    enter: (dir) => ({ opacity: 0, x: dir > 0 ? 60 : -60 }),
    center: { opacity: 1, x: 0 },
    exit: (dir) => ({ opacity: 0, x: dir > 0 ? -60 : 60 }),
  };

  return (
    <div className="flex flex-col h-full">

      {/* ── Хедер колонки с навигацией ───────────────────────────────── */}
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={goPrev}
          className="p-2 rounded-xl bg-theme-elevated text-theme-muted
            hover:text-theme-main transition-colors cursor-pointer active:scale-95"
        >
          <ChevronLeft size={18} />
        </button>

        <div className="flex flex-col items-center gap-1">
          <div className="flex items-center gap-2">
            <span className="text-lg">{currentCol.emoji}</span>
            <h2 className="font-bold text-theme-main text-base">
              {currentCol.label}
            </h2>
            <span className="text-xs bg-theme-elevated border border-theme
              text-theme-muted px-2 py-0.5 rounded-full font-medium">
              {currentTasks.length}
            </span>
          </div>
          {/* Цветная полоска под заголовком */}
          <div className="h-0.5 w-16 rounded-full" style={{ backgroundColor: accentColor }} />
        </div>

        <button
          onClick={goNext}
          className="p-2 rounded-xl bg-theme-elevated text-theme-muted
            hover:text-theme-main transition-colors cursor-pointer active:scale-95"
        >
          <ChevronRight size={18} />
        </button>
      </div>

      {/* ── Индикаторы-точки ──────────────────────────────────────────── */}
      <div className="flex items-center justify-center gap-2 mb-4">
        {KANBAN_COLUMNS.map((col, idx) => (
          <button
            key={col.id}
            onClick={() => goTo(idx)}
            className="transition-all duration-300 rounded-full cursor-pointer"
            style={{
              width:  idx === colIndex ? '24px' : '6px',
              height: '6px',
              backgroundColor: idx === colIndex ? accentColor : 'var(--color-border)',
            }}
          />
        ))}
      </div>

      {/* ── Область свайпа и задач ────────────────────────────────────── */}
      <div
        ref={containerRef}
        className="flex-1 relative overflow-hidden"
        onTouchStart={handleSwipeStart}
        onTouchMove={handleSwipeMove}
        onTouchEnd={handleSwipeEnd}
        style={{ touchAction: draggingTask ? 'none' : 'pan-y' }}
      >
        <AnimatePresence mode="wait" initial={false} custom={swipeDir}>
          <motion.div
            key={currentCol.id}
            custom={swipeDir}
            variants={variants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.2, ease: 'easeInOut' }}
            className="space-y-2"
          >
            {currentTasks.length === 0 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex flex-col items-center justify-center py-16
                  border-2 border-dashed border-theme rounded-card"
              >
                <span className="text-3xl mb-2">{currentCol.emoji}</span>
                <p className="text-sm text-theme-muted">Задач нет</p>
                <p className="text-xs text-theme-muted opacity-60 mt-1">
                  Свайп ← → для навигации
                </p>
              </motion.div>
            ) : (
              currentTasks.map(task => (
                <div
                  key={task.id}
                  onTouchStart={(e) => handleTaskTouchStart(e, task.id)}
                  onTouchMove={handleTaskTouchMoveForLongPress}
                  onTouchEnd={handleTaskTouchEnd}
                  className={`transition-transform duration-150
                    ${draggingTask?.taskId === task.id ? 'opacity-40 scale-95' : ''}`}
                >
                  <TaskItem
                    task={task}
                    onToggle={onToggle}
                    onDelete={onDelete}
                    onOpen={onOpen}
                    onToggleSubtask={onToggleSubtask}
                    isGrid={false}
                  />
                </div>
              ))
            )}

            {/* Кнопка добавить */}
            {currentCol.id !== 'done' && (
              <button
                onClick={onAddTask}
                className="w-full py-3 rounded-card border-2 border-dashed border-theme
                  text-theme-muted text-sm font-medium
                  hover:bg-theme-elevated hover:text-theme-main
                  transition-colors cursor-pointer mt-2"
              >
                + Добавить задачу
              </button>
            )}
          </motion.div>
        </AnimatePresence>

        {/* Drag-превью — следует за пальцем */}
        {draggingTask && (
          <motion.div
            className="fixed pointer-events-none z-50 bg-primary/20 border-2
              border-primary rounded-card px-4 py-2 text-primary text-sm font-medium
              backdrop-blur-sm"
            style={{
              left: dragPos.x - 60,
              top:  dragPos.y - 20,
              width: 120,
            }}
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
          >
            ✋ Перетаскиваю
          </motion.div>
        )}
      </div>

      {/* ── Подсказка свайпа (показывается один раз) ─────────────────── */}
      <SwipeHint />
    </div>
  );
}

/* ── Подсказка свайпа — показывается один раз ────────────────────────────── */
function SwipeHint() {
  const [visible, setVisible] = useState(
    () => !localStorage.getItem('kanban_swipe_hint_seen')
  );

  useEffect(() => {
    if (!visible) return;
    const timer = setTimeout(() => {
      setVisible(false);
      localStorage.setItem('kanban_swipe_hint_seen', '1');
    }, 3000);
    return () => clearTimeout(timer);
  }, [visible]);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{   opacity: 0, y: 10 }}
          className="mt-4 flex items-center justify-center gap-2
            text-xs text-theme-muted"
        >
          <span>←</span>
          <span>Свайп для переключения колонок</span>
          <span>→</span>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
