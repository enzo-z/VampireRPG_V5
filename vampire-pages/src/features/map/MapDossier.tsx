import type { NyBorough, NyFactionKey, NyMapCatalog, NyOverview } from '../../catalog/types.ts';
import { factionFor, type MapEra, type MapSelection } from './mapModel.ts';
import { SourceTags } from './SourceTags.tsx';
import styles from './MapView.module.css';

interface MapDossierProps {
  map: NyMapCatalog;
  era: MapEra;
  selection: MapSelection;
  onSelect: (selection: MapSelection) => void;
}

const FACTION_TONE: Readonly<Record<NyFactionKey, string | undefined>> = {
  cam: styles.toneCam,
  camSoft: styles.toneCam,
  anarch: styles.toneAnarch,
  anarchSoft: styles.toneAnarch,
  indep: styles.toneIndep,
  sabbat: styles.toneSabbat,
  unk: styles.toneUnknown,
};

function Html({ html, className }: { html: string; className?: string }) {
  return <span className={className} dangerouslySetInnerHTML={{ __html: html }} />;
}

function Heading({ kicker, title }: { kicker: string; title: string }) {
  return (
    <div>
      <p className={styles.kicker}>{kicker}</p>
      <h3 className={styles.dossierTitle}>{title}</h3>
    </div>
  );
}

function BackButton({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button type="button" className={styles.linkButton} onClick={onClick}>
      {label}
    </button>
  );
}

function Paragraphs({ overview }: { overview: NyOverview }) {
  return (
    <>
      {overview.paragraphs.map((paragraph) => (
        <p key={paragraph.html} className={styles.dossierText}>
          <Html html={paragraph.html} /> <SourceTags sources={paragraph.sources} />
        </p>
      ))}
    </>
  );
}

function Overview({ map, era }: { map: NyMapCatalog; era: MapEra }) {
  const before = era === 'before';
  return (
    <>
      <Heading kicker={before ? 'Antes de 1999' : 'Dezembro de 2021'} title={before ? map.overviewBefore.title : map.overview.title} />
      <Paragraphs overview={before ? map.overviewBefore : map.overview} />
      {before ? (
        <p className={styles.hint}>A camada "Batalha de 1999" mostra os pontos da guerra.</p>
      ) : (
        <div>
          <h4 className={styles.dossierSection}>A corte</h4>
          <ul className={styles.court}>
            {map.court.map((entry) => (
              <li key={entry.name}>
                <b>{entry.name}</b>
                <span>{entry.role}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
      <p className={styles.hint}>Clique num distrito, num ponto ou numa seta da borda do mapa.</p>
    </>
  );
}

function FactionBadge({ map, faction }: { map: NyMapCatalog; faction: NyFactionKey }) {
  const name = map.factions.find((entry) => entry.key === faction)?.name ?? faction;
  return <span className={`${styles.badge} ${FACTION_TONE[faction] ?? ''}`}>{name}</span>;
}

function BoroughPanel({ map, era, borough, onSelect }: { map: NyMapCatalog; era: MapEra; borough: NyBorough; onSelect: MapDossierProps['onSelect'] }) {
  const before = era === 'before';
  const points = map.points.filter((point) => point.borough === borough.id);
  return (
    <>
      <BackButton label="Visão geral" onClick={() => onSelect(null)} />
      <Heading kicker="Distrito" title={borough.name} />
      <div>
        <FactionBadge map={map} faction={factionFor(borough, era)} />
      </div>
      {borough.area !== null && (
        <dl className={styles.facts}>
          <dt>Área</dt>
          <dd>{borough.area} km²</dd>
          <dt>População</dt>
          <dd>{borough.population} (Censo 2020)</dd>
        </dl>
      )}
      {before ? (
        <>
          <p className={`${styles.dossierText} ${styles.before}`}>
            <Html html={borough.beforeHtml} />
          </p>
          <p className={styles.hint}>Mude para 2021 para ver os clãs atuais.</p>
        </>
      ) : (
        <>
          <p className={styles.dossierText}>
            <Html html={borough.summaryHtml} />
          </p>
          <div>
            <h4 className={styles.dossierSection}>Clãs e figuras</h4>
            <ul className={styles.clans}>
              {borough.clans.map((row) => (
                <li key={row.clan}>
                  <span className={styles.clanName}>
                    {row.clan} <SourceTags sources={row.sources} />
                  </span>
                  <Html html={row.whoHtml} className={styles.clanWho} />
                </li>
              ))}
            </ul>
          </div>
          {borough.noteHtml !== null && (
            <p className={styles.hint}>
              <Html html={borough.noteHtml} />
            </p>
          )}
          <div>
            <h4 className={styles.dossierSection}>Antes de 1999</h4>
            <p className={`${styles.dossierText} ${styles.before}`}>
              <Html html={borough.beforeHtml} />
            </p>
          </div>
        </>
      )}
      {points.length > 0 && (
        <div>
          <h4 className={styles.dossierSection}>Pontos no mapa</h4>
          <ul className={styles.court}>
            {points.map((point) => (
              <li key={point.id}>
                <button type="button" className={styles.pointLink} onClick={() => onSelect({ kind: 'point', id: point.id })}>
                  {point.name}
                </button>
                <span>{map.layers.find((layer) => layer.id === point.layers[0])?.name}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </>
  );
}

export function MapDossier({ map, era, selection, onSelect }: MapDossierProps) {
  if (selection === null) return <Overview map={map} era={era} />;

  if (selection.kind === 'borough') {
    const borough = map.boroughs.find((entry) => entry.id === selection.id);
    return borough === undefined ? <Overview map={map} era={era} /> : <BoroughPanel map={map} era={era} borough={borough} onSelect={onSelect} />;
  }

  const point = selection.kind === 'point' ? map.points.find((entry) => entry.id === selection.id) : undefined;
  const edge = selection.kind === 'edge' ? map.edges.find((entry) => entry.id === selection.id) : undefined;
  const place = point ?? edge;
  if (place === undefined) return <Overview map={map} era={era} />;
  const borough = map.boroughs.find((entry) => entry.id === point?.borough);
  const kicker = point === undefined ? 'Fora do mapa' : (map.layers.find((layer) => layer.id === point.layers[0])?.name ?? '');

  return (
    <>
      <BackButton label="Visão geral" onClick={() => onSelect(null)} />
      <Heading kicker={kicker} title={place.name} />
      <p className={styles.dossierText}>
        <Html html={place.html} /> <SourceTags sources={place.sources} />
      </p>
      {point?.approximate === true && <p className={styles.hint}>Local aproximado: as fontes não dão endereço.</p>}
      {borough !== undefined && <BackButton label={`Ver ${borough.name}`} onClick={() => onSelect({ kind: 'borough', id: borough.id })} />}
    </>
  );
}
