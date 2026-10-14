import { useCallback, useEffect, useLayoutEffect, useRef, useState, type CSSProperties } from 'react';
import type { Ficha } from '../../domain/character.ts';
import type { SheetsAction } from '../../store/sheetsReducer.ts';
import { overflowPx, PRINT_HEIGHT_LIMIT_PX } from './printLayout.ts';
import { PrintSheet } from './PrintSheet.tsx';
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

export function PrintView({ ficha, edit, autoPrint, onBack }: PrintViewProps) {
  const pageRef = useRef<HTMLDivElement>(null);
  const [height, setHeight] = useState(0);
  const overflow = overflowPx(height);

  const measure = useCallback(() => {
    if (pageRef.current !== null) setHeight(contentHeight(pageRef.current));
  }, []);

  useLayoutEffect(() => {
    const page = pageRef.current;
    if (page === null) return undefined;
    measure();
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

  const markerStyle = { '--limit-px': `${PRINT_HEIGHT_LIMIT_PX}px` } as CSSProperties;

  return (
    <div className={styles.view}>
      <div className={styles.toolbar} data-print="hide">
        <button type="button" className={styles.action} onClick={onBack}>
          ← Voltar à ficha
        </button>
        <button type="button" className={styles.primary} onClick={print}>
          Imprimir / salvar PDF
        </button>
        <span className={styles.hint}>No diálogo: papel A4, margens padrão, uma página.</span>
        {overflow > 0 && (
          <p className={styles.warning} role="alert">
            A ficha passou {overflow} px do limite de uma página A4 ({PRINT_HEIGHT_LIMIT_PX} px). Encurte textos longos
            (especializações, Clan Bane, Compulsão) antes de imprimir.
          </p>
        )}
      </div>
      <div className={styles.stage}>
        <div className={styles.sheetFrame} style={markerStyle}>
          <PrintSheet ref={pageRef} ficha={ficha} edit={edit} />
          <div className={styles.limitMarker} data-print="hide" aria-hidden="true">
            <span>fim da página A4</span>
          </div>
        </div>
      </div>
    </div>
  );
}
