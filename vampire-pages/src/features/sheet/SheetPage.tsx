import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import type { Ficha } from '../../domain/character.ts';
import type { Selection } from '../../reference/lookup.ts';
import type { SheetsAction } from '../../store/sheetsReducer.ts';
import { useSheets } from '../../store/SheetsProvider.tsx';
import { AdvantagesSection } from './AdvantagesSection.tsx';
import { BloodSection } from './BloodSection.tsx';
import { DisciplinesSection } from './DisciplinesSection.tsx';
import { PageTabs, SHEET_PAGES, SHEET_PANEL_ID, tabId, type SheetPageName } from './PageTabs.tsx';
import { BeliefsSection, ProfileSection } from './ProfileSection.tsx';
import { ReferencePanel } from './ReferencePanel.tsx';
import { SheetContext, type SheetContextValue } from './SheetContext.tsx';
import { SheetHeader } from './SheetHeader.tsx';
import { AttributesSection, SkillsSection } from './TraitSections.tsx';
import styles from './SheetPage.module.css';

interface SheetPageProps {
  ficha: Ficha;
  readOnly: boolean;
  /** Kept by the app, so switching fichas keeps the same page. */
  page: SheetPageName;
  onPageChange: (page: SheetPageName) => void;
  onPrint: (id: string) => void;
  onDeleted: () => void;
  onOpenFicha: (id: string) => void;
}

function PageContent({ page }: { page: SheetPageName }) {
  if (page === 'mechanics') {
    return (
      <>
        <AttributesSection />
        <SkillsSection />
        <DisciplinesSection />
      </>
    );
  }
  return (
    <>
      <ProfileSection />
      <BeliefsSection />
      <AdvantagesSection />
      <BloodSection />
    </>
  );
}

/** Ficha B. Render with key={ficha.id} so selection and drafts reset when switching fichas. */
export function SheetPage({ ficha, readOnly, page, onPageChange, onPrint, onDeleted, onOpenFicha }: SheetPageProps) {
  const { dispatch } = useSheets();
  const [selection, setSelection] = useState<Selection | null>(null);
  const tabsAnchor = useRef<HTMLDivElement>(null);
  const turnedPage = useRef(false);

  const edit = useCallback(
    (action: SheetsAction) => {
      if (!readOnly) dispatch(action);
    },
    [dispatch, readOnly],
  );

  useEffect(() => {
    if (selection === null) return undefined;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && !event.defaultPrevented) setSelection(null);
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [selection]);

  // After a page turn, start the new page at its top (just under the sticky tabs) when scrolled past it.
  useLayoutEffect(() => {
    if (!turnedPage.current || tabsAnchor.current === null) return;
    turnedPage.current = false;
    const top = tabsAnchor.current.getBoundingClientRect().top + window.scrollY;
    if (window.scrollY > top) window.scrollTo({ top });
  }, [page]);

  const changePage = (next: SheetPageName) => {
    if (next === page) return;
    turnedPage.current = true;
    setSelection(null);
    onPageChange(next);
  };

  const value = useMemo<SheetContextValue>(
    () => ({ ficha, readOnly, edit, selection, select: setSelection }),
    [ficha, readOnly, edit, selection],
  );

  const otherPage = SHEET_PAGES.find((info) => info.name !== page);

  return (
    <SheetContext value={value}>
      <SheetHeader onPrint={onPrint} onDeleted={onDeleted} onOpenFicha={onOpenFicha} />
      <div ref={tabsAnchor} />
      <PageTabs page={page} onChange={changePage} />
      <div className={styles.body}>
        <div className={styles.main} role="tabpanel" id={SHEET_PANEL_ID} aria-labelledby={tabId(page)}>
          <PageContent page={page} />
          {otherPage !== undefined && (
            <button type="button" className={styles.turn} onClick={() => changePage(otherPage.name)}>
              {page === 'mechanics' ? (
                <>
                  Página {otherPage.numeral} · {otherPage.title} <span aria-hidden="true">→</span>
                </>
              ) : (
                <>
                  <span aria-hidden="true">←</span> Página {otherPage.numeral} · {otherPage.title}
                </>
              )}
            </button>
          )}
        </div>
        <div className={styles.aside}>
          <ReferencePanel />
        </div>
      </div>
    </SheetContext>
  );
}
