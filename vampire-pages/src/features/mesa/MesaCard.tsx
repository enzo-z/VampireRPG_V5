import { HUNGER_MAX, type BoxState, type Ficha } from '../../domain/character.ts';
import { humanitySummary, visibleBoxes } from '../../domain/trackers.ts';
import type { DamageTrackKey, SheetsAction } from '../../store/sheetsReducer.ts';
import { Boxes } from '../../ui/Boxes.tsx';
import { FichaActions } from '../sheet/FichaActions.tsx';
import styles from './MesaCard.module.css';

const DAMAGE_NAMES: Readonly<Record<BoxState, string>> = { 0: 'vazia', 1: 'dano superficial', 2: 'dano agravado' };
const HUMANITY_NAMES: Readonly<Record<BoxState, string>> = { 0: 'vazia', 1: 'mancha', 2: 'cheia' };
const HUNGER_NAMES: Readonly<Record<BoxState, string>> = { 0: 'vazia', 1: 'cheia', 2: 'cheia' };

const DAMAGE_LABELS: Readonly<Record<DamageTrackKey, string>> = { health: 'Saúde', willpower: 'Willpower' };

interface MesaCardProps {
  ficha: Ficha;
  active: boolean;
  /** Null in read-only mode. */
  edit: ((action: SheetsAction) => void) | null;
  onOpen: () => void;
  /** Opens the full Saúde / Willpower tracker (maximum and damage). */
  onOpenTracker: (track: DamageTrackKey) => void;
  onPrint: (id: string) => void;
}

/** One character at the table: identity line and live trackers. */
export function MesaCard({ ficha, active, edit, onOpen, onOpenTracker, onPrint }: MesaCardProps) {
  const { trackers } = ficha;
  const sub = [ficha.identity.clan, ficha.identity.player].map((part) => part.trim()).filter(Boolean).join(' · ');
  const hunger = Array.from({ length: HUNGER_MAX }, (_, index): BoxState => (index < trackers.hunger ? 2 : 0));
  const humanity = humanitySummary(trackers.humanity);

  const damageRow = (track: DamageTrackKey) => {
    const label = DAMAGE_LABELS[track];
    return (
      <div className={styles.row}>
        <button
          type="button"
          className={styles.trackLink}
          title="Abrir a trilha completa"
          aria-label={`${label} de ${ficha.name}: máximo ${trackers[track].max}. Abrir a trilha completa`}
          onClick={() => onOpenTracker(track)}
        >
          {label}
        </button>
        <Boxes
          states={visibleBoxes(trackers[track])}
          label={`${label} de ${ficha.name}`}
          tone="marked"
          size="sm"
          stateNames={DAMAGE_NAMES}
          onPick={edit ? (index) => edit({ type: 'tracker/boxCycled', id: ficha.id, track, index }) : undefined}
        />
      </div>
    );
  };

  return (
    <article className={`${styles.card} ${active ? styles.active : ''}`} aria-label={ficha.name}>
      <div className={styles.head}>
        <button type="button" className={styles.identity} onClick={onOpen} aria-label={`Abrir a ficha de ${ficha.name}`}>
          <span className={styles.name}>{ficha.name}</span>
          {sub !== '' && <span className={styles.sub}>{sub}</span>}
        </button>
        {/* On the Mesa everything stays put: the copy and the restored ficha appear as cards. */}
        <FichaActions
          ficha={ficha}
          readOnly={edit === null}
          onPrint={onPrint}
          onDuplicated={() => undefined}
          onDeleted={() => undefined}
          onRestored={() => undefined}
          align="end"
        />
      </div>
      <div className={styles.row}>
        <span className={styles.trackLabel}>Fome</span>
        <Boxes
          states={hunger}
          label={`Fome de ${ficha.name}`}
          tone="marked"
          size="sm"
          groupSize={0}
          stateNames={HUNGER_NAMES}
          onPick={edit ? (index) => edit({ type: 'hunger/picked', id: ficha.id, index }) : undefined}
        />
      </div>
      {damageRow('health')}
      {damageRow('willpower')}
      <div className={styles.row}>
        <span className={styles.trackLabel} title={`Humanidade ${humanity.humanity}, ${humanity.stains} mancha(s)`}>
          Humanid.
        </span>
        <Boxes
          states={trackers.humanity}
          label={`Humanidade de ${ficha.name}`}
          tone="ink"
          size="sm"
          stateNames={HUMANITY_NAMES}
          onPick={edit ? (index) => edit({ type: 'humanity/cycled', id: ficha.id, index }) : undefined}
        />
      </div>
    </article>
  );
}
