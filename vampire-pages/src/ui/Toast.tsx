import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import styles from './Toast.module.css';

const TOAST_DURATION_MS = 6000;

/** Optional button in the toast, e.g. "Desfazer". */
export interface ToastAction {
  label: string;
  onSelect: () => void;
}

interface ToastMessage {
  id: number;
  text: string;
  action: ToastAction | null;
}

interface ToastContextValue {
  notify: (text: string, action?: ToastAction) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [message, setMessage] = useState<ToastMessage | null>(null);

  const notify = useCallback((text: string, action?: ToastAction) => {
    setMessage((current) => ({ id: (current?.id ?? 0) + 1, text, action: action ?? null }));
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
            {message.action !== null && (
              <button
                type="button"
                className={styles.action}
                onClick={() => {
                  message.action?.onSelect();
                  setMessage(null);
                }}
              >
                {message.action.label}
              </button>
            )}
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
