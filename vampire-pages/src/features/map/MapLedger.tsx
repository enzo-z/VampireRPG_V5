import type { NyLedgerColumn, NyLedgerRow } from '../../catalog/types.ts';
import styles from './MapView.module.css';

const COLUMNS: readonly { id: NyLedgerColumn; title: string }[] = [
  { id: 'manhattan', title: 'Manhattan' },
  { id: 'brooklyn', title: 'Brooklyn' },
  { id: 'queens', title: 'Queens' },
  { id: 'bronx', title: 'Bronx' },
  { id: 'staten', title: 'Staten Is.' },
  { id: 'nj', title: 'N. Jersey' },
  { id: 'city', title: 'Cidade' },
];

/** "Clãs por distrito": ● base or domain of the clan, ○ a known figure lives or acts there. */
export function MapLedger({ rows }: { rows: readonly NyLedgerRow[] }) {
  return (
    <section className={styles.ledger} aria-labelledby="ny-ledger-title">
      <h3 id="ny-ledger-title" className={styles.sectionTitle}>
        Clãs por distrito
      </h3>
      <p className={styles.ledgerKey}>
        <span>
          <i className={`${styles.dot} ${styles.dotBase}`} /> Sede, domínio ou base do clã
        </span>
        <span>
          <i className={`${styles.dot} ${styles.dotPresence}`} /> Figura conhecida mora ou age ali
        </span>
        <span>"Cidade" = está em NY, bairro não informado</span>
      </p>
      <div className={styles.tableScroll}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th scope="col">Clã</th>
              {COLUMNS.map((column) => (
                <th key={column.id} scope="col">
                  {column.title}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.clan}>
                <th scope="row">{row.clan}</th>
                {COLUMNS.map((column) => (
                  <td key={column.id}>
                    {(row.cells[column.id] ?? []).map((mark) => (
                      <span key={mark.html} className={styles.mark}>
                        <i
                          className={`${styles.dot} ${mark.kind === 'base' ? styles.dotBase : styles.dotPresence}`}
                          aria-label={mark.kind === 'base' ? 'base' : 'presente'}
                        />
                        <span dangerouslySetInnerHTML={{ __html: mark.html }} />
                      </span>
                    ))}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
