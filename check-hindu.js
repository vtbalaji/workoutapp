const fs = require('fs');

const content = fs.readFileSync('public/exercise-images/hindu-judo-push-up-dive-bombers/male.svg', 'utf-8');
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

console.log('Hindu Push-up Analysis:');
console.log(`Total paths: ${paths.length}`);
console.log(`X range: ${xValues[0].toFixed(0)} - ${xValues[xValues.length-1].toFixed(0)} (${(xValues[xValues.length-1] - xValues[0]).toFixed(0)})`);
console.log(`Y range: ${yValues[0].toFixed(0)} - ${yValues[yValues.length-1].toFixed(0)} (${(yValues[yValues.length-1] - yValues[0]).toFixed(0)})`);

// Create 10 buckets for X and Y to see distribution
const xBuckets = new Array(10).fill(0);
const yBuckets = new Array(10).fill(0);

const minX = xValues[0];
const maxX = xValues[xValues.length - 1];
const minY = yValues[0];
const maxY = yValues[yValues.length - 1];

coords.forEach(c => {
  const xBucket = Math.min(9, Math.floor(((c.x - minX) / (maxX - minX)) * 10));
  const yBucket = Math.min(9, Math.floor(((c.y - minY) / (maxY - minY)) * 10));
  xBuckets[xBucket]++;
  yBuckets[yBucket]++;
});

console.log('\nX distribution (10 buckets):');
xBuckets.forEach((count, i) => {
  const bar = '█'.repeat(Math.ceil(count / 10));
  console.log(`  ${i}: ${bar} ${count}`);
});

console.log('\nY distribution (10 buckets):');
yBuckets.forEach((count, i) => {
  const bar = '█'.repeat(Math.ceil(count / 10));
  console.log(`  ${i}: ${bar} ${count}`);
});
