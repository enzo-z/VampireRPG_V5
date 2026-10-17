import type { CSSProperties, ReactNode, Ref } from 'react';
import { normalizeLabel } from '../../catalog/parseNote.ts';
import type { ColaBlock } from '../../catalog/types.ts';
import { highlightRolls } from '../../reference/highlightRolls.ts';
import type { PlayerCola, PlayerPower } from './playerCola.ts';
import styles from './PlayerColaPage.module.css';

/**
 * Where each block of the character's lore note goes, by title (the note follows this
 * convention, as the page 1 note does). Titles not listed here go to the right column.
 */
const LEFT_LORE = ['Facções e organizações'] as const;
const BAND_LORE = ['Nova York por distrito'] as const;

/** Vault HTML (rendered at build time with raw HTML escaped), with tests and Rouse Checks marked. */
const html = (source: string) => ({ __html: highlightRolls(source) });

/** Same match as the page 1 note: same title, or a title that starts with it, ignoring case and accents. */
function titled(titles: readonly string[], block: ColaBlock): boolean {
  const name = normalizeLabel(block.title);
  return titles.some((title) => {
    const wanted = normalizeLabel(title);
    return name === wanted || name.startsWith(`${wanted} `);
  });
}

function Block({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className={styles.block} aria-label={title}>
      <h2 className={styles.blockTitle}>{title}</h2>
      {children}
    </section>
  );
}

function Power({ power }: { power: PlayerPower }) {
  return (
    <article className={styles.power}>
      <h3 className={styles.powerName}>
        {power.name}
        {power.level !== null && <span className={styles.powerLevel}> · nível {power.level}</span>}
      </h3>
      {power.fields.length > 0 && (
        <dl className={`${styles.facts} ${styles.prose}`}>
          {power.fields.map((field) => (
            <div key={field.label} className={styles.fact}>
              <dt>{field.label}</dt>
              <dd dangerouslySetInnerHTML={html(field.html)} />
            </div>
          ))}
        </dl>
      )}
      {power.summaryHtml !== null && <div className={styles.prose} dangerouslySetInnerHTML={html(power.summaryHtml)} />}
    </article>
  );
}

/** A lore block: its intro text, then its terms as "Term: text" lines. */
function Lore({ block, columns = 1 }: { block: ColaBlock; columns?: number }) {
  return (
    <Block title={block.title}>
      {block.html.trim() !== '' && <div className={styles.prose} dangerouslySetInnerHTML={html(block.html)} />}
      <dl
        className={styles.entries}
        style={{ '--entries-columns': columns } as CSSProperties}
        data-separated={columns === 1 ? '' : undefined}
      >
        {block.entries.map((entry) => (
          <div key={entry.term} className={styles.entry}>
            <dt>{entry.term}</dt>
            <dd className={styles.prose} dangerouslySetInnerHTML={html(entry.html)} />
          </div>
        ))}
      </dl>
    </Block>
  );
}

function dots(level: number): string {
  return '●'.repeat(level);
}

/** Page 2 of the player's cheat sheet: what this character rolls, and the lore they should know. One A4 page. */
export function PlayerColaPage({ cola, ref }: { cola: PlayerCola; ref?: Ref<HTMLDivElement> }) {
  const identity = [cola.clan, cola.predatorType, cola.generation, `Blood Potency ${cola.bloodPotency}`]
    .filter((part) => part.trim() !== '')
    .join(' · ');
  const leftLore = cola.lore.filter((block) => titled(LEFT_LORE, block));
  const bandLore = cola.lore.filter((block) => titled(BAND_LORE, block));
  const rightLore = cola.lore.filter((block) => !titled(LEFT_LORE, block) && !titled(BAND_LORE, block));

  return (
    <div className={styles.page}>
      <div ref={ref} className={styles.content}>
        <header className={styles.header}>
          <div className={styles.title}>{cola.name}</div>
          <div className={styles.runningHead}>{identity}</div>
        </header>
        {(cola.ambition.trim() !== '' || cola.desire.trim() !== '') && (
          <p className={styles.goals}>
            {cola.ambition.trim() !== '' && (
              <span>
                <strong>Ambição:</strong> {cola.ambition}
              </span>
            )}
            {cola.desire.trim() !== '' && (
              <span>
                <strong>Desejo:</strong> {cola.desire}
              </span>
            )}
          </p>
        )}
        <div className={styles.columns}>
          <div className={styles.column} data-fit-label="coluna da esquerda">
            {cola.disciplines.map((discipline) => (
              <Block key={discipline.name} title={`${discipline.name} ${dots(discipline.value)}`}>
                {discipline.powers.map((power) => (
                  <Power key={power.name} power={power} />
                ))}
              </Block>
            ))}
            {cola.pools.length > 0 && (
              <Block title="Reservas fortes">
                <ul className={styles.list}>
                  {cola.pools.map((pool) => (
                    <li key={pool.skill}>
                      <strong>{pool.skill}</strong> {pool.dots}
                      {pool.specialty !== '' ? ` (${pool.specialty})` : ''}: {pool.attribute} + {pool.skill} ={' '}
                      <strong>{pool.dice} dados</strong>
                    </li>
                  ))}
                </ul>
              </Block>
            )}
            {leftLore.map((block) => (
              <Lore key={block.title} block={block} />
            ))}
          </div>
          <div className={styles.column} data-fit-label="coluna da direita">
            {rightLore.map((block) => (
              <Lore key={block.title} block={block} />
            ))}
          </div>
        </div>
        {bandLore.length > 0 && (
          <div className={styles.band} data-fit-label="faixa de baixo">
            {bandLore.map((block) => (
              <Lore key={block.title} block={block} columns={3} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
