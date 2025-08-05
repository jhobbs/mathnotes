export function initSectionToggle(): void {
  function toggleSection(header: HTMLElement): void {
    const content = header.nextElementSibling as HTMLElement | null;
    if (!content) return;
    
    const isOpen = content.classList.contains('show');
    
    document.querySelectorAll('.section-content').forEach(el => {
      el.classList.remove('show');
    });
    document.querySelectorAll('.section-header').forEach(el => {
      el.classList.remove('active');
    });
    
    if (!isOpen) {
      content.classList.add('show');
      header.classList.add('active');
    }
  }

  document.addEventListener('click', (e: MouseEvent) => {
    const target = e.target as HTMLElement;
    const header = target.closest('[data-section="toggle"]') as HTMLElement | null;
    
    if (header) {
      toggleSection(header);
    }
  });
}