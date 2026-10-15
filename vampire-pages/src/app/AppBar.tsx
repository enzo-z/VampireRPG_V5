import { useRef } from 'react';
import { createFicha } from '../domain/defaults.ts';
import { downloadText } from '../features/sheet/fileTransfer.ts';
import { parseSheetFile, serializeSheetFile } from '../schema/importExport.ts';
import { useSheets } from '../store/SheetsProvider.tsx';
import { IconButton } from '../ui/IconButton.tsx';
import { EyeIcon, EyeOffIcon, MenuIcon } from '../ui/icons.tsx';
import { useToast } from '../ui/Toast.tsx';
import styles from './AppBar.module.css';

function todayStamp(): string {
  return new Date().toISOString().slice(0, 10);
}

interface AppBarProps {
  title: string;
  readOnly: boolean;
  onToggleReadOnly: () => void;
  /** Shown on narrow screens, where the menu is a drawer. */
  onOpenMenu: (() => void) | null;
  /** A new ficha opens right away. */
  onCreated: (id: string) => void;
}

/** App-level actions: read-only mode, create, import, export all. */
export function AppBar({ title, readOnly, onToggleReadOnly, onOpenMenu, onCreated }: AppBarProps) {
  const { state, dispatch } = useSheets();
  const { notify } = useToast();
  const fileInput = useRef<HTMLInputElement>(null);

  const createNew = () => {
    const ficha = createFicha(crypto.randomUUID(), `Nova ficha ${state.fichas.length + 1}`);
    dispatch({ type: 'ficha/created', ficha });
    onCreated(ficha.id);
    notify('Ficha criada. Clique no nome para renomear.');
  };

  const importFile = async (file: File) => {
    const result = parseSheetFile(await file.text());
    if (!result.ok) {
      notify(result.error);
      return;
    }
    const imported = result.file.fichas;
    if (imported.length === 0) {
      notify('O arquivo não tem nenhuma ficha.');
      return;
    }
    const existingIds = new Set(state.fichas.map((ficha) => ficha.id));
    const replacing = imported.filter((ficha) => existingIds.has(ficha.id));
    if (replacing.length > 0) {
      const names = replacing.map((ficha) => `• ${ficha.name}`).join('\n');
      if (!window.confirm(`Estas fichas já existem e serão substituídas:\n${names}\n\nContinuar?`)) return;
    }
    dispatch({ type: 'fichas/imported', fichas: imported });
    notify([`${imported.length} ficha(s) importada(s).`, ...result.warnings].join('\n'));
  };

  const exportAll = () => {
    downloadText(`vampire-pages-fichas-${todayStamp()}.json`, serializeSheetFile(state.fichas));
    notify(`${state.fichas.length} ficha(s) exportada(s).`);
  };

  return (
    <header className={styles.bar}>
      {onOpenMenu !== null && <IconButton label="Abrir menu" icon={<MenuIcon />} aria-controls="main-menu" onClick={onOpenMenu} />}
      <h1 className={styles.title}>{title}</h1>
      <div className={styles.actions}>
        <IconButton
          label={readOnly ? 'Modo leitura ativo. Clique para permitir edição' : 'Ativar modo leitura'}
          icon={readOnly ? <EyeIcon /> : <EyeOffIcon />}
          active={readOnly}
          aria-pressed={readOnly}
          onClick={onToggleReadOnly}
        />
        <button type="button" className={styles.action} onClick={createNew}>
          + Nova ficha
        </button>
        <button type="button" className={styles.action} onClick={() => fileInput.current?.click()}>
          Importar
        </button>
        <button type="button" className={styles.action} onClick={exportAll} disabled={state.fichas.length === 0}>
          Exportar todas
        </button>
        <input
          ref={fileInput}
          type="file"
          accept=".json,application/json"
          hidden
          onChange={(event) => {
            const file = event.target.files?.[0];
            event.target.value = '';
            if (file !== undefined) void importFile(file);
          }}
        />
      </div>
    </header>
  );
}
