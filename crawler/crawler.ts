#!/usr/bin/env tsx
// scripts/crawler.ts - Refactored modular web crawler with plugin support

import { chromium, Browser, BrowserContext, Page, ConsoleMessage, Request } from 'playwright';
import { URL } from 'node:url';
import process from 'node:process';
import { parseArgs } from 'node:util';

// Types
interface CrawlConfig {
  maxDepth: number;
  headless: boolean;
  verbose: boolean;
  logSkipped: boolean;
  singlePage: boolean;
  concurrency: number;
  showProbe: boolean;
  ignorePatterns: RegExp[];
  cacheExtensions: string[];
}

interface QueueItem {
  url: string;
  depth: number;
}

interface CrawlResult {
  url: string;
  errors: CrawlError[];
  links: string[];
  metadata?: Record<string, any>;
}

interface CrawlError {
  type: 'js' | 'console' | 'navigation' | 'request';
  message: string;
  stack?: string;
  location?: string;
}

interface ResourceCache {
  status: number;
  headers: Record<string, string>;
  body: Buffer;
  contentType?: string;
}

interface SkippedUrls {
  external: Set<string>;
  alreadyVisited: Set<string>;
  maxDepth: Set<string>;
  malformed: Set<string>;
}

// Plugin system
abstract class CrawlerPlugin {
  name: string = 'UnnamedPlugin';
  
  async beforeCrawl?(crawler: Crawler): Promise<void> {}
  async afterCrawl?(crawler: Crawler, results: Map<string, CrawlResult>): Promise<void> {}
  async beforeVisit?(page: Page, url: string, depth: number): Promise<void> {}
  async afterVisit?(page: Page, url: string, depth: number, result: CrawlResult): Promise<void> {}
  async onError?(error: CrawlError, url: string): Promise<void> {}
  async onLink?(link: string, sourceUrl: string): Promise<boolean> { return true; }
}

// Core classes
class ErrorReporter {
  private reportedErrors = new Set<string>();
  private errors: CrawlError[] = [];
  
  clear(): void {
    this.reportedErrors.clear();
    this.errors = [];
  }
  
  report(error: CrawlError, url: string, verbose: boolean = false): void {
    const errorKey = `${error.type}::${error.message}::${error.location || ''}`;
    
    if (this.reportedErrors.has(errorKey)) {
      return;
    }
    
    this.reportedErrors.add(errorKey);
    this.errors.push(error);
    
    // Console output
    console.error(`\n❌ ${error.type.toUpperCase()} error on ${url}`);
    console.error(`   Message: ${error.message}`);
    
    if (error.stack && verbose) {
      console.error(`   Stack trace:`);
      error.stack.split('\n').forEach(line => {
        console.error(`     ${line}`);
      });
    }
    
    if (error.location) {
      console.error(`   Location: ${error.location}`);
    }
  }
  
  getErrors(): CrawlError[] {
    return [...this.errors];
  }
  
  hasErrors(): boolean {
    return this.errors.length > 0;
  }
}

class QueueManager {
  private queue: QueueItem[] = [];
  private nextIndex = 0;
  
  add(items: QueueItem[]): void {
    this.queue.push(...items);
  }
  
  getNext(): QueueItem | null {
    if (this.nextIndex >= this.queue.length) {
      return null;
    }
    return this.queue[this.nextIndex++];
  }
  
  hasWork(): boolean {
    return this.nextIndex < this.queue.length;
  }
  
  size(): number {
    return this.queue.length;
  }
}

class CacheManager {
  private cache = new Map<string, ResourceCache>();
  private extensions: string[];
  
  constructor(cacheExtensions: string[]) {
    this.extensions = cacheExtensions;
  }
  
  shouldCache(url: string): boolean {
    return this.extensions.some(ext => url.includes(ext));
  }
  
  get(url: string): ResourceCache | undefined {
    return this.cache.get(url);
  }
  
  set(url: string, data: ResourceCache): void {
    this.cache.set(url, data);
  }
  
  size(): number {
    return this.cache.size;
  }
  
  getTotalSize(): number {
    let total = 0;
    for (const [_, data] of this.cache) {
      total += data.body.length;
    }
    return total;
  }
}

class PageProcessor {
  constructor(
    private context: BrowserContext,
    private config: CrawlConfig,
    private errorReporter: ErrorReporter,
    private plugins: CrawlerPlugin[]
  ) {}
  
