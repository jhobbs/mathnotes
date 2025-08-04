/**
 * Development auto-reload functionality
 * Polls the server to detect restarts and automatically reloads the page
 */

class DevAutoReload {
  private serverStartTime: number | null = null;
  private pollInterval: number = 500; // Poll every 500ms
  private intervalId: number | null = null;

  constructor() {
    // Only run in development mode
    if (this.isDevelopment()) {
      this.init();
    }
  }

  private isDevelopment(): boolean {
    // Check if we're in development mode by looking at the hostname
    const hostname = window.location.hostname;
    return hostname === 'localhost' || hostname === '127.0.0.1' || hostname.includes('dev');
  }

  private async init(): Promise<void> {
    // Get initial server start time
    try {
      const response = await fetch('/dev-status');
      if (response.ok) {
        const data = await response.json();
        this.serverStartTime = data.startTime;
        
        // Start polling
        this.startPolling();
      }
    } catch (error) {
      // Dev endpoint not available, don't start polling
      console.debug('Dev auto-reload not available');
    }
  }

  private startPolling(): void {
    this.intervalId = window.setInterval(async () => {
      try {
        const response = await fetch('/dev-status');
        if (response.ok) {
          const data = await response.json();
          
          // If server start time changed, reload the page
          if (this.serverStartTime !== null && data.startTime !== this.serverStartTime) {
            console.log('Server restarted, reloading page...');
            this.stopPolling();
            window.location.reload();
          }
        }
      } catch (error) {
        // Server might be restarting, keep polling
        console.debug('Server unavailable, might be restarting...');
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