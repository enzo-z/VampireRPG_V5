import type { ButtonHTMLAttributes, ReactNode } from 'react';
import styles from './IconButton.module.css';

interface IconButtonProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'aria-label' | 'children'> {
  label: string;
  icon: ReactNode;
  active?: boolean;
}

export function IconButton({ label, icon, active = false, className, ...rest }: IconButtonProps) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      className={[styles.button, active ? styles.active : '', className ?? ''].join(' ')}
      {...rest}
    >
      {icon}
    </button>
  );
}
