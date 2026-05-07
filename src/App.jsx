import { useState, useCallback } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Menu, X } from 'lucide-react';
import { Sidebar }     from './components/layout/Sidebar';
import { Header }      from './components/layout/Header';
import { TaskList }    from './components/tasks/TaskList';
import { TaskModal }   from './components/tasks/TaskModal';
import { KanbanBoard } from './components/kanban/KanbanBoard';
import { StatsPanel }  from './components/stats/StatsPanel';
import { useTasks }    from './hooks/useTasks';
import { useLocalStorage } from './hooks/useLocalStorage';
import { VIEWS } from './constants';

export default function App() {
  // ── Тема: сохраняем выбор в localStorage ──────────────────────────────────
  const [theme, setTheme] = useLocalStorage('tm_theme', 'light');
  const [activeView, setActiveView] = useLocalStorage('tm_view', VIEWS.LIST);

  // ── Состояние модалки ──────────────────────────────────────────────────────
  const [selectedTask, setSelectedTask] = useState(null);

  // ── Мобильный сайдбар ─────────────────────────────────────────────────────
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const {
    tasks,
    addTask,
    updateTask,
    deleteTask,
    toggleTask,
    changeStatus,
    addSubtask,
    toggleSubtask,
    deleteSubtask,
  } = useTasks();

  const activeTaskCount = tasks.filter(t => !t.completed).length;

  // ── Создать задачу и сразу открыть для редактирования ─────────────────────
  const handleAddTask = useCallback(() => {
    const newTask = addTask({});
    setSelectedTask(newTask);
  }, [addTask]);

  // ── Переключить тему ───────────────────────────────────────────────────────
  const toggleTheme = () => setTheme(t => t === 'light' ? 'dark' : 'light');

  return (
    // dark-класс управляет tailwind dark: вариантами
    <div className={theme === 'dark' ? 'dark' : ''}>
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors duration-300">

        {/* Мобильный оверлей сайдбара */}
        <AnimatePresence>
          {sidebarOpen && (
            <motion.div
              className="fixed inset-0 z-40 lg:hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSidebarOpen(false)}
            >
              <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" />
              <motion.div
                className="absolute left-0 top-0 bottom-0 w-64 bg-white dark:bg-slate-900
                  p-6 shadow-2xl"
                initial={{ x: -256 }}
                animate={{ x: 0 }}
                exit={{ x: -256 }}
                transition={{ type: 'spring', bounce: 0.1 }}
                onClick={e => e.stopPropagation()}
              >
                <Sidebar
                  activeView={activeView}
                  onViewChange={(v) => { setActiveView(v); setSidebarOpen(false); }}
                  theme={theme}
                  onToggleTheme={toggleTheme}
                  taskCount={activeTaskCount}
                />
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Основной layout */}
        <div className="max-w-7xl mx-auto flex min-h-screen">

          {/* Десктоп-сайдбар */}
          <div className="hidden lg:flex flex-col w-56 flex-shrink-0 py-8 pl-6 pr-2">
            <Sidebar
              activeView={activeView}
              onViewChange={setActiveView}
              theme={theme}
              onToggleTheme={toggleTheme}
              taskCount={activeTaskCount}
            />
          </div>

          {/* Контент */}
          <main className="flex-1 px-4 lg:px-8 py-8 min-w-0">
            {/* Мобильная шапка с бургером */}
            <div className="flex items-center gap-3 mb-4 lg:hidden">
              <button
                onClick={() => setSidebarOpen(true)}
                className="p-2 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-800
                  text-slate-500 transition-colors cursor-pointer"
              >
                <Menu size={20} />
              </button>
              <span className="font-bold text-slate-800 dark:text-slate-200">TaskFlow</span>
            </div>

            <Header view={activeView} />

            {/* Контент активного вида */}
            <AnimatePresence mode="wait">
              <motion.div
                key={activeView}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{   opacity: 0, y: -8 }}
                transition={{ duration: 0.2 }}
              >
                {activeView === VIEWS.LIST && (
                  <TaskList
                    tasks={tasks}
                    onAddTask={handleAddTask}
                    onToggle={toggleTask}
                    onDelete={deleteTask}
                    onOpen={setSelectedTask}
                  />
                )}
                {activeView === VIEWS.KANBAN && (
                  <KanbanBoard
                    tasks={tasks}
                    onAddTask={handleAddTask}
                    onToggle={toggleTask}
                    onDelete={deleteTask}
                    onOpen={setSelectedTask}
                    onChangeStatus={changeStatus}
                  />
                )}
                {activeView === VIEWS.STATS && (
                  <StatsPanel
                    tasks={tasks}
                    onToggle={toggleTask}
                    onDelete={deleteTask}
                    onOpen={setSelectedTask}
                  />
                )}
              </motion.div>
            </AnimatePresence>
          </main>
        </div>

        {/* Модалка детали задачи */}
        <AnimatePresence>
          {selectedTask && (
            <TaskModal
              task={tasks.find(t => t.id === selectedTask.id) || selectedTask}
              onClose={() => setSelectedTask(null)}
              onUpdate={updateTask}
              onAddSubtask={addSubtask}
              onToggleSubtask={toggleSubtask}
              onDeleteSubtask={deleteSubtask}
            />
          )}
        </AnimatePresence>

      </div>
    </div>
  );
}