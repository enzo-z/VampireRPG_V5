import type { NyBoroughId } from '../../catalog/types.ts';

// Outlines and fixed layout of the New York map. Content (factions, texts, points)
// comes from the note; this file only holds shapes, which rarely change.
// Coordinates are [longitude, latitude]; outlines are simplified by hand.

export type LonLat = readonly [number, number];

/** Map canvas in SVG units (city view). */
export const MAP_WIDTH = 1088;
export const MAP_HEIGHT = 1010;

/** Projection origin and scale: x = (lon - WEST) · X_SCALE, y = (NORTH - lat) · Y_SCALE. */
export const WEST = -74.3;
export const NORTH = 40.94;
export const X_SCALE = 1700;
export const Y_SCALE = 2244;

export interface BoroughShape {
  outline: readonly LonLat[];
  /** Separate pieces (e.g. the Rockaway peninsula). */
  extra: readonly (readonly LonLat[])[];
  label: LonLat;
  /** Degrees; Manhattan's label follows the island. */
  labelRotation: number;
  /** Font size in SVG units at the city view. */
  labelSize: number;
}

export const BOROUGH_SHAPES: Readonly<Record<NyBoroughId, BoroughShape>> = {
  manhattan: {
    label: [-73.967, 40.792],
    labelRotation: -68,
    labelSize: 15,
    extra: [],
    outline: [[-74.017, 40.701], [-74.014, 40.712], [-74.012, 40.728], [-74.01, 40.742], [-74.006, 40.755], [-73.996, 40.77], [-73.986, 40.788], [-73.972, 40.808], [-73.96, 40.828], [-73.949, 40.848], [-73.936, 40.866], [-73.925, 40.878], [-73.912, 40.875], [-73.92, 40.86], [-73.928, 40.845], [-73.933, 40.83], [-73.935, 40.815], [-73.934, 40.8], [-73.937, 40.79], [-73.943, 40.777], [-73.958, 40.76], [-73.968, 40.746], [-73.972, 40.735], [-73.973, 40.722], [-73.977, 40.711], [-73.995, 40.707], [-74.007, 40.702]],
  },
  brooklyn: {
    label: [-73.945, 40.646],
    labelRotation: 0,
    labelSize: 19,
    extra: [],
    outline: [[-73.962, 40.737], [-73.963, 40.725], [-73.968, 40.712], [-73.985, 40.704], [-73.998, 40.699], [-74.006, 40.69], [-74.019, 40.678], [-74.016, 40.668], [-74.022, 40.655], [-74.033, 40.64], [-74.042, 40.625], [-74.037, 40.608], [-74.02, 40.6], [-74.002, 40.592], [-73.992, 40.576], [-73.96, 40.574], [-73.938, 40.578], [-73.918, 40.585], [-73.898, 40.6], [-73.88, 40.62], [-73.868, 40.64], [-73.858, 40.656], [-73.866, 40.68], [-73.89, 40.69], [-73.902, 40.7], [-73.92, 40.711], [-73.936, 40.725], [-73.95, 40.735]],
  },
  queens: {
    label: [-73.8, 40.722],
    labelRotation: 0,
    labelSize: 19,
    extra: [[[-73.745, 40.607], [-73.8, 40.597], [-73.88, 40.576], [-73.94, 40.561], [-73.936, 40.551], [-73.88, 40.564], [-73.8, 40.583], [-73.745, 40.593]]],
    outline: [[-73.962, 40.74], [-73.95, 40.757], [-73.94, 40.772], [-73.93, 40.781], [-73.912, 40.786], [-73.89, 40.78], [-73.87, 40.776], [-73.85, 40.79], [-73.832, 40.796], [-73.81, 40.79], [-73.79, 40.796], [-73.773, 40.793], [-73.756, 40.775], [-73.73, 40.77], [-73.7, 40.76], [-73.705, 40.73], [-73.725, 40.68], [-73.74, 40.65], [-73.752, 40.636], [-73.78, 40.628], [-73.82, 40.645], [-73.85, 40.655], [-73.858, 40.656], [-73.866, 40.68], [-73.89, 40.69], [-73.902, 40.7], [-73.92, 40.711], [-73.936, 40.725], [-73.95, 40.735]],
  },
  bronx: {
    label: [-73.862, 40.856],
    labelRotation: 0,
    labelSize: 19,
    extra: [],
    outline: [[-73.928, 40.884], [-73.918, 40.897], [-73.912, 40.915], [-73.865, 40.905], [-73.84, 40.91], [-73.81, 40.89], [-73.785, 40.875], [-73.78, 40.86], [-73.79, 40.84], [-73.795, 40.815], [-73.805, 40.805], [-73.83, 40.812], [-73.855, 40.808], [-73.87, 40.8], [-73.885, 40.806], [-73.897, 40.8], [-73.912, 40.797], [-73.926, 40.805], [-73.929, 40.815], [-73.927, 40.83], [-73.922, 40.845], [-73.913, 40.86], [-73.905, 40.873], [-73.912, 40.882]],
  },
  staten: {
    label: [-74.145, 40.584],
    labelRotation: 0,
    labelSize: 19,
    extra: [],
    outline: [[-74.072, 40.645], [-74.1, 40.646], [-74.13, 40.643], [-74.16, 40.644], [-74.185, 40.638], [-74.195, 40.615], [-74.2, 40.59], [-74.215, 40.56], [-74.235, 40.53], [-74.25, 40.505], [-74.232, 40.498], [-74.2, 40.512], [-74.16, 40.533], [-74.13, 40.548], [-74.1, 40.563], [-74.08, 40.583], [-74.06, 40.6], [-74.058, 40.622]],
  },
  nj: {
    label: [-74.175, 40.8],
    labelRotation: 0,
    labelSize: 17,
    extra: [],
    outline: [[-74.4, 41.0], [-73.925, 41.0], [-73.93, 40.915], [-73.945, 40.88], [-73.962, 40.85], [-73.978, 40.825], [-73.995, 40.8], [-74.01, 40.775], [-74.02, 40.757], [-74.027, 40.74], [-74.033, 40.72], [-74.045, 40.705], [-74.055, 40.69], [-74.065, 40.67], [-74.075, 40.655], [-74.09, 40.651], [-74.13, 40.651], [-74.16, 40.653], [-74.2, 40.645], [-74.21, 40.62], [-74.218, 40.59], [-74.233, 40.56], [-74.253, 40.53], [-74.268, 40.505], [-74.25, 40.4], [-74.4, 40.4]],
  },
};

