import styles from './Dots.module.css';

interface DotsProps {
  value: number;
  max: number;
  /** Accessible name of the trait, e.g. "Strength". */
  label: string;
  /** When present the dots are buttons; otherwise they are a static image. */
  onPick?: (index: number) => void;
  size?: 'sm' | 'md';
  /** Extra gap before every group of this many dots (0 = no groups). */
  groupSize?: number;
}

export function Dots({ value, max, label, onPick, size = 'sm', groupSize = 0 }: DotsProps) {
  const dotClass = (index: number) =>
    [
      styles.dot,
      styles[size],
      index < value ? styles.filled : '',
      groupSize > 0 && index > 0 && index % groupSize === 0 ? styles.groupStart : '',
    ].join(' ');

  if (onPick === undefined) {
    return (
      <span className={styles.row} role="img" aria-label={`${label} ${value} de ${max}`}>
        {Array.from({ length: max }, (_, index) => (
          <span key={index} aria-hidden="true" className={dotClass(index)} />
        ))}
      </span>
    );
  }

  return (
    <span className={styles.row} role="group" aria-label={`${label}: ${value} de ${max}`}>
      {Array.from({ length: max }, (_, index) => (
        <button
          key={index}
          type="button"
          aria-label={`${label}: ${index + 1}`}
          aria-pressed={index < value}
          className={`${dotClass(index)} ${styles.interactive}`}
          onClick={() => onPick(index)}
        />
      ))}
    </span>
  );
}
