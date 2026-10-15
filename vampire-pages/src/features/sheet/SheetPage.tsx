import { useCallback, useEffect, useMemo, useState } from 'react';
import type { Ficha } from '../../domain/character.ts';
import type { Selection } from '../../reference/lookup.ts';
import type { SheetsAction } from '../../store/sheetsReducer.ts';
import { useSheets } from '../../store/SheetsProvider.tsx';
import { AdvantagesSection } from './AdvantagesSection.tsx';
import { BloodSection } from './BloodSection.tsx';
import { DisciplinesSection } from './DisciplinesSection.tsx';
import { ReferencePanel } from './ReferencePanel.tsx';
import { SheetContext, type SheetContextValue } from './SheetContext.tsx';
import { SheetHeader } from './SheetHeader.tsx';
import { AttributesSection, SkillsSection } from './TraitSections.tsx';
import styles from './SheetPage.module.css';

interface SheetPageProps {
  ficha: Ficha;
  readOnly: boolean;
  onToggleReadOnly: () => void;
  onPrint: () => void;
}

/** Ficha B. Render with key={ficha.id} so selection and drafts reset when switching fichas. */
export function SheetPage({ ficha, readOnly, onToggleReadOnly, onPrint }: SheetPageProps) {
  const { dispatch } = useSheets();
  const [selection, setSelection] = useState<Selection | null>(null);

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

  const value = useMemo<SheetContextValue>(
    () => ({ ficha, readOnly, edit, selection, select: setSelection }),
    [ficha, readOnly, edit, selection],
  );

  return (
    <SheetContext value={value}>
      <SheetHeader onToggleReadOnly={onToggleReadOnly} onPrint={onPrint} />
      <div className={styles.body}>
        <div className={styles.main}>
          <AttributesSection />
          <SkillsSection />
          <DisciplinesSection />
          <AdvantagesSection />
          <BloodSection />
        </div>
        <div className={styles.aside}>
          <ReferencePanel />
        </div>
      </div>
    </SheetContext>
  );
}
