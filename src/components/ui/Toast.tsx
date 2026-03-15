import { useEffect } from 'react';
import { CheckCircle, AlertCircle, Info, X } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'info';

export interface ToastMessage {
  id: number;
  type: ToastType;
  title: string;
  body?: string;
}

const icons = {
  success: <CheckCircle size={14} className="text-emerald-400 flex-shrink-0 mt-px" />,
  error:   <AlertCircle size={14} className="text-red-400 flex-shrink-0 mt-px" />,
  info:    <Info        size={14} className="text-indigo-400 flex-shrink-0 mt-px" />,
};

const borders = {
  success: 'border-emerald-500/30',
  error:   'border-red-500/30',
  info:    'border-indigo-500/30',
};

function Toast({ toast, onDismiss }: { toast: ToastMessage; onDismiss: (id: number) => void }) {
  useEffect(() => {
    const t = setTimeout(() => onDismiss(toast.id), 3500);
    return () => clearTimeout(t);
  }, [toast.id, onDismiss]);

  return (
    <div
      className={`flex items-start gap-2.5 bg-slate-900 border ${borders[toast.type]} rounded-lg shadow-xl px-3.5 py-3 min-w-[260px] max-w-[340px] animate-in slide-in-from-right-4 fade-in duration-200`}
    >
      {icons[toast.type]}
      <div className="flex-1 min-w-0">
        <p className="text-[12px] font-semibold text-slate-200 leading-snug">{toast.title}</p>
        {toast.body && (
          <p className="text-[11px] text-slate-500 mt-0.5 leading-snug">{toast.body}</p>
        )}
      </div>
      <button
        onClick={() => onDismiss(toast.id)}
        className="text-slate-600 hover:text-slate-400 transition-colors flex-shrink-0"
      >
        <X size={12} />
      </button>
    </div>
  );
}

export default function ToastContainer({
  toasts,
  onDismiss,
}: {
  toasts: ToastMessage[];
  onDismiss: (id: number) => void;
}) {
  if (toasts.length === 0) return null;
  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2">
      {toasts.map((t) => (
        <Toast key={t.id} toast={t} onDismiss={onDismiss} />
      ))}
    </div>
  );
}
