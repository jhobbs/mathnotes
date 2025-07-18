import p5 from 'p5';

/**
 * Adds dark mode CSS styles for demo controls
 */
export function addDemoStyles(container: HTMLElement, prefix: string = 'demo'): HTMLStyleElement {
  const style = document.createElement('style');
  style.textContent = `
    .${prefix}-button {
      padding: 5px 10px;
      margin: 0 5px;
      cursor: pointer;
      background-color: #f0f0f0;
      color: #333;
      border: 1px solid #ccc;
      border-radius: 3px;
      transition: background-color 0.2s;
    }
    
    .${prefix}-button:hover {
      background-color: #e0e0e0;
    }
    
    .${prefix}-info {
      color: #333;
    }
    
    .${prefix}-label {
      color: #333;
      margin-bottom: 5px;
    }
    
    @media (prefers-color-scheme: dark) {
      .${prefix}-button {
        background-color: #444;
        color: #e0e0e0;
        border-color: #666;
      }
      
      .${prefix}-button:hover {
        background-color: #555;
      }
      
      .${prefix}-info {
        color: #e0e0e0;
      }
      
      .${prefix}-label {
        color: #e0e0e0;
      }
    }
    
    /* Slider styles */
    input[type="range"].${prefix}-slider {
      -webkit-appearance: none !important;
      -moz-appearance: none !important;
      appearance: none !important;
      height: 8px !important;
      background: #d0d0d0 !important;
      border-radius: 4px !important;
      outline: none !important;
      cursor: pointer !important;
    }
    
    /* Webkit browsers (Chrome, Safari, Edge) */
    input[type="range"].${prefix}-slider::-webkit-slider-thumb {
      -webkit-appearance: none;
      appearance: none;
      width: 16px;
      height: 16px;
      background: #4a7ba7;
      border-radius: 50%;
      cursor: pointer;
      box-shadow: 0 1px 3px rgba(0,0,0,0.3);
    }
    
    /* Firefox */
    input[type="range"].${prefix}-slider::-moz-range-thumb {
      width: 16px;
      height: 16px;
      background: #4a7ba7;
      border-radius: 50%;
      cursor: pointer;
      border: none;
      box-shadow: 0 1px 3px rgba(0,0,0,0.3);
    }
    
    input[type="range"].${prefix}-slider::-moz-range-track {
      background: #d0d0d0;
      height: 6px;
      border-radius: 3px;
    }
    
    @media (prefers-color-scheme: dark) {
      input[type="range"].${prefix}-slider {
        background: #5a5a5a !important;
      }
      
      input[type="range"].${prefix}-slider::-webkit-slider-thumb {
        background: #6496ff;
        box-shadow: 0 1px 3px rgba(0,0,0,0.5);
      }
      
      input[type="range"].${prefix}-slider::-moz-range-thumb {
        background: #6496ff;
        box-shadow: 0 1px 3px rgba(0,0,0,0.5);
      }
      
      input[type="range"].${prefix}-slider::-moz-range-track {
        background: #5a5a5a;
      }
    }
    
    /* Radio button styles */
    .${prefix}-radio {
      display: flex;
      gap: 20px;
      justify-content: center;
      align-items: center;
    }
    
    .${prefix}-radio label {
      display: flex;
      align-items: center;
      gap: 5px;
      cursor: pointer;
      color: #333;
      font-size: 14px;
    }
    
    .${prefix}-radio input[type="radio"] {
      cursor: pointer;
      margin: 0;
    }
    
    @media (prefers-color-scheme: dark) {
      .${prefix}-radio label {
        color: #e0e0e0;
      }
    }
    
    /* Select dropdown styles */
    .${prefix}-select {
      padding: 5px 10px;
      margin: 0 5px;
      cursor: pointer;
      background-color: #f0f0f0;
      color: #333;
      border: 1px solid #ccc;
      border-radius: 3px;
      font-size: 14px;
    }
    
    @media (prefers-color-scheme: dark) {
      .${prefix}-select {
        background-color: #444;
        color: #e0e0e0;
        border-color: #666;
      }
      
      .${prefix}-select option {
        background-color: #444;
        color: #e0e0e0;
      }
    }
  `;
  container.appendChild(style);
  return style;
}

/**
 * Creates a standardized control panel
 */
export function createControlPanel(
  parent: HTMLElement,
  options: { id?: string; className?: string } = {}
): HTMLElement {
  const panel = document.createElement('div');
  if (options.id) panel.id = options.id;
  panel.className = options.className || 'demo-controls';
  panel.style.marginTop = '20px';
  panel.style.textAlign = 'center';
  parent.appendChild(panel);
  return panel;
}

/**
 * Creates a standardized button
 */
export function createButton(
  text: string,
  parent: HTMLElement,
  onClick: () => void,
  className: string = 'demo-button'
): HTMLButtonElement {
  const button = document.createElement('button');
  button.textContent = text;
  button.className = className;
  button.addEventListener('click', onClick);
  parent.appendChild(button);
  return button;
}

/**
 * Creates a slider with label
 */
export function createSlider(
  p: p5,
  label: string,
  min: number,
  max: number,
  value: number,
  step: number,
  parent: HTMLElement,
  onChange?: () => void,
  className: string = 'demo'
): p5.Element {
  const rowDiv = document.createElement('div');
  rowDiv.style.marginBottom = '10px';
  rowDiv.style.display = 'flex';
  rowDiv.style.flexDirection = 'column';
  rowDiv.style.alignItems = 'center';
  rowDiv.style.gap = '5px';
  parent.appendChild(rowDiv);
  
  const labelDiv = document.createElement('div');
  labelDiv.textContent = label;
  labelDiv.className = `${className}-label`;
  labelDiv.style.textAlign = 'center';
  labelDiv.style.fontSize = '14px';
  rowDiv.appendChild(labelDiv);
  
  const slider = p.createSlider(min, max, value, step);
  slider.parent(rowDiv);
  slider.class(`${className}-slider`);
  slider.style('width: 120px');
  
  if (onChange) {
    (slider as any).input(onChange);
  }
  
  return slider;
}