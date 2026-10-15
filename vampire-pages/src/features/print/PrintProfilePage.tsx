import type { Ref } from 'react';
import { sideOf, type AdvantageSide } from '../../catalog/advantages.ts';
import type { AdvantageItem, Beliefs, Ficha, Profile } from '../../domain/character.ts';
import type { SheetsAction } from '../../store/sheetsReducer.ts';
import { Dots } from '../../ui/Dots.tsx';
import { PHOTO_ACCEPT, readPhoto } from '../photo/photo.ts';
import styles from './PrintProfilePage.module.css';

interface PrintProfilePageProps {
  ficha: Ficha;
  /** Absent when the sheet cannot be edited (read-only / "olho"). */
  edit: ((action: SheetsAction) => void) | null;
  ref?: Ref<HTMLDivElement>;
  onError: (message: string) => void;
}

/** Rows printed per column even when empty, so they can be filled by hand. */
export const ADVANTAGE_ROWS = 11;
const DEFAULT_DOTS = 5;

const BELIEFS: readonly { field: keyof Beliefs; label: string }[] = [
  { field: 'chronicleTenets', label: 'Chronicle Tenets' },
  { field: 'convictions', label: 'Convictions' },
  { field: 'touchstones', label: 'Touchstones' },
];

const PROFILE_FIELDS: readonly { field: keyof Profile; label: string }[] = [
  { field: 'sire', label: 'Sire' },
  { field: 'birthday', label: 'Birthday' },
  { field: 'age', label: 'Age' },
  { field: 'embraced', label: 'Embraced' },
  { field: 'apparentAge', label: 'Apparent Age' },
];

const COLUMNS: readonly { side: AdvantageSide; title: string; rowLabel: string }[] = [
  { side: 'advantage', title: 'Vantagens (Merits)', rowLabel: 'Vantagem' },
  { side: 'flaw', title: 'Desvantagens (Flaws)', rowLabel: 'Desvantagem' },
];

interface Row {
  /** Position in ficha.advantages, or null for an empty printed row. */
  index: number | null;
  item: AdvantageItem | null;
}

function rowsFor(ficha: Ficha, side: AdvantageSide): Row[] {
  const filled = ficha.advantages.flatMap((item, index) => (sideOf(item.category) === side ? [{ index, item }] : []));
  const empty = Array.from({ length: Math.max(0, ADVANTAGE_ROWS - filled.length) }, (): Row => ({ index: null, item: null }));
  return [...filled, ...empty];
}

function AdvantageRow({ ficha, edit, side, row, label }: { ficha: Ficha; edit: PrintProfilePageProps['edit']; side: AdvantageSide; row: Row; label: string }) {
  const category = side === 'flaw' ? 'flaw' : 'merit';
  const level = row.item?.level ?? 0;
  const name = row.item?.name ?? '';
  const rename = (value: string) => {
    if (edit === null) return;
    if (row.index === null) {
      if (value !== '') edit({ type: 'advantage/created', id: ficha.id, item: { category, name: value, level: 1, note: '' } });
    } else {
      edit({ type: 'advantage/renamed', id: ficha.id, index: row.index, name: value, category: row.item?.category ?? category });
    }
  };
  const pick = (dotIndex: number) => {
    if (edit === null) return;
    if (row.index === null) edit({ type: 'advantage/created', id: ficha.id, item: { category, name: '', level: dotIndex + 1, note: '' } });
    else edit({ type: 'advantage/picked', id: ficha.id, index: row.index, dotIndex });
  };
  const fullName = row.item?.note ? `${name} (${row.item.note})` : name;

  return (
    <div className={styles.advantageRow}>
      <input
        type="text"
        className={styles.line}
        aria-label={label}
        value={row.index !== null && row.item?.note ? fullName : name}
        readOnly={edit === null || (row.index !== null && Boolean(row.item?.note))}
        title={row.item?.note ? 'Nome e detalhe vêm da ficha B' : undefined}
        onChange={(event) => rename(event.target.value)}
      />
      <Dots value={level} max={Math.max(DEFAULT_DOTS, level)} label={label} onPick={edit ? pick : undefined} />
    </div>
  );
}

