// MathJax initialization module
declare global {
  interface Window {
    MathJax: any;
  }
}

export async function initMathJax() {
  // Configure MathJax before loading
  window.MathJax = {
    tex: {
      inlineMath: [['$', '$'], ['\\(', '\\)']],
      displayMath: [['$$', '$$'], ['\\[', '\\]']],
      processEscapes: true,
      packages: {'[+]': ['enclose']},
      macros: {
        vec: ['\\mathbf{#1}', 1]
      }
    },
    startup: {
      ready: () => {
        // MathJax is ready, but we'll control when to typeset
        window.MathJax.startup.defaultReady();
      }
    },
    chtml: {
      // Use local fonts from static dist directory (same in dev and prod)
      fontURL: '/static/dist/fonts/mathjax/woff-v2'
    }
  };

  // Load MathJax
  try {
    // Use the full build which includes all extensions
    await import('mathjax/es5/tex-chtml-full.js');
    
    // Wait a bit for MathJax to fully initialize
    await new Promise(resolve => setTimeout(resolve, 100));
  } catch (error) {
    console.error('Failed to load MathJax:', error);
    throw error;
  }
  
  // Return the MathJax object for use
  return window.MathJax;
}

// Function to typeset content after page load or content updates
export function typesetMath(element?: HTMLElement) {
  if (window.MathJax && window.MathJax.typesetPromise) {
    const elements = element ? [element] : [];
    window.MathJax.typesetPromise(elements).catch((err: any) => {
      console.error('MathJax typesetting failed:', err);
    });
  }
}
