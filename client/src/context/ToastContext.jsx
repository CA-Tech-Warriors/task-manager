import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { CheckCircleIcon, AlertIcon, CloseIcon } from '../components/Icons';

const ToastContext = createContext(() => {});

export function ToastProvider({ children }) {
  const [toast, setToast] = useState(null);

  const showToast = useCallback((message, tone = 'success') => {
    setToast({ message, tone, id: Date.now() });
  }, []);

  useEffect(() => {
    if (!toast) return undefined;
    const timer = setTimeout(() => setToast(null), 4500);
    return () => clearTimeout(timer);
  }, [toast]);

  return (
    <ToastContext.Provider value={showToast}>
      {children}
      <div className="toast-region" role="status" aria-live="polite">
        {toast && (
          <div key={toast.id} className={`toast toast--${toast.tone}`}>
            {toast.tone === 'error' ? <AlertIcon /> : <CheckCircleIcon />}
            <span>{toast.message}</span>
            <button type="button" className="icon-button" onClick={() => setToast(null)} aria-label="Dismiss message">
              <CloseIcon />
            </button>
          </div>
        )}
      </div>
    </ToastContext.Provider>
  );
}

export const useToast = () => useContext(ToastContext);
