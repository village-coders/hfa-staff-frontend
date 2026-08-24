import React, { useEffect } from "react";
import { CheckCircle2, AlertCircle, Info, X } from "lucide-react";

export default function Toast({ toast, onClose }) {
  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => {
      onClose();
    }, 4000);
    return () => clearTimeout(timer);
  }, [toast, onClose]);

  if (!toast) return null;

  const typeStyles = {
    success: "bg-slate-900/95 border-teal-500 text-white shadow-teal-900/20",
    error: "bg-slate-900/95 border-rose-500 text-white shadow-rose-900/20",
    info: "bg-slate-900/95 border-amber-500 text-white shadow-amber-900/20",
  };

  const icons = {
    success: <CheckCircle2 size={18} className="text-teal-400 flex-shrink-0" />,
    error: <AlertCircle size={18} className="text-rose-400 flex-shrink-0" />,
    info: <Info size={18} className="text-amber-400 flex-shrink-0" />,
  };

  return (
    <div className="fixed top-5 right-5 z-[9999] max-w-sm w-full animate-slide-down">
      <div
        className={`flex items-center justify-between gap-3 px-4 py-3.5 rounded-2xl border shadow-2xl backdrop-blur-md transition-all ${
          typeStyles[toast.type] || typeStyles.info
        }`}
      >
        <div className="flex items-center gap-3 min-w-0">
          {icons[toast.type] || icons.info}
          <p className="text-xs font-semibold leading-snug">{toast.message}</p>
        </div>
        <button
          onClick={onClose}
          className="p-1 rounded-lg text-white/60 hover:text-white hover:bg-white/10 transition-colors flex-shrink-0 cursor-pointer"
        >
          <X size={14} />
        </button>
      </div>
    </div>
  );
}
