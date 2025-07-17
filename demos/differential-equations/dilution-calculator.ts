import type { DemoConfig, DemoInstance } from '@framework/types';

// Dilution calculator demo
interface DilutionParameters {
  solutionStartingVolume: number;
  solutionStartingMass: number;
  inflowVolumeRate: number;
  inflowConcentration: number;
  outflowVolumeRate: number;
  desiredMass: number;
  desiredTime: number;
}

interface DilutionResults {
  netflowRate?: number;
  inflowMassRate?: number;
  method?: string;
  k?: number;
  resultingMass?: number;
  requiredTime?: number | string;
}

function calculateResults(parameters: DilutionParameters): DilutionResults {
  const results: DilutionResults = {};

  const {
    desiredMass,
    desiredTime,
    inflowVolumeRate,
    outflowVolumeRate,
    inflowConcentration,
    solutionStartingMass,
    solutionStartingVolume
  } = parameters;

  if ((desiredMass === 0 && desiredTime === 0) || (desiredMass !== 0 && desiredTime !== 0)) {
    alert("Must specify either desiredMass or desiredTime, but not both!");
    return results;
  }

  const netflowRate = results.netflowRate = inflowVolumeRate - outflowVolumeRate;
  const inflowMassRate = results.inflowMassRate = inflowVolumeRate * inflowConcentration;

  if (netflowRate === 0 && outflowVolumeRate !== 0) {
    results.method = "separable";
    const k = (solutionStartingMass + (solutionStartingVolume * inflowMassRate) / -outflowVolumeRate);
    results.k = k;

    if (desiredTime !== 0) {
      results.resultingMass = k * Math.exp((-outflowVolumeRate * desiredTime) / solutionStartingVolume) - 
        (solutionStartingVolume * inflowMassRate) / -outflowVolumeRate;
    } else {
      results.requiredTime = (solutionStartingVolume / -outflowVolumeRate) * 
        Math.log((1 / k) * (desiredMass + (solutionStartingVolume * inflowMassRate) / -outflowVolumeRate));
    }
  } else if (inflowMassRate === 0 && netflowRate !== 0) {
    results.method = "separable";
    const k = solutionStartingMass * Math.pow(solutionStartingVolume, outflowVolumeRate / netflowRate);
    results.k = k;
    
    if (desiredTime !== 0) {
      results.resultingMass = k * Math.pow(netflowRate * desiredTime + solutionStartingVolume, -outflowVolumeRate / netflowRate);
    } else {
      results.requiredTime = (Math.pow(desiredMass / k, netflowRate / -outflowVolumeRate) - solutionStartingVolume) / netflowRate;
    }
  } else if (inflowMassRate !== 0 && netflowRate !== 0) {
    results.method = "linear";
    const k = Math.pow(solutionStartingVolume, outflowVolumeRate / netflowRate) * 
      (solutionStartingMass - (inflowMassRate * solutionStartingVolume) / (netflowRate + outflowVolumeRate));
    results.k = k;
    
    if (desiredTime !== 0) {
      results.resultingMass = (inflowMassRate * (solutionStartingVolume + netflowRate * desiredTime)) / 
        (netflowRate + outflowVolumeRate) + 
        k * Math.pow(solutionStartingVolume + netflowRate * desiredTime, -outflowVolumeRate / netflowRate);
    } else {
      alert("Can't compute this case yet!");
      return results;
    }
  } else if (solutionStartingVolume === 0 && inflowMassRate === 0) {
    results.method = "constant";
    if (desiredTime !== 0) {
      results.resultingMass = 0;
    } else {
      results.requiredTime = "infinity";
    }
  } else {
    alert("Can't compute this case yet!");
    return results;
  }

  return results;
}

