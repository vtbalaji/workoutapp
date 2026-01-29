const fs = require('fs');
const path = require('path');

const exercises = [
  { name: "2 left/right", slug: "kneeling-hip-flexor-stretch" },
  { name: "2 left/right", slug: "seal-jacks" },
  { name: "1 image", slug: "samson-stretch-lunge-stretch" },
  { name: "1 image", slug: "neck-stretch" },
  { name: "2 top/bottom", slug: "bird-dogs" },
  { name: "2 top/bottom", slug: "groiners" },
  { name: "3 images", slug: "hindu-judo-push-up-dive-bombers" },
  { name: "3 images", slug: "180-twisting-jump-squats" },
];

function analyzeSVGDensity(svgPath) {
  const content = fs.readFileSync(svgPath, 'utf-8');
  const pathMatches = content.matchAll(/<path[^>]*d="([^"]+)"/g);
  const paths = Array.from(pathMatches).map(match => match[1]);

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

  const xValues = coords.map(c => c.x).sort((a, b) => a - b);
  const yValues = coords.map(c => c.y).sort((a, b) => a - b);

  // Find gaps in X and Y distributions
  function findGaps(values, minGapSize) {
    const gaps = [];
    for (let i = 1; i < values.length; i++) {
      const gap = values[i] - values[i-1];
      if (gap > minGapSize) {
        gaps.push({ position: (values[i] + values[i-1]) / 2, size: gap });
      }
    }
    return gaps.sort((a, b) => b.size - a.size); // Sort by size descending
  }

  const xRange = xValues[xValues.length - 1] - xValues[0];
  const yRange = yValues[yValues.length - 1] - yValues[0];

  const xGaps = findGaps(xValues, xRange * 0.05); // 5% gap threshold
  const yGaps = findGaps(yValues, yRange * 0.05);

  return {
    xRange,
    yRange,
    xGaps: xGaps.slice(0, 3), // Top 3 gaps
    yGaps: yGaps.slice(0, 3),
    minX: xValues[0],
    maxX: xValues[xValues.length - 1],
    minY: yValues[0],
    maxY: yValues[yValues.length - 1]
  };
}

exercises.forEach(ex => {
  const malePath = path.join(__dirname, 'public/exercise-images', ex.slug, 'male.svg');

  if (!fs.existsSync(malePath)) {
    console.log(`\n${ex.name}: ${ex.slug} - FILE NOT FOUND`);
    return;
  }

  const analysis = analyzeSVGDensity(malePath);

  if (!analysis) {
    console.log(`\n${ex.name}: ${ex.slug} - No data`);
    return;
  }

  console.log(`\n${ex.name}: ${ex.slug}`);
  console.log(`  Range: X=${analysis.xRange.toFixed(0)}, Y=${analysis.yRange.toFixed(0)}`);
  console.log(`  Top X gaps: ${analysis.xGaps.map(g => `${g.size.toFixed(0)} @${g.position.toFixed(0)}`).join(', ')}`);
  console.log(`  Top Y gaps: ${analysis.yGaps.map(g => `${g.size.toFixed(0)} @${g.position.toFixed(0)}`).join(', ')}`);

  // Determine layout based on gaps
  const significantXGaps = analysis.xGaps.filter(g => g.size > analysis.xRange * 0.1).length;
  const significantYGaps = analysis.yGaps.filter(g => g.size > analysis.yRange * 0.1).length;

  if (significantXGaps >= 2) {
    console.log(`  → AUTO-DETECT: 3 frames HORIZONTAL`);
  } else if (significantXGaps === 1) {
    console.log(`  → AUTO-DETECT: 2 frames HORIZONTAL (left/right)`);
  } else if (significantYGaps >= 2) {
    console.log(`  → AUTO-DETECT: 3 frames VERTICAL`);
  } else if (significantYGaps === 1) {
    console.log(`  → AUTO-DETECT: 2 frames VERTICAL (top/bottom)`);
  } else {
    console.log(`  → AUTO-DETECT: SINGLE frame`);
  }
});
