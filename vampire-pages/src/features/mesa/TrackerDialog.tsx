import { useEffect, useRef } from 'react';
import { TRACK_CAP, type BoxState, type Ficha } from '../../domain/character.ts';
import { damageSummary, pickMax, visibleBoxes } from '../../domain/trackers.ts';
import type { DamageTrackKey, SheetsAction } from '../../store/sheetsReducer.ts';
import { Boxes } from '../../ui/Boxes.tsx';
import { Dots } from '../../ui/Dots.tsx';
import styles from './TrackerDialog.module.css';

const DAMAGE_NAMES: Readonly<Record<BoxState, string>> = { 0: 'vazia', 1: 'dano superficial', 2: 'dano agravado' };
const LABELS: Readonly<Record<DamageTrackKey, string>> = { health: 'Saúde', willpower: 'Willpower' };

interface TrackerDialogProps {
  ficha: Ficha;
  track: DamageTrackKey;
  /** Null in read-only mode. */
  edit: ((action: SheetsAction) => void) | null;
  onClose: () => void;
}

/** Full Saúde / Willpower tracker opened from the Mesa: maximum (circles) and damage (boxes). */
export function TrackerDialog({ ficha, track, edit, onClose }: TrackerDialogProps) {
  const dialog = useRef<HTMLDialogElement>(null);
  const current = ficha.trackers[track];
  const summary = damageSummary(current);
  const label = LABELS[track];

  // Native modal: Escape, focus trap and backdrop come from the browser. No close() on
  // cleanup: it would fire onClose (StrictMode re-runs effects); unmounting ends the modal.
  useEffect(() => {
    const element = dialog.current;
    if (element !== null && !element.open) element.showModal();
  }, []);

  return (
    <dialog
      ref={dialog}
      className={styles.dialog}
      aria-labelledby="tracker-dialog-title"
      onClose={onClose}
      onClick={(event) => {
        if (event.target === dialog.current) onClose();
      }}
    >
      <h2 id="tracker-dialog-title" className={styles.title}>
        {label} · {ficha.name}
      </h2>
      <p className={styles.caption}>
        Máximo: {current.max} <span className={styles.hint}>{edit ? '(clique num círculo para mudar)' : '(modo leitura)'}</span>
      </p>
      <Dots
        value={current.max}
        max={TRACK_CAP}
        label={`Máximo de ${label}`}
        groupSize={5}
        size="md"
        onPick={edit ? (index) => edit({ type: 'tracker/maxSet', id: ficha.id, track, max: pickMax(current.max, index) }) : undefined}
      />
      <p className={styles.caption}>
        Dano <span className={styles.hint}>(um clique: superficial · dois: agravado · três: limpa)</span>
      </p>
      <Boxes
        states={visibleBoxes(current)}
        label={label}
        tone="marked"
        stateNames={DAMAGE_NAMES}
        onPick={edit ? (index) => edit({ type: 'tracker/boxCycled', id: ficha.id, track, index }) : undefined}
      />
      <p className={styles.summary}>
        {summary.superficial} superficial · {summary.aggravated} agravado · {summary.empty} livre(s)
      </p>
      <div className={styles.actions}>
        <button type="button" className={styles.close} onClick={onClose} autoFocus>
          Fechar
        </button>
      </div>
    </dialog>
  );
}
