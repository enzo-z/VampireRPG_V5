import { FichaActions } from './FichaActions.tsx';
import { HeaderTrackers } from './HeaderTrackers.tsx';
import { IdentityFields } from './IdentityFields.tsx';
import { useSheet } from './SheetContext.tsx';
import styles from './SheetHeader.module.css';

interface SheetHeaderProps {
  onPrint: (id: string) => void;
  onCola: (id: string) => void;
  /** After deleting this ficha (the app goes back to the Mesa). */
  onDeleted: () => void;
  /** Opens a ficha (the copy after duplicating, the ficha back after undoing a delete). */
  onOpenFicha: (id: string) => void;
}

export function SheetHeader({ onPrint, onCola, onDeleted, onOpenFicha }: SheetHeaderProps) {
  const { ficha, readOnly, edit } = useSheet();

  return (
    <header className={styles.header}>
      <div className={styles.identityBlock}>
        <div className={styles.nameRow}>
          <input
            key={ficha.name}
            type="text"
            className={styles.name}
            aria-label="Nome do personagem"
            defaultValue={ficha.name}
            readOnly={readOnly}
            onBlur={(event) => {
              const name = event.target.value.trim();
              if (name === '') event.target.value = ficha.name;
              else if (name !== ficha.name) edit({ type: 'ficha/renamed', id: ficha.id, name });
            }}
            onKeyDown={(event) => {
              if (event.key === 'Enter') event.currentTarget.blur();
            }}
          />
          <FichaActions
            ficha={ficha}
            readOnly={readOnly}
            onPrint={onPrint}
            onCola={onCola}
            onDuplicated={onOpenFicha}
            onDeleted={onDeleted}
            onRestored={onOpenFicha}
          />
        </div>
        <IdentityFields />
      </div>
      <HeaderTrackers />
    </header>
  );
}
