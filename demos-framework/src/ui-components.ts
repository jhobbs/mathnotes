import p5 from 'p5';

// Extend p5.Element to include input method for sliders
interface P5SliderElement extends p5.Element {
  input(callback: () => void): void;
}

// Type definitions for new control components
export interface RadioOption<T> {
  value: T;
  label: string;
}

export interface SelectOption<T> {
  value: T;
  label: string;
}

export interface TextInputOptions {
  placeholder?: string;
  type?: 'text' | 'number';
  pattern?: string;
}

export interface NumberDisplayOptions {
  decimals?: number;
  unit?: string;
}

export interface InfoDisplay {
  element: HTMLElement;
  update: (value: string) => void;
}

export interface NumberDisplay {
  element: HTMLElement;
  update: (value: number) => void;
}

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
    
    /* Checkbox styles */
    .${prefix}-checkbox-container {
      display: flex;
      align-items: center;
      gap: 8px;
      cursor: pointer;
    }
    
    .${prefix}-checkbox-container input[type="checkbox"] {
      cursor: pointer;
      margin: 0;
    }
    
    .${prefix}-checkbox-label {
      color: #333;
      font-size: 14px;
      user-select: none;
    }
    
    @media (prefers-color-scheme: dark) {
      .${prefix}-checkbox-label {
        color: #e0e0e0;
      }
    }
    
    /* Text input styles */
    .${prefix}-text-input {
      padding: 5px 10px;
      margin: 0 5px;
      background-color: #f0f0f0;
      color: #333;
      border: 1px solid #ccc;
      border-radius: 3px;
      font-size: 14px;
      outline: none;
    }
    
    .${prefix}-text-input:focus {
      border-color: #4a7ba7;
      box-shadow: 0 0 0 2px rgba(74, 123, 167, 0.2);
    }
    
    @media (prefers-color-scheme: dark) {
      .${prefix}-text-input {
        background-color: #444;
        color: #e0e0e0;
        border-color: #666;
      }
      
      .${prefix}-text-input:focus {
        border-color: #6496ff;
        box-shadow: 0 0 0 2px rgba(100, 150, 255, 0.2);
      }
    }
    
    /* Info display styles */
    .${prefix}-info-display {
      color: #333;
      font-size: 14px;
      padding: 5px 10px;
      background-color: rgba(0, 0, 0, 0.05);
      border-radius: 3px;
      display: inline-block;
    }
    
    .${prefix}-info-label {
      font-weight: 600;
      margin-right: 5px;
    }
    
    @media (prefers-color-scheme: dark) {
      .${prefix}-info-display {
        color: #e0e0e0;
        background-color: rgba(255, 255, 255, 0.05);
      }
    }
    
    /* Radio group container */
    .${prefix}-radio-group {
      display: flex;
      flex-direction: column;
      gap: 5px;
    }
    
    .${prefix}-radio-group-label {
      color: #333;
      font-size: 14px;
      font-weight: 600;
      margin-bottom: 5px;
    }
    
    @media (prefers-color-scheme: dark) {
      .${prefix}-radio-group-label {
        color: #e0e0e0;
      }
    }
    
    /* Layout helper styles - not prefixed since they're framework-level */
    .demo-control-group {
      background-color: rgba(0, 0, 0, 0.02);
    }
    
    .demo-control-group-header {
      color: #333;
    }
    
    @media (prefers-color-scheme: dark) {
      .demo-control-group {
        background-color: rgba(255, 255, 255, 0.02);
        border-color: #555 !important;
      }
      
      .demo-control-group-header {
        color: #e0e0e0;
      }
    }
    
    /* Mobile responsive styles - not prefixed since they're framework-level */
    @media (max-width: 768px) {
      .demo-control-row[data-mobile-stack="true"] {
        flex-direction: column !important;
        gap: 10px !important;
      }
      
      .demo-control-grid[data-responsive="true"] {
        grid-template-columns: 1fr !important;
      }
      
      .${prefix}-button {
        min-width: 44px;
        min-height: 44px;
        padding: 10px 15px;
      }
      
      .${prefix}-select,
      .${prefix}-text-input {
        min-height: 44px;
        font-size: 16px; /* Prevents zoom on iOS */
      }
      
      input[type="checkbox"],
      input[type="radio"] {
        min-width: 20px;
        min-height: 20px;
      }
      
      /* Stack radio buttons vertically on mobile */
      .${prefix}-radio {
        flex-direction: column !important;
        align-items: flex-start !important;
        gap: 10px !important;
      }
      
      .${prefix}-radio label {
        padding: 5px 0;
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
  
  const slider = p.createSlider(min, max, value, step) as P5SliderElement;
  slider.parent(rowDiv);
  slider.class(`${className}-slider`);
  slider.style('width: 120px');
  
  if (onChange) {
    slider.input(onChange);
  }
  
  return slider;
}

/**
 * Creates a radio button group
 */
export function createRadioGroup<T>(
  name: string,
  options: RadioOption<T>[],
  defaultValue: T,
  onChange: (value: T) => void,
  className: string = 'demo'
): HTMLElement {
  const container = document.createElement('div');
  container.className = `${className}-radio-group`;
  
  const radioContainer = document.createElement('div');
  radioContainer.className = `${className}-radio`;
  
  options.forEach((option) => {
    const label = document.createElement('label');
    
    const input = document.createElement('input');
    input.type = 'radio';
    input.name = name;
    input.value = String(option.value);
    input.checked = option.value === defaultValue;
    
    input.addEventListener('change', () => {
      if (input.checked) {
        onChange(option.value);
      }
    });
    
    label.appendChild(input);
    label.appendChild(document.createTextNode(option.label));
    radioContainer.appendChild(label);
  });
  
  container.appendChild(radioContainer);
  return container;
}

/**
 * Creates a checkbox with label
 */
export function createCheckbox(
  label: string,
  checked: boolean,
  onChange: (checked: boolean) => void,
  className: string = 'demo'
): HTMLElement {
  const container = document.createElement('label');
  container.className = `${className}-checkbox-container`;
  
  const input = document.createElement('input');
  input.type = 'checkbox';
  input.checked = checked;
  
  input.addEventListener('change', () => {
    onChange(input.checked);
  });
  
  const labelSpan = document.createElement('span');
  labelSpan.className = `${className}-checkbox-label`;
  labelSpan.textContent = label;
  
  container.appendChild(input);
  container.appendChild(labelSpan);
  
  return container;
}

/**
 * Creates a select dropdown
 */
export function createSelect<T>(
  label: string,
  options: SelectOption<T>[],
  defaultValue: T,
  onChange: (value: T) => void,
  className: string = 'demo'
): HTMLElement {
  const container = document.createElement('div');
  container.style.display = 'inline-flex';
  container.style.alignItems = 'center';
  container.style.gap = '10px';
  
  if (label) {
    const labelDiv = document.createElement('div');
    labelDiv.className = `${className}-label`;
    labelDiv.textContent = label;
    container.appendChild(labelDiv);
  }
  
  const select = document.createElement('select');
  select.className = `${className}-select`;
  
  options.forEach(option => {
    const optionEl = document.createElement('option');
    optionEl.value = String(option.value);
    optionEl.textContent = option.label;
    if (option.value === defaultValue) {
      optionEl.selected = true;
    }
    select.appendChild(optionEl);
  });
  
  select.addEventListener('change', () => {
    const selectedOption = options.find(opt => String(opt.value) === select.value);
    if (selectedOption) {
      onChange(selectedOption.value);
    }
  });
  
  container.appendChild(select);
  return container;
}

/**
 * Creates a text input
 */
export function createTextInput(
  label: string,
  value: string,
  onChange: (value: string) => void,
  options: TextInputOptions = {}
): HTMLElement {
  const container = document.createElement('div');
  container.style.display = 'inline-flex';
  container.style.alignItems = 'center';
  container.style.gap = '10px';
  
  if (label) {
    const labelDiv = document.createElement('div');
    labelDiv.className = 'demo-label';
    labelDiv.textContent = label;
    container.appendChild(labelDiv);
  }
  
  const input = document.createElement('input');
  input.className = 'demo-text-input';
  input.type = options.type || 'text';
  input.value = value;
  
  if (options.placeholder) {
    input.placeholder = options.placeholder;
  }
  
  if (options.pattern) {
    input.pattern = options.pattern;
  }
  
  input.addEventListener('input', () => {
    onChange(input.value);
  });
  
  container.appendChild(input);
  return container;
}

/**
 * Creates an info display
 */
export function createInfoDisplay(
  label: string,
  initialValue: string = '',
  className: string = 'demo'
): InfoDisplay {
  const element = document.createElement('div');
  element.className = `${className}-info-display`;
  
  const labelSpan = document.createElement('span');
  labelSpan.className = `${className}-info-label`;
  labelSpan.textContent = label + ':';
  
  const valueSpan = document.createElement('span');
  valueSpan.textContent = initialValue;
  
  element.appendChild(labelSpan);
  element.appendChild(valueSpan);
  
  return {
    element,
    update: (value: string) => {
      valueSpan.textContent = value;
    }
  };
}

/**
 * Creates a number display with optional unit
 */
export function createNumberDisplay(
  label: string,
  initialValue: number = 0,
  options: NumberDisplayOptions = {}
): NumberDisplay {
  const decimals = options.decimals ?? 2;
  const unit = options.unit ?? '';
  
  const formatValue = (value: number) => {
    const formatted = value.toFixed(decimals);
    return unit ? `${formatted} ${unit}` : formatted;
  };
  
  const display = createInfoDisplay(label, formatValue(initialValue));
  
  return {
    element: display.element,
    update: (value: number) => {
      display.update(formatValue(value));
    }
  };
}

// Layout helper types
export interface RowOptions {
  gap?: string;
  justify?: 'start' | 'center' | 'end' | 'space-between' | 'space-around';
  wrap?: boolean;
  mobileStack?: boolean;
}

export interface ColumnOptions {
  gap?: string;
  align?: 'start' | 'center' | 'end' | 'stretch';
}

export interface GroupOptions {
  layout?: 'row' | 'column';
  collapsible?: boolean;
  defaultCollapsed?: boolean;
}

export interface GridOptions {
  columns?: number;
  gap?: string;
  responsive?: boolean;
}

/**
 * Creates a row of controls with automatic spacing
 */
export function createControlRow(
  controls: HTMLElement[],
  options: RowOptions = {}
): HTMLElement {
  const row = document.createElement('div');
  row.className = 'demo-control-row';
  row.style.display = 'flex';
  row.style.flexDirection = 'row';
  row.style.gap = options.gap || '20px';
  row.style.justifyContent = options.justify || 'center';
  row.style.alignItems = 'center';
  
  if (options.wrap) {
    row.style.flexWrap = 'wrap';
  }
  
  if (options.mobileStack) {
    // Add a data attribute for CSS media query handling
    row.setAttribute('data-mobile-stack', 'true');
  }
  
  controls.forEach(control => row.appendChild(control));
  
  return row;
}

/**
 * Creates a column of controls
 */
export function createControlColumn(
  controls: HTMLElement[],
  options: ColumnOptions = {}
): HTMLElement {
  const column = document.createElement('div');
  column.className = 'demo-control-column';
  column.style.display = 'flex';
  column.style.flexDirection = 'column';
  column.style.gap = options.gap || '10px';
  column.style.alignItems = options.align || 'center';
  
  controls.forEach(control => column.appendChild(control));
  
  return column;
}

/**
 * Creates a labeled group of controls
 */
export function createControlGroup(
  label: string,
  controls: HTMLElement[],
  options: GroupOptions = {}
): HTMLElement {
  const group = document.createElement('div');
  group.className = 'demo-control-group';
  group.style.border = '1px solid #ccc';
  group.style.borderRadius = '5px';
  group.style.padding = '15px';
  group.style.marginBottom = '15px';
  
  const header = document.createElement('div');
  header.className = 'demo-control-group-header';
  header.style.marginBottom = '10px';
  header.style.fontWeight = '600';
  header.style.fontSize = '14px';
  header.textContent = label;
  
  const content = document.createElement('div');
  content.className = 'demo-control-group-content';
  
  if (options.layout === 'row') {
    content.style.display = 'flex';
    content.style.flexDirection = 'row';
    content.style.gap = '15px';
    content.style.alignItems = 'center';
    content.style.justifyContent = 'center';
  } else {
    content.style.display = 'flex';
    content.style.flexDirection = 'column';
    content.style.gap = '10px';
  }
  
  controls.forEach(control => content.appendChild(control));
  
  group.appendChild(header);
  group.appendChild(content);
  
  if (options.collapsible) {
    header.style.cursor = 'pointer';
    header.style.userSelect = 'none';
    
    const toggleIndicator = document.createElement('span');
    toggleIndicator.textContent = options.defaultCollapsed ? ' ▶' : ' ▼';
    header.appendChild(toggleIndicator);
    
    if (options.defaultCollapsed) {
      content.style.display = 'none';
    }
    
    header.addEventListener('click', () => {
      const isHidden = content.style.display === 'none';
      content.style.display = isHidden ? '' : 'none';
      toggleIndicator.textContent = isHidden ? ' ▼' : ' ▶';
    });
  }
  
  return group;
}

/**
 * Creates a grid layout for controls
 */
export function createControlGrid(
  controls: HTMLElement[],
  options: GridOptions = {}
): HTMLElement {
  const grid = document.createElement('div');
  grid.className = 'demo-control-grid';
  grid.style.display = 'grid';
  grid.style.gap = options.gap || '15px';
  
  if (options.columns) {
    grid.style.gridTemplateColumns = `repeat(${options.columns}, 1fr)`;
  } else {
    grid.style.gridTemplateColumns = 'repeat(auto-fit, minmax(150px, 1fr))';
  }
  
  if (options.responsive) {
    grid.setAttribute('data-responsive', 'true');
  }
  
  controls.forEach(control => grid.appendChild(control));
  
  return grid;
}

/**
 * Creates a standard play/pause toggle button
 */
export function createPlayPauseButton(
  isPlaying: boolean,
  onToggle: (playing: boolean) => void,
  className: string = 'demo'
): HTMLButtonElement {
  const button = document.createElement('button');
  button.className = `${className}-button`;
  button.textContent = isPlaying ? 'Pause' : 'Play';
  
  let playing = isPlaying;
  
  button.addEventListener('click', () => {
    playing = !playing;
    button.textContent = playing ? 'Pause' : 'Play';
    onToggle(playing);
  });
  
  return button;
}

/**
 * Creates a standard reset button
 */
export function createResetButton(
  onReset: () => void,
  className: string = 'demo'
): HTMLButtonElement {
  const button = document.createElement('button');
  button.className = `${className}-button`;
  button.textContent = 'Reset';
  
  button.addEventListener('click', onReset);
  
  return button;
}