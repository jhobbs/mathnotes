/**
 * Sidebar toggle functionality for mobile hamburger menu.
 * Handles opening/closing the page sidebar on mobile devices.
 */

export function initSidebarToggle(): void {
  const toggle = document.getElementById('sidebar-toggle');
  const sidebar = document.getElementById('page-sidebar');
  const overlay = document.getElementById('sidebar-overlay');

  if (!toggle || !sidebar) {
    return;
  }

  function openSidebar(): void {
    document.body.classList.add('sidebar-open');
    toggle?.setAttribute('aria-expanded', 'true');
  }

  function closeSidebar(): void {
    document.body.classList.remove('sidebar-open');
    toggle?.setAttribute('aria-expanded', 'false');
  }

  function toggleSidebar(): void {
    if (document.body.classList.contains('sidebar-open')) {
      closeSidebar();
    } else {
      openSidebar();
    }
  }

  // Toggle button click
  toggle.addEventListener('click', (e: MouseEvent) => {
    e.stopPropagation();
    toggleSidebar();
  });

  // Close when clicking overlay
  overlay?.addEventListener('click', () => {
    closeSidebar();
  });

  // Keyboard navigation
  document.addEventListener('keydown', (e: KeyboardEvent) => {
    // Don't intercept if user is typing in an input
    const target = e.target as HTMLElement;
    if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable) {
      return;
    }

    if (e.key === 'Escape' && document.body.classList.contains('sidebar-open')) {
      closeSidebar();
    } else if (e.key === 'ArrowLeft') {
      const prevLink = document.querySelector('.nav-prev:not(.disabled)') as HTMLAnchorElement;
      if (prevLink?.href) {
        window.location.href = prevLink.href;
      }
    } else if (e.key === 'ArrowRight') {
      const nextLink = document.querySelector('.nav-next:not(.disabled)') as HTMLAnchorElement;
      if (nextLink?.href) {
        window.location.href = nextLink.href;
      }
    }
  });

  // Close sidebar when clicking a link inside it (for mobile navigation)
  sidebar.addEventListener('click', (e: MouseEvent) => {
    const target = e.target as HTMLElement;
    if (target.tagName === 'A') {
      closeSidebar();
    }
  });

  // Hover-to-open/close functionality (desktop only)
  // Skip on touch devices
  if (!('ontouchstart' in window)) {
    const HOVER_DELAY = 300; // ms
    let openTimer: number | null = null;
    let closeTimer: number | null = null;

    // Create invisible hover zone on left edge (covers left margin area)
    const hoverZone = document.createElement('div');
    hoverZone.id = 'sidebar-hover-zone';
    hoverZone.style.cssText = `
      position: fixed;
      left: 0;
      top: 0;
      bottom: 0;
      width: 0;
      z-index: 999;
      pointer-events: none;
    `;
    document.body.appendChild(hoverZone);

    // Update hover zone width to match the left edge of the content area
    function updateHoverZoneWidth(): void {
      const content = document.querySelector('.page-content');
      const marginWidth = content?.getBoundingClientRect().left ?? 0;
      hoverZone.style.width = `${marginWidth}px`;
    }
    updateHoverZoneWidth();
    window.addEventListener('resize', updateHoverZoneWidth);

    // Enable/disable hover zone based on sidebar state
    function updateHoverZone(): void {
      if (document.body.classList.contains('sidebar-open')) {
        hoverZone.style.pointerEvents = 'none';
      } else {
        hoverZone.style.pointerEvents = 'auto';
      }
    }

    // Watch for sidebar state changes
    const observer = new MutationObserver(updateHoverZone);
    observer.observe(document.body, { attributes: true, attributeFilter: ['class'] });
    updateHoverZone();

    // Hover zone - open sidebar after delay
    hoverZone.addEventListener('mouseenter', () => {
      if (closeTimer) { clearTimeout(closeTimer); closeTimer = null; }
      openTimer = window.setTimeout(() => {
        openSidebar();
      }, HOVER_DELAY);
    });

    hoverZone.addEventListener('mouseleave', () => {
      if (openTimer) { clearTimeout(openTimer); openTimer = null; }
    });

    // Sidebar - cancel close timer when hovering over it
    sidebar.addEventListener('mouseenter', () => {
      if (closeTimer) { clearTimeout(closeTimer); closeTimer = null; }
    });

    // Main content - close sidebar after delay when hovering over it
    const pageContent = document.querySelector('.page-content');
    pageContent?.addEventListener('mouseenter', () => {
      if (!document.body.classList.contains('sidebar-open')) return;
      if (openTimer) { clearTimeout(openTimer); openTimer = null; }
      closeTimer = window.setTimeout(() => {
        closeSidebar();
      }, HOVER_DELAY);
    });

    pageContent?.addEventListener('mouseleave', () => {
      if (closeTimer) { clearTimeout(closeTimer); closeTimer = null; }
    });
  }

  // Folder expand/collapse toggle
  sidebar.querySelectorAll('.folder-toggle').forEach(toggle => {
    toggle.addEventListener('click', () => {
      const li = toggle.closest('.nav-folder');
      const children = li?.querySelector('.folder-children');
      const icon = toggle.querySelector('.folder-icon');

      if (children) {
        children.classList.toggle('collapsed');
        if (icon) {
          icon.textContent = children.classList.contains('collapsed') ? '▶' : '▼';
        }
      }
    });
  });
}