export default function createDilutionCalculatorDemo(container: HTMLElement, config?: DemoConfig): DemoInstance {
  // Create the HTML structure
  container.innerHTML = `
    <div class="demo-content" id="dilution-calculator">
      <h3>Setup</h3>
      <form>
        <div id="parameters">
          <div class="input-group">
            <label for="solutionStartingVolume">Solution Starting Volume:</label>
            <input type="number" id="solutionStartingVolume" class="demo-input" step="any">
          </div>
          <div class="input-group">
            <label for="solutionStartingMass">Solution Starting Mass:</label>
            <input type="number" id="solutionStartingMass" class="demo-input" step="any">
          </div>
          <div class="input-group">
            <label for="inflowVolumeRate">Inflow Volume Rate:</label>
            <input type="number" id="inflowVolumeRate" class="demo-input" step="any">
          </div>
          <div class="input-group">
            <label for="inflowConcentration">Inflow Concentration:</label>
            <input type="number" id="inflowConcentration" class="demo-input" step="any">
          </div>
          <div class="input-group">
            <label for="outflowVolumeRate">Outflow Volume Rate:</label>
            <input type="number" id="outflowVolumeRate" class="demo-input" step="any">
          </div>
          <div class="input-group">
            <label for="desiredMass">Desired Mass:</label>
            <input type="number" id="desiredMass" class="demo-input" step="any">
          </div>
          <div class="input-group">
            <label for="desiredTime">Desired Time:</label>
            <input type="number" id="desiredTime" class="demo-input" step="any">
          </div>
        </div>
        <button type="button" id="Calculate" class="demo-button">Calculate</button>
      </form>
      <h3>Results</h3>
      <div id="results"></div>
    </div>
  `;

  // Add styles
  const style = document.createElement('style');
  style.textContent = `
    .demo-content h3 {
      margin-top: 0;
      margin-bottom: 1rem;
      color: var(--header-color);
    }

    .input-group {
      margin-bottom: 1rem;
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .input-group label {
      min-width: 160px;
      font-weight: 500;
      color: var(--text-color);
    }

    .demo-input {
      padding: 0.5rem;
      border: 1px solid var(--border-color);
      border-radius: 4px;
      background-color: var(--bg-color);
      color: var(--text-color);
      font-size: 0.9rem;
      width: 120px;
    }

    /* Hide number input spinners for cleaner look */
    .demo-input::-webkit-outer-spin-button,
    .demo-input::-webkit-inner-spin-button {
      -webkit-appearance: none;
      margin: 0;
    }
    .demo-input[type=number] {
      -moz-appearance: textfield;
    }

    .demo-input:focus {
      outline: none;
      border-color: var(--link-color);
      box-shadow: 0 0 0 2px rgba(58, 166, 255, 0.2);
    }

    .demo-button {
      padding: 0.75rem 1.5rem;
      background-color: var(--link-color);
      color: white;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      font-size: 1rem;
      font-weight: 500;
      margin: 1rem 0;
      transition: background-color 0.2s;
    }

    .demo-button:hover {
      background-color: #0056b3;
      opacity: 0.9;
    }

    .result-item {
      margin-bottom: 0.5rem;
      padding: 0.5rem;
      background-color: var(--code-bg);
      border-radius: 4px;
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .result-label {
      min-width: 160px;
      font-weight: 500;
      color: var(--text-color);
    }

    .result-value {
      color: var(--link-color);
      font-weight: 600;
      font-family: monospace;
    }

    @media (prefers-color-scheme: dark) {
      .demo-input {
        background-color: var(--code-bg);
        border-color: var(--border-color);
      }
      
      .demo-button:hover {
        background-color: #4a90e2;
      }
    }

    @media (max-width: 768px) {
      .input-group,
      .result-item {
        flex-direction: column;
        align-items: flex-start;
        gap: 0.25rem;
      }
      
      .input-group label,
      .result-label {
        min-width: auto;
      }
      
      .demo-input {
        width: 100%;
        max-width: 200px;
      }
    }
  `;
  document.head.appendChild(style);

  // Event handler
  const calculateButton = container.querySelector('#Calculate') as HTMLButtonElement;
  calculateButton.addEventListener('click', () => {
    const parameters: DilutionParameters = {
      solutionStartingVolume: Number((container.querySelector('#solutionStartingVolume') as HTMLInputElement).value),
      solutionStartingMass: Number((container.querySelector('#solutionStartingMass') as HTMLInputElement).value),
      inflowVolumeRate: Number((container.querySelector('#inflowVolumeRate') as HTMLInputElement).value),
      inflowConcentration: Number((container.querySelector('#inflowConcentration') as HTMLInputElement).value),
      outflowVolumeRate: Number((container.querySelector('#outflowVolumeRate') as HTMLInputElement).value),
      desiredMass: Number((container.querySelector('#desiredMass') as HTMLInputElement).value),
      desiredTime: Number((container.querySelector('#desiredTime') as HTMLInputElement).value)
    };

    const results = calculateResults(parameters);
    const resultsDiv = container.querySelector('#results') as HTMLDivElement;
    
    // Clear previous results
    resultsDiv.innerHTML = '';

    // Display results
    const formatFieldName = (name: string): string => {
      return name.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
    };

    for (const [fieldName, value] of Object.entries(results)) {
      const resultDiv = document.createElement('div');
      resultDiv.className = 'result-item';
      
      const label = document.createElement('span');
      label.className = 'result-label';
      label.textContent = formatFieldName(fieldName) + ':';
      
      const valueSpan = document.createElement('span');
      valueSpan.className = 'result-value';
      valueSpan.textContent = typeof value === 'string' ? value : value.toFixed(6);
      
      resultDiv.appendChild(label);
      resultDiv.appendChild(valueSpan);
      resultsDiv.appendChild(resultDiv);
    }
  });

  // Cleanup function
  return () => {
    if (style.parentNode) {
      style.parentNode.removeChild(style);
    }
  };
}