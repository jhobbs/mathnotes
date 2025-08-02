import styles from './DemoControls.module.css';
import type { CSSModuleClasses } from '../types/css-modules';

// Type-safe styles
const typedStyles = styles as CSSModuleClasses<
  | 'container'
  | 'sliderGroup'
  | 'slider'
  | 'radioGroup'
  | 'button'
  | 'buttonSecondary'
>;

interface SliderConfig {
  label: string;
  min: number;
  max: number;
  step: number;
  value: number;
  onChange: (value: number) => void;
}

interface RadioConfig<T extends string> {
  label: string;
  options: { value: T; label: string }[];
  value: T;
  onChange: (value: T) => void;
}

export class DemoControls {
  private container: HTMLElement;
  
  constructor(container: HTMLElement) {
    this.container = container;
    this.container.classList.add(typedStyles.container);
  }
  
  addSlider(config: SliderConfig): void {
    const group = document.createElement('div');
    group.classList.add(typedStyles.sliderGroup);
    
    const label = document.createElement('label');
    label.textContent = `${config.label}: ${config.value}`;
    group.appendChild(label);
    
    const slider = document.createElement('input');
    slider.type = 'range';
    slider.classList.add(typedStyles.slider);
    slider.min = config.min.toString();
    slider.max = config.max.toString();
    slider.step = config.step.toString();
    slider.value = config.value.toString();
    
    slider.addEventListener('input', () => {
      const value = parseFloat(slider.value);
      label.textContent = `${config.label}: ${value}`;
      config.onChange(value);
    });
    
    group.appendChild(slider);
    this.container.appendChild(group);
  }
  
  addRadioGroup<T extends string>(config: RadioConfig<T>): void {
    const group = document.createElement('div');
    group.classList.add(typedStyles.radioGroup);
    
    const legend = document.createElement('div');
    legend.textContent = config.label;
    legend.className = 'demo-control-group-header';
    this.container.appendChild(legend);
    
    config.options.forEach(option => {
      const label = document.createElement('label');
      
      const radio = document.createElement('input');
      radio.type = 'radio';
      radio.name = config.label;
      radio.value = option.value;
      radio.checked = option.value === config.value;
      
      radio.addEventListener('change', () => {
        if (radio.checked) {
          config.onChange(option.value);
        }
      });
      
      label.appendChild(radio);
      label.appendChild(document.createTextNode(option.label));
      group.appendChild(label);
    });
    
    this.container.appendChild(group);
  }
  
  addButton(text: string, onClick: () => void, secondary = false): void {
    const button = document.createElement('button');
    button.textContent = text;
    button.classList.add(secondary ? typedStyles.buttonSecondary : typedStyles.button);
    button.addEventListener('click', onClick);
    this.container.appendChild(button);
  }
}