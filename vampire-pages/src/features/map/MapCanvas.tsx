import { useId, type KeyboardEvent, type ReactNode } from 'react';
import type { NyFactionKey, NyLayerId, NyMapCatalog } from '../../catalog/types.ts';
import { BOROUGH_SHAPES, CONTEXT_LAND, EDGE_PLACES, MAP_HEIGHT, MAP_WIDTH, WATER_LABELS, type MapZoom, type ViewBox } from './geometry.ts';
import {
  factionFor,
  isSelected,
  outlinePath,
  project,
  scaleBar,
  showsLabel,
  viewBoxAttribute,
  viewScale,
  visiblePoints,
  type MapEra,
  type MapSelection,
} from './mapModel.ts';
import styles from './MapView.module.css';

interface MapCanvasProps {
  map: NyMapCatalog;
  era: MapEra;
  zoom: MapZoom;
  viewBox: ViewBox;
  layers: ReadonlySet<NyLayerId>;
  selection: MapSelection;
  onSelect: (selection: MapSelection) => void;
}

/** Hatched factions use an SVG pattern; solid ones a CSS fill. */
const PATTERNED: ReadonlySet<NyFactionKey> = new Set(['camSoft', 'anarchSoft', 'indep', 'sabbat', 'unk']);

const SOLID_CLASS: Partial<Record<NyFactionKey, string | undefined>> = {
  cam: styles.fillCam,
  anarch: styles.fillAnarch,
};

function activate(handler: () => void) {
  return (event: KeyboardEvent) => {
    if (event.key !== 'Enter' && event.key !== ' ') return;
    event.preventDefault();
    handler();
  };
}

/** The symbol of a point, by its first active layer. */
export function MarkerSymbol({ layer, r }: { layer: NyLayerId; r: number }): ReactNode {
  switch (layer) {
    case 'b1999': {
      const d = r * 1.35;
      return <path d={`M0 ${-d}L${d} 0L0 ${d}L${-d} 0Z`} className={styles.markerBattle} strokeWidth={r * 0.5} />;
    }
    case 'pc':
      return <rect x={-r} y={-r} width={r * 2} height={r * 2} className={styles.markerCoterie} strokeWidth={r * 0.38} />;
    case 'auld':
      return (
        <>
          <circle r={r * 1.15} className={styles.markerOneShot} strokeWidth={r * 0.45} />
          <circle r={r * 0.42} className={styles.markerOneShotDot} />
        </>
      );
    case 'hist':
      return <circle r={r * 0.95} className={styles.markerHistory} strokeWidth={r * 0.4} />;
    case 'now':
      return <circle r={r} className={styles.markerNow} strokeWidth={r * 0.38} />;
  }
}

