import { serializeSheetFile } from '../../schema/importExport.ts';
import { useSheets } from '../../store/SheetsProvider.tsx';
import { DownloadIcon } from '../../ui/icons.tsx';
import { Menu } from '../../ui/Menu.tsx';
import { useToast } from '../../ui/Toast.tsx';
import { downloadText, jsonFileName } from './fileTransfer.ts';
import { HeaderTrackers } from './HeaderTrackers.tsx';
import { IdentityFields } from './IdentityFields.tsx';
import { useSheet } from './SheetContext.tsx';
import styles from './SheetHeader.module.css';

interface SheetHeaderProps {
  onPrint: () => void;
  /** After deleting this ficha (the app goes back to the Mesa). */
  onDeleted: () => void;
  /** Opens a ficha (the copy after duplicating, the ficha back after undoing a delete). */
  onOpenFicha: (id: string) => void;
}

export function SheetHeader({ onPrint, onDeleted, onOpenFicha }: SheetHeaderProps) {
  const { ficha, readOnly, edit } = useSheet();
  const {
    state: { fichas },
    dispatch,
  } = useSheets();
  const { notify } = useToast();

  const exportJson = () => {
    downloadText(jsonFileName(ficha.name), serializeSheetFile([ficha]));
    notify(`Ficha de ${ficha.name} exportada.`);
  };

  const duplicateFicha = () => {
    const newId = crypto.randomUUID();
    dispatch({ type: 'ficha/duplicated', id: ficha.id, newId });
    onOpenFicha(newId);
    notify(`Cópia de "${ficha.name}" criada.`);
  };

  // No confirm: the toast offers to undo, putting the ficha back where it was.
  const deleteFicha = () => {
    const deleted = ficha;
    const index = fichas.findIndex((other) => other.id === deleted.id);
    dispatch({ type: 'ficha/deleted', id: deleted.id });
    onDeleted();
    notify(`Ficha "${deleted.name}" excluída.`, {
      label: 'Desfazer',
      onSelect: () => {
        dispatch({ type: 'ficha/restored', ficha: deleted, index });
        onOpenFicha(deleted.id);
      },
    });
  };

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
          <Menu
            label="Exportar ficha"
            trigger={<DownloadIcon />}
            items={[
              { label: 'Exportar JSON', onSelect: exportJson },
              { label: 'Exportar PDF (impressão)', onSelect: onPrint },
              { label: 'Duplicar ficha', onSelect: duplicateFicha },
              { label: 'Excluir ficha', onSelect: deleteFicha, danger: true },
            ]}
          />
        </div>
        <IdentityFields />
      </div>
      <HeaderTrackers />
    </header>
  );
}
