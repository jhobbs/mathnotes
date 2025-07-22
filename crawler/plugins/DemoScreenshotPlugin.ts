import { Page } from 'playwright';
import { CrawlerPlugin, Crawler, type CrawlResult } from '../crawler.js';
import path from 'path';
import fs from 'fs/promises';

interface DemoInfo {
  id: string;
  title: string;
  category: string;
  index: number;
}

export class DemoScreenshotPlugin implements CrawlerPlugin {
  name = 'DemoScreenshotPlugin';
  private screenshotDir: string;
  private demoViewerUrl: string;
  private demos: DemoInfo[] = [];
  private captureCount = 0;
  private baseUrl: string;

  constructor(options: { screenshotDir?: string; baseUrl?: string } = {}) {
    this.screenshotDir = options.screenshotDir || './demo-screenshots';
    // Ensure base URL uses the correct protocol and no trailing slash
    this.baseUrl = (options.baseUrl || 'http://localhost:5000').replace(/\/$/, '');
    // Force HTTP protocol if it's localhost/web-dev
    if (this.baseUrl.includes('localhost') || this.baseUrl.includes('web-dev')) {
      this.baseUrl = this.baseUrl.replace(/^https:/, 'http:');
    }
    this.demoViewerUrl = `${this.baseUrl}/demo-viewer`;
  }

  async beforeCrawl(crawler: Crawler): Promise<void> {
    // Create screenshot directory
    await fs.mkdir(this.screenshotDir, { recursive: true });
    
    console.log(`[DemoScreenshotPlugin] Will capture demo screenshots to: ${this.screenshotDir}`);
  }

  async afterCrawl(crawler: Crawler, results: Map<string, CrawlResult>): Promise<void> {
    // Always create a new page for capturing demos
    console.log('[DemoScreenshotPlugin] Starting demo screenshot capture...');
    
    const browser = (crawler as any).browser;
    const context = (crawler as any).context;
    
    // Use the existing context instead of creating a new page directly from browser
    // This ensures we inherit all the context settings including HTTP headers
    const page = await context.newPage();
    try {
      // If we haven't discovered demos yet, do it now
      if (this.demos.length === 0) {
        await this.discoverDemos(page);
      }
      
      // Capture all demos
      if (this.demos.length > 0) {
        await this.captureAllDemos(page);
      } else {
        console.log('[DemoScreenshotPlugin] No demos found to capture');
      }
    } finally {
      await page.close();
    }
    
    console.log(`[DemoScreenshotPlugin] Captured ${this.captureCount} demo screenshots`);
  }

  async afterVisit(page: Page, url: string, depth: number, result: CrawlResult): Promise<void> {
    // If this is the demo-viewer page, discover available demos
    if (url.includes('/demo-viewer')) {
      await this.discoverDemos(page);
    }
  }

  private async discoverDemos(page: Page): Promise<void> {
    console.log('[DemoScreenshotPlugin] Discovering demos from demo-viewer...');
    
    // Navigate to demo viewer if not already there
    if (!page.url().includes('/demo-viewer')) {
      await page.goto(this.demoViewerUrl, { waitUntil: 'networkidle' });
    }

    // Wait for demo metadata to load
    await page.waitForFunction(() => {
      return window.demoMetadata && Object.keys(window.demoMetadata).length > 0;
    }, { timeout: 30000 });

    // Extract demo information
    this.demos = await page.evaluate(() => {
      if (!window.demoMetadata) return [];
      
      return Object.entries(window.demoMetadata).map(([id, metadata], index) => ({
        id: id,
        title: metadata.title || id,
        category: metadata.category || 'uncategorized',
        index: index
      }));
    });

    console.log(`[DemoScreenshotPlugin] Discovered ${this.demos.length} demos`);
  }

  private async captureAllDemos(page: Page): Promise<void> {
    // Navigate to demo viewer once
    console.log(`[DemoScreenshotPlugin] Navigating to demo viewer: ${this.demoViewerUrl}`);
    console.log(`[DemoScreenshotPlugin] Page URL before navigation: ${page.url()}`);
    
    // Add request logger specific to this page
    page.on('request', request => {
      const url = request.url();
      if (url.startsWith('https://')) {
        console.log(`[DemoScreenshotPlugin] HTTPS request detected: ${url}`);
        console.log(`  Method: ${request.method()}`);
        console.log(`  Resource Type: ${request.resourceType()}`);
      }
    });
    
    await page.goto(this.demoViewerUrl, { waitUntil: 'networkidle' });
    
    // Wait for demo viewer to be ready
    await page.waitForFunction(() => {
      // @ts-ignore
      return window.loadDemo && typeof window.loadDemo === 'function';
    }, { timeout: 30000 });
    
    // Capture each demo
    for (const demo of this.demos) {
      try {
        await this.captureDemo(page, demo);
      } catch (error) {
        console.error(`[DemoScreenshotPlugin] Failed to capture demo ${demo.id}:`, error);
      }
    }
  }

  private async captureDemo(page: Page, demo: DemoInfo): Promise<void> {
    console.log(`[DemoScreenshotPlugin] Capturing demo: ${demo.category}/${demo.id}`);
    
    // Load the specific demo using the viewer's JavaScript API
    await page.evaluate((index) => {
      // @ts-ignore
      if (window.loadDemo) {
        // @ts-ignore
        window.loadDemo(index);
      }
    }, demo.index);

    // Wait for demo component to be present and visible
    await page.waitForSelector('.demo-component', {
      state: 'visible',
      timeout: 10000
    });

    // Wait for demo to fully initialize
    await page.waitForTimeout(3000);

    // Create category directory
    const categoryDir = path.join(this.screenshotDir, demo.category);
    await fs.mkdir(categoryDir, { recursive: true });

    // Capture screenshot of the demo container
    const demoContainer = await page.$('.demo-component');
    if (demoContainer) {
      const screenshotPath = path.join(categoryDir, `${demo.id}.png`);
      await demoContainer.screenshot({ 
        path: screenshotPath,
        animations: 'disabled'
      });
      this.captureCount++;
      console.log(`[DemoScreenshotPlugin] Saved screenshot: ${screenshotPath}`);
    } else {
      console.warn(`[DemoScreenshotPlugin] Demo container not found for ${demo.id}`);
    }

    // Also capture full page screenshot for context
    const fullPagePath = path.join(categoryDir, `${demo.id}-full.png`);
    await page.screenshot({ 
      path: fullPagePath,
      fullPage: true,
      animations: 'disabled'
    });
  }
}

// Extend Window interface for TypeScript
declare global {
  interface Window {
    demoRegistry: Record<string, () => Promise<any>>;
    demoMetadata: Record<string, {
      title?: string;
      category?: string;
      description?: string;
    }>;
    loadDemo: (index: number) => Promise<void>;
  }
}