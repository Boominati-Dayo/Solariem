'use client';

import { useSyncExternalStore } from 'react';

/**
 * Subscribe to `prefers-reduced-motion`.
 *
 * This is an external system, so it is subscribed to rather than sampled into
 * component state from inside an effect. Sampling it in an effect and calling
 * setState from there is the cascading render `useSyncExternalStore` exists to
 * avoid, and it also gets the live-update case free: a reader who switches
 * reduced motion on mid-page gets the effect torn down without a reload.
 *
 * Shared by ScrollProgress and Parallax, which both gate a scroll-driven effect
 * on it. It was duplicated between them once already, which is how the two
 * copies drifted.
 */
const REDUCED_MOTION = '(prefers-reduced-motion: reduce)';

export { REDUCED_MOTION };

function subscribeReducedMotion(onChange: () => void) {
  const mq = window.matchMedia(REDUCED_MOTION);
  mq.addEventListener('change', onChange);
  return () => mq.removeEventListener('change', onChange);
}

/** Server render assumes motion is wanted; the client corrects it on hydrate. */
const reducedMotionServer = () => false;
const reducedMotionClient = () => window.matchMedia(REDUCED_MOTION).matches;

export default function usePrefersReducedMotion(): boolean {
  return useSyncExternalStore(subscribeReducedMotion, reducedMotionClient, reducedMotionServer);
}
