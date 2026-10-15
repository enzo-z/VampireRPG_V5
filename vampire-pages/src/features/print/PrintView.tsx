import { useCallback, useEffect, useLayoutEffect, useRef, useState, type CSSProperties } from 'react';
import type { Ficha } from '../../domain/character.ts';
import type { SheetsAction } from '../../store/sheetsReducer.ts';
import { useToast } from '../../ui/Toast.tsx';
import { overflowPx, PRINT_HEIGHT_LIMIT_PX, PRINT_LAYOUT_WIDTH_PX, PRINT_PAGE_HEIGHT_PX, PRINT_ZOOM } from './printLayout.ts';
import { PrintProfilePage } from './PrintProfilePage.tsx';
import { PrintSheet } from './PrintSheet.tsx';
import { overflowingFields } from './fit.ts';
import scale from './printScale.module.css';
import styles from './PrintView.module.css';

interface PrintViewProps {
  ficha: Ficha;
  edit: ((action: SheetsAction) => void) | null;
  /** Opens the browser print dialog once the fonts are ready. */
  autoPrint: boolean;
  onBack: () => void;
}

/** Height of the page content without its screen-only padding (printing removes it). */
function contentHeight(element: HTMLElement): number {
  const style = window.getComputedStyle(element);
  return element.scrollHeight - Number.parseFloat(style.paddingTop) - Number.parseFloat(style.paddingBottom);
}

const SHEETS_STYLE = {
  '--print-layout-width': `${PRINT_LAYOUT_WIDTH_PX}px`,
  '--print-zoom': String(PRINT_ZOOM),
  '--print-page-height': `${PRINT_PAGE_HEIGHT_PX}px`,
} as CSSProperties;

const MARKER_STYLE = { '--limit-px': `${PRINT_HEIGHT_LIMIT_PX}px` } as CSSProperties;

export function PrintView({ ficha, edit, autoPrint, onBack }: PrintViewProps) {
  const { notify } = useToast();
  const pageRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);
  const [height, setHeight] = useState(0);
  const [tooLong, setTooLong] = useState<string[]>([]);
  const overflow = overflowPx(height);

  const measure = useCallback(() => {
    if (pageRef.current !== null) setHeight(contentHeight(pageRef.current));
    if (profileRef.current !== null) setTooLong(overflowingFields(profileRef.current));
  }, []);

  // Re-measure on every change of the ficha (fixed boxes do not resize) and on layout changes.
  useLayoutEffect(() => {
    measure();
  }, [measure, ficha]);

  useLayoutEffect(() => {
    const page = pageRef.current;
    if (page === null) return undefined;
    const observer = new ResizeObserver(measure);
    observer.observe(page);
    void document.fonts.ready.then(measure);
    return () => observer.disconnect();
  }, [measure]);

  const print = useCallback(() => {
    void document.fonts.ready.then(() => window.print());
  }, []);

  // Cancelled on cleanup so the dialog opens once, even when effects re-run (StrictMode).
  useEffect(() => {
    if (!autoPrint) return undefined;
    let cancelled = false;
    void document.fonts.ready.then(() => {
      if (!cancelled) window.print();
    });
    return () => {
      cancelled = true;
    };
  }, [autoPrint]);

  return (
    <div className={styles.view}>
      <div className={styles.toolbar} data-print="hide">
        <button type="button" className={styles.action} onClick={onBack}>
          ← Voltar à ficha
        </button>
        <button type="button" className={styles.primary} onClick={print}>
          Imprimir / salvar PDF
        </button>
        <span className={styles.hint}>No diálogo: papel A4, margens padrão, duas páginas.</span>
        {overflow > 0 && (
          <p className={styles.warning} role="alert">
            A página 1 passou {overflow} px do limite de uma página A4 ({PRINT_HEIGHT_LIMIT_PX} px). Encurte textos longos
            (especializações, Clan Bane, Compulsão) antes de imprimir.
          </p>
        )}
        {tooLong.length > 0 && (
          <p className={styles.warning} role="alert">
            Na página 2, o texto não cabe em: {tooLong.join(', ')}. Encurte antes de imprimir; o que passar da caixa não sai no papel.
          </p>
        )}
      </div>
      <div className={styles.stage}>
        <div className={`${scale.scale} ${styles.sheets}`} style={SHEETS_STYLE}>
          <div className={styles.sheetFrame} style={MARKER_STYLE}>
            <PrintSheet ref={pageRef} ficha={ficha} edit={edit} />
            <div className={styles.limitMarker} data-print="hide" aria-hidden="true">
              <span>fim da página A4</span>
            </div>
          </div>
          <div className={styles.sheetFrame}>
            <PrintProfilePage ref={profileRef} ficha={ficha} edit={edit} onError={notify} />
          </div>
        </div>
      </div>
    </div>
  );
}
