"use strict";

const INPUT_FIELDS = [
    "inflowVolumeRate",
    "outflowVolumeRate",
    "solutionStartingMass",
    "inflowConcentration",
    "solutionStartingVolume"
]

function getParameters() {
    let parameters = {};

    INPUT_FIELDS.forEach(inputField => {
        parameters[inputField] = Number(document.getElementById(inputField).value);
    });

    parameters["netflowRate"] = parameters["inflowVolumeRate"] + parameters["outflowVolumeRate"];
    parameters["inflowMassRate"] = parameters["inflowVolumeRate"] * parameters["inflowConcentration"];

    return parameters;
}

function calculateResults(parameters) {
    let results = {};

    results["netflowRate"] = parameters["inflowVolumeRate"] + parameters["outflowVolumeRate"];
    results["inflowMassRate"] = parameters["inflowVolumeRate"] * parameters["inflowConcentration"];

    if (results.inflowMassRate != 0) {
        results["method"] = "separable";

        
    }

    return results;
}

function calculate() {
    let parameters = getParameters();
    let results = calculateResults(parameters);

    for (const [fieldName, value] of Object.entries(results)) {
        let field = document.getElementById(fieldName);
        field.text = value;
    }
}