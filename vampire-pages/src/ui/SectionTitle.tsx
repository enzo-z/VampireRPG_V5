import type { ReactNode } from 'react';
import styles from './SectionTitle.module.css';

export function SectionTitle({ id, children }: { id: string; children: ReactNode }) {
  return (
    <h2 id={id} className={styles.title}>
      {children}
    </h2>
  );
}
