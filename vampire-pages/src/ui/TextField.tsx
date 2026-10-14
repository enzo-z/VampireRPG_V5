import { useId } from 'react';
import styles from './TextField.module.css';

interface TextFieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  readOnly: boolean;
  multiline?: boolean;
  rows?: number;
  onFocus?: () => void;
  className?: string;
}

/** Labeled text input on a dotted leader line, or a dotted box when multiline. */
export function TextField({ label, value, onChange, readOnly, multiline = false, rows = 3, onFocus, className }: TextFieldProps) {
  const id = useId();
  return (
    <div className={`${styles.field} ${multiline ? styles.stacked : ''} ${className ?? ''}`}>
      <label htmlFor={id} className={multiline ? styles.labelItalic : styles.label}>
        {label}
      </label>
      {multiline ? (
        <textarea
          id={id}
          className={styles.area}
          value={value}
          rows={rows}
          readOnly={readOnly}
          onChange={(event) => onChange(event.target.value)}
          onFocus={onFocus}
        />
      ) : (
        <input
          id={id}
          type="text"
          className={styles.input}
          value={value}
          readOnly={readOnly}
          onChange={(event) => onChange(event.target.value)}
          onFocus={onFocus}
        />
      )}
    </div>
  );
}
