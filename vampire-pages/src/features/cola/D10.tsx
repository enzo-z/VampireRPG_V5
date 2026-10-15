import styles from './D10.module.css';

export type DieColor = 'black' | 'red';

interface D10Props {
  value: number;
  color: DieColor;
  /** Accessible description, e.g. "dado vermelho: 1". */
  label?: string;
}

/** A ten-sided die seen from the front: an upper kite face with the number and the lower facets. */
export function D10({ value, color, label }: D10Props) {
  return (
    <svg
      className={`${styles.die} ${color === 'red' ? styles.red : styles.black}`}
      viewBox="0 0 100 110"
      role="img"
      aria-label={label ?? `dado ${color === 'red' ? 'vermelho' : 'preto'}: ${value}`}
    >
      <path className={styles.body} d="M50 3 L95 50 L50 107 L5 50 Z" />
      <path className={styles.edge} d="M50 3 L80 60 L50 82 L20 60 Z" />
      <path className={styles.edge} d="M5 50 L20 60 M95 50 L80 60 M50 82 L50 107" />
      <text className={styles.number} x="50" y="54" textAnchor="middle" dominantBaseline="middle">
        {value}
      </text>
    </svg>
  );
}
