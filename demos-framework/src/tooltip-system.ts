declare global {
  interface Window {
    MathJax: any;
  }
}

interface TooltipData {
  label: string;
  type: string;
  title: string;
  content: string;
  url?: string;
}

interface TooltipCache {
  [key: string]: TooltipData;
}

class TooltipSystem {
  private tooltipElement: HTMLDivElement | null = null;
  private currentTarget: HTMLElement | null = null;
  private cache: TooltipCache = {};
  private hideTimeout: number | null = null;
  private showTimeout: number | null = null;
  private mouseOverTooltip: boolean = false;
  private touchTimeout: number | null = null;
  private touchStartTime: number = 0;
  private isTouchDevice: boolean = false;

  constructor() {
    this.init();
  }

  private init(): void {
    this.createTooltipElement();
    this.loadPreloadedData();
    this.attachEventListeners();
    this.isTouchDevice = 'ontouchstart' in window;
  }

  private loadPreloadedData(): void {
    const tooltipDataElement = document.getElementById('tooltip-data');
    if (tooltipDataElement && tooltipDataElement.textContent) {
      try {
        const data = JSON.parse(tooltipDataElement.textContent);
        if (Array.isArray(data)) {
          data.forEach(item => {
            this.cache[item.label] = item;
          });
        }
      } catch (e) {
        console.error('Failed to parse tooltip data:', e);
      }
    }
  }

  private createTooltipElement(): void {
    this.tooltipElement = document.createElement('div');
    this.tooltipElement.className = 'math-tooltip';
    this.tooltipElement.setAttribute('role', 'tooltip');
    this.tooltipElement.style.display = 'none';
    
    this.tooltipElement.addEventListener('mouseenter', () => {
      this.mouseOverTooltip = true;
      this.cancelHide();
    });
    
    this.tooltipElement.addEventListener('mouseleave', () => {
      this.mouseOverTooltip = false;
      this.scheduleHide();
    });
    
    this.tooltipElement.addEventListener('touchstart', (e) => {
      e.stopPropagation();
    });
    
    document.body.appendChild(this.tooltipElement);
  }

  private attachEventListeners(): void {
    // Mouse events
    document.addEventListener('mouseover', (e) => {
      if (this.isTouchDevice) return;
      
      const target = e.target as HTMLElement;
      const link = target.closest('a.block-reference') as HTMLAnchorElement;
      
      if (link && link.dataset.refLabel) {
        this.handleMouseEnter(link);
      }
    });

    document.addEventListener('mouseout', (e) => {
      if (this.isTouchDevice) return;
      
      const target = e.target as HTMLElement;
      const link = target.closest('a.block-reference') as HTMLAnchorElement;
      
      if (link && link === this.currentTarget) {
        this.handleMouseLeave();
      }
    });

    // Touch events for mobile
    document.addEventListener('touchstart', (e) => {
      const target = e.target as HTMLElement;
      const link = target.closest('a.block-reference') as HTMLAnchorElement;
      
      if (link && link.dataset.refLabel) {
        this.handleTouchStart(e, link);
      }
    });

    document.addEventListener('touchend', (e) => {
      const target = e.target as HTMLElement;
      const link = target.closest('a.block-reference') as HTMLAnchorElement;
      
      if (link && link === this.currentTarget) {
        this.handleTouchEnd(e);
      }
    });

    document.addEventListener('touchmove', () => {
      if (this.touchTimeout) {
        clearTimeout(this.touchTimeout);
        this.touchTimeout = null;
      }
    });

    // Close tooltip on any tap outside
    document.addEventListener('touchstart', (e) => {
      const target = e.target as HTMLElement;
      if (!target.closest('.math-tooltip') && !target.closest('a.block-reference')) {
        this.hideTooltip();
      }
    });

    // Scroll and resize
    window.addEventListener('scroll', () => {
      if (this.tooltipElement && this.tooltipElement.style.display !== 'none') {
        this.updatePosition();
      }
    });

    window.addEventListener('resize', () => {
      if (this.tooltipElement && this.tooltipElement.style.display !== 'none') {
        this.updatePosition();
      }
    });
  }

  private handleTouchStart(e: TouchEvent, link: HTMLAnchorElement): void {
    this.touchStartTime = Date.now();
    this.currentTarget = link;
    
    if (this.touchTimeout) {
      clearTimeout(this.touchTimeout);
    }
    
    this.touchTimeout = window.setTimeout(() => {
      e.preventDefault();
      this.showTooltip(link);
    }, 500);
  }

