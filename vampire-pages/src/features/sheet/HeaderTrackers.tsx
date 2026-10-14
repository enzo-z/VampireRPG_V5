import { useState } from 'react';
import { HUNGER_MAX, TRACK_CAP, type BoxState } from '../../domain/character.ts';
import { pickMax, visibleBoxes } from '../../domain/trackers.ts';
import { isSameSelection, TRACKER_LABELS, type Selection, type TrackerKind } from '../../reference/lookup.ts';
import type { DamageTrackKey } from '../../store/sheetsReducer.ts';
import { Boxes } from '../../ui/Boxes.tsx';
import { Dots } from '../../ui/Dots.tsx';
import { PencilIcon, SaveIcon } from '../../ui/icons.tsx';
import { useSheet } from './SheetContext.tsx';
import styles from './HeaderTrackers.module.css';

const DAMAGE_NAMES: Readonly<Record<BoxState, string>> = { 0: 'vazia', 1: 'dano superficial', 2: 'dano agravado' };
const HUMANITY_NAMES: Readonly<Record<BoxState, string>> = { 0: 'vazia', 1: 'mancha', 2: 'cheia' };
const HUNGER_NAMES: Readonly<Record<BoxState, string>> = { 0: 'vazia', 1: 'cheia', 2: 'cheia' };

function TrackerLabel({ tracker }: { tracker: TrackerKind }) {
  const { selection, select } = useSheet();
  const target: Selection = { kind: 'tracker', tracker };
  const selected = isSameSelection(selection, target);
  return (
    <button type="button" className={`${styles.label} ${selected ? styles.labelSelected : ''}`} aria-pressed={selected} onClick={() => select(target)}>
      {TRACKER_LABELS[tracker]}
    </button>
  );
}

/** Saúde / Willpower: circles show the maximum; the pencil edits it as a draft until saved. */
function DamageTracker({ track }: { track: DamageTrackKey }) {
  const { ficha, readOnly, edit } = useSheet();
  const [draftMax, setDraftMax] = useState<number | null>(null);
  const current = ficha.trackers[track];
  const label = TRACKER_LABELS[track];
  const editing = draftMax !== null && !readOnly;

  const toggleEditing = () => {
    if (draftMax === null) {
      setDraftMax(current.max);
      return;
    }
    edit({ type: 'tracker/maxSet', id: ficha.id, track, max: draftMax });
    setDraftMax(null);
  };

  return (
    <div className={styles.tracker}>
      <div className={styles.heading}>
        <TrackerLabel tracker={track} />
        {!readOnly && (
          <button
            type="button"
            className={styles.pencil}
            aria-label={`${editing ? 'Salvar' : 'Editar'} máximo de ${label}`}
            title={`${editing ? 'Salvar' : 'Editar'} máximo de ${label}`}
            onClick={toggleEditing}
          >
            {editing ? <SaveIcon /> : <PencilIcon />}
          </button>
        )}
      </div>
      <Dots
        value={editing ? draftMax : current.max}
        max={editing ? TRACK_CAP : current.max}
        label={`Máximo de ${label}`}
        groupSize={5}
        onPick={editing ? (index) => setDraftMax((value) => pickMax(value ?? current.max, index)) : undefined}
      />
      <Boxes
        states={visibleBoxes(current)}
        label={label}
        tone="marked"
        stateNames={DAMAGE_NAMES}
        onPick={readOnly ? undefined : (index) => edit({ type: 'tracker/boxCycled', id: ficha.id, track, index })}
      />
    </div>
  );
}

function HungerTracker() {
  const { ficha, readOnly, edit } = useSheet();
  const states = Array.from({ length: HUNGER_MAX }, (_, index): BoxState => (index < ficha.trackers.hunger ? 2 : 0));
  return (
    <div className={styles.tracker}>
      <div className={styles.heading}>
        <TrackerLabel tracker="hunger" />
      </div>
      <Boxes
        states={states}
        label="Fome"
        tone="marked"
        groupSize={0}
        stateNames={HUNGER_NAMES}
        onPick={readOnly ? undefined : (index) => edit({ type: 'hunger/picked', id: ficha.id, index })}
      />
    </div>
  );
}

function HumanityTracker() {
  const { ficha, readOnly, edit } = useSheet();
  return (
    <div className={styles.tracker}>
      <div className={styles.heading}>
        <TrackerLabel tracker="humanity" />
      </div>
      <Boxes
        states={ficha.trackers.humanity}
        label="Humanidade"
        tone="ink"
        size="sm"
        stateNames={HUMANITY_NAMES}
        onPick={readOnly ? undefined : (index) => edit({ type: 'humanity/cycled', id: ficha.id, index })}
      />
    </div>
  );
}

export function HeaderTrackers() {
  return (
    <div className={styles.trackers}>
      <div className={styles.row}>
        <HungerTracker />
        <HumanityTracker />
      </div>
      <div className={styles.row}>
        <DamageTracker track="health" />
        <DamageTracker track="willpower" />
      </div>
    </div>
  );
}
