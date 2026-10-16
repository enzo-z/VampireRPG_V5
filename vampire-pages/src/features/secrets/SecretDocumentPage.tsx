import type { CSSProperties } from 'react';
import type { SecretDocument } from '../../catalog/types.ts';
import { PAGE_MARGIN_MM } from '../print/printLayout.ts';
import styles from './SecretDocumentPage.module.css';

/** The sheet is as wide as the A4 printable area, so the screen shows the printed line length. */
const PAGE_STYLE = { '--secret-page-width': `${210 - 2 * PAGE_MARGIN_MM}mm` } as CSSProperties;

/** "Khalid Hassan Yusuf: o que você sabe" → name + "O que você sabe". */
export function splitTitle(title: string, character: string): { name: string; subtitle: string } {
  const [name = '', ...rest] = title.split(': ');
  const subtitle = rest.join(': ').trim();
  if (subtitle === '') return { name: title, subtitle: '' };
  return { name: name.trim() || character, subtitle: subtitle.charAt(0).toLocaleUpperCase('pt-BR') + subtitle.slice(1) };
}

/** One player's secret document, flowing over as many A4 pages as it needs. */
export function SecretDocumentPage({ document }: { document: SecretDocument }) {
  const { name, subtitle } = splitTitle(document.title, document.character);
  return (
    <article className={styles.page} style={PAGE_STYLE} aria-label={document.title}>
      <header className={styles.header}>
        <p className={styles.runningHead}>Vampire: The Masquerade · confidencial, só para o jogador</p>
        <h1 className={styles.title}>{name}</h1>
        {subtitle !== '' && <p className={styles.subtitle}>{subtitle}</p>}
      </header>
      {document.introHtml !== '' && <div className={`${styles.prose} ${styles.intro}`} dangerouslySetInnerHTML={{ __html: document.introHtml }} />}
      {document.sections.map((section) => (
        <section key={section.title} className={styles.section} aria-label={section.title}>
          <h2 className={styles.sectionTitle}>{section.title}</h2>
          <div className={styles.prose} dangerouslySetInnerHTML={{ __html: section.html }} />
        </section>
      ))}
    </article>
  );
}
