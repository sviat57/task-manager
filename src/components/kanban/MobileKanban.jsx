import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence, useMotionValue, useTransform, animate } from 'framer-motion';
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
  const goTo = useCallback((idx) => {
    // Модульная арифметика для цикличности
    setColIndex(((idx % totalCols) + totalCols) % totalCols);
  }, [totalCols]);

  const goNext = () => goTo(colIndex + 1);
  const goPrev = () => goTo(colIndex - 1);

  // ── Свайп жест ────────────────────────────────────────────────────────────
  const touchStartX = useRef(null);
  const touchStartY = useRef(null);
  const isSwiping   = useRef(false);

  const handleTouchStart = (e) => {
    // Не перехватываем если идёт drag задачи
    if (draggingTask) return;
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
    isSwiping.current   = false;
  };

  const handleTouchMove = (e) => {
    if (draggingTask || touchStartX.current === null) return;
    const dx = e.touches[0].clientX - touchStartX.current;
    const dy = e.touches[0].clientY - touchStartY.current;
    // Определяем что это горизонтальный свайп
    if (!isSwiping.current && Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 10) {
      isSwiping.current = true;
    }
    if (isSwiping.current) e.preventDefault();
  };

  const handleTouchEnd = (e) => {
    if (draggingTask || !isSwiping.current) return;
    const dx = e.changedTouches[0].clientX - touchStartX.current;
    const THRESHOLD = 50; // минимальный свайп в пикселях
    if (dx < -THRESHOLD) goNext();
    else if (dx > THRESHOLD) goPrev();
    touchStartX.current = null;
    isSwiping.current   = false;
  };

  // ── Touch Drag-and-Drop задач ─────────────────────────────────────────────
  const handleTaskTouchStart = (e, taskId) => {
    e.stopPropagation(); // не тригерим свайп колонки
    const touch = e.touches[0];
    setDraggingTask({ taskId, startCol: colIndex });
    setDragPos({ x: touch.clientX, y: touch.clientY });
    setDragOverCol(colIndex);
  };

  const handleTaskTouchMove = useCallback((e) => {
    if (!draggingTask) return;
    e.preventDefault();
    const touch = e.touches[0];
    setDragPos({ x: touch.clientX, y: touch.clientY });

    const container = containerRef.current;
    if (!container) return;
    const rect = container.getBoundingClientRect();
    const relX  = touch.clientX - rect.left;
    const width  = rect.width;

    // Зона авто-скролла — 15% от края
    const EDGE = width * 0.15;

    if (relX < EDGE) {
      // Левый край — переход к предыдущей колонке
      if (!autoScrollTimer.current) {
        autoScrollTimer.current = setTimeout(() => {
          goTo(colIndex - 1);
          setDragOverCol(prev => ((prev - 1 + totalCols) % totalCols));
          autoScrollTimer.current = null;
        }, 1800); // 1.8 сек задержка
      }
    } else if (relX > width - EDGE) {
      // Правый край — следующая колонка
      if (!autoScrollTimer.current) {
        autoScrollTimer.current = setTimeout(() => {
          goTo(colIndex + 1);
          setDragOverCol(prev => (prev + 1) % totalCols);
          autoScrollTimer.current = null;
        }, 1800);
      }
    } else {
      // Сбрасываем таймер если ушли от края
      if (autoScrollTimer.current) {
        clearTimeout(autoScrollTimer.current);
        autoScrollTimer.current = null;
      }
    }
  }, [draggingTask, colIndex, totalCols, goTo]);

  const handleTaskTouchEnd = useCallback(() => {
    if (!draggingTask) return;
    if (autoScrollTimer.current) {
      clearTimeout(autoScrollTimer.current);
      autoScrollTimer.current = null;
    }

    // Если перетащили в другую колонку — меняем статус
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
    window.addEventListener('touchmove',  handleTaskTouchMove,  { passive: false });
    window.addEventListener('touchend',   handleTaskTouchEnd);
    window.addEventListener('touchcancel',handleTaskTouchEnd);
    return () => {
      window.removeEventListener('touchmove',  handleTaskTouchMove);
      window.removeEventListener('touchend',   handleTaskTouchEnd);
      window.removeEventListener('touchcancel',handleTaskTouchEnd);
    };
  }, [draggingTask, handleTaskTouchMove, handleTaskTouchEnd]);

  const currentCol  = KANBAN_COLUMNS[colIndex];
  const currentTasks = grouped[currentCol.id] || [];

  const accentColor = {
    todo:       'var(--color-muted)',
    inprogress: '#3b82f6',
    done:       '#10b981',
  }[currentCol.id];

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
        className="flex-1 relative"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        style={{ touchAction: draggingTask ? 'none' : 'pan-y' }}
      >
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={currentCol.id}
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{   opacity: 0, x: -40 }}
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

        {/* Overlay-подсказка при drag к краю */}
        {draggingTask && autoScrollTimer.current && (
          <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
            <div className="bg-primary text-primary-fg text-xs font-bold px-4 py-2
              rounded-full shadow-modal animate-pulse">
              Переход через 2с...
            </div>
          </div>
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
