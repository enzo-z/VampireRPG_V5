import { describe, expect, it } from 'vitest';
import type { NyLayerId, NyPoint } from '../../catalog/types.ts';
import { VIEW_BOXES } from './geometry.ts';
import {
  UNITS_PER_KM,
  factionFor,
  interpolateViewBox,
  layersForEra,
  markerLayer,
  outlinePath,
  project,
  scaleBar,
  showsLabel,
  viewBoxAttribute,
  viewScale,
  visiblePoints,
} from './mapModel.ts';

const point = (id: string, layers: NyLayerId[], lon = -74.1, lat = 40.6): NyPoint => ({
  id,
  name: id,
  label: id,
  layers,
  borough: null,
  lon,
  lat,
  approximate: false,
  labelLeft: false,
  sources: [],
  html: '',
});

describe('project', () => {
  it('maps the north-west corner to the origin', () => {
    expect(project([-74.3, 40.94])).toEqual([0, 0]);
  });

  it('puts the Plaza where the city view expects it', () => {
    const [x, y] = project([-73.9744, 40.7645]);
    expect(x).toBeCloseTo(553.5, 1);
    expect(y).toBeCloseTo(393.8, 1);
  });
});

describe('outlinePath', () => {
  it('closes each outline and skips empty ones', () => {
    expect(outlinePath([[[-74.3, 40.94], [-74.2, 40.94]], []])).toBe('M0.0 0.0L170.0 0.0Z');
  });
});

describe('markers', () => {
  const active = new Set<NyLayerId>(['pc', 'now']);

  it('use the first of their layers that is on', () => {
    expect(markerLayer(point('a', ['hist', 'now', 'pc']), active)).toBe('now');
    expect(markerLayer(point('b', ['b1999']), active)).toBeNull();
  });

  it('only show when one of their layers is on', () => {
    const shown = visiblePoints([point('a', ['pc']), point('b', ['hist'])], active);
    expect(shown.map(({ point: shownPoint, layer }) => [shownPoint.id, layer])).toEqual([['a', 'pc']]);
  });
});

describe('showsLabel', () => {
  it('hides crowded Manhattan labels in the city view only', () => {
    const plaza = { lon: -73.9744, lat: 40.7645 };
    expect(showsLabel(plaza, 'city')).toBe(false);
    expect(showsLabel(plaza, 'manhattan')).toBe(true);
  });

  it('keeps labels outside the island', () => {
    expect(showsLabel({ lon: -74.0396, lat: 40.6995 }, 'city')).toBe(true); // Ellis Island
    expect(showsLabel({ lon: -73.9935, lat: 40.6905 }, 'city')).toBe(true); // Atlantic Avenue Tunnel
  });
});

describe('scale', () => {
  it('is about 20 SVG units per kilometre', () => {
    expect(UNITS_PER_KM).toBeCloseTo(20.14, 1);
  });

  it('shrinks text and markers when zoomed in', () => {
    expect(viewScale(VIEW_BOXES.city)).toBe(1);
    expect(viewScale(VIEW_BOXES.manhattan)).toBeCloseTo(0.4475, 3);
  });

  it('shows 5 km in the city and 2 km in Manhattan', () => {
    expect(scaleBar(VIEW_BOXES.city, 'city').km).toBe(5);
    expect(scaleBar(VIEW_BOXES.manhattan, 'manhattan').km).toBe(2);
  });
});

describe('view boxes', () => {
  it('interpolate from start to end', () => {
    expect(interpolateViewBox(VIEW_BOXES.city, VIEW_BOXES.manhattan, 0)).toEqual(VIEW_BOXES.city);
    expect(interpolateViewBox(VIEW_BOXES.city, VIEW_BOXES.manhattan, 1)).toEqual(VIEW_BOXES.manhattan);
    expect(interpolateViewBox(VIEW_BOXES.city, VIEW_BOXES.manhattan, 2)).toEqual(VIEW_BOXES.manhattan);
  });

  it('format as an SVG attribute', () => {
    expect(viewBoxAttribute(VIEW_BOXES.manhattan)).toBe('372.0 112.0 380.0 452.0');
  });
});

describe('eras', () => {
  it('pick the faction of the era', () => {
    expect(factionFor({ faction: 'anarch', factionBefore: 'sabbat' }, '2021')).toBe('anarch');
    expect(factionFor({ faction: 'anarch', factionBefore: 'sabbat' }, 'before')).toBe('sabbat');
  });

  it('turn on the battle layer before 1999', () => {
    expect([...layersForEra(new Set<NyLayerId>(['now']), 'before')]).toEqual(['now', 'b1999']);
    expect([...layersForEra(new Set<NyLayerId>(['now']), '2021')]).toEqual(['now']);
  });
});
