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

interface ViewportConfig {
  width: number;
  height: number;
  deviceScaleFactor: number;
  isMobile: boolean;
  hasTouch: boolean;
  name: string;
}

interface ColorScheme {
  name: string;
  value: 'light' | 'dark' | 'no-preference';
}

export class DemoScreenshotPlugin implements CrawlerPlugin {
  name = 'DemoScreenshotPlugin';
  private screenshotDir: string;
  private demoViewerUrl: string;
  private demos: DemoInfo[] = [];
  private captureCount = 0;
  private baseUrl: string;
  private singleDemo: string | null;
  private viewports: ViewportConfig[];
  private captureColorSchemes: boolean = true;

  private static readonly DESKTOP_VIEWPORT: ViewportConfig = {
    width: 1920,
    height: 1080,
    deviceScaleFactor: 1,
    isMobile: false,
    hasTouch: false,
    name: 'desktop'
  };

  private static readonly MOBILE_VIEWPORT: ViewportConfig = {
    width: 390,
    height: 844,
    deviceScaleFactor: 3,
    isMobile: true,
    hasTouch: true,
    name: 'mobile'
  };

  constructor(options: { screenshotDir?: string; baseUrl?: string; singleDemo?: string | null; viewports?: string[]; captureColorSchemes?: boolean } = {}) {
    this.screenshotDir = options.screenshotDir || './demo-screenshots';
    // Ensure base URL uses the correct protocol and no trailing slash
    this.baseUrl = (options.baseUrl || 'http://localhost:5000').replace(/\/$/, '');
    // Force HTTP protocol if it's localhost/web-dev
    if (this.baseUrl.includes('localhost') || this.baseUrl.includes('web-dev')) {
      this.baseUrl = this.baseUrl.replace(/^https:/, 'http:');
    }
    this.demoViewerUrl = `${this.baseUrl}/demos/`;
    this.singleDemo = options.singleDemo || null;
    
    // Parse viewport options
    if (options.viewports && options.viewports.length > 0) {
      this.viewports = options.viewports.map(v => {
        if (v === 'desktop') return DemoScreenshotPlugin.DESKTOP_VIEWPORT;
        if (v === 'mobile') return DemoScreenshotPlugin.MOBILE_VIEWPORT;
        if (v === 'both') return [DemoScreenshotPlugin.DESKTOP_VIEWPORT, DemoScreenshotPlugin.MOBILE_VIEWPORT];
        return DemoScreenshotPlugin.DESKTOP_VIEWPORT;
      }).flat();
    } else {
      // Default to both viewports
      this.viewports = [DemoScreenshotPlugin.DESKTOP_VIEWPORT, DemoScreenshotPlugin.MOBILE_VIEWPORT];
    }
    
    // Whether to capture both light and dark color schemes
    this.captureColorSchemes = options.captureColorSchemes !== undefined ? options.captureColorSchemes : true;
  }

  async beforeCrawl(crawler: Crawler): Promise<void> {
    // Create screenshot directory
    await fs.mkdir(this.screenshotDir, { recursive: true });
    
    if (!this.singleDemo) {
      console.log(`[DemoScreenshotPlugin] Will capture demo screenshots to: ${this.screenshotDir}`);
    }
  }

  async afterCrawl(crawler: Crawler, results: Map<string, CrawlResult>): Promise<void> {
    const browser = (crawler as any).browser;
    
    // Define color schemes to capture
    const colorSchemes: ColorScheme[] = this.captureColorSchemes ? [
      { name: 'light', value: 'light' },
      { name: 'dark', value: 'dark' }
    ] : [
      { name: 'light', value: 'light' }
    ];
    
    // Capture screenshots for each viewport and color scheme
    for (const viewport of this.viewports) {
      for (const colorScheme of colorSchemes) {
        if (!this.singleDemo) {
          const colorInfo = this.captureColorSchemes ? ` (${colorScheme.name} mode)` : '';
          console.log(`\n📱 Capturing ${viewport.name} screenshots (${viewport.width}x${viewport.height})${colorInfo}`);
        }
        
        // Create a new context with the specific viewport settings and color scheme
        const context = await browser.newContext({
          viewport: {
            width: viewport.width,
            height: viewport.height
          },
          deviceScaleFactor: viewport.deviceScaleFactor,
          isMobile: viewport.isMobile,
          hasTouch: viewport.hasTouch,
          ignoreHTTPSErrors: true,
          bypassCSP: true,
          extraHTTPHeaders: {
            'Upgrade-Insecure-Requests': '0'
          },
          colorScheme: colorScheme.value
        });
        
        const page = await context.newPage();
        try {
          // If we haven't discovered demos yet, do it now
          if (this.demos.length === 0) {
            await this.discoverDemos(page);
          }
          
          // Capture all demos for this viewport and color scheme
          if (this.demos.length > 0) {
            await this.captureAllDemosForViewport(page, viewport, colorScheme);
          } else {
            console.log('[DemoScreenshotPlugin] No demos found to capture');
          }
        } finally {
          await page.close();
          await context.close();
        }
      }
    }
  }

  async afterVisit(page: Page, url: string, depth: number, result: CrawlResult): Promise<void> {
    // If this is the demo-viewer page, discover available demos
    if (url.includes('/demos/')) {
      await this.discoverDemos(page);
    }
  }

