// Separate entry point for MathJax initialization
// This ensures MathJax is loaded on all pages, not just those with demos

import { initMathJax, typesetMath } from './mathjax-init';

// Initialize MathJax when the script loads
initMathJax().then(() => {
  // Wait for DOM to be ready before typesetting
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      typesetMath();
    });
  } else {
    // DOM is already loaded, typeset immediately
    typesetMath();
  }
}).catch(err => {
  console.error('Failed to initialize MathJax:', err);
});

// Export for use by other modules if needed
export { typesetMath };