#!/usr/bin/env node
// scripts/crawler.js  –  ES modules, Playwright ≥1.30, Node ≥14

import { chromium } from 'playwright';
import { URL } from 'node:url';
import process from 'node:process';

/* ---------- quick & dirty flag parse ---------- */
const argv = process.argv.slice(2);
const startUrl = argv[0];
if (!startUrl) {
  console.error('Usage: node scripts/crawler.js <start-url> [--max-depth N] [--headless false] [--verbose true] [--log-skipped true] [--single-page true] [--concurrency N] [--show-probe true]');
  process.exit(1);
}
function flag(name, def = undefined) {
  const idx = argv.findIndex(a => a === `--${name}`);
  if (idx === -1) return def;
  return argv[idx + 1] ?? true;   // --flag value  OR  --flag -> true
}
const MAX_DEPTH = Number(flag('max-depth', Infinity));
const HEADLESS  = flag('headless', 'true') !== 'false'; // default true
const VERBOSE   = flag('verbose', 'false') === 'true'; // default false
const LOG_SKIPPED = flag('log-skipped', 'false') === 'true'; // default false
const SINGLE_PAGE = flag('single-page', 'false') === 'true'; // default false
const CONCURRENCY = Number(flag('concurrency', 10)); // default 5 parallel pages
const SHOW_PROBE = flag('show-probe', 'true') === 'true'; // default true

/* ---------- constants ---------- */
const origin = new URL(startUrl).origin;
const IGNORE_PATTERNS = [
  /^Failed to load resource/i,
  /net::ERR_/i,                         // ERR_CONNECTION_REFUSED, ERR_SSL_PROTOCOL_ERROR, ...
  /Cross-Origin-Opener-Policy header has been ignored/i,
];

/* ---------- state ---------- */
const queue   = [{ url: startUrl, depth: 0 }];
const visited = new Set();
let   errored = false;

// Track skipped URLs if logging is enabled
const skippedUrls = LOG_SKIPPED ? {
  external: new Set(),
  alreadyVisited: new Set(),
  maxDepth: new Set(),
  malformed: new Set()
} : null;

/* ---------- startup ---------- */
console.log(`Starting crawler at ${startUrl}`);
console.log(`Options: max-depth=${MAX_DEPTH}, headless=${HEADLESS}, verbose=${VERBOSE}, log-skipped=${LOG_SKIPPED}, single-page=${SINGLE_PAGE}, concurrency=${CONCURRENCY}, show-probe=${SHOW_PROBE}`);
if (SINGLE_PAGE) {
  console.log('Running in single-page mode - will not follow links');
}
console.log('');

/* ---------- browser ---------- */
const browser = await chromium.launch({ headless: HEADLESS });

// Create context with route handler for caching
const context = await browser.newContext({ 
  ignoreHTTPSErrors: true,
  // Disable upgrade-insecure-requests behavior
  bypassCSP: true
});

// Set up resource caching
const resourceCache = new Map();
const CACHE_EXTENSIONS = ['.woff', '.woff2', '.ttf', '.otf', '.eot', '.css', '.js', '.ts'];

await context.route('**/*', async (route, request) => {
  const url = request.url();
  const shouldCache = CACHE_EXTENSIONS.some(ext => url.includes(ext));
  
  if (shouldCache && resourceCache.has(url)) {
    // Serve from cache
    const cached = resourceCache.get(url);
    if (VERBOSE) {
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
      // Store in cache
      resourceCache.set(url, {
        status: response.status(),
        headers: headers,
        body: body,
        contentType: headers['content-type']
      });
      if (VERBOSE) {
        console.log(`   💾 Cached: ${url.split('/').pop()}`);
      }
    }
    
    // Fulfill the request with the fetched response
    await route.fulfill({
      status: response.status(),
      headers: headers,
      body: body
    });
  } else {
    // Not cacheable, just continue normally
    await route.continue();
  }
});

// Track errors we've already reported to avoid duplicates
const reportedErrors = new Set();

