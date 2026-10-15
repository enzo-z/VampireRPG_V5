import type { Identity } from '../../domain/character.ts';
import { PREDATOR_TYPE_INDEX } from '../../catalog/predatorTypesCatalog.ts';
import { matchIdentity, type CatalogField } from '../../domain/identityCatalog.ts';
import { IDENTITY_FIELD_LABELS, isIdentityRecognized, isSameSelection } from '../../reference/lookup.ts';
import { useSheet } from './SheetContext.tsx';
import styles from './IdentityFields.module.css';

const CATALOG_FIELDS: readonly CatalogField[] = ['clan', 'sect', 'predatorType', 'generation'];

const WIDTH_CLASS: Readonly<Record<CatalogField, string>> = {
  clan: '',
  sect: styles.medium ?? '',
  predatorType: '',
  generation: styles.narrow ?? '',
};

/** Fields with a closed list of names get suggestions while typing (free text still allowed). */
const SUGGESTED_FIELDS: readonly CatalogField[] = ['clan', 'sect', 'predatorType'];
const optionsListId = (field: CatalogField) => `identity-options-${field}`;

const OTHER_FIELDS: readonly { field: Exclude<keyof Identity, CatalogField>; label: string }[] = [
  { field: 'player', label: 'Player' },
  { field: 'chronicle', label: 'Crônica' },
  { field: 'ambition', label: 'Ambição' },
  { field: 'desire', label: 'Desejo' },
];

export function IdentityFields() {
  const { ficha, readOnly, edit, selection, select } = useSheet();
  const change = (field: keyof Identity, value: string) => edit({ type: 'identity/changed', id: ficha.id, field, value });

  return (
    <div className={styles.identity}>
      <div className={styles.primary}>
        {CATALOG_FIELDS.map((field) => {
          const value = ficha.identity[field];
          const matched = isIdentityRecognized(field, value, PREDATOR_TYPE_INDEX);
          const selected = isSameSelection(selection, { kind: 'identity', field });
          return (
            <label key={field} className={styles.field}>
              <span className={styles.label}>{IDENTITY_FIELD_LABELS[field]}</span>
              <input
                type="text"
                className={[styles.catalogInput, WIDTH_CLASS[field], matched ? '' : styles.unmatched, selected ? styles.selected : ''].join(' ')}
                value={value}
                readOnly={readOnly}
                list={!readOnly && SUGGESTED_FIELDS.includes(field) ? optionsListId(field) : undefined}
                autoComplete="off"
                aria-description={matched ? 'reconhecido no catálogo' : 'sem correspondência no catálogo'}
                onChange={(event) => change(field, event.target.value)}
                onFocus={() => select({ kind: 'identity', field })}
                onClick={() => select({ kind: 'identity', field })}
              />
            </label>
          );
        })}
      </div>
      {SUGGESTED_FIELDS.map((field) => (
        <datalist key={field} id={optionsListId(field)}>
          {matchIdentity(field, '').options.map((option) => (
            <option key={option} value={option} />
          ))}
        </datalist>
      ))}
      <div className={styles.secondary}>
        {OTHER_FIELDS.map(({ field, label }) => (
          <label key={field} className={styles.field}>
            <span className={styles.label}>{label}</span>
            <input
              type="text"
              className={styles.plainInput}
              value={ficha.identity[field]}
              readOnly={readOnly}
              onChange={(event) => change(field, event.target.value)}
            />
          </label>
        ))}
      </div>
    </div>
  );
}
