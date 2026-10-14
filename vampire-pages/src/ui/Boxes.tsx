import type { BoxState } from '../domain/character.ts';
import styles from './Boxes.module.css';

const STATE_NAMES: Readonly<Record<BoxState, string>> = { 0: 'vazia', 1: 'barra', 2: 'cheia' };

interface BoxesProps {
  states: readonly BoxState[];
  /** Accessible name of the track, e.g. "Saúde". */
  label: string;
  /** Damage and Hunger use crimson; Humanidade uses ink. */
  tone: 'marked' | 'ink';
  onPick?: (index: number) => void;
  size?: 'sm' | 'md';
  groupSize?: number;
  /** Optional per-state wording for screen readers. */
  stateNames?: Readonly<Record<BoxState, string>>;
}

export function Boxes({ states, label, tone, onPick, size = 'md', groupSize = 5, stateNames = STATE_NAMES }: BoxesProps) {
  const boxClass = (state: BoxState, index: number) =>
    [
      styles.box,
      styles[size],
      state === 1 ? styles.slash : '',
      state === 2 ? styles.full : '',
      groupSize > 0 && index > 0 && index % groupSize === 0 ? styles.groupStart : '',
      onPick ? styles.interactive : '',
    ].join(' ');

  return (
    <span className={`${styles.row} ${tone === 'marked' ? styles.toneMarked : styles.toneInk}`} role="group" aria-label={label}>
      {states.map((state, index) =>
        onPick ? (
          <button
            key={index}
            type="button"
            className={boxClass(state, index)}
            aria-label={`${label} ${index + 1}: ${stateNames[state]}`}
            onClick={() => onPick(index)}
          />
        ) : (
          <span key={index} className={boxClass(state, index)} role="img" aria-label={`${label} ${index + 1}: ${stateNames[state]}`} />
        ),
      )}
    </span>
  );
}
