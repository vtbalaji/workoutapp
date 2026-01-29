const fs = require('fs');
const path = require('path');

const exercises = [
  { name: "2 left/right", slug: "kneeling-hip-flexor-stretch" },
  { name: "2 left/right", slug: "seal-jacks" },
  { name: "1 image", slug: "samson-stretch-lunge-stretch" },
  { name: "1 image", slug: "neck-stretch" },
  { name: "1 image", slug: "hamstring-stretch" },
  { name: "2 top/bottom", slug: "bird-dogs" },
  { name: "2 top/bottom", slug: "groiners" },
  { name: "3 images", slug: "hindu-judo-push-up-dive-bombers" },
  { name: "3 images", slug: "180-twisting-jump-squats" },
];

function analyzeSVG(svgPath) {
  const content = fs.readFileSync(svgPath, 'utf-8');

  // Extract all path elements
  const pathMatches = content.matchAll(/<path[^>]*d="([^"]+)"/g);
  const paths = Array.from(pathMatches).map(match => match[1]);

  if (paths.length === 0) return null;

  // Extract M (moveto) commands to get starting coordinates
  const coords = [];
  paths.forEach(pathData => {
    const moveCommands = pathData.matchAll(/M([\d.]+)[,\s]+([\d.]+)/g);
    for (const match of moveCommands) {
      coords.push({
        x: parseFloat(match[1]),
        y: parseFloat(match[2])
      });
    }
  });

  if (coords.length === 0) return null;

  const xValues = coords.map(c => c.x);
  const yValues = coords.map(c => c.y);

  const minX = Math.min(...xValues);
  const maxX = Math.max(...xValues);
  const minY = Math.min(...yValues);
  const maxY = Math.max(...yValues);

  const rangeX = maxX - minX;
  const rangeY = maxY - minY;

  return {
    minX, maxX, minY, maxY,
    rangeX, rangeY,
    aspectRatio: rangeX / rangeY,
    totalPaths: paths.length
  };
}

exercises.forEach(ex => {
  const malePath = path.join(__dirname, 'public/exercise-images', ex.slug, 'male.svg');

  if (!fs.existsSync(malePath)) {
    console.log(`\n${ex.name}: ${ex.slug}`);
    console.log(`  FILE NOT FOUND: ${malePath}`);
    return;
  }

  const analysis = analyzeSVG(malePath);

  if (!analysis) {
    console.log(`\n${ex.name}: ${ex.slug}`);
    console.log(`  No paths found`);
    return;
  }

  console.log(`\n${ex.name}: ${ex.slug}`);
  console.log(`  X: ${analysis.minX.toFixed(0)} - ${analysis.maxX.toFixed(0)} (range: ${analysis.rangeX.toFixed(0)})`);
  console.log(`  Y: ${analysis.minY.toFixed(0)} - ${analysis.maxY.toFixed(0)} (range: ${analysis.rangeY.toFixed(0)})`);
  console.log(`  Aspect: ${analysis.aspectRatio.toFixed(2)} (${analysis.aspectRatio > 1 ? 'wider' : 'taller'})`);
  console.log(`  Paths: ${analysis.totalPaths}`);
});