export function MapCanvas({ map, era, zoom, viewBox, layers, selection, onSelect }: MapCanvasProps) {
  const patternPrefix = `ny${useId().replace(/[^a-zA-Z0-9]/g, '')}`;
  const pattern = (key: NyFactionKey) => `url(#${patternPrefix}-${key})`;
  const scale = viewScale(viewBox);
  const textScale = Math.max(scale, 0.55);
  const markerRadius = 5.2 * Math.max(scale, 0.42);
  const bar = scaleBar(viewBox, zoom);
  const north = { x: viewBox.x + viewBox.width * 0.95, y: viewBox.y + viewBox.height * 0.06 };

  return (
    <svg
      className={styles.canvas}
      viewBox={viewBoxAttribute(viewBox)}
      role="group"
      aria-label="Mapa de Nova York com o território de cada facção"
    >
      <defs>
        <pattern id={`${patternPrefix}-camSoft`} width="9" height="9" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
          <rect width="9" height="9" className={styles.hatchCamGround} />
          <line x1="0" y1="0" x2="0" y2="9" className={styles.hatchCamLine} />
        </pattern>
        <pattern id={`${patternPrefix}-anarchSoft`} width="9" height="9" patternUnits="userSpaceOnUse" patternTransform="rotate(-45)">
          <rect width="9" height="9" className={styles.hatchAnarchGround} />
          <line x1="0" y1="0" x2="0" y2="9" className={styles.hatchAnarchLine} />
        </pattern>
        <pattern id={`${patternPrefix}-indep`} width="7" height="7" patternUnits="userSpaceOnUse">
          <rect width="7" height="7" className={styles.hatchIndepGround} />
          <line x1="0" y1="0" x2="7" y2="0" className={styles.hatchIndepLine} />
        </pattern>
        <pattern id={`${patternPrefix}-sabbat`} width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
          <rect width="6" height="6" className={styles.hatchSabbatGround} />
          <line x1="0" y1="0" x2="0" y2="6" className={styles.hatchSabbatLine} />
        </pattern>
        <pattern id={`${patternPrefix}-unk`} width="8" height="8" patternUnits="userSpaceOnUse">
          <rect width="8" height="8" className={styles.dotsGround} />
          <circle cx="4" cy="4" r="1" className={styles.dotsDot} />
        </pattern>
      </defs>

      <rect x={-400} y={-400} width={MAP_WIDTH + 800} height={MAP_HEIGHT + 800} className={styles.water} />

      {CONTEXT_LAND.map((land, index) => (
        <path key={land.name ?? index} d={outlinePath([land.outline])} className={`${styles.land} ${styles.coast}`} />
      ))}

      {map.boroughs.map((borough) => {
        const shape = BOROUGH_SHAPES[borough.id];
        const faction = factionFor(borough, era);
        const select = () => onSelect({ kind: 'borough', id: borough.id });
        return (
          <g
            key={borough.id}
            className={`${styles.borough} ${isSelected(selection, 'borough', borough.id) ? styles.boroughSelected : ''}`}
            role="button"
            tabIndex={0}
            aria-label={borough.name}
            aria-pressed={isSelected(selection, 'borough', borough.id)}
            onClick={select}
            onKeyDown={activate(select)}
          >
            <path
              d={outlinePath([shape.outline, ...shape.extra])}
              className={`${styles.coast} ${SOLID_CLASS[faction] ?? ''}`}
              fill={PATTERNED.has(faction) ? pattern(faction) : undefined}
            />
            <title>{borough.name}</title>
          </g>
        );
      })}

      <g aria-hidden="true">
        {WATER_LABELS.map((water) => {
          const [x, y] = project(water.at);
          return (
            <text
              key={water.name}
              x={x}
              y={y}
              className={styles.waterLabel}
              fontSize={water.size * Math.max(scale, 0.5)}
              transform={water.rotation === 0 ? undefined : `rotate(${water.rotation} ${x} ${y})`}
            >
              {water.name}
            </text>
          );
        })}
        {CONTEXT_LAND.filter((land) => land.label !== null).map((land) => {
          const [x, y] = project(land.label ?? [0, 0]);
          return (
            <text key={land.name} x={x} y={y} className={styles.contextLabel} fontSize={11 * textScale}>
              {land.name}
            </text>
          );
        })}
        {map.boroughs.map((borough) => {
          const shape = BOROUGH_SHAPES[borough.id];
          const [x, y] = project(shape.label);
          return (
            <text
              key={borough.id}
              x={x}
              y={y}
              className={styles.boroughLabel}
              fontSize={shape.labelSize * textScale}
              strokeWidth={4 * scale}
              transform={shape.labelRotation === 0 ? undefined : `rotate(${shape.labelRotation} ${x} ${y})`}
            >
              {borough.name}
            </text>
          );
        })}
      </g>

      {visiblePoints(map.points, layers).map(({ point, layer }) => {
        const [x, y] = project([point.lon, point.lat]);
        const selected = isSelected(selection, 'point', point.id);
        const select = () => onSelect({ kind: 'point', id: point.id });
        const labelSize = 11.5 * Math.max(scale, 0.45);
        return (
          <g
            key={point.id}
            className={styles.marker}
            transform={`translate(${x.toFixed(1)} ${y.toFixed(1)})`}
            role="button"
            tabIndex={0}
            aria-label={point.name}
            aria-pressed={selected}
            onClick={select}
            onKeyDown={activate(select)}
          >
            <circle r={markerRadius * 2.6} className={styles.markerHit} />
            {point.approximate && <circle r={markerRadius * 2.1} className={styles.markerApprox} strokeWidth={markerRadius * 0.22} />}
            {selected && <circle r={markerRadius * 2.6} className={styles.markerRing} strokeWidth={markerRadius * 0.45} />}
            <MarkerSymbol layer={layer} r={markerRadius} />
            {showsLabel(point, zoom) && (
              <text
                x={(point.labelLeft ? -1 : 1) * markerRadius * 2.2}
                y={labelSize * 0.35}
                textAnchor={point.labelLeft ? 'end' : 'start'}
                className={styles.markerLabel}
                fontSize={labelSize}
                strokeWidth={3.2 * Math.max(scale, 0.45)}
              >
                {point.label}
              </text>
            )}
            <title>{point.name}</title>
          </g>
        );
      })}

      {zoom === 'city' &&
        map.edges.map((edge) => {
          const place = EDGE_PLACES[edge.id];
          if (place === undefined) return null;
          const select = () => onSelect({ kind: 'edge', id: edge.id });
          return (
            <g
              key={edge.id}
              className={`${styles.edge} ${isSelected(selection, 'edge', edge.id) ? styles.edgeSelected : ''}`}
              role="button"
              tabIndex={0}
              aria-label={`${edge.name} (fora do mapa)`}
              onClick={select}
              onKeyDown={activate(select)}
            >
              <text x={place.x} y={place.y} textAnchor={place.anchor} fontSize={14} strokeWidth={4}>
                {edge.label}
              </text>
            </g>
          );
        })}

      <g className={styles.scale} aria-hidden="true">
        {Array.from({ length: bar.km }, (_, index) => (
          <rect
            key={index}
            x={bar.x + index * bar.segment}
            y={bar.y}
            width={bar.segment}
            height={bar.height}
            className={index % 2 === 1 ? styles.scaleAlt : undefined}
            strokeWidth={0.6 * scale}
          />
        ))}
        <text x={bar.x} y={bar.y - 4 * scale} fontSize={11 * scale} strokeWidth={3 * scale}>
          0
        </text>
        <text x={bar.x + bar.km * bar.segment} y={bar.y - 4 * scale} fontSize={11 * scale} textAnchor="middle" strokeWidth={3 * scale}>
          {bar.km} km
        </text>
        <path
          d={`M${north.x} ${north.y - 14 * scale}L${north.x + 6 * scale} ${north.y + 6 * scale}L${north.x} ${north.y + 2 * scale}L${north.x - 6 * scale} ${north.y + 6 * scale}Z`}
          className={styles.northArrow}
        />
        <text x={north.x} y={north.y + 20 * scale} fontSize={12 * scale} textAnchor="middle" strokeWidth={3 * scale}>
          N
        </text>
      </g>
    </svg>
  );
}