/** Ficha A, page 2: beliefs, merits and flaws, profile. Fixed to one A4 page. */
export function PrintProfilePage({ ficha, edit, ref, onError }: PrintProfilePageProps) {
  const changeBelief = (field: keyof Beliefs) => (value: string) => edit?.({ type: 'beliefs/changed', id: ficha.id, field, value });
  const changeProfile = (field: keyof Profile) => (value: string) => edit?.({ type: 'profile/changed', id: ficha.id, field, value });

  const choosePhoto = async (file: File | undefined) => {
    if (file === undefined || edit === null) return;
    try {
      edit({ type: 'profile/changed', id: ficha.id, field: 'photo', value: await readPhoto(file) });
    } catch (error) {
      onError(error instanceof Error ? error.message : 'Não foi possível usar a imagem.');
    }
  };

  return (
    <div className={styles.page}>
      <div ref={ref} className={styles.content}>
        <header className={styles.header}>
          <div className={styles.name}>{ficha.name}</div>
          <div className={styles.runningHead}>Ficha · página 2 de 2 · perfil</div>
        </header>

        <h2 className={styles.sectionTitle}>Beliefs</h2>
        <div className={styles.beliefs}>
          {BELIEFS.map(({ field, label }) => (
            <label key={field} className={styles.area}>
              <span className={styles.areaLabel}>{label}</span>
              <textarea
                className={styles.box}
                aria-label={label}
                data-fit-label={label}
                value={ficha.beliefs[field]}
                readOnly={edit === null}
                onChange={(event) => changeBelief(field)(event.target.value)}
              />
            </label>
          ))}
        </div>

        <div className={styles.body}>
          <div className={styles.advantages}>
            {COLUMNS.map(({ side, title, rowLabel }) => (
              <section key={side} className={styles.advantageGroup} aria-label={title}>
                <h2 className={styles.sectionTitle}>{title}</h2>
                <div className={styles.advantageRows} data-fit-label={title}>
                  {rowsFor(ficha, side).map((row, position) => (
                    <AdvantageRow key={row.index ?? `empty-${position}`} ficha={ficha} edit={edit} side={side} row={row} label={`${rowLabel} ${position + 1}`} />
                  ))}
                </div>
              </section>
            ))}
          </div>

          <section className={styles.profile} aria-label="Profile">
            <h2 className={styles.sectionTitle}>Profile</h2>
            <div className={styles.profileTop}>
              <label className={styles.photo}>
                {ficha.profile.photo ? (
                  <img className={styles.photoImage} src={ficha.profile.photo} alt={`Foto de ${ficha.name}`} />
                ) : (
                  <span className={styles.photoHint}>
                    Foto
                    <br />3 × 4 cm
                    {edit !== null && (
                      <span className={styles.photoAction} data-print="hide">
                        <br />
                        clique para escolher
                      </span>
                    )}
                  </span>
                )}
                {edit !== null && (
                  <input
                    type="file"
                    accept={PHOTO_ACCEPT}
                    className={styles.photoInput}
                    aria-label="Escolher foto do personagem"
                    onChange={(event) => {
                      void choosePhoto(event.target.files?.[0]);
                      event.target.value = '';
                    }}
                  />
                )}
              </label>
              <div className={styles.profileFields}>
                {PROFILE_FIELDS.map(({ field, label }) => (
                  <label key={field} className={styles.profileField}>
                    <span>{label}</span>
                    <input
                      type="text"
                      className={styles.line}
                      value={ficha.profile[field]}
                      readOnly={edit === null}
                      onChange={(event) => changeProfile(field)(event.target.value)}
                    />
                  </label>
                ))}
                {edit !== null && ficha.profile.photo !== '' && (
                  <button type="button" className={styles.removePhoto} data-print="hide" onClick={() => changeProfile('photo')('')}>
                    Remover foto
                  </button>
                )}
              </div>
            </div>

            <label className={`${styles.area} ${styles.description}`}>
              <span className={styles.areaLabel}>Description &amp; Features</span>
              <textarea
                className={styles.box}
                aria-label="Description & Features"
                data-fit-label="Description & Features"
                value={ficha.profile.description}
                readOnly={edit === null}
                onChange={(event) => changeProfile('description')(event.target.value)}
              />
            </label>

            <div className={styles.bottomAreas}>
              <label className={`${styles.area} ${styles.notes}`}>
                <span className={styles.areaLabel}>Notes</span>
                <textarea
                  className={styles.box}
                  aria-label="Notes"
                  data-fit-label="Notes"
                  value={ficha.notes}
                  readOnly={edit === null}
                  onChange={(event) => edit?.({ type: 'notes/changed', id: ficha.id, value: event.target.value })}
                />
              </label>
              <label className={`${styles.area} ${styles.concept}`}>
                <span className={styles.areaLabel}>Concept</span>
                <textarea
                  className={styles.box}
                  aria-label="Concept"
                  data-fit-label="Concept"
                  value={ficha.profile.concept}
                  readOnly={edit === null}
                  onChange={(event) => changeProfile('concept')(event.target.value)}
                />
              </label>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
