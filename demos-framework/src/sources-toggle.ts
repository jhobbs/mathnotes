export function initSourcesToggle(): void {
  document.addEventListener('click', (e: MouseEvent) => {
    const target = e.target as HTMLElement;
    const toggle = target.closest('[data-sources="toggle"]') as HTMLElement | null;

    if (!toggle) return;

    const section = toggle.closest('.sources-section');
    const content = section?.querySelector('.sources-content');

    if (content) {
      toggle.classList.toggle('active');
      content.classList.toggle('show');
    }
  });
}
