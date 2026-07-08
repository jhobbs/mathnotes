// MathJax initialization module
import mathnotesSty from '../../latex/mathnotes.sty';

declare global {
  interface Window {
    MathJax: any;
  }
}

type MathJaxMacro = string | [string, number];

// Math macros live in latex/mathnotes.sty (single source of truth, shared
// with pdflatex). Parse the marked section: simple one-line
// \newcommand/\renewcommand{\name}[n]{expansion} definitions only.
export function parseStyMacros(sty: string): Record<string, MathJaxMacro> {
  const macros: Record<string, MathJaxMacro> = {};
  const begin = sty.indexOf('% BEGIN MATH MACROS');
  const end = sty.indexOf('% END MATH MACROS');
  if (begin === -1 || end === -1 || end <= begin) {
    throw new Error('mathnotes.sty: MATH MACROS markers not found');
  }
  const section = sty.slice(begin, end);
  const definition = /\\(?:re)?newcommand\{\\([A-Za-z]+)\}(?:\[(\d)\])?\{/g;
  let match;
  while ((match = definition.exec(section)) !== null) {
    // brace-count to the matching close of the expansion body
    let depth = 1;
    let i = definition.lastIndex;
    while (i < section.length && depth > 0) {
      if (section[i] === '\\') i += 1; // skip escaped char
      else if (section[i] === '{') depth += 1;
      else if (section[i] === '}') depth -= 1;
      i += 1;
    }
    const body = section.slice(definition.lastIndex, i - 1);
    const [name, nargs] = [match[1], match[2]];
    macros[name] = nargs ? [body, parseInt(nargs, 10)] : body;
    definition.lastIndex = i;
  }
  if (Object.keys(macros).length === 0) {
    throw new Error('mathnotes.sty: no macros parsed from MATH MACROS section');
  }
  return macros;
}

export async function initMathJax() {
  // Configure MathJax before loading
  window.MathJax = {
    tex: {
      inlineMath: [['$', '$'], ['\\(', '\\)']],
      displayMath: [['$$', '$$'], ['\\[', '\\]']],
      processEscapes: true,
      packages: {'[+]': ['enclose']},
      macros: parseStyMacros(mathnotesSty)
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
