import { useMemo, useState } from 'react';
import type { NyFactionKey, NyLayerId, NyMapCatalog } from '../../catalog/types.ts';
import { VIEW_BOXES, type MapZoom } from './geometry.ts';
import { MapCanvas, MarkerSymbol } from './MapCanvas.tsx';
import { MapDossier } from './MapDossier.tsx';
import { MapLedger } from './MapLedger.tsx';
import { DEFAULT_LAYERS, factionFor, layersForEra, type MapEra, type MapSelection } from './mapModel.ts';
import { useAnimatedViewBox } from './useAnimatedViewBox.ts';
import styles from './MapView.module.css';

const SWATCH_CLASS: Readonly<Record<NyFactionKey, string | undefined>> = {
  cam: styles.swatchCam,
  camSoft: styles.swatchCamSoft,
  anarch: styles.swatchAnarch,
  anarchSoft: styles.swatchAnarchSoft,
  indep: styles.swatchIndep,
  sabbat: styles.swatchSabbat,
  unk: styles.swatchUnknown,
};

function Segmented<T extends string>({ label, value, options, onChange }: { label: string; value: T; options: readonly { value: T; label: string }[]; onChange: (value: T) => void }) {
  return (
    <div className={styles.controlGroup}>
      <span className={styles.controlLabel}>{label}</span>
      <div className={styles.segmented} role="group" aria-label={label}>
        {options.map((option) => (
          <button key={option.value} type="button" aria-pressed={option.value === value} onClick={() => onChange(option.value)}>
            {option.label}
          </button>
        ))}
      </div>
    </div>
  );
}

/** Factions in use by the boroughs in this era, in the note's order. */
function legendFor(map: NyMapCatalog, era: MapEra) {
  const used = new Set(map.boroughs.map((borough) => factionFor(borough, era)));
  return map.factions.filter((faction) => used.has(faction.key));
}

/** "Mapa de NY": who rules each borough at night, from Narrador/Nova York/Mapa de Nova York.md. */
export function MapView({ map }: { map: NyMapCatalog }) {
  const [era, setEra] = useState<MapEra>('2021');
  const [zoom, setZoom] = useState<MapZoom>('city');
  const [layers, setLayers] = useState<ReadonlySet<NyLayerId>>(() => new Set(DEFAULT_LAYERS));
  const [selection, setSelection] = useState<MapSelection>(null);
  const viewBox = useAnimatedViewBox(VIEW_BOXES[zoom]);
  const legend = useMemo(() => legendFor(map, era), [map, era]);

  const changeEra = (next: MapEra) => {
    setEra(next);
    setLayers((current) => layersForEra(current, next));
  };
  const toggleLayer = (layer: NyLayerId, on: boolean) => {
    setLayers((current) => {
      const next = new Set(current);
      if (on) next.add(layer);
      else next.delete(layer);
      return next;
    });
  };

  return (
    <section className={styles.view} aria-labelledby="ny-map-title">
      <header className={styles.header}>
        <p className={styles.eyebrow}>Narrador · Réveillon de 2021</p>
        <h2 id="ny-map-title" className={styles.title}>
          Nova York <em>by Night</em>
        </h2>
        <p className={styles.lead}>
          Quem manda à noite em cada distrito, em 2021 e antes de 1999. Clique num distrito, num ponto ou numa seta da borda para ver clãs, figuras e a
          fonte de cada dado.
        </p>
        <div className={styles.controls}>
          <Segmented
            label="Época"
            value={era}
            onChange={changeEra}
            options={[
              { value: '2021', label: '2021' },
              { value: 'before', label: 'Antes de 1999' },
            ]}
          />
          <Segmented
            label="Vista"
            value={zoom}
            onChange={setZoom}
            options={[
              { value: 'city', label: 'Cidade' },
              { value: 'manhattan', label: 'Manhattan' },
            ]}
          />
          <fieldset className={styles.controlGroup}>
            <legend className={styles.controlLabel}>Camadas</legend>
            {map.layers.map((layer) => (
              <label key={layer.id} className={styles.layerToggle}>
                <input
                  id={`ny-layer-${layer.id}`}
                  type="checkbox"
                  checked={layers.has(layer.id)}
                  onChange={(event) => toggleLayer(layer.id, event.target.checked)}
                />
                <svg viewBox="-7 -7 14 14" className={styles.layerIcon} aria-hidden="true">
                  <MarkerSymbol layer={layer.id} r={4} />
                </svg>
                {layer.name}
              </label>
            ))}
          </fieldset>
        </div>
      </header>

      <div className={styles.layout}>
        <div className={styles.plateColumn}>
          <div className={styles.plate}>
            <MapCanvas map={map} era={era} zoom={zoom} viewBox={viewBox} layers={layers} selection={selection} onSelect={setSelection} />
            <p className={styles.plateFoot}>
              <span>Projeção a partir de latitude e longitude · norte para cima</span>
              <span>Contornos simplificados · anel tracejado = local aproximado</span>
            </p>
          </div>
          <p className={styles.legend}>
            {legend.map((faction) => (
              <span key={faction.key}>
                <i className={`${styles.swatch} ${SWATCH_CLASS[faction.key] ?? ''}`} aria-hidden="true" />
                {faction.name}
              </span>
            ))}
          </p>
        </div>
        <aside className={styles.dossier} aria-live="polite" aria-label="Detalhes">
          <MapDossier map={map} era={era} selection={selection} onSelect={setSelection} />
        </aside>
      </div>

      <MapLedger rows={map.ledger} />

      <section className={styles.cards} aria-labelledby="ny-cards-title">
        <h3 id="ny-cards-title" className={styles.sectionTitle}>
          Divergências e cuidados
        </h3>
        <div className={styles.cardGrid}>
          {map.cards.map((card) => (
            <div key={card.title} className={styles.card}>
              <h4>{card.title}</h4>
              <p dangerouslySetInnerHTML={{ __html: card.html }} />
            </div>
          ))}
        </div>
      </section>

      <p className={styles.footnote}>
        Fonte: <code>Narrador/Nova York/Mapa de Nova York.md</code>. Para mudar o mapa, edite a nota; o app relê no próximo <code>npm run dev</code>.
      </p>
    </section>
  );
}
