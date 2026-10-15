import { useRef, type KeyboardEvent } from 'react';
import styles from './PageTabs.module.css';

export type SheetPageName = 'mechanics' | 'profile';

interface PageInfo {
  name: SheetPageName;
  numeral: string;
  title: string;
  contents: string;
}

export const SHEET_PAGES: readonly PageInfo[] = [
  { name: 'mechanics', numeral: 'I', title: 'Mecânica', contents: 'Attributes · Skills · Disciplines' },
  { name: 'profile', numeral: 'II', title: 'Perfil', contents: 'Profile · Beliefs · Vantagens · The Blood' },
];

export const SHEET_PANEL_ID = 'sheet-page-panel';
export const tabId = (page: SheetPageName) => `sheet-page-tab-${page}`;

interface PageTabsProps {
  page: SheetPageName;
  onChange: (page: SheetPageName) => void;
}

/** The two pages of ficha B, as tabs styled like the printed running heads. */
export function PageTabs({ page, onChange }: PageTabsProps) {
  const tabRefs = useRef<Partial<Record<SheetPageName, HTMLButtonElement | null>>>({});

  // Arrow keys, Home and End move between tabs (WAI-ARIA tabs pattern, automatic activation).
  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    const current = SHEET_PAGES.findIndex((info) => info.name === page);
    const last = SHEET_PAGES.length - 1;
    const target =
      event.key === 'ArrowRight' ? Math.min(last, current + 1)
      : event.key === 'ArrowLeft' ? Math.max(0, current - 1)
      : event.key === 'Home' ? 0
      : event.key === 'End' ? last
      : null;
    const next = target === null ? undefined : SHEET_PAGES[target];
    if (next === undefined) return;
    event.preventDefault();
    onChange(next.name);
    tabRefs.current[next.name]?.focus();
  };

  return (
    <div className={styles.bar}>
      <div role="tablist" aria-label="Páginas da ficha" className={styles.tabs} onKeyDown={onKeyDown}>
        {SHEET_PAGES.map((info) => {
          const selected = info.name === page;
          return (
            <button
              key={info.name}
              ref={(element) => {
                tabRefs.current[info.name] = element;
              }}
              type="button"
              role="tab"
              id={tabId(info.name)}
              aria-selected={selected}
              aria-controls={SHEET_PANEL_ID}
              tabIndex={selected ? 0 : -1}
              className={`${styles.tab} ${selected ? styles.selected : ''}`}
              onClick={() => onChange(info.name)}
            >
              <span className={styles.numeral} aria-hidden="true">
                {info.numeral}
              </span>
              <span className={styles.text}>
                <span className={styles.title}>{info.title}</span>
                <span className={styles.contents}>{info.contents}</span>
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
