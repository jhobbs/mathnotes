import type { DemoConfig, DemoInstance } from '@framework/types';
import styles from '@/styles/dilution-calculator.module.css';

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

export const metadata = {
  title: 'Dilution Calculator',
  category: 'Differential Equations',
  description: 'Interactive calculator for dilution processes using differential equations'
};

export default function createDilutionCalculatorDemo(container: HTMLElement, _config?: DemoConfig): DemoInstance {
  // Create the HTML structure
  container.innerHTML = `
    <div class="${styles.content}" id="dilution-calculator">
      <h3>Setup</h3>
      <form>
        <div id="parameters">
          <div class="${styles.inputGroup}">
            <label for="solutionStartingVolume">Solution Starting Volume:</label>
            <input type="number" id="solutionStartingVolume" class="${styles.input}" step="any">
          </div>
          <div class="${styles.inputGroup}">
            <label for="solutionStartingMass">Solution Starting Mass:</label>
            <input type="number" id="solutionStartingMass" class="${styles.input}" step="any">
          </div>
          <div class="${styles.inputGroup}">
            <label for="inflowVolumeRate">Inflow Volume Rate:</label>
            <input type="number" id="inflowVolumeRate" class="${styles.input}" step="any">
          </div>
          <div class="${styles.inputGroup}">
            <label for="inflowConcentration">Inflow Concentration:</label>
            <input type="number" id="inflowConcentration" class="${styles.input}" step="any">
          </div>
          <div class="${styles.inputGroup}">
            <label for="outflowVolumeRate">Outflow Volume Rate:</label>
            <input type="number" id="outflowVolumeRate" class="${styles.input}" step="any">
          </div>
          <div class="${styles.inputGroup}">
            <label for="desiredMass">Desired Mass:</label>
            <input type="number" id="desiredMass" class="${styles.input}" step="any">
          </div>
          <div class="${styles.inputGroup}">
            <label for="desiredTime">Desired Time:</label>
            <input type="number" id="desiredTime" class="${styles.input}" step="any">
          </div>
        </div>
        <button type="button" id="Calculate" class="${styles.button}">Calculate</button>
      </form>
      <h3>Results</h3>
      <div id="results"></div>
    </div>
  `;

  // CSS module styles are imported at the top

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
      resultDiv.className = styles.resultItem;
      
      const label = document.createElement('span');
      label.className = styles.resultLabel;
      label.textContent = formatFieldName(fieldName) + ':';
      
      const valueSpan = document.createElement('span');
      valueSpan.className = styles.resultValue;
      valueSpan.textContent = typeof value === 'string' ? value : value.toFixed(6);
      
      resultDiv.appendChild(label);
      resultDiv.appendChild(valueSpan);
      resultsDiv.appendChild(resultDiv);
    }
  });

  // Return DemoInstance
  return {
    cleanup: () => {
      // No cleanup needed - using CSS modules now
    },
    pause: () => {}, // No animation to pause
    resume: () => {}, // No animation to resume
    resize: () => {} // No canvas to resize
  };
}