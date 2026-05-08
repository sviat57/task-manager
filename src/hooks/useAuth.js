import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

/**
 * Хук авторизации.
 * Подписывается на onAuthStateChange — реагирует на логин/логаут/
 * восстановление сессии после перезагрузки страницы.
 *
 * Возвращает:
 *  user        — объект пользователя Supabase или null
 *  loading     — true пока идёт проверка сессии при старте
 *  signUp      — регистрация email/password
 *  signIn      — вход email/password
 *  signOut     — выход
 *  error       — последняя ошибка auth
 */
export function useAuth() {
  const [user,    setUser]    = useState(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState(null);

  useEffect(() => {
    // Получаем текущую сессию при монтировании (работает после перезагрузки)
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // Подписка на все изменения состояния авторизации
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user ?? null);
        setLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const signUp = async (email, password) => {
    setError(null);
    const { error: err } = await supabase.auth.signUp({ email, password });
    if (err) setError(err.message);
    return !err;
  };

  const signIn = async (email, password) => {
    setError(null);
    const { error: err } = await supabase.auth.signInWithPassword({ email, password });
    if (err) setError(err.message);
    return !err;
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
  };

  return { user, loading, error, signUp, signIn, signOut };
}