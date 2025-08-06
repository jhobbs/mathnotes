import esbuild from 'esbuild';
import { glob } from 'glob';
import fs from 'fs/promises';
import path from 'path';
import postcss from 'postcss';
import autoprefixer from 'autoprefixer';
import postcssNesting from 'postcss-nesting';
import postcssCustomMedia from 'postcss-custom-media';
import postcssLab from 'postcss-lab-function';
import crypto from 'crypto';

const isDev = process.argv.includes('--dev');
const watch = process.argv.includes('--watch');

// PostCSS processor
const postcssProcessor = postcss([
  postcssNesting(),
  postcssCustomMedia(),
  postcssLab({ preserve: true }),
  autoprefixer()
]);

// Plugin to handle CSS processing with PostCSS
const postcssPlugin = {
  name: 'postcss',
  setup(build) {
    build.onLoad({ filter: /\.css$/ }, async (args) => {
      const source = await fs.readFile(args.path, 'utf8');
      
      // Process with PostCSS
      const result = await postcssProcessor.process(source, {
        from: args.path,
        to: args.path
      });
      
      return {
        contents: result.css,
        loader: 'css'
      };
    });
  }
};

// Plugin to copy MathJax fonts
const copyPlugin = {
  name: 'copy-files',
  setup(build) {
    build.onEnd(async () => {
      const srcDir = 'node_modules/mathjax/es5/output/chtml/fonts/woff-v2';
      const destDir = 'static/dist/fonts/mathjax/woff-v2';
      
      try {
        await fs.mkdir(destDir, { recursive: true });
        const files = await fs.readdir(srcDir);
        
        for (const file of files) {
          await fs.copyFile(
            path.join(srcDir, file),
            path.join(destDir, file)
          );
        }
        console.log('✓ Copied MathJax fonts');
      } catch (err) {
        console.error('Failed to copy MathJax fonts:', err);
      }
    });
  }
};

// Build configuration
const buildOptions = {
  entryPoints: [
    path.resolve(process.cwd(), 'demos-framework/src/main.ts'),
    path.resolve(process.cwd(), 'demos-framework/src/mathjax-entry.ts'),
    path.resolve(process.cwd(), 'styles/main.css')
  ],
  bundle: true,
  outdir: './static/dist',
  format: 'esm',
  target: 'esnext',
  sourcemap: true,
  minify: !isDev,
  metafile: true,
  splitting: true,
  chunkNames: '[name]-[hash]',
  assetNames: '[name]-[hash]',
  entryNames: '[name]-[hash]',
  publicPath: '/static/dist/',
  loader: {
    '.woff': 'file',
    '.woff2': 'file',
    '.ttf': 'file',
    '.eot': 'file',
    '.svg': 'file',
    '.png': 'file',
    '.jpg': 'file',
    '.jpeg': 'file',
    '.gif': 'file'
  },
  alias: {
    '@': path.resolve(process.cwd()),
    '@demos': path.resolve(process.cwd(), 'demos'),
    '@framework': path.resolve(process.cwd(), 'demos-framework/src')
  },
  plugins: [postcssPlugin, copyPlugin],
  external: [],
  // Handle node module resolution issues
  mainFields: ['module', 'main'],
  conditions: ['import', 'module', 'browser', 'default'],
  resolveExtensions: ['.tsx', '.ts', '.jsx', '.js', '.css', '.json']
};

// Build function
async function build() {
  try {
    // Clean output directory
    await fs.rm('./static/dist', { recursive: true, force: true });
    await fs.mkdir('./static/dist', { recursive: true });
    
    console.log('Building with esbuild...');
    const result = await esbuild.build(buildOptions);
    
    // Generate manifest.json for Flask integration
    const manifest = {};
    if (result.metafile) {
      for (const [key, value] of Object.entries(result.metafile.outputs)) {
        const relativePath = key.replace('static/dist/', '');
        
        // Map entry points to their output files
        if (value.entryPoint) {
          const entryName = path.basename(value.entryPoint, path.extname(value.entryPoint));
          const ext = path.extname(key);
          
          if (ext === '.js') {
            // Special case for mathjax-entry.js
            if (value.entryPoint.includes('mathjax-entry')) {
              manifest['mathjax.js'] = relativePath;
            } else {
              manifest[`${entryName}.js`] = relativePath;
            }
          } else if (ext === '.css') {
            // The styles/main.css entry should map to main.css in manifest
            if (value.entryPoint.includes('styles/main.css')) {
              manifest['main.css'] = relativePath;
            } else {
              manifest[`${entryName}.css`] = relativePath;
            }
          }
        }
      }
    }
    
    await fs.writeFile(
      './static/dist/manifest.json',
      JSON.stringify(manifest, null, 2)
    );
    
    console.log('✓ Build complete');
    console.log('✓ Manifest generated');
    
    if (watch) {
      console.log('Watching for changes...');
    }
  } catch (error) {
    console.error('Build failed:', error);
    process.exit(1);
  }
}

// Watch mode
if (watch) {
  const ctx = await esbuild.context(buildOptions);
  await ctx.watch();
  console.log('Watching for changes...');
} else {
  await build();
}