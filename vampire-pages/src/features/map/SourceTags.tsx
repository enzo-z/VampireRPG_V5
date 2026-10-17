import type { NySourceKey } from '../../catalog/types.ts';
import styles from './MapView.module.css';

const SOURCE_LABELS: Readonly<Record<NySourceKey, string>> = {
  jogos: 'jogos V5',
  livro: 'livro V5',
  notas: 'notas do Narrador',
  sug: 'sugestão',
  ant: 'edição anterior',
};

/** Where a fact comes from; a suggestion stands out from the canon. */
export function SourceTags({ sources }: { sources: readonly NySourceKey[] }) {
  if (sources.length === 0) return null;
  return (
    <>
      {sources.map((source) => (
        <span key={source} className={`${styles.source} ${source === 'sug' ? styles.sourceSuggestion : ''}`}>
          {SOURCE_LABELS[source]}
        </span>
      ))}
    </>
  );
}
