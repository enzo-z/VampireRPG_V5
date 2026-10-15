import type { Beliefs, Profile } from '../../domain/character.ts';
import { SectionTitle } from '../../ui/SectionTitle.tsx';
import { TextField } from '../../ui/TextField.tsx';
import { PhotoSlot } from './PhotoSlot.tsx';
import { useSheet } from './SheetContext.tsx';
import styles from './ProfileSection.module.css';

type ProfileTextField = Exclude<keyof Profile, 'photo' | 'description'>;

const PROFILE_FIELDS: readonly { field: ProfileTextField; label: string }[] = [
  { field: 'concept', label: 'Concept' },
  { field: 'sire', label: 'Sire' },
  { field: 'embraced', label: 'Embraced' },
  { field: 'birthday', label: 'Birthday' },
  { field: 'age', label: 'Age' },
  { field: 'apparentAge', label: 'Apparent Age' },
];

const BELIEFS: readonly { field: keyof Beliefs; label: string }[] = [
  { field: 'chronicleTenets', label: 'Chronicle Tenets' },
  { field: 'convictions', label: 'Convictions' },
  { field: 'touchstones', label: 'Touchstones' },
];

/** Page II: portrait, profile fields, description and notes. */
export function ProfileSection() {
  const { ficha, readOnly, edit } = useSheet();
  const change = (field: keyof Profile) => (value: string) => edit({ type: 'profile/changed', id: ficha.id, field, value });

  return (
    <section aria-labelledby="profile-title">
      <SectionTitle id="profile-title">Profile</SectionTitle>
      <div className={styles.top}>
        <PhotoSlot />
        <div className={styles.fields}>
          {PROFILE_FIELDS.map(({ field, label }) => (
            <TextField
              key={field}
              label={label}
              value={ficha.profile[field]}
              onChange={change(field)}
              readOnly={readOnly}
              className={field === 'concept' ? styles.wide : undefined}
            />
          ))}
        </div>
      </div>
      <div className={styles.areas}>
        <TextField label="Description & Features" value={ficha.profile.description} onChange={change('description')} readOnly={readOnly} multiline rows={5} />
        <TextField
          label="Notas"
          value={ficha.notes}
          onChange={(value) => edit({ type: 'notes/changed', id: ficha.id, value })}
          readOnly={readOnly}
          multiline
          rows={5}
        />
      </div>
    </section>
  );
}

/** Page II: Chronicle Tenets, Convictions and Touchstones. */
export function BeliefsSection() {
  const { ficha, readOnly, edit } = useSheet();
  return (
    <section aria-labelledby="beliefs-title">
      <SectionTitle id="beliefs-title">Beliefs</SectionTitle>
      <div className={styles.beliefs}>
        {BELIEFS.map(({ field, label }) => (
          <TextField
            key={field}
            label={label}
            value={ficha.beliefs[field]}
            onChange={(value) => edit({ type: 'beliefs/changed', id: ficha.id, field, value })}
            readOnly={readOnly}
            multiline
            rows={4}
          />
        ))}
      </div>
    </section>
  );
}
