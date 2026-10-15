import { findAdvantage, SIDE_CATEGORIES, sideOf, type AdvantageSide } from '../../catalog/advantages.ts';
import { ADVANTAGE_INDEX } from '../../catalog/advantagesCatalog.ts';
import type { AdvantageCategory } from '../../catalog/types.ts';
import { isSameSelection, type Selection } from '../../reference/lookup.ts';
import { Dots } from '../../ui/Dots.tsx';
import { IconButton } from '../../ui/IconButton.tsx';
import { CloseIcon } from '../../ui/icons.tsx';
import { SectionTitle } from '../../ui/SectionTitle.tsx';
import { useSheet } from './SheetContext.tsx';
import styles from './AdvantagesSection.module.css';

const LIST_IDS: Readonly<Record<AdvantageSide, string>> = { advantage: 'catalog-advantages', flaw: 'catalog-flaws' };
const COLUMN_TITLES: Readonly<Record<AdvantageSide, string>> = { advantage: 'Merits, Backgrounds e Loresheets', flaw: 'Flaws' };
const ADD_LABELS: Readonly<Record<AdvantageSide, string>> = { advantage: '+ Vantagem', flaw: '+ Defeito' };
const CATEGORY_LABELS: Readonly<Record<AdvantageCategory, string>> = { merit: 'Merit', background: 'Background', flaw: 'Flaw', loresheet: 'Loresheet' };
const DEFAULT_MAX_DOTS = 5;

function AdvantageRow({ index, side }: { index: number; side: AdvantageSide }) {
  const { ficha, readOnly, edit, selection, select } = useSheet();
  const item = ficha.advantages[index];
  if (item === undefined) return null;

  const match = findAdvantage(ADVANTAGE_INDEX, side, item.name);
  const unmatched = item.name.trim() !== '' && match === null;
  const max = Math.max(match?.points.max ?? DEFAULT_MAX_DOTS, item.level);
  const target: Selection = { kind: 'advantage', index };
  const selected = isSameSelection(selection, target);
  const label = item.name || (side === 'flaw' ? 'Defeito' : 'Vantagem');

  if (readOnly) {
    return (
      <button type="button" className={`${styles.row} ${styles.readRow} ${selected ? styles.selected : ''}`} aria-pressed={selected} onClick={() => select(target)}>
        <span className={`${styles.name} ${unmatched ? styles.unmatched : ''}`}>{label}</span>
        <span className={styles.noteText}>{item.note}</span>
        <Dots value={item.level} max={max} label={label} />
      </button>
    );
  }

  return (
    <div className={`${styles.row} ${selected ? styles.selected : ''}`}>
      <input
        type="text"
        className={`${styles.nameInput} ${unmatched ? styles.unmatched : ''}`}
        list={LIST_IDS[side]}
        value={item.name}
        aria-label={`${side === 'flaw' ? 'Defeito' : 'Vantagem'} ${index + 1}`}
        title={unmatched ? 'Não encontrado em Advantages.md' : undefined}
        onFocus={() => select(target)}
        onChange={(event) => {
          const name = event.target.value;
          const found = findAdvantage(ADVANTAGE_INDEX, side, name);
          const category: AdvantageCategory = side === 'flaw' ? 'flaw' : (found?.category ?? 'merit');
          edit({ type: 'advantage/renamed', id: ficha.id, index, name, category });
        }}
      />
      <input
        type="text"
        className={styles.noteInput}
        value={item.note}
        aria-label={`Detalhe de ${label}`}
        onFocus={() => select(target)}
        onChange={(event) => edit({ type: 'advantage/noteChanged', id: ficha.id, index, note: event.target.value })}
      />
      <Dots
        value={item.level}
        max={max}
        label={label}
        onPick={(dotIndex) => {
          edit({ type: 'advantage/picked', id: ficha.id, index, dotIndex });
          select(target);
        }}
      />
      <IconButton
        label={`Remover ${label}`}
        icon={<CloseIcon />}
        onClick={() => {
          edit({ type: 'advantage/removed', id: ficha.id, index });
          select(null);
        }}
      />
    </div>
  );
}

function AdvantageColumn({ side }: { side: AdvantageSide }) {
  const { ficha, readOnly, edit } = useSheet();
  const indexes = ficha.advantages.flatMap((item, index) => (sideOf(item.category) === side ? [index] : []));

  return (
    <div className={styles.column}>
      <h3 className={styles.columnTitle}>{COLUMN_TITLES[side]}</h3>
      {indexes.map((index) => (
        <AdvantageRow key={index} index={index} side={side} />
      ))}
      {indexes.length === 0 && readOnly && <p className={styles.empty}>Nenhum.</p>}
      {!readOnly && (
        <button type="button" className={styles.add} onClick={() => edit({ type: 'advantage/added', id: ficha.id, side })}>
          {ADD_LABELS[side]}
        </button>
      )}
    </div>
  );
}

export function AdvantagesSection() {
  return (
    <section aria-labelledby="advantages-title">
      <SectionTitle id="advantages-title">Vantagens e Defeitos</SectionTitle>
      {(['advantage', 'flaw'] as const).map((side) => (
        <datalist key={side} id={LIST_IDS[side]}>
          {ADVANTAGE_INDEX.entries
            .filter((entry) => SIDE_CATEGORIES[side].includes(entry.category))
            .map((entry) => (
              <option
                key={entry.name}
                value={entry.name}
                label={[CATEGORY_LABELS[entry.category], entry.group, entry.pointsLabel].filter((part) => part !== null && part !== '').join(' · ')}
              />
            ))}
        </datalist>
      ))}
      <div className={styles.columns}>
        <AdvantageColumn side="advantage" />
        <AdvantageColumn side="flaw" />
      </div>
    </section>
  );
}
