"use strict";

const INPUT_FIELDS = [
    "solutionStartingVolume",
    "solutionStartingMass",
    "inflowVolumeRate",
    "inflowConcentration",
    "outflowVolumeRate",
    "desiredMass",
    "desiredTime"
];

function setupParameters() {
    const parametersP = document.getElementById("parameters");

    parametersP.replaceChildren();

    INPUT_FIELDS.forEach(inputField => {
        const parameterP = document.createElement("p");
        const parameterText = document.createTextNode(`${inputField}: `);
        const parameterInput = document.createElement("input");
        parameterP.appendChild(parameterText);
        parameterInput.id = inputField;
        parameterP.appendChild(parameterInput);
        parametersP.appendChild(parameterP);
    });
}

function getParameters() {
    const parameters = {};

    INPUT_FIELDS.forEach(inputField => {
        parameters[inputField] = Number(document.getElementById(inputField).value);
    });

    return parameters;
}

function calculateResults(parameters) {
    const results = {};

    if ((parameters["desiredMass"] == 0 && parameters["desiredTime"] == 0) || (parameters["desiredMass"] != 0 && parameters["desiredTime"] != 0)) {
        alert("Must specify either desiredMass or desiredTime, but not both!");
        return results;
    }

    results["netflowRate"] = parameters["inflowVolumeRate"] - parameters["outflowVolumeRate"];
    results["inflowMassRate"] = parameters["inflowVolumeRate"] * parameters["inflowConcentration"];

    if (results.inflowMassRate == 0) {
        results["method"] = "separable";
        const k = (parameters["solutionStartingVolume"] / -parameters["outflowVolumeRate"]) * Math.log(parameters["solutionStartingMass"]);
        results["k"] = k;

        if (parameters["desiredTime"] != 0) {
            results["resultingMass"] = Math.exp((parameters["desiredTime"] + k) * (-parameters["outflowVolumeRate"]/parameters["solutionStartingVolume"]));
        } else {
            results["requiredTime"] = (parameters["solutionStartingVolume"] / -parameters["outflowVolumeRate"]) * Math.log(parameters["desiredMass"]) - k;
        }
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
            resultA.text = value.toFixed(2);
        }
        resultP.appendChild(resultA);
        resultsP.appendChild(resultP);
    }
}