  private async discoverDemos(page: Page): Promise<void> {
    
    // Navigate to demo viewer if not already there
    if (!page.url().includes('/demos/')) {
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

  }

  private async captureAllDemosForViewport(page: Page, viewport: ViewportConfig, colorScheme?: ColorScheme): Promise<void> {
    if (this.singleDemo) {
      // Navigate directly to the specific demo using URL anchor
      await page.goto(`${this.demoViewerUrl}#${this.singleDemo}`, { waitUntil: 'networkidle' });
      
      // Wait for demo to load
      await page.waitForSelector('.demo-component', {
        state: 'visible',
        timeout: 10000
      });
      
      // Wait for demo to initialize
      await page.waitForTimeout(3000);
      
      // Verify the correct demo loaded
      const loadedDemo = await page.evaluate(() => {
        const demoComponent = document.querySelector('.demo-component');
        return demoComponent?.getAttribute('data-demo');
      });
      
      if (!loadedDemo || (!loadedDemo.endsWith(this.singleDemo) && loadedDemo !== this.singleDemo)) {
        throw new Error(`Demo "${this.singleDemo}" not found. Available demos can be found in demos-framework/src/main.ts`);
      }
      
      // Get demo info and capture
      const demoInfo = await this.getDemoInfoFromDOM(page, 0);
      await this.captureDemo(page, demoInfo, viewport, colorScheme);
      
    } else {
      // First, navigate to demo viewer to get the list of all demos
      await page.goto(this.demoViewerUrl, { waitUntil: 'networkidle' });
      
      // Wait for demo registry to be ready
      await page.waitForFunction(() => {
        // @ts-ignore
        return window.demoRegistry && Object.keys(window.demoRegistry).length > 0;
      }, { timeout: 30000 });
      
      // Get all demo names
      const demoNames = await page.evaluate(() => {
        // @ts-ignore
        return Object.keys(window.demoRegistry);
      });
      
      // Capture each demo by navigating directly to it
      for (const demoName of demoNames) {
        try {
          // Navigate directly to the demo using URL anchor
          await page.goto(`${this.demoViewerUrl}#${demoName}`, { waitUntil: 'networkidle' });
          
          // Wait for demo to load
          await page.waitForSelector('.demo-component', {
            state: 'visible',
            timeout: 10000
          });
          
          // Wait for demo to initialize
          await page.waitForTimeout(3000);
          
          // Get demo info and capture
          const demoInfo = await this.getDemoInfoFromDOM(page, 0);
          await this.captureDemo(page, demoInfo, viewport, colorScheme);
          
        } catch (error) {
          console.error(`[DemoScreenshotPlugin] Failed to capture demo ${demoName}:`, error);
        }
      }
    }
  }
  
  private async getDemoInfoFromDOM(page: Page, index: number): Promise<DemoInfo> {
    return await page.evaluate((idx) => {
      // Get demo title from footer
      const titleElement = document.getElementById('footer-demo-title');
      const title = titleElement ? titleElement.textContent || 'unknown' : 'unknown';
      
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
        index: idx
      };
    }, index);
  }

  private async captureDemo(page: Page, demo: DemoInfo, viewport: ViewportConfig, colorScheme?: ColorScheme): Promise<void> {
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

    // Add color scheme suffix to filenames if capturing multiple schemes
    const colorSuffix = colorScheme && this.captureColorSchemes ? `-${colorScheme.name}` : '';
    
    // Capture screenshot of the demo container
    const demoContainer = await page.$('.demo-component');
    if (demoContainer) {
      const screenshotPath = path.join(screenshotDir, `${filename}-${viewport.name}${colorSuffix}.png`);
      await demoContainer.screenshot({ 
        path: screenshotPath,
        animations: 'disabled'
      });
      this.captureCount++;
      // Convert absolute path to relative path for output
      const relativePath = screenshotPath.replace(/^.*\/demo-screenshots\//, './demo-screenshots/');
      console.log(`${viewport.name}${colorSuffix}-base: ${relativePath}`);
      
      // Also capture canvas-only screenshot
      const canvas = await page.$('.demo-component canvas');
      if (canvas) {
        const canvasPath = path.join(screenshotDir, `${filename}-${viewport.name}${colorSuffix}-canvas.png`);
        await canvas.screenshot({ 
          path: canvasPath,
          animations: 'disabled'
        });
        const relativeCanvasPath = canvasPath.replace(/^.*\/demo-screenshots\//, './demo-screenshots/');
        console.log(`${viewport.name}${colorSuffix}-canvas: ${relativeCanvasPath}`);
      }
    } else {
      console.warn(`[DemoScreenshotPlugin] Demo container not found for ${demo.id}`);
    }

    // Also capture full page screenshot for context
    const fullPagePath = path.join(screenshotDir, `${filename}-${viewport.name}${colorSuffix}-full.png`);
    await page.screenshot({ 
      path: fullPagePath,
      fullPage: true,
      animations: 'disabled'
    });
    // Convert absolute path to relative path for output
    const relativeFullPath = fullPagePath.replace(/^.*\/demo-screenshots\//, './demo-screenshots/');
    console.log(`${viewport.name}${colorSuffix}-full: ${relativeFullPath}`);
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
  }
}
