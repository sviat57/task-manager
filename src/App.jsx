import { useState, useCallback } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Menu, LogOut, User } from 'lucide-react';
import { Sidebar }     from './components/layout/Sidebar';
import { Header }      from './components/layout/Header';
import { TaskList }    from './components/tasks/TaskList';
import { TaskModal }   from './components/tasks/TaskModal';
import { KanbanBoard } from './components/kanban/KanbanBoard';
import { StatsPanel }  from './components/stats/StatsPanel';
import { TrashPanel }  from './components/ui/TrashPanel';
import { AuthModal }   from './components/auth/AuthModal';
import { AlertModal }  from './components/ui/AlertModal';
import { PwaPrompt }   from './components/ui/PwaPrompt';
import { useAuth }     from './hooks/useAuth';
import { useTasks }    from './hooks/useTasks';
import { useLocalStorage } from './hooks/useLocalStorage';
import { VIEWS } from './constants';
import { BottomNav } from './components/ui/BottomNav';

export default function App() {
  const {
    user, loading: authLoading, error: authError,
    signIn, signUp, signOut,
    signInAsGuest, upgradeGuest, isGuest,
  } = useAuth();

  const {
    tasks, trashed, loading: tasksLoading,
    addTask, updateTask,
    toggleTask, changeStatus,
    addSubtask, toggleSubtask, deleteSubtask,
    moveToTrash, restoreTask, permanentDelete, emptyTrash,
  } = useTasks(user);

  const [activeView,   setActiveView]   = useLocalStorage('tm_view', VIEWS.LIST);
  const [selectedTask, setSelectedTask] = useState(null);
  const [sidebarOpen,  setSidebarOpen]  = useState(false);
  const [deleteAlert,  setDeleteAlert]  = useState(null);

  const activeTaskCount = tasks.filter(t => !t.completed).length;

  const handleAddTask = useCallback(async () => {
    const newTask = await addTask({});
    setSelectedTask(newTask);
  }, [addTask]);

  const handleDeleteRequest = useCallback((id) => {
    const task = tasks.find(t => t.id === id);
    setDeleteAlert({ id, title: task?.title || 'Без названия' });
  }, [tasks]);

  const handleDeleteConfirm = useCallback(() => {
    if (deleteAlert) moveToTrash(deleteAlert.id);
    setDeleteAlert(null);
  }, [deleteAlert, moveToTrash]);

  // ── Сплэш загрузки ────────────────────────────────────────────────────────
  if (authLoading) {
    return (
      <div className="min-h-screen bg-theme-base flex items-center justify-center">
        <motion.div
          animate={{ opacity: [0.4, 1, 0.4] }}
          transition={{ duration: 1.8, repeat: Infinity }}
          className="flex items-center gap-3"
        >
          <div className="w-8 h-8 bg-primary rounded-xl flex items-center justify-center">
            <span className="text-primary-fg text-sm font-bold">T</span>
          </div>
          <span className="font-semibold text-theme-muted">TaskFlow</span>
        </motion.div>
      </div>
    );
  }

  // ── Экран авторизации ─────────────────────────────────────────────────────
  if (!user) {
    return (
      <div className="min-h-screen bg-theme-base">
        <AuthModal
          onSignIn={signIn}
          onSignUp={signUp}
          onSignInAsGuest={signInAsGuest}
          error={authError}
        />
      </div>
    );
  }

  // ── Основной интерфейс ────────────────────────────────────────────────────
  return (
    // ✅ ИСПРАВЛЕНО: один корневой div, правильная структура
    <div className="min-h-screen bg-theme-base transition-colors duration-300">

      {/* Баннер гостевого режима */}
      <AnimatePresence>
        {isGuest && (
          <GuestBanner upgradeGuest={upgradeGuest} error={authError} />
        )}
      </AnimatePresence>

      {/* ── Мобильный сайдбар ───────────────────────────────────────────── */}
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
              // ✅ ИСПРАВЛЕНО: bg-theme-surface вместо bg-theme-surface
              className="absolute left-0 top-0 bottom-0 w-64 bg-theme-surface
                shadow-modal overflow-y-auto"
              initial={{ x: -256 }}
              animate={{ x: 0 }}
              exit={{ x: -256 }}
              transition={{ type: 'spring', bounce: 0.1 }}
              onClick={e => e.stopPropagation()}
            >
              <div className="p-4">
                <Sidebar
                  activeView={activeView}
                  onViewChange={(v) => { setActiveView(v); setSidebarOpen(false); }}
                  taskCount={activeTaskCount}
                  trashCount={trashed.length}
                />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Основной layout ──────────────────────────────────────────────── */}
      <div className="max-w-7xl mx-auto flex min-h-screen">

        {/* Десктоп-сайдбар */}
        <div className="hidden lg:block flex-shrink-0">
          <Sidebar
            activeView={activeView}
            onViewChange={setActiveView}
            taskCount={activeTaskCount}
            trashCount={trashed.length}
          />
        </div>

        {/* Контент */}
        <main className="flex-1 px-4 lg:px-8 py-8 min-w-0">

          {/* Мобильная шапка */}
          <div className="flex items-center justify-between mb-4 lg:hidden">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setSidebarOpen(true)}
                className="p-2 rounded-xl hover:bg-theme-elevated
                  text-theme-muted transition-colors cursor-pointer"
              >
                <Menu size={20} />
              </button>
              <span className="font-bold text-theme-main">TaskFlow</span>
            </div>
            <UserMenu user={user} onSignOut={signOut} />
          </div>

          {/* Десктоп: UserMenu справа */}
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
                className="mb-4 flex items-center gap-2 text-xs text-theme-muted"
              >
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                  className="w-3 h-3 border-2 border-primary
                    border-t-transparent rounded-full"
                />
                Синхронизация...
              </motion.div>
            )}
          </AnimatePresence>

          <Header view={activeView} />

          {/* Контент вида */}
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
                  onDelete={handleDeleteRequest}
                  onOpen={setSelectedTask}
                  onToggleSubtask={toggleSubtask}
                />
              )}
              {activeView === VIEWS.KANBAN && (
                <KanbanBoard
                  tasks={tasks}
                  onAddTask={handleAddTask}
                  onToggle={toggleTask}
                  onDelete={handleDeleteRequest}
                  onOpen={setSelectedTask}
                  onChangeStatus={changeStatus}
                  onToggleSubtask={toggleSubtask}
                />
              )}
              {activeView === VIEWS.STATS && (
                <StatsPanel
                  tasks={tasks}
                  onToggle={toggleTask}
                  onDelete={handleDeleteRequest}
                  onOpen={setSelectedTask}
                  onToggleSubtask={toggleSubtask}
                />
              )}
              {activeView === VIEWS.TRASH && (
                <TrashPanel
                  trashed={trashed}
                  onRestore={restoreTask}
                  onPermanentDelete={permanentDelete}
                  onEmptyTrash={emptyTrash}
                  onBack={() => setActiveView(VIEWS.LIST)}
                />
              )}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>

      {/* ── Модалка задачи ───────────────────────────────────────────────── */}
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

      {/* ── AlertModal подтверждения удаления ───────────────────────────── */}
      <AlertModal
        isOpen={!!deleteAlert}
        title="Переместить в корзину?"
        message={`Задача "${deleteAlert?.title}" будет перемещена в корзину. Вы сможете восстановить её позже.`}
        confirmLabel="В корзину"
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteAlert(null)}
      />

      <PwaPrompt />
      <BottomNav
        activeView={activeView}
        onViewChange={setActiveView}
        trashCount={trashed.length}
      />
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   UserMenu — аватар + выпадающее меню выхода
   ───────────────────────────────────────────────────────────────────────────── */
