import { useState, useCallback } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Menu, LogOut, User } from 'lucide-react';
import { Sidebar }     from './components/layout/Sidebar';
import { Header }      from './components/layout/Header';
import { TaskList }    from './components/tasks/TaskList';
import { TaskModal }   from './components/tasks/TaskModal';
import { KanbanBoard } from './components/kanban/KanbanBoard';
import { StatsPanel }  from './components/stats/StatsPanel';
import { AuthModal }   from './components/auth/AuthModal';
import { PwaPrompt }   from './components/ui/PwaPrompt';
import { useAuth }     from './hooks/useAuth';
import { useTasks }    from './hooks/useTasks';
import { useLocalStorage } from './hooks/useLocalStorage';
import { VIEWS } from './constants';

export default function App() {
  const { user, loading: authLoading, error: authError, signIn, signUp, signOut } = useAuth();

  // useTasks теперь принимает user — не загружает ничего если user === null
  const {
    tasks, loading: tasksLoading,
    addTask, updateTask, deleteTask,
    toggleTask, changeStatus,
    addSubtask, toggleSubtask, deleteSubtask,
  } = useTasks(user);

  const [theme,       setTheme]       = useLocalStorage('tm_theme', 'light');
  const [activeView,  setActiveView]  = useLocalStorage('tm_view',  VIEWS.LIST);
  const [selectedTask, setSelectedTask] = useState(null);
  const [sidebarOpen,  setSidebarOpen]  = useState(false);

  const activeTaskCount = tasks.filter(t => !t.completed).length;

  const handleAddTask = useCallback(async () => {
    const newTask = await addTask({});
    setSelectedTask(newTask);
  }, [addTask]);

  const toggleTheme = () => setTheme(t => t === 'light' ? 'dark' : 'light');

  // ── Пока проверяем сессию — показываем сплэш ───────────────────────────────
  if (authLoading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950
        flex items-center justify-center">
        <motion.div
          animate={{ opacity: [0.4, 1, 0.4] }}
          transition={{ duration: 1.8, repeat: Infinity }}
          className="flex items-center gap-3"
        >
          <div className="w-8 h-8 bg-gradient-to-br from-violet-500 to-indigo-600
            rounded-xl flex items-center justify-center">
            <span className="text-white text-sm font-bold">T</span>
          </div>
          <span className="font-semibold text-slate-600 dark:text-slate-400">TaskFlow</span>
        </motion.div>
      </div>
    );
  }

  // ── Не авторизован — показываем AuthModal ──────────────────────────────────
  if (!user) {
    return (
      <div className={theme === 'dark' ? 'dark' : ''}>
        <AuthModal
          onSignIn={signIn}
          onSignUp={signUp}
          error={authError}
        />
      </div>
    );
  }

  // ── Основной интерфейс ─────────────────────────────────────────────────────
  return (
    <div className={theme === 'dark' ? 'dark' : ''}>
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors duration-300">

        {/* Мобильный сайдбар */}
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
                className="absolute left-0 top-0 bottom-0 w-64 bg-white
                  dark:bg-slate-900 p-6 shadow-2xl"
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

          <main className="flex-1 px-4 lg:px-8 py-8 min-w-0">

            {/* Мобильная шапка */}
            <div className="flex items-center justify-between mb-4 lg:hidden">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setSidebarOpen(true)}
                  className="p-2 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-800
                    text-slate-500 transition-colors cursor-pointer"
                >
                  <Menu size={20} />
                </button>
                <span className="font-bold text-slate-800 dark:text-slate-200">TaskFlow</span>
              </div>

              {/* Аватар + выход */}
              <UserMenu user={user} onSignOut={signOut} />
            </div>

            {/* Десктоп: аватар + выход в правом верхнем углу */}
            <div className="hidden lg:flex justify-end mb-4">
              <UserMenu user={user} onSignOut={signOut} />
            </div>

            {/* Индикатор синхронизации */}
            <AnimatePresence>
              {tasksLoading && (
                <motion.div
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1,  y:  0 }}
                  exit={{   opacity: 0,  y: -8 }}
                  className="mb-4 flex items-center gap-2 text-xs text-slate-400
                    dark:text-slate-500"
                >
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                    className="w-3 h-3 border-2 border-violet-400 border-t-transparent rounded-full"
                  />
                  Синхронизация...
                </motion.div>
              )}
            </AnimatePresence>

            <Header view={activeView} />

            <AnimatePresence mode="wait">
              <motion.div
                key={activeView}
                initial={{ opacity: 0, y: 8  }}
                animate={{ opacity: 1, y: 0  }}
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
                    onToggleSubtask={toggleSubtask}
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
                    onToggleSubtask={toggleSubtask}
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

        {/* Модалка задачи */}
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

        <PwaPrompt />
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   UserMenu — аватар пользователя + кнопка выхода
   ───────────────────────────────────────────────────────────────────────────── */
function UserMenu({ user, onSignOut }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(v => !v)}
        className="flex items-center gap-2 px-3 py-1.5 rounded-xl
          hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
      >
        <div className="w-7 h-7 rounded-full bg-gradient-to-br from-violet-400
          to-indigo-500 flex items-center justify-center">
          <User size={13} className="text-white" />
        </div>
        <span className="text-xs font-medium text-slate-600 dark:text-slate-400
          max-w-[120px] truncate hidden sm:block">
          {user.email}
        </span>
      </button>

      <AnimatePresence>
        {open && (
          <>
            {/* Закрытие по клику вне меню */}
            <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: -4 }}
              animate={{ opacity: 1, scale: 1,    y:  0 }}
              exit={{   opacity: 0, scale: 0.95, y: -4 }}
              transition={{ duration: 0.15 }}
              className="absolute right-0 top-full mt-1 z-20 bg-white dark:bg-slate-900
                border border-slate-200 dark:border-slate-700 rounded-xl shadow-xl
                overflow-hidden min-w-[160px]"
            >
              <div className="px-3 py-2.5 border-b border-slate-100 dark:border-slate-800">
                <p className="text-xs text-slate-400 truncate">{user.email}</p>
              </div>
              <button
                onClick={() => { onSignOut(); setOpen(false); }}
                className="w-full flex items-center gap-2 px-3 py-2.5 text-sm
                  text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20
                  transition-colors cursor-pointer"
              >
                <LogOut size={14} />
                Выйти
              </button>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}