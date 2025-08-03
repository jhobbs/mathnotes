import { defineConfig, Plugin } from 'vite';
import { resolve } from 'path';
import { viteStaticCopy } from 'vite-plugin-static-copy';

// Custom plugin to log requests and fix host header issues
function requestLogger(): Plugin {
  return {
    name: 'request-logger',
    configureServer(server) {
      // Add middleware BEFORE Vite's built-in middleware
      server.middlewares.use((req, res, next) => {
        const start = Date.now();
        const method = req.method;
        const url = req.url;
        
        
        // Fix host header if it's coming from Docker network
        if (req.headers.host === 'vite:5173') {
          req.headers.host = 'localhost:5173';
        }
        
        // Capture the original end method
        const originalEnd = res.end;
        res.end = function(...args) {
          const duration = Date.now() - start;
          const status = res.statusCode;
          
          // Color code based on status
          let statusColor = '\x1b[32m'; // green for 2xx
          if (status >= 300 && status < 400) statusColor = '\x1b[33m'; // yellow for 3xx
          if (status >= 400 && status < 500) statusColor = '\x1b[35m'; // magenta for 4xx
          if (status >= 500) statusColor = '\x1b[31m'; // red for 5xx
          
          // Log in a format similar to other web servers
          console.log(
            `\x1b[90m[Vite]\x1b[0m ${method} ${url} ${statusColor}${status}\x1b[0m ${duration}ms`
          );
          
          originalEnd.apply(res, args);
        };
        
        next();
      });
    }
  };
}

export default defineConfig({
  root: '.',
  base: '/static/dist/',
  publicDir: false, // We don't use a public directory
  css: {
    modules: {
      localsConvention: 'camelCase',
      generateScopedName: '[name]__[local]___[hash:base64:5]',
    },
    postcss: './postcss.config.js',
  },
  plugins: [
    requestLogger(),
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
        styles: resolve(__dirname, 'styles/main.css'),
      },
      output: {
        entryFileNames: '[name]-[hash].js',
        chunkFileNames: '[name]-[hash].js',
        assetFileNames: '[name]-[hash].[ext]'
      }
    },
    sourcemap: true,
    manifest: true
  },
  resolve: {
    alias: {
      '@': resolve(__dirname),
      '@demos': resolve(__dirname, 'demos'),
      '@framework': resolve(__dirname, 'demos-framework/src')
    }
  },
  server: {
    host: '0.0.0.0',
    port: 5173,
    // Add custom middleware for request logging
    middlewareMode: false,
    // Allow serving files from the project root
    fs: {
      allow: ['..'],
      strict: false
    },
    // Configure CORS to allow requests from Docker network
    cors: {
      origin: true,  // Allow all origins in development
      credentials: true
    },
    // Allow any host header (important for Docker networking)
    headers: {
      'Access-Control-Allow-Origin': '*'
    },
    hmr: {
      // Ensure HMR works across Docker network
      host: 'localhost',
      protocol: 'ws',
      port: 5173
    },
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