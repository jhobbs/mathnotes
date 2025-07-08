"use strict";

function setupParameters() {
    // For integrated demos - just add event listener
    const calculateBtn = document.getElementById('Calculate');
    if (calculateBtn) {
        calculateBtn.addEventListener('click', calculate);
    }
}

function getParameters() {
    return {
        solutionStartingVolume: Number(document.getElementById("solutionStartingVolume").value),
        solutionStartingMass: Number(document.getElementById("solutionStartingMass").value),
        inflowVolumeRate: Number(document.getElementById("inflowVolumeRate").value),
        inflowConcentration: Number(document.getElementById("inflowConcentration").value),
        outflowVolumeRate: Number(document.getElementById("outflowVolumeRate").value),
        desiredMass: Number(document.getElementById("desiredMass").value),
        desiredTime: Number(document.getElementById("desiredTime").value)
    };
}

function calculateResults(parameters) {
    const results = {};

    const desiredMass = parameters["desiredMass"];
    const desiredTime = parameters["desiredTime"];
    const inflowVolumeRate = parameters["inflowVolumeRate"];
    const outflowVolumeRate = parameters["outflowVolumeRate"];
    const inflowConcentration = parameters["inflowConcentration"];
    const solutionStartingMass = parameters["solutionStartingMass"];
    const solutionStartingVolume = parameters["solutionStartingVolume"];

    if ((desiredMass == 0 && desiredTime == 0) || (desiredMass != 0 && desiredTime != 0)) {
        alert("Must specify either desiredMass or desiredTime, but not both!");
        return results;
    }

    const netflowRate = results["netflowRate"] = inflowVolumeRate - outflowVolumeRate;
    const inflowMassRate = results["inflowMassRate"] = inflowVolumeRate * inflowConcentration;

    if (netflowRate == 0 && outflowVolumeRate != 0) {
        results["method"] = "separable";
        const k = (solutionStartingMass + (solutionStartingVolume * inflowMassRate)/-outflowVolumeRate);
        results["k"] = k;

        if (desiredTime != 0) {
            results["resultingMass"] = k * Math.exp((-outflowVolumeRate*desiredTime)/solutionStartingVolume) - (solutionStartingVolume * inflowMassRate)/-outflowVolumeRate;
        } else {
            results["requiredTime"] = (solutionStartingVolume/-outflowVolumeRate) * Math.log((1/k) * (desiredMass + (solutionStartingVolume*inflowMassRate)/-outflowVolumeRate))
        }
    } else if (results.inflowMassRate == 0 && results.netflowRate != 0) {
        results["method"] = "separable";
        const k = solutionStartingMass * Math.pow(solutionStartingVolume, outflowVolumeRate/netflowRate);
        results["k"] = k;
        if (desiredTime != 0) {
            results["resultingMass"] = k * Math.pow(netflowRate * desiredTime + solutionStartingVolume, -outflowVolumeRate/netflowRate);
        } else {
            results["requiredTime"] = (Math.pow(desiredMass/k, netflowRate/-outflowVolumeRate) - solutionStartingVolume)/netflowRate;
        }
    } else if (inflowMassRate != 0 && netflowRate != 0) {
        results["method"] = "linear";
        const k = Math.pow(solutionStartingVolume, outflowVolumeRate/netflowRate) * (solutionStartingMass - (inflowMassRate * solutionStartingVolume)/(netflowRate + outflowVolumeRate));
        if (desiredTime != 0) {
            results["resultingMass"] = (inflowMassRate * (solutionStartingVolume + netflowRate * desiredTime))/(netflowRate + outflowVolumeRate) + k * Math.pow(solutionStartingVolume + netflowRate * desiredTime, -outflowVolumeRate/netflowRate);
        } else {
            alert("Can't compute this case yet!");
            return results;
        }
    } else if (solutionStartingVolume == 0 && inflowMassRate == 0) {
        results["method"] = "constant";
        if (desiredTime != 0) {
            results["resultingMass"] = 0;
        } else {
            results["requiredTime"] = "infinity";
        }
    } else {
        alert("Can't compute this case yet!");
        return results;
    }

    return results;
}

function calculate() {
    const parameters = getParameters();
    const results = calculateResults(parameters);

    const resultsP = document.getElementById("results");

    resultsP.replaceChildren();

    for (const [fieldName, value] of Object.entries(results)) {
        const resultP = document.createElement("p");
        const resultText = document.createTextNode(`${fieldName}: `);
        const resultA = document.createElement("a");
        resultP.appendChild(resultText);
        if (typeof(value) == 'string') {
            resultA.text = value;
        } else {
            resultA.text = value.toFixed(6);
        }
        resultP.appendChild(resultA);
        resultsP.appendChild(resultP);
    }
}

// Initialize when DOM is ready (for integrated demos)
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', setupParameters);
} else {
    setupParameters();
}