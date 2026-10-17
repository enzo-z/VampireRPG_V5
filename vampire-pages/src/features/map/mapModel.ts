import type { NyFactionKey, NyLayerId, NyPoint } from '../../catalog/types.ts';
import { MANHATTAN_LABEL_BOX, MAP_HEIGHT, NORTH, WEST, X_SCALE, Y_SCALE, type LonLat, type MapZoom, type ViewBox } from './geometry.ts';

// Pure helpers behind the New York map: projection, which points show, labels, scale.

export type MapEra = '2021' | 'before';

/** [lon, lat] → [x, y] in SVG units. */
export function project([lon, lat]: LonLat): [number, number] {
  return [(lon - WEST) * X_SCALE, (NORTH - lat) * Y_SCALE];
}

/** SVG path for one or more closed outlines. */
export function outlinePath(outlines: readonly (readonly LonLat[])[]): string {
  return outlines
    .filter((outline) => outline.length > 0)
    .map(
      (outline) =>
        outline
          .map((point, index) => {
            const [x, y] = project(point);
            return `${index === 0 ? 'M' : 'L'}${x.toFixed(1)} ${y.toFixed(1)}`;
          })
          .join('') + 'Z',
    )
    .join('');
}

/** 1 at the city view; smaller when zoomed in, so text and markers keep their screen size. */
export function viewScale(viewBox: ViewBox): number {
  return viewBox.height / MAP_HEIGHT;
}

/** The first active layer of a point sets its symbol; null when none of its layers is on. */
export function markerLayer(point: Pick<NyPoint, 'layers'>, active: ReadonlySet<NyLayerId>): NyLayerId | null {
  return point.layers.find((layer) => active.has(layer)) ?? null;
}

export function visiblePoints(points: readonly NyPoint[], active: ReadonlySet<NyLayerId>): { point: NyPoint; layer: NyLayerId }[] {
  return points.flatMap((point) => {
    const layer = markerLayer(point, active);
    return layer === null ? [] : [{ point, layer }];
  });
}

/** Points in crowded Manhattan only get a label in the Manhattan view. */
export function showsLabel(point: Pick<NyPoint, 'lon' | 'lat'>, zoom: MapZoom): boolean {
  if (zoom === 'manhattan') return true;
  const { west, east, south, north } = MANHATTAN_LABEL_BOX;
  return !(point.lon >= west && point.lon <= east && point.lat >= south && point.lat <= north);
}

/** SVG units per kilometre, at New York's latitude. */
export const UNITS_PER_KM = X_SCALE / (111.32 * Math.cos((40.7 * Math.PI) / 180));

export interface ScaleBar {
  km: number;
  x: number;
  y: number;
  segment: number;
  height: number;
}

/** A bar of 5 km in the city view and 2 km in the Manhattan view, near the bottom-left corner. */
export function scaleBar(viewBox: ViewBox, zoom: MapZoom): ScaleBar {
  const scale = viewScale(viewBox);
  return {
    km: zoom === 'city' ? 5 : 2,
    x: viewBox.x + viewBox.width * 0.04,
    y: viewBox.y + viewBox.height * 0.955,
    segment: UNITS_PER_KM,
    height: 5 * scale,
  };
}

/** Ease-in-out between two view boxes; t from 0 to 1. */
export function interpolateViewBox(from: ViewBox, to: ViewBox, t: number): ViewBox {
  const clamped = Math.min(1, Math.max(0, t));
  const eased = clamped < 0.5 ? 2 * clamped * clamped : 1 - (-2 * clamped + 2) ** 2 / 2;
  const mix = (a: number, b: number) => a + (b - a) * eased;
  return { x: mix(from.x, to.x), y: mix(from.y, to.y), width: mix(from.width, to.width), height: mix(from.height, to.height) };
}

export function viewBoxAttribute({ x, y, width, height }: ViewBox): string {
  return [x, y, width, height].map((value) => value.toFixed(1)).join(' ');
}

export function factionFor(borough: { faction: NyFactionKey; factionBefore: NyFactionKey }, era: MapEra): NyFactionKey {
  return era === '2021' ? borough.faction : borough.factionBefore;
}

/** Layers on when the map opens; "Antes de 1999" also turns on the battle layer. */
export const DEFAULT_LAYERS: readonly NyLayerId[] = ['now', 'pc', 'auld'];

export function layersForEra(active: ReadonlySet<NyLayerId>, era: MapEra): Set<NyLayerId> {
  const next = new Set(active);
  if (era === 'before') next.add('b1999');
  return next;
}
