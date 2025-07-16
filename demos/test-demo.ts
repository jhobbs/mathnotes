// Test demo to verify TypeScript compilation
import type { DemoConfig, DemoInstance } from '@framework/types';

export default function initTestDemo(container: HTMLElement, config?: DemoConfig): DemoInstance {
  const message = document.createElement('p');
  message.textContent = `Test demo loaded! Dark mode: ${config?.darkMode ?? false}`;
  message.style.padding = '20px';
  message.style.backgroundColor = config?.darkMode ? '#333' : '#f0f0f0';
  message.style.color = config?.darkMode ? '#fff' : '#000';
  container.appendChild(message);

  return {
    cleanup() {
      container.innerHTML = '';
    },
    resize() {
      console.log('Demo resized');
    }
  };
}