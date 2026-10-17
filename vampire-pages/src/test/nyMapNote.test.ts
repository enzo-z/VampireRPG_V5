import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import { buildNyMap } from '../../vite/buildNyMap.ts';
import { BOROUGH_SHAPES, EDGE_PLACES } from '../features/map/geometry.ts';

// Contract between the map note ("Narrador/Nova York/Mapa de Nova York.md") and the app's map.
const NOTE = fileURLToPath(new URL('../../../Narrador/Nova York/Mapa de Nova York.md', import.meta.url));
const build = buildNyMap(NOTE);

describe('Mapa de Nova York note', () => {
  it('builds without errors or warnings', () => {
    expect(build.errors).toEqual([]);
    expect(build.warnings).toEqual([]);
    expect(build.data).not.toBeNull();
  });

  it('has all five boroughs and New Jersey', () => {
    expect(build.data?.boroughs.map((borough) => borough.id)).toEqual(['manhattan', 'brooklyn', 'queens', 'bronx', 'staten', 'nj']);
  });

  it('keeps the points of the 17/10 revision', () => {
    const ids = build.data?.points.map((point) => point.id) ?? [];
    expect(ids).toEqual(expect.arrayContaining(['plaza', 'washheights', 'portrichmond', 'arthole', 'portmorris']));
    expect(ids).not.toContain('odessa');
  });

  it('has an outline for every borough and a place for every edge arrow', () => {
    for (const borough of build.data?.boroughs ?? []) expect(BOROUGH_SHAPES[borough.id], borough.id).toBeDefined();
    expect(Object.keys(EDGE_PLACES).sort()).toEqual((build.data?.edges.map((edge) => edge.id) ?? []).sort());
  });

  it('leaves out names outside Elenco de Nova York', () => {
    const text = JSON.stringify(build.data);
    for (const name of ['Addison Payne', 'Kutkha', 'Robert Larson', 'Kaiser', 'Donatello']) expect(text, name).not.toContain(name);
  });
});
