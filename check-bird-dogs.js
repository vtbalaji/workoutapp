const fs = require('fs');

const content = fs.readFileSync('public/exercise-images/bird-dogs/male.svg', 'utf-8');
const pathMatches = content.matchAll(/<path[^>]*d="([^"]+)"/g);
const paths = Array.from(pathMatches).map(match => match[1]);

const coords = [];
paths.forEach(pathData => {
  const match = pathData.match(/M([\d.]+)[,\s]+([\d.]+)/);
  if (match) {
    coords.push({
      x: parseFloat(match[1]),
      y: parseFloat(match[2])
    });
  }
});

const xValues = coords.map(c => c.x).sort((a, b) => a - b);
const yValues = coords.map(c => c.y).sort((a, b) => a - b);

console.log('Bird Dogs Analysis (2 frames vertical):');
console.log(`Total paths: ${paths.length}`);
console.log(`X range: ${xValues[0].toFixed(0)} - ${xValues[xValues.length-1].toFixed(0)} (span: ${(xValues[xValues.length-1] - xValues[0]).toFixed(0)})`);
console.log(`Y range: ${yValues[0].toFixed(0)} - ${yValues[yValues.length-1].toFixed(0)} (span: ${(yValues[yValues.length-1] - yValues[0]).toFixed(0)})`);

// Split Y coords into 2 groups
const minY = yValues[0];
const maxY = yValues[yValues.length - 1];
const midY = (minY + maxY) / 2;

const topFrame = coords.filter(c => c.y < midY).length;
const bottomFrame = coords.filter(c => c.y >= midY).length;

console.log(`\nY midpoint: ${midY.toFixed(0)}`);
console.log(`Top frame (y < ${midY.toFixed(0)}): ${topFrame} paths`);
console.log(`Bottom frame (y >= ${midY.toFixed(0)}): ${bottomFrame} paths`);

// Calculate needed transform
const topCenter = yValues.filter(y => y < midY).reduce((a, b) => a + b, 0) / topFrame;
const bottomCenter = yValues.filter(y => y >= midY).reduce((a, b) => a + b, 0) / bottomFrame;
const targetCenter = (minY + maxY) / 2;

console.log(`\nCenters:`);
console.log(`  Top frame center: ${topCenter.toFixed(0)}`);
console.log(`  Bottom frame center: ${bottomCenter.toFixed(0)}`);
console.log(`  Target center: ${targetCenter.toFixed(0)}`);
console.log(`\nRequired transforms:`);
console.log(`  Top frame: translate(0, ${(targetCenter - topCenter).toFixed(0)})`);
console.log(`  Bottom frame: translate(0, ${(targetCenter - bottomCenter).toFixed(0)})`);
