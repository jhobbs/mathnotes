#!/usr/bin/env node
// scripts/crawler.js  –  ES modules, Playwright ≥1.30, Node ≥14

import { chromium } from 'playwright';
import { URL } from 'node:url';
import process from 'node:process';

/* ---------- quick & dirty flag parse ---------- */
const argv = process.argv.slice(2);
const startUrl = argv[0];
if (!startUrl) {
  console.error('Usage: node scripts/crawler.js <start-url> [--max-depth N] [--headless false]');
  process.exit(1);
}
function flag(name, def = undefined) {
  const idx = argv.findIndex(a => a === `--${name}`);
  if (idx === -1) return def;
  return argv[idx + 1] ?? true;   // --flag value  OR  --flag -> true
}
const MAX_DEPTH = Number(flag('max-depth', Infinity));
const HEADLESS  = flag('headless', 'true') !== 'false'; // default true

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

/* ---------- browser ---------- */
const browser = await chromium.launch({ headless: HEADLESS });
const context = await browser.newContext({ 
  ignoreHTTPSErrors: true,
  // Disable upgrade-insecure-requests behavior
  bypassCSP: true
});

// Function to set up event handlers for a page
function setupPageHandlers(page) {
  page.on('pageerror', err => {
    console.error(`\n❌ JS error on ${page.url()}\n   ${err.message}`);
    errored = true;
  });

  page.on('console', msg => {
    // Log [Demo Framework] messages regardless of type
    if (msg.text().includes('[Demo Framework]')) {
      console.log(`\n🔧 Demo Framework: ${msg.text()}`);
    }
    
    // Also log warnings and errors for debugging
    if (msg.type() === 'warning') {
      console.log(`\n⚠️  Console warning: ${msg.text()}`);
    }
    
    if (msg.type() !== 'error') return;
    if (IGNORE_PATTERNS.some(rx => rx.test(msg.text()))) return;
    console.error(`\n❌ Console error on ${page.url()}\n   ${msg.text()}`);
    errored = true;
  });

  // Log failed requests
  page.on('requestfailed', request => {
    console.log(`\n❌ Request failed: ${request.url()}\n   Reason: ${request.failure()?.errorText}`);
  });

  // Log all requests to see what's being loaded
  page.on('request', request => {
    const resourceType = request.resourceType();
    if (resourceType === 'script' || resourceType === 'document') {
      console.log(`   → Loading ${resourceType}: ${request.url()}`);
    }
  });
}

/* ---------- crawl loop ---------- */
while (queue.length && !errored) {
  const { url, depth } = queue.shift();
  if (visited.has(url) || depth > MAX_DEPTH) continue;
  visited.add(url);

  console.log(`🔍  Visiting ${url}`);
  
  // Create a new page for each URL (complete isolation)
  const page = await context.newPage();
  setupPageHandlers(page);
  
  // Set up event listeners before navigation
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
  
  try {
    const response = await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 5_000 });
    console.log(`   ✓ Navigation complete (status: ${response?.status()})`);
    
    // Wait for page to be idle or 2 seconds, whichever comes first
    console.log('   ⏳ Waiting for page to stabilize...');
    try {
      await page.waitForLoadState('networkidle', { timeout: 2_000 });
      console.log('   ✓ Page is idle');
    } catch (timeoutErr) {
      console.log('   ⏱️  2 second timeout reached, continuing');
    }
    
    // Check if any errors occurred during the wait
    if (errored) {
      console.log('   ❌ Error detected during page stabilization');
      break;
    }
  } catch (navErr) {
    console.error(`\n❌ Navigation error on ${url}\n   ${navErr.message}`);
    errored = true;
    break;
  }

  // harvest same‑origin links
  const links = await page.$$eval('a[href]', as =>
    as.map(a => a.href).filter(Boolean)
  );

  for (const link of links) {
    try {
      const u = new URL(link);
      if (u.origin === origin && !visited.has(u.href)) {
        queue.push({ url: u.href.split('#')[0], depth: depth + 1 });
      }
    } catch { /* skip malformed URLs */ }
  }
  
  // Ensure page unloads properly before closing
  console.log('   ⏳ Triggering page unload...');
  
  // Set up unload error detection
  let unloadError = false;
  const unloadErrorHandler = (err) => {
    console.error(`\n❌ Error during page unload: ${err.message}`);
    errored = true;
    unloadError = true;
  };
  page.once('pageerror', unloadErrorHandler);
  
  try {
    // Navigate to about:blank to force unload events
    await page.goto('about:blank', { timeout: 1000 });
    // Small delay to catch any cleanup errors
    await new Promise(resolve => setTimeout(resolve, 100));
  } catch (err) {
    // Ignore navigation errors during unload
  }
  
  // Check if any errors occurred during unload
  if (unloadError) {
    console.log('   ❌ Error detected during page unload');
  }
  
  // Close the page to free resources and ensure complete isolation
  await page.close();
  console.log('   ✓ Page closed');
}

await browser.close();
if (errored) {
  console.error('\n🛑 Crawl aborted on first JavaScript error.');
  process.exit(1);
} else {
  console.log('\n✅ Crawl complete – no JavaScript errors found.');
}

