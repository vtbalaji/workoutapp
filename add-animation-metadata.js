const fs = require('fs');

// Read exercises.json
const exercises = JSON.parse(fs.readFileSync('data/exercises.json', 'utf-8'));

// Known animation configurations
const animationConfig = {
  // 2 frames - horizontal (left/right)
  'kneeling-hip-flexor-stretch': { frames: 2, orientation: 'horizontal' },
  'seal-jacks': { frames: 2, orientation: 'horizontal' },

  // 1 frame - single image
  'samson-stretch-lunge-stretch': { frames: 1, orientation: 'horizontal' },
  'neck-stretch': { frames: 1, orientation: 'horizontal' },
  'hamstring-stretch': { frames: 1, orientation: 'horizontal' },
  'kneeling-wrist-forearm-stretch': { frames: 1, orientation: 'horizontal' },

  // 2 frames - vertical (top/bottom)
  'bird-dogs': { frames: 2, orientation: 'vertical' },
  'groiners': { frames: 2, orientation: 'vertical' },

  // 3 frames - vertical (side, top, right positions)
  'hindu-judo-push-up-dive-bombers': { frames: 3, orientation: 'vertical' },

  // 3 frames - horizontal
  '180-twisting-jump-squats': { frames: 3, orientation: 'horizontal' },
};

// Add animation metadata to exercises
let updatedCount = 0;
exercises.forEach(exercise => {
  if (animationConfig[exercise.slug]) {
    exercise.animation_frames = animationConfig[exercise.slug].frames;
    exercise.animation_orientation = animationConfig[exercise.slug].orientation;
    updatedCount++;
  }
});

// Write back to file
fs.writeFileSync('data/exercises.json', JSON.stringify(exercises, null, 2));

console.log(`✅ Updated ${updatedCount} exercises with animation metadata`);
console.log(`📊 Total exercises: ${exercises.length}`);
console.log(`📝 Exercises with metadata: ${exercises.filter(e => e.animation_frames).length}`);
