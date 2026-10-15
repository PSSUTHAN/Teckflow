import React from 'react';
import { CheckCircle2, AlertTriangle, Info, X } from 'lucide-react';

export const ToastContainer = ({ toasts, onDismiss }) => {
  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none">
      {toasts.map((toast) => {
        const isSuccess = toast.type === 'success';
        const isError = toast.type === 'error';

        return (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-center justify-between gap-3 px-4 py-3 rounded-xl border shadow-lg text-sm transition-all duration-200 animate-in slide-in-from-bottom-2 ${
              isSuccess
                ? 'bg-white border-emerald-200 text-emerald-950'
                : isError
                ? 'bg-white border-rose-200 text-rose-950'
                : 'bg-white border-slate-200 text-slate-900'
            }`}
          >
            <div className="flex items-center gap-2.5">
              {isSuccess && <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />}
              {isError && <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />}
              {!isSuccess && !isError && <Info className="w-4 h-4 text-blue-600 shrink-0" />}
              <span className="font-medium text-xs sm:text-sm">{toast.message}</span>
            </div>

            <button
              type="button"
              onClick={() => onDismiss(toast.id)}
              className="text-slate-400 hover:text-slate-600 p-0.5 rounded-sm"
              aria-label="Dismiss toast"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        );
      })}
    </div>
  );
};

export default ToastContainer;
