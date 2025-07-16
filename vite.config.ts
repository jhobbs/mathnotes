import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  root: '.',
  base: '/',
  build: {
    outDir: './static/dist',
    emptyOutDir: true,
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'demos-framework/src/main.ts'),
      },
      output: {
        entryFileNames: '[name].js',
        chunkFileNames: '[name]-[hash].js',
        assetFileNames: '[name]-[hash].[ext]'
      }
    },
    sourcemap: true
  },
  resolve: {
    alias: {
      '@demos': resolve(__dirname, 'demos'),
      '@framework': resolve(__dirname, 'demos-framework/src')
    }
  },
  server: {
    host: '0.0.0.0',
    port: 5173,
    proxy: {
      // Proxy only specific paths to Flask
      '/mathnotes': {
        target: 'http://web-dev:5000',
        changeOrigin: true,
      },
      '/static': {
        target: 'http://web-dev:5000',
        changeOrigin: true,
      },
      '/sitemap.xml': {
        target: 'http://web-dev:5000',
        changeOrigin: true,
      }
    }
  }
});