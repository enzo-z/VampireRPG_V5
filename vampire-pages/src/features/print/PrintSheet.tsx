import type { CSSProperties, Ref } from 'react';
import {
  ATTRIBUTE_RANGE,
  BLOOD_POTENCY_RANGE,
  DISCIPLINE_RANGE,
  HUNGER_MAX,
  POWERS_PER_DISCIPLINE,
  SKILL_RANGE,
  TRACK_CAP,
  type BoxState,
  type Ficha,
} from '../../domain/character.ts';
import { pickMax } from '../../domain/trackers.ts';
import {
  ATTRIBUTE_GROUPS,
  ATTRIBUTE_LABELS,
  SKILL_GROUPS,
  SKILL_LABELS,
  TRAIT_GROUP_LABELS,
  TRAIT_GROUPS,
} from '../../domain/traits.ts';
import type { BloodTextField, DamageTrackKey, SheetsAction } from '../../store/sheetsReducer.ts';
import { Boxes } from '../../ui/Boxes.tsx';
import { Dots } from '../../ui/Dots.tsx';
import { AnkhIcon, DropIcon } from '../../ui/icons.tsx';
import { PRINT_LAYOUT_WIDTH_PX, PRINT_ZOOM } from './printLayout.ts';
import styles from './PrintSheet.module.css';

interface PrintSheetProps {
  ficha: Ficha;
  /** Absent when the sheet cannot be edited (read-only / "olho"). */
  edit: ((action: SheetsAction) => void) | null;
}

const IDENTITY_ROWS: readonly { label: string; value: (ficha: Ficha) => string }[] = [
  { label: 'Nome', value: (ficha) => ficha.name },
  { label: 'Player', value: (ficha) => ficha.identity.player },
  { label: 'Crônica', value: (ficha) => ficha.identity.chronicle },
  { label: 'Clã', value: (ficha) => ficha.identity.clan },
  { label: 'Predator Type', value: (ficha) => ficha.identity.predatorType },
  { label: 'Ambição', value: (ficha) => ficha.identity.ambition },
  { label: 'Facção', value: (ficha) => ficha.identity.sect },
  { label: 'Geração', value: (ficha) => ficha.identity.generation },
  { label: 'Desejo', value: (ficha) => ficha.identity.desire },
];

const DAMAGE_NAMES: Readonly<Record<BoxState, string>> = { 0: 'vazia', 1: 'dano superficial', 2: 'dano agravado' };
const HUMANITY_NAMES: Readonly<Record<BoxState, string>> = { 0: 'vazia', 1: 'mancha', 2: 'cheia' };
const HUNGER_NAMES: Readonly<Record<BoxState, string>> = { 0: 'vazia', 1: 'cheia', 2: 'cheia' };

function Title({ children }: { children: string }) {
  return <h2 className={styles.sectionTitle}>{children}</h2>;
}

function LineInput({ label, value, onChange }: { label: string; value: string; onChange: ((value: string) => void) | null }) {
  return (
    <input
      type="text"
      className={styles.lineInput}
      aria-label={label}
      value={value}
      readOnly={onChange === null}
      onChange={(event) => onChange?.(event.target.value)}
    />
  );
}

function DamageColumn({ ficha, edit, track, label }: PrintSheetProps & { track: DamageTrackKey; label: string }) {
  const current = ficha.trackers[track];
  return (
    <div className={styles.trackerBlock}>
      <div className={styles.trackerLabel}>{label}</div>
      <Dots
        value={current.max}
        max={TRACK_CAP}
        label={`Máximo de ${label}`}
        groupSize={5}
        onPick={edit ? (index) => edit({ type: 'tracker/maxSet', id: ficha.id, track, max: pickMax(current.max, index) }) : undefined}
      />
      <Boxes
        states={current.boxes}
        label={label}
        tone="marked"
        size="sm"
        stateNames={DAMAGE_NAMES}
        onPick={edit ? (index) => edit({ type: 'tracker/boxCycled', id: ficha.id, track, index }) : undefined}
      />
    </div>
  );
}

function BloodLine({ ficha, edit, field, label }: PrintSheetProps & { field: BloodTextField; label: string }) {
  return (
    <div className={styles.bloodLine}>
      <span>{label}</span>
      <LineInput
        label={label}
        value={ficha.blood[field]}
        onChange={edit ? (value) => edit({ type: 'blood/changed', id: ficha.id, field, value }) : null}
      />
    </div>
  );
}

function BloodNote({ ficha, edit, field, label }: PrintSheetProps & { field: BloodTextField; label: string }) {
  return (
    <div className={styles.bloodNote}>
      <span className={styles.italic}>{label}</span>
      <textarea
        className={styles.noteArea}
        aria-label={label}
        value={ficha.blood[field]}
        readOnly={edit === null}
        onChange={(event) => edit?.({ type: 'blood/changed', id: ficha.id, field, value: event.target.value })}
      />
    </div>
  );
}

