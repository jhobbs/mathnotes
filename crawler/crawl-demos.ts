#!/usr/bin/env tsx
// Crawler script specifically for capturing demo screenshots

import { Crawler, DemoScreenshotPlugin } from './crawler.js';
import path from 'path';

async function main() {
  // Parse command line arguments
  const args = process.argv.slice(2);
  const options = {
    url: 'http://localhost:5000',
    output: './demo-screenshots',
    showBrowser: false,
    verbose: false,
    demoOnly: true,
    concurrency: 1,
    singleDemo: null as string | null
  };
  
  // Simple argument parsing
  for (let i = 0; i < args.length; i++) {
    switch (args[i]) {
      case '--url':
      case '-u':
        options.url = args[++i] || options.url;
        break;
      case '--output':
      case '-o':
        options.output = args[++i] || options.output;
        break;
      case '--show-browser':
        options.showBrowser = true;
        break;
      case '--verbose':
      case '-v':
        options.verbose = true;
        break;
      case '--concurrency':
      case '-c':
        options.concurrency = parseInt(args[++i]) || 1;
        break;
      case '--demo':
      case '-d':
        options.singleDemo = args[++i];
        break;
      case '--help':
      case '-h':
        console.log(`
Usage: ./crawl-demos.ts [options] [demo-name]

Options:
  -u, --url <url>         Base URL to crawl (default: http://localhost:5000)
  -o, --output <dir>      Output directory for screenshots (default: ./demo-screenshots)
  --show-browser          Show the browser window
  -v, --verbose           Verbose output
  -c, --concurrency <n>   Number of concurrent pages (default: 1)
  -d, --demo <name>       Capture only a specific demo (e.g., physics/electric-field)
  -h, --help              Show this help message

Examples:
  ./crawl-demos.ts                           # Capture all demos
  ./crawl-demos.ts --demo electric-field     # Capture single demo
  ./crawl-demos.ts -d cellular-automata/game-of-life
        `);
        process.exit(0);
    }
  }
  
  console.log('🎨 Demo Screenshot Crawler');
  console.log(`📍 Base URL: ${options.url}`);
  console.log(`📁 Output directory: ${options.output}`);
  console.log(`👁  Mode: ${options.showBrowser ? 'visible' : 'headless'}`);
  if (options.singleDemo) {
    console.log(`🎯 Target demo: ${options.singleDemo}`);
  }
  
  const crawler = new Crawler({
    maxDepth: 0,
    headless: !options.showBrowser,
    verbose: options.verbose,
    logSkipped: false,
    singlePage: true,
    concurrency: 1, // Always use 1 for demo screenshots to avoid conflicts
    showProbe: true,
    ignorePatterns: [
      /^Failed to load resource/i,
      /net::ERR_/i,
      /Cross-Origin-Opener-Policy header has been ignored/i,
    ],
    cacheExtensions: ['.woff', '.woff2', '.ttf', '.otf', '.eot', '.css', '.js', '.ts']
  });
  
  // Register the demo screenshot plugin
  const demoPlugin = new DemoScreenshotPlugin({
    screenshotDir: path.resolve(options.output),
    baseUrl: options.url,
    singleDemo: options.singleDemo
  });
  crawler.registerPlugin(demoPlugin);
  
  try {
    const startUrl = options.demoOnly ? `${options.url}/demo-viewer` : options.url;
    const results = await crawler.crawl(startUrl);
    
    console.log('\n✨ Demo screenshot capture complete!');
    
  } catch (error) {
    console.error('❌ Crawl failed:', error);
    process.exit(1);
  }
}

main().catch(console.error);
