import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      // 'autoUpdate' — SW обновляется тихо в фоне, без confirm-диалогов
      registerType: 'autoUpdate',

      // Файлы, которые SW закеширует при установке (App Shell)
      includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'icons/*.png'],

      // Web App Manifest — описание приложения для браузера/ОС
      manifest: {
        name: 'TaskFlow — Менеджер задач',
        short_name: 'TaskFlow',
        description: 'Красивый и мощный менеджер задач с Канбан-доской',
        theme_color: '#6d28d9',        // violet-700 — цвет статус-бара на Android
        background_color: '#f8fafc',   // slate-50
        display: 'standalone',         // без браузерного UI (как нативное приложение)
        orientation: 'portrait',
        scope: '/',
        start_url: '/',
        icons: [
          {
            src: 'icons/icon-192.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'any maskable',   // maskable = адаптивная иконка Android
          },
          {
            src: 'icons/icon-512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable',
          },
        ],
        // Shortcuts — быстрые действия из иконки на рабочем столе
        shortcuts: [
          {
            name: 'Новая задача',
            short_name: 'Задача',
            url: '/?action=new',
            icons: [{ src: 'icons/icon-192.png', sizes: '192x192' }],
          },
        ],
      },

      // Настройки Workbox (стратегии кеширования)
      workbox: {
        importScripts: ['deadline-notifications.js'],
        // Кешируем все JS/CSS/HTML/иконки
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],

        // Стратегия для API-запросов Supabase: NetworkFirst
        // (сначала сеть, при офлайне — кеш)
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/.*\.supabase\.co\/.*/i,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'supabase-api-cache',
              expiration: { maxEntries: 50, maxAgeSeconds: 60 * 5 }, // 5 минут
              networkTimeoutSeconds: 10,
            },
          },
        ],
      },
    }),
  ],
})