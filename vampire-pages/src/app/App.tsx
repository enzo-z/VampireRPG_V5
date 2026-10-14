import styles from './App.module.css';

// Temporary token showcase; replaced by the sheet (task 3).
const SAMPLE_DOTS = 5;
const SAMPLE_VALUE = 3;

export function App() {
  return (
    <main className={styles.page}>
      <header className={styles.header}>
        <h1 className={styles.title}>Vampire Pages</h1>
        <p className={styles.runningHead}>Amostra de tokens · tarefa 1</p>
      </header>

      <h2 className={styles.sectionTitle}>Attributes</h2>
      <div className={styles.traitRow}>
        <span>Strength</span>
        <span className={styles.dots} role="img" aria-label={`Strength ${SAMPLE_VALUE} de ${SAMPLE_DOTS}`}>
          {Array.from({ length: SAMPLE_DOTS }, (_, index) => (
            <span
              key={index}
              aria-hidden="true"
              className={index < SAMPLE_VALUE ? `${styles.dot} ${styles.dotFilled}` : styles.dot}
            />
          ))}
        </span>
      </div>
      <div className={`${styles.traitRow} ${styles.traitRowSelected}`}>
        <span>Manipulation</span>
        <span className={styles.label}>selecionado</span>
      </div>

      <h2 className={styles.sectionTitle}>Tipografia</h2>
      <p className={styles.body}>
        Cormorant Garamond 500 no corpo do texto, a 18 px. <em>Itálico para subtítulos de grupo.</em>
      </p>
      <p className={styles.label}>Cabin · rótulos de interface e números 0123456789</p>
      <p className={styles.accentText}>Texto em destaque no crimson do livro.</p>
    </main>
  );
}
