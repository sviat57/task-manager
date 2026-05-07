import { useState, useEffect } from 'react';

/**
 * Кастомный хук для синхронизации состояния с LocalStorage.
 * При первом рендере читает сохранённое значение; при каждом
 * изменении состояния — записывает обратно.
 */
export function useLocalStorage(key, initialValue) {
  const [storedValue, setStoredValue] = useState(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (err) {
      console.warn(`useLocalStorage: ошибка чтения "${key}"`, err);
      return initialValue;
    }
  });

  useEffect(() => {
    try {
      window.localStorage.setItem(key, JSON.stringify(storedValue));
    } catch (err) {
      console.warn(`useLocalStorage: ошибка записи "${key}"`, err);
    }
  }, [key, storedValue]);

  return [storedValue, setStoredValue];
}