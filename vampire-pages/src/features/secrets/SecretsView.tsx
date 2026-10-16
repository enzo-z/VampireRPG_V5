import { useState, type FormEvent } from 'react';
import { useSecretsCatalog } from './useSecretsCatalog.ts';
import type { SecretsLock } from './useSecretsLock.ts';
import styles from './SecretsView.module.css';

function PasswordForm({ lock }: { lock: SecretsLock }) {
  const [password, setPassword] = useState('');
  const [wrong, setWrong] = useState(false);

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const ok = lock.unlock(password);
    setWrong(!ok);
    if (!ok) setPassword('');
  };

  return (
    <form className={styles.form} onSubmit={submit}>
      <label className={styles.label} htmlFor="secrets-password">
        Senha
      </label>
      <div className={styles.row}>
        <input
          id="secrets-password"
          className={styles.input}
          type="password"
          autoComplete="off"
          autoFocus
          value={password}
          aria-invalid={wrong}
          aria-describedby={wrong ? 'secrets-wrong' : undefined}
          onChange={(event) => setPassword(event.target.value)}
        />
        <button type="submit" className={styles.primary}>
          Entrar
        </button>
      </div>
      {wrong && (
        <p id="secrets-wrong" className={styles.error} role="alert">
          Senha incorreta.
        </p>
      )}
    </form>
  );
}

function DocumentList({ onOpen }: { onOpen: (slug: string) => void }) {
  const catalog = useSecretsCatalog();
  if (catalog === null) return <p className={styles.muted}>Carregando…</p>;
  if (catalog.documents.length === 0) {
    return (
      <p className={styles.muted}>
        Nenhum documento publicado. Ponha <code>publicar: true</code> no frontmatter de um README em "Narrador/Relacionamentos/Para o Jogador".
      </p>
    );
  }
  return (
    <ul className={styles.list} aria-label="Documentos dos jogadores">
      {catalog.documents.map((document) => (
        <li key={document.slug}>
          <button type="button" className={styles.document} onClick={() => onOpen(document.slug)}>
            <span className={styles.documentName}>{document.character}</span>
            <span className={styles.documentSub}>O que o personagem sabe · PDF para o jogador</span>
          </button>
        </li>
      ))}
    </ul>
  );
}

/** "Segredos": behind a front-end password, the documents each player gets about their character. */
export function SecretsView({ lock, onOpen }: { lock: SecretsLock; onOpen: (slug: string) => void }) {
  return (
    <section className={styles.view} aria-labelledby="secrets-title">
      <header className={styles.header}>
        <h2 id="secrets-title" className={styles.title}>
          Segredos
        </h2>
        {lock.unlocked && (
          <button type="button" className={styles.action} onClick={lock.lock}>
            Trancar
          </button>
        )}
      </header>
      <p className={styles.lead}>O que cada personagem sabe, para imprimir e entregar só ao seu jogador.</p>
      {!lock.configured ? (
        <p className={styles.muted}>
          Nenhuma senha definida. Crie o arquivo <code>vampire-pages/.env.local</code> com a linha <code>SECRETS_PASSWORD=sua senha</code> e
          reinicie o app (<code>npm run dev</code>).
        </p>
      ) : lock.unlocked ? (
        <DocumentList onOpen={onOpen} />
      ) : (
        <PasswordForm lock={lock} />
      )}
    </section>
  );
}
