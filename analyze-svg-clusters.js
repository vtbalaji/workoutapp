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

function analyzeSVGClusters(svgPath) {
  const content = fs.readFileSync(svgPath, 'utf-8');
  const pathMatches = content.matchAll(/<path[^>]*d="([^"]+)"/g);
  const paths = Array.from(pathMatches).map(match => match[1]);

  if (paths.length === 0) return null;

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

  // Create histogram buckets for X and Y
  const xBuckets = [0, 0, 0, 0]; // 4 quarters horizontally
  const yBuckets = [0, 0, 0, 0]; // 4 quarters vertically

  coords.forEach(coord => {
    // X bucket
    const xRatio = (coord.x - minX) / (maxX - minX);
    const xBucket = Math.min(3, Math.floor(xRatio * 4));
    xBuckets[xBucket]++;

    // Y bucket
    const yRatio = (coord.y - minY) / (maxY - minY);
    const yBucket = Math.min(3, Math.floor(yRatio * 4));
    yBuckets[yBucket]++;
  });

  // Detect clusters
  const xClusters = xBuckets.filter(count => count > coords.length * 0.1).length;
  const yClusters = yBuckets.filter(count => count > coords.length * 0.1).length;

  return {
    xBuckets,
    yBuckets,
    xClusters,
    yClusters,
    totalCoords: coords.length
  };
}

exercises.forEach(ex => {
  const malePath = path.join(__dirname, 'public/exercise-images', ex.slug, 'male.svg');

  if (!fs.existsSync(malePath)) {
    console.log(`\n${ex.name}: ${ex.slug} - FILE NOT FOUND`);
    return;
  }

  const analysis = analyzeSVGClusters(malePath);

  if (!analysis) {
    console.log(`\n${ex.name}: ${ex.slug} - No data`);
    return;
  }

  console.log(`\n${ex.name}: ${ex.slug}`);
  console.log(`  X buckets: [${analysis.xBuckets.map(b => b.toString().padStart(4)).join(', ')}] -> ${analysis.xClusters} clusters`);
  console.log(`  Y buckets: [${analysis.yBuckets.map(b => b.toString().padStart(4)).join(', ')}] -> ${analysis.yClusters} clusters`);
  console.log(`  Total coords: ${analysis.totalCoords}`);

  // Suggest layout
  if (analysis.xClusters >= 3) {
    console.log(`  → Detected: 3 frames HORIZONTAL`);
  } else if (analysis.xClusters === 2) {
    console.log(`  → Detected: 2 frames HORIZONTAL (left/right)`);
  } else if (analysis.yClusters >= 3) {
    console.log(`  → Detected: 3 frames VERTICAL`);
  } else if (analysis.yClusters === 2) {
    console.log(`  → Detected: 2 frames VERTICAL (top/bottom)`);
  } else {
    console.log(`  → Detected: SINGLE frame`);
  }
});
