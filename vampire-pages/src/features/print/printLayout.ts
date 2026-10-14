// Print geometry (vampire-pages/CLAUDE.md, "Impressão (A)").
// The sheet is laid out at the prototype width and zoomed down to the A4
// printable width, so the height limit is expressed in layout pixels.

const CSS_PX_PER_MM = 96 / 25.4;
const A4_WIDTH_MM = 210;
const A4_HEIGHT_MM = 297;
export const PAGE_MARGIN_MM = 10;

/** Layout width of the print sheet (prototype A). */
export const PRINT_LAYOUT_WIDTH_PX = 1180;

const PRINTABLE_WIDTH_PX = (A4_WIDTH_MM - 2 * PAGE_MARGIN_MM) * CSS_PX_PER_MM;
const PRINTABLE_HEIGHT_PX = (A4_HEIGHT_MM - 2 * PAGE_MARGIN_MM) * CSS_PX_PER_MM;

/** Keeps the right-most dots off the clipping edge after rounding. */
const EDGE_SAFETY_PX = 8;

/** Zoom applied when printing: layout width → A4 printable width, minus a small safety margin (≈ 0.6018). */
export const PRINT_ZOOM = (PRINTABLE_WIDTH_PX - EDGE_SAFETY_PX) / PRINT_LAYOUT_WIDTH_PX;

/** Tallest layout that fits one A4 page with 10 mm margins (≈ 1,720 px); conservative, ignores the safety margin. */
export const PRINT_HEIGHT_LIMIT_PX = Math.floor((PRINTABLE_HEIGHT_PX * PRINT_LAYOUT_WIDTH_PX) / PRINTABLE_WIDTH_PX);

export function overflowPx(contentHeightPx: number): number {
  return Math.max(0, Math.ceil(contentHeightPx - PRINT_HEIGHT_LIMIT_PX));
}
