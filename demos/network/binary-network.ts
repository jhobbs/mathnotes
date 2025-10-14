// Binary Network - Random network with binary node states using Cytoscape.js
import cytoscape from 'cytoscape';
import type { Core, NodeSingular } from 'cytoscape';
import type { DemoInstance, DemoConfig, DemoMetadata } from '@framework/types';
import { isDarkMode } from '@framework/demo-utils';

interface NetworkNode {
  id: string;
  state: number; // 0 or 1
  func: number; // Binary function: 0 to 2^(2^k) - 1
}

class BinaryNetworkDemo implements DemoInstance {
  private container: HTMLElement;
  private cyContainer!: HTMLElement;
  private controlPanel!: HTMLElement;
  private cy!: Core;
  private isDark: boolean;

  // Network state
  private running = false;
  private generation = 0;
  private numNodes = 25;
  private k = 2; // Number of incoming connections per node
  private animationInterval?: number;

  // UI Elements
  private toggleBtn!: HTMLButtonElement;
  private resetBtn!: HTMLButtonElement;
  private speedSlider!: HTMLInputElement;
  private kSlider!: HTMLInputElement;
  private numNodesSlider!: HTMLInputElement;
  private initialActiveSlider!: HTMLInputElement;
  private runningStatus!: HTMLElement;
  private generationInfo!: HTMLElement;
  private activeNodesInfo!: HTMLElement;

  constructor(container: HTMLElement, config?: DemoConfig) {
    this.container = container;
    this.isDark = isDarkMode(config);
  }

  init(): DemoInstance {
    this.setupUI();
    this.initializeNetwork();
    return this;
  }