  private handleTouchEnd(e: TouchEvent): void {
    if (this.touchTimeout) {
      clearTimeout(this.touchTimeout);
      this.touchTimeout = null;
    }
    
    const touchDuration = Date.now() - this.touchStartTime;
    
    if (touchDuration < 500 && this.tooltipElement?.style.display === 'none') {
      // Short tap - allow default link behavior
      return;
    } else if (this.tooltipElement?.style.display !== 'none') {
      // Tooltip is shown - prevent navigation
      e.preventDefault();
    }
  }

  private handleMouseEnter(link: HTMLAnchorElement): void {
    this.currentTarget = link;
    this.cancelHide();
    
    if (this.showTimeout) {
      clearTimeout(this.showTimeout);
    }
    
    this.showTimeout = window.setTimeout(() => {
      this.showTooltip(link);
    }, 300);
  }

  private handleMouseLeave(): void {
    if (this.showTimeout) {
      clearTimeout(this.showTimeout);
      this.showTimeout = null;
    }
    
    if (!this.mouseOverTooltip) {
      this.scheduleHide();
    }
  }

  private scheduleHide(): void {
    if (this.hideTimeout) {
      clearTimeout(this.hideTimeout);
    }
    
    this.hideTimeout = window.setTimeout(() => {
      this.hideTooltip();
    }, 300);
  }

  private cancelHide(): void {
    if (this.hideTimeout) {
      clearTimeout(this.hideTimeout);
      this.hideTimeout = null;
    }
  }

  private showTooltip(link: HTMLAnchorElement): void {
    if (!this.tooltipElement) return;
    
    const label = link.dataset.refLabel;
    
    if (!label) return;

    const data = this.cache[label];
    
    if (data) {
      this.displayTooltip(data);
    } else {
      // Fallback if data wasn't preloaded
      console.warn(`Tooltip data for label "${label}" not found in preloaded data`);
      this.hideTooltip();
    }
  }

  private displayTooltip(data: TooltipData): void {
    if (!this.tooltipElement) return;
    
    const typeClass = `math-${data.type}`;
    const typeDisplay = data.type.charAt(0).toUpperCase() + data.type.slice(1);
    
    let content = `
      <div class="math-tooltip-content ${typeClass}">
        <div class="math-tooltip-header">
          <span class="math-tooltip-type">${typeDisplay}`;
    
    if (data.title) {
      content += ` (${data.title})`;
    }
    
    content += `:</span>
        </div>
        <div class="math-tooltip-body">
          ${data.content}
        </div>
      </div>`;
    
    this.tooltipElement.innerHTML = content;
    this.tooltipElement.style.display = 'block';
    this.tooltipElement.classList.add('visible');
    
    if (window.MathJax && window.MathJax.typesetPromise) {
      window.MathJax.typesetPromise([this.tooltipElement]).catch((e: any) => {
        console.error('MathJax typesetting failed:', e);
      });
    }
    
    this.updatePosition();
  }

  private updatePosition(): void {
    if (!this.tooltipElement || !this.currentTarget) return;
    
    const linkRect = this.currentTarget.getBoundingClientRect();
    const tooltipRect = this.tooltipElement.getBoundingClientRect();
    
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    const scrollX = window.scrollX;
    const scrollY = window.scrollY;
    
    let left = linkRect.left + scrollX + (linkRect.width / 2) - (tooltipRect.width / 2);
    let top = linkRect.bottom + scrollY + 8;
    
    if (left < 10) {
      left = 10;
    } else if (left + tooltipRect.width > viewportWidth - 10) {
      left = viewportWidth - tooltipRect.width - 10;
    }
    
    if (top + tooltipRect.height > scrollY + viewportHeight - 10) {
      top = linkRect.top + scrollY - tooltipRect.height - 8;
    }
    
    this.tooltipElement.style.left = `${left}px`;
    this.tooltipElement.style.top = `${top}px`;
  }

  private hideTooltip(): void {
    if (!this.tooltipElement) return;
    
    this.tooltipElement.classList.remove('visible');
    this.tooltipElement.style.display = 'none';
    this.currentTarget = null;
    this.mouseOverTooltip = false;
  }
}

let tooltipSystemInstance: TooltipSystem | null = null;

export function initTooltipSystem(): void {
  if (!tooltipSystemInstance && typeof document !== 'undefined') {
    tooltipSystemInstance = new TooltipSystem();
  }
}

if (typeof document !== 'undefined' && document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initTooltipSystem);
} else {
  initTooltipSystem();
}