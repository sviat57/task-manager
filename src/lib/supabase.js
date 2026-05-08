import { createClient } from '@supabase/supabase-js';

/**
 * Единственный экземпляр клиента Supabase для всего приложения.
 * Vite автоматически подставляет VITE_-переменные из .env
 */
export const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY,
  {
    auth: {
      // Токен сессии хранится в localStorage автоматически
      persistSession: true,
      autoRefreshToken: true,
    },
  }
);