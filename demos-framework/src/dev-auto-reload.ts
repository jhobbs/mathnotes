/**
 * Development auto-reload functionality
 * Polls for content changes and automatically reloads the page
 */

class DevAutoReload {
  private lastTimestamp: string | null = null;
  private pollInterval: number = 1000; // Poll every second
  private intervalId: number | null = null;

  constructor() {
    this.init();
  }

  private async init(): Promise<void> {
    // Check if timestamp file exists - if it does, we're in dev mode
    try {
      const response = await fetch('/rebuild-timestamp.txt');
      if (response.ok) {
        this.lastTimestamp = (await response.text()).trim();
        console.log('Dev auto-reload enabled');
        
        // Start polling
        this.startPolling();
      }
    } catch (error) {
      // Timestamp file not available, not in dev mode
      console.debug('Dev auto-reload not available');
    }
  }

  private startPolling(): void {
    this.intervalId = window.setInterval(async () => {
      try {
        const response = await fetch('/rebuild-timestamp.txt');
        if (response.ok) {
          const timestamp = (await response.text()).trim();

          // If timestamp changed, reload the page
          if (this.lastTimestamp !== null && timestamp !== this.lastTimestamp) {
            console.log(`Content changed (${this.lastTimestamp} -> ${timestamp}), reloading...`);
            this.stopPolling();
            window.location.reload();
          }
        } else {
          console.debug(`Timestamp fetch returned ${response.status}, waiting for rebuild...`);
        }
      } catch (error) {
        // Might be rebuilding, keep polling
        console.debug('Timestamp fetch failed, might be rebuilding...');
      }
    }, this.pollInterval);
  }

  private stopPolling(): void {
    if (this.intervalId !== null) {
      window.clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }
}

// Initialize auto-reload when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => new DevAutoReload());
} else {
  new DevAutoReload();
}

export default DevAutoReload;