import { useCallback, useEffect, useLayoutEffect, useRef, useState, type CSSProperties } from 'react';
import { COLA_CATALOG } from '../../catalog/colaCatalog.ts';
import { DISCIPLINE_INDEX } from '../../catalog/disciplines.ts';
import { PLAYER_COLA_CATALOG } from '../../catalog/playerColasCatalog.ts';
import type { Ficha } from '../../domain/character.ts';
import { overflowingFields } from '../print/fit.ts';
import { PRINT_LAYOUT_WIDTH_PX, PRINT_PAGE_HEIGHT_PX, PRINT_ZOOM } from '../print/printLayout.ts';
import scale from '../print/printScale.module.css';
import printStyles from '../print/PrintView.module.css';
import { ColaPage } from './ColaPage.tsx';
import { PlayerColaPage } from './PlayerColaPage.tsx';
import { buildPlayerCola } from './playerCola.ts';

const CATALOGS = { disciplines: DISCIPLINE_INDEX, playerColas: PLAYER_COLA_CATALOG };

const PAGE_STYLE = {
  '--print-layout-width': `${PRINT_LAYOUT_WIDTH_PX}px`,
  '--print-zoom': String(PRINT_ZOOM),
  '--print-page-height': `${PRINT_PAGE_HEIGHT_PX}px`,
} as CSSProperties;

/**
 * The player's cheat sheet, full screen like the print view: back, print, overflow warning.
 * Without a ficha it is page 1 (the same for everyone); with one, page 2 of that character.
 */
export function ColaView({ onBack, ficha }: { onBack: () => void; ficha?: Ficha }) {
  const pageRef = useRef<HTMLDivElement>(null);
  const playerCola = ficha === undefined ? null : buildPlayerCola(ficha, CATALOGS);
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
        <span className={printStyles.hint}>
          {playerCola === null
            ? 'Cola do jogador, página 1 (igual para todos).'
            : `Cola do jogador, página 2 (${playerCola.name}).`}{' '}
          No diálogo: papel A4, margens padrão.
        </span>
        {playerCola !== null && playerCola.warnings.length > 0 && (
          <p className={printStyles.warning} data-print="hide">
            Avisos (não saem no papel): {playerCola.warnings.join(' · ')}
          </p>
        )}
        {tooLong.length > 0 && (
          <p className={printStyles.warning} role="alert">
            O texto não cabe em: {tooLong.join(', ')}. Encurte a nota "Cola do Jogador" no Obsidian; o que passar não sai no papel.
          </p>
        )}
      </div>
      <div className={printStyles.stage}>
        <div className={`${scale.scale} ${printStyles.sheets}`} style={PAGE_STYLE}>
          <div className={printStyles.sheetFrame}>
            {playerCola === null ? (
              <ColaPage ref={pageRef} cola={COLA_CATALOG} />
            ) : (
              <PlayerColaPage ref={pageRef} cola={playerCola} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
