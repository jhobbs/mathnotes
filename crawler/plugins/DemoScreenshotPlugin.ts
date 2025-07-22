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
    await page.goto(this.demoViewerUrl, { waitUntil: 'networkidle' });
    
    // Wait for demo viewer to be ready
    await page.waitForFunction(() => {
      // @ts-ignore
      return window.demoRegistry && Object.keys(window.demoRegistry).length > 0;
    }, { timeout: 30000 });
    
    // Wait a bit for the demo viewer to fully initialize
    await page.waitForTimeout(2000);
    
    // Get total number of demos from the demo counter
    const totalDemos = await page.evaluate(() => {
      const counterElement = document.querySelector('.demo-counter');
      if (counterElement) {
        const match = counterElement.textContent?.match(/\d+ of (\d+)/);
        return match ? parseInt(match[1]) : 0;
      }
      return 0;
    });
    
    console.log(`[DemoScreenshotPlugin] Found ${totalDemos} demos to capture`);
    
    // Capture each demo by navigating through them
    for (let i = 0; i < totalDemos; i++) {
      try {
        // Navigate to demo by index
        await page.evaluate((index) => {
          // @ts-ignore
          if (window.loadDemo) {
            // @ts-ignore
            window.loadDemo(index);
          }
        }, i);
        
        // Wait for demo to load
        await page.waitForSelector('.demo-component', {
          state: 'visible',
          timeout: 10000
        });
        
        // Wait for demo to initialize
        await page.waitForTimeout(3000);
        
        // Get current demo info from DOM and window objects
        const demoInfo = await page.evaluate(() => {
          // Get demo title from footer
          const titleElement = document.getElementById('footer-demo-title');
          const title = titleElement ? titleElement.textContent || 'unknown' : 'unknown';
          
          // Get current demo index
          const counterElement = document.querySelector('.demo-counter');
          const counterText = counterElement ? counterElement.textContent : '';
          const match = counterText.match(/(\d+) of \d+/);
          const index = match ? parseInt(match[1]) - 1 : 0;
          
          // Get the demo name from the data-demo attribute
          const demoComponent = document.querySelector('.demo-component');
          const demoName = demoComponent ? demoComponent.getAttribute('data-demo') : null;
          
          // Get category from metadata
          let category = 'uncategorized';
          let id = demoName || title.toLowerCase().replace(/[^a-z0-9]+/g, '-');
          
          // @ts-ignore
          if (demoName && window.demoMetadata && window.demoMetadata[demoName]) {
            // @ts-ignore
            const metadata = window.demoMetadata[demoName];
            category = metadata.category || 'uncategorized';
          }
          
          return {
            id: id,
            title: title,
            category: category,
            index: index
          };
        });
        
        await this.captureDemo(page, demoInfo);
        
      } catch (error) {
        console.error(`[DemoScreenshotPlugin] Failed to capture demo at index ${i}:`, error);
      }
    }
  }

  private async captureDemo(page: Page, demo: DemoInfo): Promise<void> {
    console.log(`[DemoScreenshotPlugin] Capturing demo: ${demo.category}/${demo.id} (${demo.title})`);
    
    // We're already on the correct demo, no need to navigate again

    // The demo.id already contains the full path structure (e.g., "cellular-automata/game-of-life")
    // Split it to get the directory structure
    const pathParts = demo.id.split('/');
    const filename = pathParts[pathParts.length - 1];
    const categoryPath = pathParts.slice(0, -1).join('/');
    
    // If there's no category path in the ID, use the category from metadata
    const screenshotDir = categoryPath 
      ? path.join(this.screenshotDir, categoryPath)
      : path.join(this.screenshotDir, demo.category.toLowerCase().replace(/\s+/g, '-'));
    
    await fs.mkdir(screenshotDir, { recursive: true });

    // Capture screenshot of the demo container
    const demoContainer = await page.$('.demo-component');
    if (demoContainer) {
      const screenshotPath = path.join(screenshotDir, `${filename}.png`);
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
    const fullPagePath = path.join(screenshotDir, `${filename}-full.png`);
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
    demoList: Array<{
      id: string;
      title: string;
      category: string;
    }>;
  }
}