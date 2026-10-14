import { useState } from 'react';
import { ATTRIBUTE_RANGE, SKILL_RANGE } from '../../domain/character.ts';
import {
  ATTRIBUTE_GROUPS,
  ATTRIBUTE_LABELS,
  SKILL_GROUPS,
  SKILL_LABELS,
  TRAIT_GROUP_LABELS,
  TRAIT_GROUPS,
  type SkillKey,
} from '../../domain/traits.ts';
import { isSameSelection, type Selection } from '../../reference/lookup.ts';
import { SectionTitle } from '../../ui/SectionTitle.tsx';
import { useSheet } from './SheetContext.tsx';
import { TraitRow } from './TraitRow.tsx';
import styles from './TraitSections.module.css';

export function AttributesSection() {
  const { ficha, readOnly, edit, selection, select } = useSheet();

  return (
    <section aria-labelledby="attributes-title">
      <SectionTitle id="attributes-title">Attributes</SectionTitle>
      <div className={styles.columns}>
        {TRAIT_GROUPS.map((group) => (
          <div key={group}>
            <div className={styles.groupName}>{TRAIT_GROUP_LABELS[group]}</div>
            {ATTRIBUTE_GROUPS[group].map((key) => {
              const target: Selection = { kind: 'attribute', key };
              return (
                <TraitRow
                  key={key}
                  label={ATTRIBUTE_LABELS[key]}
                  value={ficha.attributes[key]}
                  max={ATTRIBUTE_RANGE.max}
                  selected={isSameSelection(selection, target)}
                  onSelect={() => select(target)}
                  onPick={
                    readOnly
                      ? undefined
                      : (index) => {
                          edit({ type: 'attribute/picked', id: ficha.id, key, index });
                          select(target);
                        }
                  }
                />
              );
            })}
          </div>
        ))}
      </div>
    </section>
  );
}

function SpecControl({ skill }: { skill: SkillKey }) {
  const { ficha, readOnly, edit } = useSheet();
  const [open, setOpen] = useState(false);
  const spec = ficha.specs[skill] ?? '';
  const label = SKILL_LABELS[skill];

  if (readOnly && spec === '') return null;

  return (
    <>
      <button
        type="button"
        className={`${styles.specButton} ${spec ? styles.specFilled : ''}`}
        aria-expanded={open}
        aria-label={spec ? `Especialização de ${label}: ${spec}` : `Adicionar especialização a ${label}`}
        title={spec || 'Especialização'}
        onClick={() => setOpen((value) => !value)}
      >
        S
      </button>
      {open && (
        <div className={styles.specPopover}>
          <label className={styles.specLabel} htmlFor={`spec-${skill}`}>
            Especialização
          </label>
          <input
            id={`spec-${skill}`}
            type="text"
            className={styles.specInput}
            value={spec}
            readOnly={readOnly}
            autoFocus
            onChange={(event) => edit({ type: 'spec/changed', id: ficha.id, key: skill, value: event.target.value })}
            onKeyDown={(event) => {
              if (event.key === 'Escape' || event.key === 'Enter') setOpen(false);
            }}
          />
        </div>
      )}
    </>
  );
}

export function SkillsSection() {
  const { ficha, readOnly, edit, selection, select } = useSheet();

  return (
    <section aria-labelledby="skills-title">
      <SectionTitle id="skills-title">Skills</SectionTitle>
      <div className={styles.columns}>
        {TRAIT_GROUPS.map((group) => (
          <div key={group}>
            {SKILL_GROUPS[group].map((key) => {
              const target: Selection = { kind: 'skill', key };
              return (
                <TraitRow
                  key={key}
                  label={SKILL_LABELS[key]}
                  value={ficha.skills[key]}
                  max={SKILL_RANGE.max}
                  selected={isSameSelection(selection, target)}
                  onSelect={() => select(target)}
                  onPick={
                    readOnly
                      ? undefined
                      : (index) => {
                          edit({ type: 'skill/picked', id: ficha.id, key, index });
                          select(target);
                        }
                  }
                >
                  <SpecControl skill={key} />
                </TraitRow>
              );
            })}
          </div>
        ))}
      </div>
    </section>
  );
}
