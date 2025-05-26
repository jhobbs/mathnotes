// Helper functions for dark mode support in p5.js demos

function isDarkMode() {
    return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
}

function getTextColor() {
    if (isDarkMode()) {
        return color(201, 209, 217); // #c9d1d9
    } else {
        return color(51, 51, 51); // #333333
    }
}

function getBackgroundColor() {
    if (isDarkMode()) {
        return color(22, 27, 34); // #161b22
    } else {
        return color(255, 255, 255); // #ffffff
    }
}

function getStrokeColor() {
    if (isDarkMode()) {
        return color(48, 54, 61); // #30363d
    } else {
        return color(225, 228, 232); // #e1e4e8
    }
}

// Apply text color for p5.js text rendering
function applyTextStyle() {
    fill(getTextColor());
    stroke(getTextColor());
}