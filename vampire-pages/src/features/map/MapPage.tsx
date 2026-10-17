import { PasswordForm, PasswordNotConfigured } from '../secrets/SecretsView.tsx';
import type { SecretsLock } from '../secrets/useSecretsLock.ts';
import { MapView } from './MapView.tsx';
import { useNyMap } from './useNyMap.ts';
import styles from './MapView.module.css';

function LoadedMap() {
  const state = useNyMap();
  if (state.status === 'loading') return <p className={styles.gateText}>Carregando o mapa…</p>;
  if (state.status === 'missing') {
    return (
      <p className={styles.gateText}>
        Mapa não publicado. Ponha <code>publicar: true</code> no frontmatter de "Narrador/Nova York/Mapa de Nova York.md".
      </p>
    );
  }
  return <MapView map={state.map} />;
}

/** "Mapa de NY" behind the narrator's password: the map shows what only the narrator may see. */
export function MapPage({ lock }: { lock: SecretsLock }) {
  if (lock.configured && lock.unlocked) return <LoadedMap />;
  return (
    <section className={styles.gate} aria-labelledby="ny-map-gate-title">
      <h2 id="ny-map-gate-title" className={styles.title}>
        Mapa de NY
      </h2>
      <p className={styles.lead}>Território das facções, clãs e lugares da crônica. Mostra segredos de mesa: a mesma senha dos Segredos.</p>
      {lock.configured ? <PasswordForm lock={lock} /> : <PasswordNotConfigured />}
    </section>
  );
}
