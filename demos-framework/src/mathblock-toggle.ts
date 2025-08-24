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

function initLabelCopyToClipboard(): void {
    const REFERENCE_MARK = '※';
    const COPY_SUCCESS = '✓';
    const COPY_FAILURE = '✗';
    const FEEDBACK_DURATION = 1500;
    
    // Add click handlers to all block reference labels
    const labels = document.querySelectorAll<HTMLElement>('.block-label-ref');
    labels.forEach(label => {
        // Store the original text as a data attribute
        const originalText = label.textContent || '';
        label.dataset.originalText = originalText;
        
        // Replace the text with the reference mark and add title for hover
        label.textContent = REFERENCE_MARK;
        label.title = originalText;
        
        // Add click handler
        label.addEventListener('click', async (e) => {
            e.preventDefault();
            e.stopPropagation();
            
            // Don't allow clicks while showing feedback
            if (label.classList.contains('copied') || label.classList.contains('failed')) {
                return;
            }
            
            try {
                await navigator.clipboard.writeText(originalText);
                
                // Visual feedback via CSS class
                label.textContent = COPY_SUCCESS;
                label.classList.add('copied');
                
                setTimeout(() => {
                    label.textContent = REFERENCE_MARK;
                    label.classList.remove('copied');
                }, FEEDBACK_DURATION);
            } catch (err) {
                console.error('Failed to copy to clipboard:', err);
                
                // Fallback visual feedback via CSS class
                label.textContent = COPY_FAILURE;
                label.classList.add('failed');
                
                setTimeout(() => {
                    label.textContent = REFERENCE_MARK;
                    label.classList.remove('failed');
                }, FEEDBACK_DURATION);
            }
        });
    });
}

export function initMathBlockToggle(): void {
    // Initialize label copy functionality
    initLabelCopyToClipboard();
    
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