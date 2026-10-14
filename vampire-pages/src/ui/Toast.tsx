import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import styles from './Toast.module.css';

const TOAST_DURATION_MS = 6000;

interface ToastMessage {
  id: number;
  text: string;
}

interface ToastContextValue {
  notify: (text: string) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [message, setMessage] = useState<ToastMessage | null>(null);

  const notify = useCallback((text: string) => {
    setMessage((current) => ({ id: (current?.id ?? 0) + 1, text }));
  }, []);

  useEffect(() => {
    if (message === null) return undefined;
    const timer = window.setTimeout(() => setMessage(null), TOAST_DURATION_MS);
    return () => window.clearTimeout(timer);
  }, [message]);

  const value = useMemo(() => ({ notify }), [notify]);

  return (
    <ToastContext value={value}>
      {children}
      <div className={styles.region} role="status" aria-live="polite">
        {message && (
          <div key={message.id} className={styles.toast}>
            <span className={styles.text}>{message.text}</span>
            <button type="button" className={styles.close} onClick={() => setMessage(null)} aria-label="Fechar aviso">
              ×
            </button>
          </div>
        )}
      </div>
    </ToastContext>
  );
}

export function useToast(): ToastContextValue {
  const context = useContext(ToastContext);
  if (context === null) throw new Error('useToast must be used inside <ToastProvider>');
  return context;
}
