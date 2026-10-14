import { referenceFor } from '../../reference/lookup.ts';
import { Dots } from '../../ui/Dots.tsx';
import { IconButton } from '../../ui/IconButton.tsx';
import { CloseIcon } from '../../ui/icons.tsx';
import { useSheet } from './SheetContext.tsx';
import styles from './ReferencePanel.module.css';

const HINT = 'Clique num atributo, perícia, disciplina, poder, campo de identidade ou trilha para ver a referência aqui. Esc fecha.';

export function ReferencePanel() {
  const { ficha, selection, select } = useSheet();
  const entry = selection === null ? null : referenceFor(selection, ficha);

  return (
    <aside className={styles.panel} aria-label="Referência">
      {entry === null ? (
        <p className={styles.hint}>{HINT}</p>
      ) : (
        <>
          <div className={styles.top}>
            <p className={styles.kicker}>{entry.kicker}</p>
            <IconButton label="Fechar referência" icon={<CloseIcon />} onClick={() => select(null)} />
          </div>
          <h2 className={styles.title}>{entry.title}</h2>
          {(entry.dots !== null || entry.source !== null) && (
            <div className={styles.meta}>
              {entry.dots !== null && <Dots value={entry.dots.value} max={entry.dots.max} label={entry.title} size="md" groupSize={5} />}
              {entry.source !== null && <span className={styles.source}>{entry.source}</span>}
            </div>
          )}
          {entry.paragraphs.map((paragraph, index) => (
            <p key={index} className={styles.body}>
              {paragraph}
            </p>
          ))}
          {entry.facts.length > 0 && (
            <dl className={styles.facts}>
              {entry.facts.map((fact) => (
                <div key={fact.label} className={styles.fact}>
                  <dt>{fact.label}</dt>
                  <dd>{fact.value}</dd>
                </div>
              ))}
            </dl>
          )}
          {entry.levels !== null && (
            <>
              <h3 className={styles.levelsTitle}>Níveis</h3>
              <ol className={styles.levels}>
                {entry.levels.map((level, index) => (
                  <li
                    key={index}
                    className={`${styles.level} ${index + 1 === entry.currentLevel ? styles.currentLevel : ''}`}
                    aria-current={index + 1 === entry.currentLevel ? 'true' : undefined}
                  >
                    <span className={styles.levelNumber}>{index + 1}</span>
                    <span>{level}</span>
                  </li>
                ))}
              </ol>
            </>
          )}
        </>
      )}
    </aside>
  );
}