  async process(url: string, depth: number): Promise<CrawlResult> {
    const page = await this.context.newPage();
    const result: CrawlResult = { url, errors: [], links: [] };
    
    this.setupPageHandlers(page);
    
    try {
      // Plugin: beforeVisit
      for (const plugin of this.plugins) {
        await plugin.beforeVisit?.(page, url, depth);
      }
      
      // Navigate - always show which page we're visiting
      console.log(`Visiting ${url}`);
      
      const response = await page.goto(url, { 
        waitUntil: 'domcontentloaded', 
        timeout: 5000 
      });
      
      // Check for 404 or other HTTP errors
      if (response && response.status() >= 400) {
        const crawlError: CrawlError = {
          type: 'navigation',
          message: `HTTP ${response.status()} error`
        };
        
        result.errors.push(crawlError);
        this.errorReporter.report(crawlError, url, this.config.verbose);
        
        // Still continue to check for other errors on the page
      }
      
      if (this.config.verbose) {
        console.log(`   ✓ Navigation complete (status: ${response?.status()})`);
      }
      
      // Wait for stability
      try {
        await page.waitForLoadState('networkidle', { timeout: 2000 });
        if (this.config.verbose) {
          console.log('   ✓ Page is idle');
        }
      } catch {
        if (this.config.verbose) {
          console.log('   ⏱️  2 second timeout reached, continuing');
        }
      }
      
      // Harvest links
      if (!this.config.singlePage) {
        const links = await page.$$eval('a[href]', anchors =>
          anchors.map(a => a.href).filter(Boolean)
        );
        
        for (const link of links) {
          // Plugin: onLink
          let shouldInclude = true;
          for (const plugin of this.plugins) {
            if (await plugin.onLink?.(link, url) === false) {
              shouldInclude = false;
              break;
            }
          }
          
          if (shouldInclude) {
            result.links.push(link);
          }
        }
      }
      
      // Plugin: afterVisit
      for (const plugin of this.plugins) {
        await plugin.afterVisit?.(page, url, depth, result);
      }
      
    } catch (error) {
      const crawlError: CrawlError = {
        type: 'navigation',
        message: error instanceof Error ? error.message : String(error)
      };
      
      result.errors.push(crawlError);
      this.errorReporter.report(crawlError, url, this.config.verbose);
      
      // Plugin: onError
      for (const plugin of this.plugins) {
        await plugin.onError?.(crawlError, url);
      }
    }
    
    // Collect errors from reporter
    result.errors = this.errorReporter.getErrors();
    
    // Clean up
    try {
      await page.goto('about:blank', { timeout: 1000 });
      await new Promise(resolve => setTimeout(resolve, 100));
    } catch {
      // Ignore cleanup errors
    }
    
    await page.close();
    
    return result;
  }
  
  private setupPageHandlers(page: Page): void {
    page.on('pageerror', async (error) => {
      const crawlError: CrawlError = {
        type: 'js',
        message: error.message,
        stack: error.stack
      };
      
      this.errorReporter.report(crawlError, page.url(), this.config.verbose);
    });
    
    page.on('console', (msg: ConsoleMessage) => {
      // Handle probe messages
      if (this.config.showProbe && msg.text().includes('[probe]')) {
        console.log(`\n${msg.text()}`);
      }
      
      // Handle warnings in verbose mode
      if (this.config.verbose && msg.type() === 'warning') {
        console.log(`\n⚠️  Console warning: ${msg.text()}`);
      }
      
      // Handle errors
      if (msg.type() === 'error' && 
          !this.config.ignorePatterns.some(rx => rx.test(msg.text()))) {
        
        const location = msg.location();
        const crawlError: CrawlError = {
          type: 'console',
          message: msg.text(),
          location: location ? `${location.url}:${location.lineNumber}:${location.columnNumber}` : undefined
        };
        
        this.errorReporter.report(crawlError, page.url(), this.config.verbose);
      }
    });
    
    if (this.config.verbose) {
      page.on('requestfailed', (request: Request) => {
        console.log(`\n❌ Request failed: ${request.url()}\n   Reason: ${request.failure()?.errorText}`);
      });
    }
  }
}

class Crawler {
  private browser?: Browser;
  private context?: BrowserContext;
  private visited = new Set<string>();
  private queueManager = new QueueManager();
  private cacheManager: CacheManager;
  private errorReporter = new ErrorReporter();
  private plugins: CrawlerPlugin[] = [];
  private results = new Map<string, CrawlResult>();
  private skippedUrls?: SkippedUrls;
  
  constructor(private config: CrawlConfig) {
    this.cacheManager = new CacheManager(config.cacheExtensions);
    
    if (config.logSkipped) {
      this.skippedUrls = {
        external: new Set(),
        alreadyVisited: new Set(),
        maxDepth: new Set(),
        malformed: new Set()
      };
    }
  }
  
  registerPlugin(plugin: CrawlerPlugin): void {
    this.plugins.push(plugin);
    if (this.config.verbose) {
      console.log(`Registered plugin: ${plugin.name}`);
    }
  }
  
