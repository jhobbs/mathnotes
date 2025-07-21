#!/usr/bin/env tsx
// Example: Using the crawler with screenshot plugin

import { Crawler, ScreenshotPlugin, CrawlerPlugin, type CrawlResult } from './crawler.js';
import type { Page } from 'playwright';

async function main() {
  const startUrl = process.argv[2] || 'http://localhost:5000';
  
  const crawler = new Crawler({
    maxDepth: 2,
    headless: true,
    verbose: true,
    logSkipped: false,
    singlePage: false,
    concurrency: 5,
    showProbe: true,
    ignorePatterns: [
      /^Failed to load resource/i,
      /net::ERR_/i,
      /Cross-Origin-Opener-Policy header has been ignored/i,
    ],
    cacheExtensions: ['.woff', '.woff2', '.ttf', '.otf', '.eot', '.css', '.js', '.ts']
  });
  
  // Register screenshot plugin
  crawler.registerPlugin(new ScreenshotPlugin());
  
  // Custom plugin example
  class DemoAnalyzerPlugin extends CrawlerPlugin {
    name = 'DemoAnalyzer';
    private demoPages = new Map<string, string[]>();
    
    async afterVisit(page: Page, url: string, depth: number, result: CrawlResult) {
      // Find all demos on the page
      const demos = await page.$$eval('.demo-container', containers =>
        containers.map(c => c.getAttribute('data-demo') || 'unknown')
      );
      
      if (demos.length > 0) {
        this.demoPages.set(url, demos);
        console.log(`   🎮 Found ${demos.length} demos: ${demos.join(', ')}`);
      }
    }
    
    async afterCrawl(crawler: Crawler, results: Map<string, CrawlResult>) {
      console.log('\n📊 Demo Analysis Summary:');
      console.log(`Total pages with demos: ${this.demoPages.size}`);
      
      for (const [url, demos] of this.demoPages) {
        console.log(`\n  ${url}:`);
        demos.forEach(demo => console.log(`    - ${demo}`));
      }
    }
  }
  
  crawler.registerPlugin(new DemoAnalyzerPlugin());
  
  // Run the crawl
  const results = await crawler.crawl(startUrl);
  
  // Analyze results
  console.log('\n📈 Crawl Analysis:');
  let errorCount = 0;
  for (const [url, result] of results) {
    if (result.errors.length > 0) {
      errorCount += result.errors.length;
      console.log(`\n  ${url}: ${result.errors.length} errors`);
      result.errors.forEach(err => {
        console.log(`    - ${err.type}: ${err.message}`);
      });
    }
  }
  
  console.log(`\nTotal errors found: ${errorCount}`);
}

main().catch(console.error);