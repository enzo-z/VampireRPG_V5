import type { ReactNode } from 'react';
import type { Ficha } from '../domain/character.ts';
import { BookIcon, ChevronLeftIcon, ChevronRightIcon, DieIcon, ListIcon, TableIcon } from '../ui/icons.tsx';
import styles from './Sidebar.module.css';

export type ShellView = 'mesa' | 'sheet';

interface SidebarProps {
  open: boolean;
  /** Narrow screens: the sidebar is a drawer, hidden when closed. */
  narrow: boolean;
  onToggle: () => void;
  fichas: readonly Ficha[];
  view: ShellView;
  activeId: string | null;
  onMesa: () => void;
  onFicha: (id: string) => void;
  /** Opens the player's cheat sheet (page 1, the same for everyone). */
  onCola: () => void;
}

/** "Nina Blue Calloway" → "NB"; a copy keeps its number: "Nina (1)" → "N1". */
function monogram(name: string): string {
  const copy = /\((\d+)\)$/.exec(name.trim())?.[1] ?? '';
  const letters = name
    .split(/\s+/)
    .filter((word) => /^\p{L}/u.test(word))
    .map((word) => word[0] ?? '');
  const initials = letters.slice(0, copy === '' ? 2 : 1).join('') || '?';
  return `${initials}${copy}`.toLocaleUpperCase('pt-BR');
}

function NavItem({ icon, label, current, disabled, note, onClick, open }: {
  icon: ReactNode;
  label: string;
  current?: boolean;
  disabled?: boolean;
  note?: string;
  onClick?: () => void;
  open: boolean;
}) {
  return (
    <button
      type="button"
      className={`${styles.item} ${current ? styles.current : ''}`}
      aria-current={current ? 'page' : undefined}
      disabled={disabled}
      title={open ? undefined : note === undefined ? label : `${label} (${note})`}
      aria-label={open ? undefined : label}
      onClick={onClick}
    >
      <span className={styles.icon} aria-hidden="true">
        {icon}
      </span>
      {open && (
        <span className={styles.label}>
          {label}
          {note !== undefined && <span className={styles.note}>{note}</span>}
        </span>
      )}
    </button>
  );
}

/** Collapsible main menu: Fichas (Mesa and every ficha), Vault and Backlog (later). */
export function Sidebar({ open, narrow, onToggle, fichas, view, activeId, onMesa, onFicha, onCola }: SidebarProps) {
  return (
    <nav
      id="main-menu"
      aria-label="Menu principal"
      className={`${styles.sidebar} ${open ? styles.open : styles.closed} ${narrow ? styles.drawer : ''}`}
      hidden={narrow && !open}
    >
      <div className={styles.top}>
        {open && <span className={styles.brand}>Vampire Pages</span>}
        <button
          type="button"
          className={styles.toggle}
          aria-label={open ? 'Recolher menu' : 'Expandir menu'}
          aria-expanded={open}
          aria-controls="main-menu"
          title={open ? 'Recolher menu' : 'Expandir menu'}
          onClick={onToggle}
        >
          {open ? <ChevronLeftIcon /> : <ChevronRightIcon />}
        </button>
      </div>

      {open && <p className={styles.group}>Fichas</p>}
      <NavItem icon={<TableIcon />} label="Mesa" current={view === 'mesa'} onClick={onMesa} open={open} />
      <ul className={styles.fichas} aria-label="Fichas">
        {fichas.map((ficha) => {
          const current = view === 'sheet' && ficha.id === activeId;
          const clan = ficha.identity.clan.trim();
          return (
            <li key={ficha.id}>
              <button
                type="button"
                className={`${styles.ficha} ${current ? styles.current : ''}`}
                aria-current={current ? 'page' : undefined}
                aria-label={open ? undefined : `Ficha de ${ficha.name}`}
                title={open ? undefined : ficha.name}
                onClick={() => onFicha(ficha.id)}
              >
                {open ? (
                  <span className={styles.fichaText}>
                    <span className={styles.fichaName}>{ficha.name}</span>
                    {clan !== '' && <span className={styles.fichaSub}>{clan}</span>}
                  </span>
                ) : (
                  <span className={styles.monogram} aria-hidden="true">
                    {monogram(ficha.name)}
                  </span>
                )}
              </button>
            </li>
          );
        })}
      </ul>

      {open && <p className={styles.group}>Mesa de jogo</p>}
      <NavItem icon={<DieIcon />} label="Cola do jogador" onClick={onCola} open={open} />

      <div className={styles.later}>
        <NavItem icon={<BookIcon />} label="Vault" note="em breve" disabled open={open} />
        <NavItem icon={<ListIcon />} label="Backlog" note="em breve" disabled open={open} />
      </div>
    </nav>
  );
}
