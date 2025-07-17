import { defineConfig } from 'vite';
import { resolve } from 'path';
import { viteStaticCopy } from 'vite-plugin-static-copy';

export default defineConfig({
  root: '.',
  base: '/static/dist/',
  publicDir: false, // We don't use a public directory
  plugins: [
    viteStaticCopy({
      targets: [
        {
          src: 'node_modules/mathjax/es5/output/chtml/fonts/woff-v2/*',
          dest: 'fonts/mathjax/woff-v2'
        }
      ]
    })
  ],
  build: {
    outDir: './static/dist',
    emptyOutDir: true,
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'demos-framework/src/main.ts'),
        mathjax: resolve(__dirname, 'demos-framework/src/mathjax-entry.ts'),
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
      // Don't proxy /static/dist since that's Vite's base
      '^/static/(?!dist)': {
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