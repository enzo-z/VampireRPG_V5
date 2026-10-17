import { useCallback, useEffect, useMemo, type MouseEvent } from 'react';
import type { VaultHeading, VaultNote } from '../../catalog/types.ts';
import { resolveVaultAssets } from './vaultAssets.ts';
import { vaultToc } from './vaultIndex.ts';
import { vaultHash } from './vaultRoute.ts';
import styles from './VaultArticle.module.css';

interface VaultArticleProps {
  note: VaultNote;
  assets: readonly string[];
  /** Heading to scroll to, or null for the top. */
  headingId: string | null;
  previous: VaultNote | null;
  next: VaultNote | null;
}

function TocList({ slug, headings }: { slug: string; headings: readonly VaultHeading[] }) {
  const outer = Math.min(...headings.map((heading) => heading.depth));
  return (
    <ol className={styles.tocList}>
      {headings.map((heading) => (
        <li key={heading.id} className={heading.depth === outer ? styles.tocOuter : styles.tocInner}>
          <a href={vaultHash(slug, heading.id)}>{heading.title}</a>
        </li>
      ))}
    </ol>
  );
}

/** One Vault note: banner, title, its table of contents and the rendered markdown. */
export function VaultArticle({ note, assets, headingId, previous, next }: VaultArticleProps) {
  const html = useMemo(() => resolveVaultAssets(note.html, assets), [note.html, assets]);
  const toc = useMemo(() => vaultToc(note), [note]);
  const banner = note.banner === null ? undefined : assets[note.banner];

  const scrollToRoute = useCallback(() => {
    const target = headingId === null ? null : document.getElementById(headingId);
    if (target === null) window.scrollTo({ top: 0 });
    else target.scrollIntoView({ block: 'start' });
  }, [headingId]);

  useEffect(scrollToRoute, [note.slug, scrollToRoute]);

  // A link to where the URL already points changes nothing in the hash; scroll anyway.
  const onClick = (event: MouseEvent<HTMLElement>) => {
    const link = event.target instanceof Element ? event.target.closest('a') : null;
    if (link !== null && link.getAttribute('href') === window.location.hash) {
      event.preventDefault();
      scrollToRoute();
    }
  };

  return (
    <article className={styles.article} onClick={onClick}>
      {banner !== undefined && <img className={styles.banner} src={banner} alt="" />}
      <header className={styles.header}>
        <p className={styles.kicker}>{note.group}</p>
        <h1 className={styles.title}>{note.title}</h1>
      </header>

      <div className={styles.layout}>
        <div className={styles.main}>
          {toc.length > 1 && (
            <details className={styles.tocDetails}>
              <summary className={styles.tocSummary}>Nesta nota</summary>
              <TocList slug={note.slug} headings={toc} />
            </details>
          )}
          <div className={styles.body} dangerouslySetInnerHTML={{ __html: html }} />
        </div>
        {toc.length > 1 && (
          <nav className={styles.tocAside} aria-label="Nesta nota">
            <p className={styles.tocTitle}>Nesta nota</p>
            <TocList slug={note.slug} headings={toc} />
          </nav>
        )}
      </div>

      {(previous !== null || next !== null) && (
        <nav className={styles.pager} aria-label="Outras notas">
          {previous !== null && (
            <a className={styles.pagerLink} href={vaultHash(previous.slug)}>
              <span className={styles.pagerLabel}>← Anterior</span>
              {previous.title}
            </a>
          )}
          {next !== null && (
            <a className={`${styles.pagerLink} ${styles.pagerNext}`} href={vaultHash(next.slug)}>
              <span className={styles.pagerLabel}>Próxima →</span>
              {next.title}
            </a>
          )}
        </nav>
      )}
    </article>
  );
}