  async crawl(startUrl: string): Promise<Map<string, CrawlResult>> {
    const origin = new URL(startUrl).origin;
    
    // Initialize browser
    this.browser = await chromium.launch({ headless: this.config.headless });
    this.context = await this.browser.newContext({ 
      ignoreHTTPSErrors: true,
      bypassCSP: true
    });
    
    // Set up caching
    await this.setupCaching();
    
    // Plugin: beforeCrawl
    for (const plugin of this.plugins) {
      await plugin.beforeCrawl?.(this);
    }
    
    // Start crawling
    console.log(`Starting crawler at ${startUrl}`);
    if (this.config.verbose) {
      console.log(`Options: ${JSON.stringify(this.config, null, 2)}`);
    }
    if (this.config.singlePage) {
      console.log('Running in single-page mode - will not follow links');
    }
    console.log('');
    
    this.queueManager.add([{ url: startUrl, depth: 0 }]);
    
    const pageProcessor = new PageProcessor(
      this.context,
      this.config,
      this.errorReporter,
      this.plugins
    );
    
    // Process queue with concurrency
    const inProgress = new Set<Promise<void>>();
    
    while (this.queueManager.hasWork() || inProgress.size > 0) {
      // Start new crawls up to concurrency limit
      while (inProgress.size < this.config.concurrency && this.queueManager.hasWork()) {
        const item = this.queueManager.getNext();
        if (!item) break;
        
        // Skip if already visited
        if (this.visited.has(item.url)) {
          if (this.config.logSkipped) {
            this.skippedUrls!.alreadyVisited.add(item.url);
          }
          continue;
        }
        
        this.visited.add(item.url);
        
        const crawlPromise = this.processSinglePage(
          pageProcessor,
          item,
          origin
        ).then(() => {
          inProgress.delete(crawlPromise);
        }).catch(error => {
          console.error(`\n❌ Unexpected error crawling ${item.url}: ${error.message}`);
          inProgress.delete(crawlPromise);
        });
        
        inProgress.add(crawlPromise);
      }
      
      // Wait for at least one to complete
      if (inProgress.size > 0) {
        await Promise.race(inProgress);
      }
    }
    
    // Wait for all to complete
    await Promise.all(inProgress);
    
    // Plugin: afterCrawl
    for (const plugin of this.plugins) {
      await plugin.afterCrawl?.(this, this.results);
    }
    
    // Clean up
    await this.browser.close();
    
    // Report results
    this.reportResults();
    
    return this.results;
  }
  
  private async processSinglePage(
    processor: PageProcessor,
    item: QueueItem,
    origin: string
  ): Promise<void> {
    this.errorReporter.clear();
    
    const result = await processor.process(item.url, item.depth);
    this.results.set(item.url, result);
    
    // Process discovered links
    for (const link of result.links) {
      try {
        const linkUrl = new URL(link);
        const cleanUrl = linkUrl.href.split('#')[0];
        
        if (linkUrl.origin !== origin) {
          if (this.config.logSkipped) {
            this.skippedUrls!.external.add(link);
          }
          continue;
        }
        
        if (item.depth + 1 > this.config.maxDepth) {
          if (this.config.logSkipped) {
            this.skippedUrls!.maxDepth.add(cleanUrl);
          }
          continue;
        }
        
        if (!this.visited.has(cleanUrl)) {
          this.queueManager.add([{
            url: cleanUrl,
            depth: item.depth + 1
          }]);
        }
        
      } catch {
        if (this.config.logSkipped) {
          this.skippedUrls!.malformed.add(link);
        }
      }
    }
  }
  
  private async setupCaching(): Promise<void> {
    if (!this.context) return;
    
    await this.context.route('**/*', async (route, request) => {
      const url = request.url();
      const shouldCache = this.cacheManager.shouldCache(url);
      
      if (shouldCache && this.cacheManager.get(url)) {
        // Serve from cache
        const cached = this.cacheManager.get(url)!;
        if (this.config.verbose) {
          console.log(`   📦 Serving from cache: ${url.split('/').pop()}`);
        }
        await route.fulfill({
          status: cached.status,
          headers: cached.headers,
          body: cached.body,
          contentType: cached.contentType
        });
      } else if (shouldCache) {
        // Fetch and cache
        const response = await route.fetch();
        const body = await response.body();
        const headers = response.headers();
        
        if (response.status() === 200) {
          this.cacheManager.set(url, {
            status: response.status(),
            headers,
            body,
            contentType: headers['content-type']
          });
          
          if (this.config.verbose) {
            console.log(`   💾 Cached: ${url.split('/').pop()}`);
          }
        }
        
        await route.fulfill({
          status: response.status(),
          headers,
          body
        });
      } else {
        await route.continue();
      }
    });
  }
  
