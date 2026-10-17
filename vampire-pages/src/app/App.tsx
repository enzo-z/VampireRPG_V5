import { useEffect, useState } from 'react';
import { ColaView } from '../features/cola/ColaView.tsx';
import { MesaView } from '../features/mesa/MesaView.tsx';
import { PrintView } from '../features/print/PrintView.tsx';
import { SecretDocView } from '../features/secrets/SecretDocView.tsx';
import { SecretsView } from '../features/secrets/SecretsView.tsx';
import { useSecretsLock } from '../features/secrets/useSecretsLock.ts';
import type { SheetPageName } from '../features/sheet/PageTabs.tsx';
import { SheetPage } from '../features/sheet/SheetPage.tsx';
import { SheetsProvider, useSheets } from '../store/SheetsProvider.tsx';
import { ToastProvider, useToast } from '../ui/Toast.tsx';
import { AppBar } from './AppBar.tsx';
import { Sidebar, type ShellView } from './Sidebar.tsx';
import { useSidebar } from './useSidebar.ts';
import styles from './App.module.css';

type View =
  | { name: ShellView }
  | { name: 'print'; autoPrint: boolean }
  | { name: 'cola'; fichaId?: string }
  | { name: 'secret'; slug: string };

function AppContent() {
  const { state, dispatch, storageNotice, dismissStorageNotice } = useSheets();
  const { notify } = useToast();
  const sidebar = useSidebar();
  const secrets = useSecretsLock();
  const [readOnly, setReadOnly] = useState(false);
  const [view, setView] = useState<View>({ name: 'mesa' });
  const [page, setPage] = useState<SheetPageName>('mechanics');
  const active = state.fichas.find((ficha) => ficha.id === state.activeId) ?? null;

  useEffect(() => {
    if (storageNotice === null) return;
    notify(storageNotice);
    dismissStorageNotice();
  }, [storageNotice, notify, dismissStorageNotice]);

  const openFicha = (id: string) => {
    dispatch({ type: 'ficha/activated', id });
    setView({ name: 'sheet' });
    sidebar.closeIfNarrow();
  };
  const printFicha = (id: string) => {
    dispatch({ type: 'ficha/activated', id });
    setView({ name: 'print', autoPrint: true });
  };
  const colaFicha = (id: string) => setView({ name: 'cola', fichaId: id });
  const openMesa = () => {
    setView({ name: 'mesa' });
    sidebar.closeIfNarrow();
  };
  const openSecrets = () => {
    setView({ name: 'secrets' });
    sidebar.closeIfNarrow();
  };

  if (view.name === 'cola') {
    const colaFicha = state.fichas.find((ficha) => ficha.id === view.fichaId);
    return (
      <main>
        <ColaView key={colaFicha?.id ?? 'page-1'} ficha={colaFicha} onBack={openMesa} />
      </main>
    );
  }

  if (view.name === 'secret' && secrets.unlocked) {
    return (
      <main>
        <SecretDocView slug={view.slug} onBack={openSecrets} />
      </main>
    );
  }

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

  // A secret document opened while locked falls back to the password form.
  const shellView: ShellView =
    view.name === 'secrets' || view.name === 'secret' ? 'secrets' : view.name === 'sheet' && active !== null ? 'sheet' : 'mesa';
  const content =
    shellView === 'secrets' ? (
      <SecretsView lock={secrets} onOpen={(slug) => setView({ name: 'secret', slug })} />
    ) : state.fichas.length === 0 ? (
      <section className={styles.empty}>
        <h2 className={styles.emptyTitle}>Nenhuma ficha ainda</h2>
        <p>Crie uma ficha nova ou importe um JSON (deste app ou exportado do app do Pedro) pela barra acima.</p>
      </section>
    ) : shellView === 'sheet' && active !== null ? (
      <SheetPage
        key={active.id}
        ficha={active}
        readOnly={readOnly}
        page={page}
        onPageChange={setPage}
        onPrint={printFicha}
        onCola={colaFicha}
        onDeleted={openMesa}
        onOpenFicha={openFicha}
      />
    ) : (
      <MesaView readOnly={readOnly} onOpenFicha={openFicha} onPrint={printFicha} onCola={colaFicha} />
    );

  return (
    <div className={styles.shell}>
      <Sidebar
        open={sidebar.open}
        narrow={sidebar.narrow}
        onToggle={sidebar.toggle}
        fichas={state.fichas}
        view={shellView}
        activeId={state.activeId}
        onMesa={openMesa}
        onCola={() => setView({ name: 'cola' })}
        onSecrets={openSecrets}
        onFicha={openFicha}
      />
      {sidebar.narrow && sidebar.open && (
        <button type="button" className={styles.scrim} aria-label="Fechar menu" tabIndex={-1} onClick={sidebar.toggle} />
      )}
      <div className={styles.main}>
        <AppBar
          title={shellView === 'sheet' ? 'Ficha' : shellView === 'secrets' ? 'Segredos' : 'Mesa'}
          readOnly={readOnly}
          onToggleReadOnly={() => setReadOnly((value) => !value)}
          onOpenMenu={sidebar.narrow ? sidebar.toggle : null}
          onCreated={openFicha}
        />
        <main>{content}</main>
      </div>
    </div>
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
