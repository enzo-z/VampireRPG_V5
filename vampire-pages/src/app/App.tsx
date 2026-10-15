import { useEffect, useState } from 'react';
import { PrintView } from '../features/print/PrintView.tsx';
import type { SheetPageName } from '../features/sheet/PageTabs.tsx';
import { SheetPage } from '../features/sheet/SheetPage.tsx';
import { SheetsProvider, useSheets } from '../store/SheetsProvider.tsx';
import { ToastProvider, useToast } from '../ui/Toast.tsx';
import { AppBar } from './AppBar.tsx';
import styles from './App.module.css';

type View = { name: 'sheet' } | { name: 'print'; autoPrint: boolean };

function AppContent() {
  const { state, dispatch, storageNotice, dismissStorageNotice } = useSheets();
  const { notify } = useToast();
  const [readOnly, setReadOnly] = useState(false);
  const [view, setView] = useState<View>({ name: 'sheet' });
  const [page, setPage] = useState<SheetPageName>('mechanics');
  const active = state.fichas.find((ficha) => ficha.id === state.activeId) ?? null;

  useEffect(() => {
    if (storageNotice === null) return;
    notify(storageNotice);
    dismissStorageNotice();
  }, [storageNotice, notify, dismissStorageNotice]);

  if (active !== null && view.name === 'print') {
    return (
      <main>
        <PrintView
          key={active.id}
          ficha={active}
          edit={readOnly ? null : dispatch}
          autoPrint={view.autoPrint}
          onBack={() => setView({ name: 'sheet' })}
        />
      </main>
    );
  }

  return (
    <>
      <AppBar />
      <main>
        {active === null ? (
          <section className={styles.empty}>
            <h1 className={styles.emptyTitle}>Nenhuma ficha ainda</h1>
            <p>Crie uma ficha nova ou importe um JSON (deste app ou exportado do app do Pedro) pela barra acima.</p>
          </section>
        ) : (
          <SheetPage
            key={active.id}
            ficha={active}
            readOnly={readOnly}
            page={page}
            onPageChange={setPage}
            onToggleReadOnly={() => setReadOnly((value) => !value)}
            onPrint={() => setView({ name: 'print', autoPrint: true })}
          />
        )}
      </main>
    </>
  );
}

export function App() {
  return (
    <ToastProvider>
      <SheetsProvider>
        <AppContent />
      </SheetsProvider>
    </ToastProvider>
  );
}
