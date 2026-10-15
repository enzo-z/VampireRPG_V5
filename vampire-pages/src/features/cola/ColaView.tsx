import { useCallback, useEffect, useLayoutEffect, useRef, useState, type CSSProperties } from 'react';
import { COLA_CATALOG } from '../../catalog/colaCatalog.ts';
import { overflowingFields } from '../print/fit.ts';
import { PRINT_LAYOUT_WIDTH_PX, PRINT_PAGE_HEIGHT_PX, PRINT_ZOOM } from '../print/printLayout.ts';
import scale from '../print/printScale.module.css';
import printStyles from '../print/PrintView.module.css';
import { ColaPage } from './ColaPage.tsx';

const PAGE_STYLE = {
  '--print-layout-width': `${PRINT_LAYOUT_WIDTH_PX}px`,
  '--print-zoom': String(PRINT_ZOOM),
  '--print-page-height': `${PRINT_PAGE_HEIGHT_PX}px`,
} as CSSProperties;

/** The player's cheat sheet, full screen like the print view: back, print, overflow warning. */
export function ColaView({ onBack }: { onBack: () => void }) {
  const pageRef = useRef<HTMLDivElement>(null);
  const [tooLong, setTooLong] = useState<string[]>([]);

  const measure = useCallback(() => {
    if (pageRef.current !== null) setTooLong(overflowingFields(pageRef.current));
  }, []);

  useLayoutEffect(() => {
    measure();
    void document.fonts.ready.then(measure);
  }, [measure]);

  useEffect(() => {
    window.addEventListener('resize', measure);
    return () => window.removeEventListener('resize', measure);
  }, [measure]);

  return (
    <div className={printStyles.view}>
      <div className={printStyles.toolbar} data-print="hide">
        <button type="button" className={printStyles.action} onClick={onBack}>
          ← Voltar
        </button>
        <button type="button" className={printStyles.primary} onClick={() => void document.fonts.ready.then(() => window.print())}>
          Imprimir / salvar PDF
        </button>
        <span className={printStyles.hint}>Cola do jogador, página 1 (igual para todos). No diálogo: papel A4, margens padrão.</span>
        {tooLong.length > 0 && (
          <p className={printStyles.warning} role="alert">
            O texto não cabe em: {tooLong.join(', ')}. Encurte a nota "Cola do Jogador" no Obsidian; o que passar não sai no papel.
          </p>
        )}
      </div>
      <div className={printStyles.stage}>
        <div className={`${scale.scale} ${printStyles.sheets}`} style={PAGE_STYLE}>
          <div className={printStyles.sheetFrame}>
            <ColaPage ref={pageRef} cola={COLA_CATALOG} />
          </div>
        </div>
      </div>
    </div>
  );
}
