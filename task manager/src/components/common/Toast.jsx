import React from 'react';
import { useNotifications } from '../../context/NotificationContext';
import { CheckCircle2, AlertCircle, Info, AlertTriangle, X } from 'lucide-react';

export const ToastContainer = () => {
  const { toasts, removeToast } = useNotifications();

  if (toasts.length === 0) return null;

  const getIcon = (type) => {
    switch (type) {
      case 'success':
        return <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />;
      case 'error':
        return <AlertCircle className="w-5 h-5 text-rose-500 shrink-0" />;
      case 'warning':
        return <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0" />;
      case 'info':
      default:
        return <Info className="w-5 h-5 text-indigo-500 shrink-0" />;
    }
  };

  const getBorderColor = (type) => {
    switch (type) {
      case 'success':
        return 'border-emerald-200 dark:border-emerald-800/60 bg-white/95 dark:bg-slate-900/95';
      case 'error':
        return 'border-rose-200 dark:border-rose-800/60 bg-white/95 dark:bg-slate-900/95';
      case 'warning':
        return 'border-amber-200 dark:border-amber-800/60 bg-white/95 dark:bg-slate-900/95';
      case 'info':
      default:
        return 'border-indigo-200 dark:border-indigo-800/60 bg-white/95 dark:bg-slate-900/95';
    }
  };

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2.5 max-w-sm w-full pointer-events-none px-4 sm:px-0">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`pointer-events-auto flex items-start gap-3 p-3.5 rounded-xl border shadow-xl shadow-slate-950/10 backdrop-blur-md transition-all duration-300 animate-fade-in ${getBorderColor(
            toast.type
          )}`}
        >
          {getIcon(toast.type)}
          <div className="flex-1 text-sm font-medium text-slate-800 dark:text-slate-100 leading-snug">
            {toast.message}
          </div>
          <button
            onClick={() => removeToast(toast.id)}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors p-0.5 rounded-md"
            aria-label="Dismiss notification"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ))}
    </div>
  );
};

