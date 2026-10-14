import { useRef } from 'react';
import { createFicha } from '../domain/defaults.ts';
import { downloadText } from '../features/sheet/fileTransfer.ts';
import { parseSheetFile, serializeSheetFile } from '../schema/importExport.ts';
import { useSheets } from '../store/SheetsProvider.tsx';
import { useToast } from '../ui/Toast.tsx';
import styles from './AppBar.module.css';

function todayStamp(): string {
  return new Date().toISOString().slice(0, 10);
}

/** App-level actions: switch ficha, create, import, export all. */
export function AppBar() {
  const { state, dispatch } = useSheets();
  const { notify } = useToast();
  const fileInput = useRef<HTMLInputElement>(null);

  const createNew = () => {
    const ficha = createFicha(crypto.randomUUID(), `Nova ficha ${state.fichas.length + 1}`);
    dispatch({ type: 'ficha/created', ficha });
    notify(`Ficha "${ficha.name}" criada. Clique no nome para renomear.`);
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
    <nav className={styles.bar} aria-label="Fichas">
      <span className={styles.brand}>Vampire Pages</span>
      {state.fichas.length > 0 && (
        <label className={styles.switcher}>
          <span className={styles.switcherLabel}>Ficha</span>
          <select
            className={styles.select}
            value={state.activeId ?? ''}
            onChange={(event) => dispatch({ type: 'ficha/activated', id: event.target.value })}
          >
            {state.fichas.map((ficha) => (
              <option key={ficha.id} value={ficha.id}>
                {ficha.identity.player ? `${ficha.name} · ${ficha.identity.player}` : ficha.name}
              </option>
            ))}
          </select>
        </label>
      )}
      <div className={styles.actions}>
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
    </nav>
  );
}
