import { D10, type DieColor } from './D10.tsx';
import styles from './DicePanel.module.css';

interface Band {
  values: readonly number[];
  label: string;
  /** Highlighted bands (10s, Hunger 1 and 10) get the rubric style. */
  strong?: boolean;
}

const BLACK_BANDS: readonly Band[] = [
  { values: [1, 2, 3, 4, 5], label: 'falha' },
  { values: [6, 7, 8, 9], label: 'sucesso' },
  { values: [10], label: 'sucesso · par = crítico', strong: true },
];

const RED_BANDS: readonly Band[] = [
  { values: [1], label: 'perigo: Bestial Failure', strong: true },
  { values: [2, 3, 4, 5], label: 'falha' },
  { values: [6, 7, 8, 9], label: 'sucesso' },
  { values: [10], label: 'perigo: Messy Critical', strong: true },
];

type Roll = readonly [value: number, color: DieColor][];

const EXAMPLES: readonly { title: string; roll: Roll; result: string }[] = [
  { title: 'Crítico', roll: [[10, 'black'], [10, 'black'], [7, 'black'], [3, 'black']], result: '4 (o par) + 1 = 5 sucessos' },
  { title: 'Messy Critical', roll: [[10, 'black'], [10, 'red'], [6, 'black']], result: 'passou; um 10 é vermelho' },
  { title: 'Bestial Failure', roll: [[3, 'black'], [4, 'black'], [1, 'red']], result: 'falhou; há um 1 vermelho' },
];

function Ruler({ title, color, bands }: { title: string; color: DieColor; bands: readonly Band[] }) {
  return (
    <div className={styles.ruler}>
      <span className={styles.rulerTitle}>{title}</span>
      <div className={styles.bands}>
        {bands.map((band) => (
          <div key={band.label} className={`${styles.band} ${band.strong ? styles.strong : ''}`}>
            <div className={styles.dice}>
              {band.values.map((value) => (
                <D10 key={value} value={value} color={color} />
              ))}
            </div>
            <span className={styles.bandLabel}>{band.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/** How to read the dice: black and red rulers, plus three example rolls. */
export function DicePanel() {
  return (
    <div className={styles.panel}>
      <Ruler title="Dado preto (comum)" color="black" bands={BLACK_BANDS} />
      <Ruler title="Dado vermelho (Fome)" color="red" bands={RED_BANDS} />
      <div className={styles.examples}>
        {EXAMPLES.map((example) => (
          <div key={example.title} className={styles.example}>
            <span className={styles.exampleTitle}>{example.title}</span>
            <div className={styles.dice}>
              {example.roll.map(([value, color], index) => (
                <D10 key={index} value={value} color={color} />
              ))}
            </div>
            <span className={styles.exampleResult}>{example.result}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
