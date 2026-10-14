import { useEffect, useState } from 'react';
import { SheetPage } from '../features/sheet/SheetPage.tsx';
import { SheetsProvider, useSheets } from '../store/SheetsProvider.tsx';
import { ToastProvider, useToast } from '../ui/Toast.tsx';
import { AppBar } from './AppBar.tsx';
import styles from './App.module.css';

function AppContent() {
  const { state, storageNotice, dismissStorageNotice } = useSheets();
  const { notify } = useToast();
  const [readOnly, setReadOnly] = useState(false);
  const active = state.fichas.find((ficha) => ficha.id === state.activeId) ?? null;

  useEffect(() => {
    if (storageNotice === null) return;
    notify(storageNotice);
    dismissStorageNotice();
  }, [storageNotice, notify, dismissStorageNotice]);

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
            onToggleReadOnly={() => setReadOnly((value) => !value)}
            onPrint={() => window.print()}
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