  private setupUI(): void {
    // Main container
    this.container.style.width = '100%';
    this.container.style.display = 'flex';
    this.container.style.flexDirection = 'column';
    this.container.style.gap = 'var(--space-md)';

    // Control panel
    this.controlPanel = document.createElement('div');
    this.controlPanel.style.display = 'flex';
    this.controlPanel.style.flexDirection = 'column';
    this.controlPanel.style.gap = 'var(--space-md)';
    this.controlPanel.style.padding = 'var(--space-md)';
    this.controlPanel.style.backgroundColor = 'var(--color-bg-secondary, #f5f5f5)';
    this.controlPanel.style.borderRadius = '8px';
    this.container.appendChild(this.controlPanel);

    // Button row
    const buttonRow = document.createElement('div');
    buttonRow.style.display = 'flex';
    buttonRow.style.gap = 'var(--space-md)';
    buttonRow.style.alignItems = 'center';
    buttonRow.style.flexWrap = 'wrap';
    this.controlPanel.appendChild(buttonRow);

    this.toggleBtn = this.createButton('Start', () => {
      this.running = !this.running;
      this.toggleBtn.textContent = this.running ? 'Pause' : 'Start';
      this.runningStatus.textContent = this.running ? 'Yes' : 'No';

      if (this.running) {
        this.startAnimation();
      } else {
        this.stopAnimation();
      }
    });
    buttonRow.appendChild(this.toggleBtn);

    this.resetBtn = this.createButton('Reset', () => {
      this.stopAnimation();
      this.k = parseInt(this.kSlider.value);
      this.numNodes = parseInt(this.numNodesSlider.value);
      this.initializeNetwork();
    });
    buttonRow.appendChild(this.resetBtn);

    // Sliders container - 2 columns
    const slidersContainer = document.createElement('div');
    slidersContainer.style.display = 'grid';
    slidersContainer.style.gridTemplateColumns = '1fr 1fr';
    slidersContainer.style.gap = 'var(--space-lg)';
    this.controlPanel.appendChild(slidersContainer);

    // Speed slider
    const speedSliderRow = document.createElement('div');
    speedSliderRow.style.display = 'flex';
    speedSliderRow.style.gap = 'var(--space-md)';
    speedSliderRow.style.alignItems = 'center';
    slidersContainer.appendChild(speedSliderRow);

    const sliderLabel = document.createElement('label');
    sliderLabel.textContent = 'Update Speed:';
    sliderLabel.style.fontWeight = '500';
    speedSliderRow.appendChild(sliderLabel);

    this.speedSlider = document.createElement('input');
    this.speedSlider.type = 'range';
    this.speedSlider.min = '1';
    this.speedSlider.max = '20';
    this.speedSlider.value = '5';
    this.speedSlider.style.flex = '1';
    this.speedSlider.addEventListener('input', () => {
      if (this.running) {
        this.startAnimation();
      }
    });
    speedSliderRow.appendChild(this.speedSlider);

    // K slider
    const kSliderRow = document.createElement('div');
    kSliderRow.style.display = 'flex';
    kSliderRow.style.gap = 'var(--space-md)';
    kSliderRow.style.alignItems = 'center';
    slidersContainer.appendChild(kSliderRow);

    const kSliderLabel = document.createElement('label');
    kSliderLabel.textContent = 'Inputs per node (k):';
    kSliderLabel.style.fontWeight = '500';
    kSliderRow.appendChild(kSliderLabel);

    this.kSlider = document.createElement('input');
    this.kSlider.type = 'range';
    this.kSlider.min = '1';
    this.kSlider.max = '5';
    this.kSlider.value = '2';
    this.kSlider.style.flex = '1';
    kSliderRow.appendChild(this.kSlider);

    const kValue = document.createElement('span');
    kValue.textContent = '2';
    kValue.style.minWidth = '20px';
    kValue.style.fontWeight = '500';
    kSliderRow.appendChild(kValue);

    this.kSlider.addEventListener('input', () => {
      kValue.textContent = this.kSlider.value;
      this.stopAnimation();
      this.k = parseInt(this.kSlider.value);
      this.initializeNetwork();
    });

    // Number of nodes slider
    const numNodesSliderRow = document.createElement('div');
    numNodesSliderRow.style.display = 'flex';
    numNodesSliderRow.style.gap = 'var(--space-md)';
    numNodesSliderRow.style.alignItems = 'center';
    slidersContainer.appendChild(numNodesSliderRow);

    const numNodesLabel = document.createElement('label');
    numNodesLabel.textContent = 'Number of nodes:';
    numNodesLabel.style.fontWeight = '500';
    numNodesSliderRow.appendChild(numNodesLabel);

    this.numNodesSlider = document.createElement('input');
    this.numNodesSlider.type = 'range';
    this.numNodesSlider.min = '10';
    this.numNodesSlider.max = '200';
    this.numNodesSlider.value = '25';
    this.numNodesSlider.style.flex = '1';
    numNodesSliderRow.appendChild(this.numNodesSlider);

    const numNodesValue = document.createElement('span');
    numNodesValue.textContent = '25';
    numNodesValue.style.minWidth = '30px';
    numNodesValue.style.fontWeight = '500';
    numNodesSliderRow.appendChild(numNodesValue);

    this.numNodesSlider.addEventListener('input', () => {
      numNodesValue.textContent = this.numNodesSlider.value;
      this.stopAnimation();
      this.numNodes = parseInt(this.numNodesSlider.value);
      this.initializeNetwork();
    });

    // Initial active percentage slider
    const initialActiveRow = document.createElement('div');
    initialActiveRow.style.display = 'flex';
    initialActiveRow.style.gap = 'var(--space-md)';
    initialActiveRow.style.alignItems = 'center';
    slidersContainer.appendChild(initialActiveRow);

    const initialActiveLabel = document.createElement('label');
    initialActiveLabel.textContent = 'Initial active %:';
    initialActiveLabel.style.fontWeight = '500';
    initialActiveRow.appendChild(initialActiveLabel);

    this.initialActiveSlider = document.createElement('input');
    this.initialActiveSlider.type = 'range';
    this.initialActiveSlider.min = '0';
    this.initialActiveSlider.max = '100';
    this.initialActiveSlider.value = '50';
    this.initialActiveSlider.style.flex = '1';
    initialActiveRow.appendChild(this.initialActiveSlider);

    const initialActiveValue = document.createElement('span');
    initialActiveValue.textContent = '50%';
    initialActiveValue.style.minWidth = '40px';
    initialActiveValue.style.fontWeight = '500';
    initialActiveRow.appendChild(initialActiveValue);

    this.initialActiveSlider.addEventListener('input', () => {
      initialActiveValue.textContent = this.initialActiveSlider.value + '%';
      this.stopAnimation();
      this.initializeNetwork();
    });

    // Info row
    const infoRow = document.createElement('div');
    infoRow.style.display = 'flex';
    infoRow.style.gap = 'var(--space-lg)';
    infoRow.style.flexWrap = 'wrap';
    infoRow.style.fontSize = 'var(--text-sm)';
    this.controlPanel.appendChild(infoRow);

    this.runningStatus = this.createInfoDisplay('Running', 'No');
    this.activeNodesInfo = this.createInfoDisplay('Active Nodes', '0');
    this.generationInfo = this.createInfoDisplay('Generation', '0');

    infoRow.appendChild(this.runningStatus.parentElement!);
    infoRow.appendChild(this.activeNodesInfo.parentElement!);
    infoRow.appendChild(this.generationInfo.parentElement!);

    // Cytoscape container
    this.cyContainer = document.createElement('div');
    this.cyContainer.style.width = '100%';
    this.cyContainer.style.height = '600px';
    this.cyContainer.style.backgroundColor = this.isDark ? '#1e1e1e' : '#ffffff';
    this.cyContainer.style.borderRadius = '8px';
    this.cyContainer.style.border = `1px solid ${this.isDark ? '#444' : '#ddd'}`;
    this.container.appendChild(this.cyContainer);
  }