// Function to set up event handlers for a page
function setupPageHandlers(page) {
  page.on('pageerror', async err => {
    // Create a unique key for this error
    const errorKey = `${err.message}::${err.stack?.split('\n')[1] || ''}`;
    
    // Skip if we've already reported this exact error
    if (reportedErrors.has(errorKey)) {
      return;
    }
    reportedErrors.add(errorKey);
    console.error(`\n❌ JS error on ${page.url()}`);
    console.error(`   Message: ${err.message}`);
    if (err.stack) {
      console.error(`   Stack trace:`);
      err.stack.split('\n').forEach(line => {
        console.error(`     ${line}`);
      });
    }
    
    // Try to get more context about what scripts are loaded
    try {
      const scripts = await page.$$eval('script[src]', scripts => 
        scripts.map(s => s.src).filter(src => !src.includes('about:blank'))
      );
      
      // Check if error is from main.js (minified)
      if (err.stack && err.stack.includes('/static/dist/main.js')) {
        console.error(`   Note: Error is in minified main.js - likely from demo framework or utilities`);
      }
      
      // Check for demo containers on the page
      const demoInfo = await page.$$eval('.demo-container', demos => 
        demos.map(d => d.getAttribute('data-demo') || 'unknown')
      );
      if (demoInfo.length > 0) {
        console.error(`   Active demos on page: ${demoInfo.join(', ')}`);
      }
      
      // Only show loaded scripts in verbose mode
      if (VERBOSE && scripts.length > 0) {
        console.error(`   Loaded scripts:`);
        scripts.forEach(src => {
          console.error(`     - ${src}`);
        });
      }
    } catch (e) {
      // Page might be navigating, ignore
    }
    
    errored = true;
  });

  page.on('console', msg => {
    // Show probe messages when flag is set
    if (SHOW_PROBE && msg.text().includes('[probe]')) {
      console.log(`\n${msg.text()}`);
    }
    
    // In verbose mode, log warnings
    if (VERBOSE && msg.type() === 'warning') {
      console.log(`\n⚠️  Console warning: ${msg.text()}`);
    }
    
    if (msg.type() !== 'error') return;
    if (IGNORE_PATTERNS.some(rx => rx.test(msg.text()))) return;
    
    console.error(`\n❌ Console error on ${page.url()}`);
    console.error(`   Message: ${msg.text()}`);
    
    // Try to get stack trace from console args
    const args = msg.args();
    if (args.length > 0) {
      args.forEach(async (arg, i) => {
        try {
          const value = await arg.jsonValue();
          if (value && typeof value === 'object' && value.stack) {
            console.error(`   Stack trace:`);
            value.stack.split('\n').forEach(line => {
              console.error(`     ${line}`);
            });
          }
        } catch (e) {
          // Ignore if we can't get the value
        }
      });
    }
    
    // Try to get location info
    if (msg.location()) {
      const loc = msg.location();
      console.error(`   Location: ${loc.url}:${loc.lineNumber}:${loc.columnNumber}`);
    }
    
    errored = true;
  });

  // Log failed requests
  page.on('requestfailed', request => {
    if (VERBOSE) {
      console.log(`\n❌ Request failed: ${request.url()}\n   Reason: ${request.failure()?.errorText}`);
    }
  });

  // In verbose mode, log all requests
  if (VERBOSE) {
    page.on('request', request => {
      const resourceType = request.resourceType();
      if (resourceType === 'script' || resourceType === 'document') {
        console.log(`   → Loading ${resourceType}: ${request.url()}`);
      }
    });
  }
}

/* ---------- crawl function ---------- */
async function crawlPage(url, depth) {
  if (depth > MAX_DEPTH) return [];

  console.log(`Visiting ${url}`);
  
  // Clear reported errors for this new page
  reportedErrors.clear();
  
  // Create a new page for each URL (complete isolation)
  const page = await context.newPage();
  setupPageHandlers(page);
  
  // In verbose mode, set up detailed event listeners
  if (VERBOSE) {
    page.once('response', response => {
      if (response.url() === url && response.status() === 200) {
        console.log('   ✓ Main page fetched');
        // Log relevant headers
        const headers = response.headers();
        if (headers['content-security-policy']) {
          console.log(`   CSP: ${headers['content-security-policy']}`);
        }
        if (headers['location']) {
          console.log(`   Location: ${headers['location']}`);
        }
      }
    });
    page.once('domcontentloaded', () => console.log('   ✓ DOMContentLoaded event fired'));
    page.once('load', () => console.log('   ✓ Page load event fired'));
  }
  
  const newUrls = [];
  
  try {
    const response = await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 5_000 });
    if (VERBOSE) {
      console.log(`   ✓ Navigation complete (status: ${response?.status()})`);
    }
    
    // Wait for page to be idle or 2 seconds, whichever comes first
    if (VERBOSE) {
      console.log('   ⏳ Waiting for page to stabilize...');
    }
    try {
      await page.waitForLoadState('networkidle', { timeout: 2_000 });
      if (VERBOSE) {
        console.log('   ✓ Page is idle');
      }
    } catch (timeoutErr) {
      if (VERBOSE) {
        console.log('   ⏱️  2 second timeout reached, continuing');
      }
    }
    
    // Check if any errors occurred during the wait
    if (errored) {
      console.log('   ❌ Error detected during page stabilization');
      return [];
    }
    
    // harvest same‑origin links (unless in single-page mode)
    if (!SINGLE_PAGE) {
      const links = await page.$$eval('a[href]', as =>
        as.map(a => a.href).filter(Boolean)
      );

      for (const link of links) {
        try {
          const u = new URL(link);
          const cleanUrl = u.href.split('#')[0]; // Remove fragment
          
          if (u.origin !== origin) {
            // Different origin - skip
            if (LOG_SKIPPED) {
              console.log(`   Skipping external URL: ${link}`);
              skippedUrls.external.add(link);
            }
          } else if (visited.has(cleanUrl)) {
            // Already visited - skip
            if (LOG_SKIPPED) {
              console.log(`   Skipping already visited: ${cleanUrl}`);
              skippedUrls.alreadyVisited.add(cleanUrl);
            }
          } else if (depth + 1 > MAX_DEPTH) {
            // Would exceed max depth - skip
            if (LOG_SKIPPED) {
              console.log(`   Skipping due to max depth: ${cleanUrl}`);
              skippedUrls.maxDepth.add(cleanUrl);
            }
          } else {
            // Add to list of new URLs (will be checked again in processQueue)
            if (!visited.has(cleanUrl)) {
              newUrls.push({ url: cleanUrl, depth: depth + 1 });
            }
          }
        } catch (e) { 
          // Malformed URL - skip
          if (LOG_SKIPPED) {
            console.log(`   Skipping malformed URL: ${link}`);
            skippedUrls.malformed.add(link);
          }
        }
      }
    } else {
      if (VERBOSE) {
        console.log('   Skipping link harvesting in single-page mode');
      }
    }
  } catch (navErr) {
    console.error(`\n❌ Navigation error on ${url}\n   ${navErr.message}`);
    errored = true;
    return [];
  }
  
  // Ensure page unloads properly before closing
  if (VERBOSE) {
    console.log('   ⏳ Triggering page unload...');
  }
  
  try {
    // Navigate to about:blank to force unload events
    await page.goto('about:blank', { timeout: 1000 });
    // Small delay to catch any cleanup errors
    await new Promise(resolve => setTimeout(resolve, 100));
  } catch (err) {
    // Ignore navigation errors during unload
  }
  
  // Close the page to free resources and ensure complete isolation
  await page.close();
  if (VERBOSE) {
    console.log('   ✓ Page closed');
  }
  
  return newUrls;
}

