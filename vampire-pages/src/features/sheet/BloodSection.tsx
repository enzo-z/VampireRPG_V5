import { BLOOD_POTENCY_RANGE } from '../../domain/character.ts';
import { isSameSelection, type Selection } from '../../reference/lookup.ts';
import type { BloodTextField } from '../../store/sheetsReducer.ts';
import { Dots } from '../../ui/Dots.tsx';
import { SectionTitle } from '../../ui/SectionTitle.tsx';
import { TextField } from '../../ui/TextField.tsx';
import { useSheet } from './SheetContext.tsx';
import styles from './BloodSection.module.css';

const SHORT_FIELDS: readonly { field: BloodTextField; label: string }[] = [
  { field: 'resonance', label: 'Resonance' },
  { field: 'surge', label: 'Blood Surge' },
  { field: 'mendAmount', label: 'Mend Amount' },
  { field: 'rouseReRoll', label: 'Rouse Re-Roll' },
  { field: 'baneSeverity', label: 'Bane Severity' },
];

const LONG_FIELDS: readonly { field: BloodTextField; label: string }[] = [
  { field: 'clanBane', label: 'Clan Bane' },
  { field: 'clanCompulsion', label: 'Compulsão de Clã' },
];

const BLOOD_POTENCY: Selection = { kind: 'tracker', tracker: 'bloodPotency' };

export function BloodSection() {
  const { ficha, readOnly, edit, selection, select } = useSheet();
  const change = (field: BloodTextField) => (value: string) => edit({ type: 'blood/changed', id: ficha.id, field, value });
  const bpSelected = isSameSelection(selection, BLOOD_POTENCY);

  return (
    <section aria-labelledby="blood-title">
      <SectionTitle id="blood-title">The Blood</SectionTitle>
      <div className={`${styles.potency} ${bpSelected ? styles.selected : ''}`}>
        <button type="button" className={styles.potencyLabel} aria-pressed={bpSelected} onClick={() => select(BLOOD_POTENCY)}>
          Blood Potency
        </button>
        <Dots
          value={ficha.blood.potency}
          max={BLOOD_POTENCY_RANGE.max}
          label="Blood Potency"
          groupSize={5}
          onPick={
            readOnly
              ? undefined
              : (index) => {
                  edit({ type: 'blood/potencyPicked', id: ficha.id, index });
                  select(BLOOD_POTENCY);
                }
          }
        />
      </div>
      <div className={styles.shortFields}>
        {SHORT_FIELDS.map(({ field, label }) => (
          <TextField key={field} label={label} value={ficha.blood[field]} onChange={change(field)} readOnly={readOnly} />
        ))}
      </div>
      <div className={styles.longFields}>
        {LONG_FIELDS.map(({ field, label }) => (
          <TextField key={field} label={label} value={ficha.blood[field]} onChange={change(field)} readOnly={readOnly} multiline />
        ))}
      </div>
    </section>
  );
}