/** Ficha A: one A4 page, every circle and box visible. */
export function PrintSheet({ ficha, edit, ref }: PrintSheetProps & { ref?: Ref<HTMLDivElement> }) {
  const pageStyle = {
    '--print-layout-width': `${PRINT_LAYOUT_WIDTH_PX}px`,
    '--print-zoom': String(PRINT_ZOOM),
  } as CSSProperties;
  const hungerStates = Array.from({ length: HUNGER_MAX }, (_, index): BoxState => (index < ficha.trackers.hunger ? 2 : 0));

  return (
    <div ref={ref} className={styles.page} style={pageStyle}>
      <header className={styles.header}>
        <div className={styles.name}>{ficha.name}</div>
        <div className={styles.runningHead}>Ficha · página 1 de 2 · mecânica</div>
      </header>

      <Title>Identidade</Title>
      <div className={styles.identity}>
        {IDENTITY_ROWS.map(({ label, value }) => (
          <div key={label} className={styles.identityRow}>
            <span>{label}</span>
            <span className={styles.identityValue}>{value(ficha)}</span>
          </div>
        ))}
      </div>

      <Title>Attributes</Title>
      <div className={styles.threeColumns}>
        {TRAIT_GROUPS.map((group) => (
          <div key={group}>
            <div className={styles.groupName}>{TRAIT_GROUP_LABELS[group]}</div>
            {ATTRIBUTE_GROUPS[group].map((key) => (
              <div key={key} className={styles.traitRow}>
                <span>{ATTRIBUTE_LABELS[key]}</span>
                <Dots value={ficha.attributes[key]} max={ATTRIBUTE_RANGE.max} label={ATTRIBUTE_LABELS[key]} />
              </div>
            ))}
          </div>
        ))}
      </div>

      <Title>Skills</Title>
      <div className={styles.threeColumns}>
        {TRAIT_GROUPS.map((group) => (
          <div key={group}>
            {SKILL_GROUPS[group].map((key) => (
              <div key={key} className={styles.skillRow}>
                <span className={styles.noShrink}>{SKILL_LABELS[key]}</span>
                <input
                  type="text"
                  className={styles.specInput}
                  aria-label={`Especialização de ${SKILL_LABELS[key]}`}
                  value={ficha.specs[key] ?? ''}
                  readOnly={edit === null}
                  onChange={(event) => edit?.({ type: 'spec/changed', id: ficha.id, key, value: event.target.value })}
                />
                <Dots value={ficha.skills[key]} max={SKILL_RANGE.max} label={SKILL_LABELS[key]} />
              </div>
            ))}
          </div>
        ))}
      </div>

      <Title>Disciplines</Title>
      <div className={styles.disciplines}>
        {ficha.disciplines.map((discipline, slot) => (
          <div key={slot}>
            <div className={styles.disciplineHeader}>
              <input
                type="text"
                className={styles.disciplineName}
                aria-label={`Nome da disciplina ${slot + 1}`}
                value={discipline.name}
                readOnly={edit === null}
                onChange={(event) => edit?.({ type: 'discipline/renamed', id: ficha.id, slot, name: event.target.value })}
              />
              <Dots value={discipline.value} max={DISCIPLINE_RANGE.max} label={discipline.name || `Disciplina ${slot + 1}`} />
            </div>
            {Array.from({ length: POWERS_PER_DISCIPLINE }, (_, powerIndex) => {
              const power = discipline.powers[powerIndex];
              return (
                <div key={powerIndex} className={styles.powerRow}>
                  <span aria-hidden="true" className={styles.powerBullet} />
                  <span className={styles.powerName}>{power?.name ?? ''}</span>
                  <span className={styles.powerNote}>{power?.note ?? ''}</span>
                </div>
              );
            })}
          </div>
        ))}
      </div>

      <Title>Trackers &amp; The Blood</Title>
      <div className={styles.frame}>
        <div className={styles.frameInner}>
          <div className={styles.column}>
            <DamageColumn ficha={ficha} edit={edit} track="health" label="Saúde" />
            <DamageColumn ficha={ficha} edit={edit} track="willpower" label="Willpower" />
          </div>
          <div className={`${styles.column} ${styles.separated}`}>
            <div className={styles.trackerBlock}>
              <div className={styles.trackerLabel}>
                Humanidade <span className={styles.inkIcon}><AnkhIcon /></span>
              </div>
              <Boxes
                states={ficha.trackers.humanity}
                label="Humanidade"
                tone="ink"
                size="sm"
                stateNames={HUMANITY_NAMES}
                onPick={edit ? (index) => edit({ type: 'humanity/cycled', id: ficha.id, index }) : undefined}
              />
            </div>
            <div className={styles.trackerBlock}>
              <div className={styles.trackerLabel}>
                Fome <span className={styles.markedIcon}><DropIcon /></span>
              </div>
              <Boxes
                states={hungerStates}
                label="Fome"
                tone="marked"
                size="sm"
                groupSize={1}
                stateNames={HUNGER_NAMES}
                onPick={edit ? (index) => edit({ type: 'hunger/picked', id: ficha.id, index }) : undefined}
              />
            </div>
          </div>
          <div className={`${styles.column} ${styles.separated}`}>
            <div className={styles.bloodLine}>
              <span>Blood Potency</span>
              <Dots
                value={ficha.blood.potency}
                max={BLOOD_POTENCY_RANGE.max}
                label="Blood Potency"
                groupSize={5}
                onPick={edit ? (index) => edit({ type: 'blood/potencyPicked', id: ficha.id, index }) : undefined}
              />
            </div>
            <BloodLine ficha={ficha} edit={edit} field="baneSeverity" label="Bane Severity" />
            <BloodNote ficha={ficha} edit={edit} field="clanBane" label="Clan Bane" />
          </div>
          <div className={styles.column}>
            <BloodLine ficha={ficha} edit={edit} field="surge" label="Blood Surge" />
            <BloodLine ficha={ficha} edit={edit} field="mendAmount" label="Mend Amount" />
            <BloodLine ficha={ficha} edit={edit} field="rouseReRoll" label="Rouse Re-Roll" />
            <BloodNote ficha={ficha} edit={edit} field="clanCompulsion" label="Compulsão de Clã" />
          </div>
        </div>
      </div>
    </div>
  );
}
