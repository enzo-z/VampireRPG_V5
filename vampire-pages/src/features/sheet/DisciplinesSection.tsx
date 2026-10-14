import { useState } from 'react';
import { DISCIPLINE_RANGE, POWERS_PER_DISCIPLINE, type Discipline } from '../../domain/character.ts';
import { isSameSelection, type Selection } from '../../reference/lookup.ts';
import { Dots } from '../../ui/Dots.tsx';
import { SectionTitle } from '../../ui/SectionTitle.tsx';
import { useSheet } from './SheetContext.tsx';
import styles from './DisciplinesSection.module.css';

function isEmptyDiscipline(discipline: Discipline): boolean {
  return discipline.name === '' && discipline.value === 0 && discipline.powers.length === 0;
}

function PowerRow({ slot, powerIndex }: { slot: number; powerIndex: number }) {
  const { ficha, readOnly, edit, selection, select } = useSheet();
  const power = ficha.disciplines[slot]?.powers[powerIndex] ?? { name: '', note: '' };
  const target: Selection = { kind: 'power', slot, powerIndex };
  const selected = isSameSelection(selection, target);

  if (readOnly) {
    return (
      <button type="button" className={`${styles.power} ${selected ? styles.selected : ''}`} aria-pressed={selected} onClick={() => select(target)}>
        <span className={styles.powerName}>
          <span aria-hidden="true" className={styles.bullet} />
          {power.name}
        </span>
        <span className={styles.powerNote}>{power.note}</span>
      </button>
    );
  }

  const change = (field: 'name' | 'note', value: string) =>
    edit({ type: 'power/changed', id: ficha.id, slot, powerIndex, field, value });

  return (
    <div className={`${styles.power} ${selected ? styles.selected : ''}`}>
      <span aria-hidden="true" className={styles.bullet} />
      <input
        type="text"
        className={styles.powerNameInput}
        value={power.name}
        aria-label={`Poder ${powerIndex + 1}`}
        onChange={(event) => change('name', event.target.value)}
        onFocus={() => select(target)}
      />
      <input
        type="text"
        className={styles.powerNoteInput}
        value={power.note}
        aria-label={`Nota do poder ${powerIndex + 1} (nível, custo)`}
        onChange={(event) => change('note', event.target.value)}
        onFocus={() => select(target)}
      />
    </div>
  );
}

function DisciplineBlock({ slot }: { slot: number }) {
  const { ficha, readOnly, edit, selection, select } = useSheet();
  const discipline = ficha.disciplines[slot];
  const [expanded, setExpanded] = useState(false);
  if (discipline === undefined) return null;

  const target: Selection = { kind: 'discipline', slot };
  const selected = isSameSelection(selection, target);
  const label = discipline.name || `Disciplina ${slot + 1}`;
  const powerCount = readOnly ? discipline.powers.length : POWERS_PER_DISCIPLINE;

  return (
    <div className={styles.block}>
      <div className={`${styles.header} ${selected ? styles.selected : ''}`}>
        <button
          type="button"
          className={styles.chevron}
          aria-expanded={expanded}
          aria-label={`${expanded ? 'Recolher' : 'Mostrar'} poderes de ${label}`}
          onClick={() => {
            setExpanded((value) => !value);
            select(target);
          }}
        >
          {expanded ? '▾' : '▸'}
        </button>
        {readOnly ? (
          <button type="button" className={styles.nameButton} aria-pressed={selected} onClick={() => select(target)}>
            {label}
          </button>
        ) : (
          <input
            type="text"
            className={styles.nameInput}
            value={discipline.name}
            aria-label={`Nome da disciplina ${slot + 1}`}
            placeholder={`Disciplina ${slot + 1}`}
            onChange={(event) => edit({ type: 'discipline/renamed', id: ficha.id, slot, name: event.target.value })}
            onFocus={() => select(target)}
          />
        )}
        <Dots
          value={discipline.value}
          max={DISCIPLINE_RANGE.max}
          label={label}
          onPick={
            readOnly
              ? undefined
              : (index) => {
                  edit({ type: 'discipline/picked', id: ficha.id, slot, index });
                  select(target);
                }
          }
        />
      </div>
      {expanded && (
        <div className={styles.powers}>
          {Array.from({ length: powerCount }, (_, powerIndex) => (
            <PowerRow key={powerIndex} slot={slot} powerIndex={powerIndex} />
          ))}
          {readOnly && powerCount === 0 && <p className={styles.empty}>Nenhum poder anotado.</p>}
        </div>
      )}
    </div>
  );
}

export function DisciplinesSection() {
  const { ficha, readOnly } = useSheet();
  const slots = ficha.disciplines
    .map((discipline, slot) => ({ discipline, slot }))
    .filter(({ discipline }) => !readOnly || !isEmptyDiscipline(discipline));

  return (
    <section aria-labelledby="disciplines-title">
      <SectionTitle id="disciplines-title">Disciplines</SectionTitle>
      {slots.length === 0 ? (
        <p className={styles.empty}>Nenhuma disciplina.</p>
      ) : (
        <div className={styles.columns}>
          {slots.map(({ slot }) => (
            <DisciplineBlock key={slot} slot={slot} />
          ))}
        </div>
      )}
    </section>
  );
}
