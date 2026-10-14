import type { ReactNode } from 'react';
import { Dots } from '../../ui/Dots.tsx';
import styles from './TraitRow.module.css';

interface TraitRowProps {
  label: string;
  value: number;
  max: number;
  selected: boolean;
  onSelect: () => void;
  /** Absent in read-only mode. */
  onPick?: ((index: number) => void) | undefined;
  /** Optional control between the label and the dots (e.g. specialization). */
  children?: ReactNode;
}

/** Label selects the trait in the reference panel; the dots change its value. */
export function TraitRow({ label, value, max, selected, onSelect, onPick, children }: TraitRowProps) {
  return (
    <div className={`${styles.row} ${selected ? styles.selected : ''}`}>
      <button type="button" className={styles.label} aria-pressed={selected} onClick={onSelect}>
        {label}
      </button>
      {children}
      <span className={styles.dots}>
        <Dots value={value} max={max} label={label} onPick={onPick} />
      </span>
    </div>
  );
}
