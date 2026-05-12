import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

/**
 * useAuth — авторизация с поддержкой гостевого режима.
 *
 * Новые методы:
 *  signInAsGuest  — анонимный вход через Supabase Anonymous Auth
 *  upgradeGuest   — привязывает email+password к анонимному аккаунту
 *  isGuest        — true если текущий пользователь анонимный
 */
export function useAuth() {
  const [user,    setUser]    = useState(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user ?? null);
        setLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  // Определяем гостя: у анонимных юзеров нет email
  const isGuest = user
    ? !user.email && user.app_metadata?.provider === 'anonymous'
    : false;

  const signUp = async (email, password) => {
    setError(null);
    const { error: err } = await supabase.auth.signUp({ email, password });
    if (err) { setError(err.message); return false; }
    return true;
  };

  const signIn = async (email, password) => {
    setError(null);
    const { error: err } = await supabase.auth.signInWithPassword({ email, password });
    if (err) { setError(err.message); return false; }
    return true;
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
  };

  // ── Гостевой вход ─────────────────────────────────────────────────────────
  const signInAsGuest = async () => {
    setError(null);
    const { error: err } = await supabase.auth.signInAnonymously();
    if (err) { setError(err.message); return false; }
    return true;
  };

  /**
   * Апгрейд гостя до полноценного аккаунта.
   * Supabase linkIdentity привязывает email к существующей анонимной сессии,
   * сохраняя все данные (задачи, настройки).
   */
  const upgradeGuest = async (email, password) => {
    setError(null);
    try {
      // Обновляем анонимного пользователя — добавляем email и пароль
      const { error: err } = await supabase.auth.updateUser({ email, password });
      if (err) throw err;

      // Обновляем профиль в таблице profiles
      await supabase
        .from('profiles')
        .update({ email, is_guest: false })
        .eq('id', user.id);

      return true;
    } catch (err) {
      setError(err.message);
      return false;
    }
  };

  return {
    user, loading, error, isGuest,
    signUp, signIn, signOut,
    signInAsGuest, upgradeGuest,
  };
}