/** Land outside the map's subject, drawn grey (Westchester, Nassau, small islands). */
export const CONTEXT_LAND: readonly { name: string | null; label: LonLat | null; outline: readonly LonLat[] }[] = [
  { name: 'Westchester', label: [-73.8, 40.93], outline: [[-73.9, 41.0], [-73.91, 40.917], [-73.865, 40.905], [-73.84, 40.91], [-73.81, 40.89], [-73.785, 40.875], [-73.76, 40.887], [-73.7, 40.915], [-73.6, 40.95], [-73.6, 41.0]] },
  { name: 'Nassau', label: [-73.668, 40.705], outline: [[-73.7, 40.76], [-73.705, 40.73], [-73.725, 40.68], [-73.74, 40.65], [-73.755, 40.627], [-73.742, 40.61], [-73.736, 40.596], [-73.6, 40.58], [-73.6, 40.85], [-73.7, 40.81], [-73.724, 40.786]] },
  { name: null, label: null, outline: [[-74.02, 40.693], [-74.012, 40.692], [-74.015, 40.686], [-74.024, 40.688]] },
  { name: null, label: null, outline: [[-73.946, 40.77], [-73.941, 40.771], [-73.956, 40.751], [-73.96, 40.752]] },
];

export const WATER_LABELS: readonly { name: string; at: LonLat; rotation: number; size: number }[] = [
  { name: 'Rio Hudson', at: [-74.0045, 40.832], rotation: -64, size: 11 },
  { name: 'East River', at: [-73.9605, 40.722], rotation: -62, size: 8 },
  { name: 'Upper Bay', at: [-74.052, 40.668], rotation: 0, size: 13 },
  { name: 'Lower Bay', at: [-74.03, 40.545], rotation: 0, size: 14 },
  { name: 'Long Island Sound', at: [-73.735, 40.835], rotation: 0, size: 13 },
  { name: 'Jamaica Bay', at: [-73.835, 40.612], rotation: 0, size: 12 },
  { name: 'Oceano Atlântico', at: [-73.86, 40.515], rotation: 0, size: 16 },
];

/** Where each edge arrow ("Fora do mapa") is drawn, in SVG units of the city view. */
export const EDGE_PLACES: Readonly<Record<string, { x: number; y: number; anchor: 'start' | 'middle' | 'end' }>> = {
  catskills: { x: 210, y: 24, anchor: 'middle' },
  westhampton: { x: 1078, y: 560, anchor: 'end' },
  atlanticcity: { x: 120, y: 996, anchor: 'middle' },
};

export type MapZoom = 'city' | 'manhattan';

export interface ViewBox {
  x: number;
  y: number;
  width: number;
  height: number;
}

export const VIEW_BOXES: Readonly<Record<MapZoom, ViewBox>> = {
  city: { x: 0, y: 0, width: MAP_WIDTH, height: MAP_HEIGHT },
  manhattan: { x: 372, y: 112, width: 380, height: 452 },
};

/** Points inside this box are too crowded for labels in the city view. */
export const MANHATTAN_LABEL_BOX = { west: -74.025, east: -73.93, south: 40.7, north: 40.88 } as const;
