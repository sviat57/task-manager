import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Lock, Eye, EyeOff, CheckSquare, Loader2, AlertCircle } from 'lucide-react';

/**
 * Модалка авторизации.
 * Два режима: 'login' и 'register' — переключаются табом.
 *
 * @param {function} onSignIn  — (email, password) => Promise<bool>
 * @param {function} onSignUp  — (email, password) => Promise<bool>
 * @param {string}   error     — ошибка из useAuth
 */
export function AuthModal({ onSignIn, onSignUp, error }) {
  const [mode,     setMode]     = useState('login');
  const [email,    setEmail]    = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading,  setLoading]  = useState(false);
  const [success,  setSuccess]  = useState(false);

  const isLogin = mode === 'login';

  const handleSubmit = async () => {
    if (!email || !password) return;
    setLoading(true);

    const ok = isLogin
      ? await onSignIn(email, password)
      : await onSignUp(email, password);

    setLoading(false);

    // При регистрации показываем подтверждение (Supabase шлёт письмо)
    if (ok && !isLogin) setSuccess(true);
  };

  if (success) {
    return <SuccessScreen email={email} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 via-slate-50 to-violet-50
      dark:from-slate-950 dark:via-slate-900 dark:to-violet-950
      flex items-center justify-center p-4">

      <motion.div
        initial={{ opacity: 0, y: 24, scale: 0.97 }}
        animate={{ opacity: 1, y: 0,  scale: 1    }}
        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
        className="w-full max-w-sm"
      >
        {/* Лого */}
        <div className="text-center mb-8">
          <div className="inline-flex w-14 h-14 bg-gradient-to-br from-violet-500
            to-indigo-600 rounded-2xl items-center justify-center shadow-xl
            shadow-violet-200 dark:shadow-violet-900 mb-4">
            <CheckSquare size={28} className="text-white" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">TaskFlow</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Управляй задачами красиво
          </p>
        </div>

        {/* Карточка формы */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-xl shadow-slate-200/60
          dark:shadow-slate-950 border border-slate-200 dark:border-slate-800 overflow-hidden">

          {/* Вкладки Login / Register */}
          <div className="flex border-b border-slate-100 dark:border-slate-800">
            {['login', 'register'].map(m => (
              <button
                key={m}
                onClick={() => { setMode(m); setShowPass(false); }}
                className={`flex-1 py-4 text-sm font-semibold transition-colors cursor-pointer relative
                  ${mode === m
                    ? 'text-violet-600 dark:text-violet-400'
                    : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'
                  }`}
              >
                {m === 'login' ? 'Войти' : 'Регистрация'}
                {mode === m && (
                  <motion.div
                    layoutId="auth-tab"
                    className="absolute bottom-0 left-4 right-4 h-0.5
                      bg-violet-600 dark:bg-violet-400 rounded-full"
                  />
                )}
              </button>
            ))}
          </div>

          <div className="p-6 space-y-4">
            {/* Email */}
            <div>
              <label className="block text-xs font-medium text-slate-500
                dark:text-slate-400 mb-1.5">
                Email
              </label>
              <div className="relative">
                <Mail size={15} className="absolute left-3 top-1/2 -translate-y-1/2
                  text-slate-400 pointer-events-none" />
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleSubmit()}
                  placeholder="you@example.com"
                  className="w-full pl-9 pr-4 py-2.5 text-sm bg-slate-50 dark:bg-slate-800
                    border border-slate-200 dark:border-slate-700 rounded-xl outline-none
                    text-slate-800 dark:text-slate-200 placeholder:text-slate-400
                    focus:ring-2 focus:ring-violet-500/30 focus:border-violet-400
                    transition-all"
                />
              </div>
            </div>

            {/* Пароль */}
            <div>
              <label className="block text-xs font-medium text-slate-500
                dark:text-slate-400 mb-1.5">
                Пароль
              </label>
              <div className="relative">
                <Lock size={15} className="absolute left-3 top-1/2 -translate-y-1/2
                  text-slate-400 pointer-events-none" />
                <input
                  type={showPass ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleSubmit()}
                  placeholder={isLogin ? 'Ваш пароль' : 'Минимум 6 символов'}
                  className="w-full pl-9 pr-10 py-2.5 text-sm bg-slate-50 dark:bg-slate-800
                    border border-slate-200 dark:border-slate-700 rounded-xl outline-none
                    text-slate-800 dark:text-slate-200 placeholder:text-slate-400
                    focus:ring-2 focus:ring-violet-500/30 focus:border-violet-400
                    transition-all"
                />
                <button
                  onClick={() => setShowPass(v => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2
                    text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
                >
                  {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            {/* Ошибка */}
            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -6 }}
                  animate={{ opacity: 1,  y:  0 }}
                  exit={{   opacity: 0 }}
                  className="flex items-start gap-2 p-3 bg-red-50 dark:bg-red-900/20
                    border border-red-200 dark:border-red-800 rounded-xl"
                >
                  <AlertCircle size={14} className="text-red-500 mt-0.5 flex-shrink-0" />
                  <p className="text-xs text-red-600 dark:text-red-400">{error}</p>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Кнопка */}
            <motion.button
              whileTap={{ scale: 0.98 }}
              onClick={handleSubmit}
              disabled={loading || !email || !password}
              className="w-full flex items-center justify-center gap-2 py-3
                bg-violet-600 hover:bg-violet-700 disabled:opacity-50
                text-white text-sm font-semibold rounded-xl
                transition-colors duration-150 cursor-pointer
                shadow-md shadow-violet-200 dark:shadow-violet-900"
            >
              {loading
                ? <Loader2 size={16} className="animate-spin" />
                : isLogin ? 'Войти в аккаунт' : 'Создать аккаунт'
              }
            </motion.button>

            {/* Подсказка про пароль при регистрации */}
            {!isLogin && (
              <p className="text-center text-xs text-slate-400 dark:text-slate-500">
                После регистрации проверьте почту для подтверждения
              </p>
            )}
          </div>
        </div>

        {/* Подпись */}
        <p className="text-center text-xs text-slate-400 dark:text-slate-600 mt-6">
          Данные хранятся в защищённом облаке Supabase
        </p>
      </motion.div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   Экран после успешной регистрации
   ───────────────────────────────────────────────────────────────────────────── */
function SuccessScreen({ email }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 to-violet-50
      dark:from-slate-950 dark:to-violet-950 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center max-w-sm"
      >
        <div className="inline-flex w-16 h-16 bg-emerald-100 dark:bg-emerald-900/30
          rounded-2xl items-center justify-center mb-4">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring', bounce: 0.5 }}
          >
            <Mail size={32} className="text-emerald-600 dark:text-emerald-400" />
          </motion.div>
        </div>
        <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-2">
          Проверьте почту
        </h2>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Мы отправили письмо с подтверждением на{' '}
          <span className="font-medium text-slate-700 dark:text-slate-300">{email}</span>.
          Перейдите по ссылке в письме и вернитесь сюда.
        </p>
      </motion.div>
    </div>
  );
}