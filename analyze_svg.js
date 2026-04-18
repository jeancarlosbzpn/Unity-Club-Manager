
const fs = require('fs');
const path = require('path');

const svgPath = '/Users/jeancarlosbaez/Desktop/Vencedores/src/assets/Carnet/trasero.svg';
const svgContent = fs.readFileSync(svgPath, 'utf8');

// Helper to convert SVG units to mm (based on viewBox 0 0 155.91 240.94 -> 55mm x 85mm)
const scale = 55 / 155.91;

console.log(`Scale factor: ${scale} mm/unit`);

// Regex to find "d" attributes in paths
const pathRegex = /<path[^>]*d="([^"]+)"/g;
let match;

const yCoords = [];

while ((match = pathRegex.exec(svgContent)) !== null) {
    const d = match[1];
    // Simple heuristic: find all Y coordinates in the path data
    // Look for numbers after M, L, H, V, or just floating numbers
    // This is a rough approximation, scanning for all numbers resembling Y values
    const numbers = d.match(/-?\d+(\.\d+)?/g);
    if (numbers) {
        for (let i = 1; i < numbers.length; i += 2) { // crude, assume x,y pairs
            const y = parseFloat(numbers[i]);
            if (!isNaN(y) && y > 0 && y < 250) {
                yCoords.push(y);
            }
        }
    }
}

// Cluster Y coordinates to find horizontal lines
const clusters = {};
yCoords.forEach(y => {
    const mm = y * scale;
    const key = Math.round(mm); // round to nearest mm
    if (!clusters[key]) clusters[key] = 0;
    clusters[key]++;
});

console.log("\n--- Y-Coordinate Clusters (mm) ---");
Object.keys(clusters)
    .sort((a, b) => Number(a) - Number(b))
    .forEach(key => {
        if (clusters[key] > 10) { // filter noise
            console.log(`Y ~ ${key}mm: ${clusters[key]} points`);
        }
    });
