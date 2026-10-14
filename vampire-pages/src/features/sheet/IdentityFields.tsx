import type { Identity } from '../../domain/character.ts';
import { matchIdentity, type CatalogField } from '../../domain/identityCatalog.ts';
import { IDENTITY_FIELD_LABELS, isSameSelection } from '../../reference/lookup.ts';
import { useSheet } from './SheetContext.tsx';
import styles from './IdentityFields.module.css';

const CATALOG_FIELDS: readonly CatalogField[] = ['clan', 'sect', 'predatorType', 'generation'];

const WIDTH_CLASS: Readonly<Record<CatalogField, string>> = {
  clan: '',
  sect: styles.medium ?? '',
  predatorType: '',
  generation: styles.narrow ?? '',
};

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
          const matched = matchIdentity(field, value).matched;
          const selected = isSameSelection(selection, { kind: 'identity', field });
          return (
            <label key={field} className={styles.field}>
              <span className={styles.label}>{IDENTITY_FIELD_LABELS[field]}</span>
              <input
                type="text"
                className={[styles.catalogInput, WIDTH_CLASS[field], matched ? '' : styles.unmatched, selected ? styles.selected : ''].join(' ')}
                value={value}
                readOnly={readOnly}
                aria-description={matched ? 'reconhecido no catálogo' : 'sem correspondência no catálogo'}
                onChange={(event) => change(field, event.target.value)}
                onFocus={() => select({ kind: 'identity', field })}
                onClick={() => select({ kind: 'identity', field })}
              />
            </label>
          );
        })}
      </div>
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
