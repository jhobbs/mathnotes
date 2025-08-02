import p5 from 'p5';
import uiStyles from '@/styles/ui-components.module.css';

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
 * Deprecated: Styles are now in CSS modules
 * @deprecated Use CSS modules instead
 */
export function addDemoStyles(container: HTMLElement, prefix: string = 'demo'): HTMLStyleElement {
  // This function is deprecated - styles are now in CSS modules
  // Returning empty style element for backward compatibility
  const style = document.createElement('style');
  style.setAttribute('data-demo-styles', prefix);
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
  // CSS classes handle styling
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
  button.className = uiStyles.button;
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
  rowDiv.className = 'demo-slider-container';
  parent.appendChild(rowDiv);
  
  const labelDiv = document.createElement('div');
  labelDiv.textContent = label;
  labelDiv.className = uiStyles.label;
  rowDiv.appendChild(labelDiv);
  
  const slider = p.createSlider(min, max, value, step) as P5SliderElement;
  slider.parent(rowDiv);
  slider.class(uiStyles.slider);
  // Width is set via CSS class
  
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
  container.className = uiStyles.radioGroup;
  
  const radioContainer = document.createElement('div');
  radioContainer.className = uiStyles.radio;
  
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
  container.className = uiStyles.checkboxContainer;
  
  const input = document.createElement('input');
  input.type = 'checkbox';
  input.checked = checked;
  
  input.addEventListener('change', () => {
    onChange(input.checked);
  });
  
  const labelSpan = document.createElement('span');
  labelSpan.className = uiStyles.checkboxLabel;
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
  container.className = 'demo-input-container';
  
  if (label) {
    const labelDiv = document.createElement('div');
    labelDiv.className = uiStyles.label;
    labelDiv.textContent = label;
    container.appendChild(labelDiv);
  }
  
  const select = document.createElement('select');
  select.className = uiStyles.select;
  
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
  container.className = 'demo-input-container';
  
  if (label) {
    const labelDiv = document.createElement('div');
    labelDiv.className = uiStyles.label;
    labelDiv.textContent = label;
    container.appendChild(labelDiv);
  }
  
  const input = document.createElement('input');
  input.className = uiStyles.textInput;
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
  element.className = uiStyles.infoDisplay;
  
  const labelSpan = document.createElement('span');
  labelSpan.className = uiStyles.infoLabel;
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
  
  // Set gap using CSS custom property
  if (options.gap) {
    row.style.setProperty('--gap', options.gap);
  }
  
  if (options.wrap) {
    row.setAttribute('data-wrap', 'true');
  }
  
  if (options.mobileStack) {
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
  // CSS class handles styling
  
  const header = document.createElement('div');
  header.className = 'demo-control-group-header';
  // CSS class handles styling
  header.textContent = label;
  
  const content = document.createElement('div');
  content.className = 'demo-control-group-content';
  
  if (options.layout === 'row') {
    content.classList.add('demo-control-group-content--row');
  }
  
  controls.forEach(control => content.appendChild(control));
  
  group.appendChild(header);
  group.appendChild(content);
  
  if (options.collapsible) {
    header.classList.add('demo-control-group-header--clickable');
    
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
  // Add modifier classes based on columns
  if (options.columns === 2) {
    grid.classList.add('demo-control-grid--2-cols');
  } else if (options.columns === 3) {
    grid.classList.add('demo-control-grid--3-cols');
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
  button.className = uiStyles.button;
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
  button.className = uiStyles.button;
  button.textContent = 'Reset';
  
  button.addEventListener('click', onReset);
  
  return button;
}