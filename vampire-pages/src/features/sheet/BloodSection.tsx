import { potencyRow } from '../../catalog/blood.ts';
import { BLOOD_CATALOG } from '../../catalog/bloodCatalog.ts';
import { findClan } from '../../catalog/clans.ts';
import { CLAN_INDEX } from '../../catalog/clansCatalog.ts';
import type { PotencyRowEntry } from '../../catalog/types.ts';
import { BLOOD_POTENCY_RANGE } from '../../domain/character.ts';
import { matchIdentity } from '../../domain/identityCatalog.ts';
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

/** Sheet fields filled from the Blood Potency table, with the table column each one takes. */
const FROM_TABLE: readonly { field: BloodTextField; column: keyof PotencyRowEntry; label: string }[] = [
  { field: 'surge', column: 'surge', label: 'Blood Surge' },
  { field: 'mendAmount', column: 'mend', label: 'Mend' },
  { field: 'rouseReRoll', column: 'rouseReRoll', label: 'Rouse Re-Roll' },
  { field: 'baneSeverity', column: 'baneSeverity', label: 'Bane Severity' },
];

export function BloodSection() {
  const { ficha, readOnly, edit, selection, select } = useSheet();
  const change = (field: BloodTextField) => (value: string) => edit({ type: 'blood/changed', id: ficha.id, field, value });
  const bpSelected = isSameSelection(selection, BLOOD_POTENCY);
  const row = potencyRow(BLOOD_CATALOG, ficha.blood.potency);
  const differs = row !== null && FROM_TABLE.some(({ field, column }) => ficha.blood[field] !== String(row[column]));
  const clan = findClan(CLAN_INDEX, matchIdentity('clan', ficha.identity.clan).canonical ?? ficha.identity.clan);
  const clanDiffers = clan !== null && (ficha.blood.clanBane !== clan.baneSummary || ficha.blood.clanCompulsion !== clan.compulsionSummary);
  const fillFromClan = () => {
    if (clan === null) return;
    edit({ type: 'blood/changed', id: ficha.id, field: 'clanBane', value: clan.baneSummary });
    edit({ type: 'blood/changed', id: ficha.id, field: 'clanCompulsion', value: clan.compulsionSummary });
  };
  const fillFromTable = () => {
    if (row === null) return;
    for (const { field, column } of FROM_TABLE) edit({ type: 'blood/changed', id: ficha.id, field, value: String(row[column]) });
  };

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
      {row !== null && (
        <div className={styles.table}>
          <span className={styles.tableTitle}>Pela tabela (Blood Potency {row.level}):</span>
          <span>{FROM_TABLE.map(({ column, label }) => `${label} ${String(row[column])}`).join(' · ')}</span>
          {!readOnly && differs && (
            <button type="button" className={styles.fill} onClick={fillFromTable}>
              Preencher com a tabela
            </button>
          )}
        </div>
      )}
      <div className={styles.shortFields}>
        {SHORT_FIELDS.map(({ field, label }) => (
          <TextField key={field} label={label} value={ficha.blood[field]} onChange={change(field)} readOnly={readOnly} />
        ))}
      </div>
      {clan !== null && !readOnly && clanDiffers && (
        <div className={styles.table}>
          <span className={styles.tableTitle}>Pelo clã ({clan.name}):</span>
          <span>resumos de Clan Bane e Compulsão, curtos para a ficha impressa</span>
          <button type="button" className={styles.fill} onClick={fillFromClan}>
            Preencher com o clã
          </button>
        </div>
      )}
      <div className={styles.longFields}>
        {LONG_FIELDS.map(({ field, label }) => (
          <TextField key={field} label={label} value={ficha.blood[field]} onChange={change(field)} readOnly={readOnly} multiline />
        ))}
      </div>
    </section>
  );
}
