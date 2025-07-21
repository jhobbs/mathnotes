# Mathnotes Crawler v2

A modular, TypeScript-based web crawler with plugin support for the mathnotes project.

## Features

- **TypeScript**: Full type safety and better maintainability
- **Plugin System**: Extensible architecture for custom functionality
- **Concurrent Crawling**: Configurable parallelism for faster crawls
- **Smart Caching**: Reduces redundant requests for static assets
- **Comprehensive Error Tracking**: JS errors, console errors, network failures
- **Screenshot Support**: Built-in plugin for capturing page/demo screenshots

## Architecture

### Core Classes

- `Crawler`: Main orchestrator, manages the crawl process
- `PageProcessor`: Handles individual page visits and error collection
- `QueueManager`: Manages the URL queue for crawling
- `CacheManager`: Handles resource caching for performance
- `ErrorReporter`: Deduplicates and reports errors
- `CrawlerPlugin`: Base class for extending functionality

### Plugin System

Plugins can hook into various stages of the crawl:
- `beforeCrawl`: Initialize before crawling starts
- `afterCrawl`: Process results after crawling completes
- `beforeVisit`: Prepare before visiting a page
- `afterVisit`: Process page after visit
- `onError`: Handle errors as they occur
- `onLink`: Filter/process discovered links

## Usage

### Basic Command Line

```bash
# Using tsx directly
tsx crawler/crawler.ts http://localhost:5000

# With options
tsx crawler/crawler.ts http://localhost:5000 \
  --max-depth 3 \
  --verbose true \
  --concurrency 10
```

### Docker Integration

```bash
# Using existing Playwright Docker setup
docker-compose -f docker-compose.dev.yml run --rm crawler npm run crawl:new

# With custom URL
docker-compose -f docker-compose.dev.yml run --rm crawler \
  tsx crawler/crawler.ts http://web-dev:5000 --single-page true
```

### Programmatic Usage

```typescript
import { Crawler, ScreenshotPlugin } from './crawler.js';

const crawler = new Crawler({
  maxDepth: 2,
  headless: true,
  verbose: true,
  concurrency: 5,
  // ... other options
});

// Add plugins
crawler.registerPlugin(new ScreenshotPlugin());

// Run crawl
const results = await crawler.crawl('http://localhost:5000');
```

## Creating Custom Plugins

```typescript
import { CrawlerPlugin, Page, CrawlResult } from './crawler.js';

class MyPlugin extends CrawlerPlugin {
  name = 'MyPlugin';
  
  async afterVisit(page: Page, url: string, depth: number, result: CrawlResult) {
    // Your custom logic here
    if (url.includes('/special-page')) {
      const title = await page.title();
      console.log(`Special page title: ${title}`);
    }
  }
}
```

## Options

| Option | Default | Description |
|--------|---------|-------------|
| `--max-depth` | Infinity | Maximum crawl depth |
| `--headless` | true | Run browser in headless mode |
| `--verbose` | false | Enable verbose logging |
| `--log-skipped` | false | Log skipped URLs |
| `--single-page` | false | Only crawl the start URL |
| `--concurrency` | 10 | Number of parallel pages |
| `--show-probe` | true | Show [probe] console messages |

## Migration from crawler.js

The new TypeScript crawler maintains CLI compatibility with the original:
- All command-line options work the same way
- Output format is similar for easy integration
- Exit codes match (0 for success, 1 for errors found)

Key improvements:
- Type safety catches bugs at compile time
- Plugin system for extending functionality
- Better error categorization and reporting
- Cleaner, more maintainable code structure