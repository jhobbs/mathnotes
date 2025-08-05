// Math content toggle functionality

// State to track whether we're showing only statements or all content
let showOnlyStatements = false;

function toggleMathContent(): void {
    showOnlyStatements = !showOnlyStatements;
    const toggleBtn = document.getElementById('math-content-toggle');
    
    if (showOnlyStatements) {
        // Hide proofs, examples, remarks, notes, intuition, exercises, solutions, and interactive demos
        document.querySelectorAll<HTMLElement>('.math-proof, .math-example, .math-remark, .math-note, .math-intuition, .math-exercise, .math-solution').forEach(el => {
            el.style.display = 'none';
        });
        
        // Hide interactive demo containers
        document.querySelectorAll<HTMLElement>('.demo-component').forEach(el => {
            el.style.display = 'none';
        });
        
        // Update button text
        if (toggleBtn) {
            toggleBtn.textContent = '📖 Show All Content';
            toggleBtn.setAttribute('title', 'Show proofs and all details');
        }
    } else {
        // Show all content
        document.querySelectorAll<HTMLElement>('.math-block').forEach(el => {
            el.style.display = '';
        });
        
        // Show interactive demo containers
        document.querySelectorAll<HTMLElement>('.demo-container, .demo-component').forEach(el => {
            el.style.display = '';
        });
        
        // Update button text
        if (toggleBtn) {
            toggleBtn.textContent = '📋 Show Only Statements';
            toggleBtn.setAttribute('title', 'Hide proofs and show only definitions, theorems, lemmas, etc.');
        }
    }
}

export function initMathBlockToggle(): void {
    // Initialize toggle button if there are math blocks on the page
    const mathBlocks = document.querySelectorAll('.math-block');
    if (mathBlocks.length > 0) {
        // Check if there are any statements worth toggling
        const statements = document.querySelectorAll('.math-definition, .math-theorem, .math-lemma, .math-proposition, .math-corollary');
        const details = document.querySelectorAll('.math-proof, .math-example, .math-remark, .math-note, .math-intuition, .math-exercise, .math-solution');
        
        // Only show toggle if there are both statements and details
        if (statements.length > 0 && details.length > 0) {
            // Create toggle button
            const toggleContainer = document.createElement('div');
            toggleContainer.className = 'math-content-toggle-container';
            
            const toggleBtn = document.createElement('button');
            toggleBtn.id = 'math-content-toggle';
            toggleBtn.className = 'math-content-toggle';
            toggleBtn.textContent = '📋 Show Only Statements';
            toggleBtn.setAttribute('title', 'Hide proofs and show only definitions, theorems, lemmas, etc.');
            toggleBtn.addEventListener('click', toggleMathContent);
            
            toggleContainer.appendChild(toggleBtn);
            
            // Insert after the header
            const header = document.querySelector('header');
            if (header && header.nextSibling) {
                header.parentNode!.insertBefore(toggleContainer, header.nextSibling);
            }
        }
    }
}