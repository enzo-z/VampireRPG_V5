import { describe, expect, it } from 'vitest';
import { overflowPx, PRINT_HEIGHT_LIMIT_PX, PRINT_ZOOM } from './printLayout.ts';

describe('print layout', () => {
  it('matches the limits documented in CLAUDE.md (≈ 1,720 px with 10 mm margins)', () => {
    expect(PRINT_ZOOM).toBeGreaterThan(0.59);
    expect(PRINT_ZOOM).toBeLessThan(0.6086);
    expect(PRINT_HEIGHT_LIMIT_PX).toBeGreaterThanOrEqual(1715);
    expect(PRINT_HEIGHT_LIMIT_PX).toBeLessThanOrEqual(1725);
  });

  it('reports how far the content overflows the page', () => {
    expect(overflowPx(PRINT_HEIGHT_LIMIT_PX)).toBe(0);
    expect(overflowPx(PRINT_HEIGHT_LIMIT_PX + 40.2)).toBe(41);
  });
});