  private reportResults(): void {
    console.log(`\nVisited ${this.visited.size} page${this.visited.size !== 1 ? 's' : ''}`);
    
    // Cache statistics
    if (this.config.verbose && this.cacheManager.size() > 0) {
      console.log(`\nCache statistics:`);
      console.log(`  Cached resources: ${this.cacheManager.size()}`);
      console.log(`  Total cache size: ${(this.cacheManager.getTotalSize() / 1024 / 1024).toFixed(2)} MB`);
    }
    
    // Skipped URLs
    if (this.config.logSkipped && this.skippedUrls && !this.config.singlePage) {
      console.log('\nSkipped URLs summary:');
      
      if (this.skippedUrls.external.size > 0) {
        console.log(`  External URLs: ${this.skippedUrls.external.size}`);
      }
      if (this.skippedUrls.alreadyVisited.size > 0) {
        console.log(`  Already visited: ${this.skippedUrls.alreadyVisited.size}`);
      }
      if (this.skippedUrls.maxDepth.size > 0) {
        console.log(`  Max depth exceeded: ${this.skippedUrls.maxDepth.size}`);
      }
      if (this.skippedUrls.malformed.size > 0) {
        console.log(`  Malformed URLs: ${this.skippedUrls.malformed.size}`);
      }
    }
    
    // Error summary
    let totalErrors = 0;
    for (const [_, result] of this.results) {
      totalErrors += result.errors.length;
    }
    
    if (totalErrors > 0) {
      console.error(`\n🛑 Found ${totalErrors} errors during crawl`);
      process.exit(1);
    } else {
      console.log('\n✅ Crawl complete – no errors found');
    }
  }
}

// CLI parsing
function parseCliArgs(): { startUrl: string; config: CrawlConfig } {
  const args = process.argv.slice(2);
  
  if (args.length === 0) {
    console.error('Usage: crawler.ts <start-url> [options]');
    console.error('Options:');
    console.error('  --max-depth N        Maximum crawl depth (default: Infinity)');
    console.error('  --headless false     Show browser window (default: true)');
    console.error('  --verbose true       Enable verbose logging (default: false)');
    console.error('  --log-skipped true   Log skipped URLs (default: false)');
    console.error('  --single-page true   Only crawl the start URL (default: false)');
    console.error('  --concurrency N      Number of parallel pages (default: 10)');
    console.error('  --show-probe true    Show [probe] console messages (default: true)');
    process.exit(1);
  }
  
  const startUrl = args[0];
  
  // Simple flag parsing
  const flag = (name: string, defaultValue: string): string => {
    const idx = args.findIndex(a => a === `--${name}`);
    if (idx === -1) return defaultValue;
    return args[idx + 1] || 'true';
  };
  
  const config: CrawlConfig = {
    maxDepth: Number(flag('max-depth', 'Infinity')),
    headless: flag('headless', 'true') !== 'false',
    verbose: flag('verbose', 'false') === 'true',
    logSkipped: flag('log-skipped', 'false') === 'true',
    singlePage: flag('single-page', 'false') === 'true',
    concurrency: Number(flag('concurrency', '10')),
    showProbe: flag('show-probe', 'true') === 'true',
    ignorePatterns: [
      /^Failed to load resource/i,
      /net::ERR_/i,
      /Cross-Origin-Opener-Policy header has been ignored/i,
    ],
    cacheExtensions: ['.woff', '.woff2', '.ttf', '.otf', '.eot', '.css', '.js', '.ts']
  };
  
  return { startUrl, config };
}

// Example plugin: Screenshot capture
class ScreenshotPlugin extends CrawlerPlugin {
  name = 'ScreenshotPlugin';
  private screenshotDir = './screenshots';
  
  async beforeCrawl(crawler: Crawler): Promise<void> {
    // Ensure screenshot directory exists
    const fs = await import('fs/promises');
    await fs.mkdir(this.screenshotDir, { recursive: true });
  }
  
  async afterVisit(page: Page, url: string, depth: number, result: CrawlResult): Promise<void> {
    // Example: Capture screenshots of demo viewer page
    if (url.includes('/demos')) {
      const demos = await page.$$('.demo-container');
      
      for (let i = 0; i < demos.length; i++) {
        const demo = demos[i];
        const demoName = await demo.getAttribute('data-demo') || `demo-${i}`;
        
        // Scroll demo into view and capture
        await demo.scrollIntoViewIfNeeded();
        await demo.screenshot({
          path: `${this.screenshotDir}/${demoName}.png`
        });
        
        console.log(`   📸 Captured screenshot: ${demoName}.png`);
      }
    }
  }
}

// Main execution
async function main() {
  const { startUrl, config } = parseCliArgs();
  
  const crawler = new Crawler(config);
  
  // Register plugins based on config or command line
  // Example: crawler.registerPlugin(new ScreenshotPlugin());
  
  await crawler.crawl(startUrl);
}

// Run if executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
}

// Export for use as a module
export { Crawler, CrawlerPlugin, ScreenshotPlugin, type CrawlConfig, type CrawlResult };