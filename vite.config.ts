import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  root: './mathnotes/demos',
  base: '/static/dist/',
  build: {
    outDir: '../../static/dist',
    emptyOutDir: true,
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'mathnotes/demos/main.ts'),
      },
      output: {
        entryFileNames: '[name].js',
        chunkFileNames: '[name]-[hash].js',
        assetFileNames: '[name]-[hash].[ext]'
      }
    },
    sourcemap: true
  },
  server: {
    host: '0.0.0.0',
    port: 5173,
    proxy: {
      // Proxy all non-asset requests to Flask container
      '^/(?!(@vite|src|node_modules|static/dist))': {
        target: 'http://web-dev:5000',
        changeOrigin: true,
      }
    }
  }
});