import { useMemo, useState } from 'react';
import type { VaultNote } from '../../catalog/types.ts';
import { useVaultCatalog, type LoadedVault } from './useVaultCatalog.ts';
import { VaultArticle } from './VaultArticle.tsx';
import { groupVaultNotes, vaultNeighbors, type VaultGroup } from './vaultIndex.ts';
import { vaultHash, type VaultRoute } from './vaultRoute.ts';
import { queryWords, searchVault, type VaultSearchHit } from './vaultSearch.ts';
import styles from './VaultView.module.css';

function VaultSearchResults({ query, hits, onPick }: { query: string; hits: readonly VaultSearchHit[]; onPick: () => void }) {
  return (
    <section className={styles.results} aria-live="polite">
      <h1 className={styles.resultsTitle}>
        {hits.length === 0 ? 'Nada encontrado' : `${hits.length} ${hits.length === 1 ? 'resultado' : 'resultados'}`} para “{query.trim()}”
      </h1>
      <ol className={styles.hits}>
        {hits.map((hit) => (
          <li key={`${hit.slug}/${hit.headingId ?? ''}`}>
            <a className={styles.hit} href={vaultHash(hit.slug, hit.headingId)} onClick={onPick}>
              <span className={styles.crumb}>
                {hit.noteTitle}
                {hit.sectionTitle !== '' && <span className={styles.crumbSection}> › {hit.sectionTitle}</span>}
              </span>
              <span className={styles.snippet}>
                {hit.snippet.before}
                {hit.snippet.match !== '' && <mark>{hit.snippet.match}</mark>}
                {hit.snippet.after}
              </span>
            </a>
          </li>
        ))}
      </ol>
    </section>
  );
}

/** Vault home: every group with its notes and their main sections. */
function VaultHome({ groups }: { groups: readonly VaultGroup[] }) {
  return (
    <section className={styles.home}>
      <header className={styles.homeHeader}>
        <h1 className={styles.homeTitle}>Vault</h1>
        <p className={styles.homeLead}>Regras e lore das notas do Obsidian, para consultar na mesa.</p>
      </header>
      {groups.map((group) => (
        <section key={group.name} className={styles.homeGroup}>
          <h2 className={styles.homeGroupTitle}>{group.name}</h2>
          <ul className={styles.homeNotes}>
            {group.notes.map((note) => (
              <li key={note.slug}>
                <a className={styles.homeNote} href={vaultHash(note.slug)}>
                  {note.title}
                </a>
                <p className={styles.homeSections}>{mainSections(note)}</p>
              </li>
            ))}
          </ul>
        </section>
      ))}
    </section>
  );
}

const HOME_SECTIONS = 5;

function mainSections(note: VaultNote): string {
  const outer = Math.min(...note.headings.map((heading) => heading.depth));
  const titles = note.headings.filter((heading) => heading.depth === outer).map((heading) => heading.title);
  return titles.length > HOME_SECTIONS ? `${titles.slice(0, HOME_SECTIONS).join(' · ')} · …` : titles.join(' · ');
}

function VaultLayout({ vault, route }: { vault: LoadedVault; route: VaultRoute }) {
  const { notes } = vault.catalog;
  const [query, setQuery] = useState('');
  const [indexOpen, setIndexOpen] = useState(false);
  const groups = useMemo(() => groupVaultNotes(notes), [notes]);
  const hits = useMemo(() => searchVault(notes, query), [notes, query]);
  const searching = queryWords(query).length > 0;
  const note = route.slug === null ? null : (notes.find((candidate) => candidate.slug === route.slug) ?? null);
  const { previous, next } = note === null ? { previous: null, next: null } : vaultNeighbors(notes, note.slug);

  const content = searching ? (
    <VaultSearchResults query={query} hits={hits} onPick={() => setQuery('')} />
  ) : note !== null ? (
    <VaultArticle key={note.slug} note={note} assets={vault.assets} headingId={route.headingId} previous={previous} next={next} />
  ) : route.slug !== null ? (
    <p className={styles.status}>Nota não encontrada. Ela ainda tem publicar: true e vault no frontmatter?</p>
  ) : (
    <VaultHome groups={groups} />
  );

  return (
    <div className={styles.vault}>
      <aside className={styles.index}>
        <input
          type="search"
          className={styles.search}
          aria-label="Buscar no Vault"
          placeholder="Buscar: torpor, Rouse Check…"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
        />
        <button
          type="button"
          className={styles.indexToggle}
          aria-expanded={indexOpen}
          aria-controls="vault-notes"
          onClick={() => setIndexOpen((open) => !open)}
        >
          {note?.title ?? 'Notas do Vault'} <span aria-hidden="true">{indexOpen ? '▴' : '▾'}</span>
        </button>
        <nav id="vault-notes" className={styles.notes} data-open={indexOpen} aria-label="Notas do Vault">
          <a className={styles.homeLink} href={vaultHash(null)} aria-current={route.slug === null ? 'page' : undefined} onClick={() => setIndexOpen(false)}>
            Início
          </a>
          {groups.map((group) => (
            <div key={group.name} className={styles.group}>
              <p className={styles.groupTitle}>{group.name}</p>
              <ul className={styles.groupNotes}>
                {group.notes.map((candidate) => (
                  <li key={candidate.slug}>
                    <a
                      className={styles.noteLink}
                      href={vaultHash(candidate.slug)}
                      aria-current={candidate.slug === note?.slug ? 'page' : undefined}
                      onClick={() => {
                        setIndexOpen(false);
                        setQuery('');
                        // Same URL, no hashchange: go back to the note's top by hand.
                        if (vaultHash(candidate.slug) === window.location.hash) window.scrollTo({ top: 0 });
                      }}
                    >
                      {candidate.title}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </nav>
      </aside>
      <div className={styles.content}>{content}</div>
    </div>
  );
}

/** "Vault": the published notes (rules, hunger, blood, lore), with an index and search. */
export function VaultView({ route }: { route: VaultRoute }) {
  const vault = useVaultCatalog();
  if (vault === null) return <p className={styles.status}>Carregando o Vault…</p>;
  return <VaultLayout vault={vault} route={route} />;
}
