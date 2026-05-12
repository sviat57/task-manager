import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Lock, Eye, EyeOff, CheckSquare, Loader2, AlertCircle, UserX, ArrowRight } from 'lucide-react';

export function AuthModal({
  onSignIn, onSignUp, onSignInAsGuest,
  onUpgradeGuest, isGuest, error,
}) {
  const [mode,        setMode]        = useState(isGuest ? 'upgrade' : 'login');
  const [email,       setEmail]       = useState('');
  const [password,    setPassword]    = useState('');
  const [showPass,    setShowPass]    = useState(false);
  const [loading,     setLoading]     = useState(false);
  const [guestLoading,setGuestLoading]= useState(false);
  const [success,     setSuccess]     = useState(false);

  const isLogin   = mode === 'login';
  const isUpgrade = mode === 'upgrade';

  const handleSubmit = async () => {
    if (!email || !password) return;
    setLoading(true);
    let ok = false;
    if (isUpgrade)    ok = await onUpgradeGuest(email, password);
    else if (isLogin) ok = await onSignIn(email, password);
    else              ok = await onSignUp(email, password);
    setLoading(false);
    if (ok && !isLogin && !isUpgrade) setSuccess(true);
  };

  const handleGuest = async () => {
    setGuestLoading(true);
    await onSignInAsGuest();
    setGuestLoading(false);
  };

  if (success) return <SuccessScreen email={email} />;

  return (
    <div className="min-h-screen bg-theme-base flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 24, scale: 0.97 }}
        animate={{ opacity: 1, y: 0,  scale: 1    }}
        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
        className="w-full max-w-sm"
      >
        {/* Лого */}
        <div className="text-center mb-8">
          <div className="inline-flex w-14 h-14 bg-primary rounded-2xl items-center justify-center shadow-card mb-4">
            <CheckSquare size={28} className="text-primary-fg" />
          </div>
          <h1 className="text-2xl font-bold text-theme-main">TaskFlow</h1>
          <p className="text-sm text-theme-muted mt-1">
            {isUpgrade ? 'Сохраните свои данные' : 'Управляй задачами красиво'}
          </p>
        </div>

        <div className="bg-theme-surface rounded-3xl shadow-modal border border-theme overflow-hidden">
          {/* Вкладки */}
          {!isUpgrade && (
            <div className="flex border-b border-theme">
              {['login', 'register'].map(m => (
                <button
                  key={m}
                  onClick={() => setMode(m)}
                  className={`flex-1 py-4 text-sm font-semibold transition-colors cursor-pointer relative
                    ${mode === m ? 'text-primary' : 'text-theme-muted hover:text-theme-main'}`}
                >
                  {m === 'login' ? 'Войти' : 'Регистрация'}
                  {mode === m && (
                    <motion.div layoutId="auth-tab" className="absolute bottom-0 left-4 right-4 h-0.5 bg-primary rounded-full" />
                  )}
                </button>
              ))}
            </div>
          )}

          <div className="p-6 space-y-4">
            {/* Email */}
            <div>
              <label className="block text-xs font-medium text-theme-muted mb-1.5">Email</label>
              <div className="relative">
                <Mail size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-theme-muted pointer-events-none opacity-60" />
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleSubmit()}
                  placeholder="you@example.com"
                  className="w-full pl-9 pr-4 py-2.5 text-sm bg-theme-elevated border border-theme rounded-xl outline-none text-theme-main placeholder:text-theme-muted opacity-60 focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
                />
              </div>
            </div>

            {/* Пароль */}
            <div>
              <label className="block text-xs font-medium text-theme-muted mb-1.5">Пароль</label>
              <div className="relative">
                <Lock size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-theme-muted pointer-events-none opacity-60" />
                <input
                  type={showPass ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleSubmit()}
                  placeholder={isLogin ? 'Ваш пароль' : 'Минимум 6 символов'}
                  className="w-full pl-9 pr-10 py-2.5 text-sm bg-theme-elevated border border-theme rounded-xl outline-none text-theme-main placeholder:text-theme-muted opacity-60 focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
                />
                <button onClick={() => setShowPass(v => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-theme-muted hover:text-theme-main transition-colors cursor-pointer">
                  {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            {/* Ошибка */}
            <AnimatePresence>
              {error && (
                <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="flex items-start gap-2 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl">
                  <AlertCircle size={14} className="text-red-500 mt-0.5 flex-shrink-0" />
                  <p className="text-xs text-red-600 dark:text-red-400">{error}</p>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Основная кнопка */}
            <motion.button
              whileTap={{ scale: 0.98 }}
              onClick={handleSubmit}
              disabled={loading || !email || !password}
              className="w-full flex items-center justify-center gap-2 py-3 bg-primary hover:bg-primary-hover disabled:opacity-50 text-primary-fg text-sm font-semibold rounded-xl transition-colors duration-150 cursor-pointer shadow-card"
            >
              {loading ? <Loader2 size={16} className="animate-spin" /> : <>{isUpgrade ? 'Сохранить аккаунт' : isLogin ? 'Войти' : 'Создать аккаунт'} <ArrowRight size={15} /></>}
            </motion.button>

            {/* Разделитель + гостевой вход */}
            {!isUpgrade && (
              <>
                <div className="flex items-center gap-3">
                  <div className="flex-1 h-px bg-theme-elevated" />
                  <span className="text-xs text-theme-muted">или</span>
                  <div className="flex-1 h-px bg-theme-elevated" />
                </div>
                <motion.button
                  whileTap={{ scale: 0.98 }}
                  onClick={handleGuest}
                  disabled={guestLoading}
                  className="w-full flex items-center justify-center gap-2 py-3 bg-theme-elevated hover:bg-theme-base disabled:opacity-50 text-theme-main text-sm font-medium rounded-xl transition-colors duration-150 cursor-pointer border border-theme"
                >
                  {guestLoading ? <Loader2 size={15} className="animate-spin" /> : <><UserX size={15} /> Продолжить без регистрации</>}
                </motion.button>
                <p className="text-center text-xs text-theme-muted leading-relaxed">
                  Гостевые данные сохраняются в облаке, но привязаны только к этому устройству.
                </p>
              </>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
}

function SuccessScreen({ email }) {
  return (
    <div className="min-h-screen bg-theme-base flex items-center justify-center p-4">
      <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center max-w-sm">
        <div className="inline-flex w-16 h-16 bg-theme-elevated rounded-2xl items-center justify-center mb-4 border border-theme">
          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.2, type: 'spring', bounce: 0.5 }}>
            <Mail size={32} className="text-primary" />
          </motion.div>
        </div>
        <h2 className="text-xl font-bold text-theme-main mb-2">Проверьте почту</h2>
        <p className="text-sm text-theme-muted">
          Письмо отправлено на <span className="font-medium text-theme-main">{email}</span>.
        </p>
      </motion.div>
    </div>
  );
}