/* ---------- concurrent crawl loop ---------- */
const inProgress = new Set();
let nextQueueIndex = 0;

async function processQueue() {
  while ((queue.length > nextQueueIndex || inProgress.size > 0) && !errored) {
    // Start new crawls up to concurrency limit
    while (inProgress.size < CONCURRENCY && nextQueueIndex < queue.length && !errored) {
      const item = queue[nextQueueIndex++];
      if (!item) break;
      
      // Skip if already visited or being visited
      if (visited.has(item.url)) continue;
      visited.add(item.url);
      
      const crawlPromise = crawlPage(item.url, item.depth)
        .then(newUrls => {
          // Add discovered URLs to queue
          queue.push(...newUrls);
          inProgress.delete(crawlPromise);
        })
        .catch(err => {
          console.error(`\n❌ Unexpected error crawling ${item.url}: ${err.message}`);
          errored = true;
          inProgress.delete(crawlPromise);
        });
      
      inProgress.add(crawlPromise);
    }
    
    // Wait for at least one crawl to complete
    if (inProgress.size > 0) {
      await Promise.race(inProgress);
    }
  }
  
  // Wait for all remaining crawls to complete
  await Promise.all(inProgress);
}

await processQueue();

await browser.close();

console.log(`\nVisited ${visited.size} page${visited.size !== 1 ? 's' : ''}`);

// Show cache statistics
if (VERBOSE && resourceCache.size > 0) {
  console.log(`\nCache statistics:`);
  console.log(`  Cached resources: ${resourceCache.size}`);
  let totalSize = 0;
  for (const [url, data] of resourceCache) {
    totalSize += data.body.length;
  }
  console.log(`  Total cache size: ${(totalSize / 1024 / 1024).toFixed(2)} MB`);
}

// Show skipped URL summary if enabled (and not in single-page mode)
if (LOG_SKIPPED && skippedUrls && !SINGLE_PAGE) {
  console.log('\nSkipped URLs summary:');
  if (skippedUrls.external.size > 0) {
    console.log(`  External URLs: ${skippedUrls.external.size}`);
    if (VERBOSE) {
      skippedUrls.external.forEach(url => console.log(`    - ${url}`));
    }
  }
  if (skippedUrls.alreadyVisited.size > 0) {
    console.log(`  Already visited: ${skippedUrls.alreadyVisited.size}`);
  }
  if (skippedUrls.maxDepth.size > 0) {
    console.log(`  Max depth exceeded: ${skippedUrls.maxDepth.size}`);
  }
  if (skippedUrls.malformed.size > 0) {
    console.log(`  Malformed URLs: ${skippedUrls.malformed.size}`);
    if (VERBOSE) {
      skippedUrls.malformed.forEach(url => console.log(`    - ${url}`));
    }
  }
}

if (errored) {
  console.error('🛑 Crawl aborted due to JavaScript error');
  process.exit(1);
} else {
  console.log('✅ Crawl complete – no JavaScript errors found');
}

