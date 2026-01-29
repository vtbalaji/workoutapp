#!/bin/bash

# Helper script to add frame configuration for exercises
# Usage: ./add-frame-config.sh "exercise-slug" frames orientation
# Example: ./add-frame-config.sh "kneeling-wrist-stretch" 1 horizontal

SLUG="$1"
FRAMES="$2"
ORIENTATION="$3"

if [ -z "$SLUG" ] || [ -z "$FRAMES" ] || [ -z "$ORIENTATION" ]; then
  echo "Usage: ./add-frame-config.sh <slug> <frames> <orientation>"
  echo "  slug: exercise slug (e.g., 'kneeling-wrist-stretch')"
  echo "  frames: 1, 2, or 3"
  echo "  orientation: horizontal or vertical"
  echo ""
  echo "Example: ./add-frame-config.sh 'kneeling-wrist-stretch' 1 horizontal"
  exit 1
fi

CONFIG_FILE="lib/svgFrameLayouts.ts"

# Check if already exists
if grep -q "'$SLUG'" "$CONFIG_FILE"; then
  echo "⚠️  '$SLUG' already exists in config. Skipping."
  exit 0
fi

# Determine which section to add to
SECTION=""
if [ "$FRAMES" = "1" ]; then
  SECTION="  // 1 frame - single image"
  INSERT_AFTER="'hamstring-stretch': { frames: 1, orientation: 'horizontal' },"
elif [ "$FRAMES" = "2" ] && [ "$ORIENTATION" = "horizontal" ]; then
  SECTION="  // 2 frames - horizontal (left/right)"
  INSERT_AFTER="'seal-jacks': { frames: 2, orientation: 'horizontal' },"
elif [ "$FRAMES" = "2" ] && [ "$ORIENTATION" = "vertical" ]; then
  SECTION="  // 2 frames - vertical (top/bottom)"
  INSERT_AFTER="'groiners': { frames: 2, orientation: 'vertical' },"
elif [ "$FRAMES" = "3" ] && [ "$ORIENTATION" = "horizontal" ]; then
  SECTION="  // 3 frames - horizontal"
  INSERT_AFTER="'180-twisting-jump-squats': { frames: 3, orientation: 'horizontal' },"
elif [ "$FRAMES" = "3" ] && [ "$ORIENTATION" = "vertical" ]; then
  SECTION="  // 3 frames - vertical (side, top, right positions)"
  INSERT_AFTER="'hindu-judo-push-up-dive-bombers': { frames: 3, orientation: 'vertical' },"
fi

NEW_LINE="  '$SLUG': { frames: $FRAMES, orientation: '$ORIENTATION' },"

# Add to config file
sed -i.bak "/$INSERT_AFTER/a\\
$NEW_LINE
" "$CONFIG_FILE"

echo "✅ Added '$SLUG' to $CONFIG_FILE"
echo "   Frames: $FRAMES, Orientation: $ORIENTATION"
