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

// Build configuration
const buildOptions = {
  entryPoints: [
    path.resolve(process.cwd(), 'demos-framework/src/main.ts'),
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
    '.sty': 'text',
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
  plugins: [postcssPlugin],
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
    
    // Generate manifest.json for asset versioning
    const manifest = {};
    if (result.metafile) {
      for (const [key, value] of Object.entries(result.metafile.outputs)) {
        const relativePath = key.replace('static/dist/', '');
        
        // Map entry points to their output files
        if (value.entryPoint) {
          const entryName = path.basename(value.entryPoint, path.extname(value.entryPoint));
          const ext = path.extname(key);
          
          if (ext === '.js') {
            manifest[`${entryName}.js`] = relativePath;
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