  private createButton(text: string, onClick: () => void): HTMLButtonElement {
    const button = document.createElement('button');
    button.textContent = text;
    button.style.padding = '8px 16px';
    button.style.fontSize = 'var(--text-sm)';
    button.style.fontWeight = '500';
    button.style.backgroundColor = 'var(--color-accent, #3498db)';
    button.style.color = '#ffffff';
    button.style.border = 'none';
    button.style.borderRadius = '4px';
    button.style.cursor = 'pointer';
    button.addEventListener('click', onClick);
    return button;
  }

  private createInfoDisplay(label: string, value: string): HTMLElement {
    const container = document.createElement('div');
    container.style.display = 'flex';
    container.style.gap = 'var(--space-sm)';
    container.style.alignItems = 'center';

    const labelEl = document.createElement('span');
    labelEl.textContent = label + ':';
    labelEl.style.fontWeight = '500';
    container.appendChild(labelEl);

    const valueEl = document.createElement('span');
    valueEl.textContent = value;
    container.appendChild(valueEl);

    return valueEl;
  }

  private initializeNetwork(): void {
    this.generation = 0;
    this.running = false;
    this.toggleBtn.textContent = 'Start';
    this.runningStatus.textContent = 'No';
    this.generationInfo.textContent = '0';

    // Generate nodes with random binary functions
    const nodes: NetworkNode[] = [];
    const numFunctions = Math.pow(2, Math.pow(2, this.k)); // 2^(2^k)
    const initialActiveProb = parseInt(this.initialActiveSlider.value) / 100;
    for (let i = 0; i < this.numNodes; i++) {
      nodes.push({
        id: `n${i}`,
        state: Math.random() < initialActiveProb ? 1 : 0,
        func: Math.floor(Math.random() * numFunctions)
      });
    }

    // Generate directed edges - each node gets exactly k incoming connections
    const edges: { source: string; target: string }[] = [];

    for (const targetNode of nodes) {
      // Get k random source nodes (excluding self)
      const potentialSources = nodes.filter(n => n.id !== targetNode.id);

      // Shuffle and take first k nodes
      potentialSources.sort(() => Math.random() - 0.5);
      const sources = potentialSources.slice(0, Math.min(this.k, potentialSources.length));

      // Create directed edges from sources to this target
      for (const source of sources) {
        edges.push({ source: source.id, target: targetNode.id });
      }
    }

    // Create cytoscape elements
    const elements = [
      ...nodes.map(n => ({
        data: { id: n.id, state: n.state, func: n.func }
      })),
      ...edges.map((e, i) => ({
        data: { id: `e${i}`, source: e.source, target: e.target }
      }))
    ];

    // Destroy existing instance if any
    if (this.cy) {
      this.cy.destroy();
    }

    // Initialize cytoscape
    this.cy = cytoscape({
      container: this.cyContainer,
      elements: elements,
      style: this.getCytoscapeStyle(),
      layout: {
        name: 'cose',
        animate: true,
        animationDuration: 1000,
        nodeRepulsion: 8000,
        idealEdgeLength: 100,
        edgeElasticity: 100,
        nestingFactor: 1.2,
        gravity: 1,
        numIter: 1000,
        randomize: true
      } as any
    });

    // Fit to viewport after layout completes
    this.cy.one('layoutstop', () => {
      this.cy.fit(undefined, 50); // 50px padding
    });

    // Add click handler for nodes
    this.cy.on('tap', 'node', (event: any) => {
      const node = event.target;
      const currentState = node.data('state');
      node.data('state', currentState === 1 ? 0 : 1);
      this.updateNodeStyle(node);
      this.updateInfoDisplays();
    });

    this.updateInfoDisplays();
  }

