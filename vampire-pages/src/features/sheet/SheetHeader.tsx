import { serializeSheetFile } from '../../schema/importExport.ts';
import { useSheets } from '../../store/SheetsProvider.tsx';
import { IconButton } from '../../ui/IconButton.tsx';
import { DownloadIcon, EyeIcon, EyeOffIcon } from '../../ui/icons.tsx';
import { Menu } from '../../ui/Menu.tsx';
import { useToast } from '../../ui/Toast.tsx';
import { downloadText, jsonFileName } from './fileTransfer.ts';
import { HeaderTrackers } from './HeaderTrackers.tsx';
import { IdentityFields } from './IdentityFields.tsx';
import { useSheet } from './SheetContext.tsx';
import styles from './SheetHeader.module.css';

interface SheetHeaderProps {
  onToggleReadOnly: () => void;
  onPrint: () => void;
}

export function SheetHeader({ onToggleReadOnly, onPrint }: SheetHeaderProps) {
  const { ficha, readOnly, edit } = useSheet();
  const { dispatch } = useSheets();
  const { notify } = useToast();

  const exportJson = () => {
    downloadText(jsonFileName(ficha.name), serializeSheetFile([ficha]));
    notify(`Ficha de ${ficha.name} exportada.`);
  };

  const deleteFicha = () => {
    if (window.confirm(`Excluir a ficha "${ficha.name}"? Não dá para desfazer; exporte antes se quiser guardar.`)) {
      dispatch({ type: 'ficha/deleted', id: ficha.id });
      notify(`Ficha "${ficha.name}" excluída.`);
    }
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
          <IconButton
            label={readOnly ? 'Modo leitura ativo. Clique para permitir edição' : 'Ativar modo leitura'}
            icon={readOnly ? <EyeIcon /> : <EyeOffIcon />}
            active={readOnly}
            aria-pressed={readOnly}
            onClick={onToggleReadOnly}
          />
          <Menu
            label="Exportar ficha"
            trigger={<DownloadIcon />}
            items={[
              { label: 'Exportar JSON', onSelect: exportJson },
              { label: 'Exportar PDF (impressão)', onSelect: onPrint },
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
