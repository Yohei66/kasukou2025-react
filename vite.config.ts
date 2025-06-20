import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'

// https://vite.dev/config/
export default defineConfig({
  // base: './',
  plugins: [react()],
  server: {
    host: '0.0.0.0',
    port: 3000,              // 好きなポート
    watch: {
      usePolling: true,      // ← これを追加
      interval: 100           // ← ポーリング間隔（ミリ秒）、お好みで調整
    },
    hmr: {
      host: 'localhost',     // ← HMR クライアントが接続するホスト
      port: 3000,            // ← HMR 用のポート
    },
    proxy: {
      // /api/login.php  →  http://localhost:8000/login.php
      '/api': {
        target: 'http://dev-php:9000',
        changeOrigin: true,
        rewrite: path => path.replace(/^\/api/, '')
      }
    }
  }
})
