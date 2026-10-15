import { useEffect, useId, useRef, useState, type ReactNode } from 'react';
import styles from './Menu.module.css';

export interface MenuItem {
  label: string;
  onSelect: () => void;
  danger?: boolean;
}

interface MenuProps {
  /** Accessible name of the trigger. */
  label: string;
  trigger: ReactNode;
  items: readonly MenuItem[];
  /** "end" opens the list aligned to the trigger's end edge (for triggers in a right corner). */
  align?: 'start' | 'end';
}

/** Disclosure menu: closes on Escape, on outside click and after choosing an item. */
export function Menu({ label, trigger, items, align = 'start' }: MenuProps) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const menuId = useId();

  useEffect(() => {
    if (!open) return undefined;
    const onPointerDown = (event: PointerEvent) => {
      if (event.target instanceof Node && !rootRef.current?.contains(event.target)) setOpen(false);
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false);
    };
    document.addEventListener('pointerdown', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('pointerdown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [open]);

  return (
    <div className={styles.root} ref={rootRef}>
      <button
        type="button"
        className={`${styles.trigger} ${open ? styles.triggerOpen : ''}`}
        aria-label={label}
        title={label}
        aria-expanded={open}
        aria-controls={menuId}
        onClick={() => setOpen((value) => !value)}
      >
        {trigger}
      </button>
      {open && (
        <ul id={menuId} className={`${styles.menu} ${align === 'end' ? styles.alignEnd : ''}`}>
          {items.map((item) => (
            <li key={item.label}>
              <button
                type="button"
                className={`${styles.item} ${item.danger ? styles.danger : ''}`}
                onClick={() => {
                  setOpen(false);
                  item.onSelect();
                }}
              >
                {item.label}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
