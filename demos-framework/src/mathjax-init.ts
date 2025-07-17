// MathJax initialization module
declare global {
  interface Window {
    MathJax: any;
  }
}

export async function initMathJax() {
  // Check if we're in development mode (Vite dev server)
  const isDev = window.location.port === '5173' || 
                window.location.hostname === 'localhost' && window.location.port === '5000';
  
  // Configure MathJax before loading
  window.MathJax = {
    tex: {
      inlineMath: [['$', '$'], ['\\(', '\\)']],
      displayMath: [['$$', '$$'], ['\\[', '\\]']],
      processEscapes: true,
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
    // The MathJax npm package requires the .js extension
    await import('mathjax/es5/tex-mml-chtml.js');
    
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
