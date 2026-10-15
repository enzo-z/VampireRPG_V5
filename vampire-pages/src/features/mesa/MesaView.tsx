import { useState } from 'react';
import type { SheetsAction, DamageTrackKey } from '../../store/sheetsReducer.ts';
import { useSheets } from '../../store/SheetsProvider.tsx';
import { MesaCard } from './MesaCard.tsx';
import { TrackerDialog } from './TrackerDialog.tsx';
import styles from './MesaView.module.css';

interface MesaViewProps {
  readOnly: boolean;
  onOpenFicha: (id: string) => void;
}

/** Every ficha at a glance, with live trackers. */
export function MesaView({ readOnly, onOpenFicha }: MesaViewProps) {
  const { state, dispatch } = useSheets();
  const [tracker, setTracker] = useState<{ id: string; track: DamageTrackKey } | null>(null);
  const edit: ((action: SheetsAction) => void) | null = readOnly ? null : dispatch;
  const trackerFicha = tracker === null ? undefined : state.fichas.find((ficha) => ficha.id === tracker.id);

  return (
    <section className={styles.mesa} aria-label="Mesa">
      <p className={styles.count}>
        {state.fichas.length === 1 ? '1 ficha' : `${state.fichas.length} fichas`} · clique no nome para abrir a ficha
      </p>
      <div className={styles.grid}>
        {state.fichas.map((ficha) => (
          <MesaCard
            key={ficha.id}
            ficha={ficha}
            active={ficha.id === state.activeId}
            edit={edit}
            onOpen={() => onOpenFicha(ficha.id)}
            onOpenTracker={(track) => setTracker({ id: ficha.id, track })}
          />
        ))}
      </div>
      {tracker !== null && trackerFicha !== undefined && (
        <TrackerDialog ficha={trackerFicha} track={tracker.track} edit={edit} onClose={() => setTracker(null)} />
      )}
    </section>
  );
}
