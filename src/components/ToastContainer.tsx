import React from 'react';
import { useApp } from '../context/AppContext';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useApp();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 flex flex-col items-center gap-2 max-w-sm w-full px-4 pointer-events-none">
      {toasts.map((toast) => {
        const isSuccess = toast.type === 'success';
        const isError = toast.type === 'error';

        return (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-center justify-between gap-3 px-4 py-3 rounded-xl shadow-lg border text-sm font-medium transition-all duration-200 animate-in fade-in slide-in-from-top-4 w-full ${
              isSuccess
                ? 'bg-[#176B55] text-white border-[#176B55]/20 shadow-[#176B55]/20'
                : isError
                ? 'bg-rose-600 text-white border-rose-700 shadow-rose-900/20'
                : 'bg-slate-900 text-white border-slate-800'
            }`}
          >
            <div className="flex items-center gap-2.5 min-w-0">
              {isSuccess && <CheckCircle2 className="w-5 h-5 shrink-0 text-emerald-200" />}
              {isError && <AlertCircle className="w-5 h-5 shrink-0 text-rose-200" />}
              {!isSuccess && !isError && <Info className="w-5 h-5 shrink-0 text-blue-200" />}
              <span className="truncate">{toast.message}</span>
            </div>
            <button
              onClick={() => removeToast(toast.id)}
              className="p-1 hover:bg-white/10 rounded-lg shrink-0 transition-colors"
              aria-label="Fermer"
            >
              <X className="w-4 h-4 text-white/80" />
            </button>
          </div>
        );
      })}
    </div>
  );
};
