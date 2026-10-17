import { useEffect, useRef, useState } from 'react';
import type { ViewBox } from './geometry.ts';
import { interpolateViewBox } from './mapModel.ts';

const DURATION_MS = 520;

const prefersReducedMotion = () => typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/** Eases the view box towards `target`; jumps straight there when the viewer prefers less motion. */
export function useAnimatedViewBox(target: ViewBox): ViewBox {
  const [current, setCurrent] = useState(target);
  const currentRef = useRef(target);

  useEffect(() => {
    const from = currentRef.current;
    if (prefersReducedMotion()) {
      currentRef.current = target;
      setCurrent(target);
      return undefined;
    }
    let frame = 0;
    let start: number | null = null;
    const step = (now: number) => {
      start ??= now;
      const next = interpolateViewBox(from, target, (now - start) / DURATION_MS);
      currentRef.current = next;
      setCurrent(next);
      if (now - start < DURATION_MS) frame = requestAnimationFrame(step);
    };
    frame = requestAnimationFrame(step);
    return () => cancelAnimationFrame(frame);
  }, [target]);

  return current;
}
