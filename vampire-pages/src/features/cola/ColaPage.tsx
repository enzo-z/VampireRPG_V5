import type { CSSProperties, ReactNode, Ref } from 'react';
import { colaBlock } from '../../catalog/cola.ts';
import type { ColaBlock, ColaCatalog } from '../../catalog/types.ts';
import { highlightRolls } from '../../reference/highlightRolls.ts';
import { DicePanel } from './DicePanel.tsx';
import styles from './ColaPage.module.css';

/** Blocks of the note placed in each column, by title. */
const LEFT = ['Como rolar', 'Lendo os dados', 'Fome'] as const;
const RIGHT = ['Rouse Check', 'Willpower', 'Blood Surge', 'Curar (Mending)', 'Humanidade'] as const;
/** Illustrations drawn in code, shown between a block's title and its text. */
const FIGURES: Readonly<Record<string, ReactNode>> = { 'Lendo os dados': <DicePanel /> };
/** Glossaries at the bottom, with their number of text columns. */
const GLOSSARIES: readonly [title: string, columns: number][] = [
  ['Termos', 3],
  ['Clãs', 3],
];

/** Vault HTML (rendered at build time with raw HTML escaped), with tests and Rouse Checks marked. */
const html = (source: string) => ({ __html: highlightRolls(source) });

function Block({ block, figure }: { block: ColaBlock; figure?: ReactNode }) {
  return (
    <section className={styles.block} aria-label={block.title}>
      <h2 className={styles.blockTitle}>{block.title}</h2>
      {figure}
      <div className={styles.prose} dangerouslySetInnerHTML={html(block.html)} />
    </section>
  );
}

function Glossary({ block, columns }: { block: ColaBlock; columns: number }) {
  return (
    <section
      className={styles.glossary}
      aria-label={block.title}
      data-fit-label={block.title}
      style={{ '--glossary-columns': columns } as CSSProperties}
    >
      <h2 className={styles.sectionTitle}>{block.title}</h2>
      {block.html.trim() !== '' && <div className={`${styles.prose} ${styles.intro}`} dangerouslySetInnerHTML={html(block.html)} />}
      <dl className={styles.entries}>
        {block.entries.map((entry) => (
          <div key={entry.term} className={styles.entry}>
            <dt>{entry.term}</dt>
            <dd className={styles.prose} dangerouslySetInnerHTML={html(entry.html)} />
          </div>
        ))}
      </dl>
    </section>
  );
}

function column(cola: ColaCatalog, titles: readonly string[]) {
  return titles.flatMap((title) => {
    const block = colaBlock(cola, title);
    return block === null ? [] : [<Block key={title} block={block} figure={FIGURES[title]} />];
  });
}

/** Page 1 of the player's cheat sheet: the same for every player. One A4 page. */
export function ColaPage({ cola, ref }: { cola: ColaCatalog; ref?: Ref<HTMLDivElement> }) {
  return (
    <div className={styles.page}>
      <div ref={ref} className={styles.content}>
        <header className={styles.header}>
          <div className={styles.title}>Cola do Jogador</div>
          <div className={styles.runningHead}>Vampire: The Masquerade · como jogar</div>
        </header>
        <div className={styles.columns}>
          <div className={styles.column} data-fit-label="coluna da esquerda">
            {column(cola, LEFT)}
          </div>
          <div className={styles.column} data-fit-label="coluna da direita">
            {column(cola, RIGHT)}
          </div>
        </div>
        {GLOSSARIES.map(([title, columns]) => {
          const block = colaBlock(cola, title);
          return block === null ? null : <Glossary key={title} block={block} columns={columns} />;
        })}
      </div>
    </div>
  );
}