function UserMenu({ user, onSignOut }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(v => !v)}
        className="flex items-center gap-2 px-3 py-1.5 rounded-xl
          hover:bg-theme-elevated text-theme-muted
          transition-colors cursor-pointer"
      >
        <div className="w-7 h-7 rounded-full bg-primary
          flex items-center justify-center">
          <User size={13} className="text-primary-fg" />
        </div>
        <span className="text-xs font-medium text-theme-muted
          max-w-[120px] truncate hidden sm:block">
          {user?.email || 'Гость'}
        </span>
      </button>

      <AnimatePresence>
        {open && (
          <>
            <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: -4 }}
              animate={{ opacity: 1, scale: 1,    y:  0 }}
              exit={{   opacity: 0, scale: 0.95, y: -4 }}
              transition={{ duration: 0.15 }}
              className="absolute right-0 top-full mt-1 z-20
                bg-theme-surface border border-theme
                rounded-card shadow-modal overflow-hidden min-w-[160px]"
            >
              <div className="px-3 py-2.5 border-b border-theme">
                <p className="text-xs text-theme-muted truncate">
                  {user?.email || 'Гостевой аккаунт'}
                </p>
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

/* ─────────────────────────────────────────────────────────────────────────────
   GuestBanner — баннер гостевого режима.
   ✅ ИСПРАВЛЕНО: получает upgradeGuest и error через пропсы,
   не вызывает useAuth() повторно
   ───────────────────────────────────────────────────────────────────────────── */
function GuestBanner({ upgradeGuest, error }) {
  const [upgradeOpen, setUpgradeOpen] = useState(false);

  return (
    <>
      <motion.div
        initial={{ y: -40 }}
        animate={{ y: 0 }}
        exit={{   y: -40 }}
        className="bg-amber-500 text-primary-fg text-xs font-medium
          px-4 py-2 flex items-center justify-center gap-3"
      >
        <span>Вы в гостевом режиме — данные привязаны к этому устройству</span>
        <button
          onClick={() => setUpgradeOpen(true)}
          className="underline underline-offset-2 hover:no-underline
            font-semibold cursor-pointer whitespace-nowrap"
        >
          Создать аккаунт →
        </button>
      </motion.div>

      <AnimatePresence>
        {upgradeOpen && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{   opacity: 0 }}
          >
            <div
              className="absolute inset-0 bg-black/30 backdrop-blur-sm"
              onClick={() => setUpgradeOpen(false)}
            />
            <motion.div
              className="relative w-full max-w-sm"
              initial={{ scale: 0.95, y: 16 }}
              animate={{ scale: 1,    y: 0  }}
              exit={{   scale: 0.95, y: 16 }}
            >
              <AuthModal
                isGuest
                onUpgradeGuest={async (email, pass) => {
                  const ok = await upgradeGuest(email, pass);
                  if (ok) setUpgradeOpen(false);
                  return ok;
                }}
                error={error}
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}