  private getCytoscapeStyle(): any[] {
    const activeColor = this.isDark ? '#3498db' : '#2980b9';
    const inactiveColor = this.isDark ? '#555' : '#bdc3c7';
    const edgeColor = this.isDark ? '#444' : '#95a5a6';
    const textColor = this.isDark ? '#fff' : '#000';

    return [
      {
        selector: 'node',
        style: {
          'background-color': (ele: NodeSingular) => {
            return ele.data('state') === 1 ? activeColor : inactiveColor;
          },
          'width': 30,
          'height': 30,
          'label': 'data(id)',
          'color': textColor,
          'text-valign': 'center',
          'text-halign': 'center',
          'font-size': '10px',
          'overlay-opacity': 0
        }
      },
      {
        selector: 'edge',
        style: {
          'width': 1,
          'line-color': edgeColor,
          'curve-style': 'bezier',
          'target-arrow-shape': 'triangle',
          'target-arrow-color': edgeColor,
          'arrow-scale': 0.8,
          'overlay-opacity': 0
        }
      }
    ];
  }

  private updateNodeStyle(node: NodeSingular): void {
    const activeColor = this.isDark ? '#3498db' : '#2980b9';
    const inactiveColor = this.isDark ? '#555' : '#bdc3c7';

    node.style('background-color', node.data('state') === 1 ? activeColor : inactiveColor);
  }

  private startAnimation(): void {
    this.stopAnimation();
    const updateInterval = 1000 / parseInt(this.speedSlider.value);

    this.animationInterval = window.setInterval(() => {
      this.updateNetwork();
    }, updateInterval);
  }

  private stopAnimation(): void {
    if (this.animationInterval) {
      clearInterval(this.animationInterval);
      this.animationInterval = undefined;
    }
  }

  private updateNetwork(): void {
    if (!this.cy) return;

    const nodes = this.cy.nodes();
    const nextStates = new Map<string, number>();

    // Calculate next state for all nodes based on their binary function
    // Only count incoming connections (predecessors)
    nodes.forEach((node: any) => {
      const incomingNeighbors = node.incomers('node');
      const func = node.data('func');

      if (incomingNeighbors.length === 0) {
        // No incoming neighbors, maintain current state
        nextStates.set(node.id(), node.data('state'));
      } else {
        // Get states of incoming neighbors and convert to binary number
        // The order matters - we need a consistent ordering
        const inputStates: number[] = [];
        incomingNeighbors.forEach((neighbor: any) => {
          inputStates.push(neighbor.data('state'));
        });

        // Convert input states to a binary number (truth table index)
        let inputIndex = 0;
        for (let i = 0; i < inputStates.length; i++) {
          inputIndex = (inputIndex << 1) | inputStates[i];
        }

        // Look up the output in the function's truth table
        // The function number's bits represent the truth table
        const output = (func >> inputIndex) & 1;
        nextStates.set(node.id(), output);
      }
    });

    // Apply next state to all nodes
    nodes.forEach((node: any) => {
      const nextState = nextStates.get(node.id())!;
      node.data('state', nextState);
      this.updateNodeStyle(node);
    });

    this.generation++;
    this.updateInfoDisplays();
  }

  private updateInfoDisplays(): void {
    if (!this.cy) return;

    const nodes = this.cy.nodes();
    let activeCount = 0;

    nodes.forEach((node: any) => {
      if (node.data('state') === 1) {
        activeCount++;
      }
    });

    this.activeNodesInfo.textContent = `${activeCount}`;
    this.generationInfo.textContent = `${this.generation}`;
  }

  resize(): void {
    if (this.cy) {
      this.cy.resize();
      this.cy.fit();
    }
  }

  pause(): void {
    if (this.running) {
      this.stopAnimation();
      this.running = false;
      this.toggleBtn.textContent = 'Start';
      this.runningStatus.textContent = 'No';
    }
  }

  resume(): void {
    if (!this.running) {
      this.running = true;
      this.toggleBtn.textContent = 'Pause';
      this.runningStatus.textContent = 'Yes';
      this.startAnimation();
    }
  }

  cleanup(): void {
    this.stopAnimation();
    if (this.cy) {
      this.cy.destroy();
    }
    this.container.innerHTML = '';
  }
}

export const metadata: DemoMetadata = {
  title: 'Binary Network',
  category: 'Network Dynamics',
  description: 'Interactive simulation of a directed random binary network where each node computes a random Boolean function of its inputs',
  instructions: 'Adjust k (inputs per node) and number of nodes. Each node has a random Boolean function. Click nodes to toggle state. Click Start to run dynamics.'
};

export default function initBinaryNetworkDemo(container: HTMLElement, config?: DemoConfig): DemoInstance {
  const demo = new BinaryNetworkDemo(container, config);
  return demo.init();
}
