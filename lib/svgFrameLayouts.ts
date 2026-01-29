/**
 * SVG Frame Layout Configuration
 *
 * Defines how many animation frames each exercise has and their orientation.
 * Based on manual inspection of SVG files.
 */

export type FrameLayout = {
  frames: number; // 1, 2, or 3
  orientation: 'horizontal' | 'vertical'; // left/right or top/bottom
};

/**
 * Known exercise layouts
 * Key: exercise slug
 */
export const FRAME_LAYOUTS: Record<string, FrameLayout> = {
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

/**
 * Default layout for unknown exercises
 */
export const DEFAULT_LAYOUT: FrameLayout = {
  frames: 2,
  orientation: 'horizontal'
};

/**
 * Get frame layout for an exercise
 */
export function getFrameLayout(slug: string): FrameLayout {
  return FRAME_LAYOUTS[slug] || DEFAULT_LAYOUT;
}
